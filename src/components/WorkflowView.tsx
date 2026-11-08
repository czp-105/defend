import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Activity,
  Layers,
  Database,
  Shield,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { WorkflowStatus, WorkflowTask } from '../types';

interface WorkflowViewProps {
  workflows: WorkflowTask[];
  onTriggerRun: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onAddTask: (task: Partial<WorkflowTask>) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflows,
  onTriggerRun,
  onToggleStatus,
  onAddTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCron, setNewCron] = useState('0 */2 * * *');
  const [newCategory, setNewCategory] = useState<WorkflowTask['category']>('data_sync');
  const [newCluster, setNewCluster] = useState('华东1区 (上海) 核心生产集群');

  const filteredWorkflows = workflows.filter((w) => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.targetCluster.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categoryMap: Record<
    WorkflowTask['category'],
    { label: string; icon: React.ReactNode; color: string }
  > = {
    data_sync: {
      label: '实时数据同步',
      icon: <Database className="w-3.5 h-3.5 text-sky-400" />,
      color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    },
    backup: {
      label: '物理快照备份',
      icon: <Layers className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    security_scan: {
      label: '安全合规扫描',
      icon: <Shield className="w-3.5 h-3.5 text-rose-400" />,
      color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    },
    report: {
      label: '报表汇总分析',
      icon: <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    cleanup: {
      label: '冗余资源回收',
      icon: <Trash2 className="w-3.5 h-3.5 text-slate-400" />,
      color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim() || '自定义自动化作业流',
      cronExpr: newCron.trim() || '0 0 * * *',
      category: newCategory,
      status: 'active',
      lastRunTime: '未运行',
      lastRunDuration: '-',
      nextRunTime: '根据Cron计算中',
      successRate: 100.0,
      targetCluster: newCluster,
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">总编排任务数</span>
          <div className="text-2xl font-bold text-slate-100 mt-1">{workflows.length} 条</div>
          <span className="text-[11px] text-slate-500 mt-1 block">覆盖跨区同步与备份</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">今日执行成功率</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">99.85%</div>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">48 次无异常调用</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">平均执行耗时</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">42.6 秒</div>
          <span className="text-[11px] text-slate-500 mt-1 block">轻量并发分布式执行</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">调度器健康度</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">稳健</div>
          <span className="text-[11px] text-sky-400/80 mt-1 block">主备调度引擎双活</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="搜索工作流任务或目标集群"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索流水线名称、描述或目标集群..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            aria-label="筛选任务类型"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部分类 ({workflows.length})</option>
            <option value="data_sync">实时数据同步</option>
            <option value="backup">物理快照备份</option>
            <option value="security_scan">安全合规扫描</option>
            <option value="report">报表汇总分析</option>
            <option value="cleanup">冗余资源回收</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-end md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>新建自动化任务</span>
        </button>
      </div>

      {/* Workflows Cards List */}
      <div className="space-y-4">
        {filteredWorkflows.map((task) => {
          const cat = categoryMap[task.category];
          const isRunning = task.status === 'running';
          const isPaused = task.status === 'paused';

          return (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm space-y-4"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{task.title}</span>
                    <span
                      className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${cat.color}`}
                    >
                      {cat.icon}
                      {cat.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      Cron: {task.cronExpr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{task.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isPaused
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? '恢复调度' : '暂停调度'}</span>
                  </button>

                  <button
                    onClick={() => onTriggerRun(task.id)}
                    disabled={isRunning}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                      isRunning
                        ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? '任务执行中...' : '立即触发执行'}</span>
                  </button>
                </div>
              </div>

              {/* Progress bar if running */}
              {isRunning && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-indigo-300">
                    <span>作业管道运行中...</span>
                    <span>已完成 64%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '64%' }} />
                  </div>
                </div>
              )}

              {/* Stats footer row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">目标集群</span>
                  <span className="font-semibold text-slate-200 truncate block">{task.targetCluster}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">上次运行时间</span>
                  <span className="font-mono text-slate-300">{task.lastRunTime} ({task.lastRunDuration})</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">下次计划执行</span>
                  <span className="font-mono text-slate-300">{task.nextRunTime}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">历史成功率</span>
                  <span className="font-mono font-semibold text-emerald-400">{task.successRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                配置新自动化调度流水线
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                aria-label="关闭窗口"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">任务名称</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如: 核心订单数据每日增量对账作业"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">任务描述</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="简述该流水线执行逻辑、依赖与输出目标..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">业务分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="data_sync">实时数据同步</option>
                    <option value="backup">物理快照备份</option>
                    <option value="security_scan">安全合规扫描</option>
                    <option value="report">报表汇总分析</option>
                    <option value="cleanup">冗余资源回收</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">CRON 定时表达式</label>
                  <input
                    type="text"
                    required
                    value={newCron}
                    onChange={(e) => setNewCron(e.target.value)}
                    placeholder="0 2 * * *"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">目标执行集群</label>
                <input
                  type="text"
                  value={newCluster}
                  onChange={(e) => setNewCluster(e.target.value)}
                  placeholder="华东1区 (上海) 核心生产集群"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  确认编排并上线
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
