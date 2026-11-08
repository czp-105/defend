export type SixStateVerdict = 'S' | 'P1' | 'P2' | 'D1' | 'D2' | 'D3' | 'I';

export interface VerdictStat {
  code: SixStateVerdict;
  name: string;
  count: number;
  color: string;
  badgeBg: string;
}

export type TacticPhase =
  | 'recon'
  | 'resource_dev'
  | 'initial_access'
  | 'execution'
  | 'persistence'
  | 'priv_esc'
  | 'defense_evasion'
  | 'credential_access'
  | 'discovery'
  | 'lateral_movement'
  | 'collection'
  | 'c2'
  | 'exfiltration'
  | 'impact';

export interface DefenseSystem {
  id: string; // 'DS-01' ~ 'DS-10'
  name: string;
  product: string;
  version: string;
  mode: '串联' | '旁路' | '终端代理' | '接口';
  latencyLimit: number; // seconds
  status: 'online' | 'warning' | 'offline';
  alertCount: number;
  fnr: number; // 漏检率 %
  br: number; // 阻断率 %
  er: number; // 逃逸率 %
  p95Latency: number; // s
  isProbeFailed?: boolean;
}

export type ExpectationLevel =
  | 'MUST_BLOCK'
  | 'MUST_DETECT'
  | 'BLOCK_OR_DETECT'
  | 'CORRELATE'
  | 'OBSERVE_ONLY'
  | 'FORBIDDEN'
  | 'UNCOVERED'
  | 'NONE';

export interface MatrixCell {
  stepId: string;
  dsId: string;
  expected: ExpectationLevel;
  actualVerdict?: SixStateVerdict;
  timeLimitSec?: number;
}

export interface AttackStep {
  id: string; // 'S-014', 'S-127'
  techId: string; // 'T1190', 'T0855'
  techName: string;
  phase: TacticPhase;
  phaseName: string;
  targetAsset: string;
  targetIp: string;
  variant: string;
  verdict: SixStateVerdict;
  preConditions: string[];
  postConditions: string[];
  observableKeys: string[];
  requestsUsed: number;
  requestsMax: number;
  timeUsedSec: number;
  timeMaxSec: number;
  escapeLayer: { status: 'pass' | 'fail' | 'na'; reason: string; wConf: number };
  reachLayer: { status: 'pass' | 'fail' | 'na'; reason: string; session: string };
  objectiveLayer: { status: 'pass' | 'fail' | 'na'; reason: string; devPct: number };
  mfs: string[]; // Minimum Failure Set e.g. ['DS-09', 'DS-01']
  primaryRootCause: string;
  rootCauseType: '工控规则集缺少' | '告警未关联成事件' | 'TLS元数据未探测' | '编码变体不在规则库' | '子进程上下文关联断裂';
  evidenceCount: number;
}

export interface EvidenceItem {
  id: string; // 'EV-2287'
  strength: '强' | '中' | '弱';
  source: string;
  typeAndDesc: string;
  sha256: string;
  collectionPoint: string;
  isVerified: boolean;
}

export interface MeshAgent {
  id: string; // 'A1' ~ 'A9'
  code: string;
  name: string;
  status: '执行中' | '空闲' | '受阻' | '思考中' | '活跃' | '只读裁决';
  currentStep?: string;
  detail: string;
  quotaUsed: number;
  quotaMax: number;
  isReadonly?: boolean;
}

export interface CampaignQueueItem {
  id: string;
  code: string;
  name: string;
  businessType: string;
  fidelity: 'L1' | 'L2' | 'L3 硬件在环' | 'L2 组件仿真';
  defenseStackPassed: number;
  defenseStackTotal: number;
  progressPct: number;
  status: '运行中' | '排队中' | '已完成';
}

export interface GateCheckStatus {
  positiveProbePassed: number;
  positiveProbeTotal: number;
  egressGuardEnforced: boolean;
  ptpSkewMs: number;
  ptpLimitMs: number;
  resetHealthPassed: boolean;
  failedProbeId?: string;
}
