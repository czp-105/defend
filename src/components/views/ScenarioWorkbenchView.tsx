import React, { useState } from 'react';
import { techniqueCatalogue, yamlScenarioCode } from '../../data/cidtpMockData';
import { TechniqueItem } from '../../types/cidtp';
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
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ScenarioWorkbenchViewProps {
  onValidate: () => void;
  onFreezeVersion: () => void;
}

interface StepFormData {
  id: string;
  techId: string;
  techName: string;
  asset: string;
  role: string;
  tStartSec: number;
  effectSec: number;
  reach: boolean;
  objective: boolean;
  evidenceType: '外带沉洞' | '反弹会话' | 'PLC快照' | '终端执行回显';
  evidenceStrength: '强' | '中' | '弱';
  dependsOn: string[];
  isNegativeControl?: boolean;
}

export const ScenarioWorkbenchView: React.FC<ScenarioWorkbenchViewProps> = ({
  onValidate,
  onFreezeVersion,
}) => {
  const [yamlText, setYamlText] = useState(yamlScenarioCode);
  const [selectedNode, setSelectedNode] = useState<string>('S-014');
  const [viewMode, setViewMode] = useState<'yaml' | 'form'>('yaml'); // SCN-01 YAML / 表单双模式
  const [activeTabMode, setActiveTabMode] = useState<'rule' | 'perf' | 'coverage'>('rule');

  // Diagnostic / G1 Validation Modal (SCN-06)
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);

  // Technique Picker Modal (SCN-03)
  const [showTechPicker, setShowTechPicker] = useState(false);
  const [techCategoryFilter, setTechCategoryFilter] = useState<'all' | 'Enterprise' | 'ICS' | 'BENIGN'>('all');
  const [techSearch, setTechSearch] = useState('');

  // Step Add/Edit Modal (SCN-02 & SCN-04 & SCN-07)
  const [showStepModal, setShowStepModal] = useState(false);
  const [stepModalMode, setStepModalMode] = useState<'add' | 'edit'>('add');
  const [stepForm, setStepForm] = useState<StepFormData>({
    id: 'S-016',
    techId: 'T0855',
    techName: '未经授权的命令报文写入',
    asset: 'plc-03',
    role: '工控指令下发者',
    tStartSec: 120,
    effectSec: 10,
    reach: true,
    objective: true,
    evidenceType: 'PLC快照',
    evidenceStrength: '中',
    dependsOn: ['S-014'],
    isNegativeControl: false,
  });

  // Cycle check state (SCN-05)
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);

  const lines = yamlText.split('\n');

  // Diagnostics list
  const diagnostics = [
    { line: 38, type: 'error', message: 'L38 DS-09 部署模式为旁路 (tap), 与 S-12 必须阻断冲突 (需折算)' },
    { line: 52, type: 'warning', message: 'L52 预算步数 120 超过期望矩阵覆盖目标 96' },
  ];

  const handleSelectTechnique = (t: TechniqueItem) => {
    setStepForm((prev) => ({
      ...prev,
      techId: t.id,
      techName: t.name,
      isNegativeControl: t.category === 'BENIGN',
    }));
    setShowTechPicker(false);
  };

  const handleSaveStepForm = (e: React.FormEvent) => {
    e.preventDefault();
    // DFS Cycle detection (SCN-05)
    if (stepForm.dependsOn.includes(stepForm.id)) {
      setCycleWarning(`成环错误：步骤 ${stepForm.id} 不能自依赖！`);
      return;
    }
    setCycleWarning(null);

    // Negative control validation (SCN-07)
    if (stepForm.isNegativeControl && stepForm.objective) {
      alert('门禁拦截：负对照测试步不得声明达成目标 (objective: true)，技术已被锁定为 BENIGN');
      return;
    }

    setShowStepModal(false);
    alert(`步骤 ${stepForm.id} (${stepForm.techId}) 已成功保存至场景模型中`);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Scenario Context Toolbar */}
      <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono font-bold text-sm text-cyan-300 tabular-nums">B3-WATER-001</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] text-slate-300 border border-[#223040] font-mono text-[11px] tabular-nums">
            版本 v1.4
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px]">
            B3 工业过程闭环型
          </span>
          <span className="px-2 py-0.5 rounded-[4px] bg-indigo-950 text-indigo-400 border border-indigo-800 text-[11px]">
            保真度 L3 硬件在环
          </span>

          {/* SCN-01 YAML vs Form Mode Toggle */}
          <div className="flex items-center ml-2 p-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[11px]">
            <button
              onClick={() => setViewMode('yaml')}
              className={`px-2.5 py-1 rounded-[2px] transition-all ${
                viewMode === 'yaml' ? 'bg-[#164e63] text-cyan-200 font-semibold border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              YAML 代码模式
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`px-2.5 py-1 rounded-[2px] transition-all ${
                viewMode === 'form' ? 'bg-[#164e63] text-cyan-200 font-semibold border border-cyan-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              表单结构化模式
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[11px]">
            <button
              onClick={() => setActiveTabMode('rule')}
              className={`px-2.5 py-1 rounded-[2px] transition-all ${
                activeTabMode === 'rule' ? 'bg-[#164e63] text-cyan-200 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              规划模式
            </button>
            <button
              onClick={() => setActiveTabMode('perf')}
              className={`px-2.5 py-1 rounded-[2px] transition-all ${
                activeTabMode === 'perf' ? 'bg-[#164e63] text-cyan-200 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              效能
            </button>
            <button
              onClick={() => setActiveTabMode('coverage')}
              className={`px-2.5 py-1 rounded-[2px] transition-all ${
                activeTabMode === 'coverage' ? 'bg-[#164e63] text-cyan-200 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              覆盖
            </button>
          </div>

          <button
            onClick={() => {
              onValidate();
              setShowValidationModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-slate-200 border border-[#223040] font-mono text-xs transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>一键校验 (G1)</span>
          </button>

          <button
            onClick={onFreezeVersion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 text-cyan-100 border border-cyan-500/60 font-semibold transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>冻结为 v1.5</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-4): SCN-01 Code Editor or Form Editor */}
        <div className="lg:col-span-4 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col justify-between overflow-hidden">
          <div className="h-8 bg-[#0A0E13] border-b border-[#223040] px-3 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              water-plant-b3.yaml
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                {viewMode === 'yaml' ? 'YAML 模式' : '表单模式'}
              </span>
            </div>
          </div>

          {/* SCN-01 Code View */}
          {viewMode === 'yaml' ? (
            <div className="p-3 font-mono text-[11px] overflow-y-auto max-h-[460px] leading-5 select-text">
              {lines.map((line, idx) => {
                const lineNo = (idx + 1).toString().padStart(2, '0');
                const isErrorLine = idx === 15 || idx === 16;
                const isTargetLine = idx === 17;
                const isHighlighted = highlightLine === idx + 1;

                return (
                  <div
                    key={idx}
                    className={`flex gap-3 px-1 py-0.5 rounded transition-colors ${
                      isHighlighted
                        ? 'bg-cyan-900/60 text-cyan-200 border-l-2 border-cyan-400'
                        : isErrorLine
                        ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                        : isTargetLine
                        ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500'
                        : 'hover:bg-slate-800/30 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 select-none w-6 text-right shrink-0">
                      {lineNo}
                    </span>
                    <span className="whitespace-pre truncate">{line}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SCN-01 Form Structured View */
            <div className="p-3 space-y-3 max-h-[460px] overflow-y-auto text-xs">
              <div className="p-2.5 rounded-lg bg-[#0d1424] border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex justify-between items-center">
                  <span>S-014 (当前选中步)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">T1190</span>
                </div>
                <div className="text-[11px] text-slate-300">资产: app-portal-01 · 角色: 渗透代理</div>
                <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                  <span>前置: dmz-reachable</span>
                  <span>后置: webshell</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1424] border border-slate-800 space-y-2">
                <div className="font-bold text-slate-100 flex justify-between items-center">
                  <span>S-005 (负对照心跳探测)</span>
                  <span className="text-[10px] text-amber-400 font-mono">BENIGN</span>
                </div>
                <div className="text-[11px] text-slate-300">资产: scada-gw · 角色: SCADA 监控轮询</div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  期望: MUST_NOT_TRIGGER (禁止误报)
                </div>
              </div>

              <button
                onClick={() => {
                  setStepModalMode('add');
                  setShowStepModal(true);
                }}
                className="w-full py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-center font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                新增结构化步骤 (SCN-02)
              </button>
            </div>
          )}

          {/* Bottom YAML Linter Status (SCN-06) */}
          <div className="bg-[#0b1220] border-t border-slate-800 p-2.5 text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowValidationModal(true)}>
                <AlertTriangle className="w-3.5 h-3.5" />
                诊断 (2 错误 · 1 警告) - 点击跳转
              </span>
              <span className="text-[10px] text-slate-400 font-normal">LINTER-CORE v4.1</span>
            </div>
            <div
              onClick={() => setHighlightLine(16)}
              className="text-[10px] text-rose-300 truncate cursor-pointer hover:underline"
            >
              ● L38 DS-09 部署模式为旁路 (tap), 与 S-12 必须阻断冲突
            </div>
            <div
              onClick={() => setHighlightLine(12)}
              className="text-[10px] text-amber-300 truncate cursor-pointer hover:underline"
            >
              ● L52 预算步数 120 超过期望矩阵目标 96
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
              <span>结构规范版本 v2.3</span>
              <span className="text-emerald-400">1 条警告已确认</span>
            </div>
          </div>
        </div>

        {/* Center Column (Cols 5-8): Attack Graph Topology Interactive Canvas */}
        <div className="lg:col-span-5 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-col justify-between overflow-hidden relative">
          {/* Topology Top Legend */}
          <div className="p-2.5 bg-[#0A0E13] border-b border-[#223040] flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono gap-2">
            <div className="flex items-center gap-2">
              <span>区域:</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-slate-500" /> 外部</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-cyan-500" /> DMZ</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-purple-500" /> 管理</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-amber-500" /> 控制</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[2px] bg-rose-500" /> 现场</span>
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
            <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400">
              拓扑边: <span className="text-cyan-400 font-semibold tabular-nums">214 条</span> · 12 条臆造边已剔除
            </div>

            {/* Step Node: S-014 */}
            <div
              onClick={() => setSelectedNode('S-014')}
              className={`w-64 p-3 rounded-[4px] border transition-all cursor-pointer ${
                selectedNode === 'S-014'
                  ? 'bg-[#164e63]/30 border-cyan-400 text-slate-100'
                  : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-cyan-300">S-014 · T1190</span>
                <div className="flex gap-1 text-[9px]">
                  <span className="px-1 rounded-[2px] bg-rose-950 text-rose-400 border border-rose-800">DS-07</span>
                  <span className="px-1 rounded-[2px] bg-cyan-950 text-cyan-400 border border-cyan-800">DS-02</span>
                  <span className="px-1 rounded-[2px] bg-[#111821] text-slate-400 border border-[#223040]">DS-05</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-cyan-400" />
                  app-portal-01
                </span>
                <span className="text-[10px] px-1.5 rounded-[2px] bg-cyan-950 text-cyan-300 font-mono">DMZ</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>权限: 低 → 管理员</span>
                <span>能力: 读取与执行</span>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-cyan-400/80" />

            {/* Node: ot-historian */}
            <div
              onClick={() => setSelectedNode('ot-historian')}
              className={`w-64 p-3 rounded-[4px] border transition-all cursor-pointer ${
                selectedNode === 'ot-historian'
                  ? 'bg-[#164e63]/30 border-cyan-400 text-slate-100'
                  : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-slate-200">S-015 · T1078</span>
                <span className="px-1 text-[9px] rounded-[2px] bg-cyan-950 text-cyan-400 border border-cyan-800">DS-01</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-[2px] bg-purple-400" />
                  ot-historian
                </span>
                <span className="text-[10px] px-1.5 rounded-[2px] bg-purple-950 text-purple-300 font-mono">管理区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>权限: 操作员</span>
                <span>能力: 工艺历史查询</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-0.5 h-6 bg-amber-400" />
              <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono">
                token-vault-sync 凭证泄露 (工程特权证书 L2)
              </span>
            </div>

            {/* Node: plc-gw-01 */}
            <div
              onClick={() => setSelectedNode('plc-gw-01')}
              className={`w-64 p-3 rounded-[4px] border transition-all cursor-pointer ${
                selectedNode === 'plc-gw-01'
                  ? 'bg-[#164e63]/30 border-cyan-400 text-slate-100'
                  : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-amber-300">plc-gw-01</span>
                <span className="text-[10px] px-1.5 rounded-[2px] bg-amber-950 text-amber-300 font-mono">控制区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>权限: 工程师站</span>
                <span>能力: 指令下发</span>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-rose-500" />

            {/* Node: rtu-field-valve */}
            <div
              onClick={() => setSelectedNode('rtu-field-valve')}
              className={`w-64 p-3 rounded-[4px] border transition-all cursor-pointer ${
                selectedNode === 'rtu-field-valve'
                  ? 'bg-rose-950/40 border-rose-500 text-slate-100'
                  : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-bold text-rose-400">rtu-field-valve</span>
                <span className="text-[10px] px-1.5 rounded-[2px] bg-rose-950 text-rose-300 font-mono">现场区</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>权限: 固件控制</span>
                <span className="text-rose-400 font-semibold">物理动作 (阀门)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 9-12): Step Inspector (步骤检查器 S-014) */}
        <div className="lg:col-span-3 rounded-[4px] bg-[#111821] border border-[#223040] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040] font-mono">
              <div>
                <span className="text-xs font-bold text-slate-100">步骤检查器</span>
                <span className="text-cyan-400 font-bold ml-1.5 tabular-nums">S-014</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setStepModalMode('edit');
                    setShowStepModal(true);
                  }}
                  className="p-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-cyan-300"
                  title="编辑当前步骤属性"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300 font-mono">
                  已规划
                </span>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">技术编号 (ATT&CK):</span>
                <button
                  onClick={() => setShowTechPicker(true)}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  T1190 &gt;
                </button>
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
            <div className="space-y-1.5 pt-2 border-t border-[#223040] text-[11px]">
              <span className="text-slate-400 block font-mono">前置执行约束</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-300">network:dmz-reachable</span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-300">auth:anonymous</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#223040] text-[11px]">
              <span className="text-slate-400 block font-mono">后置状态断言</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-emerald-400">exec:webshell-context</span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-emerald-400">file:write:/var/www</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#223040] text-[11px]">
              <span className="text-slate-400 block font-mono">允许观测遥测参数</span>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300">
                  http_status
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300">
                  response_time
                </span>
              </div>
            </div>

            {/* Resource budget progress */}
            <div className="space-y-2 pt-2 border-t border-[#223040] text-[11px] font-mono">
              <span className="text-slate-400 block">执行消耗预算</span>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>请求数:</span>
                  <span className="text-cyan-400 tabular-nums">22 / 40 (55%)</span>
                </div>
                <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: '55%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>实际耗时:</span>
                  <span className="text-cyan-400 tabular-nums">118 / 300 秒 (39%)</span>
                </div>
                <div className="w-full h-1 bg-[#0A0E13] rounded-[2px] overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: '39%' }} />
                </div>
              </div>
            </div>

            {/* Expected baseline requirements */}
            <div className="space-y-2 pt-2 border-t border-[#223040] text-[11px]">
              <span className="text-slate-400 block font-mono">期望防御系统基线要求 (3 项)</span>
              <div className="space-y-1.5">
                <div className="p-2 rounded-[4px] bg-rose-950/40 border border-rose-800 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-rose-400">DS-07</span>
                      <span className="text-slate-300 ml-1.5">必须阻断 · 串联 (inline)</span>
                    </div>
                    <span className="font-mono text-rose-400 tabular-nums">≤ 5.0 秒</span>
                  </div>
                </div>

                <div className="p-2 rounded-[4px] bg-cyan-950/40 border border-cyan-800 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-cyan-400">DS-02</span>
                      <span className="text-slate-300 ml-1.5">必须检测 · 串联 (inline)</span>
                    </div>
                    <span className="font-mono text-cyan-400 tabular-nums">≤ 5.0 秒</span>
                  </div>
                </div>

                <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[10px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-400">DS-05</span>
                      <span className="text-slate-300 ml-1.5">仅观测 · 终端代理 (agent)</span>
                    </div>
                    <span className="font-mono text-slate-400">无强制时限</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-[#223040] mt-4">
            <button
              onClick={() => {
                setStepModalMode('add');
                setShowStepModal(true);
              }}
              className="py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-200 text-[10px] font-medium text-center"
            >
              新增攻击步
            </button>
            <button
              onClick={() => setShowTechPicker(true)}
              className="py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-200 text-[10px] font-medium text-center"
            >
              技术库检索
            </button>
            <button
              onClick={() => setShowValidationModal(true)}
              className="py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-200 text-[10px] font-medium text-center"
            >
              诊断详情
            </button>
          </div>
        </div>
      </div>

      {/* SCN-06 G1 Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                G1 场景语法与结构校验结果 (VALIDATE_SCENARIO)
              </div>
              <button onClick={() => setShowValidationModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              自动校验 ATT&CK 技术收录、ID 唯一性、依赖 DAG 无成环、以及目标步证据绑定：
            </p>

            <div className="space-y-2 font-mono text-[11px]">
              {diagnostics.map((d, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setHighlightLine(d.line === 38 ? 16 : 12);
                    setShowValidationModal(false);
                  }}
                  className={`p-2.5 rounded-[4px] border cursor-pointer hover:opacity-90 ${
                    d.type === 'error'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : 'bg-amber-950/40 border-amber-800 text-amber-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="tabular-nums">{d.type === 'error' ? '错误' : '警告'}: 第 {d.line} 行</span>
                    <span className="text-[10px] underline">点击定位到代码</span>
                  </div>
                  <div className="mt-1">{d.message}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-200 hover:bg-slate-800"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCN-03 ATT&CK / ICS Technique Picker Modal */}
      {showTechPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-2xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Search className="w-4 h-4 text-cyan-400" />
                ATT&CK / ICS 技术目录检索 (SCN-03)
              </div>
              <button onClick={() => setShowTechPicker(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                placeholder="搜索技术编号 (T1190) 或战术名称..."
                className="flex-1 bg-[#0A0E13] border border-[#223040] rounded-[4px] px-2.5 py-1.5 text-slate-100 outline-none focus:border-cyan-500 font-mono"
              />
              <div className="flex gap-1 bg-[#0A0E13] p-1 rounded-[4px] border border-[#223040] text-[11px]">
                {(['all', 'Enterprise', 'ICS', 'BENIGN'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTechCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-[2px] ${
                      techCategoryFilter === cat
                        ? 'bg-[#164e63] text-cyan-200 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'all' ? '全部' : cat === 'Enterprise' ? '企业网' : cat === 'ICS' ? '工控ICS' : '良性基线'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {techniqueCatalogue
                .filter((t) => {
                  if (techCategoryFilter !== 'all' && t.category !== techCategoryFilter) return false;
                  if (techSearch) {
                    const q = techSearch.toLowerCase();
                    return t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTechnique(t)}
                    className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] hover:border-cyan-500 cursor-pointer transition-colors flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-cyan-400 font-bold">{t.id}</span>
                        <span className="text-slate-200 font-sans font-medium">{t.name}</span>
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-[#111821] border border-[#223040] text-[10px] text-slate-400">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{t.description}</p>
                    </div>

                    <div className="text-right text-[11px] font-mono shrink-0 ml-3">
                      <div className="text-cyan-300">主责: {t.primaryDs}</div>
                      <div className="text-slate-400">次责: {t.secondaryDs.join(', ')}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SCN-02 & SCN-04 & SCN-07 Step Add/Edit Modal */}
      {showStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleSaveStepForm}
            className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-slate-100 font-bold">
                {stepModalMode === 'add' ? '新增攻击步 (SCN-02)' : `编辑步骤 ${stepForm.id}`}
              </div>
              <button
                type="button"
                onClick={() => setShowStepModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cycleWarning && (
              <div className="p-2.5 rounded-[4px] bg-rose-950/40 border border-rose-800 text-rose-300 font-mono text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {cycleWarning}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">步骤唯一代号 (step_id) *</label>
                <input
                  type="text"
                  value={stepForm.id}
                  onChange={(e) => setStepForm({ ...stepForm, id: e.target.value })}
                  required
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">技术编号 (T-Code) *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={stepForm.techId}
                    disabled={stepForm.isNegativeControl}
                    onChange={(e) => setStepForm({ ...stepForm, techId: e.target.value })}
                    className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-cyan-300 outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTechPicker(true)}
                    className="px-2.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300"
                  >
                    选
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">目标资产 (target asset) *</label>
                <input
                  type="text"
                  value={stepForm.asset}
                  onChange={(e) => setStepForm({ ...stepForm, asset: e.target.value })}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 font-mono outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">前置依赖 (depends_on) *</label>
                <input
                  type="text"
                  value={stepForm.dependsOn.join(', ')}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      dependsOn: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 font-mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* SCN-04 Objective Evidence Binding */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">目标达成证据绑定 (SCN-04)</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stepForm.reach}
                      onChange={(e) => setStepForm({ ...stepForm, reach: e.target.checked })}
                    />
                    <span className="text-slate-300">到达 (R)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stepForm.objective}
                      disabled={stepForm.isNegativeControl}
                      onChange={(e) => setStepForm({ ...stepForm, objective: e.target.checked })}
                    />
                    <span className="text-slate-300">达成 (O)</span>
                  </label>
                </div>
              </div>

              {stepForm.objective && (
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block mb-1">证据类型:</span>
                    <select
                      value={stepForm.evidenceType}
                      onChange={(e) => setStepForm({ ...stepForm, evidenceType: e.target.value as any })}
                      className="w-full bg-[#111821] border border-[#223040] rounded-[4px] p-1.5 text-slate-200 outline-none"
                    >
                      <option value="外带沉洞">外带沉洞收包 (Canary)</option>
                      <option value="反弹会话">反弹会话令牌 (Egress Sink)</option>
                      <option value="PLC快照">PLC快照采样 (Process Model)</option>
                      <option value="终端执行回显">终端执行回显 (同机弱证据)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">证据强度分级:</span>
                    <select
                      value={stepForm.evidenceStrength}
                      onChange={(e) => setStepForm({ ...stepForm, evidenceStrength: e.target.value as any })}
                      className="w-full bg-[#111821] border border-[#223040] rounded-[4px] p-1.5 text-slate-200 outline-none"
                    >
                      <option value="强">强 (外带/独立SIEM/签名)</option>
                      <option value="中">中 (快照采样/状态写回)</option>
                      <option value="弱">弱 (同机日志/极易篡改)</option>
                    </select>
                  </div>
                </div>
              )}

              {stepForm.objective && stepForm.evidenceStrength === '弱' && (
                <div className="p-2 rounded-[4px] bg-amber-950/40 border border-amber-600/40 text-amber-300 text-[10px] leading-relaxed">
                  合规警示：仅绑定弱证据时，判据引擎 <code>judge.py</code> 将拒绝单独支撑 O 达成层，最终结论将自动降级为 <code>P1 触达未达成</code>。
                </div>
              )}
            </div>

            {/* SCN-07 Negative Control Switch */}
            <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-300 font-medium">设为负对照业务步 (SCN-07)</span>
                <p className="text-slate-400 text-[10px]">技术自动锁定为 BENIGN，只允许期望 MUST_NOT_TRIGGER</p>
              </div>
              <input
                type="checkbox"
                checked={stepForm.isNegativeControl}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setStepForm({
                    ...stepForm,
                    isNegativeControl: checked,
                    techId: checked ? 'BENIGN' : 'T1190',
                    objective: checked ? false : stepForm.objective,
                  });
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#223040]">
              <button
                type="button"
                onClick={() => setShowStepModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 border border-cyan-500/50 text-cyan-100 font-medium"
              >
                保存步骤定义
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

