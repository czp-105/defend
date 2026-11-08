import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Trash2, Play } from 'lucide-react';
import { ServerNode } from '../types';

interface TerminalDrawerProps {
  node: ServerNode | null;
  onClose: () => void;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({ node, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (node) {
      setLogs([
        `[${new Date().toLocaleTimeString()}] SSH connection established to ${node.ip} (port 2222)`,
        `[${new Date().toLocaleTimeString()}] Linux 6.6.0-42-generic #42-Ubuntu SMP x86_64`,
        `[${new Date().toLocaleTimeString()}] Host: ${node.name} (${node.cluster})`,
        `[${new Date().toLocaleTimeString()}] Kubernetes kubelet version: ${node.version}`,
        `[${new Date().toLocaleTimeString()}] System load: CPU ${node.cpuUsage}%, MEM ${node.memUsage}%, DISK ${node.diskUsage}%`,
        `[${new Date().toLocaleTimeString()}] Type 'help', 'top', 'kubectl get pods', 'free -m' or 'df -h' for diagnostics.`,
      ]);
    }
  }, [node]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!node) return null;

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString();
    const newLogs = [...logs, `root@${node.name}:~# ${trimmed}`];

    if (trimmed === 'clear') {
      setLogs([]);
      setCommandInput('');
      return;
    }

    if (trimmed === 'help') {
      newLogs.push(
        'Available built-in commands:',
        '  kubectl get pods      - List active pod replicas on this node',
        '  top                   - Display real-time CPU & memory process tree',
        '  free -m               - Display available and utilized RAM',
        '  df -h                 - Display mount point storage capacity',
        '  systemctl status      - Inspect kubelet and containerd systemd service',
        '  clear                 - Clear console window'
      );
    } else if (trimmed.includes('kubectl get pods')) {
      newLogs.push(
        'NAME                                  READY   STATUS    RESTARTS   AGE',
        `${node.name}-pod-78bf6-a1   1/1     Running   0          42h`,
        `${node.name}-pod-78bf6-b2   1/1     Running   0          42h`,
        `${node.name}-ingress-proxy  2/2     Running   0          96h`,
        `kube-proxy-${node.id}       1/1     Running   0          180h`
      );
    } else if (trimmed === 'top') {
      newLogs.push(
        `Tasks: 142 total, 1 running, 141 sleeping, 0 stopped, 0 zombie`,
        `%Cpu(s): ${node.cpuUsage}.2 us, 3.4 sy, 0.0 ni, 42.1 id, 0.3 wa`,
        `MiB Mem :  64120 total,  ${Math.round((64120 * (100 - node.memUsage)) / 100)} free,  ${Math.round((64120 * node.memUsage) / 100)} used`,
        `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`,
        ` 1204 root      20   0 2480112 412048  98420 S  38.4  14.2 120:44.20 envoy`,
        `  982 root      20   0 1845100 298120  44120 S  18.1   8.6  64:12.80 kubelet`,
        ` 3410 appuser   20   0  982140 182040  24800 S  12.3   5.1  38:09.11 node-server`
      );
    } else if (trimmed.includes('free')) {
      newLogs.push(
        '               total        used        free      shared  buff/cache   available',
        `Mem:           64120       ${Math.round((64120 * node.memUsage) / 100)}       ${Math.round((64120 * (100 - node.memUsage)) / 100)}         412       12800       48200`,
        'Swap:           8192         214        7978'
      );
    } else if (trimmed.includes('df')) {
      newLogs.push(
        'Filesystem      Size  Used Avail Use% Mounted on',
        `/dev/nvme0n1p1  500G  ${Math.round(5 * node.diskUsage)}G  ${Math.round(5 * (100 - node.diskUsage))}G  ${node.diskUsage}% /`,
        'tmpfs            32G     0   32G   0% /dev/shm'
      );
    } else if (trimmed.includes('systemctl status')) {
      newLogs.push(
        '● kubelet.service - kubelet: The Kubernetes Node Agent',
        '     Loaded: loaded (/lib/systemd/system/kubelet.service; enabled)',
        '     Active: active (running) since Tue 2026-11-03 04:12:00 UTC',
        '   Main PID: 982 (kubelet)',
        `      Tasks: 42 (limit: 32768)`
      );
    } else {
      newLogs.push(`bash: ${trimmed}: command executed successfully (exit code 0)`);
    }

    setLogs(newLogs);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(commandInput);
    }
  };

  return (
    <div
      className={`fixed z-50 bg-slate-950 border-t border-slate-700 shadow-2xl flex flex-col transition-all duration-300 font-mono ${
        isFullScreen ? 'inset-0' : 'bottom-0 left-0 right-0 h-96'
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">{node.name}</span>
          <span className="text-slate-500">({node.ip})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          <span className="text-[11px] text-emerald-400">已建立终端会话</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => runCommand('top')}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              top
            </button>
            <button
              onClick={() => runCommand('kubectl get pods')}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              get pods
            </button>
            <button
              onClick={() => runCommand('df -h')}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              df -h
            </button>
          </div>

          <button
            onClick={() => setLogs([])}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="清屏"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title={isFullScreen ? '退出全屏' : '全屏显示'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            title="关闭终端"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto text-xs text-emerald-400/90 leading-relaxed font-mono space-y-1 select-text"
      >
        {logs.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <span className="text-xs text-emerald-400 font-semibold select-none">
          root@{node.name}:~#
        </span>
        <input
          type="text"
          aria-label="终端命令输入"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入命令 (例如: top, kubectl get pods, free -m) 并按回车..."
          className="flex-1 bg-transparent border-none text-xs text-slate-100 focus:outline-none font-mono"
          autoFocus
        />
        <button
          onClick={() => runCommand(commandInput)}
          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold flex items-center gap-1 shadow-sm"
        >
          <Play className="w-3 h-3" />
          执行
        </button>
      </div>
    </div>
  );
};
