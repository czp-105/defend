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

// User RBAC Roles (GEN-01)
export type UserRole = 'viewer' | 'author' | 'reviewer' | 'approver' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  org: string;
}

// Activity Lifecycle Status Machine (ACT-01 ~ ACT-04)
export type ActivityStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'queued'
  | 'running'
  | 'completed'
  | 'void';

export interface Activity {
  id: string;
  code: string;
  name: string;
  businessClass: 'B1' | 'B2' | 'B3'; // B1 在线服务型, B2 运维支撑型 (规划中), B3 工业过程闭环型
  fidelity: 'L1' | 'L2' | 'L3 硬件在环' | 'L2 组件仿真';
  scenarioId: string;
  scenarioVersion: string;
  status: ActivityStatus;
  author: string;
  reviewer?: string;
  approver?: string;
  baselineSnapshotId: string;
  scenarioSha256: string;
  configSha256: string;
  runCount: number; // Single run vs repeated (>=5)
  createdAt: string;
  updatedAt: string;
  description: string;
  voidReason?: string;
}

// Append-only Audit Log (GEN-02)
export type AuditAction =
  | 'ACTIVITY_CREATED'
  | 'ACTIVITY_SUBMITTED'
  | 'ACTIVITY_APPROVED'
  | 'ACTIVITY_VOIDED'
  | 'SCENARIO_EDITED'
  | 'SCENARIO_VALIDATED'
  | 'DEM_OVERRIDE'
  | 'RUN_TRIGGERED'
  | 'RUN_ABORTED'
  | 'VERDICT_OBJECTION'
  | 'VERDICT_OVERRIDE_APPROVED'
  | 'REPORT_SIGNED'
  | 'REPORT_REBUILT'
  | 'BASELINE_UPDATED'
  | 'SWITCH_ACTIVITY'
  | 'CLONE_ACTIVITY'
  | 'UPDATE_ACTIVITY_STATUS'
  | 'COMMIT_VERDICT'
  | 'SIGN_OFF_REPORT'
  | 'CHANGE_DEFENSE_MODE'
  | 'TRIGGER_3LEVEL_RESET'
  | 'EXPORT_METRICS'
  | 'SWITCH_USER_ROLE'
  | 'FREEZE_SCENARIO'
  | 'SAVE_DEM_DRAFT'
  | 'FREEZE_DEM'
  | 'RUN_GATE_CHECKS';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  role?: string;
  action: AuditAction | (string & {});
  target: string;
  reason: string;
  immutableHash?: string;
  prevValue?: string;
  newValue?: string;
}

// G1 ~ G8 Gate Chain (Section 3.2)
export type GateLevel = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8';

export interface GateItem {
  id: GateLevel;
  name: string;
  stage: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  rule: string;
  failureAction: string;
  detail: string;
  canBypass: boolean;
}

// Verdict Objection & Override Layer (EVD-04)
export interface VerdictObjection {
  id: string;
  stepId: string;
  originalVerdict: SixStateVerdict;
  proposedVerdict: SixStateVerdict;
  reason: string;
  evidenceRefs: string[];
  filedBy: string;
  filedAt: string;
  reviewer?: string;
  approver?: string;
  approvedAt?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// Scorecards & Reports (RPT-01 ~ RPT-06)
export interface ScenarioScorecard {
  scenarioId: string;
  totalSteps: number;
  escapedSteps: number;
  blockedSteps: number;
  detectedSteps: number;
  inconclusiveSteps: number;
  escapeRate: number;
  blockRate: number;
  fnr: number;
  allStepsHaveEvidence: boolean;
}

export interface SystemScorecard {
  dsId: string;
  name: string;
  mode: string;
  expectedActions: number;
  actualActions: number;
  fnr: number;
  br: number;
  er: number;
  p95Latency: number;
  slaBreachCount: number;
  architectureAdjusted: boolean;
}

export interface PlatformScorecard {
  reproducibility: 'not_measured_single_run' | 'reproducible_5_runs';
  runCount: number;
  defaultsPending: boolean;
  isolationBreaches: number;
  ptpDriftMaxMs: number;
  inconclusiveRate: number;
  confidenceScore: number;
}

export interface SignOffRecord {
  id: string;
  activityCode: string;
  signer: string;
  signerRole: string;
  timestamp: string;
  manifestHash: string;
  reportHash: string;
  verdictLevel: '系统级结论 (可发布)' | '降级为观察报告 (仅供参考)';
  inconclusiveRate: number;
  status: 'signed' | 'revoked';
  notes: string;
}

// ATT&CK / ICS Technique Catalogue Item (SCN-03)
export interface TechniqueItem {
  id: string; // 'T1190', 'T0855'
  name: string;
  tactic: TacticPhase;
  tacticName: string;
  category: 'Enterprise' | 'ICS' | 'BENIGN';
  primaryDs: string;
  secondaryDs: string[];
  description: string;
}

// 3-Level Reset Status (ENV-05)
export interface ResetStatus {
  containerLevel: 'clean' | 'dirty' | 'resetting';
  dataStoreLevel: 'clean' | 'dirty' | 'resetting';
  otProcessLevel: 'clean' | 'dirty' | 'resetting';
  lastResetTime: string;
  isIdempotentVerified: boolean;
}

// Topology Data Types (ENV-01)
export type NodeKind = 'asset' | 'zone' | 'defense' | 'link';
export type AssetClass = 'plc' | 'hmi' | 'gateway' | 'app' | 'database' | 'terminal' | 'other';
export type ZoneId = 'external' | 'dmz' | 'mgmt' | 'control' | 'field';
export type CriticalityLevel = 'low' | 'medium' | 'high';
export type TopologySource = 'declared' | 'derived';

export interface TopologyNode {
  node_id: string;
  node_kind: NodeKind;
  asset_class: AssetClass;
  zone_id: ZoneId;
  label: string;
  ip: string;
  protocol: string;
  criticality: CriticalityLevel;
  visible_to: string[];
  topology_source: TopologySource;
}

export type DeploymentMode = 'inline' | 'tap' | 'agent' | 'api';
export type ProbeStatus = 'pass' | 'fail' | 'not_run' | 'insufficient_granularity';

export interface DefenseDeploymentPoint {
  ds_id: string;
  shortName: string;
  fullName: string;
  deployment_face: string; // e.g. 'external-dmz', 'dmz-mgmt', 'mgmt-control', 'control-field', or ''
  deployment_mode: DeploymentMode;
  can_prevent: boolean;
  version: string;
  probe_status: ProbeStatus;
  policyRef?: string;
  guardBoundaryDesc: string;
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  type: 'normal' | 'management' | 'mirror';
  label?: string;
}

