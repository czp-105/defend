import {
  AuditLog,
  NavItemKey,
  PermissionAction,
  RolePermissions,
  ServerNode,
  UserRole,
} from '../types';

/**
 * Check if a given user role has the required permission action on a module
 */
export function checkUserPermission(
  role: UserRole,
  module: NavItemKey,
  action: PermissionAction,
  matrix: RolePermissions[]
): boolean {
  if (role === 'super_admin') return true;
  const roleConfig = matrix.find((r) => r.role === role);
  if (!roleConfig) return false;
  const actions = roleConfig.permissions[module];
  if (!actions) return false;
  return actions.includes(action);
}

/**
 * Calculate the overall cluster health score (0-100) and status
 */
export function calculateClusterHealth(nodes: ServerNode[]): {
  healthScore: number;
  status: 'healthy' | 'degraded' | 'critical';
  runningCount: number;
  warningCount: number;
  criticalCount: number;
  maintenanceCount: number;
} {
  if (nodes.length === 0) {
    return {
      healthScore: 100,
      status: 'healthy',
      runningCount: 0,
      warningCount: 0,
      criticalCount: 0,
      maintenanceCount: 0,
    };
  }

  let runningCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  let maintenanceCount = 0;

  for (const n of nodes) {
    if (n.status === 'running') runningCount++;
    else if (n.status === 'warning') warningCount++;
    else if (n.status === 'critical') criticalCount++;
    else if (n.status === 'maintenance') maintenanceCount++;
  }

  // Weight penalty: warning = -15%, critical = -35%
  const total = nodes.length;
  const rawScore = 100 - (warningCount * 15 + criticalCount * 35) / (total / 5);
  const healthScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (criticalCount > 0 || healthScore < 60) {
    status = 'critical';
  } else if (warningCount > 0 || healthScore < 85) {
    status = 'degraded';
  }

  return {
    healthScore,
    status,
    runningCount,
    warningCount,
    criticalCount,
    maintenanceCount,
  };
}

/**
 * Evaluate if a node exceeds safety thresholds and produce active alerts
 */
export function evaluateNodeAlerts(node: ServerNode): string[] {
  const alerts: string[] = [];
  if (node.cpuUsage >= 85) {
    alerts.push(`CPU使用率过高: ${node.cpuUsage}% (阈值 85%)`);
  }
  if (node.memUsage >= 85) {
    alerts.push(`内存占用过高: ${node.memUsage}% (阈值 85%)`);
  }
  if (node.diskUsage >= 90) {
    alerts.push(`磁盘空间临界: ${node.diskUsage}% (阈值 90%)`);
  }
  if (node.status === 'critical') {
    alerts.push(`节点状态异常，心跳丢失或服务无响应`);
  }
  return alerts;
}

/**
 * Filter audit logs based on search query, severity, and status
 */
export function filterAuditLogs(
  logs: AuditLog[],
  filter: { search?: string; severity?: string; status?: string }
): AuditLog[] {
  const query = filter.search?.trim().toLowerCase();
  return logs.filter((log) => {
    if (filter.severity && filter.severity !== 'all' && log.severity !== filter.severity) {
      return false;
    }
    if (filter.status && filter.status !== 'all' && log.status !== filter.status) {
      return false;
    }
    if (query) {
      const matchOperator = log.operator.toLowerCase().includes(query);
      const matchAction = log.action.toLowerCase().includes(query);
      const matchModule = log.module.toLowerCase().includes(query);
      const matchIp = log.ipAddress.toLowerCase().includes(query);
      const matchDetails = log.details.toLowerCase().includes(query);
      return matchOperator || matchAction || matchModule || matchIp || matchDetails;
    }
    return true;
  });
}

/**
 * Aggregate nodes metrics for cluster dashboard
 */
export function computeMetricSummary(nodes: ServerNode[]): {
  avgCpu: number;
  avgMem: number;
  avgDisk: number;
  totalQps: number;
} {
  if (nodes.length === 0) {
    return { avgCpu: 0, avgMem: 0, avgDisk: 0, totalQps: 0 };
  }
  const totalCpu = nodes.reduce((acc, curr) => acc + curr.cpuUsage, 0);
  const totalMem = nodes.reduce((acc, curr) => acc + curr.memUsage, 0);
  const totalDisk = nodes.reduce((acc, curr) => acc + curr.diskUsage, 0);
  const totalQps = nodes.reduce((acc, curr) => acc + curr.qps, 0);

  return {
    avgCpu: Math.round(totalCpu / nodes.length),
    avgMem: Math.round(totalMem / nodes.length),
    avgDisk: Math.round(totalDisk / nodes.length),
    totalQps,
  };
}

/**
 * Format uptime hours into readable days/hours string
 */
export function formatUptime(uptimeHours: number): string {
  if (uptimeHours < 24) {
    return `${uptimeHours} 小时`;
  }
  const days = Math.floor(uptimeHours / 24);
  const hours = uptimeHours % 24;
  return `${days} 天 ${hours} 小时`;
}

/**
 * Export audit logs as CSV string
 */
export function exportDataAsCsv(logs: AuditLog[]): string {
  const headers = ['ID', '时间戳', '操作人', '模块', '操作行为', 'IP地址', '风险等级', '执行状态', '详情'];
  const rows = logs.map((l) => [
    l.id,
    `"${l.timestamp}"`,
    `"${l.operator} (${l.operatorEmail})"`,
    `"${l.module}"`,
    `"${l.action}"`,
    `"${l.ipAddress}"`,
    `"${l.severity}"`,
    `"${l.status}"`,
    `"${l.details.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
