import React from 'react';
import {
  ShieldAlert,
  Clock,
  Play,
  AlertTriangle,
  Lock,
  Wifi,
  FileCode,
  Layers,
  Scale,
  TrendingDown,
  Award,
  Server,
  AlertCircle,
  Menu,
  Activity as ActivityIcon,
} from 'lucide-react';
import { Activity, UserProfile } from '../types/cidtp';

export type CidtpTab =
  | 'overview'
  | 'scenario'
  | 'matrix'
  | 'realtime'
  | 'arbitration'
  | 'attribution'
  | 'reports'
  | 'environment';

export interface CidtpHeaderProps {
  currentTab: CidtpTab;
  campaignCode: string;
  currentActivity?: Activity;
  isPaused: boolean;
  onTogglePause: () => void;
  onAbortCampaign: () => void;
  showInvalidBanner: boolean;
  onDismissBanner: () => void;
  currentUser: UserProfile;
  onToggleSidebar?: () => void;
}

export const CidtpHeader: React.FC<CidtpHeaderProps> = ({
  currentTab,
  campaignCode,
  currentActivity,
  isPaused,
  onTogglePause,
  onAbortCampaign,
  showInvalidBanner,
  onDismissBanner,
  currentUser,
  onToggleSidebar,
}) => {
  const tabTitles: Record<CidtpTab, { title: string; subtitle: string }> = {
    overview: { title: '大盘监控与战术矩阵', subtitle: '攻防态势总览与阶段映射' },
    scenario: { title: '场景编排与依赖拓扑', subtitle: '编排工作台 (SCN-01~07)' },
    matrix: { title: '防御期望矩阵 (DEM)', subtitle: '防御期望映射 (DEM-01~05)' },
    realtime: { title: '实时攻防推演控制台', subtitle: '推演执行看板 (RUN-01~08)' },
    arbitration: { title: '裁判审计与六态复核', subtitle: '裁判复核仲裁 (EVD-01~05)' },
    attribution: { title: '因果归因与系统指标', subtitle: '归因分析与系统指标 (ATT-01~05)' },
    reports: { title: '评分卡与报告发布中心', subtitle: '效能评估报告 (RPT-01~06)' },
    environment: { title: '靶场基线与推导拓扑', subtitle: '环境基线与网络拓扑 (ENV-01~05)' },
  };

  const roleNames: Record<string, string> = {
    author: '测试作者',
    admin: '安全主管',
    operator: '现场操作员',
    auditor: '独立审计员',
    judge: '仲裁裁判',
  };

  const currentTabMeta = tabTitles[currentTab] || tabTitles.overview;

  return (
    <header className="sticky top-0 z-30 bg-[#111821] border-b border-[#223040] text-slate-200 select-none shrink-0 font-sans">
      {/* Top Main Navigation / Status Bar */}
      <div className="h-14 px-6 flex items-center justify-between gap-3">
        {/* Left: Breadcrumbs & Current Tab Header */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-400 hover:text-white transition-colors"
              title="切换侧边栏展开/收起"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-bold shrink-0">
              {campaignCode}
            </span>
            <div className="hidden sm:flex flex-col truncate">
              <span className="text-xs font-bold text-slate-100 truncate">
                {currentTabMeta.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {currentTabMeta.subtitle}
              </span>
            </div>
          </div>

          <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {isPaused ? '已暂停' : '推演进行中 02:41:18'}
          </span>
        </div>

        {/* Right: Security Telemetry, Clock, Egress Guard & Push Buttons */}
        <div className="flex items-center gap-2.5 text-xs shrink-0">
          {/* PTP Clock Offset */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#0A0E13] border border-[#223040] font-mono text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>时钟同步 PTP ±3ms</span>
          </div>

          {/* Egress Guard Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#0A0E13] border border-[#223040] font-mono text-[11px] text-emerald-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>出站守卫: 强制丢弃</span>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-slate-300 border border-[#223040] text-xs transition-colors"
            title={isPaused ? '恢复演练' : '暂停推演'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline text-[11px]">恢复</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">暂停</span>
              </>
            )}
          </button>

          {/* Abort Button (RUN-02) */}
          <button
            onClick={onAbortCampaign}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-semibold transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>中止推演</span>
          </button>

          {/* Current User Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[11px] font-mono">
            <span className="w-4 h-4 rounded-[2px] bg-cyan-950 text-cyan-300 flex items-center justify-center font-bold text-[9px]">
              {currentUser.name[0]}
            </span>
            <span className="text-slate-300 truncate max-w-[100px]">{currentUser.name}</span>
            <span className="text-amber-400 font-bold text-[9px]">
              {roleNames[currentUser.role] || currentUser.role}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Notification Banner from Image 1 */}
      {showInvalidBanner && (
        <div className="bg-[#180a0f] border-t border-b border-rose-900/60 px-6 py-2 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="font-semibold text-rose-200">
              ◎ 本轮标记为无效 — DS-09 阳性探针未通过（旁路可见性失效），将不产出系统级结论。
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-[4px] bg-rose-950/80 text-rose-400 border border-rose-800/80">
              审计标记: 无效运行已中止结论
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

      {/* Section 0 Constraint 4: Persistent Single-Run Warning Banner */}
      <div className="bg-[#111821] border-b border-[#223040] px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2 truncate">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            <strong className="text-amber-300">单次运行不作结论 (设计假设 A5)</strong>:
            每组配置必须重复验证 <strong className="text-slate-200">≥5 次</strong> 并计算 Wilson 95% 置信区间方可沉淀系统级结论。当前：
            <span className="text-cyan-300 font-bold ml-1">第 {currentActivity?.runCount || 3} 次 / 共 5 次重复</span>
            <span className="ml-1 text-slate-500 hidden sm:inline">
              {(currentActivity?.runCount || 3) < 5 ? '(未满5次，报告自动降级为案例观察)' : '(已达标)'}
            </span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-500 text-[10px] shrink-0">
          <span>判定引擎: judge.py (只读确定性)</span>
          <span>·</span>
          <span>执行模式: 串行同步落盘 (实时流为二期仿真)</span>
        </div>
      </div>
    </header>
  );
};
