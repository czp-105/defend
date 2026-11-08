import React, { useState } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  Server,
  HardDrive,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Play,
  RotateCcw,
  Download,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { AuditLog, MetricPoint, ServerNode, WorkflowTask } from '../types';
import { calculateClusterHealth, computeMetricSummary, formatUptime } from '../utils/systemLogic';

interface DashboardViewProps {
  nodes: ServerNode[];
  workflows: WorkflowTask[];
  recentLogs: AuditLog[];
  metrics: MetricPoint[];
  onNavigate: (tab: any) => void;
  onTriggerDiagnosis: () => void;
  onTriggerBackup: () => void;
  onExportAuditCsv: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  nodes,
  workflows,
  recentLogs,
  metrics,
  onNavigate,
  onTriggerDiagnosis,
  onTriggerBackup,
  onExportAuditCsv,
}) => {
  const [activeChartMetric, setActiveChartMetric] = useState<'qps' | 'traffic' | 'cpu'>('qps');
  const [hoveredPoint, setHoveredPoint] = useState<MetricPoint | null>(null);

  const clusterHealth = calculateClusterHealth(nodes);
  const metricSummary = computeMetricSummary(nodes);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getMetricValue = (m: MetricPoint) => {
    if (activeChartMetric === 'qps') return m.qps;
    if (activeChartMetric === 'traffic') return m.traffic;
    return m.cpuAvg;
  };

  const values = metrics.map(getMetricValue);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal || 1;

  const points = metrics.map((m, idx) => {
    const x = paddingX + (idx / (metrics.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((getMetricValue(m) - minVal) / valRange) * (chartHeight - paddingY * 2);
    return { x, y, data: m };
  });

  const pathD = points.reduce((acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any node has warning or critical */}
      {clusterHealth.criticalCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-rose-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-semibold text-sm">检测到 {clusterHealth.criticalCount} 个关键节点处于异常告警状态</div>
              <p className="text-xs text-rose-300/80">华南1区数据库只读从库 prod-gz-db-replica-02 磁盘已满91%，已自动触发从库限流策略。</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('nodes')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors shrink-0"
          >
            立即排查节点
          </button>
        </div>
      )}

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">集群健康指数</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-100">{clusterHealth.healthScore}</span>
            <span className="text-xs text-slate-400">/ 100 分</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {clusterHealth.runningCount} 正常
            </span>
            {clusterHealth.warningCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {clusterHealth.warningCount} 告警
              </span>
            )}
            {clusterHealth.maintenanceCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {clusterHealth.maintenanceCount} 维护
              </span>
            )}
          </div>
        </div>

        {/* Card 2: QPS Throughput */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">全局实时 QPS 吞吐</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-100">
              {metricSummary.totalQps.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Req/s</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% 较昨日峰值</span>
            <span className="text-slate-500 font-normal">| 峰值 76.4k</span>
          </div>
        </div>

        {/* Card 3: Traffic & Network */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">网络出入带宽吞吐</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-100">920</span>
            <span className="text-xs text-slate-400">MB/s</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>平均延迟: 20.8 ms</span>
            <span className="text-emerald-400">99.99% 连通</span>
          </div>
        </div>

        {/* Card 4: Workflows Execution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">流水线与定时任务</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-100">99.8%</span>
            <span className="text-xs text-slate-400">今日成功率</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>5 条活跃管道</span>
            <span className="text-indigo-400 font-medium">1 正在运行</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Metric Graph */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>多维性能趋势走势</span>
                <span className="text-[11px] font-normal text-slate-400">最近 8 小时动态监控采样</span>
              </h2>
            </div>
            {/* Metric Switch Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartMetric('qps')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChartMetric === 'qps'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                QPS吞吐量
              </button>
              <button
                onClick={() => setActiveChartMetric('traffic')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChartMetric === 'traffic'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                网络流量 (MB/s)
              </button>
              <button
                onClick={() => setActiveChartMetric('cpu')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChartMetric === 'cpu'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CPU占用均值 (%)
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative mt-4 w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Fill */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Line Stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.time === pt.data.time ? '6' : '4'}
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all hover:r-6"
                  onMouseEnter={() => setHoveredPoint(pt.data)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip display */}
            <div className="h-8 flex items-center justify-between text-xs text-slate-400 px-2 mt-2">
              <div className="flex items-center gap-4">
                {metrics.map((m, idx) => (
                  <span key={idx} className="text-[11px] font-mono text-slate-400">
                    {m.time}
                  </span>
                ))}
              </div>
              {hoveredPoint && (
                <div className="p-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-3 shadow-lg">
                  <span className="font-semibold text-indigo-400">{hoveredPoint.time}</span>
                  <span>
                    {activeChartMetric === 'qps' && `${hoveredPoint.qps.toLocaleString()} QPS`}
                    {activeChartMetric === 'traffic' && `${hoveredPoint.traffic} MB/s`}
                    {activeChartMetric === 'cpu' && `${hoveredPoint.cpuAvg}% CPU`}
                  </span>
                  <span className="text-slate-400">延迟: {hoveredPoint.latency}ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar at Bottom */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 mt-2 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">集群CPU均值</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{metricSummary.avgCpu}%</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">集群内存均值</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{metricSummary.avgMem}%</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400">集群磁盘均值</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{metricSummary.avgDisk}%</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Control & Diagnostic Actions */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              运维管控快捷中心
            </h2>
            <div className="space-y-2">
              <button
                onClick={onTriggerDiagnosis}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all text-xs font-medium group"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>发起全链路集群体检</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  一键自检
                </span>
              </button>

              <button
                onClick={() => onNavigate('nodes')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>进入集群弹性伸缩</span>
                </div>
                <span className="text-slate-400 text-[11px]">6 节点在线</span>
              </button>

              <button
                onClick={onTriggerBackup}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>立即执行跨可用区冷备</span>
                </div>
                <span className="text-slate-400 text-[11px]">加密归档</span>
              </button>

              <button
                onClick={onExportAuditCsv}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>导出系统合规审计报告</span>
                </div>
                <span className="text-slate-400 text-[11px]">CSV文件</span>
              </button>
            </div>
          </div>

          {/* Regional Cluster Status Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              多地域可用区分布
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-200 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    华东1区 (上海·核心机房)
                  </span>
                  <span className="text-slate-400 font-mono">3 节点 · 99.99%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-200 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    华北2区 (北京·主干接入)
                  </span>
                  <span className="text-slate-400 font-mono">1 节点 · 100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-200 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    华南1区 (广州·同城灾备)
                  </span>
                  <span className="text-amber-400 font-mono">2 节点 · 告警处理中</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time System Audit Stream */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">近期关键运维轨迹与安全事件</h2>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>查看完整审计日志</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 border ${
                    log.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : log.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {log.severity}
                </span>
                <div>
                  <div className="font-medium text-slate-200">
                    <span className="font-semibold text-indigo-300">{log.operator}</span> 在{' '}
                    <span className="text-slate-300 font-mono">{log.module}</span> 执行了: {log.action}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                </div>
              </div>
              <div className="text-right shrink-0 text-slate-400 font-mono text-[11px] self-end sm:self-center">
                <div>{log.timestamp}</div>
                <div className="text-[10px] text-slate-500">{log.ipAddress} · {log.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
