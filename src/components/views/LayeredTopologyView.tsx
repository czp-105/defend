import React, { useState, useMemo } from 'react';
import {
  TopologyNode,
  DefenseDeploymentPoint,
  TopologyLink,
  ZoneId,
  CriticalityLevel,
  AssetClass,
} from '../../types/cidtp';
import {
  deriveTopologyFromStepsAndDefense,
  initialTopologyNodes,
} from '../../data/cidtpMockData';
import {
  Shield,
  Layers,
  AlertTriangle,
  Server,
  Network,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Minimize2,
  Maximize2,
  RotateCcw,
  Info,
  Sliders,
} from 'lucide-react';

interface LayeredTopologyViewProps {
  defenseSystems: Array<{
    id: string;
    name: string;
    mode: '串联' | '旁路' | '终端代理' | '接口';
    version: string;
    isProbeFailed?: boolean;
    status: 'online' | 'warning' | 'offline';
  }>;
  onSelectSystem?: (dsId: string) => void;
  onSwitchToBaseline?: () => void;
}

const ZONE_CONFIG: Record<
  ZoneId,
  { name: string; english: string; desc: string; order: number }
> = {
  external: { name: '外部', english: 'EXTERNAL', desc: '公网与外部非受控信道', order: 1 },
  dmz: { name: 'DMZ', english: 'DMZ ZONE', desc: '半受信任隔离暴露面', order: 2 },
  mgmt: { name: '管理区', english: 'MANAGEMENT', desc: '特权运维与认证审计域', order: 3 },
  control: { name: '控制区', english: 'CONTROL / SCADA', desc: '工控生产调度与监控域', order: 4 },
  field: { name: '现场区', english: 'FIELD / PROCESS', desc: 'PLC/RTU与物理过程执行域', order: 5 },
};

const BOUNDARY_CONFIG = [
  { id: 'external-dmz', name: '外部 ↔ DMZ 边界', leftZone: 'external' as ZoneId, rightZone: 'dmz' as ZoneId },
  { id: 'dmz-mgmt', name: 'DMZ ↔ 管理区 边界', leftZone: 'dmz' as ZoneId, rightZone: 'mgmt' as ZoneId },
  { id: 'mgmt-control', name: '管理区 ↔ 控制区 边界', leftZone: 'mgmt' as ZoneId, rightZone: 'control' as ZoneId },
  { id: 'control-field', name: '控制区 ↔ 现场区 边界', leftZone: 'control' as ZoneId, rightZone: 'field' as ZoneId },
];

const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  plc: 'PLC',
  hmi: 'HMI',
  gateway: '网关',
  app: '应用',
  database: '数据库',
  terminal: '终端',
  other: '未知',
};

export const LayeredTopologyView: React.FC<LayeredTopologyViewProps> = ({
  defenseSystems,
  onSelectSystem,
  onSwitchToBaseline,
}) => {
  // Derive topology data using adapter layer
  const derivedData = useMemo(() => {
    return deriveTopologyFromStepsAndDefense(undefined, defenseSystems as any);
  }, [defenseSystems]);

  // States
  const [filterDs, setFilterDs] = useState<string>('all'); // Filter by specific DS coverage
  const [focusedZone, setFocusedZone] = useState<ZoneId | 'all'>('all'); // Zone focus
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredAsset, setHoveredAsset] = useState<TopologyNode | null>(null);
  const [hoveredDefense, setHoveredDefense] = useState<DefenseDeploymentPoint | null>(null);
  const [simulateEmpty, setSimulateEmpty] = useState<boolean>(false);
  const [unlocatedTrayOpen, setUnlocatedTrayOpen] = useState<boolean>(true);

  // Active nodes based on simulation
  const nodes = simulateEmpty ? [] : derivedData.nodes;
  const deployments = derivedData.deployments;
  const links = simulateEmpty ? [] : derivedData.links;

  // Unlocated deployment points (missing deployment_face)
  const unlocatedPoints = useMemo(() => {
    return deployments.filter((d) => !d.deployment_face);
  }, [deployments]);

  // Located deployment points grouped by boundary
  const deploymentsByBoundary = useMemo(() => {
    const map: Record<string, DefenseDeploymentPoint[]> = {};
    BOUNDARY_CONFIG.forEach((b) => {
      map[b.id] = deployments.filter((d) => d.deployment_face === b.id);
    });
    return map;
  }, [deployments]);

  // Nodes grouped by zone
  const nodesByZone = useMemo(() => {
    const map: Record<ZoneId, TopologyNode[]> = {
      external: [],
      dmz: [],
      mgmt: [],
      control: [],
      field: [],
    };
    nodes.forEach((n) => {
      if (map[n.zone_id]) {
        map[n.zone_id].push(n);
      }
    });
    return map;
  }, [nodes]);

  // Connected links for selected node
  const connectedLinks = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const linkSet = new Set<string>();
    links.forEach((l) => {
      if (l.source === selectedNodeId || l.target === selectedNodeId) {
        linkSet.add(l.id);
      }
    });
    return linkSet;
  }, [selectedNodeId, links]);

  // Connected node ids for selected node
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const nodeSet = new Set<string>([selectedNodeId]);
    links.forEach((l) => {
      if (l.source === selectedNodeId) nodeSet.add(l.target);
      if (l.target === selectedNodeId) nodeSet.add(l.source);
    });
    return nodeSet;
  }, [selectedNodeId, links]);

  // Nodes covered by active filterDs
  const coveredNodeIds = useMemo(() => {
    if (filterDs === 'all') return null;
    const covered = new Set<string>();
    nodes.forEach((n) => {
      if (n.visible_to.includes(filterDs)) {
        covered.add(n.node_id);
      }
    });
    return covered;
  }, [filterDs, nodes]);

  // Check if a node is dimmed
  const getNodeOpacity = (node: TopologyNode) => {
    if (filterDs !== 'all') {
      if (coveredNodeIds && coveredNodeIds.has(node.node_id)) {
        return 'opacity-100 ring-2 ring-cyan-400 border-cyan-400';
      }
      return 'opacity-20';
    }
    if (focusedZone !== 'all' && node.zone_id !== focusedZone) {
      return 'opacity-30';
    }
    if (selectedNodeId) {
      if (connectedNodeIds.has(node.node_id)) {
        return 'opacity-100';
      }
      return 'opacity-35';
    }
    return 'opacity-100';
  };

  // Check if a defense deployment point is dimmed
  const getDefenseOpacity = (dp: DefenseDeploymentPoint) => {
    if (filterDs !== 'all') {
      if (filterDs === dp.ds_id) return 'opacity-100 scale-105';
      return 'opacity-20';
    }
    if (selectedNodeId) {
      const selectedNode = nodes.find((n) => n.node_id === selectedNodeId);
      if (selectedNode && selectedNode.visible_to.includes(dp.ds_id)) {
        return 'opacity-100';
      }
      return 'opacity-35';
    }
    return 'opacity-100';
  };

  // Check which boundary has no equipment (Reviewer Question 3)
  const emptyBoundaries = useMemo(() => {
    return BOUNDARY_CONFIG.filter((b) => {
      const dsList = deploymentsByBoundary[b.id] || [];
      return dsList.length === 0;
    });
  }, [deploymentsByBoundary]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0E13] text-slate-100 font-sans select-none overflow-hidden">
      {/* 1. 顶部 48px 工具条 (h-12) */}
      <div className="h-12 bg-[#111821] border-b border-[#223040] px-4 flex items-center justify-between shrink-0 text-xs">
        {/* Left: View title & Scenarios metadata */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100">靶场分层拓扑</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
              ENV-01
            </span>
          </div>

          <div className="h-4 w-px bg-[#223040] hidden sm:block" />

          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="text-slate-200 font-bold">B3-WATER-001</span>
            <span className="text-slate-500">·</span>
            <span>保真度 L3 硬件在环</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-300 tabular-nums">
              {nodes.length} 资产 · 5 区域 · 4 边界
            </span>
          </div>
        </div>

        {/* Right: Filters & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Defense System Coverage Filter */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden lg:inline">覆盖范围:</span>
            <select
              value={filterDs}
              onChange={(e) => setFilterDs(e.target.value)}
              className="bg-[#0A0E13] border border-[#223040] rounded-[4px] text-slate-200 text-xs px-2 py-1 outline-none hover:border-slate-500 transition-colors"
            >
              <option value="all">查看全部系统覆盖</option>
              {deployments.map((d) => (
                <option key={d.ds_id} value={d.ds_id}>
                  {d.ds_id} {d.shortName} ({d.deployment_mode})
                </option>
              ))}
            </select>
          </div>

          {/* Zone Focus Filter */}
          <div className="hidden xl:flex items-center gap-1 font-mono text-[11px]">
            <span className="text-slate-400">关注分区:</span>
            <select
              value={focusedZone}
              onChange={(e) => setFocusedZone(e.target.value as any)}
              className="bg-[#0A0E13] border border-[#223040] rounded-[4px] text-slate-200 text-xs px-2 py-1 outline-none hover:border-slate-500 transition-colors"
            >
              <option value="all">全区分区</option>
              <option value="external">外部</option>
              <option value="dmz">DMZ</option>
              <option value="mgmt">管理区</option>
              <option value="control">控制区</option>
              <option value="field">现场区</option>
            </select>
          </div>

          {/* Empty State Simulation Toggle (Test Requirement 2) */}
          <button
            onClick={() => setSimulateEmpty(!simulateEmpty)}
            className={`px-2 py-1 rounded-[4px] text-[11px] font-mono border transition-all ${
              simulateEmpty
                ? 'bg-amber-950/70 border-amber-500 text-amber-300 font-bold'
                : 'bg-[#0A0E13] border-[#223040] text-slate-400 hover:text-white'
            }`}
            title="测试边界情况2：当没有资产或未声明拓扑时的空态展示"
          >
            {simulateEmpty ? '已模拟空资产' : '模拟空场景'}
          </button>

          {/* Clear Selection */}
          {(selectedNodeId || filterDs !== 'all' || focusedZone !== 'all') && (
            <button
              onClick={() => {
                setSelectedNodeId(null);
                setFilterDs('all');
                setFocusedZone('all');
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300 text-[11px] transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              重置筛选
            </button>
          )}

          {onSwitchToBaseline && (
            <button
              onClick={onSwitchToBaseline}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#164e63]/40 hover:bg-[#164e63]/70 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono transition-colors"
              title="切换至系统参数基线与三级复位控制面板"
            >
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">系统基线与复位</span>
              <span className="text-[10px] text-slate-400 font-normal">(ENV-02~05)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 中部拓扑画布（占 70% 高度） */}
      <div className="flex-1 min-h-[460px] h-[70%] relative bg-[#0A0E13] p-4 overflow-x-auto overflow-y-auto">
        {/* 常驻标签：当 topology_source === 'derived' 时右上角必须常驻 1px 琥珀描边标签 */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-amber-950/60 border border-amber-500/70 text-amber-400 shadow-none">
            推导视图 · 非权威拓扑
          </span>
        </div>

        {/* 右上角：未定位部署点托盘 (缺少 deployment_face 时集中放于此处并标注原因) */}
        {unlocatedPoints.length > 0 && !simulateEmpty && (
          <div className="absolute top-10 right-4 z-20 w-64 bg-[#111821] border border-[#223040] rounded-[4px] text-xs p-2.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setUnlocatedTrayOpen(!unlocatedTrayOpen)}
            >
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                未定位部署点 ({unlocatedPoints.length})
              </span>
              <span className="text-[10px] text-slate-400 hover:text-white font-mono">
                {unlocatedTrayOpen ? '收起' : '展开'}
              </span>
            </div>

            {unlocatedTrayOpen && (
              <div className="mt-2 space-y-1.5 pt-2 border-t border-[#223040]">
                <div className="text-[10px] text-slate-400 leading-normal">
                  原因：终端代理型（agent）或未声明边界 face，集中收纳不猜测位置
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {unlocatedPoints.map((dp) => (
                    <div
                      key={dp.ds_id}
                      onMouseEnter={() => setHoveredDefense(dp)}
                      onMouseLeave={() => setHoveredDefense(null)}
                      onClick={() => onSelectSystem && onSelectSystem(dp.ds_id)}
                      className="p-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between hover:border-cyan-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-300">{dp.ds_id}</span>
                        <span className="text-slate-300">{dp.shortName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 px-1 py-0.2 bg-[#111821] rounded-[2px] border border-[#223040]">
                        {dp.deployment_mode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 边界情况 2：没有任何资产节点时，显示 120px 虚线框与 13px 文案 */}
        {nodes.length === 0 ? (
          <div className="h-full min-h-[360px] flex items-center justify-center p-6">
            <div className="h-[120px] w-full max-w-2xl border border-dashed border-[#223040] rounded-[4px] flex flex-col items-center justify-center bg-[#111821]/40 px-6 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div className="text-[13px] text-slate-300 font-sans">
                该场景尚未声明资产或拓扑，无法生成推导视图
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                请检查 scenario.yaml 中的 steps.asset 字段或引入 topology.ref 声明
              </div>
            </div>
          </div>
        ) : (
          /* 五个纵向区域带排布与跨区边界防御六边形 */
          <div className="min-w-[1040px] h-full flex items-stretch justify-between gap-4 py-2">
            {/* 1. 外部 */}
            <ZoneBand
              zoneId="external"
              zoneInfo={ZONE_CONFIG.external}
              nodes={nodesByZone.external}
              isFocused={focusedZone === 'external'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onHoverAsset={setHoveredAsset}
              getNodeOpacity={getNodeOpacity}
            />

            {/* 边界 1: 外部 ↔ DMZ */}
            <BoundaryColumn
              boundary={BOUNDARY_CONFIG[0]}
              deployments={deploymentsByBoundary['external-dmz'] || []}
              selectedNodeId={selectedNodeId}
              filterDs={filterDs}
              onHoverDefense={setHoveredDefense}
              onSelectSystem={onSelectSystem}
              getDefenseOpacity={getDefenseOpacity}
            />

            {/* 2. DMZ */}
            <ZoneBand
              zoneId="dmz"
              zoneInfo={ZONE_CONFIG.dmz}
              nodes={nodesByZone.dmz}
              isFocused={focusedZone === 'dmz'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onHoverAsset={setHoveredAsset}
              getNodeOpacity={getNodeOpacity}
            />

            {/* 边界 2: DMZ ↔ 管理区 */}
            <BoundaryColumn
              boundary={BOUNDARY_CONFIG[1]}
              deployments={deploymentsByBoundary['dmz-mgmt'] || []}
              selectedNodeId={selectedNodeId}
              filterDs={filterDs}
              onHoverDefense={setHoveredDefense}
              onSelectSystem={onSelectSystem}
              getDefenseOpacity={getDefenseOpacity}
            />

            {/* 3. 管理区 */}
            <ZoneBand
              zoneId="mgmt"
              zoneInfo={ZONE_CONFIG.mgmt}
              nodes={nodesByZone.mgmt}
              isFocused={focusedZone === 'mgmt'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onHoverAsset={setHoveredAsset}
              getNodeOpacity={getNodeOpacity}
            />

            {/* 边界 3: 管理区 ↔ 控制区 */}
            <BoundaryColumn
              boundary={BOUNDARY_CONFIG[2]}
              deployments={deploymentsByBoundary['mgmt-control'] || []}
              selectedNodeId={selectedNodeId}
              filterDs={filterDs}
              onHoverDefense={setHoveredDefense}
              onSelectSystem={onSelectSystem}
              getDefenseOpacity={getDefenseOpacity}
            />

            {/* 4. 控制区 */}
            <ZoneBand
              zoneId="control"
              zoneInfo={ZONE_CONFIG.control}
              nodes={nodesByZone.control}
              isFocused={focusedZone === 'control'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onHoverAsset={setHoveredAsset}
              getNodeOpacity={getNodeOpacity}
            />

            {/* 边界 4: 控制区 ↔ 现场区 */}
            <BoundaryColumn
              boundary={BOUNDARY_CONFIG[3]}
              deployments={deploymentsByBoundary['control-field'] || []}
              selectedNodeId={selectedNodeId}
              filterDs={filterDs}
              onHoverDefense={setHoveredDefense}
              onSelectSystem={onSelectSystem}
              getDefenseOpacity={getDefenseOpacity}
            />

            {/* 5. 现场区 */}
            <ZoneBand
              zoneId="field"
              zoneInfo={ZONE_CONFIG.field}
              nodes={nodesByZone.field}
              isFocused={focusedZone === 'field'}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onHoverAsset={setHoveredAsset}
              getNodeOpacity={getNodeOpacity}
            />
          </div>
        )}

        {/* 悬停资产卡片 240px 提示框 */}
        {hoveredAsset && (
          <div className="fixed bottom-36 left-6 z-50 w-[240px] bg-[#111821] border border-[#223040] rounded-[4px] p-2.5 text-xs font-sans shadow-lg pointer-events-none">
            <div className="flex items-center justify-between border-b border-[#223040] pb-1.5 mb-1.5">
              <span className="font-bold text-slate-100">{hoveredAsset.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] bg-[#0A0E13] text-cyan-300 border border-[#223040]">
                {ZONE_CONFIG[hoveredAsset.zone_id].name}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">IP 地址:</span>
                <span className="text-slate-200 tabular-nums">{hoveredAsset.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">协议类型:</span>
                <span className="text-slate-200">{hoveredAsset.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">资产类别:</span>
                <span className="text-slate-200">{ASSET_CLASS_LABEL[hoveredAsset.asset_class] || '未知'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">业务关键度:</span>
                <span
                  className={
                    hoveredAsset.criticality === 'high'
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-300'
                  }
                >
                  {hoveredAsset.criticality.toUpperCase()}
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#223040] text-[10px] text-cyan-400 font-sans">
                {hoveredAsset.visible_to && hoveredAsset.visible_to.length > 0 ? (
                  <span>可被 {hoveredAsset.visible_to.join('、')} 看见</span>
                ) : (
                  <span className="text-slate-500">无系统可见记录</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 悬停防御六边形提示框 */}
        {hoveredDefense && (
          <div className="fixed bottom-36 left-72 z-50 w-72 bg-[#111821] border border-[#223040] rounded-[4px] p-2.5 text-xs font-sans shadow-lg pointer-events-none">
            <div className="flex items-center justify-between border-b border-[#223040] pb-1.5 mb-1.5">
              <span className="font-bold text-cyan-300 font-mono">
                {hoveredDefense.ds_id} · {hoveredDefense.shortName}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] border ${
                  hoveredDefense.probe_status === 'fail'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}
              >
                {hoveredDefense.probe_status === 'fail' ? '探针失败' : '探针通过'}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">系统全称:</span>
                <span className="text-slate-200 font-sans">{hoveredDefense.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">部署模式:</span>
                <span className="text-cyan-400 font-bold">
                  {hoveredDefense.deployment_mode} ({hoveredDefense.can_prevent ? '具备阻断' : '仅检测/旁路'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">软件版本:</span>
                <span className="text-slate-200">{hoveredDefense.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">策略引用:</span>
                <span className="text-slate-200">{hoveredDefense.policyRef || '默认基线'}</span>
              </div>
              <div className="pt-1.5 border-t border-[#223040] text-[10px] text-slate-400 font-sans">
                守护边界：{hoveredDefense.guardBoundaryDesc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. 底部 120px 图例与数据来源条 (h-[120px]) */}
      <div className="h-[120px] bg-[#111821] border-t border-[#223040] px-4 py-2.5 shrink-0 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
          {/* 评审三问解答摘要 (35% - 4 栏) */}
          <div className="md:col-span-4 h-full border-r border-[#223040] pr-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                评审要回答的三件事 (AUDIT SUMMARY)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">一屏直达</span>
            </div>

            <div className="space-y-1 text-[11px] font-sans">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 shrink-0">① 资产归属:</span>
                <span className="text-slate-200 truncate">
                  共 {nodes.length} 台资产，各区严格隔离（外 2 · DMZ 2 · 管 3 · 控 2 · 现 3）
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 shrink-0">② 防御系统:</span>
                <span className="text-slate-200 truncate">
                  8 套边界防护 + 2 套端点代理，覆盖 90% 节点
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 shrink-0">③ 边界防线:</span>
                {emptyBoundaries.length > 0 ? (
                  <span className="text-rose-400 font-bold truncate">
                    ⚠️ 发现 {emptyBoundaries.map((b) => b.name).join('、')} 无设备拦截
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold truncate">
                    ✓ 4 条物理边界均有设备防护 (控制区↔现场区 1 套探针失步)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 四类节点与三类链路图例 (40% - 5 栏) */}
          <div className="md:col-span-5 h-full border-r border-[#223040] pr-3 flex flex-col justify-between">
            <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              拓扑图元图例规范 (SHAPES & LINKS)
            </span>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded-[2px] bg-[#0A0E13] border border-[#223040]" />
                <span className="text-slate-300">业务资产 (140×52px)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-[#0A0E13] border-2 border-slate-300 rounded-[2px]" />
                <span className="text-slate-300">High 关键资产 (2px边框)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-[#111821] border border-cyan-500 rounded-[1px]" />
                <span className="text-slate-300">六边形 (96×40px 边界设备)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-[#111821] border border-[#FF4D5E] rounded-[1px]" />
                <span className="text-rose-400">六边形红框 (探针失败)</span>
              </div>

              <div className="flex items-center gap-2 col-span-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" /> 实线:普通链路
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" /> 虚线:管理
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-3 h-0.5 border-t border-dashed border-amber-400 inline-block" /> 琥珀虚线:镜像
                </span>
              </div>
            </div>
          </div>

          {/* 依据与能力级别说明 (25% - 3 栏) */}
          <div className="md:col-span-3 h-full flex flex-col justify-between text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                数据来源条 (SOURCE)
              </span>
              <span className="text-[10px] font-mono text-amber-400 px-1 py-0.2 bg-amber-950/40 rounded-[2px] border border-amber-500/30">
                L2 推导
              </span>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
              依据：场景攻击步资产集合 + 防御基线部署面；未声明 topology 字段。
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              物理级硬件在环真实拓扑: [能力 L3 未提供]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 区域带组件 (Zone Band)
 * 每个区域带是 1px 虚线矩形，左上角 9px 中文区域名；宽度不小于 140px。
 */
interface ZoneBandProps {
  zoneId: ZoneId;
  zoneInfo: { name: string; english: string; desc: string };
  nodes: TopologyNode[];
  isFocused: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onHoverAsset: (node: TopologyNode | null) => void;
  getNodeOpacity: (node: TopologyNode) => string;
}

const ZoneBand: React.FC<ZoneBandProps> = ({
  zoneId,
  zoneInfo,
  nodes,
  isFocused,
  selectedNodeId,
  onSelectNode,
  onHoverAsset,
  getNodeOpacity,
}) => {
  return (
    <div
      className={`min-w-[150px] flex-1 flex flex-col border border-dashed rounded-[4px] p-2 transition-all duration-150 relative ${
        isFocused
          ? 'border-cyan-500 bg-[#111821]/80 ring-1 ring-cyan-500/30'
          : 'border-[#223040] bg-[#111821]/30 hover:border-slate-700'
      }`}
    >
      {/* 左上角 9px 中文区域名 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-slate-400 font-sans tracking-wider uppercase">
          {zoneInfo.name}
        </span>
        {isFocused && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded-[2px] bg-cyan-950 text-cyan-300 border border-cyan-800">
            分区
          </span>
        )}
      </div>

      {/* 区域内资产列表 */}
      <div className="flex-1 flex flex-col gap-2.5 items-center justify-start overflow-y-auto pr-0.5">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.node_id;
          const isHighCritical = node.criticality === 'high';
          const opacityClass = getNodeOpacity(node);

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectNode(isSelected ? null : node.node_id)}
              onMouseEnter={() => onHoverAsset(node)}
              onMouseLeave={() => onHoverAsset(null)}
              className={`w-[140px] h-[52px] shrink-0 p-1.5 rounded-[4px] bg-[#111821] transition-all cursor-pointer flex flex-col justify-between ${
                isHighCritical ? 'border-2 border-slate-300' : 'border border-[#223040]'
              } ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-400 bg-[#16273b]'
                  : 'hover:border-slate-500'
              } ${opacityClass}`}
            >
              {/* Top: 3-character asset class identifier */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono px-1 py-0.2 rounded-[2px] bg-[#0A0E13] text-slate-400 border border-[#223040]">
                  {ASSET_CLASS_LABEL[node.asset_class] || (node.asset_class || 'UNK').slice(0, 3).toUpperCase()}
                </span>
                {isHighCritical && (
                  <span className="text-[8px] font-mono font-bold text-rose-400">HIGH</span>
                )}
              </div>

              {/* Middle: Primary Chinese Name */}
              <div className="text-[11px] font-bold text-slate-100 font-sans truncate leading-none">
                {node.label}
              </div>

              {/* Bottom: Monospace asset ID & protocol */}
              <div className="text-[9px] font-mono text-slate-400 truncate leading-none">
                {node.node_id} · {node.protocol}
              </div>
            </div>
          );
        })}

        {nodes.length === 0 && (
          <div className="h-full flex items-center justify-center text-[10px] font-mono text-slate-600">
            无资产
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 边界通道组件 (Boundary Column)
 * 位于两区域之间，宽度 24px 空隙（加宽适配六边形 96×40px），放置守护该边界的六边形防御系统
 */
interface BoundaryColumnProps {
  boundary: { id: string; name: string; leftZone: ZoneId; rightZone: ZoneId };
  deployments: DefenseDeploymentPoint[];
  selectedNodeId: string | null;
  filterDs: string;
  onHoverDefense: (dp: DefenseDeploymentPoint | null) => void;
  onSelectSystem?: (dsId: string) => void;
  getDefenseOpacity: (dp: DefenseDeploymentPoint) => string;
}

const BoundaryColumn: React.FC<BoundaryColumnProps> = ({
  boundary,
  deployments,
  selectedNodeId,
  filterDs,
  onHoverDefense,
  onSelectSystem,
  getDefenseOpacity,
}) => {
  const hasNoDevices = deployments.length === 0;

  return (
    <div className="w-[104px] shrink-0 flex flex-col items-center justify-between py-1 relative">
      {/* 边界中轴参考线 (1.5px 中性实线 / 虚线) */}
      <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-[#223040] pointer-events-none z-0" />

      {/* 顶部边界提示 */}
      <div className="z-10 text-[9px] font-mono text-slate-500 text-center truncate w-full px-1">
        {hasNoDevices ? (
          <span className="text-rose-400 font-bold">⚠️ 无设备</span>
        ) : (
          <span>{deployments.length} 套防御</span>
        )}
      </div>

      {/* 放置在边界线上的六边形 96×40px */}
      <div className="z-10 flex flex-col items-center justify-center gap-4 my-auto w-full">
        {deployments.map((dp) => {
          const isFailed = dp.probe_status === 'fail';
          const isHighlighted = filterDs === dp.ds_id;
          const opacityClass = getDefenseOpacity(dp);

          return (
            <div
              key={dp.ds_id}
              onClick={() => onSelectSystem && onSelectSystem(dp.ds_id)}
              onMouseEnter={() => onHoverDefense(dp)}
              onMouseLeave={() => onHoverDefense(null)}
              className={`flex flex-col items-center cursor-pointer transition-all ${opacityClass}`}
            >
              {/* 六边形 96×40px SVG */}
              <div className="relative w-[96px] h-[40px] flex items-center justify-center">
                <svg width="96" height="40" className="overflow-visible absolute inset-0">
                  <polygon
                    points="12,1 84,1 95,20 84,39 12,39 1,20"
                    fill="#111821"
                    stroke={isFailed ? '#FF4D5E' : isHighlighted ? '#22d3ee' : '#223040'}
                    strokeWidth={isFailed || isHighlighted ? 2 : 1}
                  />
                </svg>

                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-[11px] font-bold text-slate-100 leading-none">
                    {dp.ds_id}
                  </span>
                  <span
                    className={`font-sans text-[9px] leading-tight truncate max-w-[76px] mt-0.5 ${
                      isFailed ? 'text-[#FF4D5E]' : 'text-slate-400'
                    }`}
                  >
                    {dp.shortName}
                  </span>
                </div>
              </div>

              {/* 边界情况 4：某防御系统 probe_status 为 fail 时，在其下方加 9px "探针失败" */}
              {isFailed && (
                <div className="text-[9px] text-[#FF4D5E] font-mono text-center font-bold mt-0.5 leading-none tracking-tight">
                  探针失败
                </div>
              )}
            </div>
          );
        })}

        {hasNoDevices && (
          <div className="w-[96px] py-2 px-1 text-center bg-rose-950/30 border border-rose-500/40 rounded-[2px] text-[10px] text-rose-400">
            无设备防护
          </div>
        )}
      </div>

      {/* 底部链路标记提示 */}
      <div className="z-10 text-[9px] font-mono text-slate-600">
        跨区信道
      </div>
    </div>
  );
};
