import React from 'react';
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  GitBranch,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  UserCheck,
} from 'lucide-react';
import { NavItemKey, UserRole } from '../types';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  nodeCount: number;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  currentRole,
  onChangeRole,
  nodeCount,
  alertCount,
}) => {
  const navItems: { key: NavItemKey; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      key: 'dashboard',
      label: '监控总览',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      key: 'nodes',
      label: '云节点与集群',
      icon: <Server className="w-5 h-5 shrink-0" />,
      badge: nodeCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      key: 'rbac',
      label: '用户与权限 (RBAC)',
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
    },
    {
      key: 'workflows',
      label: '任务流与调度',
      icon: <GitBranch className="w-5 h-5 shrink-0" />,
      badge: '1 运行中',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    },
    {
      key: 'audit',
      label: '安全与审计日志',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      badge: alertCount > 0 ? `${alertCount} 告警` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      key: 'settings',
      label: '系统配置中心',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    super_admin: { title: '超级管理员', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    devops_lead: { title: 'DevOps负责人', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    secops: { title: '安全合规', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    system_operator: { title: '运维值班', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    analyst: { title: '数据分析', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  return (
    <aside
      className={`relative flex flex-col justify-between border-r border-slate-800 bg-slate-950 transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="font-bold text-slate-100 tracking-tight text-base flex items-center gap-1.5">
                  OmniFlow
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">企业智能管控平台</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? '展开导航侧栏' : '收起导航侧栏'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1" aria-label="主菜单导航">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 text-left truncate flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  当前模拟角色
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleLabels[currentRole].color}`}>
                  {roleLabels[currentRole].title}
                </span>
              </div>
              <select
                aria-label="选择模拟当前用户角色"
                value={currentRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="super_admin">超级管理员 (全部特权)</option>
                <option value="devops_lead">DevOps负责人 (集群/任务)</option>
                <option value="secops">安全合规工程师 (审计/防护)</option>
                <option value="system_operator">运维值班人员 (日常维护)</option>
                <option value="analyst">数据分析师 (只读查看)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="陈建国"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">陈建国 (Admin)</div>
                <div className="text-[11px] text-slate-400 truncate">上海核心机房·主控</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="陈建国"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-slate-950" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
