import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkUserPermission,
  calculateClusterHealth,
  evaluateNodeAlerts,
  filterAuditLogs,
  computeMetricSummary,
  formatUptime,
  exportDataAsCsv,
} from './systemLogic';
import { AuditLog, RolePermissions, ServerNode } from '../types';

const mockRoleMatrix: RolePermissions[] = [
  {
    role: 'devops_lead',
    roleName: 'DevOps负责人',
    description: '负责云资源管理与调度',
    permissions: {
      dashboard: ['view'],
      nodes: ['view', 'edit', 'create', 'delete'],
      rbac: ['view'],
      workflows: ['view', 'edit', 'create'],
      audit: ['view'],
      settings: ['view'],
    },
  },
  {
    role: 'analyst',
    roleName: '数据分析师',
    description: '只读报表分析',
    permissions: {
      dashboard: ['view'],
      nodes: ['view'],
      rbac: [],
      workflows: ['view'],
      audit: ['view'],
      settings: [],
    },
  },
];

const mockNodes: ServerNode[] = [
  {
    id: 'node-01',
    name: 'k8s-master-01',
    cluster: '华东主集群',
    region: 'cn-shanghai',
    ip: '10.240.1.10',
    status: 'running',
    cpuUsage: 45,
    memUsage: 60,
    diskUsage: 50,
    qps: 1200,
    uptimeHours: 720,
    version: 'v1.30.2',
    replicas: 3,
    tags: ['master', 'prod'],
  },
  {
    id: 'node-02',
    name: 'k8s-worker-01',
    cluster: '华东主集群',
    region: 'cn-shanghai',
    ip: '10.240.1.11',
    status: 'warning',
    cpuUsage: 88,
    memUsage: 86,
    diskUsage: 92,
    qps: 3400,
    uptimeHours: 36,
    version: 'v1.30.2',
    replicas: 6,
    tags: ['worker', 'high-load'],
  },
  {
    id: 'node-03',
    name: 'k8s-worker-02',
    cluster: '华南灾备集群',
    region: 'cn-guangzhou',
    ip: '10.241.2.15',
    status: 'critical',
    cpuUsage: 95,
    memUsage: 90,
    diskUsage: 70,
    qps: 0,
    uptimeHours: 12,
    version: 'v1.30.2',
    replicas: 2,
    tags: ['worker', 'dr'],
  },
];

const mockLogs: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-11-07 18:20:00',
    operator: '张伟',
    operatorEmail: 'zhangwei@company.com',
    module: '节点管理',
    action: '重启节点 k8s-worker-02',
    ipAddress: '192.168.1.100',
    location: '上海',
    severity: 'warning',
    status: 'success',
    details: '触发紧急健康恢复流程',
  },
  {
    id: 'log-02',
    timestamp: '2026-11-07 18:25:00',
    operator: '李娜',
    operatorEmail: 'lina@company.com',
    module: '权限中心',
    action: '修改角色权限',
    ipAddress: '192.168.1.105',
    location: '北京',
    severity: 'critical',
    status: 'failed',
    details: '越权尝试修改超级管理员配置',
  },
  {
    id: 'log-03',
    timestamp: '2026-11-07 19:00:00',
    operator: '系统自动任务',
    operatorEmail: 'cron@system.internal',
    module: '工作流',
    action: '执行数据库备份',
    ipAddress: '127.0.0.1',
    location: '内网',
    severity: 'info',
    status: 'success',
    details: '定时备份已成功同步至对象存储',
  },
];

test('checkUserPermission grants super_admin all permissions', () => {
  assert.equal(checkUserPermission('super_admin', 'settings', 'delete', mockRoleMatrix), true);
  assert.equal(checkUserPermission('super_admin', 'rbac', 'create', mockRoleMatrix), true);
});

test('checkUserPermission checks granular role permissions', () => {
  assert.equal(checkUserPermission('devops_lead', 'nodes', 'delete', mockRoleMatrix), true);
  assert.equal(checkUserPermission('devops_lead', 'rbac', 'delete', mockRoleMatrix), false);
  assert.equal(checkUserPermission('analyst', 'rbac', 'view', mockRoleMatrix), false);
  assert.equal(checkUserPermission('analyst', 'dashboard', 'view', mockRoleMatrix), true);
});

test('calculateClusterHealth detects degraded or critical states', () => {
  const health = calculateClusterHealth(mockNodes);
  assert.equal(health.runningCount, 1);
  assert.equal(health.warningCount, 1);
  assert.equal(health.criticalCount, 1);
  assert.equal(health.status, 'critical');
  assert.ok(health.healthScore <= 60);

  const healthyOnly = calculateClusterHealth([mockNodes[0]]);
  assert.equal(healthyOnly.status, 'healthy');
  assert.equal(healthyOnly.healthScore, 100);
});

test('evaluateNodeAlerts generates warnings on thresholds', () => {
  const alertsNormal = evaluateNodeAlerts(mockNodes[0]);
  assert.equal(alertsNormal.length, 0);

  const alertsWarning = evaluateNodeAlerts(mockNodes[1]);
  assert.ok(alertsWarning.length >= 3); // CPU, Mem, Disk exceed
  assert.ok(alertsWarning.some((a) => a.includes('CPU使用率过高')));
  assert.ok(alertsWarning.some((a) => a.includes('磁盘空间临界')));

  const alertsCritical = evaluateNodeAlerts(mockNodes[2]);
  assert.ok(alertsCritical.some((a) => a.includes('节点状态异常')));
});

test('filterAuditLogs filters by search term and severity', () => {
  const resultQuery = filterAuditLogs(mockLogs, { search: '张伟' });
  assert.equal(resultQuery.length, 1);
  assert.equal(resultQuery[0].id, 'log-01');

  const resultSeverity = filterAuditLogs(mockLogs, { severity: 'critical' });
  assert.equal(resultSeverity.length, 1);
  assert.equal(resultSeverity[0].id, 'log-02');

  const resultStatus = filterAuditLogs(mockLogs, { status: 'failed' });
  assert.equal(resultStatus.length, 1);
});

test('computeMetricSummary computes averages correctly', () => {
  const summary = computeMetricSummary(mockNodes);
  assert.equal(summary.avgCpu, Math.round((45 + 88 + 95) / 3));
  assert.equal(summary.avgMem, Math.round((60 + 86 + 90) / 3));
  assert.equal(summary.totalQps, 1200 + 3400 + 0);
});

test('formatUptime displays days and hours accurately', () => {
  assert.equal(formatUptime(12), '12 小时');
  assert.equal(formatUptime(48), '2 天 0 小时');
  assert.equal(formatUptime(50), '2 天 2 小时');
});

test('exportDataAsCsv produces valid CSV string', () => {
  const csv = exportDataAsCsv(mockLogs);
  assert.ok(csv.includes('ID,时间戳,操作人'));
  assert.ok(csv.includes('log-01'));
  assert.ok(csv.includes('张伟'));
});
