/**
 * 关基智能攻防验证靶场拓扑沙盘 - 10大全国重点关基单位专属 G6 拓扑数据配置文件
 * 每个关基单位（01 ~ 10）均拥有独立的：
 * - 三道防御边界设备（不同的顶层网关数量/命名、不同的中层隔离/探针拓扑）
 * - 四大专属安全域 Combos（不同的行业分区命名、配色与每域资产数量配比）
 * - 20 个行业专属底层资产节点（服务器 / 数据库 / 办公终端 / 工业PLC与硬件控制卡）
 * - 差异化的层次几何布局变体与专属三阶段多变体逃逸攻击路径
 */

export type SandboxBoundaryLayer =
  | 'tier1-root'
  | 'tier1-boundary'
  | 'tier2-isolation'
  | 'tier3-asset';

export type SandboxDeviceKind =
  | 'router'
  | 'ngfw'
  | 'waf'
  | 'gatekeeper'
  | 'ids'
  | 'server'
  | 'database'
  | 'terminal'
  | 'plc';

export type AssetRingStatus = 'safe' | 'probing' | 'compromised';

export interface SandboxNodeConfig {
  id: string;
  label: string;
  subLabel?: string;
  layerOrder: number;
  boundaryLayer: SandboxBoundaryLayer;
  deviceKind: SandboxDeviceKind;
  comboId?: string;
  ringStatus?: AssetRingStatus;
  ip?: string;
  /** 可选自定义画布坐标，让不同关基呈现不同的树状分叉与域内阵列形态 */
  customX?: number;
  customY?: number;
  /** 动效临时状态：WAF/网关护盾闪烁与拦截浮窗 */
  shieldFlash?: boolean;
  interceptBadgeText?: string;
  /** 动效临时状态：核心靶标失陷角标 */
  compromisedBadgeText?: string;
}

export interface SandboxEdgeConfig {
  id: string;
  source: string;
  target: string;
  label?: string;
  edgeCategory: 'backbone' | 'isolation' | 'zone-access';
  pulseState?:
    | 'none'
    | 'stage1-red'
    | 'stage2-purple-blocked'
    | 'stage2-purple-bypass'
    | 'stage3-crimson-strike';
}

export interface SandboxComboConfig {
  id: string;
  label: string;
  zoneCode: string;
  borderColor: string;
  glowColor: string;
  fillColor: string;
}

export interface EscapeStageMeta {
  stage: 1 | 2 | 3;
  title: string;
  bannerText: string;
  accentColor: string;
  activeEdges: Array<{
    edgeId: string;
    pulseState: NonNullable<SandboxEdgeConfig['pulseState']>;
  }>;
}

export interface UnitEscapeConfig {
  stage1EdgeId: string;
  stage1InterceptNodeId: string;
  stage1InterceptText: string;
  stage2BlockedEdgeIds: string[];
  stage2BypassEdgeId: string;
  stage3StrikeEdgeIds: string[];
  stage3CompromisedNodeId: string;
  timeline: Record<1 | 2 | 3, EscapeStageMeta>;
}

export interface UnitSandboxTopologyBundle {
  unitId: string;
  unitName: string;
  shortName: string;
  industry: string;
  region: string;
  targetSystem: string;
  architectureTag: string;
  combos: SandboxComboConfig[];
  nodes: SandboxNodeConfig[];
  edges: SandboxEdgeConfig[];
  escapeConfig: UnitEscapeConfig;
}

/**
 * 行业专属构建器：根据各关基单位独特的边界设备数、隔离网闸位置、4大安全域资产配比（如 4-5-5-6、6-4-5-5、5-5-4-6 等）
 * 以及不同的受攻击入口（左路/中路/右路）生成结构各异的 G6 拓扑图
 */
interface UnitBlueprintSpec {
  unitId: string;
  unitName: string;
  shortName: string;
  industry: string;
  region: string;
  targetSystem: string;
  architectureTag: string;
  layoutVariant: 'center-3gw-2iso' | 'left-4gw-3iso' | 'right-3gw-3iso' | 'wide-4gw-2iso' | 'mesh-3gw-3iso';
  rootNode: {
    id: string;
    label: string;
    subLabel: string;
    ip: string;
  };
  boundaryNodes: Array<{
    id: string;
    label: string;
    subLabel: string;
    deviceKind: 'ngfw' | 'waf';
    ip: string;
  }>;
  isolationNodes: Array<{
    id: string;
    label: string;
    subLabel: string;
    deviceKind: 'gatekeeper' | 'ids';
    ip: string;
  }>;
  combos: SandboxComboConfig[];
  zoneAssets: Record<
    string,
    Array<{
      id: string;
      label: string;
      subLabel: string;
      deviceKind: 'server' | 'database' | 'terminal' | 'plc';
      ringStatus: AssetRingStatus;
    }>
  >;
  extraZoneEdges?: Array<{ source: string; target: string }>;
  attackPath: {
    entryBoundaryId: string;
    interceptText: string;
    blockedTarget1Id: string;
    blockedTarget2Id: string;
    bypassIsolationId: string;
    coreHopNodeId?: string; // 若存在，阶段3先穿透核心前置再打穿主靶标（双跳穿透拓扑）
    coreTargetNodeId: string;
    stage1Banner: string;
    stage2Banner: string;
    stage3Banner: string;
  };
}

function buildUnitTopologyBundle(spec: UnitBlueprintSpec): UnitSandboxTopologyBundle {
  const nodes: SandboxNodeConfig[] = [];
  const edges: SandboxEdgeConfig[] = [];

  // 4. 第三道边界：根据各域列数 (2列 vs 3列) 精确计算每个 Combo 宽度，并在相邻安全域之间留出 44px 清晰间隔
  const comboIds = spec.combos.map((c) => c.id);
  const comboWidths = comboIds.map((cid) => {
    const count = (spec.zoneAssets[cid] || []).length;
    return count <= 4 ? 280 : 384;
  });
  const comboGap = 44;
  let cursorX = 40;
  const comboXCenters: Record<string, number> = {};

  comboIds.forEach((cid, i) => {
    const w = comboWidths[i];
    comboXCenters[cid] = Math.round(cursorX + w / 2);
    cursorX += w + comboGap;
  });

  const totalGraphSpan = cursorX - comboGap + 40;
  const centerAxisX = Math.round(totalGraphSpan / 2);

  // 1. 顶层根节点坐标（按 layoutVariant 错位排布，呈现不同视觉重心）
  const rootX =
    spec.layoutVariant === 'left-4gw-3iso'
      ? centerAxisX - 90
      : spec.layoutVariant === 'right-3gw-3iso'
      ? centerAxisX + 90
      : centerAxisX;

  nodes.push({
    id: spec.rootNode.id,
    label: spec.rootNode.label,
    subLabel: spec.rootNode.subLabel,
    ip: spec.rootNode.ip,
    layerOrder: 0,
    boundaryLayer: 'tier1-root',
    deviceKind: 'router',
    customX: rootX,
    customY: 54,
  });

  // 2. 第一道边界节点（支持 3 台或 4 台边界防御设备，不同间距）
  const bCount = spec.boundaryNodes.length;
  const bXs =
    bCount === 4
      ? [
          comboXCenters[comboIds[0]],
          comboXCenters[comboIds[1]],
          comboXCenters[comboIds[2]],
          comboXCenters[comboIds[3]],
        ]
      : spec.layoutVariant === 'right-3gw-3iso'
      ? [
          comboXCenters[comboIds[0]] + 30,
          centerAxisX + 20,
          comboXCenters[comboIds[3]] - 20,
        ]
      : [
          comboXCenters[comboIds[0]] + 20,
          centerAxisX,
          comboXCenters[comboIds[3]] - 20,
        ];

  spec.boundaryNodes.forEach((bn, idx) => {
    nodes.push({
      id: bn.id,
      label: bn.label,
      subLabel: bn.subLabel,
      ip: bn.ip,
      layerOrder: 1,
      boundaryLayer: 'tier1-boundary',
      deviceKind: bn.deviceKind,
      customX: bXs[idx] ?? centerAxisX,
      customY: 188,
    });

    edges.push({
      id: `edge-${spec.unitId}-root-${bn.id}`,
      source: spec.rootNode.id,
      target: bn.id,
      edgeCategory: 'backbone',
      pulseState: 'none',
    });
  });

  // 3. 第二道边界节点（支持 2 台或 3 台域间隔离与流量检测设备）
  const isoCount = spec.isolationNodes.length;
  const isoXs =
    isoCount === 3
      ? [
          comboXCenters[comboIds[1]] - 20,
          comboXCenters[comboIds[2]],
          comboXCenters[comboIds[3]],
        ]
      : spec.layoutVariant === 'wide-4gw-2iso'
      ? [comboXCenters[comboIds[1]] + 40, comboXCenters[comboIds[3]] - 30]
      : [comboXCenters[comboIds[2]] - 20, comboXCenters[comboIds[3]]];

  spec.isolationNodes.forEach((iso, idx) => {
    nodes.push({
      id: iso.id,
      label: iso.label,
      subLabel: iso.subLabel,
      ip: iso.ip,
      layerOrder: 2,
      boundaryLayer: 'tier2-isolation',
      deviceKind: iso.deviceKind,
      customX: isoXs[idx] ?? centerAxisX + 100,
      customY: 332,
    });
  });

  comboIds.forEach((cid) => {
    const assets = spec.zoneAssets[cid] || [];
    const cx = comboXCenters[cid];
    const count = assets.length;

    // 根据域内节点数 (4 / 5 / 6) 采用不同的上下排阵列布局
    const topRowCount = count <= 4 ? 2 : 3;
    const botRowCount = count - topRowCount;

    assets.forEach((asset, idx) => {
      const isTopRow = idx < topRowCount;
      const rowIdx = isTopRow ? idx : idx - topRowCount;
      const rowTotal = isTopRow ? topRowCount : botRowCount;
      const spacingX = rowTotal === 3 ? 118 : rowTotal === 2 ? 124 : 0;
      const offsetX = (rowIdx - (rowTotal - 1) / 2) * spacingX;

      nodes.push({
        id: asset.id,
        label: asset.label,
        subLabel: asset.subLabel,
        ip: asset.subLabel.split(' ')[0],
        layerOrder: isTopRow ? 3 : 4,
        boundaryLayer: 'tier3-asset',
        deviceKind: asset.deviceKind,
        comboId: cid,
        ringStatus: asset.ringStatus,
        customX: Math.round(cx + offsetX),
        customY: isTopRow ? 514 : 636,
      });
    });

    // 域内上排与下排之间的内部拓扑连线
    for (let i = topRowCount; i < count; i++) {
      const parentIdx = (i - topRowCount) % topRowCount;
      edges.push({
        id: `edge-${spec.unitId}-intra-${cid}-${i}`,
        source: assets[parentIdx].id,
        target: assets[i].id,
        edgeCategory: 'zone-access',
        pulseState: 'none',
      });
    }
  });

  // 5. 构建三阶段多变体逃逸核心连线 + 辅助跨层连线（确保拓扑无孤岛且每家关基走线不同）
  const stage1EdgeId = `edge-${spec.unitId}-root-${spec.attackPath.entryBoundaryId}`;

  const blockedEdge1Id = `edge-${spec.unitId}-s2-block1`;
  const blockedEdge2Id = `edge-${spec.unitId}-s2-block2`;
  const bypassEdgeId = `edge-${spec.unitId}-s2-bypass`;

  edges.push(
    {
      id: blockedEdge1Id,
      source: spec.attackPath.entryBoundaryId,
      target: spec.attackPath.blockedTarget1Id,
      edgeCategory: 'isolation',
      pulseState: 'none',
    },
    {
      id: blockedEdge2Id,
      source: spec.attackPath.entryBoundaryId,
      target: spec.attackPath.blockedTarget2Id,
      edgeCategory: 'isolation',
      pulseState: 'none',
    },
    {
      id: bypassEdgeId,
      source: spec.attackPath.entryBoundaryId,
      target: spec.attackPath.bypassIsolationId,
      edgeCategory: 'isolation',
      pulseState: 'none',
    }
  );

  // 阶段 3 穿透连线（支持直接命中核心靶标，或经过核心前置节点双跳穿透）
  const stage3StrikeEdgeIds: string[] = [];
  if (spec.attackPath.coreHopNodeId) {
    const hopEdge1 = `edge-${spec.unitId}-s3-hop1`;
    const hopEdge2 = `edge-${spec.unitId}-s3-hop2`;
    // 移除可能重复的域内边以使用穿透边
    const dupIdx = edges.findIndex(
      (e) =>
        e.source === spec.attackPath.coreHopNodeId &&
        e.target === spec.attackPath.coreTargetNodeId
    );
    if (dupIdx >= 0) edges.splice(dupIdx, 1);

    edges.push(
      {
        id: hopEdge1,
        source: spec.attackPath.bypassIsolationId,
        target: spec.attackPath.coreHopNodeId,
        edgeCategory: 'zone-access',
        pulseState: 'none',
      },
      {
        id: hopEdge2,
        source: spec.attackPath.coreHopNodeId,
        target: spec.attackPath.coreTargetNodeId,
        edgeCategory: 'zone-access',
        pulseState: 'none',
      }
    );
    stage3StrikeEdgeIds.push(hopEdge1, hopEdge2);
  } else {
    const strikeEdgeId = `edge-${spec.unitId}-s3-strike`;
    edges.push({
      id: strikeEdgeId,
      source: spec.attackPath.bypassIsolationId,
      target: spec.attackPath.coreTargetNodeId,
      edgeCategory: 'zone-access',
      pulseState: 'none',
    });
    stage3StrikeEdgeIds.push(strikeEdgeId);
  }

  // 6. 为其余第一道边界、第二道边界与各安全域第一排节点建立差异化接入连线
  const firstBoundaryId = spec.boundaryNodes[0].id;
  const lastBoundaryId = spec.boundaryNodes[spec.boundaryNodes.length - 1].id;

  // 第一道边界左路接入 DMZ 区上排节点
  const dmzAssets = spec.zoneAssets[comboIds[0]] || [];
  const dmzTopCount = dmzAssets.length <= 4 ? 2 : 3;
  dmzAssets.slice(0, dmzTopCount).forEach((da, idx) => {
    const exists = edges.some((e) => e.target === da.id);
    if (!exists) {
      edges.push({
        id: `edge-${spec.unitId}-dmz-top-${idx}`,
        source: firstBoundaryId,
        target: da.id,
        edgeCategory: 'zone-access',
        pulseState: 'none',
      });
    }
  });

  // 边界与隔离层交叉冗余连线
  spec.isolationNodes.forEach((iso, idx) => {
    const hasIncoming = edges.some((e) => e.target === iso.id);
    if (!hasIncoming) {
      const bSource = spec.boundaryNodes[Math.min(idx, spec.boundaryNodes.length - 1)].id;
      edges.push({
        id: `edge-${spec.unitId}-b-iso-${idx}`,
        source: bSource,
        target: iso.id,
        edgeCategory: 'isolation',
        pulseState: 'none',
      });
    }
  });

  // 右侧边界到最右侧隔离层辅助连线
  const rightIsoId = spec.isolationNodes[spec.isolationNodes.length - 1].id;
  if (
    !edges.some((e) => e.source === lastBoundaryId && e.target === rightIsoId) &&
    lastBoundaryId !== spec.attackPath.entryBoundaryId
  ) {
    edges.push({
      id: `edge-${spec.unitId}-right-b-iso`,
      source: lastBoundaryId,
      target: rightIsoId,
      edgeCategory: 'isolation',
      pulseState: 'none',
    });
  }

  // 将办公区、管理区、核心业务区所有尚未被接入的上排节点连接到就近的中层隔离/检测设备
  [1, 2, 3].forEach((zoneIdx) => {
    const cid = comboIds[zoneIdx];
    const zAssets = spec.zoneAssets[cid] || [];
    const topCount = zAssets.length <= 4 ? 2 : 3;
    const defaultIso =
      zoneIdx === 3
        ? spec.attackPath.bypassIsolationId
        : spec.isolationNodes[Math.min(zoneIdx - 1, spec.isolationNodes.length - 1)].id;

    zAssets.slice(0, topCount).forEach((za, aIdx) => {
      const hasIncoming = edges.some((e) => e.target === za.id);
      if (!hasIncoming) {
        edges.push({
          id: `edge-${spec.unitId}-z${zoneIdx}-top-${aIdx}`,
          source: defaultIso,
          target: za.id,
          edgeCategory: 'zone-access',
          pulseState: 'none',
        });
      }
    });
  });

  // 额外自定义跨节点连线
  (spec.extraZoneEdges || []).forEach((ex, i) => {
    if (!edges.some((e) => e.source === ex.source && e.target === ex.target)) {
      edges.push({
        id: `edge-${spec.unitId}-extra-${i}`,
        source: ex.source,
        target: ex.target,
        edgeCategory: 'zone-access',
        pulseState: 'none',
      });
    }
  });

  const timeline: Record<1 | 2 | 3, EscapeStageMeta> = {
    1: {
      stage: 1,
      title: '阶段 1 / 3 · 原始载荷受阻',
      bannerText: spec.attackPath.stage1Banner,
      accentColor: '#ff3b5c',
      activeEdges: [{ edgeId: stage1EdgeId, pulseState: 'stage1-red' }],
    },
    2: {
      stage: 2,
      title: '阶段 2 / 3 · 智能体裂变多变体',
      bannerText: spec.attackPath.stage2Banner,
      accentColor: '#c084fc',
      activeEdges: [
        { edgeId: blockedEdge1Id, pulseState: 'stage2-purple-blocked' },
        { edgeId: blockedEdge2Id, pulseState: 'stage2-purple-blocked' },
        { edgeId: bypassEdgeId, pulseState: 'stage2-purple-bypass' },
      ],
    },
    3: {
      stage: 3,
      title: '阶段 3 / 3 · 跨区穿透打穿核心靶标',
      bannerText: spec.attackPath.stage3Banner,
      accentColor: '#ff1e74',
      activeEdges: [
        { edgeId: bypassEdgeId, pulseState: 'stage2-purple-bypass' },
        ...stage3StrikeEdgeIds.map((edgeId) => ({
          edgeId,
          pulseState: 'stage3-crimson-strike' as const,
        })),
      ],
    },
  };

  return {
    unitId: spec.unitId,
    unitName: spec.unitName,
    shortName: spec.shortName,
    industry: spec.industry,
    region: spec.region,
    targetSystem: spec.targetSystem,
    architectureTag: spec.architectureTag,
    combos: spec.combos,
    nodes,
    edges,
    escapeConfig: {
      stage1EdgeId,
      stage1InterceptNodeId: spec.attackPath.entryBoundaryId,
      stage1InterceptText: spec.attackPath.interceptText,
      stage2BlockedEdgeIds: [blockedEdge1Id, blockedEdge2Id],
      stage2BypassEdgeId: bypassEdgeId,
      stage3StrikeEdgeIds,
      stage3CompromisedNodeId: spec.attackPath.coreTargetNodeId,
      timeline,
    },
  };
}

/**
 * 10 家全国重点关基单位差异化拓扑蓝图定义（01 ~ 10）
 */
const UNIT_BLUEPRINTS: UnitBlueprintSpec[] = [
  // ============================================================================
  // 01 国家电网有限公司（华东调控分中心）— 4边界网关 + 3域间隔离 + [4-5-5-6] 电力调度拓扑
  // ============================================================================
  {
    unitId: '01',
    unitName: '国家电网有限公司（华东调控分中心）',
    shortName: '国家电网·华东调控',
    industry: '能源行业',
    region: '上海·浦东',
    targetSystem: '电力监控系统 (SCADA) 调度主站数据库',
    architectureTag: '安全分区 · 横向单向隔离 · 纵向国密认证 (4GW/3ISO)',
    layoutVariant: 'left-4gw-3iso',
    rootNode: {
      id: 'sg-core-router',
      label: '电力调度骨干路由器',
      subLabel: 'SGCC-BGP · 210.72.11.1',
      ip: '210.72.11.1',
    },
    boundaryNodes: [
      {
        id: 'sg-ngfw-ext',
        label: '电力信息外网防火墙',
        subLabel: 'DS-01 · 外网边界包过滤',
        deviceKind: 'ngfw',
        ip: '10.11.0.1',
      },
      {
        id: 'sg-waf-trade',
        label: '华东电力交易WAF-01',
        subLabel: 'DS-07 · 购售电门户防护',
        deviceKind: 'waf',
        ip: '10.11.0.2',
      },
      {
        id: 'sg-waf-mkt',
        label: '绿电现货申报WAF-02',
        subLabel: 'DS-03 · 现货API签名网关',
        deviceKind: 'waf',
        ip: '10.11.0.3',
      },
      {
        id: 'sg-ngfw-vpn',
        label: '纵向国密加密认证网关',
        subLabel: 'DS-06 · 省调远动IPsec隧道',
        deviceKind: 'ngfw',
        ip: '10.11.0.4',
      },
    ],
    isolationNodes: [
      {
        id: 'sg-ids-iii',
        label: '三区东西向流量探针(IDS)',
        subLabel: 'DS-02 · 调度管理三区监测',
        deviceKind: 'ids',
        ip: '10.11.10.1',
      },
      {
        id: 'sg-ids-104',
        label: 'IEC-104远动规约审计(IDS)',
        subLabel: 'DS-05 · 变电规约深度检测',
        deviceKind: 'ids',
        ip: '10.11.10.2',
      },
      {
        id: 'sg-gap-oneway',
        label: '正反向横向物理隔离装置',
        subLabel: 'DS-10 · 三区↔一区专用光闸',
        deviceKind: 'gatekeeper',
        ip: '10.11.10.9',
      },
    ],
    combos: [
      {
        id: 'sg-combo-dmz',
        label: '外网电力交易DMZ区',
        zoneCode: 'ZONE-IV · 电力市场外联域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'sg-combo-office',
        label: '信息管理大区(四区)',
        zoneCode: 'ZONE-III/IV · 营销与协同办公域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'sg-combo-mgmt',
        label: '生产管理区(安全三区)',
        zoneCode: 'ZONE-III · 调度OMS与现货管理域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'sg-combo-core',
        label: '实时控制区(安全一区)',
        zoneCode: 'ZONE-I · D5000调度主站与变电域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'sg-combo-dmz': [
        { id: 'sg-dmz-1', label: '华东电力交易门户', subLabel: '172.11.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sg-dmz-2', label: '售电公司申报API网关', subLabel: '172.11.1.12', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sg-dmz-3', label: '新能源功率预测前置', subLabel: '172.11.1.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-dmz-4', label: '外网电费清算缓存库', subLabel: '172.11.1.25', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sg-combo-office': [
        { id: 'sg-off-1', label: '调控中心OA工作站', subLabel: '192.168.11.21', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sg-off-2', label: '电网GIS地理信息终端', subLabel: '192.168.11.26', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sg-off-3', label: '营销用电采集工作站', subLabel: '192.168.11.33', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sg-off-4', label: '视频会商调度服务器', subLabel: '192.168.11.40', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-off-5', label: '电力文档归档存储库', subLabel: '192.168.11.55', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sg-combo-mgmt': [
        { id: 'sg-mgmt-1', label: '调度运行管理系统OMS', subLabel: '10.11.2.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sg-mgmt-2', label: '电力现货出清计算集群', subLabel: '10.11.2.20', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-mgmt-3', label: '广域相量历史库WAMS', subLabel: '10.11.2.30', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sg-mgmt-4', label: '四区特权运维堡垒机', subLabel: '10.11.2.42', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-mgmt-5', label: '继电保护定值整定终端', subLabel: '10.11.2.58', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'sg-combo-core': [
        { id: 'sg-core-ems', label: 'D5000能量管理主站EMS', subLabel: '10.99.11.8 · 前置主控', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-core-scada-db', label: 'SCADA调度主站数据库', subLabel: '10.99.11.10 · 核心靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sg-core-agc', label: 'AGC自动发电控制主机', subLabel: '10.99.11.15', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sg-core-rtu1', label: '500kV南桥变电站RTU', subLabel: '10.99.11.21 · IEC104', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sg-core-pmu', label: '同步相量测量装置PMU', subLabel: '10.99.11.28 · C37.118', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sg-core-avc', label: 'AVC自动电压控制PLC', subLabel: '10.99.11.36 · 遥调终端', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'sg-waf-trade',
      interceptText: '已拦截电价申报注入载荷',
      blockedTarget1Id: 'sg-off-1',
      blockedTarget2Id: 'sg-ids-iii',
      bypassIsolationId: 'sg-gap-oneway',
      coreHopNodeId: 'sg-core-ems',
      coreTargetNodeId: 'sg-core-scada-db',
      stage1Banner:
        '阶段 1（原始载荷受阻）：电力骨干路由 → 华东电力交易WAF-01 发射红色攻击流，WAF-01 护盾爆闪拦截原始 SQL/E-File 载荷',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：WAF-01 裂变 3 条紫色变体流光 — 2 条在四区办公与三区探针受阻，第 3 条伪造 E语言计划文本绕过横向隔离装置',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光经 D5000 主站直插【实时控制一区 → SCADA调度主站数据库】，触发红环爆闪与「! 已失陷」',
    },
  },

  // ============================================================================
  // 02 中国石油化工集团（镇海炼化智能工厂）— 3边界 + 3工控隔离 + [5-4-5-6] 炼化DCS拓扑
  // ============================================================================
  {
    unitId: '02',
    unitName: '中国石油化工集团（镇海炼化智能工厂）',
    shortName: '中石化·镇海炼化',
    industry: '能源行业',
    region: '浙江·宁波',
    targetSystem: '集散控制系统 (DCS) 工业上位机服务器',
    architectureTag: '石化工业互联网 · OPC-UA单向数采 · DCS/SIS双网隔离',
    layoutVariant: 'right-3gw-3iso',
    rootNode: {
      id: 'sp-core-router',
      label: '镇海炼化园区核心路由',
      subLabel: 'SINOPEC-GW · 218.0.12.1',
      ip: '218.0.12.1',
    },
    boundaryNodes: [
      {
        id: 'sp-ngfw-park',
        label: '炼化园区互联网防火墙',
        subLabel: 'DS-01 · 园区南北向包过滤',
        deviceKind: 'ngfw',
        ip: '10.12.0.1',
      },
      {
        id: 'sp-waf-scm',
        label: '原油供应链协同WAF-01',
        subLabel: 'DS-07 · 危化品物流API防护',
        deviceKind: 'waf',
        ip: '10.12.0.2',
      },
      {
        id: 'sp-waf-iot',
        label: '工业云边数据网关WAF-02',
        subLabel: 'DS-03 · MQTT/TLS双向鉴权',
        deviceKind: 'waf',
        ip: '10.12.0.3',
      },
    ],
    isolationNodes: [
      {
        id: 'sp-ids-mes',
        label: 'MES生产层流量探针(IDS)',
        subLabel: 'DS-02 · OPC-HDA异常监测',
        deviceKind: 'ids',
        ip: '10.12.10.1',
      },
      {
        id: 'sp-gap-opc',
        label: '工业数采单向隔离网闸',
        subLabel: 'DS-10 · MES↔DCS物理摆渡',
        deviceKind: 'gatekeeper',
        ip: '10.12.10.2',
      },
      {
        id: 'sp-ids-sis',
        label: 'SIS安全仪表旁路探针',
        subLabel: 'DS-09 · Triconex规约遥测',
        deviceKind: 'ids',
        ip: '10.12.10.3',
      },
    ],
    combos: [
      {
        id: 'sp-combo-dmz',
        label: '供应链与云边DMZ区',
        zoneCode: 'ZONE-01 · 原油贸易与外联域',
        borderColor: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.35)',
        fillColor: 'rgba(8, 28, 52, 0.52)',
      },
      {
        id: 'sp-combo-office',
        label: '炼化厂区综合办公区',
        zoneCode: 'ZONE-02 · 工艺设计与ERP终端域',
        borderColor: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.32)',
        fillColor: 'rgba(32, 22, 10, 0.48)',
      },
      {
        id: 'sp-combo-mgmt',
        label: 'MES生产执行管理区',
        zoneCode: 'ZONE-03 · 实时工艺历史库PHD域',
        borderColor: '#c084fc',
        glowColor: 'rgba(192, 132, 252, 0.35)',
        fillColor: 'rgba(30, 14, 48, 0.50)',
      },
      {
        id: 'sp-combo-core',
        label: 'DCS/SIS装置核心控制区',
        zoneCode: 'ZONE-04 · 千万吨常减压与催化裂化域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 34, 28, 0.52)',
      },
    ],
    zoneAssets: {
      'sp-combo-dmz': [
        { id: 'sp-dmz-1', label: '镇海炼化供应链门户', subLabel: '172.12.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sp-dmz-2', label: '危化品装车预约API', subLabel: '172.12.1.14', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-dmz-3', label: '工业云边MQTT汇聚机', subLabel: '172.12.1.19', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sp-dmz-4', label: 'DCS厂商远程诊断跳板', subLabel: '172.12.1.25', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sp-dmz-5', label: '外联港口罐区缓存库', subLabel: '172.12.1.30', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sp-combo-office': [
        { id: 'sp-off-1', label: '化工工艺仿真工作站', subLabel: '192.168.12.15', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sp-off-2', label: '炼厂ERP物资核算终端', subLabel: '192.168.12.22', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sp-off-3', label: 'LIMS化验室质检服务器', subLabel: '192.168.12.35', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-off-4', label: '厂区HSE环安监数据库', subLabel: '192.168.12.48', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sp-combo-mgmt': [
        { id: 'sp-mgmt-1', label: '炼化生产执行系统MES', subLabel: '10.12.2.10', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-mgmt-2', label: '实时工艺历史库PHD', subLabel: '10.12.2.18', deviceKind: 'database', ringStatus: 'probing' },
        { id: 'sp-mgmt-3', label: '全厂能耗优化计算服务器', subLabel: '10.12.2.26', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-mgmt-4', label: '工控双因子运维堡垒机', subLabel: '10.12.2.40', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-mgmt-5', label: '仪表组态只读备份库', subLabel: '10.12.2.55', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sp-combo-core': [
        { id: 'sp-core-dcs-srv', label: 'DCS工业上位机服务器', subLabel: '10.99.12.10 · 主控靶标', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sp-core-apc', label: '先进过程控制APC工作站', subLabel: '10.99.12.15 · 寻优控制器', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sp-core-batch-db', label: '乙烯裂解配方参数主库', subLabel: '10.99.12.20', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sp-core-sis-plc', label: '催化裂化SIS安全PLC', subLabel: '10.99.12.31 · Triconex', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sp-core-fcu-plc', label: '常减压蒸馏现场控制站', subLabel: '10.99.12.38 · FF总线', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sp-core-esd-plc', label: '紧急切断阀ESD联锁终端', subLabel: '10.99.12.45 · SIL3联锁', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'sp-waf-iot',
      interceptText: '已拦截畸形MQTT云边载荷',
      blockedTarget1Id: 'sp-ids-mes',
      blockedTarget2Id: 'sp-ids-sis',
      bypassIsolationId: 'sp-gap-opc',
      coreTargetNodeId: 'sp-core-dcs-srv',
      stage1Banner:
        '阶段 1（原始载荷受阻）：园区核心路由 → 工业云边数据网关WAF-02 发射红色载荷，WAF-02 触发红色护盾闪烁并阻断越权OPC请求',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：WAF-02 裂变 3 条紫色混淆流光 — 2 条在 MES 探针与 SIS 探针处熄灭，第 3 条利用 OPC-HDA 点表同步绕过工业数采网闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光穿透工业数采网闸直击【DCS核心控制区 → DCS工业上位机服务器】，上位机底座变红环闪烁并提示「! 已失陷」',
    },
  },

  // ============================================================================
  // 03 中国工商银行（总行数据中心上海嘉定园）— 3边界 + 2隔离 + [5-5-5-5] 金融账务主机拓扑
  // ============================================================================
  {
    unitId: '03',
    unitName: '中国工商银行（总行数据中心上海嘉定园）',
    shortName: '工商银行·嘉定数中',
    industry: '金融行业',
    region: '上海·嘉定',
    targetSystem: '核心账务主机与跨行清算支付网关',
    architectureTag: '两地三中心 · 跨行清算物理网闸 · 大型机总账核心 (3GW/2ISO)',
    layoutVariant: 'center-3gw-2iso',
    rootNode: {
      id: 'core-router',
      label: '总行骨干核心路由器',
      subLabel: 'ICBC-BGP · 202.108.10.1',
      ip: '202.108.10.1',
    },
    boundaryNodes: [
      {
        id: 'ngfw-01',
        label: '金融抗D边界防火墙(NGFW)',
        subLabel: 'DS-01 · 串联深度包过滤',
        deviceKind: 'ngfw',
        ip: '10.0.1.1',
      },
      {
        id: 'waf-01',
        label: '手机银行主力网关(WAF-01)',
        subLabel: 'DS-02 · 主力语义规则网关',
        deviceKind: 'waf',
        ip: '10.0.1.2',
      },
      {
        id: 'waf-02',
        label: '开放银行API网关(WAF-02)',
        subLabel: 'DS-07 · mTLS报文签名网关',
        deviceKind: 'waf',
        ip: '10.0.1.3',
      },
    ],
    isolationNodes: [
      {
        id: 'ids-01',
        label: '内网流量检测探针(IDS)',
        subLabel: 'DS-09 · 东西向交易流量探针',
        deviceKind: 'ids',
        ip: '10.10.0.2',
      },
      {
        id: 'gatekeeper-01',
        label: '支付清算安全隔离网闸',
        subLabel: 'DS-10 · 跨行报文物理剥离',
        deviceKind: 'gatekeeper',
        ip: '10.10.0.1',
      },
    ],
    combos: [
      {
        id: 'combo-dmz',
        label: '互联网金融DMZ区',
        zoneCode: 'ZONE-01 · 手机银行与开放API域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'combo-office',
        label: '总行综合办公区',
        zoneCode: 'ZONE-02 · 信贷审批与研发测试域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'combo-mgmt',
        label: '特权金库管理区',
        zoneCode: 'ZONE-03 · 双人复核堡垒与批量调度域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'combo-core',
        label: '核心业务区',
        zoneCode: 'ZONE-04 · 核心账务主机与跨行清算域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'combo-dmz': [
        { id: 'dmz-portal-srv', label: '个人网银门户前置机', subLabel: '172.16.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'dmz-api-gw', label: '开放银行API网关节点', subLabel: '172.16.1.12', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'dmz-dns-relay', label: 'SWIFT跨行外联前置', subLabel: '172.16.1.15', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'dmz-mail-relay', label: '企金银企直联中继机', subLabel: '172.16.1.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'dmz-redis-cache', label: '分布式会话令牌缓存库', subLabel: '172.16.1.20', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'combo-office': [
        { id: 'office-oa-term', label: '信贷风控办公终端-01', subLabel: '192.168.10.21', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'office-fin-term', label: '国际结算单证办公终端', subLabel: '192.168.10.25', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'office-dev-ws', label: '金融科技研发测试站', subLabel: '192.168.10.32', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'office-file-srv', label: '总行影像票据归档服务', subLabel: '192.168.10.50', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'office-print-srv', label: '内网电子回单打印主机', subLabel: '192.168.10.66', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'combo-mgmt': [
        { id: 'mgmt-bastion-srv', label: '金库双人复核堡垒机', subLabel: '10.20.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'mgmt-ad-dc', label: '全行统一域控认证主机', subLabel: '10.20.1.11', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mgmt-siem-db', label: '金融反欺诈SIEM审计库', subLabel: '10.20.1.18', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'mgmt-ca-kms', label: '国密根证书KMS密钥库', subLabel: '10.20.1.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mgmt-patch-ws', label: '日终清算批量调度终端', subLabel: '10.20.1.30', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'combo-core': [
        { id: 'core-acct-db', label: '核心账务数据库', subLabel: '10.99.0.10 · 主库靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'core-settle-srv', label: '跨行清算支付网关主机', subLabel: '10.99.0.12 · ISO20022', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'core-scada-srv', label: 'Z系列核心账务大型机', subLabel: '10.99.0.15 · Mainframe', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'core-batch-db', label: '日终总账批处理数据库', subLabel: '10.99.0.20', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'core-his-standby', label: '金融硬件加密机HSM集群', subLabel: '10.99.0.28 · PKCS#11', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'waf-01',
      interceptText: '已拦截原始载荷',
      blockedTarget1Id: 'office-oa-term',
      blockedTarget2Id: 'ids-01',
      bypassIsolationId: 'gatekeeper-01',
      coreTargetNodeId: 'core-acct-db',
      stage1Banner:
        '阶段 1（原始载荷受阻）：总行核心路由器 → 手机银行主力网关(WAF-01) 发射红色脉冲载荷，WAF-01 触发红色护盾闪烁并拦截原始攻击流量',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：WAF-01 向下并发裂变 3 条紫色混淆变体流光 — 2 条在总行办公区与 IDS 受阻熄灭，第 3 条高阶变体绕过支付清算安全隔离网闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光沿安全隔离网闸直插【核心业务区 → 核心账务数据库】，靶标底座转红环闪烁并触发「! 已失陷」告警',
    },
  },

  // ============================================================================
  // 04 上海证券交易所（金桥技术中心）— 4边界 + 2超低时延FPGA隔离 + [6-4-4-6] 证券撮合拓扑
  // ============================================================================
  {
    unitId: '04',
    unitName: '上海证券交易所（金桥技术中心）',
    shortName: '上交所·金桥中心',
    industry: '金融行业',
    region: '上海·浦东',
    targetSystem: '新一代核心交易撮合引擎集群',
    architectureTag: '证联网专线 · FPGA超低时延光闸 · SHM内存撮合总线 (4GW/2ISO)',
    layoutVariant: 'wide-4gw-2iso',
    rootNode: {
      id: 'sse-core-router',
      label: '证联网低时延核心交换机',
      subLabel: 'SSE-RDMA · 202.109.20.1',
      ip: '202.109.20.1',
    },
    boundaryNodes: [
      {
        id: 'sse-fw-member',
        label: '券商会员报盘防火墙',
        subLabel: 'DS-01 · 证联网席位接入墙',
        deviceKind: 'ngfw',
        ip: '10.14.0.1',
      },
      {
        id: 'sse-waf-step',
        label: 'STEP/FIX报盘校验网关',
        subLabel: 'DS-07 · 畸形委托硬件过滤',
        deviceKind: 'waf',
        ip: '10.14.0.2',
      },
      {
        id: 'sse-waf-md',
        label: 'L2高频行情发布防火墙',
        subLabel: 'DS-03 · FAST组播边界防护',
        deviceKind: 'waf',
        ip: '10.14.0.3',
      },
      {
        id: 'sse-fw-etf',
        label: '沪港通跨境交易网关墙',
        subLabel: 'DS-06 · 跨境专线加密网关',
        deviceKind: 'ngfw',
        ip: '10.14.0.4',
      },
    ],
    isolationNodes: [
      {
        id: 'sse-fpga-gate',
        label: 'FPGA超低时延交易隔离闸',
        subLabel: 'DS-10 · 纳秒级报盘物理隔离',
        deviceKind: 'gatekeeper',
        ip: '10.14.10.1',
      },
      {
        id: 'sse-opt-tap',
        label: '光学分光定单异常探针',
        subLabel: 'DS-09 · 高频晃单/撤单遥测',
        deviceKind: 'ids',
        ip: '10.14.10.2',
      },
    ],
    combos: [
      {
        id: 'sse-combo-dmz',
        label: '会员报盘与行情DMZ区',
        zoneCode: 'ZONE-01 · 券商STEP席位接入域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'sse-combo-office',
        label: '所内审核与办公研发区',
        zoneCode: 'ZONE-02 · 上市审核与指数研发域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'sse-combo-mgmt',
        label: '市场监察与PTP时钟区',
        zoneCode: 'ZONE-03 · 实时异常交易监控域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'sse-combo-core',
        label: '低时延核心撮合交易区',
        zoneCode: 'ZONE-04 · 竞价撮合引擎与成交主库域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'sse-combo-dmz': [
        { id: 'sse-dmz-1', label: '会员报盘前置网关-01', subLabel: '172.14.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sse-dmz-2', label: '量化极速柜台接入节点', subLabel: '172.14.1.11', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sse-dmz-3', label: 'Level-2十档行情发布机', subLabel: '172.14.1.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-dmz-4', label: '科创板盘后固定价前置', subLabel: '172.14.1.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-dmz-5', label: '债券质押回购报盘网关', subLabel: '172.14.1.26', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-dmz-6', label: '上市公司公告披露缓存库', subLabel: '172.14.1.30', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sse-combo-office': [
        { id: 'sse-off-1', label: '科创板发行审核终端', subLabel: '192.168.14.12', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sse-off-2', label: '上证指数编制研发站', subLabel: '192.168.14.19', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sse-off-3', label: '会员席位合规管理服务', subLabel: '192.168.14.28', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-off-4', label: '历史分笔行情归档库', subLabel: '192.168.14.40', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sse-combo-mgmt': [
        { id: 'sse-mgmt-1', label: '实时市场监察预警系统', subLabel: '10.14.2.10', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-mgmt-2', label: '纳秒级PTP铷原子钟主源', subLabel: '10.14.2.15 · IEEE1588', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sse-mgmt-3', label: '交易主机固件只读堡垒', subLabel: '10.14.2.22', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sse-mgmt-4', label: '异常报撤单画像审计库', subLabel: '10.14.2.35', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sse-combo-core': [
        { id: 'sse-core-bus', label: 'Aeron低时延定单总线', subLabel: '10.99.14.5 · RDMA交换', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-core-match1', label: '核心交易撮合主集群', subLabel: '10.99.14.10 · 撮合靶标', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sse-core-match2', label: '竞价撮合热备镜像集群', subLabel: '10.99.14.11 · SHM内存', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sse-core-orderdb', label: '全市场委托订单内存库', subLabel: '10.99.14.20 · NVMe-oF', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sse-core-clear', label: '日间实时成交清算引擎', subLabel: '10.99.14.25', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sse-core-etfdb', label: '期权保证金实时风控库', subLabel: '10.99.14.32', deviceKind: 'database', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'sse-waf-step',
      interceptText: '已拦截畸形FIX报盘载荷',
      blockedTarget1Id: 'sse-off-2',
      blockedTarget2Id: 'sse-opt-tap',
      bypassIsolationId: 'sse-fpga-gate',
      coreHopNodeId: 'sse-core-bus',
      coreTargetNodeId: 'sse-core-match1',
      stage1Banner:
        '阶段 1（原始载荷受阻）：证联网核心交换机 → STEP/FIX报盘校验网关 发射高频畸形委托，校验网关红盾闪烁拦截超长Tag载荷',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：STEP校验网关裂变 3 条紫色变体流光 — 2 条在研发网与光学分光探针处熄灭，第 3 条分片委托绕过 FPGA 交易隔离闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光经 Aeron 定单总线直击【低时延撮合区 → 核心交易撮合主集群】，主集群底座红环爆闪并提示「! 已失陷」',
    },
  },

  // ============================================================================
  // 05 中国国家铁路集团（12306 客票中心）— 3边界 + 3隔离 + [5-5-4-6] 高并发客票拓扑
  // ============================================================================
  {
    unitId: '05',
    unitName: '中国国家铁路集团（12306 客票中心）',
    shortName: '国铁集团·12306中心',
    industry: '交通与物流',
    region: '北京·海淀',
    targetSystem: '席位库存分配库与实名制核验核心库',
    architectureTag: '亿级并发抢票清洗 · 候补排队队列 · GemFire席位内存库 (3GW/3ISO)',
    layoutVariant: 'mesh-3gw-3iso',
    rootNode: {
      id: 'cr-core-router',
      label: '国铁客票双活核心路由器',
      subLabel: 'CR-12306-GW · 202.106.15.1',
      ip: '202.106.15.1',
    },
    boundaryNodes: [
      {
        id: 'cr-fw-bot',
        label: '公网恶意抢票清洗防火墙',
        subLabel: 'DS-01 · 刷票Bot流量清洗',
        deviceKind: 'ngfw',
        ip: '10.15.0.1',
      },
      {
        id: 'cr-waf-wait',
        label: '12306候补API风控网关',
        subLabel: 'DS-07 · 设备指纹与签名核验',
        deviceKind: 'waf',
        ip: '10.15.0.2',
      },
      {
        id: 'cr-fw-station',
        label: '全国车站窗口售票专网墙',
        subLabel: 'DS-03 · 路局专网TLS隔离',
        deviceKind: 'ngfw',
        ip: '10.15.0.3',
      },
    ],
    isolationNodes: [
      {
        id: 'cr-ids-api',
        label: '候补接口编码绕过探针',
        subLabel: 'DS-02 · 异常下单行为NDR',
        deviceKind: 'ids',
        ip: '10.15.10.1',
      },
      {
        id: 'cr-gap-ticket',
        label: '客票交易专网单向网闸',
        subLabel: 'DS-10 · 公网前置↔客票内网',
        deviceKind: 'gatekeeper',
        ip: '10.15.10.2',
      },
      {
        id: 'cr-ids-mem',
        label: 'GemFire内存库旁路探针',
        subLabel: 'DS-09 · 席位锁表监控探针',
        deviceKind: 'ids',
        ip: '10.15.10.3',
      },
    ],
    combos: [
      {
        id: 'cr-combo-dmz',
        label: '公网候补与余票DMZ区',
        zoneCode: 'ZONE-01 · 12306移动端与CDN加速域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'cr-combo-office',
        label: '铁科院客票研发办公区',
        zoneCode: 'ZONE-02 · 客运清分与客服座席域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'cr-combo-mgmt',
        label: '全国运力调配管理区',
        zoneCode: 'ZONE-03 · 运行图席位编排与堡垒域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'cr-combo-core',
        label: '席位库存与实名核验核心区',
        zoneCode: 'ZONE-04 · 席位分配库与实名制主库域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'cr-combo-dmz': [
        { id: 'cr-dmz-1', label: '公网候补下单API集群', subLabel: '172.15.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'cr-dmz-2', label: '全路余票查询Redis缓存', subLabel: '172.15.1.15', deviceKind: 'database', ringStatus: 'probing' },
        { id: 'cr-dmz-3', label: '图形验证码风控前置机', subLabel: '172.15.1.20', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-dmz-4', label: '微信支付宝支付回调网关', subLabel: '172.15.1.25', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-dmz-5', label: '车站自助售取票机接入站', subLabel: '172.15.1.32', deviceKind: 'server', ringStatus: 'safe' },
      ],
      'cr-combo-office': [
        { id: 'cr-off-1', label: '12306客服呼叫中心终端', subLabel: '192.168.15.11', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'cr-off-2', label: '客运收益清分结算工作站', subLabel: '192.168.15.18', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'cr-off-3', label: '春运压测仿真工作站', subLabel: '192.168.15.26', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'cr-off-4', label: '铁路常旅客积分服务器', subLabel: '192.168.15.38', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-off-5', label: '电子客票报销凭证归档库', subLabel: '192.168.15.50', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'cr-combo-mgmt': [
        { id: 'cr-mgmt-1', label: '全国列车运行图调配平台', subLabel: '10.15.2.12', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-mgmt-2', label: '客票中心特权运维堡垒机', subLabel: '10.15.2.18', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'cr-mgmt-3', label: '重联列车席位动态重算机', subLabel: '10.15.2.29', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-mgmt-4', label: '全路客流大数据预测库', subLabel: '10.15.2.45', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'cr-combo-core': [
        { id: 'cr-core-queue', label: 'RocketMQ候补排队调度器', subLabel: '10.99.15.8 · 异步队列', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-core-seatdb', label: '席位库存分配核心库', subLabel: '10.99.15.10 · 核心靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'cr-core-iddb', label: '实名制身份核验核心库', subLabel: '10.99.15.12 · 国密加密', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'cr-core-ctcs', label: '席位存根同步事务引擎', subLabel: '10.99.15.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cr-core-gate-plc', label: '全国高铁实名闸机授信主控', subLabel: '10.99.15.26 · 站台检票', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'cr-core-dr-db', label: '异地双活席位灾备内存库', subLabel: '10.99.15.35', deviceKind: 'database', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'cr-waf-wait',
      interceptText: '已拦截黄牛并发刷票载荷',
      blockedTarget1Id: 'cr-ids-api',
      blockedTarget2Id: 'cr-ids-mem',
      bypassIsolationId: 'cr-gap-ticket',
      coreTargetNodeId: 'cr-core-seatdb',
      stage1Banner:
        '阶段 1（原始载荷受阻）：国铁客票核心路由 → 12306候补API风控网关 发射高频抢票载荷，WAF 触发红色护盾闪烁并拦截原始注入请求',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：候补API网关裂变 3 条紫色混淆变体 — 2 条在编码绕过探针与内存库探针处熄灭，第 3 条利用序列化变体绕过客票单向网闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光穿透客票网闸直插【核心区 → 席位库存分配核心库】，席位主库红环爆闪并亮起「! 已失陷」角标',
    },
  },

  // ============================================================================
  // 06 中国东方航空集团（运行控制中心 AOC）— 3边界 + 2隔离 + [4-5-6-5] 民航签派拓扑
  // ============================================================================
  {
    unitId: '06',
    unitName: '中国东方航空集团（运行控制中心 AOC）',
    shortName: '东方航空·虹桥AOC',
    industry: '交通与物流',
    region: '上海·虹桥',
    targetSystem: '航班飞行签派系统与FOC核心数据库',
    architectureTag: 'ACARS地空数据链 · EFB电子飞行包mTLS · FOC运控核心 (3GW/2ISO)',
    layoutVariant: 'center-3gw-2iso',
    rootNode: {
      id: 'mu-core-router',
      label: '民航AOC运控核心路由器',
      subLabel: 'CEAIR-AOC · 210.82.16.1',
      ip: '210.82.16.1',
    },
    boundaryNodes: [
      {
        id: 'mu-fw-acars',
        label: '地空数据链边界防火墙',
        subLabel: 'DS-01 · ARINC-620甚高频防护',
        deviceKind: 'ngfw',
        ip: '10.16.0.1',
      },
      {
        id: 'mu-waf-efb',
        label: '机组EFB电子飞行包网关',
        subLabel: 'DS-07 · 机载航图mTLS双向鉴权',
        deviceKind: 'waf',
        ip: '10.16.0.2',
      },
      {
        id: 'mu-waf-sita',
        label: 'SITA国际航空电报网关',
        subLabel: 'DS-03 · Type-B电报格式过滤',
        deviceKind: 'waf',
        ip: '10.16.0.3',
      },
    ],
    isolationNodes: [
      {
        id: 'mu-ids-aoc',
        label: '航电签派指令流量探针',
        subLabel: 'DS-09 · 飞行计划报文遥测',
        deviceKind: 'ids',
        ip: '10.16.10.1',
      },
      {
        id: 'mu-gap-foc',
        label: '运控FOC安全隔离网闸',
        subLabel: 'DS-10 · 签派控制专网隔离',
        deviceKind: 'gatekeeper',
        ip: '10.16.10.2',
      },
    ],
    combos: [
      {
        id: 'mu-combo-dmz',
        label: '地空数据链与EFB接入区',
        zoneCode: 'ZONE-01 · ACARS地面站与机务外联域',
        borderColor: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'mu-combo-office',
        label: '虹桥基地航务办公区',
        zoneCode: 'ZONE-02 · 乘务排班与机务维修终端域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'mu-combo-mgmt',
        label: 'AOC签派大厅与气象管理区',
        zoneCode: 'ZONE-03 · 全球气象通告与总签派席位域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'mu-combo-core',
        label: 'FOC飞行签派核心控制区',
        zoneCode: 'ZONE-04 · 航班签派主库与载重配载域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'mu-combo-dmz': [
        { id: 'mu-dmz-1', label: 'ACARS甚高频报文接入机', subLabel: '172.16.6.8', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'mu-dmz-2', label: '机组数字化航图分发门户', subLabel: '172.16.6.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'mu-dmz-3', label: '空管AFTN电报同步前置', subLabel: '172.16.6.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-dmz-4', label: '外站机场离港缓存库', subLabel: '172.16.6.30', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'mu-combo-office': [
        { id: 'mu-off-1', label: '飞行机组排班终端-01', subLabel: '192.168.16.12', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'mu-off-2', label: '机务航线排故工程工作站', subLabel: '192.168.16.19', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'mu-off-3', label: '航空餐食与货邮配载终端', subLabel: '192.168.16.25', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'mu-off-4', label: '机队健康QAR译码服务器', subLabel: '192.168.16.38', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-off-5', label: '适航维修工卡文档库', subLabel: '192.168.16.52', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'mu-combo-mgmt': [
        { id: 'mu-mgmt-1', label: 'AOC总签派员指挥席位站', subLabel: '10.16.2.10', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'mu-mgmt-2', label: '全球航空气象库WXXM', subLabel: '10.16.2.14', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'mu-mgmt-3', label: '航行情报NOTAM解析机', subLabel: '10.16.2.20', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'mu-mgmt-4', label: 'AOC运控大厅运维堡垒机', subLabel: '10.16.2.28', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-mgmt-5', label: '延误航班动态恢复计算站', subLabel: '10.16.2.36', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-mgmt-6', label: '北斗/ADS-B机队态势终端', subLabel: '10.16.2.45', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'mu-combo-core': [
        { id: 'mu-core-disp', label: '航班飞行签派主控系统', subLabel: '10.99.16.8 · 放行签派', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-core-focdb', label: 'FOC核心运行数据库', subLabel: '10.99.16.10 · 核心靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'mu-core-load', label: '飞机载重平衡配载主机', subLabel: '10.99.16.16 · ARINC633', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'mu-core-fplib', label: '全机队计算机飞行计划库', subLabel: '10.99.16.22 · ARINC424', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'mu-core-navhsm', label: '机载导航数据库签名HSM', subLabel: '10.99.16.30 · 航电签名卡', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'mu-waf-efb',
      interceptText: '已拦截伪造EFB航图同步包',
      blockedTarget1Id: 'mu-off-1',
      blockedTarget2Id: 'mu-ids-aoc',
      bypassIsolationId: 'mu-gap-foc',
      coreHopNodeId: 'mu-core-disp',
      coreTargetNodeId: 'mu-core-focdb',
      stage1Banner:
        '阶段 1（原始载荷受阻）：民航AOC核心路由 → 机组EFB电子飞行包网关 发射红色恶意航图包，EFB网关触发红色护盾闪烁并拦截',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：EFB网关裂变 3 条紫色混淆流光 — 2 条在航务办公区与航电探针处受阻熄灭，第 3 条伪造SITA电报绕过FOC安全隔离网闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光经飞行签派主控直插【FOC核心控制区 → FOC核心运行数据库】，触发底座红环闪烁与「! 已失陷」',
    },
  },

  // ============================================================================
  // 07 中国移动通信集团（南方基地核心网节点）— 4边界 + 3信令隔离 + [5-4-5-6] 5G核心网拓扑
  // ============================================================================
  {
    unitId: '07',
    unitName: '中国移动通信集团（南方基地核心网节点）',
    shortName: '中国移动·南方基地',
    industry: '通信与广电',
    region: '广东·广州',
    targetSystem: '5G 核心网用户归属位置寄存器 (UDM/HSS)',
    architectureTag: '3GPP-SBA服务化架构 · SEPP漫游边界 · UDM/UDR根密钥专网 (4GW/3ISO)',
    layoutVariant: 'left-4gw-3iso',
    rootNode: {
      id: 'cm-core-router',
      label: '5G核心网IP承载网路由器',
      subLabel: 'CMNET-5GC · 211.136.17.1',
      ip: '211.136.17.1',
    },
    boundaryNodes: [
      {
        id: 'cm-fw-sepp',
        label: 'N32国际漫游信令防火墙',
        subLabel: 'DS-01 · SEPP网间信令风暴墙',
        deviceKind: 'ngfw',
        ip: '10.17.0.1',
      },
      {
        id: 'cm-waf-nef',
        label: '5G能力开放网元网关(NEF)',
        subLabel: 'DS-07 · SBI-HTTPS鉴权网关',
        deviceKind: 'waf',
        ip: '10.17.0.2',
      },
      {
        id: 'cm-waf-ims',
        label: 'VoNR新通话信令接入墙',
        subLabel: 'DS-03 · SIP/RTP媒体面过滤',
        deviceKind: 'waf',
        ip: '10.17.0.3',
      },
      {
        id: 'cm-fw-gnb',
        label: '5G基站N2/N3回传防火墙',
        subLabel: 'DS-06 · NGAP/SCTP隧道守卫',
        deviceKind: 'ngfw',
        ip: '10.17.0.4',
      },
    ],
    isolationNodes: [
      {
        id: 'cm-ids-sbi',
        label: '5G-SBI服务化总线探针',
        subLabel: 'DS-09 · HTTP/2信令分光检测',
        deviceKind: 'ids',
        ip: '10.17.10.1',
      },
      {
        id: 'cm-gap-omc',
        label: 'OMC网管与信令面隔离闸',
        subLabel: 'DS-10 · 4A网管↔5G控制面网闸',
        deviceKind: 'gatekeeper',
        ip: '10.17.10.2',
      },
      {
        id: 'cm-ids-gtp',
        label: 'UPF用户面GTP-U流量探针',
        subLabel: 'DS-02 · 核心网隧道异常监测',
        deviceKind: 'ids',
        ip: '10.17.10.3',
      },
    ],
    combos: [
      {
        id: 'cm-combo-dmz',
        label: '5G漫游与能力开放DMZ区',
        zoneCode: 'ZONE-01 · SEPP边缘代理与NEF开放域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'cm-combo-office',
        label: '南方基地BOSS支撑办公区',
        zoneCode: 'ZONE-02 · 计费账务与网优工程终端域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'cm-combo-mgmt',
        label: 'OMC集中网管与电信云管理区',
        zoneCode: 'ZONE-03 · MANO编排器与4A特权堡垒域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'cm-combo-core',
        label: '5G核心网UDM/HSS根密钥区',
        zoneCode: 'ZONE-04 · 归属位置寄存器与签约主库域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'cm-combo-dmz': [
        { id: 'cm-dmz-1', label: '网间安全边缘代理SEPP', subLabel: '172.17.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'cm-dmz-2', label: '5G能力开放网元NEF前置', subLabel: '172.17.1.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'cm-dmz-3', label: '物联网专网APN接入网关', subLabel: '172.17.1.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-dmz-4', label: 'VoNR边界会话控制器SBC', subLabel: '172.17.1.28', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-dmz-5', label: '边缘MEC切片令牌缓存库', subLabel: '172.17.1.35', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'cm-combo-office': [
        { id: 'cm-off-1', label: '无线网优路测分析工作站', subLabel: '192.168.17.14', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'cm-off-2', label: '政企5G专网开通办公终端', subLabel: '192.168.17.20', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'cm-off-3', label: 'BOSS实时融合计费服务器', subLabel: '192.168.17.32', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-off-4', label: '省际漫游话单清分数据库', subLabel: '192.168.17.45', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'cm-combo-mgmt': [
        { id: 'cm-mgmt-1', label: '核心网集中网管系统OMC', subLabel: '10.17.2.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'cm-mgmt-2', label: '电信云NFV编排器MANO', subLabel: '10.17.2.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-mgmt-3', label: '南方基地4A统一认证堡垒', subLabel: '10.17.2.30', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-mgmt-4', label: '信令追踪全流量审计库', subLabel: '10.17.2.42', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'cm-mgmt-5', label: '虚拟网元镜像仓库终端', subLabel: '10.17.2.55', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'cm-combo-core': [
        { id: 'cm-core-amf', label: '接入移动管理网元AMF', subLabel: '10.99.17.6 · 3GPP-SBI', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-core-udm', label: '5G归属位置寄存器UDM/HSS', subLabel: '10.99.17.8 · 核心靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'cm-core-udr', label: '全网签约根密钥库UDR', subLabel: '10.99.17.12 · Ki根密钥', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'cm-core-ausf', label: '5G-AKA鉴权服务网元AUSF', subLabel: '10.99.17.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-core-nrf', label: '核心网元注册中心NRF', subLabel: '10.99.17.25 · OAuth2', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'cm-core-usim-hsm', label: 'eSIM/USIM根密钥加密机', subLabel: '10.99.17.32 · 电信HSM', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'cm-waf-nef',
      interceptText: '已拦截伪造SBI-OAuth2信令',
      blockedTarget1Id: 'cm-ids-sbi',
      blockedTarget2Id: 'cm-ids-gtp',
      bypassIsolationId: 'cm-gap-omc',
      coreTargetNodeId: 'cm-core-udm',
      stage1Banner:
        '阶段 1（原始载荷受阻）：5G承载网核心路由 → 5G能力开放网关(NEF) 发射伪造HTTP/2信令，NEF网关红盾闪烁并拦截越权订阅请求',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：NEF网关裂变 3 条紫色混淆信令流 — 2 条在 SBI 探针与 GTP 探针处熄灭，第 3 条伪造 NETCONF 指令绕过 OMC 隔离闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光穿透隔离闸直插【5G核心网区 → 归属位置寄存器UDM/HSS】，靶标底座转红环闪烁并触发「! 已失陷」',
    },
  },

  // ============================================================================
  // 08 阿里云计算有限公司（张北超级智算中心）— 4边界 + 2隔离 + [4-4-6-6] 飞天云与神龙硬件拓扑
  // ============================================================================
  {
    unitId: '08',
    unitName: '阿里云计算有限公司（张北超级智算中心）',
    shortName: '阿里云·张北智算',
    industry: '通信与广电',
    region: '河北·张家口',
    targetSystem: '飞天云底座核心虚拟化管理集群 (神龙管控节点)',
    architectureTag: '洛神vXLAN虚拟网 · 天基自动化运维 · 神龙MOC硬件芯片隔离 (4GW/2ISO)',
    layoutVariant: 'wide-4gw-2iso',
    rootNode: {
      id: 'ali-core-router',
      label: '张北智算中心T级骨干路由',
      subLabel: 'APSARA-BGP · 47.92.18.1',
      ip: '47.92.18.1',
    },
    boundaryNodes: [
      {
        id: 'ali-fw-ddos',
        label: '云盾T级抗D边界防火墙',
        subLabel: 'DS-01 · Anycast流量清洗',
        deviceKind: 'ngfw',
        ip: '10.18.0.1',
      },
      {
        id: 'ali-waf-openapi',
        label: '飞天OpenAPI管控网关',
        subLabel: 'DS-07 · AK/SK签名与RAM鉴权',
        deviceKind: 'waf',
        ip: '10.18.0.2',
      },
      {
        id: 'ali-waf-pai',
        label: '灵骏AI大模型训推API墙',
        subLabel: 'DS-03 · 智算租户容器网关',
        deviceKind: 'waf',
        ip: '10.18.0.3',
      },
      {
        id: 'ali-fw-vpc',
        label: '洛神弹性公网EIP边界墙',
        subLabel: 'DS-06 · 租户VPC南北向隔离',
        deviceKind: 'ngfw',
        ip: '10.18.0.4',
      },
    ],
    isolationNodes: [
      {
        id: 'ali-ndr-ew',
        label: '管控面东西向RPC探针(NDR)',
        subLabel: 'DS-02 · 租户逃逸行为监测',
        deviceKind: 'ids',
        ip: '10.18.10.1',
      },
      {
        id: 'ali-gap-moc',
        label: '租户面↔飞天管控硬件隔离闸',
        subLabel: 'DS-10 · 神龙MOC物理隔离桥',
        deviceKind: 'gatekeeper',
        ip: '10.18.10.2',
      },
    ],
    combos: [
      {
        id: 'ali-combo-dmz',
        label: '洛神公网接入与API暴露区',
        zoneCode: 'ZONE-01 · LVS四层负载与OpenAPI域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'ali-combo-office',
        label: '张北智算园区SRE办公区',
        zoneCode: 'ZONE-02 · 算力调度坐席与硬件巡检域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'ali-combo-mgmt',
        label: '天基自动化运维管理区',
        zoneCode: 'ZONE-03 · 天基跳板集群与云KMS根密钥域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'ali-combo-core',
        label: '飞天云底座与神龙硬件核心区',
        zoneCode: 'ZONE-04 · 伏羲调度集群与神龙MOC管控域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'ali-combo-dmz': [
        { id: 'ali-dmz-1', label: '洛神四层负载均衡LVS', subLabel: '172.18.1.5', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'ali-dmz-2', label: '飞天OpenAPI接入前置集群', subLabel: '172.18.1.12', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'ali-dmz-3', label: '百炼AI模型推理接入网关', subLabel: '172.18.1.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'ali-dmz-4', label: 'RAM访问控制会话缓存库', subLabel: '172.18.1.25', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'ali-combo-office': [
        { id: 'ali-off-1', label: '智算中心SRE值班工作站', subLabel: '192.168.18.11', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'ali-off-2', label: '液冷机房环控巡检终端', subLabel: '192.168.18.19', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'ali-off-3', label: 'GPU故障诊断工程服务器', subLabel: '192.168.18.30', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'ali-off-4', label: '备件资产与工单数据库', subLabel: '192.168.18.42', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'ali-combo-mgmt': [
        { id: 'ali-mgmt-1', label: '天基全网自动化运维主控', subLabel: '10.18.2.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'ali-mgmt-2', label: '零信任特权运维跳板机', subLabel: '10.18.2.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'ali-mgmt-3', label: '云平台根密钥中心KMS', subLabel: '10.18.2.22', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'ali-mgmt-4', label: '安骑士HIDS告警聚合库', subLabel: '10.18.2.30', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'ali-mgmt-5', label: '宿主机固件OTA签名服务', subLabel: '10.18.2.38', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'ali-mgmt-6', label: '集群容器镜像安全扫描端', subLabel: '10.18.2.48', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'ali-combo-core': [
        { id: 'ali-core-fuxi', label: '飞天伏羲万卡调度主集群', subLabel: '10.99.18.8 · Apsara主控', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'ali-core-moc', label: '神龙管控节点硬件卡MOC', subLabel: '10.99.18.10 · 核心靶标', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'ali-core-pangu', label: '盘古分布式存储元数据主库', subLabel: '10.99.18.15 · PanguMaster', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'ali-core-sdn', label: '洛神SDN虚拟网主控制器', subLabel: '10.99.18.20 · OpenFlow', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'ali-core-roce', label: '万卡智算RoCEv2交换矩阵', subLabel: '10.99.18.28 · RDMA无损网', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'ali-core-bmc', label: '神龙裸金属带外管控BMC', subLabel: '10.99.18.36 · Redfish', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'ali-waf-openapi',
      interceptText: '已拦截租户AK/SK越权载荷',
      blockedTarget1Id: 'ali-off-2',
      blockedTarget2Id: 'ali-ndr-ew',
      bypassIsolationId: 'ali-gap-moc',
      coreHopNodeId: 'ali-core-fuxi',
      coreTargetNodeId: 'ali-core-moc',
      stage1Banner:
        '阶段 1（原始载荷受阻）：张北智算骨干路由 → 飞天OpenAPI管控网关 发射红色越权请求，OpenAPI网关红盾闪烁并阻断伪造签名流量',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：OpenAPI网关裂变 3 条紫色变体流光 — 2 条在园区终端与东西向NDR受阻，第 3 条利用VirtIO半虚拟化通道绕过管控隔离闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光经飞天伏羲集群直击【飞天核心区 → 神龙管控节点硬件卡MOC】，靶标底座转红环闪烁并触发「! 已失陷」',
    },
  },

  // ============================================================================
  // 09 北京协和医院（东单院区信息中心）— 3边界 + 2隔离 + [4-6-5-5] 医疗HIS/EMR拓扑
  // ============================================================================
  {
    unitId: '09',
    unitName: '北京协和医院（东单院区信息中心）',
    shortName: '北京协和·东单信息中心',
    industry: '公共服务与医疗',
    region: '北京·东城',
    targetSystem: 'HIS 医院信息系统核心库与电子病历 (EMR) 存储',
    architectureTag: '互联网医院诊疗前置 · 第三方器械VPN · HIS/EMR核心存储 (3GW/2ISO)',
    layoutVariant: 'right-3gw-3iso',
    rootNode: {
      id: 'pu-core-router',
      label: '东单院区核心汇聚路由器',
      subLabel: 'PUMCH-GW · 202.112.19.1',
      ip: '202.112.19.1',
    },
    boundaryNodes: [
      {
        id: 'pu-fw-hosp',
        label: '院区互联网边界防火墙',
        subLabel: 'DS-01 · 互联网诊疗接入墙',
        deviceKind: 'ngfw',
        ip: '10.19.0.1',
      },
      {
        id: 'pu-waf-reg',
        label: '掌上协和挂号API网关',
        subLabel: 'DS-07 · 患者报告查询WAF',
        deviceKind: 'waf',
        ip: '10.19.0.2',
      },
      {
        id: 'pu-fw-vpn',
        label: '医疗设备远程维护VPN网关',
        subLabel: 'DS-06 · 第三方厂商SSL-VPN',
        deviceKind: 'ngfw',
        ip: '10.19.0.3',
      },
    ],
    isolationNodes: [
      {
        id: 'pu-ids-span',
        label: '院内病历东西向流量探针',
        subLabel: 'DS-09 · HL7/DICOM流量监测',
        deviceKind: 'ids',
        ip: '10.19.10.1',
      },
      {
        id: 'pu-gap-his',
        label: 'HIS医疗内网安全隔离网关',
        subLabel: 'DS-03 · 外联诊疗↔院内核心网',
        deviceKind: 'gatekeeper',
        ip: '10.19.10.2',
      },
    ],
    combos: [
      {
        id: 'pu-combo-dmz',
        label: '互联网医院诊疗DMZ区',
        zoneCode: 'ZONE-01 · 预约挂号与医保外联前置域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'pu-combo-office',
        label: '门诊诊室与科研办公区',
        zoneCode: 'ZONE-02 · 医生工作站与远程会诊终端域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'pu-combo-mgmt',
        label: '信息中心ESB与运维管理区',
        zoneCode: 'ZONE-03 · 院内信息集成总线与跳板机域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'pu-combo-core',
        label: 'HIS与EMR电子病历核心区',
        zoneCode: 'ZONE-04 · 医院信息核心库与ICU监护域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'pu-combo-dmz': [
        { id: 'pu-dmz-1', label: '互联网诊疗挂号前置机', subLabel: '172.19.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'pu-dmz-2', label: '检验影像云胶片查询门户', subLabel: '172.19.1.15', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'pu-dmz-3', label: '国家医保结算专线前置机', subLabel: '172.19.1.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'pu-dmz-4', label: '第三方器械厂商维护跳板', subLabel: '172.19.1.30', deviceKind: 'terminal', ringStatus: 'probing' },
      ],
      'pu-combo-office': [
        { id: 'pu-off-1', label: '门诊医生电子处方工作站', subLabel: '192.168.19.11', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'pu-off-2', label: '放射科阅片诊断终端PACS', subLabel: '192.168.19.18', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'pu-off-3', label: '住院护士站医嘱核对终端', subLabel: '192.168.19.25', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'pu-off-4', label: '药房自动发药机控制终端', subLabel: '192.168.19.32', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'pu-off-5', label: '罕见病临床科研分析服务', subLabel: '192.168.19.45', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'pu-off-6', label: '院内行政OA排班数据库', subLabel: '192.168.19.58', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'pu-combo-mgmt': [
        { id: 'pu-mgmt-1', label: '院内信息集成总线ESB', subLabel: '10.19.2.10 · HL7/FHIR', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'pu-mgmt-2', label: '信息中心远程运维跳板机', subLabel: '10.19.2.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'pu-mgmt-3', label: '患者主索引EMPI管理服务', subLabel: '10.19.2.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'pu-mgmt-4', label: '医疗隐私数据脱敏审计库', subLabel: '10.19.2.35', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'pu-mgmt-5', label: '医学设备补丁管控工作站', subLabel: '10.19.2.48', deviceKind: 'terminal', ringStatus: 'safe' },
      ],
      'pu-combo-core': [
        { id: 'pu-core-hisdb', label: 'HIS医院信息核心数据库', subLabel: '10.99.19.10 · Oracle-DG', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'pu-core-emrsan', label: '电子病历EMR核心存储库', subLabel: '10.99.19.12 · 核心靶标', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'pu-core-hisapp', label: '门急诊医嘱计价核心集群', subLabel: '10.99.19.18', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'pu-core-lis', label: 'LIS临床检验核心数据库', subLabel: '10.99.19.25', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'pu-core-icu-plc', label: 'ICU生命体征中央监护网关', subLabel: '10.99.19.35 · HL7-MLLP', deviceKind: 'plc', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'pu-fw-vpn',
      interceptText: '已拦截异常器械维护爆破',
      blockedTarget1Id: 'pu-off-1',
      blockedTarget2Id: 'pu-ids-span',
      bypassIsolationId: 'pu-gap-his',
      coreTargetNodeId: 'pu-core-emrsan',
      stage1Banner:
        '阶段 1（原始载荷受阻）：东单院区核心路由 → 医疗设备远程维护VPN网关 发射红色渗透流量，VPN网关触发红色护盾闪烁并拦截暴力破解载荷',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：远程维护VPN网关裂变 3 条紫色变体流光 — 2 条在门诊诊室与流量探针受阻，第 3 条盗用器械维护凭证绕过HIS安全隔离网关',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光穿透隔离网关直插【HIS/EMR核心区 → 电子病历EMR核心存储库】，病历主库红环爆闪并触发「! 已失陷」',
    },
  },

  // ============================================================================
  // 10 深圳水务集团（东湖水厂自动化泵站）— 3边界 + 3工控隔离 + [4-4-5-7->6] 水务PLC拓扑
  // ============================================================================
  {
    unitId: '10',
    unitName: '深圳水务集团（东湖水厂自动化泵站）',
    shortName: '深圳水务·东湖泵站',
    industry: '公共服务与医疗',
    region: '广东·深圳',
    targetSystem: '水质在线监测与加氯加药 PLC 控制终端',
    architectureTag: '自来水净水硬件在环 · 工业单向网闸 · Modbus/DNP3泵站控制 (3GW/3ISO)',
    layoutVariant: 'mesh-3gw-3iso',
    rootNode: {
      id: 'sw-core-router',
      label: '水务集团城域核心路由器',
      subLabel: 'SZWATER-GW · 202.96.134.1',
      ip: '202.96.134.1',
    },
    boundaryNodes: [
      {
        id: 'sw-ngfw-ext',
        label: '东湖水厂互联网边界墙',
        subLabel: 'DS-01 · 串联深度包过滤',
        deviceKind: 'ngfw',
        ip: '10.20.0.1',
      },
      {
        id: 'sw-waf-portal',
        label: '智慧水务门户网关(WAF-01)',
        subLabel: 'DS-07 · 营收与管网GIS网关',
        deviceKind: 'waf',
        ip: '10.20.0.2',
      },
      {
        id: 'sw-ngfw-vpn',
        label: '泵站远程运维IPsec网关',
        subLabel: 'DS-06 · 远动巡检VPN接入',
        deviceKind: 'ngfw',
        ip: '10.20.0.3',
      },
    ],
    isolationNodes: [
      {
        id: 'sw-ids-ics',
        label: '工业流量异常检测(IDS)',
        subLabel: 'DS-02 · OPC/Modbus深度检测',
        deviceKind: 'ids',
        ip: '10.20.10.1',
      },
      {
        id: 'sw-gap-oneway',
        label: '水厂工业物理单向隔离网闸',
        subLabel: 'DS-10 · 管理区↔SCADA控制区',
        deviceKind: 'gatekeeper',
        ip: '10.20.10.2',
      },
      {
        id: 'sw-ids-field',
        label: '工控现场旁路遥测探针',
        subLabel: 'DS-09 · 泵站总线SPAN镜像',
        deviceKind: 'ids',
        ip: '10.20.10.3',
      },
    ],
    combos: [
      {
        id: 'sw-combo-dmz',
        label: '智慧水务门户DMZ区',
        zoneCode: 'ZONE-01 · 市政管网GIS与远传表接入域',
        borderColor: '#00e5ff',
        glowColor: 'rgba(0, 229, 255, 0.35)',
        fillColor: 'rgba(6, 26, 52, 0.52)',
      },
      {
        id: 'sw-combo-office',
        label: '水务运营与化验办公区',
        zoneCode: 'ZONE-02 · 水质化验室与管网抢修终端域',
        borderColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.32)',
        fillColor: 'rgba(30, 24, 14, 0.48)',
      },
      {
        id: 'sw-combo-mgmt',
        label: '水厂工程师与历史库管理区',
        zoneCode: 'ZONE-03 · 运维工程师站与工艺Historian域',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.35)',
        fillColor: 'rgba(28, 15, 48, 0.50)',
      },
      {
        id: 'sw-combo-core',
        label: '加氯加药PLC与SCADA核心区',
        zoneCode: 'ZONE-04 · 东湖泵站SCADA主站与现场PLC域',
        borderColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        fillColor: 'rgba(8, 33, 30, 0.52)',
      },
    ],
    zoneAssets: {
      'sw-combo-dmz': [
        { id: 'sw-dmz-1', label: '智慧水务公众服务门户', subLabel: '172.20.1.10', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sw-dmz-2', label: 'NB-IoT智能水表采集网关', subLabel: '172.20.1.15', deviceKind: 'server', ringStatus: 'probing' },
        { id: 'sw-dmz-3', label: '市政供水管网GIS发布机', subLabel: '172.20.1.22', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sw-dmz-4', label: '水务水费营收前置缓存库', subLabel: '172.20.1.28', deviceKind: 'database', ringStatus: 'safe' },
      ],
      'sw-combo-office': [
        { id: 'sw-off-1', label: '水质检测中心化验终端', subLabel: '192.168.20.12', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sw-off-2', label: '爆管应急抢修调度工作站', subLabel: '192.168.20.18', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sw-off-3', label: '东江水源地视频监控服务', subLabel: '192.168.20.30', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sw-off-4', label: '水厂日常巡检工单数据库', subLabel: '192.168.20.45', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sw-off-5', label: '厂区周界安防门禁主机', subLabel: '192.168.20.58', deviceKind: 'server', ringStatus: 'safe' },
      ],
      'sw-combo-mgmt': [
        { id: 'sw-mgmt-1', label: '水厂SCADA运维工程师站', subLabel: '10.20.2.22 · 梯形图组态', deviceKind: 'terminal', ringStatus: 'probing' },
        { id: 'sw-mgmt-2', label: '水质工艺实时历史库', subLabel: '10.20.2.105 · Historian', deviceKind: 'database', ringStatus: 'probing' },
        { id: 'sw-mgmt-3', label: '工程特权凭据金库Vault', subLabel: '10.20.2.80', deviceKind: 'database', ringStatus: 'safe' },
        { id: 'sw-mgmt-4', label: '水厂运维会话审计堡垒机', subLabel: '10.20.2.60', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sw-mgmt-5', label: '水力管网压降仿真服务器', subLabel: '10.20.2.90', deviceKind: 'server', ringStatus: 'safe' },
      ],
      'sw-combo-core': [
        { id: 'sw-core-scadagw', label: '泵站SCADA中心汇聚网关', subLabel: '192.168.1.1 · OPC-UA', deviceKind: 'server', ringStatus: 'safe' },
        { id: 'sw-core-plc03', label: '3号加氯加药PLC控制终端', subLabel: '192.168.10.12 · 核心靶标', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sw-core-rtu', label: '取水口高压电动阀门RTU', subLabel: '192.168.10.18 · DNP3', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sw-core-pump-plc', label: '二级送水变频泵组PLC-01', subLabel: '192.168.10.25 · Modbus', deviceKind: 'plc', ringStatus: 'safe' },
        { id: 'sw-core-hmi', label: '中控室余氯浊度在线监测屏', subLabel: '192.168.10.5 · 工业HMI', deviceKind: 'terminal', ringStatus: 'safe' },
        { id: 'sw-core-rec-db', label: '出厂水质国标联锁配方库', subLabel: '192.168.10.30', deviceKind: 'database', ringStatus: 'safe' },
      ],
    },
    attackPath: {
      entryBoundaryId: 'sw-waf-portal',
      interceptText: '已拦截原始水务门户载荷',
      blockedTarget1Id: 'sw-ids-ics',
      blockedTarget2Id: 'sw-ids-field',
      bypassIsolationId: 'sw-gap-oneway',
      coreHopNodeId: 'sw-core-scadagw',
      coreTargetNodeId: 'sw-core-plc03',
      stage1Banner:
        '阶段 1（原始载荷受阻）：水务城域路由器 → 智慧水务门户网关(WAF-01) 发射红色渗透载荷，WAF-01 触发红色护盾闪烁并拦截原始攻击流量',
      stage2Banner:
        '阶段 2（智能体裂变多变体）：WAF-01 裂变 3 条紫色混淆变体 — 2 条在工业IDS与现场探针处熄灭，第 3 条利用OPC历史点表摆渡绕过工业单向网闸',
      stage3Banner:
        '阶段 3（跨区穿透打穿核心靶标）：逃逸紫红流光经泵站SCADA中心网关直插【核心区 → 3号加氯加药PLC控制终端 (S-127 T0855)】，底座红环闪烁并触发「! 已失陷」',
    },
  },
];

/**
 * 10 家全国重点关基单位 G6 拓扑字典（按 '01' ~ '10' 索引）
 */
export const CIIO_G6_SANDBOX_TOPOLOGIES: Record<string, UnitSandboxTopologyBundle> =
  Object.fromEntries(
    UNIT_BLUEPRINTS.map((bp) => {
      const bundle = buildUnitTopologyBundle(bp);
      return [bp.unitId, bundle];
    })
  );

/**
 * 获取指定关基单位（'01' ~ '10'）的专属 G6 靶场拓扑沙盘数据包
 */
export function getG6SandboxTopologyByUnit(unitId?: string): UnitSandboxTopologyBundle {
  if (unitId && CIIO_G6_SANDBOX_TOPOLOGIES[unitId]) {
    return CIIO_G6_SANDBOX_TOPOLOGIES[unitId];
  }
  return CIIO_G6_SANDBOX_TOPOLOGIES['03'];
}

/**
 * 默认导出（兼容既有引用，指向 '03' 金融账务核心标准 20 资产拓扑）
 */
const DEFAULT_BUNDLE = CIIO_G6_SANDBOX_TOPOLOGIES['03'];
export const SANDBOX_COMBOS: SandboxComboConfig[] = DEFAULT_BUNDLE.combos;
export const SANDBOX_NODES: SandboxNodeConfig[] = DEFAULT_BUNDLE.nodes;
export const SANDBOX_EDGES: SandboxEdgeConfig[] = DEFAULT_BUNDLE.edges;
export const ESCAPE_STAGE_TIMELINE: Record<1 | 2 | 3, EscapeStageMeta> =
  DEFAULT_BUNDLE.escapeConfig.timeline;
