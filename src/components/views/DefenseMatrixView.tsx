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
  FileCheck,
  History,
  GitCompare,
} from 'lucide-react';

interface DefenseMatrixViewProps {
  defenseSystems: DefenseSystem[];
  onSaveDraft: () => void;
  onFreezeMatrix: () => void;
}

interface CellOverrideRecord {
  stepId: string;
  dsId: string;
  expectation: string;
  reason: string;
  overriddenBy: string;
  timestamp: string;
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

  // DEM-02 Override state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTargetExp, setOverrideTargetExp] = useState('MUST_BLOCK');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideRecords, setOverrideRecords] = useState<CellOverrideRecord[]>([
    {
      stepId: 'S-012',
      dsId: 'DS-07',
      expectation: 'MUST_BLOCK',
      reason: '现场接入测试专用网闸旁路端口，经技术委员会审批设定 SLA 时延上限 5.0s',
      overriddenBy: '刘工 (测试作者)',
      timestamp: '2026-11-08 02:15:40',
    },
  ]);

  // DEM-04 G2 Integrity Gate Modal
  const [showG2Modal, setShowG2Modal] = useState(false);

  // DEM-05 Diff Modal
  const [showDiffModal, setShowDiffModal] = useState(false);

  // Matrix cell expectation overrides with strictly separated expectation colors
  const [cellMap, setCellMap] = useState<Record<string, { label: string; bg: string; text: string; sub?: string; isOverride?: boolean }>>({
    'S-001_DS-01': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200', sub: '1s' },
    'S-001_DS-02': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200', sub: '3s' },
    'S-001_DS-03': { label: '关联', bg: 'bg-[#2E1065] border-[#7E22CE]', text: 'text-purple-200' },
    'S-001_DS-04': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-001_DS-07': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-001_DS-08': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-001_DS-09': { label: '阻断→检测', bg: 'bg-[#451A03] border-[#D97706]', text: 'text-amber-300' },

    'S-002_DS-01': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-002_DS-03': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-002_DS-04': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-002_DS-05': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-002_DS-06': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-002_DS-07': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-002_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },

    'S-005_DS-01': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-02': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-03': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-04': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-005_DS-05': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-06': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-07': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },
    'S-005_DS-08': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-005_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-005_DS-10': { label: '禁触', bg: 'bg-[#451A03] border-[#B45309]', text: 'text-amber-200' },

    'S-011_DS-02': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-011_DS-04': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-011_DS-05': { label: '关联', bg: 'bg-[#2E1065] border-[#7E22CE]', text: 'text-purple-200' },
    'S-011_DS-06': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-011_DS-07': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-011_DS-08': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-011_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },

    'S-012_DS-01': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-012_DS-02': { label: '阻断→检测', bg: 'bg-[#451A03] border-[#D97706]', text: 'text-amber-300' },
    'S-012_DS-03': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-012_DS-04': { label: '关联', bg: 'bg-[#2E1065] border-[#7E22CE]', text: 'text-purple-200' },
    'S-012_DS-05': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-012_DS-06': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-012_DS-07': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200', sub: '5s', isOverride: true },
    'S-012_DS-08': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-012_DS-09': { label: '阻断→检测', bg: 'bg-[#451A03] border-[#D97706]', text: 'text-amber-300' },
    'S-012_DS-10': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },

    'S-014_DS-02': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-014_DS-05': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-014_DS-06': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-014_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-014_DS-10': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },

    'S-020_DS-02': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-020_DS-05': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-020_DS-06': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-020_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-020_DS-10': { label: '未覆盖', bg: 'bg-[#111827] border-[#374151] border-dashed', text: 'text-slate-400' },

    'S-021_DS-02': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-021_DS-05': { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' },
    'S-021_DS-06': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
    'S-021_DS-09': { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' },
    'S-021_DS-10': { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' },
  });

  // DEM-03 tap conversion logic
  const toggleCellExpectation = (stepId: string, dsId: string) => {
    const key = `${stepId}_${dsId}`;
    const curr = cellMap[key]?.label;
    const targetDs = defenseSystems.find((d) => d.id === dsId);

    let next: { label: string; bg: string; text: string; sub?: string };

    if (!curr || curr === '.') {
      // If tap system, DEM-03 converts MUST_BLOCK to MUST_DETECT
      if (targetDs?.mode === '旁路') {
        next = { label: '阻断→检测', bg: 'bg-[#451A03] border-[#D97706]', text: 'text-amber-300' };
      } else {
        next = { label: '阻断', bg: 'bg-[#3B1219] border-[#7F1D1D]', text: 'text-rose-200' };
      }
    } else if (curr === '阻断') {
      next = { label: '检测', bg: 'bg-[#082F49] border-[#0284C7]', text: 'text-cyan-200' };
    } else if (curr === '检测') {
      next = { label: '阻断→检测', bg: 'bg-[#451A03] border-[#D97706]', text: 'text-amber-300' };
    } else if (curr === '阻断→检测') {
      next = { label: '观测', bg: 'bg-[#1E293B] border-[#475569]', text: 'text-slate-300' };
    } else {
      next = { label: '.', bg: 'bg-transparent border-transparent', text: 'text-slate-600' };
    }

    setCellMap((prev) => ({ ...prev, [key]: next }));
    setSelectedCell({ stepId, dsId });
    setHasChanges(true);
  };


  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;
    if (!overrideReason.trim() || overrideReason.trim().length < 5) {
      alert('DEM-02 规则：人工 Override 单元格必须填写至少 5 字审计理由！');
      return;
    }

    const key = `${selectedCell.stepId}_${selectedCell.dsId}`;
    const labelMap: Record<string, string> = {
      MUST_BLOCK: '阻断',
      MUST_DETECT: '检测',
      BLOCK_OR_DETECT: '阻断→检测',
      OBSERVE_ONLY: '观测',
      FORBIDDEN: '禁触',
    };
    const label = labelMap[overrideTargetExp] || '阻断';

    setCellMap((prev) => ({
      ...prev,
      [key]: {
        label,
        bg: label === '阻断' ? 'bg-rose-950/80 border-rose-600' : 'bg-cyan-950/80 border-cyan-600',
        text: label === '阻断' ? 'text-rose-300' : 'text-cyan-300',
        isOverride: true,
      },
    }));

    const newRecord: CellOverrideRecord = {
      stepId: selectedCell.stepId,
      dsId: selectedCell.dsId,
      expectation: overrideTargetExp,
      reason: overrideReason.trim(),
      overriddenBy: '刘工 (测试作者)',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setOverrideRecords((prev) => [newRecord, ...prev]);
    setShowOverrideModal(false);
    setOverrideReason('');
    setHasChanges(true);
    alert(`已为 ${selectedCell.stepId} · ${selectedCell.dsId} 登记人工 Override 覆盖记录`);
  };

  const phases = Array.from(new Set(matrixStepsData.map((s) => s.phaseCode)));

  const currentOverride = overrideRecords.find(
    (r) => r.stepId === selectedCell?.stepId && r.dsId === selectedCell?.dsId
  );

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Context & Actions Header */}
      <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-slate-100 text-sm tabular-nums">
            CAMP-B3-WATER-001 / 防御期望矩阵 (DEM)
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[11px]">
            V1.4 草稿
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300 text-[11px]">
            B3 工业过程闭环型
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300 text-[11px]">
            保真度 L3
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setShowG2Modal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-slate-200 border border-[#223040] text-xs font-mono"
          >
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>完整性门禁 (G2)</span>
          </button>

          <button
            onClick={onFreezeMatrix}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 text-cyan-100 border border-cyan-500/50 font-semibold text-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>冻结矩阵 (计算 SHA-256)</span>
          </button>
        </div>
      </div>

      {/* Coverage Bar & Warning Banner (DEM-01 & DEM-04) */}
      <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs tabular-nums">
            <span className="text-slate-400">覆盖</span>{' '}
            <span className="font-bold text-cyan-400">41/64 格</span> ·{' '}
            <span className="font-bold text-cyan-400">64%</span>
          </div>

          <div className="w-36 h-2 bg-[#0A0E13] rounded-[2px] overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: '64%' }} />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-[4px] bg-amber-950/60 text-amber-300 border border-amber-800 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DS-10 上 T0855 有 3 格未覆盖 (将判为 I 态)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-[2px] bg-rose-500" />
            必须阻断 12
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-[2px] bg-cyan-500" />
            必须检测 9
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-[2px] bg-amber-500" />
            未覆盖 3
          </span>
        </div>
      </div>

      {/* Full Defense Expectation Matrix (DEM) Table (DEM-01) */}
      <div className="rounded-[4px] bg-[#111821] border border-[#223040] overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono border-collapse">
            <thead className="bg-[#0A0E13] border-b border-[#223040] select-none text-xs">
              <tr>
                <th className="py-2.5 px-3 min-w-[260px] text-slate-300 font-bold uppercase tracking-wider">
                  <div className="text-slate-100 text-xs font-sans">演练时间线与对抗载荷</div>
                  <div className="text-[10px] text-slate-400 font-normal">演练攻击步骤与对抗载荷 (16 步骤)</div>
                </th>
                {defenseSystems.map((ds) => (
                  <th
                    key={ds.id}
                    className="py-2 px-2 min-w-[85px] text-center border-l border-[#223040] align-top"
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
                    <div className="text-[9px] text-slate-400 mt-0.5 tabular-nums">
                      {ds.mode} {ds.latencyLimit}s
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#223040] text-slate-300">
              {phases.map((phaseCode) => {
                const phaseSteps = matrixStepsData.filter((s) => s.phaseCode === phaseCode);
                const phaseTitle = phaseSteps[0].phase;

                return (
                  <React.Fragment key={phaseCode}>
                    <tr className="bg-[#0A0E13]/90 text-cyan-400 font-bold text-xs">
                      <td colSpan={11} className="py-1.5 px-3 tracking-wider font-mono">
                        <span className="text-cyan-300">{phaseCode}</span>{' '}
                        <span className="text-slate-300 ml-1 font-sans font-normal">{phaseTitle}</span>
                      </td>
                    </tr>

                    {phaseSteps.map((step) => (
                      <tr key={step.id} className="hover:bg-slate-800/20 transition-colors h-7 table-row-28">
                        <td className="py-1 px-3 text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cyan-400 tabular-nums">{step.id}</span>
                            <span className="text-slate-300 font-semibold">{step.tech}</span>
                            <span className="px-1.5 py-0.2 rounded-[2px] bg-[#0A0E13] border border-[#223040] text-[9px] text-slate-400">
                              {step.variant}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{step.name}</div>
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
                              className={`py-0.5 px-1 text-center border-l border-[#223040] align-middle cursor-pointer transition-colors text-[13px] h-7 ${
                                isSelected ? 'bg-[#164e63]/40 border-cyan-500' : ''
                              }`}
                            >
                              {cell && cell.label !== '.' ? (
                                <div
                                  className={`py-0.5 px-1 rounded-[2px] text-[11px] font-bold border relative ${cell.bg} ${cell.text}`}
                                >
                                  {cell.isOverride && (
                                    <span
                                      className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400"
                                      title="人工 Override 覆盖"
                                    />
                                  )}
                                  <div>{cell.label}</div>
                                  {cell.sub && (
                                    <div className="text-[8px] text-slate-400 font-normal tabular-nums">
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

        {/* Selected Cell Detail Floating Card (DEM-02 & DEM-03) */}
        {selectedCell && (
          <div className="absolute right-6 bottom-16 w-80 p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#223040]">
              <span className="font-mono font-bold text-xs text-cyan-300 tabular-nums">
                {selectedCell.stepId} · {selectedCell.dsId}
              </span>
              <button
                onClick={() => setShowOverrideModal(true)}
                className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-cyan-300 border border-[#223040] font-mono"
              >
                人工覆盖 (Override) &gt;
              </button>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">期望等级:</span>
                <span className="text-rose-300 font-bold">
                  {cellMap[`${selectedCell.stepId}_${selectedCell.dsId}`]?.label || '未配置'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">部署模式:</span>
                <span className="text-cyan-300 font-semibold">
                  {defenseSystems.find((d) => d.id === selectedCell.dsId)?.mode || '串联'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">时延上限:</span>
                <span className="text-cyan-400 font-bold tabular-nums">5.0 秒</span>
              </div>
            </div>

            {currentOverride && (
              <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[10px] text-cyan-300 space-y-1">
                <div>
                  <strong>人工覆盖审计留痕:</strong> {currentOverride.reason}
                </div>
                <div className="text-slate-400 tabular-nums">
                  {currentOverride.overriddenBy} · {currentOverride.timestamp}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer (DEM-05 & Controls) */}
      <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowOverrideModal(true)}
            className="px-2.5 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300 font-mono text-[11px]"
          >
            设置期望...
          </button>
          <button
            onClick={() => setShowDiffModal(true)}
            className="px-2.5 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300 font-mono text-[11px] flex items-center gap-1"
          >
            <GitCompare className="w-3 h-3 text-cyan-400" />
            与 v1.3 对比 (DEM-05)
          </button>
          <button
            onClick={() => setSelectedCell(null)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-rose-950/60 text-rose-300 border border-rose-800 text-[11px]"
          >
            <Trash2 className="w-3 h-3" />
            <span>清空所选</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            已选 <span className="text-cyan-400 font-bold">9 格</span> · 必须阻断 6 · 必须检测 2
          </div>
          {hasChanges && (
            <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              存在未保存变更
            </span>
          )}
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 text-cyan-100 border border-cyan-500/50 font-semibold text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存草稿</span>
          </button>
        </div>
      </div>

      {/* DEM-02 Cell Override Modal */}
      {showOverrideModal && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleApplyOverride}
            className="w-full max-w-md bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold">
                单元格人工 Override 覆盖 (DEM-02)
              </div>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              当前目标：<strong className="text-cyan-300 font-mono tabular-nums">{selectedCell.stepId} · {selectedCell.dsId}</strong>
            </p>

            <div>
              <label className="block text-slate-400 mb-1">目标期望等级 *</label>
              <select
                value={overrideTargetExp}
                onChange={(e) => setOverrideTargetExp(e.target.value)}
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 font-mono outline-none focus:border-cyan-500"
              >
                <option value="MUST_BLOCK">必须阻断 (MUST_BLOCK)</option>
                <option value="MUST_DETECT">必须检测 (MUST_DETECT)</option>
                <option value="BLOCK_OR_DETECT">阻断或检测 (BLOCK_OR_DETECT)</option>
                <option value="OBSERVE_ONLY">仅观测 (OBSERVE_ONLY)</option>
                <option value="FORBIDDEN">禁止触发 (FORBIDDEN)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">覆盖理由阐述 (强制必填审计留痕) *</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="请输入经过技术评审的覆盖理由（例如：由于网闸旁路镜像端口策略限制，强制设定为必须阻断）..."
                rows={3}
                required
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#223040]">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 border border-cyan-500/50 text-cyan-100 font-medium"
              >
                登记并应用覆盖
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEM-04 G2 Integrity Modal */}
      {showG2Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                G2 DEM 完整性门禁核验结果 (VALIDATE_DEM)
              </div>
              <button onClick={() => setShowG2Modal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-3 rounded-[4px] bg-emerald-950/30 border border-emerald-800 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <div>
                  <strong>规则 1 通过</strong>: 8 个核心攻击步骤均已声明至少 1 个 必须阻断 或 必须检测 期望。
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-emerald-950/30 border border-emerald-800 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <div>
                  <strong>规则 2 通过</strong>: 负对照业务步 (S-005) 全部锁定为 <code>不得触发 (MUST_NOT_TRIGGER)</code>，无越界达成声明。
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-cyan-950/30 border border-cyan-800 text-cyan-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                <div>
                  <strong>规则 3 通过</strong>: 旁路部署系统 (DS-02, DS-05, DS-09) 已自动折算为 必须检测，无非法旁路+必须阻断组合。
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowG2Modal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-200 hover:bg-slate-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEM-05 Diff Modal */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                DEM 期望矩阵版本差异比对 (v1.4 草稿 vs v1.3 冻结基线)
              </div>
              <button onClick={() => setShowDiffModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <table className="w-full font-mono text-[13px] text-left border-collapse">
              <thead className="bg-[#0A0E13] text-slate-400 uppercase border-b border-[#223040]">
                <tr className="h-7 table-row-28">
                  <th className="p-2 font-sans text-xs">步骤 · 系统</th>
                  <th className="p-2 font-sans text-xs">v1.3 原值</th>
                  <th className="p-2 font-sans text-xs">v1.4 新值</th>
                  <th className="p-2 font-sans text-xs">变更理由 / 审计说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223040] text-slate-300">
                <tr className="h-7 table-row-28">
                  <td className="p-2 font-bold text-cyan-300 tabular-nums">S-012 · DS-07</td>
                  <td className="p-2 text-slate-400 line-through">必须检测</td>
                  <td className="p-2 text-rose-300 font-bold">必须阻断 (5.0s)</td>
                  <td className="p-2 text-slate-400 font-sans text-xs">现场专用网闸旁路端口已接入，调整为强阻断要求</td>
                </tr>
                <tr className="h-7 table-row-28">
                  <td className="p-2 font-bold text-cyan-300 tabular-nums">S-020 · DS-10</td>
                  <td className="p-2 text-slate-400 line-through">未覆盖</td>
                  <td className="p-2 text-amber-300 font-bold">必须阻断 (10.0s)</td>
                  <td className="p-2 text-slate-400 font-sans text-xs">物理网闸工控协议特征过滤规则库升级后补齐覆盖</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-200 hover:bg-slate-800"
              >
                关闭比对
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
