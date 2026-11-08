import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  MapPin,
  Lock,
} from 'lucide-react';
import { AuditLog, AuditSeverity } from '../types';
import { exportDataAsCsv, filterAuditLogs } from '../utils/systemLogic';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = filterAuditLogs(logs, {
    search: searchQuery,
    severity: severityFilter,
    status: statusFilter,
  });

  const handleExportCsv = () => {
    const csvContent = exportDataAsCsv(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `omniflow-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const severityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            CRITICAL 严重
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            WARNING 告警
          </span>
        );
      case 'notice':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            NOTICE 注意
          </span>
        );
      case 'info':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            INFO 常规
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Threat intelligence banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>威胁情报中心已启用主动合规防御</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                实时封锁生效中
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              过去 24 小时累计拦截 142 次可疑访问尝试，自动冻结 1 个境外黑名单 IP，全域未出现未授权数据渗漏。
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>导出当前审计日志 (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="搜索操作人、行为、IP或详情"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索操作人姓名、IP地址、模块或操作行为..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="筛选严重级别"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部严重等级</option>
            <option value="critical">Critical (严重)</option>
            <option value="warning">Warning (告警)</option>
            <option value="notice">Notice (注意)</option>
            <option value="info">Info (常规)</option>
          </select>

          <select
            aria-label="筛选执行状态"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">全部执行状态</option>
            <option value="success">执行成功</option>
            <option value="failed">执行失败 / 拦截</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">操作记录编号</th>
                <th className="py-3 px-4">操作人及账号</th>
                <th className="py-3 px-4">所属功能模块</th>
                <th className="py-3 px-4">操作行为</th>
                <th className="py-3 px-4">访问来源 IP 与地点</th>
                <th className="py-3 px-4">风险级别</th>
                <th className="py-3 px-4">执行状态</th>
                <th className="py-3 px-4 text-right">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{log.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{log.operator}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{log.operatorEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{log.action}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-slate-200">{log.ipAddress}</div>
                    <div className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {log.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{severityBadge(log.severity)}</td>
                  <td className="py-3.5 px-4">
                    {log.status === 'success' ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 成功
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> 拦截/失败
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors"
                      title="查看详细轨迹"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-indigo-400" />
                审计事件详细记录 - {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                aria-label="关闭详情窗口"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">发生时间</span>
                <span className="font-mono text-slate-200">{selectedLog.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">操作人</span>
                <span className="text-indigo-400 font-semibold">{selectedLog.operator} ({selectedLog.operatorEmail})</span>
              </div>
              <div>
                <span className="text-slate-400 block">所属模块</span>
                <span className="text-slate-200">{selectedLog.module}</span>
              </div>
              <div>
                <span className="text-slate-400 block">风险级别</span>
                <div>{severityBadge(selectedLog.severity)}</div>
              </div>
              <div>
                <span className="text-slate-400 block">网络位置</span>
                <span className="font-mono text-slate-200">{selectedLog.ipAddress} · {selectedLog.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">执行结果</span>
                <span className={selectedLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {selectedLog.status === 'success' ? '执行成功 (OK)' : '拦截或异常 (REJECTED)'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">操作详细载荷与解释:</span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                {selectedLog.details}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                关闭查看
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
