import React, { useState } from 'react';
import { attackSteps, defenseSystems } from '../../data/cidtpMockData';
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
} from 'lucide-react';

interface AttributionMetricsViewProps {
  onExportCsv: () => void;
}

export const AttributionMetricsView: React.FC<AttributionMetricsViewProps> = ({ onExportCsv }) => {
  const [selectedStepRow, setSelectedStepRow] = useState<string>('S-127');

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
      {/* Top Attribution Context Header matching Image 6 */}
      <div className="p-3.5 rounded-xl bg-[#090e18] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-100 text-sm">
            CAMP-B3-WATER-001 / 归因与指标矩阵 (Attribution & Metrics)
          </span>
          <span className="text-slate-400">本轮第 3 次 / 共 5 次重复</span>
          <span>·</span>
          <span className="text-cyan-400">Wilson 95%</span>
          <span>·</span>
          <span className="text-slate-400">重复 ≥5 次</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs">
            与 v1.3 对比
          </button>
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Cards matching Image 6 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
        {/* Card 1: 漏检率 FNR */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>漏检率 FNR</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800 text-[10px]">
              CRIT
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-400">12.5%</span>
            <span className="text-[10px] text-slate-400">±2.1%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">1 - 有效告警步数 / 必须...</span>
        </div>

        {/* Card 2: 阻断率 BR */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>阻断率 BR</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800 text-[10px]">
              NOMINAL
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-cyan-400">71.4%</span>
            <span className="text-[10px] text-slate-400">目标≥70%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '71%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">有效阻断步数 / 必须阻断...</span>
        </div>

        {/* Card 3: 逃逸率 ER */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>逃逸率 ER</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800 text-[10px]">
              &gt; 15%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-400">17.4%</span>
            <span className="text-[10px] text-rose-400 font-bold">高风险</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: '60%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">E=1 且 R=1 的步数 / 有效...</span>
        </div>

        {/* Card 4: 检测时延 p95 */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>检测时延 p95</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
              LATENCY
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-100">4.2</span>
            <span className="text-xs text-slate-400">秒</span>
            <span className="text-[10px] text-slate-400">avg: 1.8s</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '42%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">02:40:02.118 - 02:39:57</span>
        </div>

        {/* Card 5: 误报率 FPR */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>误报率 FPR</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
              LOW
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400">0.8%</span>
            <span className="text-[10px] text-slate-400">基线&lt;1.0%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">负对照触发次数 / 不得触发...</span>
        </div>

        {/* Card 6: 不可判定比例 */}
        <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>不可判定比例</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 font-bold border border-amber-800 text-[10px]">
              WARN
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-400">6.1%</span>
            <span className="text-[10px] text-slate-400">阈值 ≤10%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }} />
          </div>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">不可判定步数 / 总步数</span>
        </div>
      </div>

      {/* Main Attribution Analysis Section: Step Attribution Table (Left) + System Defense Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[480px]">
        {/* Left Column (Cols 1-7): Step Attribution Table */}
        <div className="lg:col-span-7 rounded-xl bg-[#080d17] border border-slate-800 p-4 space-y-3 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="font-bold text-slate-100">逐步归因分析表 (STEP ATTRIBUTION)</span>
              <span className="text-[10px] text-slate-400">[8 STEPS LOADED] 点击失效芯片快速过滤</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-[#0b1220] border-b border-slate-800 text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2 px-2.5">步骤</th>
                    <th className="py-2 px-2.5">技术</th>
                    <th className="py-2 px-2.5">结论</th>
                    <th className="py-2 px-2.5">最小失效集 (MFS)</th>
                    <th className="py-2 px-2.5">主责系统</th>
                    <th className="py-2 px-2.5">根本诱因分析</th>
                    <th className="py-2 px-2.5 text-right">证据</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {attackSteps.map((step) => {
                    const isSelected = selectedStepRow === step.id;
                    return (
                      <tr
                        key={step.id}
                        onClick={() => setSelectedStepRow(step.id)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#0f1d33]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2.5 font-bold text-cyan-300">{step.id}</td>
                        <td className="py-2.5 px-2.5 text-slate-300">{step.techId}</td>
                        <td className="py-2.5 px-2.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              step.verdict === 'S'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : step.verdict === 'D1'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : step.verdict === 'D2'
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                : step.verdict === 'D3'
                                ? 'bg-orange-950 text-orange-400 border border-orange-800'
                                : step.verdict === 'P1'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step.verdict}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex gap-1 text-[9px]">
                            {step.mfs.map((m) => (
                              <span
                                key={m}
                                className="px-1 rounded bg-[#0b1220] border border-slate-700 text-cyan-300"
                              >
                                {m}
                              </span>
                            ))}
                            {step.mfs.length === 0 && <span className="text-slate-600">—</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="text-rose-400 font-bold">
                            {step.primaryRootCause.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-300 max-w-[180px] truncate" title={step.primaryRootCause}>
                          {step.primaryRootCause.split(' ').slice(1).join(' ') || step.primaryRootCause}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-cyan-400">
                          {step.evidenceCount} 条
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            支持基于因果图拓扑做自动因果收敛与反事实分析 (Counterfactual Analysis)
          </div>
        </div>

        {/* Right Column (Cols 8-12): System Defense Effectiveness Matrix (10 Nodes) */}
        <div className="lg:col-span-5 rounded-xl bg-[#080d17] border border-slate-800 p-4 space-y-3 flex flex-col justify-between overflow-hidden font-mono">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-100">系统防御有效性矩阵 (10 NODES)</span>
              <span className="text-[10px] text-slate-400">逃逸阈值: 15%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#0b1220] border-b border-slate-800 text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2 px-2">系统</th>
                    <th className="py-2 px-2">产品/版本</th>
                    <th className="py-2 px-2">模式</th>
                    <th className="py-2 px-2">FNR</th>
                    <th className="py-2 px-2">BR</th>
                    <th className="py-2 px-2">ER (逃逸条)</th>
                    <th className="py-2 px-2 text-right">p95</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {defenseSystems.map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-2 font-bold text-cyan-300">{ds.id}</td>
                      <td className="py-2 px-2 text-slate-400 text-[10px] truncate max-w-[90px]">
                        {ds.product}
                      </td>
                      <td className="py-2 px-2 text-slate-400 text-[10px]">{ds.mode}</td>
                      <td className="py-2 px-2">
                        <span className={ds.fnr > 10 ? 'text-rose-400 font-bold' : ''}>
                          {ds.fnr.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-cyan-300">
                        {ds.br > 0 ? `${ds.br.toFixed(1)}%` : '不适用'}
                      </td>
                      <td className="py-2 px-2">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ds.er > 5 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                            style={{ width: `${Math.min(100, ds.er * 5)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right text-slate-300 text-[10px]">
                        {ds.p95Latency}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>本轮状态: 全局就绪</span>
            <span className="text-cyan-400">本轮 DS-08 没有归属步骤</span>
          </div>
        </div>
      </div>

      {/* Bottom Deduplicated Root Causes matching Image 6 */}
      <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">
              去重并根因判定 (DEDUPLICATED ROOT CAUSES)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              3 DOMAINS FLAGGED
            </span>
          </div>
          <span className="text-[10px] text-slate-400">* 当前状态: 全局就绪</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rootCauses.map((rc) => (
            <div
              key={rc.id}
              className="p-3 rounded-lg bg-[#070b13] border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-200">{rc.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800 text-[10px]">
                    x{rc.count}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  影响链: <span className="text-cyan-300">{rc.chain}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800">
                <span className={`px-2 py-0.5 rounded border ${rc.tagColor}`}>
                  {rc.tag}
                </span>
                <span className="text-slate-400">{rc.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
