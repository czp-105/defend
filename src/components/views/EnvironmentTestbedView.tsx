import React, { useState } from 'react';
import { DefenseSystem, GateCheckStatus, ResetStatus } from '../../types/cidtp';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Network,
  Cpu,
  Layers,
  Database,
  Sliders,
} from 'lucide-react';
import { LayeredTopologyView } from './LayeredTopologyView';

interface EnvironmentTestbedViewProps {
  defenseSystems: DefenseSystem[];
  gateCheck: GateCheckStatus;
  resetStatus: ResetStatus;
  onUpdateSystemMode: (id: string, mode: '串联' | '旁路' | '终端代理' | '接口') => void;
  onTriggerReset: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const EnvironmentTestbedView: React.FC<EnvironmentTestbedViewProps> = ({
  defenseSystems,
  gateCheck,
  resetStatus,
  onUpdateSystemMode,
  onTriggerReset,
  showToast,
}) => {
  const [selectedDs, setSelectedDs] = useState<DefenseSystem>(defenseSystems[0]);
  const [isResetting, setIsResetting] = useState(false);
  const [viewMode, setViewMode] = useState<'topology' | 'baseline'>('topology');

  const handleResetClick = () => {
    setIsResetting(true);
    showToast('正在启动三级深度复位（容器镜像销毁重建 -> 业务数据库回滚 -> OT过程模型定值归零）...', 'info');
    setTimeout(() => {
      setIsResetting(false);
      onTriggerReset();
      showToast('三级复位完成！幂等指纹已核对一致，靶场环境回归零初始状态');
    }, 2000);
  };

  if (viewMode === 'topology') {
    return (
      <div className="h-[calc(100vh-140px)] w-full flex flex-col rounded-[4px] border border-[#223040] overflow-hidden bg-[#0A0E13]">
        <LayeredTopologyView
          defenseSystems={defenseSystems}
          onSelectSystem={(dsId) => {
            const ds = defenseSystems.find((d) => d.id === dsId);
            if (ds) {
              setSelectedDs(ds);
              setViewMode('baseline');
            }
          }}
          onSwitchToBaseline={() => setViewMode('baseline')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[4px] bg-[#111821] border border-[#223040]">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040]">
            <Server className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              靶场环境与防御基线 (ENVIRONMENT & TESTBED BASELINE)
              <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
                ENV-01 ~ ENV-05
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              10 套防御系统参数基线 · 阳性探针门禁 · PTP高精时钟偏差 · 出站守卫熔断 · 三级幂等复位
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('topology')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#164e63] hover:bg-[#155e75] text-cyan-200 border border-cyan-500/50 text-xs font-mono transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>返回分层拓扑 (ENV-01)</span>
          </button>

          <button
            onClick={handleResetClick}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 rounded-[4px] bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? '三级复位执行中...' : '触发三级深度复位 (ENV-05)'}
          </button>
        </div>
      </div>

      {/* Grid: 4 Top Health Indicators (ENV-04 & ENV-05) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* PTP Clock */}
        <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              PTP 硬件时钟偏差
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded-[4px] border border-emerald-500/30">
              NORMAL
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
            ±{gateCheck.ptpSkewMs} ms
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            基线容差: ≤ {gateCheck.ptpLimitMs} ms (IEEE-1588 同步)
          </div>
        </div>

        {/* Egress Isolation Guard */}
        <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              出站流量熔断守卫
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded-[4px] border border-emerald-500/30">
              ENFORCED
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">已强制 (DROP)</div>
          <div className="text-[11px] text-slate-500">禁止测试流量穿透至公网，违规即刻阻断</div>
        </div>

        {/* Positive Probe Gate */}
        <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              阳性探针门禁 (G3)
            </span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded-[4px] border border-rose-500/30">
              CRITICAL
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {gateCheck.positiveProbePassed} / {gateCheck.positiveProbeTotal} 通过
          </div>
          <div className="text-[11px] text-rose-400/90 font-mono">
            失步: {gateCheck.failedProbeId}
          </div>
        </div>

        {/* 3-Level Reset State */}
        <div className="p-3.5 rounded-[4px] bg-[#111821] border border-[#223040] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              三级环境复位状态
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded-[4px] border border-purple-500/30">
              IDEMPOTENT
            </span>
          </div>
          <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <span className="text-emerald-400">● 容器</span>
            <span className="text-emerald-400">● 数据</span>
            <span className="text-emerald-400">● 物理</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            上次复位: {resetStatus.lastResetTime}
          </div>
        </div>
      </div>

      {/* Main Area: Defense Baseline Editor (ENV-02) & Derived Topology (ENV-01) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: 10 Defense Systems List */}
        <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
          <div className="flex items-center justify-between border-b border-[#223040] pb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              10 套防御系统参数基线 (ENV-02)
            </h3>
            <span className="text-xs font-mono text-slate-400">10 SYSTEMS</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {defenseSystems.map((ds) => {
              const isSelected = selectedDs.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDs(ds)}
                  className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1a293f] border-cyan-500 text-slate-100'
                      : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300">{ds.id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-[4px] text-[10px] ${
                        ds.mode === '旁路'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          : 'bg-[#111821] border border-[#223040] text-slate-300'
                      }`}
                    >
                      {ds.mode}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-100 mt-1">{ds.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {ds.product} {ds.version} · SLA ≤ {ds.latencyLimit}s
                  </div>

                  {ds.isProbeFailed && (
                    <div className="mt-1.5 text-[10px] text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-[4px] border border-rose-500/40 flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3 h-3" />
                      阳性探针未通过：旁路可见性失效
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Selected Defense Baseline Detail Editor (ENV-02) */}
        <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-4">
          <div className="flex items-center justify-between border-b border-[#223040] pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                基线详情与架构约束: {selectedDs.id} {selectedDs.name}
              </h3>
              <p className="text-xs text-slate-400">随场景版本冻结，不可在已批准活动中直接编辑</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-300">
              {selectedDs.product}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">部署模式 (Deployment Mode) *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['串联', '旁路', '终端代理', '接口'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onUpdateSystemMode(selectedDs.id, m);
                      setSelectedDs({ ...selectedDs, mode: m });
                      showToast(`已将 ${selectedDs.id} 模式调整为 [${m}]`);
                    }}
                    className={`py-2 px-3 rounded-[4px] font-mono border text-center transition-all ${
                      selectedDs.mode === m
                        ? 'bg-cyan-700/60 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-[#0A0E13] border-[#223040] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {selectedDs.mode === '旁路' && (
                <div className="mt-2 p-2.5 rounded-[4px] bg-amber-950/30 border border-amber-500/40 text-amber-300 text-[11px] leading-relaxed">
                  ⚠️ <strong>DEM-03 架构折算规则</strong>：旁路 (tap) 模式由于物理链路限制，无法在时间窗内执行硬件阻断操作。在 DEM 中所有针对该系统的 <code>MUST_BLOCK</code> 期望将自动折算为 <code>MUST_DETECT</code>，并在归因时标注 <code>architecture_adjusted=true</code>，不得计为防御系统阻断缺陷。
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">响应时延预算 (SLA Limit)</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedDs.latencyLimit} 秒`}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-300 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">阳性探针健康状态</label>
                <div
                  className={`p-2 rounded-[4px] font-mono font-bold border ${
                    selectedDs.isProbeFailed
                      ? 'bg-rose-950/70 text-rose-400 border-rose-800'
                      : 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {selectedDs.isProbeFailed ? 'FAILED (旁路失步)' : 'ONLINE (可见)'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">支持动作集 (Actions Set)</label>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-300 font-mono">
                  alert (告警)
                </span>
                {selectedDs.mode !== '旁路' && (
                  <span className="px-2.5 py-1 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-rose-300 font-mono">
                    block (阻断)
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-purple-300 font-mono">
                  correlate (关联)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">系统评测历史效能</label>
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-center font-mono">
                <div>
                  <div className="text-slate-500 text-[10px]">漏检率 (FNR)</div>
                  <div className="text-rose-400 font-bold tabular-nums">{selectedDs.fnr}%</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">阻断率 (BR)</div>
                  <div className="text-emerald-400 font-bold tabular-nums">
                    {selectedDs.mode === '旁路' ? 'N/A' : `${selectedDs.br}%`}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">p95 时延</div>
                  <div className="text-cyan-400 font-bold tabular-nums">{selectedDs.p95Latency}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Derived Topology View (ENV-01) */}
        <div className="p-4 rounded-[4px] bg-[#111821] border border-[#223040] space-y-3">
          <div className="flex items-center justify-between border-b border-[#223040] pb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              推导拓扑视图 (ENV-01)
            </h3>
            <button
              onClick={() => setViewMode('topology')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
            >
              展开全景分层画布 →
            </button>
          </div>

          <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[11px] text-slate-400 leading-normal">
            ℹ️ <strong>ENV-01 规范说明</strong>：MVP 场景未引入物理级 <code>topology.ref</code>{' '}
            仿真模型。本视图由 <code>steps.asset</code> 与 <code>defense_baseline.face</code>{' '}
            逻辑推导生成，非硬件真实拓扑。
          </div>

          {/* Topology Schematic Diagram */}
          <div className="p-4 rounded-[4px] bg-[#0A0E13] border border-[#223040] font-mono text-xs space-y-3">
            <div className="p-2.5 rounded-[4px] bg-blue-950/30 border border-blue-500/30 text-blue-300">
              <div className="font-bold flex items-center justify-between">
                <span>[DMZ 外部暴露面]</span>
                <span className="text-[10px] text-slate-400">DS-01, DS-03, DS-07</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">资产: app-portal-01, vpn-gw</div>
            </div>

            <div className="flex justify-center text-slate-600">│ 串联阻断</div>

            <div className="p-2.5 rounded-[4px] bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
              <div className="font-bold flex items-center justify-between">
                <span>[管理网络区 / 运维通道]</span>
                <span className="text-[10px] text-slate-400">DS-04, DS-06</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">资产: ws-mgmt-02, token-vault</div>
            </div>

            <div className="flex justify-center text-slate-600">│ 物理网闸 (DS-10)</div>

            <div className="p-2.5 rounded-[4px] bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold flex items-center justify-between">
                <span>[工控控制区 SCADA / Historian]</span>
                <span className="text-[10px] text-slate-400">DS-02 (旁路), DS-05</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">资产: ot-historian, scada-gw</div>
            </div>

            <div className="flex justify-center text-slate-600">│ 镜像监控 (DS-09)</div>

            <div className="p-2.5 rounded-[4px] bg-rose-950/30 border border-rose-500/30 text-rose-300">
              <div className="font-bold flex items-center justify-between">
                <span>[现场设备与现场总线现场区]</span>
                <span className="text-[10px] text-slate-400">DS-08 (终端)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">资产: plc-03, rtu-field-valve</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
