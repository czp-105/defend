import {
  TopologyNode,
  DefenseDeploymentPoint,
  TopologyLink,
} from '../types/cidtp';

export type CiioBeaconStatus = 'green' | 'yellow' | 'red';

export type CiioIndustry =
  | '能源行业'
  | '金融行业'
  | '交通与物流'
  | '通信与广电'
  | '公共服务与医疗';

export interface CiioUnitItem {
  id: string; // '01' ~ '10'
  industryOrder: number;
  industry: CiioIndustry;
  name: string;
  shortName: string;
  region: string;
  targetSystem: string;
  lngLat: [number, number]; // 真实高德 GCJ-02 精准经纬度
  labelOffset: [number, number]; // 精准锚定坐标点下铭牌引线偏移 [dx, dy] px，确保同城真实坐标点绝不遮挡
  status: CiioBeaconStatus;
  penetrationDepth: 0 | 1 | 2 | 3; // 0: 防线稳固, 1~2: 边界失守, 3: 重大隐患(核心击穿)
  breachedZoneText: string;
  policeJurisdiction: string;
  linkedCampaignCode: string;
  defenseRate: number;
  activeAlerts: number;
  lastInspectionTime: string;
  incidentSummary: string;
}

export interface CiioUnitTopologyBundle {
  unitId: string;
  fidelity: string;
  nodes: TopologyNode[];
  deployments: DefenseDeploymentPoint[];
  links: TopologyLink[];
  reviewSummary: {
    assetSummary: string;
    defenseSummary: string;
    boundaryStatus: string;
    hasBoundaryAlert: boolean;
  };
}

export const INITIAL_CIIO_UNITS: CiioUnitItem[] = [
  // 1. 能源行业
  {
    id: '01',
    industryOrder: 1,
    industry: '能源行业',
    name: '国家电网有限公司（华东调控分中心）',
    shortName: '国家电网·华东调控',
    region: '上海·浦东',
    targetSystem: '电力监控系统 (SCADA) 调度主站数据库',
    lngLat: [121.5447, 31.2225],
    labelOffset: [-198, -38],
    status: 'yellow',
    penetrationDepth: 1,
    breachedZoneText: 'DMZ 外网办公门户边界失守 · 调度控制区正向物理隔离装置正常阻断',
    policeJurisdiction: '上海市公安局网安总队 · 浦东分局',
    linkedCampaignCode: 'B3-GRID-2026-05',
    defenseRate: 84.5,
    activeAlerts: 19,
    lastInspectionTime: '2026-11-13 13:12:08',
    incidentSummary: '检测到针对外网电力信息门户的 T1190 漏洞利用触达 DMZ，正向上位机通道已由电力专用横向单向隔离装置拦截。',
  },
  {
    id: '02',
    industryOrder: 1,
    industry: '能源行业',
    name: '中国石油化工集团（镇海炼化智能工厂）',
    shortName: '中石化·镇海炼化',
    region: '浙江·宁波',
    targetSystem: '集散控制系统 (DCS) 工业上位机服务器',
    lngLat: [121.6608, 29.9912],
    labelOffset: [-192, 26],
    status: 'green',
    penetrationDepth: 0,
    breachedZoneText: '全纵深 5 层防线稳固（外部/DMZ/管理区/控制区/现场区 0 击穿）',
    policeJurisdiction: '浙江省公安厅网安总队 · 宁波支队',
    linkedCampaignCode: 'B3-WATER-001',
    defenseRate: 98.2,
    activeAlerts: 2,
    lastInspectionTime: '2026-11-13 13:14:20',
    incidentSummary: '工业数采网闸与 DCS 上位机白名单强制生效，OPC-UA 非授权读写探测 100% 阻断。',
  },

  // 2. 金融行业
  {
    id: '03',
    industryOrder: 2,
    industry: '金融行业',
    name: '中国工商银行（总行数据中心上海嘉定园）',
    shortName: '工商银行·嘉定数中',
    region: '上海·嘉定',
    targetSystem: '核心账务主机与跨行清算支付网关',
    lngLat: [121.2505, 31.3835],
    labelOffset: [-202, -66],
    status: 'green',
    penetrationDepth: 0,
    breachedZoneText: '全纵深 5 层防线稳固（跨行清算网闸与主机加密机 100% 阻断）',
    policeJurisdiction: '上海市公安局网安总队 · 嘉定分局',
    linkedCampaignCode: 'B1-FIN-2026-11',
    defenseRate: 99.1,
    activeAlerts: 4,
    lastInspectionTime: '2026-11-13 13:15:02',
    incidentSummary: '开放银行 API 报文签名核验正常，核心账务主机 Z-Mainframe 与跨行清算网关零异常会话。',
  },
  {
    id: '04',
    industryOrder: 2,
    industry: '金融行业',
    name: '上海证券交易所（金桥技术中心）',
    shortName: '上交所·金桥中心',
    region: '上海·浦东',
    targetSystem: '新一代核心交易撮合引擎集群',
    lngLat: [121.6152, 31.2588],
    labelOffset: [-186, -10],
    status: 'green',
    penetrationDepth: 0,
    breachedZoneText: '全纵深 5 层防线稳固（核心交易撮合内网物理单向隔离完好）',
    policeJurisdiction: '上海市公安局网安总队 · 金融安保支队',
    linkedCampaignCode: 'B1-FIN-2026-11',
    defenseRate: 99.4,
    activeAlerts: 1,
    lastInspectionTime: '2026-11-13 13:14:55',
    incidentSummary: '券商报盘 STEP 前置网关与核心撮合集群安全基线核验通过，PTP 纳秒级时钟同步正常。',
  },

  // 3. 交通与物流
  {
    id: '05',
    industryOrder: 3,
    industry: '交通与物流',
    name: '中国国家铁路集团（12306 客票中心）',
    shortName: '国铁集团·12306中心',
    region: '北京·海淀',
    targetSystem: '席位库存分配库与实名制核验核心库',
    lngLat: [116.3225, 39.9554],
    labelOffset: [-204, -26],
    status: 'yellow',
    penetrationDepth: 1,
    breachedZoneText: '公网 API 边界存在编码绕过 (DS-07) · 核心席位库存与实名核验库稳固',
    policeJurisdiction: '北京市公安局网安总队 · 铁路公安局',
    linkedCampaignCode: 'B1-FIN-2026-11',
    defenseRate: 86.0,
    activeAlerts: 28,
    lastInspectionTime: '2026-11-13 13:13:40',
    incidentSummary: '攻防演练发现混淆变体请求穿透一层候补 API 网关（P1 触达未达成），内网实名核验数据库防火墙成功阻断越权查询。',
  },
  {
    id: '06',
    industryOrder: 3,
    industry: '交通与物流',
    name: '中国东方航空集团（运行控制中心 AOC）',
    shortName: '东方航空·虹桥AOC',
    region: '上海·虹桥',
    targetSystem: '航班飞行签派系统与FOC核心数据库',
    lngLat: [121.3342, 31.1979],
    labelOffset: [-194, 16],
    status: 'green',
    penetrationDepth: 0,
    breachedZoneText: '全纵深 5 层防线稳固（签派控制专网与 FOC 核心库零突破）',
    policeJurisdiction: '上海市公安局国际机场分局 · 网安支队',
    linkedCampaignCode: 'B2-OPS-2026-03',
    defenseRate: 96.8,
    activeAlerts: 3,
    lastInspectionTime: '2026-11-13 13:11:30',
    incidentSummary: 'ACARS 地空数据链网关与 FOC 飞行签派核心数据库访问控制严格受控，未发生越权操作。',
  },

  // 4. 通信与广电
  {
    id: '07',
    industryOrder: 4,
    industry: '通信与广电',
    name: '中国移动通信集团（南方基地核心网节点）',
    shortName: '中国移动·南方基地',
    region: '广东·广州',
    targetSystem: '5G 核心网用户归属位置寄存器 (UDM/HSS)',
    lngLat: [113.4182, 23.1755],
    labelOffset: [-196, -24],
    status: 'green',
    penetrationDepth: 0,
    breachedZoneText: '全纵深 5 层防线稳固（5G 核心网信令面与网元管理面稳固）',
    policeJurisdiction: '广东省公安厅网安总队 · 广州支队',
    linkedCampaignCode: 'B1-FIN-2026-11',
    defenseRate: 97.5,
    activeAlerts: 5,
    lastInspectionTime: '2026-11-13 13:14:10',
    incidentSummary: '5G SBA 服务化架构接口鉴权与异常信令检测全部通过，UDM/HSS 根密钥库防护完好。',
  },
  {
    id: '08',
    industryOrder: 4,
    industry: '通信与广电',
    name: '阿里云计算有限公司（张北超级智算中心）',
    shortName: '阿里云·张北智算',
    region: '河北·张家口',
    targetSystem: '飞天云底座核心虚拟化管理集群 (神龙管控节点)',
    lngLat: [114.7165, 41.1578],
    labelOffset: [-194, -28],
    status: 'yellow',
    penetrationDepth: 2,
    breachedZoneText: '运维支撑通道告警未关联 (D3) · 神龙硬件虚拟化底座未失守',
    policeJurisdiction: '河北省公安厅网安总队 · 张家口支队',
    linkedCampaignCode: 'B2-OPS-2026-03',
    defenseRate: 81.2,
    activeAlerts: 34,
    lastInspectionTime: '2026-11-13 13:13:15',
    incidentSummary: '天基运维跳板机探测产生离散告警但 SIEM 未聚合成事件，硬件级神龙 MOC 管控隔离面已阻断横向逃逸。',
  },

  // 5. 公共服务与医疗
  {
    id: '09',
    industryOrder: 5,
    industry: '公共服务与医疗',
    name: '北京协和医院（东单院区信息中心）',
    shortName: '北京协和·东单信息中心',
    region: '北京·东城',
    targetSystem: 'HIS 医院信息系统核心库与电子病历 (EMR) 存储',
    lngLat: [116.4172, 39.9136],
    labelOffset: [-216, 18],
    status: 'red',
    penetrationDepth: 3,
    breachedZoneText: '重大隐患：外网远程维护凭证被突破并触达 EMR 核心存储区 (S 逃逸)',
    policeJurisdiction: '北京市公安局网安总队 · 东城分局',
    linkedCampaignCode: 'B2-OPS-2026-03',
    defenseRate: 62.4,
    activeAlerts: 67,
    lastInspectionTime: '2026-11-13 13:15:18',
    incidentSummary: '红蓝对抗验证中通过第三方医疗器械远程维护通道突破边界，直达 EMR 电子病历库（已下发公安一案双查整改令）。',
  },
  {
    id: '10',
    industryOrder: 5,
    industry: '公共服务与医疗',
    name: '深圳水务集团（东湖水厂自动化泵站）',
    shortName: '深圳水务·东湖泵站',
    region: '广东·深圳',
    targetSystem: '水质在线监测与加氯加药 PLC 控制终端',
    lngLat: [114.1485, 22.5642],
    labelOffset: [-194, 16],
    status: 'red',
    penetrationDepth: 3,
    breachedZoneText: '重大隐患：工控旁路探针 DS-09 失步 + 加氯 PLC 终端被注入指令 (S 逃逸)',
    policeJurisdiction: '广东省公安厅网安总队 · 深圳支队',
    linkedCampaignCode: 'B3-WATER-001',
    defenseRate: 61.8,
    activeAlerts: 53,
    lastInspectionTime: '2026-11-13 13:15:30',
    incidentSummary: 'B3-WATER-001 实网演练：S-127 (T0855) 非授权写线圈指令穿透控制区直达 plc-03，且 DS-09 探针失步，触发最高级爆闪告警！',
  },
];

export const STATUS_META: Record<
  CiioBeaconStatus,
  {
    label: string;
    shortLabel: string;
    badgeEmoji: string;
    hex: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    desc: string;
  }
> = {
  green: {
    label: '绿色常亮（防线稳固）',
    shortLabel: '防线稳固',
    badgeEmoji: '🟢',
    hex: '#10b981',
    borderClass: 'border-emerald-500/60',
    bgClass: 'bg-emerald-950/70',
    textClass: 'text-emerald-400',
    desc: '全纵深 5 层防线有效阻断/检出（0 层击穿）',
  },
  yellow: {
    label: '黄色脉冲（边界失守）',
    shortLabel: '边界失守',
    badgeEmoji: '🟡',
    hex: '#f59e0b',
    borderClass: 'border-amber-500/60',
    bgClass: 'bg-amber-950/70',
    textClass: 'text-amber-400',
    desc: '外围 DMZ 或运维边界出现突破/未关联告警，核心靶标尚稳固',
  },
  red: {
    label: '红色爆闪（重大隐患）',
    shortLabel: '重大隐患',
    badgeEmoji: '🔴',
    hex: '#ef4444',
    borderClass: 'border-rose-500/80',
    bgClass: 'bg-rose-950/80',
    textClass: 'text-rose-400',
    desc: '核心生产网/控制区/主数据库被击穿逃逸或探针失步，公安挂牌督办',
  },
};

/**
 * 10 家全国重点关基单位各自的专属 5 层防御结构拓扑靶场数据集
 * 五层纵向防线：外部 (external) -> DMZ (dmz) -> 管理区 (mgmt) -> 控制区 (control) -> 现场区 (field)
 */
export const CIIO_TOPOLOGY_BY_UNIT: Record<string, CiioUnitTopologyBundle> = {
  // 01 国家电网有限公司（华东调控分中心）
  '01': {
    unitId: '01',
    fidelity: 'L3 电力调度实网仿真在环',
    nodes: [
      { node_id: 'sgcc-ext-01', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '外网渗透探测源', ip: '198.51.100.11', protocol: 'TCP/HTTPS', criticality: 'low', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'sgcc-ext-02', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '省调远动维护端', ip: '198.51.100.52', protocol: 'IPsec', criticality: 'low', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sgcc-dmz-web', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '华东电力交易门户', ip: '10.11.1.10', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'sgcc-dmz-vpn', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '纵向加密认证网关', ip: '10.11.1.1', protocol: 'IPsec/国密', criticality: 'high', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sgcc-mgmt-oms', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '调度运行管理OMS', ip: '10.11.2.15', protocol: 'HTTP/RPC', criticality: 'high', visible_to: ['DS-03', 'DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sgcc-mgmt-wams', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '广域相量历史库', ip: '10.11.2.30', protocol: 'SQL/E-File', criticality: 'medium', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sgcc-ctrl-ems', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: 'EMS能量管理主站', ip: '192.168.11.10', protocol: 'IEC-104', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'sgcc-ctrl-scada', node_kind: 'asset', asset_class: 'database', zone_id: 'control', label: 'SCADA调度主站库', ip: '192.168.11.20', protocol: 'IEC-61850', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'sgcc-fld-rtu', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '500kV变电站RTU', ip: '192.168.110.11', protocol: 'IEC-104', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sgcc-fld-pmu', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '同步相量测量PMU', ip: '192.168.110.18', protocol: 'C37.118', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sgcc-fld-hmi', node_kind: 'asset', asset_class: 'hmi', zone_id: 'field', label: '浦东调度台人机屏', ip: '192.168.110.5', protocol: 'D5000-GUI', criticality: 'medium', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '电力边界墙', fullName: '电力信息外网边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.2.1', probe_status: 'pass', policyRef: 'SGCC-FW-EXT-v4', guardBoundaryDesc: '外部 ↔ DMZ 电力外网边界' },
      { ds_id: 'DS-07', shortName: '交易WAF', fullName: '电力交易门户API防护网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.4', probe_status: 'pass', policyRef: 'SGCC-WAF-PORTAL', guardBoundaryDesc: '外部 ↔ DMZ 交易门户暴露面' },
      { ds_id: 'DS-03', shortName: '三区隔离墙', fullName: '生产管理区反向代理网关', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.1', probe_status: 'pass', policyRef: 'SGCC-ZONE3-GW', guardBoundaryDesc: 'DMZ ↔ 管理区（安全三区）边界' },
      { ds_id: 'DS-06', shortName: '四区堡垒机', fullName: '电力调度特权运维审计堡垒', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.0', probe_status: 'pass', policyRef: 'SGCC-BASTION-v2', guardBoundaryDesc: 'DMZ ↔ 管理区运维通道' },
      { ds_id: 'DS-10', shortName: '横向单向隔离', fullName: '电力专用正反向物理隔离装置', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.1', probe_status: 'pass', policyRef: 'SGCC-ISOLATOR-I/III', guardBoundaryDesc: '管理区(三区) ↔ 控制区(一区) 物理隔离面' },
      { ds_id: 'DS-02', shortName: '电网监测装置', fullName: '电力监控系统网络安全监测装置', deployment_face: 'mgmt-control', deployment_mode: 'tap', can_prevent: false, version: '2.8', probe_status: 'pass', policyRef: 'SGCC-NSM-II', guardBoundaryDesc: '管理区 ↔ 控制区旁路镜像面' },
      { ds_id: 'DS-05', shortName: '104协议审计', fullName: 'IEC-104/61850 远动规约深度审计', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '1.6', probe_status: 'pass', policyRef: 'SGCC-IEC104-AUDIT', guardBoundaryDesc: '控制区 ↔ 现场区远动信道监听面' },
      { ds_id: 'DS-09', shortName: '变电旁路探针', fullName: '变电站站控层流量采集探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.0', probe_status: 'pass', policyRef: 'SGCC-SUB-PROBE', guardBoundaryDesc: '控制区 ↔ 现场区变电总线镜像点' },
      { ds_id: 'DS-04', shortName: '凝思主机卫士', fullName: '电力专用操作系统安全加固代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.0', probe_status: 'pass', policyRef: 'SGCC-HOST-GUARD', guardBoundaryDesc: '主机层内核白名单代理' },
    ],
    links: [
      { id: 'sg-l1', source: 'sgcc-ext-01', target: 'sgcc-dmz-web', type: 'normal' },
      { id: 'sg-l2', source: 'sgcc-dmz-web', target: 'sgcc-mgmt-oms', type: 'normal' },
      { id: 'sg-l3', source: 'sgcc-mgmt-oms', target: 'sgcc-ctrl-scada', type: 'normal' },
      { id: 'sg-l4', source: 'sgcc-ctrl-ems', target: 'sgcc-fld-rtu', type: 'normal' },
      { id: 'sg-l5', source: 'sgcc-ext-02', target: 'sgcc-dmz-vpn', type: 'management' },
      { id: 'sg-l6', source: 'sgcc-dmz-vpn', target: 'sgcc-mgmt-wams', type: 'management' },
      { id: 'sg-l7', source: 'sgcc-ctrl-scada', target: 'sgcc-fld-pmu', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台电力关基资产（外 2 · DMZ 2 · 管理区 2 · 控制区 2 · 变电现场区 3）',
      defenseSummary: '8 套边界安全装置 + 1 套凝思主机加固，符合“安全分区、网络专用、横向隔离、纵向认证”',
      boundaryStatus: '⚠️ 外部↔DMZ 交易门户发现 T1190 突破告警，管理区↔控制区横向隔离装置 100% 阻断',
      hasBoundaryAlert: true,
    },
  },

  // 02 中国石油化工集团（镇海炼化智能工厂）
  '02': {
    unitId: '02',
    fidelity: 'L3 石化 DCS 硬件在环',
    nodes: [
      { node_id: 'sh-ext-scm', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '原油供应链外联端', ip: '198.51.100.31', protocol: 'HTTPS', criticality: 'low', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'sh-ext-vendor', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: 'DCS厂商远程诊断端', ip: '198.51.100.64', protocol: 'SSL-VPN', criticality: 'low', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sh-dmz-portal', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '镇海炼化协同门户', ip: '10.12.1.12', protocol: 'HTTPS', criticality: 'medium', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'sh-dmz-iotgw', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '工业云边数据网关', ip: '10.12.1.2', protocol: 'MQTT/TLS', criticality: 'high', visible_to: ['DS-01', 'DS-03'], topology_source: 'derived' },
      { node_id: 'sh-mgmt-mes', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '炼化生产执行MES', ip: '10.12.2.18', protocol: 'HTTP/SQL', criticality: 'high', visible_to: ['DS-03', 'DS-04'], topology_source: 'derived' },
      { node_id: 'sh-mgmt-phd', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '实时工艺历史库PHD', ip: '10.12.2.88', protocol: 'OPC-HDA', criticality: 'high', visible_to: ['DS-02', 'DS-04'], topology_source: 'derived' },
      { node_id: 'sh-ctrl-dcs', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: 'DCS工业上位机服务', ip: '192.168.12.10', protocol: 'OPC-UA', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'sh-ctrl-apc', node_kind: 'asset', asset_class: 'terminal', zone_id: 'control', label: '先进过程控制APC站', ip: '192.168.12.22', protocol: 'Modbus/TCP', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'sh-fld-sis', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '催化裂化SIS安全PLC', ip: '192.168.120.8', protocol: 'Triconex', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sh-fld-fcu', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '常减压现场控制站', ip: '192.168.120.15', protocol: 'FF/HART', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sh-fld-esd', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '紧急切断阀ESD终端', ip: '192.168.120.30', protocol: 'Modbus', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '园区边界墙', fullName: '镇海炼化外网边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.2.1', probe_status: 'pass', policyRef: 'SINOPEC-FW-v4', guardBoundaryDesc: '外部 ↔ DMZ 园区互联网边界' },
      { ds_id: 'DS-03', shortName: '应用隔离网', fullName: '云边协同反向隔离网关', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.1', probe_status: 'pass', policyRef: 'SINOPEC-DMZ-GW', guardBoundaryDesc: 'DMZ ↔ 炼化管理区边界' },
      { ds_id: 'DS-06', shortName: '工控堡垒机', fullName: '石化远程维护双因子堡垒机', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.2', probe_status: 'pass', policyRef: 'SINOPEC-PAM-01', guardBoundaryDesc: 'DMZ ↔ 管理区运维审计通道' },
      { ds_id: 'DS-10', shortName: '工业数采网闸', fullName: 'MES与DCS之间单向工业数采网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.0', probe_status: 'pass', policyRef: 'SINOPEC-OPC-GAP', guardBoundaryDesc: '管理区 ↔ DCS控制区物理隔离面' },
      { ds_id: 'DS-02', shortName: '工业防火墙', fullName: 'OPC-UA深度包检测工业防火墙', deployment_face: 'mgmt-control', deployment_mode: 'inline', can_prevent: true, version: '3.1', probe_status: 'pass', policyRef: 'SINOPEC-IFW-DCS', guardBoundaryDesc: '管理区 ↔ DCS控制区串行阻断面' },
      { ds_id: 'DS-05', shortName: 'DCS协议审计', fullName: '集散控制系统协议深度监测系统', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.4', probe_status: 'pass', policyRef: 'SINOPEC-DCS-AUDIT', guardBoundaryDesc: 'DCS控制区 ↔ 装置现场区旁路监听' },
      { ds_id: 'DS-09', shortName: 'SIS安全探针', fullName: '安全仪表系统只读遥测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.1', probe_status: 'pass', policyRef: 'SINOPEC-SIS-PROBE', guardBoundaryDesc: '控制区 ↔ 现场区SIS安全总线镜像' },
      { ds_id: 'DS-04', shortName: '上位机白名单', fullName: '工业上位机可执行程序白名单软件', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '4.5', probe_status: 'pass', policyRef: 'SINOPEC-WL-HOST', guardBoundaryDesc: 'DCS上位机与APC工程师站内核层' },
    ],
    links: [
      { id: 'sp-l1', source: 'sh-ext-scm', target: 'sh-dmz-portal', type: 'normal' },
      { id: 'sp-l2', source: 'sh-dmz-iotgw', target: 'sh-mgmt-mes', type: 'normal' },
      { id: 'sp-l3', source: 'sh-mgmt-phd', target: 'sh-ctrl-dcs', type: 'normal' },
      { id: 'sp-l4', source: 'sh-ctrl-dcs', target: 'sh-fld-sis', type: 'normal' },
      { id: 'sp-l5', source: 'sh-ctrl-apc', target: 'sh-fld-fcu', type: 'normal' },
      { id: 'sp-l6', source: 'sh-ext-vendor', target: 'sh-mgmt-mes', type: 'management' },
      { id: 'sp-l7', source: 'sh-ctrl-dcs', target: 'sh-fld-esd', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台石化炼化资产（外 2 · DMZ 2 · 管理区 2 · DCS控制区 2 · 现场区 3）',
      defenseSummary: '7 套工业边界设备 + 1 套上位机白名单代理，全量探针在线',
      boundaryStatus: '✓ 4 条物理边界均有串行阻断/单向网闸防护，全纵深 0 击穿',
      hasBoundaryAlert: false,
    },
  },

  // 03 中国工商银行（总行数据中心上海嘉定园）
  '03': {
    unitId: '03',
    fidelity: 'L2 金融核心账务孪生靶场',
    nodes: [
      { node_id: 'icbc-ext-mb', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '公网手机银行终端', ip: '203.0.113.15', protocol: 'HTTPS/QUIC', criticality: 'low', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'icbc-ext-swift', node_kind: 'asset', asset_class: 'gateway', zone_id: 'external', label: '跨行外联专线节点', ip: '203.0.113.88', protocol: 'SWIFT/TLS', criticality: 'medium', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'icbc-dmz-waf', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '个人网银接入前置', ip: '10.13.1.20', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'icbc-dmz-api', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '开放银行API网关', ip: '10.13.1.25', protocol: 'mTLS/JSON', criticality: 'high', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'icbc-mgmt-pam', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '总行特权凭据金库', ip: '10.13.2.60', protocol: 'TLS/SSH', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'icbc-mgmt-batch', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '日终清算批量调度', ip: '10.13.2.75', protocol: 'RPC', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'icbc-ctrl-cnaps', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '跨行清算支付网关', ip: '192.168.13.10', protocol: 'ISO-20022', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'icbc-ctrl-risk', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '实时交易风控引擎', ip: '192.168.13.30', protocol: 'gRPC', criticality: 'high', visible_to: ['DS-02', 'DS-04'], topology_source: 'derived' },
      { node_id: 'icbc-fld-main', node_kind: 'asset', asset_class: 'app', zone_id: 'field', label: '核心账务大型主机', ip: '192.168.130.5', protocol: 'SNA/TN3270', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'icbc-fld-db', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '分布式核心总账库', ip: '192.168.130.12', protocol: 'SQL/RDMA', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'icbc-fld-hsm', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '金融硬件加密机HSM', ip: '192.168.130.20', protocol: 'PKCS#11', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '金融抗D墙', fullName: '总行园区互联网边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.4', probe_status: 'pass', policyRef: 'ICBC-FW-EXT', guardBoundaryDesc: '外部 ↔ DMZ 互联网金融接入面' },
      { ds_id: 'DS-07', shortName: '开放API网关', fullName: '金融报文签名与API威胁阻断网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '4.0', probe_status: 'pass', policyRef: 'ICBC-API-mTLS', guardBoundaryDesc: '外部 ↔ DMZ 开放银行API边界' },
      { ds_id: 'DS-03', shortName: '内网应用墙', fullName: '总行外联区与内网隔离防火墙', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '5.1', probe_status: 'pass', policyRef: 'ICBC-INTERNAL-FW', guardBoundaryDesc: 'DMZ ↔ 运维管理区边界' },
      { ds_id: 'DS-06', shortName: '金库堡垒机', fullName: '核心账务双人复核运维堡垒机', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.5', probe_status: 'pass', policyRef: 'ICBC-BASTION-DUAL', guardBoundaryDesc: 'DMZ ↔ 管理区特权通道' },
      { ds_id: 'DS-10', shortName: '支付清算网闸', fullName: '跨行清算核心区硬件安全隔离网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.2', probe_status: 'pass', policyRef: 'ICBC-CNAPS-GAP', guardBoundaryDesc: '管理区 ↔ 支付清算控制区边界' },
      { ds_id: 'DS-05', shortName: '核心数据库墙', fullName: '核心总账与主机SQL防火墙', deployment_face: 'control-field', deployment_mode: 'inline', can_prevent: true, version: '3.8', probe_status: 'pass', policyRef: 'ICBC-DBFW-CORE', guardBoundaryDesc: '控制区 ↔ 核心账务主机现场区边界' },
      { ds_id: 'DS-09', shortName: '主机流量探针', fullName: '大型机通道全流量交易审计探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.3', probe_status: 'pass', policyRef: 'ICBC-Z-TAP', guardBoundaryDesc: '控制区 ↔ 核心账务主机区旁路监听' },
      { ds_id: 'DS-04', shortName: '金融主机EDR', fullName: '核心清算节点内存防护代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.2', probe_status: 'pass', policyRef: 'ICBC-EDR-STRICT', guardBoundaryDesc: '清算与管理服务器主机层' },
    ],
    links: [
      { id: 'ic-l1', source: 'icbc-ext-mb', target: 'icbc-dmz-waf', type: 'normal' },
      { id: 'ic-l2', source: 'icbc-dmz-api', target: 'icbc-ctrl-cnaps', type: 'normal' },
      { id: 'ic-l3', source: 'icbc-ctrl-cnaps', target: 'icbc-fld-main', type: 'normal' },
      { id: 'ic-l4', source: 'icbc-fld-main', target: 'icbc-fld-db', type: 'normal' },
      { id: 'ic-l5', source: 'icbc-mgmt-pam', target: 'icbc-ctrl-risk', type: 'management' },
      { id: 'ic-l6', source: 'icbc-ctrl-cnaps', target: 'icbc-fld-hsm', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台金融核心资产（外 2 · DMZ 2 · 管理区 2 · 清算控制区 2 · 核心账务区 3）',
      defenseSummary: '7 套边界串行阻断/网闸 + 1 套主机内存 EDR，核心主机区具备双层数据库防火墙',
      boundaryStatus: '✓ 4 条物理边界均部署高可用串行阻断设备，全纵深 0 击穿',
      hasBoundaryAlert: false,
    },
  },

  // 04 上海证券交易所（金桥技术中心）
  '04': {
    unitId: '04',
    fidelity: 'L3 低时延撮合硬件在环',
    nodes: [
      { node_id: 'sse-ext-broker', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '券商会员报盘席位', ip: '198.51.100.101', protocol: 'STEP/FIX', criticality: 'medium', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'sse-ext-md', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '行情资讯商订阅端', ip: '198.51.100.120', protocol: 'FAST/UDP', criticality: 'low', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'sse-dmz-step', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '会员报盘前置网关', ip: '10.14.1.10', protocol: 'STEP', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'sse-dmz-mdpub', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: 'L2高频行情发布机', ip: '10.14.1.18', protocol: 'UDP/组播', criticality: 'high', visible_to: ['DS-01', 'DS-03'], topology_source: 'derived' },
      { node_id: 'sse-mgmt-surv', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '实时市场监察系统', ip: '10.14.2.15', protocol: 'Kafka/RPC', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sse-mgmt-ptp', node_kind: 'asset', asset_class: 'gateway', zone_id: 'mgmt', label: '纳秒级PTP主时钟源', ip: '10.14.2.5', protocol: 'IEEE-1588', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'sse-ctrl-bus', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '低时延定单交换总线', ip: '192.168.14.8', protocol: 'Aeron/RDMA', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'sse-ctrl-clear', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '日间实时清算节点', ip: '192.168.14.20', protocol: 'FIX', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'sse-fld-match1', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '核心交易撮合主集群', ip: '192.168.140.10', protocol: 'SHM内存总线', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sse-fld-match2', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '竞价撮合热备集群', ip: '192.168.140.11', protocol: 'RDMA同步', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'sse-fld-orderdb', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '全市场委托成交库', ip: '192.168.140.25', protocol: 'NVMe-oF', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '证券专网墙', fullName: '证联网会员接入硬件防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.5', probe_status: 'pass', policyRef: 'SSE-FW-MEMBER', guardBoundaryDesc: '外部 ↔ DMZ 证联网接入面' },
      { ds_id: 'DS-07', shortName: '报盘畸形过滤', fullName: 'STEP/FIX 报盘报文硬件校验器', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.1', probe_status: 'pass', policyRef: 'SSE-FIX-FILTER', guardBoundaryDesc: '外部 ↔ DMZ 报盘指令校验边界' },
      { ds_id: 'DS-03', shortName: '行情单向网闸', fullName: '行情发布单向光闸隔离系统', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.2', probe_status: 'pass', policyRef: 'SSE-MD-DIODE', guardBoundaryDesc: 'DMZ ↔ 管理区边界' },
      { ds_id: 'DS-10', shortName: '交易隔离网闸', fullName: 'FPGA超低时延交易安全隔离网关', deployment_face: 'mgmt-control', deployment_mode: 'inline', can_prevent: true, version: '2.0', probe_status: 'pass', policyRef: 'SSE-FPGA-GATE', guardBoundaryDesc: '管理区 ↔ 交易控制区物理隔离面' },
      { ds_id: 'DS-05', shortName: '定单异常审计', fullName: '高频定单总线异常报撤单审计', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.6', probe_status: 'pass', policyRef: 'SSE-ORDER-AUDIT', guardBoundaryDesc: '控制区 ↔ 核心撮合区硬件分光监听' },
      { ds_id: 'DS-09', shortName: 'FPGA光学探针', fullName: '纳秒级硬件分光遥测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '3.0', probe_status: 'pass', policyRef: 'SSE-OPTICAL-TAP', guardBoundaryDesc: '控制区 ↔ 撮合现场区光学镜像面' },
      { ds_id: 'DS-04', shortName: '主机固件锁定', fullName: '撮合主机BIOS与内核只读锁定代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.0', probe_status: 'pass', policyRef: 'SSE-KERNEL-LOCK', guardBoundaryDesc: '撮合主机层只读加固' },
    ],
    links: [
      { id: 'ss-l1', source: 'sse-ext-broker', target: 'sse-dmz-step', type: 'normal' },
      { id: 'ss-l2', source: 'sse-dmz-step', target: 'sse-ctrl-bus', type: 'normal' },
      { id: 'ss-l3', source: 'sse-ctrl-bus', target: 'sse-fld-match1', type: 'normal' },
      { id: 'ss-l4', source: 'sse-fld-match1', target: 'sse-fld-orderdb', type: 'normal' },
      { id: 'ss-l5', source: 'sse-mgmt-ptp', target: 'sse-fld-match1', type: 'management' },
      { id: 'ss-l6', source: 'sse-ctrl-bus', target: 'sse-fld-match2', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台证券交易核心资产（外 2 · DMZ 2 · 管理区 2 · 控制区 2 · 撮合现场区 3）',
      defenseSummary: '6 套 FPGA/硬件级边界设备 + 1 套内核锁定代理，纳秒级光学分光探针全部正常',
      boundaryStatus: '✓ 4 条物理边界均部署硬件级隔离与报盘校验，核心撮合引擎 0 击穿',
      hasBoundaryAlert: false,
    },
  },

  // 05 中国国家铁路集团（12306 客票中心）
  '05': {
    unitId: '05',
    fidelity: 'L2 高并发客票与实名核验靶场',
    nodes: [
      { node_id: 'cr-ext-app', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '公网12306购票端', ip: '198.51.100.201', protocol: 'HTTPS', criticality: 'low', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'cr-ext-pos', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '车站窗口售票终端', ip: '198.51.100.215', protocol: '专网TLS', criticality: 'medium', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'cr-dmz-waf', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '公网候补API网关', ip: '10.15.1.10', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'cr-dmz-cache', node_kind: 'asset', asset_class: 'database', zone_id: 'dmz', label: '余票查询加速缓存', ip: '10.15.1.30', protocol: 'Redis', criticality: 'medium', visible_to: ['DS-01', 'DS-03'], topology_source: 'derived' },
      { node_id: 'cr-mgmt-ops', node_kind: 'asset', asset_class: 'terminal', zone_id: 'mgmt', label: '客票中心运维工作站', ip: '10.15.2.12', protocol: 'SSH/RDP', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'cr-mgmt-bi', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '全国运力调配平台', ip: '10.15.2.45', protocol: 'JDBC', criticality: 'medium', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'cr-ctrl-queue', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '候补排队交易调度器', ip: '192.168.15.15', protocol: 'RocketMQ', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'cr-ctrl-ctcs', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '运行图席位同步网关', ip: '192.168.15.28', protocol: 'JMS', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'cr-fld-seatdb', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '席位库存分配核心库', ip: '192.168.150.10', protocol: 'GemFire内存库', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'cr-fld-iddb', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '实名制身份核验核心库', ip: '192.168.150.20', protocol: '国密SQL', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'cr-fld-gate', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '全国高铁检票授信主控', ip: '192.168.150.35', protocol: 'TCP/TLS', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '客票清洗墙', fullName: '公网恶意抢票清洗与边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.2', probe_status: 'pass', policyRef: 'CR-ANTI-BOT-v5', guardBoundaryDesc: '外部 ↔ DMZ 公网售票入口' },
      { ds_id: 'DS-07', shortName: 'API风控网关', fullName: '候补接口签名与编码防绕过网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.4', probe_status: 'pass', policyRef: 'CR-API-WAF', guardBoundaryDesc: '外部 ↔ DMZ 候补下单API面' },
      { ds_id: 'DS-03', shortName: '内外网隔离墙', fullName: '客票公网区与内网交易区隔离网关', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.1', probe_status: 'pass', policyRef: 'CR-DMZ-ISOLATE', guardBoundaryDesc: 'DMZ ↔ 管理区边界' },
      { ds_id: 'DS-06', shortName: '铁路运维堡垒', fullName: '客票核心运维审计堡垒机', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.0', probe_status: 'pass', policyRef: 'CR-OPS-BASTION', guardBoundaryDesc: 'DMZ ↔ 管理区运维通道' },
      { ds_id: 'DS-10', shortName: '客票安全网闸', fullName: '客票交易专网单向安全网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.0', probe_status: 'pass', policyRef: 'CR-TICKET-GAP', guardBoundaryDesc: '管理区 ↔ 交易控制区物理隔离面' },
      { ds_id: 'DS-05', shortName: '实名库防火墙', fullName: '实名制核心库与席位库SQL阻断墙', deployment_face: 'control-field', deployment_mode: 'inline', can_prevent: true, version: '3.9', probe_status: 'pass', policyRef: 'CR-IDDB-FW', guardBoundaryDesc: '控制区 ↔ 席位与实名核验现场区边界' },
      { ds_id: 'DS-09', shortName: '内存库探针', fullName: 'GemFire席位内存库旁路审计探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.1', probe_status: 'pass', policyRef: 'CR-MEM-TAP', guardBoundaryDesc: '控制区 ↔ 席位核心库镜像点' },
      { ds_id: 'DS-04', shortName: '主机EDR代理', fullName: '客票中心服务器终端检测响应', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.0', probe_status: 'pass', policyRef: 'CR-EDR-PROD', guardBoundaryDesc: '全网主机端点层' },
    ],
    links: [
      { id: 'cr-l1', source: 'cr-ext-app', target: 'cr-dmz-waf', type: 'normal' },
      { id: 'cr-l2', source: 'cr-dmz-waf', target: 'cr-ctrl-queue', type: 'normal' },
      { id: 'cr-l3', source: 'cr-ctrl-queue', target: 'cr-fld-seatdb', type: 'normal' },
      { id: 'cr-l4', source: 'cr-ctrl-queue', target: 'cr-fld-iddb', type: 'normal' },
      { id: 'cr-l5', source: 'cr-mgmt-ops', target: 'cr-ctrl-ctcs', type: 'management' },
      { id: 'cr-l6', source: 'cr-ctrl-ctcs', target: 'cr-fld-gate', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台铁路客票核心资产（外 2 · DMZ 2 · 管理区 2 · 控制区 2 · 核心库现场区 3）',
      defenseSummary: '7 套边界防护 + 1 套主机 EDR，控制区↔实名核心库部署串行数据库防火墙',
      boundaryStatus: '⚠️ 外部↔DMZ 边界 DS-07 出现编码变体绕过 (P1)，控制区↔现场区数据库防火墙成功阻断',
      hasBoundaryAlert: true,
    },
  },

  // 06 中国东方航空集团（运行控制中心 AOC）
  '06': {
    unitId: '06',
    fidelity: 'L3 民航签派与地空数据链在环',
    nodes: [
      { node_id: 'mu-ext-acars', node_kind: 'asset', asset_class: 'gateway', zone_id: 'external', label: '地空数据链地面站', ip: '198.51.100.145', protocol: 'ARINC-620', criticality: 'medium', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'mu-ext-efb', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '机组电子飞行包EFB', ip: '198.51.100.160', protocol: 'HTTPS/mTLS', criticality: 'medium', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'mu-dmz-acarsgw', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: 'ACARS报文接入网关', ip: '10.16.1.8', protocol: 'SITA-TypeB', criticality: 'high', visible_to: ['DS-01', 'DS-03'], topology_source: 'derived' },
      { node_id: 'mu-dmz-efbgw', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '机组数字化航图门户', ip: '10.16.1.22', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'mu-mgmt-met', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '全球航空气象通告库', ip: '10.16.2.14', protocol: 'WXXM/AIXM', criticality: 'medium', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'mu-mgmt-aocws', node_kind: 'asset', asset_class: 'terminal', zone_id: 'mgmt', label: 'AOC总签派员席位站', ip: '10.16.2.30', protocol: 'HTTPS/WSS', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'mu-ctrl-disp', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '航班飞行签派系统', ip: '192.168.16.10', protocol: 'SOA/TLS', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'mu-ctrl-load', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '飞机载重平衡配载机', ip: '192.168.16.25', protocol: 'ARINC-633', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'mu-fld-focdb', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: 'FOC核心运行数据库', ip: '192.168.160.10', protocol: 'Oracle-RAC', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'mu-fld-fplib', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '全机队飞行计划主库', ip: '192.168.160.18', protocol: 'ARINC-424', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'mu-fld-navhsm', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '机载导航库签名机', ip: '192.168.160.30', protocol: 'HSM-PKCS', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '民航专网墙', fullName: 'AOC外联与地空数据链边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.2', probe_status: 'pass', policyRef: 'MU-AOC-FW', guardBoundaryDesc: '外部 ↔ DMZ 民航外联边界' },
      { ds_id: 'DS-07', shortName: 'EFB双向认证', fullName: '电子飞行包证书双向鉴权网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.6', probe_status: 'pass', policyRef: 'MU-EFB-mTLS', guardBoundaryDesc: '外部 ↔ DMZ 机组终端接入面' },
      { ds_id: 'DS-03', shortName: '报文摆渡网关', fullName: 'ACARS电报格式白名单过滤网闸', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.0', probe_status: 'pass', policyRef: 'MU-ACARS-FILTER', guardBoundaryDesc: 'DMZ ↔ 签派管理区边界' },
      { ds_id: 'DS-06', shortName: '签派运维堡垒', fullName: 'AOC运控大厅特权运维审计堡垒', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.1', probe_status: 'pass', policyRef: 'MU-BASTION-AOC', guardBoundaryDesc: 'DMZ ↔ 管理区特权通道' },
      { ds_id: 'DS-10', shortName: '运控核心网闸', fullName: '航班签派控制网安全隔离网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.1', probe_status: 'pass', policyRef: 'MU-FOC-GAP', guardBoundaryDesc: '管理区 ↔ 飞行签派控制区边界' },
      { ds_id: 'DS-05', shortName: 'FOC数据库审计', fullName: 'FOC核心库与飞行计划防篡改网关', deployment_face: 'control-field', deployment_mode: 'inline', can_prevent: true, version: '3.3', probe_status: 'pass', policyRef: 'MU-FOC-DBFW', guardBoundaryDesc: '控制区 ↔ FOC核心库现场区边界' },
      { ds_id: 'DS-09', shortName: '航电链路探针', fullName: '飞行签派指令全流量遥测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.0', probe_status: 'pass', policyRef: 'MU-AOC-TAP', guardBoundaryDesc: '控制区 ↔ 现场区旁路镜像点' },
    ],
    links: [
      { id: 'mu-l1', source: 'mu-ext-acars', target: 'mu-dmz-acarsgw', type: 'normal' },
      { id: 'mu-l2', source: 'mu-dmz-acarsgw', target: 'mu-ctrl-disp', type: 'normal' },
      { id: 'mu-l3', source: 'mu-ctrl-disp', target: 'mu-fld-focdb', type: 'normal' },
      { id: 'mu-l4', source: 'mu-ctrl-load', target: 'mu-fld-fplib', type: 'normal' },
      { id: 'mu-l5', source: 'mu-mgmt-aocws', target: 'mu-ctrl-disp', type: 'management' },
      { id: 'mu-l6', source: 'mu-ctrl-disp', target: 'mu-fld-navhsm', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台民航运控核心资产（外 2 · DMZ 2 · 管理区 2 · 签派控制区 2 · FOC现场区 3）',
      defenseSummary: '7 套民航专网边界设备覆盖全部 4 条跨区边界，探针 100% 在线',
      boundaryStatus: '✓ 4 条物理边界均具备串行隔离与报文白名单核验，全纵深 0 击穿',
      hasBoundaryAlert: false,
    },
  },

  // 07 中国移动通信集团（南方基地核心网节点）
  '07': {
    unitId: '07',
    fidelity: 'L3 5G 核心网信令在环',
    nodes: [
      { node_id: 'cm-ext-roam', node_kind: 'asset', asset_class: 'gateway', zone_id: 'external', label: '国际漫游信令网元', ip: '198.51.100.172', protocol: 'HTTP/2-TLS', criticality: 'medium', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'cm-ext-gnb', node_kind: 'asset', asset_class: 'gateway', zone_id: 'external', label: '5G无线基站回传网', ip: '198.51.100.188', protocol: 'NGAP/SCTP', criticality: 'medium', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'cm-dmz-sepp', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '网间安全边缘代理SEPP', ip: '10.17.1.10', protocol: '3GPP-N32', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'cm-dmz-nef', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '5G能力开放网元NEF', ip: '10.17.1.25', protocol: 'SBI-HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'cm-mgmt-omc', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '核心网集中网管OMC', ip: '10.17.2.15', protocol: 'NETCONF', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'cm-mgmt-mano', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '电信云编排器MANO', ip: '10.17.2.40', protocol: 'REST/TLS', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'cm-ctrl-amf', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '接入移动管理网元AMF', ip: '192.168.17.10', protocol: '3GPP-SBI', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'cm-ctrl-ausf', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '5G鉴权服务网元AUSF', ip: '192.168.17.22', protocol: '5G-AKA', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'cm-fld-udm', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '统一数据管理UDM/HSS', ip: '192.168.170.8', protocol: 'HTTP/2-SBI', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'cm-fld-udr', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '全网签约根密钥库UDR', ip: '192.168.170.15', protocol: '加密专网', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'cm-fld-nrf', node_kind: 'asset', asset_class: 'gateway', zone_id: 'field', label: '核心信令注册中心NRF', ip: '192.168.170.28', protocol: 'SBI-OAuth2', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '5G信令防火墙', fullName: 'N2/N32 边界信令风暴防护墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.6', probe_status: 'pass', policyRef: 'CMCC-5G-SEPP-FW', guardBoundaryDesc: '外部 ↔ DMZ 5G漫游与基站接入边界' },
      { ds_id: 'DS-07', shortName: 'SBI接口网关', fullName: '5G服务化架构API鉴权网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '4.1', probe_status: 'pass', policyRef: 'CMCC-SBI-OAUTH', guardBoundaryDesc: '外部 ↔ DMZ NEF能力开放面' },
      { ds_id: 'DS-06', shortName: '网管4A堡垒', fullName: '核心网4A统一认证与特权审计堡垒', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.8', probe_status: 'pass', policyRef: 'CMCC-4A-BASTION', guardBoundaryDesc: 'DMZ ↔ 网管OMC管理区边界' },
      { ds_id: 'DS-10', shortName: '网管信令网闸', fullName: 'OMC管理面与控制面安全隔离网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '2.3', probe_status: 'pass', policyRef: 'CMCC-OMC-GAP', guardBoundaryDesc: '管理区 ↔ 5G控制面边界' },
      { ds_id: 'DS-05', shortName: 'UDM信令审计', fullName: 'UDM/HSS 签约数据访问控制网关', deployment_face: 'control-field', deployment_mode: 'inline', can_prevent: true, version: '3.5', probe_status: 'pass', policyRef: 'CMCC-UDM-GUARD', guardBoundaryDesc: '控制区 ↔ UDM/HSS根密钥现场区边界' },
      { ds_id: 'DS-09', shortName: '5G核心网探针', fullName: 'SBI总线信令全量分光检测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.5', probe_status: 'pass', policyRef: 'CMCC-SBI-TAP', guardBoundaryDesc: '控制区 ↔ 现场区SBI信令镜像点' },
      { ds_id: 'DS-04', shortName: '虚拟网元EDR', fullName: '电信云VNF容器运行时安全代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.1', probe_status: 'pass', policyRef: 'CMCC-VNF-GUARD', guardBoundaryDesc: '电信云容器宿主机层' },
    ],
    links: [
      { id: 'cm-l1', source: 'cm-ext-roam', target: 'cm-dmz-sepp', type: 'normal' },
      { id: 'cm-l2', source: 'cm-dmz-sepp', target: 'cm-ctrl-amf', type: 'normal' },
      { id: 'cm-l3', source: 'cm-ctrl-ausf', target: 'cm-fld-udm', type: 'normal' },
      { id: 'cm-l4', source: 'cm-fld-udm', target: 'cm-fld-udr', type: 'normal' },
      { id: 'cm-l5', source: 'cm-mgmt-omc', target: 'cm-ctrl-amf', type: 'management' },
      { id: 'cm-l6', source: 'cm-ctrl-amf', target: 'cm-fld-nrf', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台 5G 核心网关键网元（外 2 · DMZ 2 · OMC管理区 2 · 控制面 2 · UDM/HSS现场区 3）',
      defenseSummary: '6 套电信级信令防护设备 + 1 套电信云网元防护代理，全量探针通过',
      boundaryStatus: '✓ 4 条跨区信令边界均具备 3GPP-SBI 鉴权与串行保护，UDM/HSS 0 击穿',
      hasBoundaryAlert: false,
    },
  },

  // 08 阿里云计算有限公司（张北超级智算中心）
  '08': {
    unitId: '08',
    fidelity: 'L3 飞天云底座与神龙硬件在环',
    nodes: [
      { node_id: 'ali-ext-api', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '公网OpenAPI调用源', ip: '198.51.100.210', protocol: 'HTTPS', criticality: 'low', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'ali-ext-vpc', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '租户弹性公网入口', ip: '198.51.100.228', protocol: 'BGP/QUIC', criticality: 'low', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'ali-dmz-lvs', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '洛神四层负载均衡LVS', ip: '10.18.1.5', protocol: 'TCP/UDP', criticality: 'high', visible_to: ['DS-01', 'DS-03'], topology_source: 'derived' },
      { node_id: 'ali-dmz-apigw', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '飞天OpenAPI接入网关', ip: '10.18.1.18', protocol: 'HTTPS/AKSK', criticality: 'high', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'ali-mgmt-tianji', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '天基自动化运维集群', ip: '10.18.2.20', protocol: 'SSH/RPC', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'ali-mgmt-kms', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '云平台根密钥中心KMS', ip: '10.18.2.50', protocol: 'gRPC/HSM', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'ali-ctrl-fuxi', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '飞天伏羲调度主控集群', ip: '192.168.18.10', protocol: 'Apsara-RPC', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'ali-ctrl-sdn', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '洛神SDN虚拟网控制器', ip: '192.168.18.25', protocol: 'vXLAN/OpenFlow', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'ali-fld-moc', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '神龙管控节点硬件卡MOC', ip: '192.168.180.10', protocol: 'PCIe/RDMA', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'ali-fld-roce', node_kind: 'asset', asset_class: 'gateway', zone_id: 'field', label: '万卡智算RoCE交换矩阵', ip: '192.168.180.22', protocol: 'RoCEv2', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'ali-fld-bmc', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '宿主机带外控制BMC', ip: '192.168.180.40', protocol: 'Redfish/IPMI', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '云盾抗D边界', fullName: 'T级DDoS原生清洗与云边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '8.1', probe_status: 'pass', policyRef: 'ALI-YUNDUN-DDoS', guardBoundaryDesc: '外部 ↔ DMZ 智算中心公网边界' },
      { ds_id: 'DS-07', shortName: 'OpenAPI网关', fullName: 'AK/SK签名核验与租户越权阻断网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '4.3', probe_status: 'pass', policyRef: 'ALI-RAM-STRICT', guardBoundaryDesc: '外部 ↔ DMZ 云管控API面' },
      { ds_id: 'DS-06', shortName: '天基运维堡垒', fullName: '云底座零信任特权运维审计网关', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.9', probe_status: 'pass', policyRef: 'ALI-TIANJI-ZTNA', guardBoundaryDesc: 'DMZ ↔ 天基管理区边界' },
      { ds_id: 'DS-10', shortName: '管控网隔离闸', fullName: '租户VPC面与飞天管控面硬件隔离墙', deployment_face: 'mgmt-control', deployment_mode: 'inline', can_prevent: true, version: '3.0', probe_status: 'pass', policyRef: 'ALI-VPC-CTRL-ISO', guardBoundaryDesc: '管理区 ↔ 飞天控制区边界' },
      { ds_id: 'DS-02', shortName: '管控流量NDR', fullName: '云底座东西向RPC异常检测系统', deployment_face: 'mgmt-control', deployment_mode: 'tap', can_prevent: false, version: '2.9', probe_status: 'pass', policyRef: 'ALI-NDR-EASTWEST', guardBoundaryDesc: '管理区 ↔ 控制区旁路镜像面' },
      { ds_id: 'DS-05', shortName: '神龙硬件隔离', fullName: '神龙MOC芯片级虚拟化硬件防火墙', deployment_face: 'control-field', deployment_mode: 'inline', can_prevent: true, version: '4.0', probe_status: 'pass', policyRef: 'ALI-MOC-HW-ISO', guardBoundaryDesc: '控制区 ↔ 神龙硬件现场区物理隔离面' },
      { ds_id: 'DS-09', shortName: 'RDMA高速探针', fullName: '智算RoCE无损网络遥测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.2', probe_status: 'pass', policyRef: 'ALI-ROCE-TAP', guardBoundaryDesc: '控制区 ↔ 现场区RDMA镜像点' },
      { ds_id: 'DS-04', shortName: '安骑士HIDS', fullName: '宿主机Hypervisor层逃逸检测代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '6.0', probe_status: 'pass', policyRef: 'ALI-AQS-HYPER', guardBoundaryDesc: '智算宿主机内核层' },
    ],
    links: [
      { id: 'al-l1', source: 'ali-ext-api', target: 'ali-dmz-apigw', type: 'normal' },
      { id: 'al-l2', source: 'ali-dmz-apigw', target: 'ali-ctrl-fuxi', type: 'normal' },
      { id: 'al-l3', source: 'ali-ctrl-fuxi', target: 'ali-fld-moc', type: 'normal' },
      { id: 'al-l4', source: 'ali-fld-moc', target: 'ali-fld-roce', type: 'normal' },
      { id: 'al-l5', source: 'ali-mgmt-tianji', target: 'ali-ctrl-fuxi', type: 'management' },
      { id: 'al-l6', source: 'ali-ctrl-sdn', target: 'ali-fld-bmc', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台智算云底座核心资产（外 2 · DMZ 2 · 天基管理区 2 · 飞天控制区 2 · 神龙硬件现场区 3）',
      defenseSummary: '7 套云底座边界设备 + 1 套 Hypervisor 防逃逸代理，神龙 MOC 芯片级隔离完好',
      boundaryStatus: '⚠️ 管理区↔控制区天基跳板探测产生离散告警未聚合成事件 (D3)，神龙硬件现场区 0 击穿',
      hasBoundaryAlert: true,
    },
  },

  // 09 北京协和医院（东单院区信息中心）
  '09': {
    unitId: '09',
    fidelity: 'L2 医疗核心 HIS/EMR 仿真在环',
    nodes: [
      { node_id: 'pu-ext-patient', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '互联网医院挂号端', ip: '198.51.100.231', protocol: 'HTTPS', criticality: 'low', visible_to: ['DS-01', 'DS-07'], topology_source: 'derived' },
      { node_id: 'pu-ext-vendor', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '医疗设备远程维护端', ip: '198.51.100.242', protocol: 'SSL-VPN', criticality: 'medium', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'pu-dmz-ihosp', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '互联网诊疗前置机', ip: '10.19.1.12', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'pu-dmz-vpngw', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: '第三方运维VPN网关', ip: '10.19.1.30', protocol: 'SSL-VPN', criticality: 'high', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'pu-mgmt-hisops', node_kind: 'asset', asset_class: 'terminal', zone_id: 'mgmt', label: '信息中心运维跳板机', ip: '10.19.2.15', protocol: 'RDP/SSH', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'pu-mgmt-esb', node_kind: 'asset', asset_class: 'app', zone_id: 'mgmt', label: '院内信息集成总线ESB', ip: '10.19.2.28', protocol: 'HL7/FHIR', criticality: 'high', visible_to: ['DS-04'], topology_source: 'derived' },
      { node_id: 'pu-ctrl-hisapp', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '门急诊医嘱核心集群', ip: '192.168.19.10', protocol: 'RPC/JDBC', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'pu-ctrl-pacs', node_kind: 'asset', asset_class: 'app', zone_id: 'control', label: '医学影像传输主控PACS', ip: '192.168.19.25', protocol: 'DICOM', criticality: 'high', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'pu-fld-hisdb', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: 'HIS医院信息核心库', ip: '192.168.190.10', protocol: 'Oracle-DG', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'pu-fld-emrsan', node_kind: 'asset', asset_class: 'database', zone_id: 'field', label: '电子病历EMR核心存储', ip: '192.168.190.20', protocol: 'FC-SAN', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'pu-fld-icumon', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: 'ICU生命体征中央监护', ip: '192.168.190.35', protocol: 'HL7-MLLP', criticality: 'high', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '院区边界墙', fullName: '东单院区互联网边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.1', probe_status: 'pass', policyRef: 'PUMCH-FW-EXT', guardBoundaryDesc: '外部 ↔ DMZ 互联网医院边界' },
      { ds_id: 'DS-07', shortName: '医疗API网关', fullName: '患者挂号与报告查询WAF网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.2', probe_status: 'pass', policyRef: 'PUMCH-WAF-API', guardBoundaryDesc: '外部 ↔ DMZ 互联网诊疗面' },
      { ds_id: 'DS-06', shortName: '运维审计堡垒', fullName: '第三方医疗厂商远程维护堡垒机', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '2.9', probe_status: 'fail', policyRef: 'PUMCH-VENDOR-PAM', guardBoundaryDesc: 'DMZ ↔ 管理区第三方远程通道 (凭证失守)' },
      // 注意：管理区 ↔ 控制区 未部署物理隔离设备（用于体现评审第3问“哪条边界没有设备”及重大隐患原因！）
      { ds_id: 'DS-05', shortName: '医疗库审计', fullName: 'HIS/EMR患者隐私数据防泄漏审计', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.1', probe_status: 'pass', policyRef: 'PUMCH-EMR-AUDIT', guardBoundaryDesc: '控制区 ↔ EMR核心存储区旁路监听（无串行阻断）' },
      { ds_id: 'DS-09', shortName: '病历流量探针', fullName: '核心内网东西向流量采集探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '1.8', probe_status: 'fail', policyRef: 'PUMCH-SPAN-TAP', guardBoundaryDesc: '控制区 ↔ 现场区核心交换机镜像 (探针失步)' },
      { ds_id: 'DS-04', shortName: '终端防病毒', fullName: '医疗工作站终端安全代理', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '4.2', probe_status: 'pass', policyRef: 'PUMCH-EDR-WS', guardBoundaryDesc: '医生工作站与管理机端点' },
    ],
    links: [
      { id: 'pu-l1', source: 'pu-ext-patient', target: 'pu-dmz-ihosp', type: 'normal' },
      { id: 'pu-l2', source: 'pu-ext-vendor', target: 'pu-dmz-vpngw', type: 'management' },
      { id: 'pu-l3', source: 'pu-dmz-vpngw', target: 'pu-mgmt-hisops', type: 'management' },
      { id: 'pu-l4', source: 'pu-mgmt-hisops', target: 'pu-ctrl-hisapp', type: 'management' },
      { id: 'pu-l5', source: 'pu-ctrl-hisapp', target: 'pu-fld-hisdb', type: 'normal' },
      { id: 'pu-l6', source: 'pu-ctrl-hisapp', target: 'pu-fld-emrsan', type: 'normal' },
      { id: 'pu-l7', source: 'pu-ctrl-pacs', target: 'pu-fld-icumon', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 11 台医疗信息核心资产（外 2 · DMZ 2 · 管理区 2 · 控制区 2 · HIS/EMR现场区 3）',
      defenseSummary: '5 套边界设备 + 1 套端点代理；DS-06 第三方运维通道与 DS-09 探针告警',
      boundaryStatus: '🚨 重大隐患：[管理区 ↔ 控制区 边界] 无隔离设备拦截，导致第三方运维凭证突破后直达 EMR 核心库！',
      hasBoundaryAlert: true,
    },
  },

  // 10 深圳水务集团（东湖水厂自动化泵站）
  '10': {
    unitId: '10',
    fidelity: 'L3 自来水净水管网硬件在环',
    nodes: [
      { node_id: 'ext-attacker', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '外部渗透源', ip: '198.51.100.24', protocol: 'TCP/IP', criticality: 'low', visible_to: ['DS-01'], topology_source: 'derived' },
      { node_id: 'vpn-client', node_kind: 'asset', asset_class: 'terminal', zone_id: 'external', label: '远程运维客户端', ip: '198.51.100.88', protocol: 'IPsec', criticality: 'low', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'app-portal-01', node_kind: 'asset', asset_class: 'app', zone_id: 'dmz', label: '智慧水务门户服务', ip: '10.0.1.15', protocol: 'HTTPS', criticality: 'high', visible_to: ['DS-01', 'DS-03', 'DS-07'], topology_source: 'derived' },
      { node_id: 'vpn-gw', node_kind: 'asset', asset_class: 'gateway', zone_id: 'dmz', label: 'VPN 接入网关', ip: '10.0.1.1', protocol: 'IPsec', criticality: 'medium', visible_to: ['DS-01', 'DS-06'], topology_source: 'derived' },
      { node_id: 'ws-mgmt-02', node_kind: 'asset', asset_class: 'terminal', zone_id: 'mgmt', label: '水厂运维工程师站', ip: '10.10.2.22', protocol: 'RDP', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'token-vault', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '工程特权金库', ip: '10.10.2.80', protocol: 'TLS', criticality: 'high', visible_to: ['DS-04', 'DS-06'], topology_source: 'derived' },
      { node_id: 'ot-historian', node_kind: 'asset', asset_class: 'database', zone_id: 'mgmt', label: '水质工艺历史库', ip: '10.10.2.105', protocol: 'OPC/SQL', criticality: 'medium', visible_to: ['DS-02', 'DS-04'], topology_source: 'derived' },
      { node_id: 'scada-gw', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: '泵站SCADA中心网关', ip: '192.168.1.1', protocol: 'OPC-UA', criticality: 'high', visible_to: ['DS-02', 'DS-05', 'DS-10'], topology_source: 'derived' },
      { node_id: 'plc-gw-01', node_kind: 'asset', asset_class: 'gateway', zone_id: 'control', label: 'PLC 汇聚网关', ip: '192.168.1.10', protocol: 'Modbus/TCP', criticality: 'medium', visible_to: ['DS-02', 'DS-05'], topology_source: 'derived' },
      { node_id: 'plc-03', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '3号加氯加药PLC', ip: '192.168.10.12', protocol: 'Modbus/TCP', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'rtu-field-valve', node_kind: 'asset', asset_class: 'plc', zone_id: 'field', label: '取水电动阀门RTU', ip: '192.168.10.18', protocol: 'DNP3', criticality: 'high', visible_to: ['DS-05', 'DS-09'], topology_source: 'derived' },
      { node_id: 'field-hmi-01', node_kind: 'asset', asset_class: 'hmi', zone_id: 'field', label: '水质在线监测屏', ip: '192.168.10.5', protocol: 'VNC', criticality: 'low', visible_to: ['DS-05'], topology_source: 'derived' },
    ],
    deployments: [
      { ds_id: 'DS-01', shortName: '边界防火墙', fullName: '下一代边界防火墙', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '7.2.1', probe_status: 'pass', policyRef: 'POL-FW-PERIMETER-v4', guardBoundaryDesc: '外部 ↔ DMZ 物理边界' },
      { ds_id: 'DS-07', shortName: 'API防护', fullName: 'API 威胁阻断网关', deployment_face: 'external-dmz', deployment_mode: 'inline', can_prevent: true, version: '3.4', probe_status: 'pass', policyRef: 'POL-WAF-API-STRICT', guardBoundaryDesc: '外部 ↔ DMZ Web/API 面' },
      { ds_id: 'DS-03', shortName: '应用网关', fullName: '应用网关与反向代理', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '4.1', probe_status: 'pass', policyRef: 'POL-GW-PROXY-v2', guardBoundaryDesc: 'DMZ ↔ 管理区反向隔离面' },
      { ds_id: 'DS-06', shortName: '堡垒审计', fullName: '运维堡垒机与会话审计', deployment_face: 'dmz-mgmt', deployment_mode: 'inline', can_prevent: true, version: '3.0', probe_status: 'pass', policyRef: 'POL-BASTION-MFA-2026', guardBoundaryDesc: 'DMZ ↔ 管理区特权运维通道' },
      { ds_id: 'DS-10', shortName: '隔离网闸', fullName: '工业物理单向隔离网闸', deployment_face: 'mgmt-control', deployment_mode: 'api', can_prevent: true, version: '1.0', probe_status: 'pass', policyRef: 'POL-GAP-ONEWAY-ICS', guardBoundaryDesc: '管理区 ↔ 控制区数据摆渡面' },
      { ds_id: 'DS-02', shortName: '工业检测', fullName: '工业网络流量异常入侵检测', deployment_face: 'mgmt-control', deployment_mode: 'tap', can_prevent: false, version: '2.8', probe_status: 'pass', policyRef: 'POL-IDS-ICS-SIGNATURES', guardBoundaryDesc: '管理区 ↔ 控制区主干镜像点' },
      { ds_id: 'DS-09', shortName: '旁路探针', fullName: '工控现场旁路遥测探针', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '2.0', probe_status: 'fail', policyRef: 'POL-PROBE-OT-FIELD', guardBoundaryDesc: '控制区 ↔ 现场区工控总线镜像点 (探针失步)' },
      { ds_id: 'DS-05', shortName: '工控审计', fullName: '工控协议行为深度审计系统', deployment_face: 'control-field', deployment_mode: 'tap', can_prevent: false, version: '1.4', probe_status: 'pass', policyRef: 'POL-AUDIT-MODBUS-RULES', guardBoundaryDesc: '控制区 ↔ 现场区协议旁路监听面' },
      { ds_id: 'DS-04', shortName: '主机EDR', fullName: '主机端点威胁检测与响应 (EDR)', deployment_face: '', deployment_mode: 'agent', can_prevent: true, version: '5.0', probe_status: 'pass', policyRef: 'POL-EDR-BEHAVIOR-PROD', guardBoundaryDesc: '未分配跨区物理边界 (端点代理)' },
      { ds_id: 'DS-08', shortName: '探针代理', fullName: '轻量遥测探针代理', deployment_face: '', deployment_mode: 'agent', can_prevent: false, version: '1.9', probe_status: 'pass', policyRef: 'POL-AGENT-TELEMETRY', guardBoundaryDesc: '未分配跨区物理边界 (轻量探针代理)' },
    ],
    links: [
      { id: 'l1', source: 'ext-attacker', target: 'app-portal-01', type: 'normal' },
      { id: 'l2', source: 'app-portal-01', target: 'ot-historian', type: 'normal' },
      { id: 'l3', source: 'scada-gw', target: 'plc-gw-01', type: 'normal' },
      { id: 'l4', source: 'plc-gw-01', target: 'plc-03', type: 'normal' },
      { id: 'l5', source: 'plc-03', target: 'rtu-field-valve', type: 'normal' },
      { id: 'l6', source: 'vpn-client', target: 'vpn-gw', type: 'management' },
      { id: 'l7', source: 'vpn-gw', target: 'ws-mgmt-02', type: 'management' },
      { id: 'l8', source: 'ws-mgmt-02', target: 'token-vault', type: 'management' },
      { id: 'l9', source: 'ws-mgmt-02', target: 'scada-gw', type: 'management' },
      { id: 'l10', source: 'ot-historian', target: 'scada-gw', type: 'mirror', label: '镜像' },
      { id: 'l11', source: 'plc-gw-01', target: 'field-hmi-01', type: 'mirror', label: '镜像' },
    ],
    reviewSummary: {
      assetSummary: '共 12 台水务工控资产（外 2 · DMZ 2 · 管理区 3 · 控制区 2 · 泵站现场区 3）',
      defenseSummary: '8 套边界防护 + 2 套端点代理，覆盖 90% 节点',
      boundaryStatus: '🚨 重大隐患：控制区↔现场区边界仅部署旁路设备且 DS-09 探针失步，S-127 写线圈指令直达 3号加氯PLC！',
      hasBoundaryAlert: true,
    },
  },
};

export function getCiioUnitTopology(unitId: string): {
  unit: CiioUnitItem;
  topology: CiioUnitTopologyBundle;
} {
  const unit = INITIAL_CIIO_UNITS.find((u) => u.id === unitId) || INITIAL_CIIO_UNITS[0];
  const topology = CIIO_TOPOLOGY_BY_UNIT[unit.id] || CIIO_TOPOLOGY_BY_UNIT['10'];
  return { unit, topology };
}
