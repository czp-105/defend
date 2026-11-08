export type NavItemKey = 'dashboard' | 'nodes' | 'rbac' | 'workflows' | 'audit' | 'settings';

export type UserRole = 'super_admin' | 'devops_lead' | 'secops' | 'system_operator' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
  twoFactorEnabled: boolean;
  phone?: string;
  createdDate: string;
}

export type PermissionAction = 'view' | 'edit' | 'create' | 'delete' | 'audit';

export interface RolePermissions {
  role: UserRole;
  roleName: string;
  description: string;
  permissions: {
    dashboard: PermissionAction[];
    nodes: PermissionAction[];
    rbac: PermissionAction[];
    workflows: PermissionAction[];
    audit: PermissionAction[];
    settings: PermissionAction[];
  };
}

export type NodeStatus = 'running' | 'warning' | 'critical' | 'maintenance';

export interface ServerNode {
  id: string;
  name: string;
  cluster: string;
  region: string;
  ip: string;
  status: NodeStatus;
  cpuUsage: number; // percentage 0-100
  memUsage: number; // percentage 0-100
  diskUsage: number; // percentage 0-100
  qps: number;
  uptimeHours: number;
  version: string;
  replicas: number;
  tags: string[];
}

export type WorkflowStatus = 'active' | 'paused' | 'running' | 'failed' | 'success';

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  cronExpr: string;
  category: 'data_sync' | 'backup' | 'security_scan' | 'report' | 'cleanup';
  status: WorkflowStatus;
  lastRunTime: string;
  lastRunDuration: string;
  nextRunTime: string;
  successRate: number; // percentage
  targetCluster: string;
}

export type AuditSeverity = 'info' | 'notice' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  operatorEmail: string;
  module: string;
  action: string;
  ipAddress: string;
  location: string;
  severity: AuditSeverity;
  status: 'success' | 'failed';
  details: string;
}

export interface MetricPoint {
  time: string;
  traffic: number; // MB/s or requests
  qps: number;
  latency: number; // ms
  cpuAvg: number;
}

export interface PlatformConfig {
  platformName: string;
  companyName: string;
  clusterAutoScaling: boolean;
  defaultRetentionDays: number;
  alertEmail: string;
  enforce2FA: boolean;
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  webhookUrl: string;
}
