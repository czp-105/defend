import React, { useState } from 'react';
import {
  Server,
  Terminal,
  Sliders,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Tag,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { NodeStatus, ServerNode, UserRole } from '../types';
import { evaluateNodeAlerts, formatUptime } from '../utils/systemLogic';

interface NodeManagementViewProps {
  nodes: ServerNode[];
  currentRole: UserRole;
  onScaleNode: (nodeId: string, newReplicas: number) => void;
  onRestartNode: (nodeId: string) => void;
  onToggleMaintenance: (nodeId: string) => void;
  onOpenTerminal: (node: ServerNode) => void;
  onAddNode: (node: Partial<ServerNode>) => void;
}

export const NodeManagementView: React.FC<NodeManagementViewProps> = ({
  nodes,
  currentRole,
  onScaleNode,
  onRestartNode,
  onToggleMaintenance,
  onOpenTerminal,
  onAddNode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Scale Modal State
  const [scalingNode, setScalingNode] = useState<ServerNode | null>(null);
  const [replicaInput, setReplicaInput] = useState<number>(3);

  // Add Node Modal State
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCluster, setNewNodeCluster] = useState('华东1区 (上海) 核心生产集群');
  const [newNodeIp, setNewNodeIp] = useState('10.120.14.');
  const [newNodeTag, setNewNodeTag] = useState('Worker, Prod');

  const clusters = Array.from(new Set(nodes.map((n) => n.cluster)));

  const filteredNodes = nodes.filter((n) => {
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    if (selectedCluster !== 'all' && n.cluster !== selectedCluster) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = n.name.toLowerCase().includes(q);
      const matchIp = n.ip.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchIp || matchTags;
    }
    return true;
  });

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            正常运行
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            性能告警
          </span>
        );
      case 'critical':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            紧急故障
          </span>
        );
      case 'maintenance':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            隔离维护
          </span>
        );
    }
  };

  const getUsageColor = (pct: number) => {
    if (pct >= 85) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  const handleOpenScale = (node: ServerNode) => {
    setScalingNode(node);
    setReplicaInput(node.replicas);
  };

  const handleConfirmScale = () => {
    if (scalingNode) {
      onScaleNode(scalingNode.id, replicaInput);
      setScalingNode(null);
    }
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    onAddNode({
      name: newNodeName.trim(),
      cluster: newNodeCluster,
      ip: newNodeIp.trim() || '10.120.15.88',
      region: newNodeCluster.includes('上海') ? 'cn-east-shanghai' : 'cn-north-beijing',
      status: 'running',
      cpuUsage: 25,
      memUsage: 35,
      diskUsage: 20,
      qps: 1500,
      uptimeHours: 1,
      version: 'k8s-v1.31.1',
      replicas: 2,
      tags: newNodeTag.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNewNodeName('');
    setIsAddNodeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Control Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="搜索节点名称、IP或标签"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索节点名称、IP地址或标签..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Cluster filter */}
          <select
            aria-label="筛选集群地域"
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全地域所有集群</option>
            {clusters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            aria-label="筛选节点运行状态"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部运行状态 ({nodes.length})</option>
            <option value="running">正常运行</option>
            <option value="warning">性能告警</option>
            <option value="critical">严重故障</option>
            <option value="maintenance">维护隔离</option>
          </select>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              卡片网格
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              列表表格
            </button>
          </div>

          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>接入新节点</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredNodes.map((node) => {
            const alerts = evaluateNodeAlerts(node);
            return (
              <div
                key={node.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-indigo-400 shrink-0" />
                        <h3 className="text-sm font-bold text-slate-100 font-mono truncate">{node.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span className="font-mono">{node.ip}</span>
                        <span>·</span>
                        <span>{node.cluster.split(' ')[0]}</span>
                      </div>
                    </div>
                    {getStatusBadge(node.status)}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {node.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 font-mono border border-indigo-500/20">
                      {node.version}
                    </span>
                  </div>

                  {/* Metric Gauges */}
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-800/80">
                    {/* CPU */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-slate-400" /> CPU 负载
                        </span>
                        <span className="font-mono font-semibold text-slate-200">{node.cpuUsage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getUsageColor(node.cpuUsage)}`}
                          style={{ width: `${node.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-slate-400" /> 内存占用
                        </span>
                        <span className="font-mono font-semibold text-slate-200">{node.memUsage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getUsageColor(node.memUsage)}`}
                          style={{ width: `${node.memUsage}%` }}
                        />
                      </div>
                    </div>

                    {/* Disk */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" /> 磁盘使用
                        </span>
                        <span className="font-mono font-semibold text-slate-200">{node.diskUsage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getUsageColor(node.diskUsage)}`}
                          style={{ width: `${node.diskUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Warnings if any */}
                  {alerts.length > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 space-y-0.5">
                      {alerts.map((alt, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">实时 QPS</span>
                      <span className="font-mono font-semibold text-slate-200">{node.qps}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">实例副本数</span>
                      <span className="font-mono font-semibold text-indigo-400">{node.replicas} 副本</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">连续运行</span>
                      <span className="font-mono font-medium text-slate-300">{formatUptime(node.uptimeHours)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => onOpenTerminal(node)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-colors"
                    title="打开节点终端控制台"
                  >
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>控制台</span>
                  </button>

                  <button
                    onClick={() => handleOpenScale(node)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-colors"
                    title="调整Pod容器副本数"
                  >
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>伸缩</span>
                  </button>

                  <button
                    onClick={() => onRestartNode(node.id)}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium transition-colors"
                    title="安全重启该节点服务"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>重启</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">节点名称与IP</th>
                  <th className="py-3 px-4">所属集群</th>
                  <th className="py-3 px-4">运行状态</th>
                  <th className="py-3 px-4">CPU使用率</th>
                  <th className="py-3 px-4">内存占用</th>
                  <th className="py-3 px-4">磁盘使用</th>
                  <th className="py-3 px-4">QPS</th>
                  <th className="py-3 px-4">副本数</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredNodes.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-slate-100">{n.name}</div>
                      <div className="text-[11px] text-slate-400">{n.ip}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{n.cluster}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(n.status)}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={n.cpuUsage >= 85 ? 'text-rose-400 font-bold' : ''}>
                        {n.cpuUsage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={n.memUsage >= 85 ? 'text-rose-400 font-bold' : ''}>
                        {n.memUsage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={n.diskUsage >= 90 ? 'text-rose-400 font-bold' : ''}>
                        {n.diskUsage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{n.qps}</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-semibold">{n.replicas}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenTerminal(n)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                          title="控制台"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenScale(n)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                          title="弹性伸缩"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRestartNode(n.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                          title="重启节点"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scale Replicas Modal */}
      {scalingNode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                弹性伸缩节点副本
              </h3>
              <button
                onClick={() => setScalingNode(null)}
                aria-label="关闭伸缩配置窗口"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <div>目标节点: <span className="font-mono text-indigo-400 font-semibold">{scalingNode.name}</span></div>
                <div className="mt-1">所属集群: {scalingNode.cluster}</div>
                <div className="mt-1">当前副本: {scalingNode.replicas} 组 Pods</div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-2">
                  <span>目标副本数量:</span>
                  <span className="font-mono text-lg font-bold text-sky-400">{replicaInput} 实例</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={replicaInput}
                  onChange={(e) => setReplicaInput(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 实例 (轻载)</span>
                  <span>8 实例 (标配)</span>
                  <span>16 实例 (极限吞吐)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
                提示：应用该配置将触发无感知滚动更新，Kubernetes调度器将在各工作节点动态调度容器生命周期。
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScalingNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmScale}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30"
                >
                  确认下发调度策略
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNode}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                接入并纳管新计算节点
              </h3>
              <button
                type="button"
                onClick={() => setIsAddNodeOpen(false)}
                aria-label="关闭接入窗口"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">节点标识名称 (Node FQDN)</label>
                <input
                  type="text"
                  required
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="例如: prod-sh-worker-app-05"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">所属地域集群</label>
                <select
                  value={newNodeCluster}
                  onChange={(e) => setNewNodeCluster(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {clusters.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">私网 IP 地址</label>
                <input
                  type="text"
                  required
                  value={newNodeIp}
                  onChange={(e) => setNewNodeIp(e.target.value)}
                  placeholder="10.120.14.28"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">标签属性 (逗号分隔)</label>
                <input
                  type="text"
                  value={newNodeTag}
                  onChange={(e) => setNewNodeTag(e.target.value)}
                  placeholder="Worker, HighIO, AppServer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNodeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  提交纳管配置
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
