import React, { useState } from 'react';
import { attackSteps, evidenceList } from '../../data/cidtpMockData';
import { AttackStep, SixStateVerdict } from '../../types/cidtp';
import {
  Scale,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  Hash,
  Download,
  Save,
  Search,
} from 'lucide-react';

interface ArbitrationAuditViewProps {
  onCommitVerdict: (stepId: string, verdict: SixStateVerdict) => void;
}

export const ArbitrationAuditView: React.FC<ArbitrationAuditViewProps> = ({ onCommitVerdict }) => {
  const [selectedStepId, setSelectedStepId] = useState<string>('S-127');
  const [activeVerdictFilter, setActiveVerdictFilter] = useState<string>('ALL');
  const [overrideVerdict, setOverrideVerdict] = useState<SixStateVerdict>('S');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const currentStep = attackSteps.find((s) => s.id === selectedStepId) || attackSteps[0];

  const filteredSteps = attackSteps.filter((s) => {
    if (activeVerdictFilter !== 'ALL' && s.verdict !== activeVerdictFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.techId.toLowerCase().includes(q) ||
        s.targetAsset.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getVerdictBadge = (verdict: SixStateVerdict) => {
    switch (verdict) {
      case 'S':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">S 逃逸</span>;
      case 'P1':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">P1 触未达</span>;
      case 'P2':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-yellow-950 text-yellow-500 border border-yellow-800">P2 未触达</span>;
      case 'D1':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">D1 阻断有效</span>;
      case 'D2':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">D2 检终止</span>;
      case 'D3':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-950 text-orange-400 border border-orange-800">D3 检未阻</span>;
      case 'I':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">I 不可判</span>;
    }
  };

  const handleCommit = () => {
    onCommitVerdict(currentStep.id, overrideVerdict);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Arbitration Toolbar matching Image 5 */}
      <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-100">CAMP-B3-WATER-001 /</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800">
            判定复核
          </span>
          <span className="text-slate-400">
            STEP: 第 <span className="text-cyan-400 font-bold">127</span> 步 / 共 242 步
          </span>
          <span>·</span>
          <span className="text-slate-300">裁判 A9 · 非双人复核</span>
          <span>·</span>
          <span className="text-slate-400">观察窗: 300s | 已过 292s</span>
          <span>·</span>
          <span className="text-cyan-400">A9-SYNC // 02:41:04 UTC</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
            批量判定
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>导出证据包</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Review Layout: Steps List | E/R/O Verdict & Evidence | A9 Arbitrator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-3): Filterable Steps List */}
        <div className="lg:col-span-3 rounded-xl bg-[#080d17] border border-slate-800 p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {['ALL', 'S', 'P1', 'P2', 'D1', 'D2', 'D3', 'I'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveVerdictFilter(f)}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                    activeVerdictFilter === f
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="按步骤号 / T码 / 资产过滤..."
                className="w-full bg-[#0b1220] border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Steps Feed */}
            <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredSteps.map((step) => {
                const isSelected = step.id === selectedStepId;
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      setSelectedStepId(step.id);
                      setOverrideVerdict(step.verdict);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-[#0f1d33] border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-[#090e18] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-slate-100">
                        {step.id} <span className="text-cyan-400">{step.techId}</span>
                      </span>
                      {getVerdictBadge(step.verdict)}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {step.targetAsset} {step.techName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            总加载步骤: <span className="text-cyan-400 font-bold">{attackSteps.length}</span> / 242
          </div>
        </div>

        {/* Center Column (Cols 4-9): E/R/O 3-Layer Verdict & Evidential Corroboration */}
        <div className="lg:col-span-6 rounded-xl bg-[#080d17] border border-slate-800 p-4 space-y-4 overflow-y-auto">
          {/* Header & Verdict Banner matching Image 5 */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-cyan-300">{currentStep.id}</span>
                <span className="text-sm font-bold text-slate-100">
                  {currentStep.techId} {currentStep.techName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  变体 {currentStep.variant}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                目标资产: <span className="text-slate-200">{currentStep.targetAsset} ({currentStep.targetIp})</span> · 观察窗: {currentStep.timeMaxSec}s (已过: {currentStep.timeUsedSec}s) · 战术: {currentStep.phaseName}
              </div>
            </div>

            {/* Verdict Hero Banner */}
            <div className="p-2.5 rounded-xl bg-[#240a12] border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] shrink-0 text-right">
              <div className="text-xs font-bold text-rose-300 flex items-center justify-end gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>S · 成功逃逸且达成</span>
              </div>
              <div className="text-[9px] text-rose-400/80 mt-0.5">
                E ∧ R ∧ O 同时成立 · 防御系统 DS-09, DS-01 未动作
              </div>
            </div>
          </div>

          {/* 3-Layer E/R/O Verdict Cards matching Image 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-[11px]">
            {/* Card 1: 逃逸层 (ESCAPE / E) */}
            <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-slate-200">逃逸层 (ESCAPE / E)</span>
                <span className="text-rose-400 font-bold bg-rose-950/60 px-1.5 rounded">成立</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                ● 非阻断: 未观察到因果终止
                <br />
                ● 非事件: 告警未进入主事件队列
              </p>
              <div className="text-[9px] text-cyan-400/80 pt-1 border-t border-slate-800">
                E = ¬阻断 ∧ ¬事件 · W-CONF: {currentStep.escapeLayer.wConf}
              </div>
            </div>

            {/* Card 2: 到达层 (REACH / R) */}
            <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-slate-200">到达层 (REACH / R)</span>
                <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 rounded">成立</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                ● 到达: 02:39:51 在 plc-03 上取得交互会话
              </p>
              <div className="flex flex-wrap gap-1 text-[9px] text-emerald-400">
                <span className="px-1 rounded bg-[#0b1220] border border-slate-800">✓ net:plc-direct</span>
                <span className="px-1 rounded bg-[#0b1220] border border-slate-800">✓ 502/modbus</span>
              </div>
            </div>

            {/* Card 3: 达成层 (OBJECTIVE / O) */}
            <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-slate-200">达成层 (OBJECTIVE / O)</span>
                <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 rounded">成立</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                过程模型偏差: <span className="text-rose-400 font-bold">+{currentStep.objectiveLayer.devPct}%</span> (持续上升)
              </p>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                证据链: EV-2287(强), EV-2294(中) 采纳
              </div>
            </div>
          </div>

          {/* Compliance Rule Constraint */}
          <div className="p-2 rounded-lg bg-[#0b1220] border border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>合规规则约束: 结论 = E ∧ R ∧ O。任何单层不满足即降级为 P1 / P2 / D 态，绝非时序推进关系。</span>
          </div>

          {/* Evidential Corroboration Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-100">
                支持该步判定的核心证据列表 (EVIDENTIAL CORROBORATION)
              </span>
              <span className="text-[10px] text-slate-400">
                COUNT: <span className="text-cyan-400 font-bold">{evidenceList.length}</span> · 查看被剔除证据 (2)
              </span>
            </div>

            <div className="rounded-lg bg-[#080d17] border border-slate-800 overflow-hidden font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-[#0b1220] border-b border-slate-800 text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2 px-3">强度</th>
                    <th className="py-2 px-3">证据来源</th>
                    <th className="py-2 px-3">证据类型 / 内容</th>
                    <th className="py-2 px-3">哈希校验 (SHA-256)</th>
                    <th className="py-2 px-3">采集探针</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {evidenceList.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            ev.strength === '强'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : ev.strength === '中'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.strength}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-200">{ev.source}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-cyan-300">{ev.id}</span> · {ev.typeAndDesc}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[10px]">{ev.sha256}</td>
                      <td className="py-2 px-3 text-slate-400 text-[10px]">{ev.collectionPoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warning banner below table from Image 5 */}
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[10px] font-mono text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                合规性警示: EV-2299 为同机日志，极易被 T1070 清除，不可单独作为达成判定支撑。 RULE_ENFORCE_ISO_27037
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 10-12): A9 Arbitrator Panel (独立复核裁定) */}
        <div className="lg:col-span-3 rounded-xl bg-[#080d17] border border-slate-800 p-4 space-y-4 flex flex-col justify-between font-mono">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                A9 独立复核裁定
              </span>
              <span className="text-[10px] text-cyan-400">只读仲裁网</span>
            </div>

            {/* Verdict Selection Dropdown */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">裁定终态选择</label>
              <select
                value={overrideVerdict}
                onChange={(e) => setOverrideVerdict(e.target.value as SixStateVerdict)}
                className="w-full bg-[#0b1220] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="S">S · 成功逃逸且达成 (ESCAPE)</option>
                <option value="P1">P1 · 触达未达成</option>
                <option value="P2">P2 · 未触达</option>
                <option value="D1">D1 · 阻断有效</option>
                <option value="D2">D2 · 检出终止</option>
                <option value="D3">D3 · 检出未阻断</option>
                <option value="I">I · 不可判定</option>
              </select>
            </div>

            {/* Override explanation textarea */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">改判理由阐述 (审计留痕)</label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="若手动改判规则引擎结论，需输入至少 15 字审计理由..."
                className="w-full bg-[#0b1220] border border-slate-700 rounded-lg p-2 text-[10px] text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Engine Metadata stats */}
            <div className="space-y-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>判定引擎:</span>
                <span className="text-slate-200 font-bold">v1.9-STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>判定置信度:</span>
                <span className="text-cyan-400 font-bold">0.94</span>
              </div>
              <div className="flex justify-between">
                <span>支撑有效项:</span>
                <span className="text-slate-200">4 条证据</span>
              </div>
              <div className="flex justify-between">
                <span>SIEM 绑定:</span>
                <span className="text-slate-200">专用裁判节点 04</span>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="p-2.5 rounded-lg bg-[#0b1220] border border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">复核签署人:</span>
                <span className="text-cyan-300 font-bold">a9.judge.ops</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">签署时间:</span>
                <span className="text-slate-300">02:41:02 UTC</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-1 font-bold pt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>数字签名已锚定</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {isSaved && (
              <div className="text-[10px] text-emerald-400 text-center font-bold">
                ✓ 裁定已写入不可篡改证据账本
              </div>
            )}
            <button
              onClick={handleCommit}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all text-center"
            >
              提交并裁决下一项 (Space)
            </button>
            <button
              onClick={handleCommit}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] text-center"
            >
              暂存修改 (Ctrl+S)
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cross-Step Conjunction Stream matching Image 5 */}
      <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-2 font-mono text-[11px]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <span className="font-bold text-slate-200">
            跨步骤 E/R/O 判定合轨流 (CROSS-STEP CONJUNCTION STREAM)
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-xs bg-rose-500" /> E (逃逸成立)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-xs bg-amber-500" /> R (到达成立)
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-xs bg-cyan-500" /> O (达成成立)
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-xs bg-slate-800" /> 未成立 / 阻断
            </span>
          </div>
        </div>

        {/* Stream Timeline Matrix */}
        <div className="grid grid-cols-10 gap-1 pt-1 text-center text-[10px]">
          {['S-118', 'S-119', 'S-120', 'S-121', 'S-122', 'S-123', 'S-124', 'S-125', 'S-126', 'S-127'].map(
            (stepCode, idx) => {
              const isEscape = idx === 3 || idx === 9; // S-121, S-127
              const isReach = idx >= 1;
              const isObj = idx === 9;

              return (
                <div key={stepCode} className="p-1 rounded bg-[#0b1220] border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[9px]">{stepCode}</div>
                  <div className={`h-1.5 rounded-xs ${isEscape ? 'bg-rose-500' : 'bg-slate-800'}`} title="E" />
                  <div className={`h-1.5 rounded-xs ${isReach ? 'bg-amber-500' : 'bg-slate-800'}`} title="R" />
                  <div className={`h-1.5 rounded-xs ${isObj ? 'bg-cyan-500' : 'bg-slate-800'}`} title="O" />
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
