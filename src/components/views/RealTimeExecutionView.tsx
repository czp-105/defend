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
  Download,
  ListOrdered,
  FileCode,
  Info,
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

  // RUN-01 Launch Run Modal
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [runMode, setRunMode] = useState<'coverage' | 'efficacy'>('coverage');
  const [randomSeed, setRandomSeed] = useState(42);

  // RUN-07 Raw Events Viewer Modal
  const [showRawEventsModal, setShowRawEventsModal] = useState(false);
  const [rawEventFilter, setRawEventFilter] = useState('all');

  // RUN-08 Run Queue Drawer
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  const alertLogs = [
    { time: '02:41:17.882', ds: 'DS-07', text: 'HTTP API 异常流量暴增', action: '放行', level: 'warn' },
    { time: '02:41:17.104', ds: 'DS-02', text: 'Modbus 0x05 写单线圈未授权探测', action: '旁路检出', level: 'info' },
    { time: '02:41:16.559', ds: 'DS-09', text: '镜像流量嗅探丢包 (探针失步)', action: '失步', level: 'danger' },
    { time: '02:41:15.201', ds: 'DS-01', text: 'TCP 端口 502 频繁重试连接', action: '记录', level: 'info' },
    { time: '02:41:11.304', ds: 'DS-04', text: 'srv-db-01 终端代理发现恶意注入', action: '隔离', level: 'success', tag: 'S-121' },
    { time: '02:41:09.112', ds: 'DS-10', text: 'bridge-iso 物理隔离网闸阻断非法协议', action: '阻断', level: 'success', tag: 'S-120' },
    { time: '02:41:08.450', ds: 'DS-03', text: 'app-waf 检出常规请求合规', action: '放行', level: 'info', tag: 'S-119' },
  ];

  const rawEventsList = [
    { step: 'S-127', kind: 'process_state', source: 'ot-snapshot-plc3', time: '02:41:04.120', data: '{"coil": 40112, "val": 1, "target": "plc-03", "deviation": "+4.2%"}' },
    { step: 'S-127', kind: 'egress_sink', source: 'sinkhole-ext.cidtp.net', time: '02:41:02.880', data: '{"dns_query": "canary-ot-valve.cidtp.net", "resolved": "10.244.0.18"}' },
    { step: 'S-126', kind: 'alert_raw', source: 'DS-10', time: '02:40:48.330', data: '{"action": "block", "protocol": "Modbus/TCP", "ip": "192.168.10.12"}' },
    { step: 'S-124', kind: 'siem_normalized', source: 'siem-normalizer', time: '02:40:12.100', data: '{"rule_id": "RULE-API-RCE-09", "conf": 0.88, "status": "alert_only"}' },
  ];

  const handleLaunchRun = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLaunchModal(false);
    alert(`已向执行器下发运行请求: mode=${runMode}, seed=${randomSeed}, run_id=run-${Date.now()}`);
  };

  const handleExportForensicPackage = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawEventsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `evidence_ledger_forensics-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert('已导出原始取证证据包 (evidence_ledger.tar.gz 结构化数据)');
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* RUN-03 Architecture Notice */}
      <div className="px-3 py-1.5 rounded-[4px] bg-[#111821] border border-[#223040] text-cyan-300 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong>RUN-03 平台能力声明</strong>：当前为<strong>二期推演进度流式仿真</strong>；后端 <code>execute_run</code> 真实执行为同步串行、结束后一次性落盘。
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLaunchModal(true)}
            className="px-2.5 py-0.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors"
          >
            发起新运行 (RUN-01)
          </button>
          <button
            onClick={() => setShowRawEventsModal(true)}
            className="px-2.5 py-0.5 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-cyan-300 font-bold border border-[#223040] transition-colors"
          >
            原始事件流 (RUN-07)
          </button>
        </div>
      </div>

      {/* Real-time Status Subheader */}
      <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            CAMP-B3-WATER-001 [实时]
          </span>
          <span className="text-slate-400 tabular-nums">T+02:41:18</span>
          <span>·</span>
          <span className="text-slate-200 tabular-nums">
            第 <span className="text-cyan-400 font-bold">127</span> / 242 步
          </span>
          <span>·</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040] tabular-nums">
            观察窗 00:41
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-cyan-300 border border-[#223040]">
            出站守卫 已强制
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-emerald-400 border border-[#223040] tabular-nums">
            时钟 PTP ±3ms
          </span>
          <button
            onClick={onOpenArbitration}
            className="px-3 py-1 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-semibold transition-colors"
          >
            进入裁判复核
          </button>
        </div>
      </div>

      {/* Main 3-Column Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-3): 9 Autonomous Mesh Agents (RUN-04 智能体花名册) */}
        <div className="lg:col-span-3 rounded-[4px] bg-[#111821] border border-[#223040] p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs font-mono">
              <span className="font-bold text-slate-100">智能体花名册 (9)</span>
              <span className="text-[10px] text-cyan-400">自治网格 (RUN-04)</span>
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
                    className={`p-2.5 rounded-[4px] border transition-all cursor-pointer text-[11px] font-mono ${
                      isSelected
                        ? 'bg-[#1a293f] border-cyan-400'
                        : 'bg-[#0A0E13] border-[#223040] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{agent.code}</span>
                        <span className="text-slate-200">{agent.name.replace('智能体', '')}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-[4px] font-bold ${
                          isExecuting
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                            : isBlocked
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800'
                            : isThinking
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 truncate">{agent.detail}</p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span className="tabular-nums">
                        {agent.quotaUsed}/{agent.quotaMax} 请求
                      </span>
                      {agent.isReadonly && (
                        <span className="text-[9px] text-purple-400 bg-purple-950/60 px-1 rounded-[2px] border border-purple-800/40">
                          只读仲裁
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[10px] font-mono text-slate-400">
            <div>
              <strong>A9 裁判机制:</strong> 独立只读 0-Drift
            </div>
            <div className="text-slate-500 mt-0.5">只读推演遥测，绝不直接干预下发攻击指令</div>
          </div>
        </div>

        {/* Center Column (Cols 4-8): Active Graph Topology & Interactive Target S-127 */}
        <div className="lg:col-span-5 rounded-[4px] bg-[#111821] border border-[#223040] p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs font-mono">
              <span className="font-bold text-slate-100">实时攻击拓扑图 (ACTIVE TOPOLOGY)</span>
              <span className="text-[10px] text-slate-400">
                节点: <span className="text-cyan-400 font-bold">10</span> · 验证: 7 · 拦截: 2
              </span>
            </div>

            {/* Active Graph Canvas */}
            <div className="p-4 rounded-[4px] bg-[#0A0E13] border border-[#223040] min-h-[300px] flex flex-col justify-between font-mono relative">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-[4px] bg-[#111821] border border-[#223040] text-cyan-300">
                  ext-scanner
                </span>
                <span className="text-slate-600">──────►</span>
                <span className="px-2.5 py-1 rounded-[4px] bg-[#111821] border border-[#223040] text-cyan-300">
                  web-portal
                </span>
              </div>

              {/* Focus Active Step Card S-127 */}
              <div
                onClick={() => onStepClick('S-127')}
                className="my-3 p-3.5 rounded-[4px] bg-[#1a293f] border-2 border-cyan-400 cursor-pointer hover:border-cyan-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-cyan-300 text-xs">● S-127 · T0855</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-rose-950/70 text-rose-300 border border-rose-800 font-bold">
                    非授权线圈写
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 mt-2">
                  观察窗内已 <span className="text-cyan-300 font-bold">00:41</span> / 05:00
                </div>
                <div className="text-[10px] text-amber-400 mt-1">
                  期望防御系统: <strong>DS-09 (旁路), DS-01 (串联)</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded bg-[#0b1424] border border-cyan-800/60 text-cyan-300">
                  jump-host
                </span>
                <span className="text-slate-600">─ ─ ─►</span>
                <span className="px-2.5 py-1 rounded bg-[#0b1424] border border-cyan-800/60 text-cyan-300">
                  scada-gw
                </span>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-rose-400 font-bold">● 已切人工插战术 (ICS MITRE):</span>
                <div className="flex gap-1">
                  <button className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    TA0105 过程控制抑制
                  </button>
                  <button className="px-1.5 py-0.5 rounded bg-cyan-600 text-white font-bold">
                    TA0106 参数篡改
                  </button>
                  <button className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    TA0107 伪造安全联锁
                  </button>
                  <button className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    TA0108 物理执行
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-800">
            <span>侦察 9/9 · 初始访问 6/6 · 执行 12/12 · 横向 15/15</span>
            <span className="text-amber-400 font-bold">工控影响 5/8 (进行中)</span>
          </div>
        </div>

        {/* Right Column (Cols 9-12): Defense Alerts Feed & "Why not an incident" (RUN-05) */}
        <div className="lg:col-span-4 rounded-[4px] bg-[#111821] border border-[#223040] p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-slate-100">防御告警流</span>
              </div>
              <span className="text-[10px] text-slate-400 tabular-nums">
                原始 <span className="text-slate-200">402</span> / 事件 <span className="text-cyan-400 font-bold">118</span>
              </span>
            </div>

            {/* Subtabs */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex gap-1">
                <button className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-slate-300 border border-[#223040]">全部系统</button>
                <button className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-slate-300 border border-[#223040]">动作</button>
                <button className="px-2 py-0.5 rounded-[4px] bg-cyan-700 text-white font-bold">仅事件</button>
              </div>
              <span className="text-slate-400 text-[10px]">&gt; 模拟归一化 (siem.py)</span>
            </div>

            {/* Alerts Feed */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 font-mono text-[11px]">
              {alertLogs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="text-slate-400 tabular-nums">{item.time}</span>
                    <span className="font-bold text-cyan-400">{item.ds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 truncate">{item.text}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-[4px] font-bold ${
                        item.level === 'success'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                          : item.level === 'danger'
                          ? 'bg-rose-950/70 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Popover "为什么没有成为事件?" (RUN-05) */}
            {showWhyNoEvent && (
              <div className="p-3.5 rounded-[4px] bg-[#111821] border border-cyan-500/60 space-y-2 font-mono text-[11px] animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-[#223040]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    为什么没有成为事件? (RUN-05)
                  </span>
                  <button
                    onClick={() => setShowWhyNoEvent(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-[10px] text-rose-300">
                  目标: S-127 (OT-0855) <span className="underline">未满足提升条件</span>
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

                <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-[#223040]">
                  <span>裁判引擎: SEC-AUDIT-v4</span>
                  <button
                    onClick={onOpenArbitration}
                    className="text-cyan-400 cursor-pointer hover:underline"
                  >
                    复核策略 &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400">
            共享黑板状态: <span className="text-emerald-400">节点活跃</span>
          </div>
        </div>
      </div>

      {/* Socket Stream Ticker Footer */}
      <div className="p-2 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-[1px] bg-cyan-400 animate-pulse" />
          <span>套接字: STREAM://CIDTP-PRIMARY-NODE</span>
          <span>·</span>
          <span className="tabular-nums">往返延时: 1.24ms</span>
          <span>·</span>
          <span className="tabular-nums">时钟偏移: -0.002ms</span>
        </div>

        <div className="flex items-center gap-3">
          <span>裁判引擎: 已同步 (INST-04)</span>
          <span className="tabular-nums">接入吞吐: 48.2 KEPS</span>
          <span className="text-cyan-300 font-bold">安全密级: OMEGA-7</span>
        </div>
      </div>

      {/* RUN-01 Launch Run Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleLaunchRun}
            className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                启动自动化攻防演练运行 (RUN-01)
              </div>
              <button
                type="button"
                onClick={() => setShowLaunchModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-300 text-[11px] space-y-1">
              <div>
                ✓ <strong>前置门禁</strong>: G1 语法、G2 DEM 完整性通过；出站隔离守卫已强制 DROP
              </div>
              <div>
                ✓ <strong>复位校验</strong>: 容器镜像、业务库与 OT 模型已核验为零污染
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">执行模式 (Run Mode) *</label>
                <select
                  value={runMode}
                  onChange={(e) => setRunMode(e.target.value as any)}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none"
                >
                  <option value="coverage">coverage (全链路广度覆盖)</option>
                  <option value="efficacy">efficacy (深度对抗阻断暂停)</option>
                </select>
                {runMode === 'efficacy' && (
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    * 链路暂停：未执行步骤 ≠ 不可判定
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">随机种子 (Random Seed) *</label>
                <input
                  type="number"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#223040]">
              <button
                type="button"
                onClick={() => setShowLaunchModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#1a2332] text-slate-300 hover:bg-[#223040] border border-[#223040]"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-medium"
              >
                生成 run_id 并入队启动
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RUN-07 Raw Events Ledger Modal */}
      {showRawEventsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                原始事件流水与取证包 (RUN-07 events.jsonl)
              </div>
              <button
                onClick={() => setShowRawEventsModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">
                可按照 step_id、kind、source 检索 raw JSONL 证据，支持一键导出取证审计包
              </span>
              <button
                onClick={handleExportForensicPackage}
                className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-[#1a2332] text-cyan-300 border border-[#223040] font-mono text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                导出取证包 (.tar.gz)
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 font-mono text-[11px]">
              {rawEventsList.map((ev, i) => (
                <div key={i} className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span className="text-cyan-400 font-bold">{ev.step}</span>
                    <span>来源: {ev.source}</span>
                    <span>类型: {ev.kind}</span>
                    <span className="tabular-nums">{ev.time}</span>
                  </div>
                  <div className="text-slate-200 bg-[#111821] p-1.5 rounded-[2px] border border-[#223040] overflow-x-auto text-[10px]">
                    {ev.data}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowRawEventsModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#1a2332] text-slate-300 hover:bg-[#223040] border border-[#223040]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
