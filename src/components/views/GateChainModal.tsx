import React from 'react';
import { GateItem } from '../../types/cidtp';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface GateChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  gates: GateItem[];
  onTriggerCheckAll: () => void;
}

export const GateChainModal: React.FC<GateChainModalProps> = ({
  isOpen,
  onClose,
  gates,
  onTriggerCheckAll,
}) => {
  if (!isOpen) return null;

  const passedCount = gates.filter((g) => g.status === 'passed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#111821] border border-[#223040] rounded-[4px] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#223040] bg-[#111821]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                八级门禁阻断链全景看板 (GATE CHECKS G1 ~ G8)
                <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
                  {passedCount} / {gates.length} 项通过
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                设计约束 3：门禁先于运行 · 校验 → DEM 完整性 → 阳性探针 → 隔离/时钟 → 运行 → 证据 → 评分 → 签字逐级阻断
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] hover:bg-[#1a2332] text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="px-6 py-3 bg-[#0A0E13] border-b border-[#223040] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">当前阻断判定:</span>
            {gates.some((g) => g.status === 'failed') ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/40 px-2.5 py-1 rounded-[4px] border border-rose-500/40">
                <ShieldAlert className="w-4 h-4" />
                存在关键阻断项 (G3 阳性探针未过) — 禁止产出系统级有效结论
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-[4px] border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
                前序门禁检验达标 · 准许安全推演
              </span>
            )}
          </div>

          <button
            onClick={onTriggerCheckAll}
            className="px-3 py-1.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-medium transition-all"
          >
            重新评估全链门禁
          </button>
        </div>

        {/* Gates List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {gates.map((gate, idx) => {
            const statusConfig = {
              passed: {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
                border: 'border-emerald-500/30 bg-emerald-950/10',
                badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                text: '已通过 (PASSED)',
              },
              failed: {
                icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />,
                border: 'border-rose-500/50 bg-rose-950/20',
                badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
                text: '阻断未通过 (BLOCKED)',
              },
              warning: {
                icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
                border: 'border-amber-500/30 bg-amber-950/10',
                badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                text: '警告保留 (WARNING)',
              },
              pending: {
                icon: <Clock className="w-5 h-5 text-slate-500 shrink-0" />,
                border: 'border-[#223040] bg-[#0A0E13]',
                badge: 'bg-slate-800 text-slate-400 border-[#223040]',
                text: '待触发 (PENDING)',
              },
            }[gate.status];

            return (
              <div
                key={gate.id}
                className={`p-4 rounded-[4px] border ${statusConfig.border} transition-all flex items-start gap-4`}
              >
                <div className="flex flex-col items-center gap-1 min-w-[56px]">
                  <span className="text-base font-bold font-mono text-cyan-300">{gate.id}</span>
                  <span className="text-[10px] text-slate-500 font-mono">阶段 {idx + 1}</span>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusConfig.icon}
                      <h4 className="text-sm font-bold text-slate-100">{gate.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">[{gate.stage}]</span>
                    </div>

                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-[4px] border font-semibold ${statusConfig.badge}`}
                    >
                      {statusConfig.text}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400">核验规则:</strong> {gate.rule}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-cyan-400 font-mono">
                      <strong>当前状态实测:</strong> {gate.detail}
                    </span>
                    <span className="text-rose-400 font-mono">
                      <strong>阻断行为:</strong> {gate.failureAction}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
