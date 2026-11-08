import React from 'react';
import {
  CampaignQueueItem,
  DefenseSystem,
  GateCheckStatus,
  TacticPhase,
  VerdictStat,
} from '../../types/cidtp';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Activity,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface OverviewViewProps {
  queue: CampaignQueueItem[];
  selectedCampaign: string;
  onSelectCampaign: (code: string) => void;
  verdictStats: VerdictStat[];
  gateCheck: GateCheckStatus;
  defenseSystems: DefenseSystem[];
  tacticPhases: { key: TacticPhase; name: string; count: number; completed: number; isIcs?: boolean }[];
  onOpenArbitration: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  queue,
  selectedCampaign,
  onSelectCampaign,
  verdictStats,
  gateCheck,
  defenseSystems,
  tacticPhases,
  onOpenArbitration,
}) => {
  const totalSteps = verdictStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-sans">
      {/* LEFT COLUMN (Cols 1-3): RUN QUEUE & Security Engine Status */}
      <div className="lg:col-span-3 space-y-4">
        {/* Activity Run Queue */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h2 className="font-semibold text-slate-100 text-xs tracking-wider">
                活动队列 (RUN QUEUE)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">3 任务活跃</span>
          </div>

          <div className="space-y-2.5">
            {queue.map((item) => {
              const isSelected = item.code === selectedCampaign;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectCampaign(item.code)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f172a] border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-[#070b12] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-slate-100 text-xs">{item.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.status === '运行中'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {item.businessType.split(' ')[0]}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>
                      防御栈: {item.defenseStackPassed}/{item.defenseStackTotal} ↑
                    </span>
                    <span className="text-cyan-400 font-semibold">进度: {item.progressPct}%</span>
                  </div>

                  <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${item.progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engine Guard Status Footer Card */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 space-y-2 text-[11px] font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>靶场网络隔离:</span>
            <span className="text-emerald-400 font-semibold">STRICT_ISOLATED</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>出站流量熔断:</span>
            <span className="text-cyan-400 font-semibold">ENFORCED (DROP)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>测试执行引擎:</span>
            <span className="text-slate-200">v3.8.2-rt</span>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN (Cols 4-9): 6 KPI Cards, Six-State Bar, Attack Matrix Phases */}
      <div className="lg:col-span-6 space-y-4">
        {/* 6 Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>链成功率</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-rose-400">38.2%</span>
              <span className="text-[10px] text-slate-400">覆</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">21.7% 基线</span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>步骤逃逸率</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-rose-400">17.4%</span>
              <span className="text-[10px] text-rose-400 font-mono">+2.1%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">比上一轮 +2.1 百分点</span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>期望矩阵覆盖率</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-cyan-400">64%</span>
              <span className="text-[10px] text-slate-400">41/64</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">DEM 策略已覆盖</span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>不可判定比例</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-slate-200">6.1%</span>
              <span className="text-[10px] text-emerald-400 font-mono">≤10%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">判定基线门限正常</span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>告警转事件</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-bold text-slate-300">402</span>
              <span className="text-xs text-slate-400">→</span>
              <span className="text-xl font-bold text-cyan-400">118</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">收敛压缩比 3.41:1</span>
          </div>

          <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>业务影响</span>
              <HelpCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-xl font-bold text-emerald-400">0.0s</span>
              <span className="text-[10px] text-slate-400">0.3%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">中断 0.0秒 · 错误率 0%</span>
          </div>
        </div>

        {/* Six-State Verdict Distribution Bar (六态结论分布) */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">六态结论分布:</span>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                {verdictStats.map((v) => (
                  <span key={v.code} className="flex items-center gap-1 text-slate-300">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: v.color }} />
                    <span>
                      {v.name} ({v.code})
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400">
              共 <span className="text-cyan-400">{totalSteps}</span> 个攻击步
            </span>
          </div>

          {/* Segmented Color Bar */}
          <div className="w-full h-8 rounded-lg overflow-hidden flex font-mono text-[11px] font-bold text-slate-950 shadow-inner">
            {verdictStats.map((v) => {
              const widthPct = (v.count / totalSteps) * 100;
              return (
                <div
                  key={v.code}
                  style={{ width: `${widthPct}%`, backgroundColor: v.color }}
                  className="h-full flex items-center justify-center transition-all hover:brightness-110 cursor-pointer overflow-hidden px-1"
                  title={`${v.name} (${v.code}): ${v.count} 步 (${widthPct.toFixed(1)}%)`}
                  onClick={onOpenArbitration}
                >
                  <span className="truncate">
                    {v.code} {v.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 14 Attack Matrix Phases (战术阶段进度) */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">战术阶段进度 (ATTACK MATRIX PHASES)</span>
              <span className="text-[10px] text-slate-400">14 个战术阶段</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">MITRE ATT&CK & IEC-62443 工控映射</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {tacticPhases.map((phase) => (
              <div
                key={phase.key}
                className="p-2 rounded-lg bg-[#070b13] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-3 bg-cyan-400 rounded-xs" />
                    <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                    {phase.key === 'defense_evasion' || phase.key === 'impact' ? (
                      <span className="w-1.5 h-3 bg-rose-500 rounded-xs" />
                    ) : null}
                  </div>
                  <span className="font-medium text-slate-200 truncate">{phase.name}</span>
                  {phase.isIcs && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
                      ICS
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 shrink-0">
                  <span>
                    {phase.completed}/{phase.count}
                  </span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${(phase.completed / phase.count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Cols 10-12): GATE CHECKS, Failure Modes, Defense System Alerts */}
      <div className="lg:col-span-3 space-y-4">
        {/* Gate Checks Card */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="font-semibold text-slate-100 text-xs tracking-wider">
                门禁检查 (GATE CHECKS)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">7/9 项通过</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                阳性探针校验
              </span>
              <span className="font-mono text-emerald-400">9/10</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                隔离出站守卫
              </span>
              <span className="font-mono text-emerald-400">已启用 (DROP)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                PTP 时钟偏差
              </span>
              <span className="font-mono text-emerald-400">3ms ≤ 10ms</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                复位健康检查
              </span>
              <span className="font-mono text-emerald-400">L-A/B/C 通过</span>
            </div>

            {/* Red Alert Item */}
            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/50 flex items-center justify-between text-rose-300 text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                阳性探针失败 · DS-09
              </span>
              <span className="font-mono font-bold text-rose-400">旁路不可见</span>
            </div>
          </div>
        </div>

        {/* Top 3 Failure Modes */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-100">主要失效模式 (FAILURE MODES)</span>
            <span className="text-[10px] font-mono text-slate-400">TOP 3</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">
                  编码变体绕过 <span className="font-mono text-rose-400">DS-07</span>
                </span>
                <span className="font-mono font-bold text-rose-400">11 步</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">告警未关联成事件</span>
                <span className="font-mono font-bold text-amber-400">9 步</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">旁路模式无法阻断</span>
                <span className="font-mono font-bold text-orange-400">7 步</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Defense System Alerts (DS-01 ~ DS-10) */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-100">各防御系统实时告警 (DS ALERTS)</span>
            <span className="text-[10px] font-mono text-slate-400">DS-01 ~ DS-10</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {defenseSystems.map((ds) => (
              <div
                key={ds.id}
                className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/40 text-[11px] font-mono transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className={ds.isProbeFailed || ds.alertCount > 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {ds.id}
                  </span>
                  {ds.mode === '旁路' && (
                    <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      旁路
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mini Sparkline Bar */}
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ds.alertCount > 50 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${Math.min(100, ds.alertCount)}%` }}
                    />
                  </div>

                  <span
                    className={`min-w-[28px] text-right font-bold ${
                      ds.isProbeFailed
                        ? 'text-rose-400'
                        : ds.alertCount > 50
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {ds.isProbeFailed ? '0 !' : ds.alertCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
