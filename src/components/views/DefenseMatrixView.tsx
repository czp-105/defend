import React, { useState } from 'react';
import { matrixStepsData } from '../../data/cidtpMockData';
import { DefenseSystem, ExpectationLevel } from '../../types/cidtp';
import {
  Grid,
  Shield,
  Layers,
  Lock,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Save,
  Trash2,
  X,
} from 'lucide-react';

interface DefenseMatrixViewProps {
  defenseSystems: DefenseSystem[];
  onSaveDraft: () => void;
  onFreezeMatrix: () => void;
}

export const DefenseMatrixView: React.FC<DefenseMatrixViewProps> = ({
  defenseSystems,
  onSaveDraft,
  onFreezeMatrix,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ stepId: string; dsId: string } | null>({
    stepId: 'S-012',
    dsId: 'DS-07',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Matrix cell expectation overrides
  const [cellMap, setCellMap] = useState<Record<string, { label: string; bg: string; text: string; sub?: string }>>({
    'S-001_DS-01': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300', sub: '1s' },
    'S-001_DS-02': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300', sub: '3s' },
    'S-001_DS-03': { label: '关联', bg: 'bg-purple-950/80 border-purple-600', text: 'text-purple-300' },
    'S-001_DS-04': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-001_DS-07': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-001_DS-08': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-001_DS-09': { label: '阻断→检测', bg: 'bg-amber-950/80 border-amber-600', text: 'text-amber-300' },

    'S-002_DS-01': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-002_DS-03': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-002_DS-04': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-002_DS-05': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-002_DS-06': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-002_DS-07': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-002_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },

    'S-005_DS-01': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-02': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-03': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-04': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-005_DS-05': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-06': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-07': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },
    'S-005_DS-08': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-005_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-005_DS-10': { label: '禁触', bg: 'bg-amber-900/60 border-amber-500', text: 'text-amber-300' },

    'S-011_DS-02': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-011_DS-04': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-011_DS-05': { label: '关联', bg: 'bg-purple-950/80 border-purple-600', text: 'text-purple-300' },
    'S-011_DS-06': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-011_DS-07': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-011_DS-08': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-011_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },

    'S-012_DS-01': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-012_DS-02': { label: '阻断→检测', bg: 'bg-amber-950/80 border-amber-600', text: 'text-amber-300' },
    'S-012_DS-03': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-012_DS-04': { label: '关联', bg: 'bg-purple-950/80 border-purple-600', text: 'text-purple-300' },
    'S-012_DS-05': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-012_DS-06': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-012_DS-07': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300', sub: '5s' },
    'S-012_DS-08': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-012_DS-09': { label: '阻断→检测', bg: 'bg-amber-950/80 border-amber-600', text: 'text-amber-300' },
    'S-012_DS-10': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },

    'S-014_DS-02': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-014_DS-05': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-014_DS-06': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-014_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-014_DS-10': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },

    'S-020_DS-02': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-020_DS-05': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-020_DS-06': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-020_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-020_DS-10': { label: '未覆盖', bg: 'bg-amber-950/60 border-amber-500/80 border-dashed', text: 'text-amber-400' },

    'S-021_DS-02': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-021_DS-05': { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' },
    'S-021_DS-06': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
    'S-021_DS-09': { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' },
    'S-021_DS-10': { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' },
  });

  const toggleCellExpectation = (stepId: string, dsId: string) => {
    const key = `${stepId}_${dsId}`;
    const curr = cellMap[key]?.label;
    let next: { label: string; bg: string; text: string; sub?: string };

    if (!curr || curr === '.') {
      next = { label: '阻断', bg: 'bg-rose-950/80 border-rose-600', text: 'text-rose-300' };
    } else if (curr === '阻断') {
      next = { label: '检测', bg: 'bg-cyan-950/80 border-cyan-600', text: 'text-cyan-300' };
    } else if (curr === '检测') {
      next = { label: '阻断→检测', bg: 'bg-amber-950/80 border-amber-600', text: 'text-amber-300' };
    } else if (curr === '阻断→检测') {
      next = { label: '观测', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400' };
    } else {
      next = { label: '.', bg: 'bg-transparent border-transparent', text: 'text-slate-600' };
    }

    setCellMap((prev) => ({ ...prev, [key]: next }));
    setSelectedCell({ stepId, dsId });
    setHasChanges(true);
  };

  const phases = Array.from(new Set(matrixStepsData.map((s) => s.phaseCode)));

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Context & Actions Header */}
      <div className="p-3.5 rounded-xl bg-[#090e18] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-slate-100 text-sm">
            CAMP-B3-WATER-001 / 防御期望矩阵 (DEM)
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono text-[11px]">
            V1.4 草稿
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
            B3 工业过程闭环型
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
            保真度 L3
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs">
            按规则生成草案
          </button>
          <button
            onClick={onFreezeMatrix}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>冻结矩阵</span>
          </button>
        </div>
      </div>

      {/* Coverage Bar & Warning Banner */}
      <div className="p-3 rounded-xl bg-[#080d17] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs">
            <span className="text-slate-400">覆盖</span>{' '}
            <span className="font-bold text-cyan-400">41/64 格</span> ·{' '}
            <span className="font-bold text-cyan-400">64%</span>
          </div>

          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '64%' }} />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DS-10 上 T0855 有 3 格未覆盖</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            必须阻断 12
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            必须检测 9
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            未覆盖 3
          </span>
        </div>
      </div>

      {/* Full Defense Expectation Matrix (DEM) Table */}
      <div className="rounded-xl bg-[#080d17] border border-slate-800 overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            {/* Header row 1: Defense Systems */}
            <thead className="bg-[#0b1220] border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-3 min-w-[260px] text-slate-300 font-bold uppercase tracking-wider">
                  <div className="text-slate-100 text-xs">SCENARIO TIMELINE</div>
                  <div className="text-[10px] text-slate-400 font-normal">演练攻击步骤与对抗载荷 (16 STEPS)</div>
                </th>
                {defenseSystems.map((ds) => (
                  <th
                    key={ds.id}
                    className="py-2 px-2 min-w-[85px] text-center border-l border-slate-800/80 align-top"
                  >
                    <div
                      className={`font-bold ${
                        ds.isProbeFailed ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {ds.id}
                      {ds.isProbeFailed ? '*' : ''}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">{ds.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {ds.mode} {ds.latencyLimit}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Body with Phase Separation */}
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {phases.map((phaseCode) => {
                const phaseSteps = matrixStepsData.filter((s) => s.phaseCode === phaseCode);
                const phaseTitle = phaseSteps[0].phase;

                return (
                  <React.Fragment key={phaseCode}>
                    {/* Phase Separator Header */}
                    <tr className="bg-[#060a12]/90 text-cyan-400 font-bold text-[11px]">
                      <td colSpan={11} className="py-2 px-3 tracking-wider">
                        <span className="text-cyan-300 font-mono">{phaseCode}</span>{' '}
                        <span className="text-slate-300 ml-1">{phaseTitle}</span>
                      </td>
                    </tr>

                    {/* Step Rows */}
                    {phaseSteps.map((step) => (
                      <tr key={step.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cyan-400">{step.id}</span>
                            <span className="text-slate-300 font-semibold">{step.tech}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400">
                              {step.variant}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.name}</div>
                        </td>

                        {defenseSystems.map((ds) => {
                          const key = `${step.id}_${ds.id}`;
                          const cell = cellMap[key];
                          const isSelected =
                            selectedCell?.stepId === step.id && selectedCell?.dsId === ds.id;

                          return (
                            <td
                              key={ds.id}
                              onClick={() => toggleCellExpectation(step.id, ds.id)}
                              className={`py-1 px-1.5 text-center border-l border-slate-800/60 align-middle cursor-pointer transition-all ${
                                isSelected ? 'ring-2 ring-cyan-400 bg-cyan-950/40' : ''
                              }`}
                            >
                              {cell && cell.label !== '.' ? (
                                <div
                                  className={`py-1 px-1 rounded text-[10px] font-bold border transition-transform hover:scale-105 ${cell.bg} ${cell.text}`}
                                >
                                  <div>{cell.label}</div>
                                  {cell.sub && (
                                    <div className="text-[8px] text-slate-400 font-normal">
                                      {cell.sub}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-xs">·</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Cell Detail Floating Card matching Image 3 Right Box */}
        {selectedCell && (
          <div className="absolute right-6 bottom-16 w-80 p-4 rounded-xl bg-[#090e18]/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md space-y-2.5 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-mono font-bold text-xs text-cyan-300">
                {selectedCell.stepId} · {selectedCell.dsId}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">应用与 API 防护 v3.4</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">期望等级:</span>
                <span className="text-rose-400 font-bold">必须阻断 (MUST_BLOCK)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">部署模式:</span>
                <span className="text-cyan-300 font-semibold">串联 (INLINE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">时延上限:</span>
                <span className="text-cyan-400 font-bold">5.0 秒</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer matching Image 3 */}
      <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]">
            设置期望...
          </button>
          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]">
            设置部署模式...
          </button>
          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]">
            从上一行复制
          </button>
          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]">
            与 v1.3 对比
          </button>
          <button
            onClick={() => setSelectedCell(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 text-[11px]"
          >
            <Trash2 className="w-3 h-3" />
            <span>清空所选</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            已选 <span className="text-cyan-400 font-bold">9 格</span> · 必须阻断 6 · 必须检测 2
          </div>
          {hasChanges && (
            <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              42 处修改 · 未保存
            </span>
          )}
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存草稿</span>
          </button>
        </div>
      </div>
    </div>
  );
};
