import React, { useState } from 'react';
import { meshAgents, tacticPhases } from '../../data/cidtpMockData';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Terminal,
  Wifi,
  X,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface RealTimeExecutionViewProps {
  onStepClick: (stepId: string) => void;
  onOpenArbitration: () => void;
}

export const RealTimeExecutionView: React.FC<RealTimeExecutionViewProps> = ({
  onStepClick,
  onOpenArbitration,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('A1');
  const [showWhyNoEvent, setShowWhyNoEvent] = useState(true);

  const alertLogs = [
    { time: '02:41:17.882', ds: 'DS-07', text: 'HTTP API 异常流量暴增', action: '放行', level: 'warn' },
    { time: '02:41:17.104', ds: 'DS-02', text: 'Modbus 0x05 写单线圈未授权探测', action: '旁路检出', level: 'info' },
    { time: '02:41:16.559', ds: 'DS-09', text: '镜像流量嗅探丢包 (探针失步)', action: '失步', level: 'danger' },
    { time: '02:41:15.201', ds: 'DS-01', text: 'TCP 端口 502 频繁重试连接', action: '记录', level: 'info' },
    { time: '02:41:11.304', ds: 'DS-04', text: 'srv-db-01 终端代理发现恶意注入', action: '隔离', level: 'success', tag: 'S-121' },
    { time: '02:41:09.112', ds: 'DS-10', text: 'bridge-iso 物理隔离网闸阻断非法协议', action: '阻断', level: 'success', tag: 'S-120' },
    { time: '02:41:08.450', ds: 'DS-03', text: 'app-waf 检出常规请求合规', action: '放行', level: 'info', tag: 'S-119' },
  ];

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Real-time Status Subheader matching Image 4 */}
      <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            CAMP-B3-WATER-001 [实时]
          </span>
          <span className="text-slate-400">T+02:41:18</span>
          <span>·</span>
          <span className="text-slate-200">
            第 <span className="text-cyan-400 font-bold">127</span> / 242 步
          </span>
          <span>·</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            观察窗 00:41
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            出站守卫 已强制
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
            时钟 PTP ±3ms
          </span>
          <button
            onClick={onOpenArbitration}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            进入裁判复核
          </button>
        </div>
      </div>

      {/* Main 3-Column Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-3): 9 Autonomous Mesh Agents (智能体花名册) */}
        <div className="lg:col-span-3 rounded-xl bg-[#080d17] border border-slate-800 p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="font-bold text-slate-100">智能体花名册 (9)</span>
              <span className="text-[10px] text-cyan-400">AUTONOMOUS MESH</span>
            </div>

            <div className="space-y-2 mt-3 max-h-[460px] overflow-y-auto pr-1">
              {meshAgents.map((agent) => {
                const isSelected = selectedAgent === agent.id;
                const isExecuting = agent.status === '执行中';
                const isBlocked = agent.status === '受阻';
                const isThinking = agent.status === '思考中';

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer text-[11px] font-mono ${
                      isSelected
                        ? 'bg-[#0f1d33] border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-[#090e18] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100">
                        {agent.code} {agent.name.split('智能体')[0]}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                          isExecuting
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isBlocked
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : isThinking
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : agent.isReadonly
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1">{agent.detail}</p>

                    {agent.quotaMax > 0 && (
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5">
                        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${(agent.quotaUsed / agent.quotaMax) * 100}%` }}
                          />
                        </div>
                        <span>
                          {agent.quotaUsed}/{agent.quotaMax} 请求
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0b1220] border border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>A9 裁判机制:</span>
            <span className="text-purple-400">独立只读 0-Drift</span>
          </div>
        </div>

        {/* Center Column (Cols 4-8): Active Graph Topology & Tactical Ticker */}
        <div className="lg:col-span-5 rounded-xl bg-[#080d17] border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="font-bold text-slate-100">攻击图 (实时) GRAPH-TOPOLOGY-ACTIVE</span>
              <span className="text-[10px] text-slate-400">节点: 10 · 验证: 7 · 拦截: 2</span>
            </div>

            {/* Topology Mock Visual Canvas */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center gap-8 text-[11px] font-mono">
                <span className="px-3 py-1 rounded bg-[#0b1220] border border-slate-700 text-slate-300">
                  ext-scanner
                </span>
                <span className="text-cyan-400 animate-pulse">────►</span>
                <span className="px-3 py-1 rounded bg-[#0b1220] border border-cyan-600 text-cyan-300">
                  web-portal
                </span>
              </div>

              {/* Pulsing Active Attack Node S-127 matching Image 4 */}
              <div
                onClick={() => onStepClick('S-127')}
                className="w-full max-w-sm p-3.5 rounded-xl bg-[#1a0c14] border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer hover:brightness-110 transition-all font-mono"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-rose-300">● S-127 · T0855</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                    非授权线圈写
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>观察窗内已 00:41</span>
                  <span className="text-rose-400 font-semibold">期望: DS-09, DS-01</span>
                </div>
              </div>

              <div className="flex items-center gap-8 text-[11px] font-mono">
                <span className="px-3 py-1 rounded bg-[#0b1220] border border-slate-700 text-slate-300">
                  jump-host
                </span>
                <span className="text-rose-500">─ ─ ─►</span>
                <span className="px-3 py-1 rounded bg-[#0b1220] border border-amber-600 text-amber-300">
                  scada-gw
                </span>
              </div>
            </div>

            {/* Manual Tactic Interventions */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-mono">● 已切人工插战术 (ICS MITRE):</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <button className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 text-left">
                  TA0105 过程控制抑制
                </button>
                <button className="p-1.5 rounded bg-cyan-600 text-white font-bold text-left shadow-sm">
                  TA0106 参数篡改
                </button>
                <button className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 text-left">
                  TA0107 伪造安全联锁
                </button>
                <button className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 text-left">
                  TA0108 物理执行
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tactics Progress */}
          <div className="pt-3 border-t border-slate-800 space-y-1 text-[10px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>侦察 9/9 · 初始访问 6/6 · 执行 12/12 · 横向 15/15</span>
              <span className="text-cyan-400">工控影响 5/8 (进行中)</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>

        {/* Right Column (Cols 9-12): Defense Alerts Stream & "为什么没有成为事件?" */}
        <div className="lg:col-span-4 rounded-xl bg-[#080d17] border border-slate-800 p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-100">防御告警流</span>
              </div>
              <span className="text-[10px] text-slate-400">
                原始 <span className="text-slate-200">402</span> / 事件 <span className="text-cyan-400 font-bold">118</span>
              </span>
            </div>

            {/* Subtabs */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex gap-1">
                <button className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">全部系统</button>
                <button className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">动作</button>
                <button className="px-2 py-0.5 rounded bg-cyan-600 text-white font-bold">仅事件</button>
              </div>
              <span className="text-slate-400">&gt; 过滤规则 / ID / 目标...</span>
            </div>

            {/* Alerts Feed */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 font-mono text-[11px]">
              {alertLogs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-[#0b1220] border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="text-slate-400">{item.time}</span>
                    <span className="font-bold text-cyan-400">{item.ds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 truncate">{item.text}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        item.level === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : item.level === 'danger'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Popover "为什么没有成为事件?" matching Image 4 */}
            {showWhyNoEvent && (
              <div className="p-3.5 rounded-xl bg-[#090f1d] border border-cyan-500/60 shadow-xl space-y-2 font-mono text-[11px] animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    为什么没有成为事件?
                  </span>
                  <button
                    onClick={() => setShowWhyNoEvent(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-[10px] text-rose-300">
                  TARGET: S-127 (OT-0855) <span className="underline">未满足提升条件</span>
                </div>

                <div className="space-y-1 text-[10px] text-slate-300 leading-relaxed">
                  <div className="text-amber-200">
                    1. 规则未命中收敛时间窗 (Δt=3.8s &gt; 2.0s)
                  </div>
                  <div className="text-rose-300">
                    2. 跨源因果链断裂 (DS-09 与 DS-01 无会话绑定)
                  </div>
                  <div className="text-slate-400">
                    3. 置信度未达阈值 (0.82 &lt; 0.85)
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>REFEREE ENGINE: SEC-AUDIT-v4</span>
                  <span className="text-cyan-400 cursor-pointer hover:underline">复核策略</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400">
            共享黑板状态: <span className="text-emerald-400">NODE-ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Socket Stream Ticker Footer matching Image 4 */}
      <div className="p-2 rounded-xl bg-[#070b12] border border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SOCKET: STREAM://CIDTP-PRIMARY-NODE</span>
          <span>·</span>
          <span>ROUNDTRIP: 1.24ms</span>
          <span>·</span>
          <span>OFFSET: -0.002ms</span>
        </div>

        <div className="flex items-center gap-3">
          <span>REFEREE ENGINE: SYNCHRONIZED (INST-04)</span>
          <span>INGEST LOAD: 48.2 KEPS</span>
          <span className="text-cyan-300 font-bold">SEC-CLEARANCE: OMEGA-7</span>
        </div>
      </div>
    </div>
  );
};
