import React from 'react';
import {
  ShieldAlert,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  Lock,
  Wifi,
  FileCode,
  Grid,
  Activity,
  Layers,
  Scale,
  TrendingDown,
} from 'lucide-react';

export type CidtpTab = 'overview' | 'scenario' | 'matrix' | 'realtime' | 'arbitration' | 'attribution';

interface CidtpHeaderProps {
  currentTab: CidtpTab;
  onSelectTab: (tab: CidtpTab) => void;
  campaignCode: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onAbortCampaign: () => void;
  showInvalidBanner: boolean;
  onDismissBanner: () => void;
}

export const CidtpHeader: React.FC<CidtpHeaderProps> = ({
  currentTab,
  onSelectTab,
  campaignCode,
  isPaused,
  onTogglePause,
  onAbortCampaign,
  showInvalidBanner,
  onDismissBanner,
}) => {
  const tabs: { key: CidtpTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '大盘监控', icon: <Activity className="w-3.5 h-3.5" /> },
    { key: 'scenario', label: '场景编排', icon: <FileCode className="w-3.5 h-3.5" /> },
    { key: 'matrix', label: '载荷矩阵 (DEM)', icon: <Grid className="w-3.5 h-3.5" /> },
    { key: 'realtime', label: '实时推演', icon: <Wifi className="w-3.5 h-3.5" /> },
    { key: 'arbitration', label: '裁判复核', icon: <Scale className="w-3.5 h-3.5" /> },
    { key: 'attribution', label: '归因与指标', icon: <TrendingDown className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#070b13] border-b border-slate-800/90 text-slate-200 select-none">
      {/* Top Main Navigation Bar */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Left: Brand & Campaign Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              关基
            </span>
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase hidden sm:inline">
              CIDTP // CONSOLE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden lg:inline">测试活动 /</span>
            <span className="font-mono font-bold text-cyan-300">{campaignCode}</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isPaused ? '已暂停' : '运行中 02:41:18'}
            </span>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0d1424] p-1 rounded-xl border border-slate-800 text-xs">
          {tabs.map((t) => {
            const isActive = currentTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onSelectTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(8,145,178,0.4)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Security Telemetry & Operator Controls */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              保真度 L3 硬件在环
            </span>
            <span>·</span>
            <span className="truncate max-w-[140px] text-slate-400" title="sha256:9f3a41c7849e...">
              清单 sha256:9f3a4...
            </span>
            <span>·</span>
            <span className="text-emerald-400">PTP ±3ms</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
            <Lock className="w-3 h-3 text-cyan-400" />
            出站守卫 已强制 (DROP)
          </span>

          <button
            onClick={onTogglePause}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-xs"
            title={isPaused ? '恢复演练' : '暂停推演'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            onClick={onAbortCampaign}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/50 text-[11px] font-semibold transition-colors"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>中止推演</span>
          </button>

          <div className="flex items-center gap-1.5 pl-1 text-[11px] font-mono font-semibold text-slate-400">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              OP
            </span>
            <span className="hidden md:inline">OP-7049</span>
          </div>
        </div>
      </div>

      {/* Warning Notification Banner from Image 1 */}
      {showInvalidBanner && (
        <div className="bg-[#180a0f] border-t border-b border-rose-900/60 px-4 py-2 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="font-semibold text-rose-200">
              ◎ 本轮标记为无效 — DS-09 阳性探针未通过（旁路可见性失效），将不产出系统级结论。
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80">
              AUDIT_FLAG: INVALID_RUN_ABORTED_VERDICT
            </span>
            <button
              onClick={onDismissBanner}
              className="text-rose-400 hover:text-rose-200 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
