import React, { useState, useEffect } from 'react';
import { Search, Server, ShieldCheck, GitBranch, FileText, Settings, ArrowRight, X } from 'lucide-react';
import { NavItemKey, ServerNode } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: ServerNode[];
  onNavigate: (tab: NavItemKey) => void;
  onSelectNode: (node: ServerNode) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onNavigate,
  onSelectNode,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks: { key: NavItemKey; title: string; category: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', title: '监控总览 - 全局KPI及吞吐', category: '核心功能', icon: <Search className="w-4 h-4 text-indigo-400" /> },
    { key: 'nodes', title: '云节点集群 - 实例管理与伸缩', category: '核心功能', icon: <Server className="w-4 h-4 text-sky-400" /> },
    { key: 'rbac', title: '用户与权限 (RBAC) - 策略矩阵配置', category: '权限与安全', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { key: 'workflows', title: '任务流调度 - 定时作业与跨区同步', category: '自动化调度', icon: <GitBranch className="w-4 h-4 text-amber-400" /> },
    { key: 'audit', title: '安全与审计日志 - 导出报告与威胁拦截', category: '权限与安全', icon: <FileText className="w-4 h-4 text-rose-400" /> },
    { key: 'settings', title: '系统配置中心 - 安全基线与Webhook', category: '系统运维', icon: <Settings className="w-4 h-4 text-purple-400" /> },
  ];

  const filteredLinks = quickLinks.filter((l) =>
    l.title.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNodes = nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(query.toLowerCase()) ||
      n.ip.toLowerCase().includes(query.toLowerCase()) ||
      n.cluster.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            aria-label="全局快速检索输入框"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索系统模块、集群服务器或配置 (Esc退出)..."
            className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} aria-label="关闭快速检索" className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-3 text-xs">
          {/* Modules */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 px-2 mb-1.5 uppercase tracking-wider">
              系统功能模块
            </div>
            <div className="space-y-1">
              {filteredLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={() => {
                    onNavigate(link.key);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left text-slate-200 group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {link.icon}
                    <span>{link.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Nodes */}
          {filteredNodes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 px-2 mb-1.5 uppercase tracking-wider">
                云节点资源
              </div>
              <div className="space-y-1">
                {filteredNodes.slice(0, 4).map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left text-slate-200 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-mono font-medium text-slate-100">{node.name}</div>
                        <div className="text-[10px] text-slate-400">{node.ip} · {node.cluster}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 font-mono text-indigo-400">
                      打开控制台
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
