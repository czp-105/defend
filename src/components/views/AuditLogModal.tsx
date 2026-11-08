import React, { useState } from 'react';
import { AuditLogEntry, UserRole } from '../../types/cidtp';
import {
  X,
  History,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.actor.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cidtp-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('已导出完整的不可篡改追加式操作审计日志 (JSON)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-[#111821] border border-[#223040] rounded-[4px] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#223040] bg-[#111821]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040]">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                追加式操作审计日志 (APPEND-ONLY AUDIT TRAIL)
                <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
                  GEN-02 合规凭据
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                记录全部创建、编排、DEM覆盖、异议、审批与签字写操作 · 附带强制理由与前后值摘要
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] hover:bg-[#1a2332] text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0A0E13] border-b border-[#223040] text-xs">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索操作人、目标对象、理由关键词..."
              className="w-full bg-[#111821] border border-[#223040] rounded-[4px] px-2.5 py-1.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#111821] border border-[#223040] rounded-[4px] px-2 py-1.5 text-slate-200 outline-none"
            >
              <option value="all">全部动作类型</option>
              <option value="ACTIVITY_CREATED">ACTIVITY_CREATED</option>
              <option value="ACTIVITY_APPROVED">ACTIVITY_APPROVED</option>
              <option value="DEM_OVERRIDE">DEM_OVERRIDE</option>
              <option value="VERDICT_OBJECTION">VERDICT_OBJECTION</option>
              <option value="RUN_ABORTED">RUN_ABORTED</option>
              <option value="REPORT_SIGNED">REPORT_SIGNED</option>
            </select>

            <button
              onClick={handleExportAuditJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1a2332] hover:bg-[#223040] text-cyan-300 border border-[#223040] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              导出审计流水 (JSON)
            </button>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-[4px] border border-[#223040] bg-[#0A0E13] hover:border-slate-600 transition-colors text-xs space-y-1.5 font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 tabular-nums">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#111821] text-cyan-300 font-bold border border-[#223040]">
                    {log.action}
                  </span>
                  <span className="text-slate-200">
                    <strong>操作人:</strong> {log.actor} (
                    <span className="text-amber-400">{log.actorRole}</span>)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">{log.target}</span>
              </div>

              <div className="text-slate-300 pl-4 border-l-2 border-[#223040]">
                <span className="text-slate-400 font-sans font-medium">审计阐述:</span> {log.reason}
              </div>

              {(log.prevValue || log.newValue) && (
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pl-4">
                  {log.prevValue && (
                    <span>
                      原值: <span className="text-rose-400 line-through">{log.prevValue}</span>
                    </span>
                  )}
                  {log.newValue && (
                    <span>
                      新值: <span className="text-emerald-400">{log.newValue}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
