import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCode,
  Layers,
  Wifi,
  Scale,
  TrendingDown,
  Award,
  Server,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCheck,
  Radio,
  Zap,
  FolderKanban,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { CidtpTab } from './CidtpHeader';
import { Activity, UserProfile } from '../types/cidtp';

interface CidtpSidebarProps {
  currentTab: CidtpTab;
  onSelectTab: (tab: CidtpTab) => void;
  campaignCode: string;
  activities: Activity[];
  onSelectActivity: (code: string) => void;
  onOpenActivityModal: () => void;
  onOpenGateModal: () => void;
  onOpenAuditModal: () => void;
  gatePassedCount: number;
  totalGateCount: number;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const CidtpSidebar: React.FC<CidtpSidebarProps> = ({
  currentTab,
  onSelectTab,
  campaignCode,
  activities,
  onSelectActivity,
  onOpenActivityModal,
  onOpenGateModal,
  onOpenAuditModal,
  gatePassedCount,
  totalGateCount,
  currentUser,
  allUsers,
  onSwitchUser,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showActDropdown, setShowActDropdown] = useState(false);

  const currentAct = activities.find((a) => a.code === campaignCode) || activities[0];

  const roleNames: Record<string, string> = {
    author: '测试作者',
    admin: '安全主管',
    operator: '现场操作员',
    auditor: '独立审计员',
    judge: '仲裁裁判',
  };

  const navGroups: {
    groupTitle: string;
    items: {
      key: CidtpTab;
      label: string;
      code: string;
      icon: React.ReactNode;
      badge?: string;
    }[];
  }[] = [
    {
      groupTitle: '核心攻防推演',
      items: [
        {
          key: 'overview',
          label: '大盘监控',
          code: 'OVERVIEW',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
          badge: '3任务',
        },
        {
          key: 'scenario',
          label: '场景编排',
          code: 'SCN-01~07',
          icon: <FileCode className="w-4 h-4 shrink-0" />,
          badge: '拓扑图',
        },
        {
          key: 'matrix',
          label: '载荷矩阵 (DEM)',
          code: 'DEM-01~05',
          icon: <Layers className="w-4 h-4 shrink-0" />,
          badge: '10×N',
        },
        {
          key: 'realtime',
          label: '实时推演',
          code: 'RUN-01~08',
          icon: <Wifi className="w-4 h-4 shrink-0" />,
          badge: '推演中',
        },
      ],
    },
    {
      groupTitle: '裁判复核与仲裁',
      items: [
        {
          key: 'arbitration',
          label: '裁判复核 (E/R/O)',
          code: 'EVD-01~05',
          icon: <Scale className="w-4 h-4 shrink-0" />,
          badge: '六态',
        },
        {
          key: 'attribution',
          label: '归因与系统指标',
          code: 'ATT-01~05',
          icon: <TrendingDown className="w-4 h-4 shrink-0" />,
          badge: '根因分析',
        },
      ],
    },
    {
      groupTitle: '效能评估与环境',
      items: [
        {
          key: 'reports',
          label: '评分卡与报告',
          code: 'RPT-01~06',
          icon: <Award className="w-4 h-4 shrink-0" />,
          badge: '3张卡',
        },
        {
          key: 'environment',
          label: '靶场基线与拓扑',
          code: 'ENV-01~05',
          icon: <Server className="w-4 h-4 shrink-0" />,
          badge: '10套系统',
        },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-[#111821] border-r border-[#223040] flex flex-col justify-between select-none shrink-0 transition-all duration-200 z-40 font-sans ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Brand & Collapse Button */}
      <div
        className={`h-12 border-b border-[#223040] bg-[#111821] shrink-0 flex items-center ${
          isCollapsed ? 'justify-center px-1.5' : 'justify-between px-2.5'
        }`}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="px-1.5 py-0.5 rounded-[4px] text-[11px] font-bold font-mono tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/80 shrink-0 whitespace-nowrap">
                关基
              </span>
              <div className="truncate">
                <div className="text-[11px] font-bold tracking-wider text-slate-100">
                  关基平台 // 控制台
                </div>
                <div className="text-[9px] font-mono text-cyan-400/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>实时监控活跃</span>
                </div>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-[#223040] transition-colors shrink-0"
              title="收起侧边栏"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 flex items-center justify-center rounded-[4px] bg-[#0A0E13] hover:bg-[#164e63] border border-[#223040] hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-200 transition-colors shrink-0"
            title="点击展开侧边栏"
            aria-label="展开侧边栏"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Middle Container: Activities, Navigation, Gates, Audit */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 space-y-2">
        {/* Active Activity Selector Card (ACT-05) */}
        {!isCollapsed ? (
          <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040]">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400" />
                当前演练活动 (ACT)
              </span>
              <button
                onClick={onOpenActivityModal}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-0.5"
                title="打开活动治理中心 (ACT-01~05)"
              >
                <span>管理</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Quick Activity Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowActDropdown(!showActDropdown)}
                className="w-full text-left p-1.5 rounded-[4px] bg-[#111821] hover:bg-slate-800 border border-[#223040] flex items-center justify-between transition-colors"
              >
                <div className="truncate">
                  <div className="text-[11px] font-mono font-bold text-cyan-300 truncate">
                    {campaignCode}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {currentAct?.name}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
              </button>

              {showActDropdown && (
                <div className="absolute left-0 mt-1 w-full rounded-[4px] bg-[#111821] border border-[#223040] p-1.5 z-50 text-xs">
                  <div className="text-[10px] text-slate-400 px-2 py-1 font-mono uppercase border-b border-[#223040] flex justify-between items-center">
                    <span>快速切换活动</span>
                    <button
                      onClick={() => {
                        setShowActDropdown(false);
                        onOpenActivityModal();
                      }}
                      className="text-cyan-400 hover:underline"
                    >
                      治理工作台
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1 my-1">
                    {activities.map((act) => (
                      <div
                        key={act.code}
                        onClick={() => {
                          onSelectActivity(act.code);
                          setShowActDropdown(false);
                        }}
                        className={`p-1.5 rounded-[4px] cursor-pointer transition-colors flex items-center justify-between ${
                          act.code === campaignCode
                            ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="truncate mr-1">
                          <div className="font-mono text-xs">{act.code}</div>
                          <div className="text-[10px] text-slate-400 truncate">{act.name}</div>
                        </div>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded-[2px] bg-[#0A0E13] text-slate-400 shrink-0">
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sub-info Badges */}
            <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-[#223040] pt-1">
              <span className="truncate mr-1">{currentAct?.businessClass} · {currentAct?.fidelity}</span>
              <span className="text-amber-400 shrink-0 tabular-nums">
                {currentAct?.runCount || 3}/5次
              </span>
            </div>
          </div>
        ) : (
          /* Collapsed Quick Icon */
          <div className="flex justify-center">
            <button
              onClick={onOpenActivityModal}
              className="w-9 h-9 flex items-center justify-center rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-cyan-400 transition-colors"
              title={`当前活动: ${campaignCode} (点击打开活动治理中心)`}
            >
              <FolderKanban className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Groups */}
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!isCollapsed && (
              <div className="px-2 pt-1 pb-0.5 text-[9px] font-mono font-semibold tracking-wider text-slate-400">
                {group.groupTitle}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key)}
                    title={isCollapsed ? `${item.label} (${item.code})` : undefined}
                    className={`w-full flex items-center rounded-[4px] text-xs font-medium transition-all ${
                      isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2 py-1.5'
                    } ${
                      isActive
                        ? 'bg-[#164e63] text-cyan-200 font-semibold border border-cyan-500/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0A0E13] border border-transparent'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 truncate'}`}>
                      <span className={isActive ? 'text-cyan-200' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate text-xs">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded-[2px] tabular-nums ${
                          isActive
                            ? 'bg-cyan-950 text-cyan-200 border border-cyan-700/50'
                            : 'bg-[#0A0E13] text-slate-400 border border-[#223040]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Gate Chain & Audit Stream Actions */}
        <div className="pt-1.5 border-t border-[#223040] space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-0.5 text-[9px] font-mono font-semibold tracking-wider text-slate-400">
              门禁与合规留痕
            </div>
          )}

          {/* G1~G8 Gate Chain Button */}
          <button
            onClick={onOpenGateModal}
            className={`w-full flex items-center rounded-[4px] text-xs font-medium bg-[#0A0E13] hover:bg-slate-800 text-slate-300 border border-[#223040] transition-colors ${
              isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2 py-1.5'
            }`}
            title="查看 G1~G8 八级门禁阻断链全景看板"
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {!isCollapsed && <span className="text-xs">八级门禁 (G1~G8)</span>}
            </div>
            {!isCollapsed && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-[2px] font-bold tabular-nums ${
                  gatePassedCount === totalGateCount
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {gatePassedCount}/{totalGateCount}
              </span>
            )}
          </button>

          {/* GEN-02 Append-only Audit Stream Button */}
          <button
            onClick={onOpenAuditModal}
            className={`w-full flex items-center rounded-[4px] text-xs font-medium bg-[#0A0E13] hover:bg-slate-800 text-slate-300 border border-[#223040] transition-colors ${
              isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2 py-1.5'
            }`}
            title="不可篡改追加式操作审计日志 (GEN-02)"
          >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
              <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {!isCollapsed && <span className="text-xs">审计流水 (GEN-02)</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded-[2px] bg-[#111821] text-slate-400 border border-[#223040]">
                SHA-256
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Footer: Telemetry & User Role Switcher (GEN-01 职责分离) */}
      <div className="p-1.5 border-t border-[#223040] bg-[#111821] shrink-0 space-y-1.5">
        {/* Telemetry Status */}
        {!isCollapsed && (
          <div className="p-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[9px] font-mono text-slate-400 space-y-0.5">
            <div className="flex items-center justify-between">
              <span>探针总线状态</span>
              <span className="text-emerald-400 font-bold tabular-nums">99.98%</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="tabular-nums">事件: 48,290/s</span>
              <span className="text-cyan-400">同步: 正常</span>
            </div>
          </div>
        )}

        {/* User Role Switcher Drawer */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`w-full flex items-center p-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-xs transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title={`当前操作人: ${currentUser.name} (${roleNames[currentUser.role] || currentUser.role})`}
          >
            <div className={`flex items-center truncate ${isCollapsed ? 'justify-center' : 'gap-1.5'}`}>
              <span className="w-6 h-6 rounded-[2px] bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 text-[10px] font-bold shrink-0">
                {currentUser.name[0]}
              </span>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="text-[11px] text-slate-200 truncate">{currentUser.name}</div>
                  <div className="text-[9px] font-mono text-amber-400">
                    {roleNames[currentUser.role] || currentUser.role}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />}
          </button>

          {showUserDropdown && (
            <div className="absolute bottom-full left-0 mb-1 w-64 rounded-[4px] bg-[#111821] border border-[#223040] p-2 z-50 text-xs">
              <div className="text-[10px] text-slate-400 px-2 py-1 font-mono border-b border-[#223040]">
                切换操作员角色 (GEN-01 职责分离)
              </div>
              <div className="space-y-1 my-1 max-h-48 overflow-y-auto">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`p-2 rounded-[4px] cursor-pointer transition-colors flex items-center justify-between ${
                      u.id === currentUser.id
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.org}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#0A0E13] text-amber-400">
                      {roleNames[u.role] || u.role}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[10px] text-slate-400 leading-normal">
                ⚠️ 职责分离约束：测试作者不得审批自己创建的活动；异议提出人与改判审批人必须分离。
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
