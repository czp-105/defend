import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface DiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFixIssues: () => void;
}

export const DiagnosisModal: React.FC<DiagnosisModalProps> = ({ isOpen, onClose, onFixIssues }) => {
  const [step, setStep] = useState<number>(1);
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsFixed(false);
      const t1 = setTimeout(() => setStep(2), 500);
      const t2 = setTimeout(() => setStep(3), 1100);
      const t3 = setTimeout(() => setStep(4), 1700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setIsFixed(true);
      onFixIssues();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-[4px] bg-[#111821] border border-[#223040] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#223040]">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-cyan-400" />
            全链路系统集群自动化体检报告
          </h3>
          <button onClick={onClose} aria-label="关闭体检窗口" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step >= 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              <span>全域各机房可用区网络连通与时延检测</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-emerald-400">平均延迟 18ms · 丢包率 0%</span>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step >= 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              <span>分布式数据库与主从复制延迟对账</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-emerald-400">复制延迟 0.04s · 强一致性</span>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              <span>全站 SSL/TLS 证书有效性与安全基线</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-emerald-400">有效剩余 284 天 · 符合等保三级</span>
          </div>

          {/* Step 4 */}
          <div
            className={`p-3 rounded-[4px] border flex items-center justify-between ${
              isFixed
                ? 'bg-[#0A0E13] border-[#223040] text-slate-200'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isFixed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step >= 4 ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              <span>计算节点热点负载与存储阈值排查</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums">
              {isFixed ? (
                <span className="text-emerald-400">已清理临时表空间并恢复健康</span>
              ) : step >= 4 ? (
                <span className="text-amber-400">发现 1 个节点磁盘使用率超过 90%</span>
              ) : (
                '诊断中...'
              )}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#223040] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isFixed ? '系统健康分已重置为 98 分 (极佳)' : '建议立即执行一键自动降载自愈'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[4px] bg-[#1a2332] hover:bg-[#223040] text-slate-300 text-xs font-medium"
            >
              关闭
            </button>
            {!isFixed && (
              <button
                onClick={handleFix}
                disabled={isFixing || step < 4}
                className="px-3 py-1.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>正在自愈优化中...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>一键自动修复与空间释放</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
