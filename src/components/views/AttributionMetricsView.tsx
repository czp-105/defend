import React, { useState } from 'react';
import { attackSteps, defenseSystems } from '../../data/cidtpMockData';
import { DefenseSystem } from '../../types/cidtp';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Shield,
  Download,
  Copy,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  X,
  Sliders,
  GitCompare,
  BarChart2,
} from 'lucide-react';

interface AttributionMetricsViewProps {
  onExportCsv: () => void;
}

export const AttributionMetricsView: React.FC<AttributionMetricsViewProps> = ({ onExportCsv }) => {
  const [selectedStepRow, setSelectedStepRow] = useState<string>('S-127');

  // ATT-02 Single System Drill-down Modal
  const [drilledDs, setDrilledDs] = useState<DefenseSystem | null>(null);

  // ATT-03 Metric Formulation Drawer
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);

  // ATT-04 Cross-Campaign Comparison Modal
  const [showCompareModal, setShowCompareModal] = useState(false);

  const rootCauses = [
    {
      id: 1,
      title: '日志分段未转发至 SIEM',
      count: 9,
      chain: 'S-112 ... S-126',
      tag: '平台级',
      tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      note: '只计一次，不按步重复计数',
    },
    {
      id: 2,
      title: 'span-mgmt 采集器时钟偏移 42ms',
      count: 4,
      chain: 'S-118 ... S-123',
      tag: '平台级',
      tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      note: '只计一次，不按步重复计数',
    },
    {
      id: 3,
      title: '工控规则集缺少线圈写签名',
      count: 3,
      chain: 'S-127 ... S-129',
      tag: '配置类',
      tagColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      note: '只计一次，不按步重复计数',
    },
  ];

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Attribution Context Header */}
      <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-100 text-sm">
            CAMP-B3-WATER-001 / 归因与指标矩阵 (ATT-01 ~ ATT-05)
          </span>
          <span className="text-slate-400">本轮第 3 次 / 共 5 次重复</span>
          <span>·</span>
          <span className="text-cyan-400">Wilson 95%</span>
          <span>·</span>
          <span className="text-amber-400">重复 ≥5 次方作系统结论</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowFormulaDrawer(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-cyan-300 border border-[#223040] text-xs font-mono"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>口径说明 (ATT-03)</span>
          </button>

          <button
            onClick={() => setShowCompareModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-slate-200 border border-[#223040] text-xs"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>跨活动对比 (ATT-04)</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
        {/* Card 1: 漏检率 FNR */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>漏检率 FNR</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-rose-950/60 text-rose-400 font-bold border border-rose-800/50 text-[10px]">
              CRIT
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-rose-400">12.5%</span>
            <span className="text-[10px] text-slate-400">±2.1%</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-rose-500 rounded-[1px]" style={{ width: '45%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            1 - 有效告警步数 / 必须...
          </span>
        </div>

        {/* Card 2: 阻断率 BR */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>阻断率 BR</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-cyan-950/60 text-cyan-400 font-bold border border-cyan-800/50 text-[10px]">
              NOMINAL
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-cyan-300">71.4%</span>
            <span className="text-[10px] text-slate-400">目标≥70%</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-cyan-500 rounded-[1px]" style={{ width: '71.4%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            有效阻断步数 / 必须阻断...
          </span>
        </div>

        {/* Card 3: 逃逸率 ER */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>逃逸率 ER</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-amber-950/60 text-amber-400 font-bold border border-amber-800/50 text-[10px]">
              &gt; 15%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-amber-400">17.4%</span>
            <span className="text-[10px] text-rose-400">高风险</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-amber-500 rounded-[1px]" style={{ width: '60%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            E=1 且 R=1 的步数 / 有效...
          </span>
        </div>

        {/* Card 4: 检测时延 p95 */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>检测时延 p95</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-[#0A0E13] text-slate-300 font-bold border border-[#223040] text-[10px]">
              LATENCY
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-slate-100">4.2</span>
            <span className="text-xs text-slate-400">秒</span>
            <span className="text-[10px] text-slate-400 ml-auto">均值: 1.8s</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-cyan-500 rounded-[1px]" style={{ width: '42%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5 tabular-nums">
            02:40:02.118 - 02:39:57
          </span>
        </div>

        {/* Card 5: 误报率 FPR */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>误报率 FPR</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/50 text-[10px]">
              LOW
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-emerald-400">0.8%</span>
            <span className="text-[10px] text-slate-400">基线&lt;1.0%</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-emerald-500 rounded-[1px]" style={{ width: '20%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            负对照触发次数 / 不得触发...
          </span>
        </div>

        {/* Card 6: 不可判定比例 */}
        <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>不可判定比例</span>
            <span className="px-1.5 py-0.2 rounded-[4px] bg-amber-950/60 text-amber-400 font-bold border border-amber-800/50 text-[10px]">
              WARN
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-bold text-amber-300">6.1%</span>
            <span className="text-[10px] text-slate-400">阈值 ≤10%</span>
          </div>
          <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden mt-1 border border-[#223040]/50">
            <div className="h-full bg-amber-500 rounded-[1px]" style={{ width: '61%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            不可判定步数 / 总步数
          </span>
        </div>
      </div>

      {/* Main 2-Column Tables: Step Attribution (ATT-01) & 10 Systems Matrix (ATT-02) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Left Column (Cols 1-7): Step Attribution Table */}
        <div className="lg:col-span-7 rounded-[4px] bg-[#111821] border border-[#223040] p-4 space-y-3 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs font-mono">
              <span className="font-bold text-slate-100">逐步归因分析表 (STEP ATTRIBUTION - ATT-01)</span>
              <span className="text-[10px] text-slate-400 font-mono">[8 步骤已加载] 点击失效芯片快速过滤</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-[#0A0E13] border-b border-[#223040] text-[11px] text-slate-400">
                  <tr className="h-7 table-row-28">
                    <th className="py-1 px-2.5">步骤</th>
                    <th className="py-1 px-2.5">技术</th>
                    <th className="py-1 px-2.5">结论</th>
                    <th className="py-1 px-2.5">最小失效集 (MFS)</th>
                    <th className="py-1 px-2.5">主责系统</th>
                    <th className="py-1 px-2.5">根本诱因分析</th>
                    <th className="py-1 px-2.5 text-right">证据</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223040] text-slate-300">
                  {attackSteps.map((step) => {
                    const isSelected = selectedStepRow === step.id;
                    return (
                      <tr
                        key={step.id}
                        onClick={() => setSelectedStepRow(step.id)}
                        className={`hover:bg-[#1a2332]/50 cursor-pointer transition-colors h-7 table-row-28 ${
                          isSelected ? 'bg-[#1a293f]' : ''
                        }`}
                      >
                        <td className="py-1 px-2.5 font-bold text-cyan-300 text-[13px] tabular-nums">{step.id}</td>
                        <td className="py-1 px-2.5 text-slate-300 text-[13px] tabular-nums">{step.techId}</td>
                        <td className="py-1 px-2.5">
                          <span
                            className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold ${
                              step.verdict === 'S'
                                ? 'bg-rose-950/70 text-rose-400 border border-rose-800'
                                : step.verdict === 'D1'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                                : step.verdict === 'D2'
                                ? 'bg-teal-950/70 text-teal-400 border border-teal-800'
                                : step.verdict === 'D3'
                                ? 'bg-orange-950/70 text-orange-400 border border-orange-800'
                                : step.verdict === 'P1'
                                ? 'bg-amber-950/70 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step.verdict}
                          </span>
                        </td>
                        <td className="py-1 px-2.5">
                          <div className="flex gap-1 text-[9px]">
                            {step.mfs.map((m) => (
                              <span
                                key={m}
                                className="px-1 rounded-[2px] bg-[#0A0E13] border border-[#223040] text-cyan-300"
                              >
                                {m}
                              </span>
                            ))}
                            {step.mfs.length === 0 && <span className="text-slate-600">—</span>}
                          </div>
                        </td>
                        <td className="py-1 px-2.5">
                          <span className="text-rose-400 font-bold text-[13px]">
                            {step.primaryRootCause.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-1 px-2.5 text-slate-300 text-[13px] max-w-[180px] truncate" title={step.primaryRootCause}>
                          {step.primaryRootCause.split(' ').slice(1).join(' ') || step.primaryRootCause}
                        </td>
                        <td className="py-1 px-2.5 text-right font-bold text-cyan-400 text-[13px] tabular-nums">
                          {step.evidenceCount} 条
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-[#223040] flex justify-between">
            <span>后端口径：无告警时绝不归因 DS-10（物理网闸）；支持反事实分析</span>
            <span className="text-cyan-400">根因跨步已合并去重</span>
          </div>
        </div>

        {/* Right Column (Cols 8-12): 10 Nodes Effectiveness Matrix (ATT-02) */}
        <div className="lg:col-span-5 rounded-[4px] bg-[#111821] border border-[#223040] p-4 space-y-3 flex flex-col justify-between overflow-hidden font-mono">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs">
              <span className="font-bold text-slate-100">系统防御有效性矩阵 (10 节点 - 点击下钻)</span>
              <span className="text-[10px] text-slate-400 font-mono">逃逸阈值: 15%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0A0E13] border-b border-[#223040] text-[11px] text-slate-400">
                  <tr className="h-7 table-row-28">
                    <th className="py-1 px-2">系统</th>
                    <th className="py-1 px-2">产品/版本</th>
                    <th className="py-1 px-2">模式</th>
                    <th className="py-1 px-2">FNR</th>
                    <th className="py-1 px-2">BR</th>
                    <th className="py-1 px-2">ER (逃逸条)</th>
                    <th className="py-1 px-2 text-right">p95</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223040] text-slate-300">
                  {defenseSystems.map((ds) => (
                    <tr
                      key={ds.id}
                      onClick={() => setDrilledDs(ds)}
                      className="hover:bg-[#1a2332]/50 cursor-pointer transition-colors h-7 table-row-28"
                      title="点击下钻查看单系统指标 (ATT-02)"
                    >
                      <td className="py-1 px-2 font-bold text-cyan-300 text-[13px]">{ds.id}</td>
                      <td className="py-1 px-2 text-slate-400 text-[11px] truncate max-w-[90px]">
                        {ds.product}
                      </td>
                      <td className="py-1 px-2 text-slate-400 text-[11px]">{ds.mode}</td>
                      <td className="py-1 px-2 text-[13px] tabular-nums">
                        <span className={ds.fnr > 10 ? 'text-rose-400 font-bold' : ''}>
                          {ds.fnr.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-1 px-2 text-cyan-300 text-[13px] tabular-nums">
                        {ds.mode === '旁路' ? (
                          <span className="text-slate-500 font-normal">不适用</span>
                        ) : ds.br > 0 ? (
                          `${ds.br.toFixed(1)}%`
                        ) : (
                          '0.0%'
                        )}
                      </td>
                      <td className="py-1 px-2">
                        <div className="w-12 h-1.5 bg-[#0A0E13] rounded-[2px] overflow-hidden border border-[#223040]">
                          <div
                            className={`h-full ${ds.er > 5 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                            style={{ width: `${Math.min(100, ds.er * 5)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-1 px-2 text-right text-slate-300 text-[13px] tabular-nums">
                        {ds.p95Latency}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-[#223040] flex justify-between">
            <span>本轮状态: 全局就绪</span>
            <span className="text-cyan-400">本轮 DS-08 没有归属步骤</span>
          </div>
        </div>
      </div>

      {/* Bottom Deduplicated Root Causes (ATT-05) */}
      <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">
              去重并根因判定 (DEDUPLICATED ROOT CAUSES - ATT-05)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-cyan-300 border border-[#223040]">
              3 领域标记
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">* 当前状态: 平台级根因已归并</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rootCauses.map((rc) => (
            <div
              key={rc.id}
              className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] hover:border-slate-600 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-200">{rc.title}</span>
                  <span className="px-1.5 py-0.2 rounded-[4px] bg-rose-950/70 text-rose-400 font-bold border border-rose-800 text-[10px] tabular-nums">
                    x{rc.count}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  影响链: <span className="text-cyan-300">{rc.chain}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[#223040]">
                <span className={`px-2 py-0.5 rounded-[4px] border ${rc.tagColor}`}>
                  {rc.tag}
                </span>
                <span className="text-slate-400">{rc.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ATT-02 Single System Drill-down Modal */}
      {drilledDs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                单系统效能下钻分析 (ATT-02): {drilledDs.id} {drilledDs.name}
              </div>
              <button onClick={() => setDrilledDs(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <div className="text-slate-400">产品 / 版本:</div>
                <div className="text-cyan-300 font-bold mt-1">
                  {drilledDs.product} {drilledDs.version}
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <div className="text-slate-400">部署模式:</div>
                <div className="text-slate-200 font-bold mt-1">{drilledDs.mode}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <div className="text-slate-500 text-[10px]">漏检率 (FNR)</div>
                <div className="text-rose-400 font-bold text-base tabular-nums">{drilledDs.fnr}%</div>
              </div>
              <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <div className="text-slate-500 text-[10px]">阻断率 (BR)</div>
                <div className="text-emerald-400 font-bold text-base tabular-nums">
                  {drilledDs.mode === '旁路' ? 'N/A' : `${drilledDs.br}%`}
                </div>
              </div>
              <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
                <div className="text-slate-500 text-[10px]">逃逸率 (ER)</div>
                <div className="text-amber-400 font-bold text-base tabular-nums">{drilledDs.er}%</div>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">响应时延统计 (Latency):</span>
                <span className="text-slate-200 tabular-nums">
                  p50: 0.4s · p95: {drilledDs.p95Latency}s · max: 8.4s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SLA 限额违约次数:</span>
                <span className="text-rose-400 font-bold tabular-nums">2 次超限</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">误报率 (FPR):</span>
                <span className="text-emerald-400 font-bold tabular-nums">0.8%</span>
              </div>
            </div>

            {drilledDs.mode === '旁路' && (
              <div className="p-2 rounded-[4px] bg-amber-950/40 border border-amber-600/40 text-amber-300 text-[10px]">
                ℹ️ <strong>架构约束说明</strong>: 该系统为旁路 (tap) 部署，物理上不具备串联实时丢包能力，故阻断率记为“不适用”，不参与失效率惩罚。
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setDrilledDs(null)}
                className="px-4 py-1.5 rounded-[4px] bg-[#1a2332] text-slate-200 hover:bg-[#223040] border border-[#223040]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATT-03 Metric Formulation Drawer */}
      {showFormulaDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                评测指标统计口径与公式说明 (ATT-03)
              </div>
              <button onClick={() => setShowFormulaDrawer(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
                <div className="font-bold text-cyan-300">1. 漏检率 (False Negative Rate, FNR)</div>
                <div className="text-[11px] text-slate-400">
                  公式: <code>FNR = 1 - (有效告警步数 / 必须检测步数)</code>
                </div>
                <div className="text-[10px] text-amber-400">
                  * 排除项：不可判定 (I)、负对照、仅观测 (OBSERVE_ONLY) 步全部排除在分母外。
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
                <div className="font-bold text-cyan-300">2. 阻断率 (Block Rate, BR)</div>
                <div className="text-[11px] text-slate-400">
                  公式: <code>BR = 有效阻断步数 / 必须阻断步数</code>
                </div>
                <div className="text-[10px] text-amber-400">
                  * 旁路 (tap) 系统因物理限制不计算 BR，显示为“不适用”。
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
                <div className="font-bold text-cyan-300">3. 步骤逃逸率 (Escape Rate, ER)</div>
                <div className="text-[11px] text-slate-400">
                  公式: <code>ER = (E=1 且 R=1 成立的步数) / 有效可执行总步数</code>
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
                <div className="font-bold text-cyan-300">4. Wilson 95% 置信区间与重复性假定</div>
                <div className="text-[11px] text-slate-400">
                  依据评测准则，单次运行仅作案例分析（样本量 N=1 时置信区间宽达 ±45%）；每组配置必须重复验证 ≥5 次并计算 Wilson 区间方可沉淀系统级评测结论。
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowFormulaDrawer(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#1a2332] text-slate-200 hover:bg-[#223040] border border-[#223040]"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATT-04 Cross-Campaign Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                跨活动对抗效能对比与可比性核验 (ATT-04)
              </div>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-[4px] bg-amber-950/30 border border-amber-500/40 text-amber-300 text-[11px]">
              ⚠️ <strong>可比性准入规则</strong>：只有同一业务类、同一保真度且 <code>scenario_sha256</code> 与 <code>config_sha256</code> 一致的历史活动才允许直接对比指标；跨业务类对比将被阻断。
            </div>

            <table className="w-full text-left font-mono">
              <thead className="bg-[#0A0E13] text-slate-400 uppercase border-b border-[#223040] text-[11px]">
                <tr className="h-7 table-row-28">
                  <th className="py-1 px-2.5">指标项</th>
                  <th className="py-1 px-2.5">当前活动 (B3-WATER-001)</th>
                  <th className="py-1 px-2.5">对比历史活动 (B3-GRID-2026-05)</th>
                  <th className="py-1 px-2.5">差异趋势</th>
                  <th className="py-1 px-2.5">可比性状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223040] text-slate-300">
                <tr className="h-7 table-row-28">
                  <td className="py-1 px-2.5 font-bold text-slate-200 text-[13px]">步骤逃逸率 (ER)</td>
                  <td className="py-1 px-2.5 text-rose-400 font-bold text-[13px] tabular-nums">17.4%</td>
                  <td className="py-1 px-2.5 text-slate-400 text-[13px] tabular-nums">12.1%</td>
                  <td className="py-1 px-2.5 text-rose-400 font-bold text-[13px]">+5.3% ↑ (恶化)</td>
                  <td className="py-1 px-2.5 text-emerald-400 text-[13px]">同属 B3 可比</td>
                </tr>
                <tr className="h-7 table-row-28">
                  <td className="py-1 px-2.5 font-bold text-slate-200 text-[13px]">必须阻断率 (BR)</td>
                  <td className="py-1 px-2.5 text-cyan-300 font-bold text-[13px] tabular-nums">71.4%</td>
                  <td className="py-1 px-2.5 text-slate-400 text-[13px] tabular-nums">78.0%</td>
                  <td className="py-1 px-2.5 text-amber-400 text-[13px]">-6.6% ↓</td>
                  <td className="py-1 px-2.5 text-emerald-400 text-[13px]">同属 B3 可比</td>
                </tr>
                <tr className="h-7 table-row-28">
                  <td className="py-1 px-2.5 font-bold text-slate-200 text-[13px]">漏检率 (FNR)</td>
                  <td className="py-1 px-2.5 text-rose-400 font-bold text-[13px] tabular-nums">12.5%</td>
                  <td className="py-1 px-2.5 text-slate-400 text-[13px] tabular-nums">8.2%</td>
                  <td className="py-1 px-2.5 text-rose-400 font-bold text-[13px]">+4.3% ↑</td>
                  <td className="py-1 px-2.5 text-emerald-400 text-[13px]">同属 B3 可比</td>
                </tr>
                <tr className="h-7 table-row-28">
                  <td className="py-1 px-2.5 font-bold text-slate-200 text-[13px]">不可判定比例 (I)</td>
                  <td className="py-1 px-2.5 text-slate-300 text-[13px] tabular-nums">6.1%</td>
                  <td className="py-1 px-2.5 text-slate-400 text-[13px] tabular-nums">3.2%</td>
                  <td className="py-1 px-2.5 text-slate-400 text-[13px]">+2.9%</td>
                  <td className="py-1 px-2.5 text-emerald-400 text-[13px]">均 ≤10% 达标</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#1a2332] text-slate-200 hover:bg-[#223040] border border-[#223040]"
              >
                关闭对比
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
