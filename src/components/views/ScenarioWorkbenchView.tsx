import React, { useState } from 'react';
import { yamlScenarioCode } from '../../data/cidtpMockData';
import {
  FileCode,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Maximize2,
  Lock,
  GitBranch,
  Terminal,
  Server,
  Cpu,
  Zap,
  Activity,
  Plus,
} from 'lucide-react';

interface ScenarioWorkbenchViewProps {
  onValidate: () => void;
  onFreezeVersion: () => void;
}

export const ScenarioWorkbenchView: React.FC<ScenarioWorkbenchViewProps> = ({
  onValidate,
  onFreezeVersion,
}) => {
  const [yamlText, setYamlText] = useState(yamlScenarioCode);
  const [selectedNode, setSelectedNode] = useState<string>('S-014');
  const [activeTabMode, setActiveTabMode] = useState<'rule' | 'perf' | 'coverage'>('rule');

  const lines = yamlText.split('\n');

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Scenario Context Toolbar */}
      <div className="p-3 rounded-xl bg-[#090e18] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono font-bold text-sm text-cyan-300">B3-WATER-001</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
            版本 v1.4
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 text-[11px]">
            B3 工业过程闭环型
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 text-[11px]">
            保真度 L3 硬件在环
          </span>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#070b12] border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTabMode('rule')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeTabMode === 'rule' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              规则模式
            </button>
            <button
              onClick={() => setActiveTabMode('perf')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeTabMode === 'perf' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              效能
            </button>
            <button
              onClick={() => setActiveTabMode('coverage')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeTabMode === 'coverage' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              覆盖
            </button>
          </div>

          <button
            onClick={onValidate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            <span>校验</span>
          </button>

          <button
            onClick={onFreezeVersion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>冻结为 v1.5</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio: YAML Editor | Attack Graph Topology | Step Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-4): Code Editor water-plant-b3.yaml */}
        <div className="lg:col-span-4 rounded-xl bg-[#080d17] border border-slate-800 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="h-8 bg-[#0b1220] border-b border-slate-800 px-3 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              water-plant-b3.yaml
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </span>
            <span>UTF-8 YAML</span>
          </div>

          {/* Syntax Highlighted Mock YAML Lines */}
          <div className="p-3 font-mono text-[11px] overflow-y-auto max-h-[460px] leading-5 select-text">
            {lines.map((line, idx) => {
              const lineNo = (idx + 1).toString().padStart(2, '0');
              const isErrorLine = idx === 15 || idx === 16; // expectation_link S-12
              const isTargetLine = idx === 17;

              return (
                <div
                  key={idx}
                  className={`flex gap-3 px-1 py-0.5 rounded ${
                    isErrorLine
                      ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                      : isTargetLine
                      ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500'
                      : 'hover:bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <span className="text-slate-400 select-none w-6 text-right shrink-0">
                    {lineNo}
                  </span>
                  <span className="whitespace-pre truncate">{line}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom YAML Linter Status */}
          <div className="bg-[#0b1220] border-t border-slate-800 p-2.5 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                诊断 (2 错误 · 1 警告)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">LINTER-CORE v4.1</span>
            </div>
            <div className="text-[10px] text-rose-300 truncate">
              ● L38 DS-09 部署模式为旁路 (tap), 与 S-12 必须阻断冲突
            </div>
            <div className="text-[10px] text-amber-300 truncate">
              ● L52 预算步数 120 超过期望矩阵目标 96
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
              <span>结构规范版本 v2.3</span>
              <span className="text-emerald-400">1 条警告已确认</span>
            </div>
          </div>
        </div>

        {/* Center Column (Cols 5-8): Attack Graph Topology Interactive Canvas */}
        <div className="lg:col-span-5 rounded-xl bg-[#080d17] border border-slate-800 flex flex-col justify-between overflow-hidden relative">
          {/* Topology Top Legend */}
          <div className="p-2.5 bg-[#0b1220]/80 border-b border-slate-800 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
            <div className="flex items-center gap-2">
              <span>区域:</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-slate-500" /> 外部</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-cyan-500" /> DMZ</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-purple-500" /> 管理</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-amber-500" /> 控制</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-rose-500" /> 现场</span>
            </div>
            <div className="flex items-center gap-2">
              <span>边态:</span>
              <span className="text-cyan-400">一 已验证</span>
              <span className="text-rose-400">--- 失败</span>
              <span className="text-slate-400">…… 臆造</span>
            </div>
          </div>

          {/* Interactive Topology Graph */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-4 relative overflow-y-auto">
            {/* Top Stat Badge */}
            <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400">
              拓扑边: <span className="text-cyan-400 font-semibold">214 条</span> · 12 条臆造边已剔除
            </div>

            {/* Step Node: S-014 */}
            <div
              onClick={() => setSelectedNode('S-014')}
              className={`w-64 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedNode === 'S-014'
                  ? 'bg-[#0f1d33] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0c1424] border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-cyan-300">S-014 · T1190</span>
                <div className="flex gap-1 text-[9px]">
                  <span className="px-1 rounded bg-rose-950 text-rose-400 border border-rose-800">DS-07</span>
                  <span className="px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">DS-02</span>
                  <span className="px-1 rounded bg-slate-800 text-slate-400">DS-05</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-cyan-400" />
                  app-portal-01
                </span>
                <span className="text-[10px] px-1.5 rounded bg-cyan-950 text-cyan-300 font-mono">DMZ</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>权限: 低 → 管理员</span>
                <span>能力: 读取与执行</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-6 bg-cyan-400/80 animate-pulse" />

            {/* Node: ot-historian */}
            <div
              onClick={() => setSelectedNode('ot-historian')}
              className={`w-64 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedNode === 'ot-historian'
                  ? 'bg-[#0f1d33] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0c1424] border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-slate-200">S-015 · T1078</span>
                <span className="px-1 text-[9px] rounded bg-cyan-950 text-cyan-400 border border-cyan-800">DS-01</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-purple-400" />
                  ot-historian
                </span>
                <span className="text-[10px] px-1.5 rounded bg-purple-950 text-purple-300 font-mono">管理区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>权限: 操作员</span>
                <span>能力: 工艺历史查询</span>
              </div>
            </div>

            {/* Connecting Line with Token Vault badge */}
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 bg-amber-400" />
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono">
                token-vault-sync 凭证泄露 (工程特权证书 L2)
              </span>
            </div>

            {/* Node: plc-gw-01 */}
            <div
              onClick={() => setSelectedNode('plc-gw-01')}
              className={`w-64 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedNode === 'plc-gw-01'
                  ? 'bg-[#0f1d33] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0c1424] border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-amber-300">plc-gw-01</span>
                <span className="text-[10px] px-1.5 rounded bg-amber-950 text-amber-300 font-mono">控制区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>权限: 工程师站</span>
                <span>能力: 指令下发</span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-6 bg-rose-500" />

            {/* Node: rtu-field-valve */}
            <div
              onClick={() => setSelectedNode('rtu-field-valve')}
              className={`w-64 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedNode === 'rtu-field-valve'
                  ? 'bg-[#1e0a12] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-[#12080d] border-rose-900/60'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-rose-400">rtu-field-valve</span>
                <span className="text-[10px] px-1.5 rounded bg-rose-950 text-rose-300 font-mono">现场区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>权限: 固件控制</span>
                <span className="text-rose-400 font-semibold">物理动作 (阀门)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 9-12): Step Inspector (步骤检查器 S-014) */}
        <div className="lg:col-span-3 rounded-xl bg-[#080d17] border border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
              <div>
                <span className="text-xs font-bold text-slate-100">步骤检查器</span>
                <span className="text-cyan-400 font-bold ml-1.5">S-014</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">已规划</span>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">技术编号 (ATT&CK):</span>
                <span className="text-cyan-400 font-bold">T1190</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">战术阶段:</span>
                <span className="text-slate-200">初始访问 (Initial Access)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">目标资产:</span>
                <span className="text-slate-200">app-portal-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">变体标识:</span>
                <span className="text-rose-400 font-semibold">V-07 (CVE-2023-RCE)</span>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-mono">前置条件 (PRE-CONDITIONS)</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">network:dmz-reachable</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">auth:anonymous</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-mono">后置条件 (POST-CONDITIONS)</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">exec:webshell-context</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">file:write:/var/www</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-mono">允许观测参数 (OBSERVABLE KEYS)</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#0b1220] border border-slate-700 text-slate-300">
                  http_status
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0b1220] border border-slate-700 text-slate-300">
                  response_time
                </span>
              </div>
            </div>

            {/* Resource budget progress */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400 block">执行消耗预算</span>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>请求数:</span>
                  <span className="text-cyan-400">22 / 40 (55%)</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>实际耗时:</span>
                  <span className="text-cyan-400">118 / 300 秒 (39%)</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '39%' }} />
                </div>
              </div>
            </div>

            {/* Expected baseline requirements */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-mono">期望防御系统基线要求 (3 项)</span>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-mono font-bold text-rose-400">DS-07</span>
                    <span className="text-slate-300 ml-1.5">必须阻断 · 串联 (inline)</span>
                  </div>
                  <span className="font-mono text-rose-400">≤ 5.0 秒</span>
                </div>

                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-mono font-bold text-cyan-400">DS-02</span>
                    <span className="text-slate-300 ml-1.5">必须检测 · 串联 (inline)</span>
                  </div>
                  <span className="font-mono text-cyan-400">≤ 5.0 秒</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-mono font-bold text-slate-400">DS-05</span>
                    <span className="text-slate-300 ml-1.5">仅观测 · 终端代理 (agent)</span>
                  </div>
                  <span className="font-mono text-slate-400">无强制时限</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-slate-800 mt-4">
            <button className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium text-center">
              新增攻击步
            </button>
            <button className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium text-center">
              重规划子树
            </button>
            <button className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium text-center">
              决策记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
