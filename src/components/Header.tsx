import React, { useState } from 'react';
import {
  Search,
  Bell,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { NavItemKey } from '../types';

interface HeaderProps {
  currentTab: NavItemKey;
  onOpenQuickSearch: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  healthStatus: 'healthy' | 'degraded' | 'critical';
  healthScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenQuickSearch,
  onRefreshData,
  isRefreshing,
  healthStatus,
  healthScore,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '高载预警：prod-sh-redis-cluster-03',
      desc: 'CPU与内存连续15分钟超过85%，建议触发动态缓存扩容',
      time: '3分钟前',
      type: 'warning',
      read: false,
    },
    {
      id: 2,
      title: '数据库异地双活全量校验成功',
      desc: '上海与广州集群48万条事务哈希对账100%一致',
      time: '24分钟前',
      type: 'success',
      read: false,
    },
    {
      id: 3,
      title: '安全拦截：境外Tor出口暴力尝试',
      desc: '源IP 185.220.101.5 已经被WAF黑名单自动封锁24小时',
      time: '1小时前',
      type: 'danger',
      read: true,
    },
  ]);

  const titles: Record<NavItemKey, { title: string; subtitle: string }> = {
    dashboard: { title: '平台全局监控总览', subtitle: '实时掌控基础设施拓扑、QPS吞吐吞量与关键性能指标' },
    nodes: { title: '云节点与分布式集群', subtitle: '多地域高可用节点监控、副本调度与容器实例管理' },
    rbac: { title: '用户与权限控制 (RBAC)', subtitle: '多部门用户管理与细粒度角色访问控制策略矩阵' },
    workflows: { title: '任务流与调度中心', subtitle: '自动化批处理流水线、CRON定时作业与数据同步任务' },
    audit: { title: '安全合规与操作审计', subtitle: '全域安全风险检测、操作轨迹追踪与合规审计报表导出' },
    settings: { title: '系统配置中心', subtitle: '安全基线策略、双因素认证、告警通知网络钩子与全局参数' },
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const statusMap = {
    healthy: { text: '健康正常', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    degraded: { text: '性能降级', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    critical: { text: '严重异常', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {titles[currentTab].title}
          <span className="hidden md:inline-block text-xs font-normal text-slate-400">
            — {titles[currentTab].subtitle}
          </span>
        </h1>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-3">
        {/* Quick Search Button */}
        <button
          onClick={onOpenQuickSearch}
          aria-label="快速检索资源 (快捷键 Command K)"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>快速检索资源或命令...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* System Health Badge */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusMap[healthStatus].color}`}
          title={`系统整体健康分: ${healthScore}/100`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>健康度 {healthScore}分 · {statusMap[healthStatus].text}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefreshData}
          aria-label="刷新实时监控数据"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="刷新最新遥测数据"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="查看系统通知与告警"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-100">系统事件与告警</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {unreadCount} 未读
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      全部已读
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    aria-label="关闭通知弹窗"
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto mt-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`py-3 px-1 transition-colors ${
                      !item.read ? 'bg-indigo-950/20 rounded-lg' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {item.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : item.type === 'danger' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{item.title}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
