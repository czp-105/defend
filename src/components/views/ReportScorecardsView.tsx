import React, { useState } from 'react';
import {
  PlatformScorecard,
  ScenarioScorecard,
  SignOffRecord,
  SystemScorecard,
  UserRole,
} from '../../types/cidtp';
import {
  FileText,
  Award,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  History,
  ShieldCheck,
  Printer,
  FileCheck,
} from 'lucide-react';

interface ReportScorecardsViewProps {
  activityCode: string;
  scenarioScorecard: ScenarioScorecard;
  systemScorecards: SystemScorecard[];
  platformScorecard: PlatformScorecard;
  signOffRecord: SignOffRecord;
  currentUserRole: UserRole;
  currentUserName: string;
  onSignReport: (signer: string, role: string, notes: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ReportScorecardsView: React.FC<ReportScorecardsViewProps> = ({
  activityCode,
  scenarioScorecard,
  systemScorecards,
  platformScorecard,
  signOffRecord,
  currentUserRole,
  currentUserName,
  onSignReport,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scorecards' | 'markdown' | 'signoff'>('scorecards');
  const [signNotes, setSignNotes] = useState('');
  const [rebuildCount, setRebuildCount] = useState(1);

  // Markdown Report Preview Content (RPT-02)
  const markdownContent = `# CIDTP 关基智能攻防验证与防御效能评测报告
**报告编号**: RPT-${activityCode}-v1.4  
**评测对象**: ${activityCode} (自来水净水管网全闭环物理在环验证)  
**保真度级别**: L3 硬件在环 (真实 SCADA/PLC 控制)  
**场景清单哈希 (manifest.json)**: \`sha256:9f3a41c7849e7b21a71923e098492cba1192e4d\`  
**测试基线快照哈希**: \`sha256:0a4b7c19f201e792ab8841c790142b91834e007\`  
**报告生成时间**: 2026-11-08 02:45:00 UTC  

---

## 1. 评测执行摘要 (Executive Summary)
本轮攻防演练共计执行 **242 个攻击步**，验证了 10 套串联/旁路/终端防御系统的协同阻断能力。
- **链成功率**: 38.2%
- **步骤逃逸率 (ER)**: 17.4% (比基线高出 +2.1%)
- **必须阻断有效率 (BR)**: 71.4%
- **漏检率 (FNR)**: 12.5%
- **不可判定步数 (I)**: 12 步 (占 6.1%，低于 R3 门禁阈值 ≤10%)

> **【设计约束 A5 法律与技术声明】**:
> 依据关基评测规范，每组对抗配置须重复验证 **≥5 次** 并计算 Wilson 95% 置信区间。
> 当前活动共完成 **3 次重复**，因第 3 次出现 DS-09 阳性探针失步异常，本报告自动标记为 **案例观察报告**，待补齐 5 次后方可签发最终合格证书。

---

## 2. 最小失效集与核心归因 (Attribution & MFS)
1. **S-127 (T0855 非授权线圈写入)**: 主责系统为 **DS-09 (旁路探针)** 与 **DS-01 (边界防火墙)**。
   - 根本原因: 工控规则集缺少下线签名，导致攻击载荷逃逸并达成物理阀门开度强制调至 90%。
2. **S-126 (T1041 敏感数据外带)**: 主责系统为 **DS-10 (隔离网闸)**。
   - 根本原因: 原始告警未能及时关联收敛为主事件。

---

## 3. 防御系统效能卡 (System Effectiveness)
| 系统ID | 产品/版本 | 模式 | 期望动作数 | 实际动作数 | 阻断率(BR) | 漏检率(FNR) | p95时延 | 架构折算 |
|---|---|---|---|---|---|---|---|---|
| DS-01 | ifw-3000 v7.2.1 | 串联 | 84 | 78 | 88.0% | 4.0% | 0.8s | 否 |
| DS-02 | ips-900 v2.6.0 | 旁路 | 62 | 51 | 不适用 | 18.0% | 3.4s | 是 (MUST_DETECT) |
| DS-07 | api-shield v3.4 | 串联 | 48 | 42 | 65.0% | 11.4% | 2.9s | 否 |
| DS-09 | ot-mon-4 v2.1 | 旁路 | 25 | 0 | 不适用 | 12.0% | 6.8s | 是 (探针失步) |
| DS-10 | soc-core v1.0 | 接口 | 10 | 9 | 99.0% | 2.0% | 11.2s | 否 |

---

## 4. 复核留痕与签名认证 (Sign-off)
- **签发人**: ${signOffRecord.signer}
- **职务角色**: ${signOffRecord.signerRole}
- **签署状态**: ${signOffRecord.status === 'signed' ? '已正式电子签署' : '待签署'}
- **报告结论等级**: ${signOffRecord.verdictLevel}
`;

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CIDTP-REPORT-${activityCode}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('已导出 Markdown 评测报告');
  };

  const handleDownloadJson = () => {
    const payload = {
      activityCode,
      scenarioScorecard,
      systemScorecards,
      platformScorecard,
      signOffRecord,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CIDTP-SCORECARDS-${activityCode}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('已导出 JSON 评分卡与取证元数据包');
  };

  const handleRebuildReport = () => {
    setRebuildCount((c) => c + 1);
    showToast(`报告已依据最新判定与证据链重建 (Rebuild #${rebuildCount + 1})，校验 Hash 已更新`);
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin' && currentUserRole !== 'approver') {
      showToast('权限不足：报告发布签署必须由 Admin (签发人) 或 Approver 执行', 'warning');
      return;
    }

    onSignReport(currentUserName, `${currentUserRole.toUpperCase()} 签发官`, signNotes);
    showToast(`报告电子签发完成！已锚定 SHA-256 数字证书签名，归档于中央存证库`);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[4px] bg-[#111821] border border-[#223040]">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040]">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              评分卡与报告发布中心 (SCORECARDS & REPORTS)
              <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
                RPT-01 ~ RPT-06
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              三张评分卡自动生成 · 报告 Markdown 预览与重建 · 电子签名与版本留痕 · 严格执行职责分离
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#0A0E13] p-1 rounded-[4px] border border-[#223040] text-xs">
            <button
              onClick={() => setActiveSubTab('scorecards')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all ${
                activeSubTab === 'scorecards'
                  ? 'bg-cyan-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              三张评分卡 (RPT-01)
            </button>
            <button
              onClick={() => setActiveSubTab('markdown')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all ${
                activeSubTab === 'markdown'
                  ? 'bg-cyan-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              报告预览 (RPT-02)
            </button>
            <button
              onClick={() => setActiveSubTab('signoff')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all ${
                activeSubTab === 'signoff'
                  ? 'bg-cyan-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              签字与发布 (RPT-06)
            </button>
          </div>

          <button
            onClick={handleRebuildReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-slate-200 text-xs font-medium border border-[#223040]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重建报告
          </button>
        </div>
      </div>

      {/* SubTab 1: Three Scorecards (RPT-01) */}
      {activeSubTab === 'scorecards' && (
        <div className="space-y-4">
          {/* Top 2 Cards: Scenario & Platform Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario Scorecard */}
            <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
              <div className="flex items-center justify-between border-b border-[#223040] pb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">场景评分卡 (SCENARIO SCORECARD)</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-cyan-300 border border-[#223040]">
                  {scenarioScorecard.scenarioId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">总演练步数</div>
                  <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                    {scenarioScorecard.totalSteps} 步
                  </div>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">成功逃逸 (S)</div>
                  <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                    {scenarioScorecard.escapedSteps} 步
                  </div>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">阻断有效 (D1)</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                    {scenarioScorecard.blockedSteps} 步
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">逃逸率 (ER)</div>
                  <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {scenarioScorecard.escapeRate}%
                  </div>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">阻断率 (BR)</div>
                  <div className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                    {scenarioScorecard.blockRate}%
                  </div>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                  <div className="text-slate-400">不可判定比例</div>
                  <div className="text-base font-bold font-mono text-slate-300 tabular-nums">
                    {(
                      (scenarioScorecard.inconclusiveSteps / scenarioScorecard.totalSteps) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  每项 S / D3 结论均已绑定数字证据引用
                </span>
                <span className="font-mono text-slate-500">G7 门禁通过</span>
              </div>
            </div>

            {/* Platform Scorecard */}
            <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
              <div className="flex items-center justify-between border-b border-[#223040] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100">平台评分卡 (PLATFORM SCORECARD)</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-purple-300 border border-[#223040]">
                  靶场与引擎信任度
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 font-medium">设计假设 A5：可复现性验证</div>
                    <div className="text-[11px] text-slate-500">
                      要求每组对抗配置重复测试 ≥5 次方可产生系统级结论
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-[4px] bg-amber-950/60 text-amber-400 border border-amber-700/40 font-mono font-bold tabular-nums">
                      {platformScorecard.runCount} 次 / ≥5 次
                    </span>
                    <div className="text-[10px] text-amber-500 mt-0.5">未达标 · 仅作案例</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 font-medium">默认配置待确认 (defaults_pending)</div>
                    <div className="text-[11px] text-slate-500">是否存在未审查的默认白名单或宽松策略</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#111821] text-cyan-300 border border-[#223040] font-mono">
                    {platformScorecard.defaultsPending ? '存在待确认项' : '已全部确认'}
                  </span>
                </div>

                <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 font-medium">PTP 时钟最大偏差 / 隔离突破</div>
                    <div className="text-[11px] text-slate-500">
                      靶场隔离守卫: 0 次穿透 · 时钟偏差 3.2ms (限额 ≤10ms)
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono tabular-nums">合规 (±3.2ms)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                <span>综合环境可信置信度:</span>
                <span className="text-cyan-400 font-bold font-mono tabular-nums">
                  {(platformScorecard.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* System Scorecards: 10 Defense Systems */}
          <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                10 大防御系统效能卡 (10 DEFENSE SYSTEMS SCORECARDS)
                <span className="text-xs font-normal text-slate-400">
                  (包含架构约束 tap 折算标记与 SLA 违约监控)
                </span>
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                分母已排除 I、负对照与未执行步骤
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0A0E13] text-slate-400 font-mono uppercase tracking-wider border-b border-[#223040] text-[11px]">
                  <tr className="h-7 table-row-28">
                    <th className="py-1 px-3">系统编号</th>
                    <th className="py-1 px-3">系统名称</th>
                    <th className="py-1 px-3">部署模式</th>
                    <th className="py-1 px-3">期望动作 / 实测动作</th>
                    <th className="py-1 px-3">漏检率 (FNR)</th>
                    <th className="py-1 px-3">阻断率 (BR)</th>
                    <th className="py-1 px-3">逃逸率 (ER)</th>
                    <th className="py-1 px-3">p95 时延</th>
                    <th className="py-1 px-3">SLA 违约</th>
                    <th className="py-1 px-3">架构折算</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223040] font-mono">
                  {systemScorecards.map((ds) => (
                    <tr key={ds.dsId} className="hover:bg-[#1a2332]/50 transition-colors h-7 table-row-28">
                      <td className="py-1 px-3 font-bold text-cyan-300 text-[13px]">{ds.dsId}</td>
                      <td className="py-1 px-3 text-slate-200 font-sans text-[13px]">{ds.name}</td>
                      <td className="py-1 px-3">
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300 text-[11px]">
                          {ds.mode}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-slate-300 text-[13px] tabular-nums">
                        {ds.actualActions} / {ds.expectedActions} 次
                      </td>
                      <td className="py-1 px-3 font-bold text-rose-400 text-[13px] tabular-nums">{ds.fnr.toFixed(1)}%</td>
                      <td className="py-1 px-3 font-bold text-emerald-400 text-[13px] tabular-nums">
                        {ds.mode === '旁路' ? (
                          <span className="text-slate-500 font-normal">不适用</span>
                        ) : (
                          `${ds.br.toFixed(1)}%`
                        )}
                      </td>
                      <td className="py-1 px-3 text-amber-400 text-[13px] tabular-nums">{ds.er.toFixed(1)}%</td>
                      <td className="py-1 px-3 text-slate-300 text-[13px] tabular-nums">{ds.p95Latency}s</td>
                      <td className="py-1 px-3 text-[13px]">
                        {ds.slaBreachCount > 0 ? (
                          <span className="text-rose-400 font-bold tabular-nums">{ds.slaBreachCount} 次超限</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-1 px-3">
                        {ds.architectureAdjusted ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            已折算 (tap)
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Markdown Report Live Preview (RPT-02 & RPT-03) */}
      {activeSubTab === 'markdown' && (
        <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
          <div className="flex items-center justify-between border-b border-[#223040] pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                评测报告实时预览 (report.md)
              </h3>
              <p className="text-xs text-slate-400">
                依据当前运行产物、DEM 期望与裁判判定实时渲染，禁止手写改动结论
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                导出 Markdown
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-slate-200 text-xs font-medium border border-[#223040]"
              >
                <Download className="w-3.5 h-3.5" />
                导出 JSON 数据包
              </button>
            </div>
          </div>

          <div className="p-5 rounded-[4px] bg-[#0A0E13] border border-[#223040] font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
            {markdownContent}
          </div>
        </div>
      )}

      {/* SubTab 3: Digital Sign-off & Publish (RPT-06) */}
      {activeSubTab === 'signoff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signoff Panel */}
          <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-4">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">发布与电子签署 (RPT-06)</h3>
              </div>
              <span className="text-xs font-mono text-amber-400">G8 门禁审核中</span>
            </div>

            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-xs text-cyan-300 space-y-1">
              <div>
                <strong>职责分离校验</strong>: 当前操作人 <strong>{currentUserName}</strong> (
                {currentUserRole})
              </div>
              <div>
                <strong>R3 门禁准入</strong>: 不可判定比例 6.1% ≤ 10% (通过)；但重复次数 3 &lt; 5 次，
                依设计假设 A5 强制降级为 <code>降级为观察报告 (仅供参考)</code>。
              </div>
            </div>

            <form onSubmit={handleSignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">签署人姓名 / 角色身份 *</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUserName} (${currentUserRole.toUpperCase()})`}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-300 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">报告结论等级 (由门禁自动锚定) *</label>
                <input
                  type="text"
                  disabled
                  value="降级为观察报告 (仅供参考) - 重复次数未达5次"
                  className="w-full bg-[#0A0E13] border border-amber-600/50 text-amber-400 rounded-[4px] p-2 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">签发终审附言与留痕审计 *</label>
                <textarea
                  value={signNotes}
                  onChange={(e) => setSignNotes(e.target.value)}
                  placeholder="请输入签发附言（如：本轮因探针失步归因明确，同意签署案例观察报告）..."
                  rows={3}
                  required
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  执行电子签名并发布报告
                </button>
              </div>
            </form>
          </div>

          {/* Current Sign-off Record */}
          <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <h3 className="text-sm font-bold text-slate-100">存证证书留痕 (SIGN-OFF RECORD)</h3>
              <span className="px-2 py-0.5 rounded-[4px] bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 font-mono">
                已留痕存证
              </span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <span className="text-slate-400">证书代号:</span>
                <span className="text-slate-200 ml-2">{signOffRecord.id}</span>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <span className="text-slate-400">签署人:</span>
                <span className="text-cyan-300 ml-2 font-bold">{signOffRecord.signer}</span>
                <div className="text-slate-500 text-[11px] mt-0.5 font-sans">
                  {signOffRecord.signerRole}
                </div>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <span className="text-slate-400">签署时间:</span>
                <span className="text-slate-200 ml-2 tabular-nums">{signOffRecord.timestamp}</span>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <span className="text-slate-400">场景清单 SHA-256:</span>
                <div className="text-[11px] text-cyan-400 truncate mt-0.5 tabular-nums">
                  {signOffRecord.manifestHash}
                </div>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <span className="text-slate-400">报告内容 SHA-256:</span>
                <div className="text-[11px] text-purple-400 truncate mt-0.5 tabular-nums">
                  {signOffRecord.reportHash}
                </div>
              </div>

              <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] font-sans">
                <span className="text-slate-400">结论说明:</span>
                <p className="text-slate-300 mt-1">{signOffRecord.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
