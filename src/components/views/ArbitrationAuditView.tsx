import React, { useState } from 'react';
import { attackSteps, evidenceList, initialObjections } from '../../data/cidtpMockData';
import { AttackStep, SixStateVerdict, VerdictObjection } from '../../types/cidtp';
import {
  Scale,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  Hash,
  Download,
  Save,
  Search,
  X,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';

interface ArbitrationAuditViewProps {
  onCommitVerdict: (stepId: string, verdict: SixStateVerdict) => void;
}

export const ArbitrationAuditView: React.FC<ArbitrationAuditViewProps> = ({ onCommitVerdict }) => {
  const [selectedStepId, setSelectedStepId] = useState<string>('S-127');
  const [activeVerdictFilter, setActiveVerdictFilter] = useState<string>('ALL');
  const [overrideVerdict, setOverrideVerdict] = useState<SixStateVerdict>('S');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // EVD-03 Inconclusive Review Modal
  const [showInconclusiveModal, setShowInconclusiveModal] = useState(false);
  const [inconclusiveAction, setInconclusiveAction] = useState<'accept' | 'rerun' | 'defect'>('accept');
  const [inconclusiveNotes, setInconclusiveNotes] = useState('');

  // EVD-04 Verdict Objection & Override Flow
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [objections, setObjections] = useState<VerdictObjection[]>(initialObjections);
  const [objProposedVerdict, setObjProposedVerdict] = useState<SixStateVerdict>('P1');
  const [objReason, setObjReason] = useState('');
  const [objEvidenceRefs, setObjEvidenceRefs] = useState('EV-2287, EV-2288');

  // EVD-05 Hash Integrity Checker
  const [showHashCheckerModal, setShowHashCheckerModal] = useState(false);

  const currentStep = attackSteps.find((s) => s.id === selectedStepId) || attackSteps[0];
  const isCurrentInconclusive = currentStep.verdict === 'I';

  const filteredSteps = attackSteps.filter((s) => {
    if (activeVerdictFilter !== 'ALL' && s.verdict !== activeVerdictFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.techId.toLowerCase().includes(q) ||
        s.targetAsset.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getVerdictBadge = (verdict: SixStateVerdict) => {
    switch (verdict) {
      case 'S':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">S 逃逸</span>;
      case 'P1':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">P1 触未达</span>;
      case 'P2':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-yellow-950 text-yellow-500 border border-yellow-800">P2 未触达</span>;
      case 'D1':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">D1 阻断有效</span>;
      case 'D2':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">D2 检终止</span>;
      case 'D3':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-950 text-orange-400 border border-orange-800">D3 检未阻</span>;
      case 'I':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">I 不可判</span>;
    }
  };

  const handleCommit = () => {
    onCommitVerdict(currentStep.id, overrideVerdict);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmitObjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objReason.trim() || objReason.trim().length < 10) {
      alert('EVD-04 规则：结论异议必须提供至少 10 字充分技术依据与理由');
      return;
    }

    const newObj: VerdictObjection = {
      id: `obj-${Date.now()}`,
      stepId: currentStep.id,
      originalVerdict: currentStep.verdict,
      proposedVerdict: objProposedVerdict,
      reason: objReason.trim(),
      evidenceRefs: objEvidenceRefs.split(',').map((s) => s.trim()),
      filedBy: '赵工 (独立裁判/复核人)',
      filedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewer: '赵工 (独立裁判/复核人)',
      approver: '张总工 (技术委员会/审批人)',
      status: 'pending_review',
    };

    setObjections((prev) => [newObj, ...prev]);
    setShowObjectionModal(false);
    setObjReason('');
    alert(`已针对步骤 ${currentStep.id} 提交改判异议申请，将转由 Approver 终审审批，原判决保持不可篡改记录`);
  };

  const handleInconclusiveReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowInconclusiveModal(false);
    alert(`不可判定复核结论已入库：处置方式=${inconclusiveAction}，说明=${inconclusiveNotes}`);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Arbitration Toolbar */}
      <div className="p-3 rounded-[4px] bg-[#111821] border border-[#223040] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-100 tabular-nums">CAMP-B3-WATER-001 /</span>
          <span className="px-2 py-0.5 rounded-[4px] bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
            判定复核 (EVD-01 ~ EVD-05)
          </span>
          <span className="text-slate-400">
            步骤: 第 <span className="text-cyan-400 font-bold tabular-nums">127</span> 步 / 共 242 步
          </span>
          <span>·</span>
          <span className="text-slate-300 font-sans">裁判 A9 · 独立复核 (职责分离)</span>
          <span>·</span>
          <span className="text-slate-400 tabular-nums">观察窗: 300s | 已过 292s</span>
          <span>·</span>
          <span className="text-cyan-400 tabular-nums">A9-SYNC // 02:41:04 UTC</span>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentInconclusive && (
            <button
              onClick={() => setShowInconclusiveModal(true)}
              className="px-2.5 py-1 rounded-[4px] bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800 font-bold"
            >
              不可判定复核 (EVD-03)
            </button>
          )}

          <button
            onClick={() => setShowObjectionModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-purple-300 border border-[#223040]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>提出异议 (EVD-04)</span>
          </button>

          <button
            onClick={() => setShowHashCheckerModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 text-cyan-300 border border-[#223040] font-mono"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>哈希校验 (EVD-05)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left Column (Cols 1-3): Filterable Steps List */}
        <div className="lg:col-span-3 rounded-[4px] bg-[#111821] border border-[#223040] p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {['ALL', 'S', 'P1', 'P2', 'D1', 'D2', 'D3', 'I'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveVerdictFilter(f)}
                  className={`px-1.5 py-0.5 rounded-[2px] font-bold transition-all ${
                    activeVerdictFilter === f
                      ? 'bg-[#164e63] text-cyan-200 border border-cyan-500/50'
                      : 'bg-[#0A0E13] border border-[#223040] text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? '全部' : f}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="按步骤号 / T码 / 资产过滤..."
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] pl-8 pr-2 py-1.5 font-mono text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredSteps.map((step) => {
                const isSelected = step.id === selectedStepId;
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      setSelectedStepId(step.id);
                      setOverrideVerdict(step.verdict);
                    }}
                    className={`p-2 rounded-[4px] border transition-all cursor-pointer font-mono ${
                      isSelected
                        ? 'bg-[#164e63]/30 border-cyan-500 text-slate-100'
                        : 'bg-[#0A0E13] border-[#223040] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-slate-100 tabular-nums">
                        {step.id} <span className="text-cyan-400">{step.techId}</span>
                      </span>
                      {getVerdictBadge(step.verdict)}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {step.targetAsset} {step.techName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-[#223040]">
            总加载步骤: <span className="text-cyan-400 font-bold tabular-nums">{attackSteps.length}</span> / 242
          </div>
        </div>

        {/* Center Column (Cols 4-9): E/R/O 3-Layer Verdict & Evidential Corroboration (EVD-01 & EVD-02) */}
        <div className="lg:col-span-6 rounded-[4px] bg-[#111821] border border-[#223040] p-4 space-y-4 overflow-y-auto">
          {/* Header & Verdict Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-[#223040] font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-cyan-300 tabular-nums">{currentStep.id}</span>
                <span className="text-sm font-bold text-slate-100 font-sans">
                  {currentStep.techId} {currentStep.techName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-[#0A0E13] border border-[#223040] text-slate-300">
                  变体 {currentStep.variant}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                目标资产: <span className="text-slate-200">{currentStep.targetAsset} ({currentStep.targetIp})</span> · 观察窗: {currentStep.timeMaxSec}s (已过: {currentStep.timeUsedSec}s) · 战术: {currentStep.phaseName}
              </div>
            </div>

            {/* Verdict Hero Banner */}
            <div
              className={`p-2.5 rounded-[4px] border shrink-0 text-right ${
                isCurrentInconclusive
                  ? 'bg-[#0A0E13] border-[#223040]'
                  : 'bg-rose-950/40 border-rose-800'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-end gap-1.5">
                {isCurrentInconclusive ? (
                  <span className="text-slate-300">I · 不可判定</span>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">S · 成功逃逸且达成</span>
                  </>
                )}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                {isCurrentInconclusive
                  ? '必测系统未部署或探针可见性缺失，无法给出确定性六态结论'
                  : 'E ∧ R ∧ O 同时成立 · 防御系统 DS-09, DS-01 未动作'}
              </div>
            </div>
          </div>

          {/* 3-Layer E/R/O Verdict Cards (EVD-01) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-[11px]">
            {/* Card 1: 逃逸层 (ESCAPE / E) */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#223040]">
                <span className="font-bold text-slate-200">逃逸层 (ESCAPE / E)</span>
                {isCurrentInconclusive ? (
                  <span className="text-slate-400 font-bold bg-[#111821] px-1.5 py-0.2 rounded-[2px] border border-[#223040]">未知</span>
                ) : (
                  <span className="text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.2 rounded-[2px] border border-rose-900">成立</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                ● 非阻断: 未观察到因果终止
                <br />
                ● 非事件: 告警未进入主事件队列
              </p>
              <div className="text-[9px] text-cyan-400/80 pt-1 border-t border-[#223040] tabular-nums">
                E = ¬阻断 ∧ ¬事件 · W-CONF: {currentStep.escapeLayer.wConf}
              </div>
            </div>

            {/* Card 2: 到达层 (REACH / R) */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#223040]">
                <span className="font-bold text-slate-200">到达层 (REACH / R)</span>
                {isCurrentInconclusive ? (
                  <span className="text-slate-400 font-bold bg-[#111821] px-1.5 py-0.2 rounded-[2px] border border-[#223040]">未知</span>
                ) : (
                  <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.2 rounded-[2px] border border-amber-900">成立</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                ● 到达: 02:39:51 在 plc-03 上取得交互会话
              </p>
              <div className="flex flex-wrap gap-1 text-[9px] text-emerald-400">
                <span className="px-1 rounded-[2px] bg-[#111821] border border-[#223040]">✓ net:plc-direct</span>
                <span className="px-1 rounded-[2px] bg-[#111821] border border-[#223040]">✓ 502/modbus</span>
              </div>
            </div>

            {/* Card 3: 达成层 (OBJECTIVE / O) */}
            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-[#223040]">
                <span className="font-bold text-slate-200">达成层 (OBJECTIVE / O)</span>
                {isCurrentInconclusive ? (
                  <span className="text-slate-400 font-bold bg-[#111821] px-1.5 py-0.2 rounded-[2px] border border-[#223040]">未知</span>
                ) : (
                  <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded-[2px] border border-cyan-900">成立</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                过程模型偏差: <span className="text-rose-400 font-bold tabular-nums">+{currentStep.objectiveLayer.devPct}%</span>
              </p>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-[#223040]">
                证据链: EV-2287(强), EV-2294(中) 采纳
              </div>
            </div>
          </div>

          {/* Compliance Rule Constraint */}
          <div className="p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-[10px] font-mono text-cyan-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-sans">合规规则约束: 结论 = E ∧ R ∧ O。任何单层不满足即降级为 P1 / P2 / D 态，绝非时序推进关系。</span>
          </div>

          {/* Evidential Corroboration Table (EVD-02) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-100 font-sans">
                支持该步判定的核心证据列表 (EVIDENTIAL CORROBORATION)
              </span>
              <span className="text-[10px] text-slate-400">
                数量: <span className="text-cyan-400 font-bold tabular-nums">{evidenceList.length}</span> · 查看被剔除证据 (2)
              </span>
            </div>

            <div className="rounded-[4px] bg-[#111821] border border-[#223040] overflow-hidden font-mono">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0A0E13] border-b border-[#223040] text-[10px] text-slate-400 select-none">
                  <tr className="h-7 table-row-28">
                    <th className="py-1 px-3">强度</th>
                    <th className="py-1 px-3">证据来源</th>
                    <th className="py-1 px-3">证据类型 / 内容</th>
                    <th className="py-1 px-3">哈希校验 (SHA-256)</th>
                    <th className="py-1 px-3">采集探针</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223040] text-slate-300">
                  {evidenceList.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/20 h-7 table-row-28">
                      <td className="py-1 px-3 text-[13px]">
                        <span
                          className={`px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold ${
                            ev.strength === '强'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : ev.strength === '中'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-[#0A0E13] text-slate-400 border border-[#223040]'
                          }`}
                        >
                          {ev.strength}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-slate-200 text-[13px] font-sans">{ev.source}</td>
                      <td className="py-1 px-3 text-[13px]">
                        <span className="font-bold text-cyan-300 tabular-nums">{ev.id}</span> · <span className="font-sans text-xs">{ev.typeAndDesc}</span>
                      </td>
                      <td className="py-1 px-3 text-slate-400 text-[11px] tabular-nums">{ev.sha256}</td>
                      <td className="py-1 px-3 text-slate-400 text-[11px]">{ev.collectionPoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Warning banner */}
            <div className="p-2.5 rounded-[4px] bg-amber-950/40 border border-amber-800 text-[10px] font-mono text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="font-sans">
                合规性警示: EV-2299 为同机日志，极易被 T1070 清除，不可单独作为达成判定支撑。 (RULE_ENFORCE_ISO_27037)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Cols 10-12): A9 Arbitrator Panel */}
        <div className="lg:col-span-3 rounded-[4px] bg-[#111821] border border-[#223040] p-4 space-y-4 flex flex-col justify-between font-mono">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#223040]">
              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs font-sans">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                A9 独立复核裁定
              </span>
              <span className="text-[10px] text-cyan-400">只读仲裁网</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-sans">裁定终态选择</label>
              <select
                value={overrideVerdict}
                onChange={(e) => setOverrideVerdict(e.target.value as SixStateVerdict)}
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] px-2.5 py-1.5 text-xs text-rose-300 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="S">S · 成功逃逸且达成 (ESCAPE)</option>
                <option value="P1">P1 · 触达未达成</option>
                <option value="P2">P2 · 未触达</option>
                <option value="D1">D1 · 阻断有效</option>
                <option value="D2">D2 · 检出终止</option>
                <option value="D3">D3 · 检出未阻断</option>
                <option value="I">I · 不可判定</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-sans">改判理由阐述 (审计留痕)</label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="若手动改判规则引擎结论，需输入至少 15 字审计理由..."
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-[10px] text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="space-y-1.5 text-[10px] text-slate-400 pt-2 border-t border-[#223040]">
              <div className="flex justify-between">
                <span>判定引擎:</span>
                <span className="text-slate-200 font-bold">v1.9-STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>判定置信度:</span>
                <span className="text-cyan-400 font-bold tabular-nums">0.94</span>
              </div>
              <div className="flex justify-between">
                <span>支撑有效项:</span>
                <span className="text-slate-200 tabular-nums">4 条证据</span>
              </div>
              <div className="flex justify-between">
                <span>SIEM 绑定:</span>
                <span className="text-slate-200">专用裁判节点 04</span>
              </div>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">复核签署人:</span>
                <span className="text-cyan-300 font-bold">a9.judge.ops</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">签署时间:</span>
                <span className="text-slate-300 tabular-nums">02:41:02 UTC</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-1 font-bold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>数字签名已锚定</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#223040]">
            {isSaved && (
              <div className="text-[10px] text-emerald-400 text-center font-bold">
                ✓ 裁定已写入不可篡改证据账本
              </div>
            )}
            <button
              onClick={handleCommit}
              className="w-full py-2 rounded-[4px] bg-[#164e63] hover:bg-cyan-700 text-cyan-100 border border-cyan-500/50 font-bold text-xs transition-colors text-center"
            >
              提交并裁决下一项 (Space)
            </button>
            <button
              onClick={handleCommit}
              className="w-full py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300 text-[11px] text-center"
            >
              暂存修改 (Ctrl+S)
            </button>
          </div>
        </div>
      </div>

      {/* EVD-03 Inconclusive Review Modal */}
      {showInconclusiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleInconclusiveReviewSubmit}
            className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-amber-400 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                不可判定 (I 态) 归因复核 (EVD-03)
              </div>
              <button
                type="button"
                onClick={() => setShowInconclusiveModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-amber-800 text-amber-300 text-[11px] space-y-1">
              <div>
                <strong>当前归因原因</strong>: 必测未部署 / 探针失步 / 关联不可用
              </div>
              <div>
                依据设计约束 1：复核人不能将不可判定直接涂改为 S 或 D；必须明确其客观归因。
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400">复核处置决定 *</label>
              <div className="space-y-1.5 font-mono">
                <label className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] cursor-pointer">
                  <input
                    type="radio"
                    name="act"
                    value="accept"
                    checked={inconclusiveAction === 'accept'}
                    onChange={() => setInconclusiveAction('accept')}
                  />
                  <span>接受 I 态（客观事实：当前架构未布置相应解密探针）</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] cursor-pointer">
                  <input
                    type="radio"
                    name="act"
                    value="defect"
                    checked={inconclusiveAction === 'defect'}
                    onChange={() => setInconclusiveAction('defect')}
                  />
                  <span>标记为环境故障（如探针丢包，应从指标分母剔除）</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-[4px] bg-[#0A0E13] border border-[#223040] cursor-pointer">
                  <input
                    type="radio"
                    name="act"
                    value="rerun"
                    checked={inconclusiveAction === 'rerun'}
                    onChange={() => setInconclusiveAction('rerun')}
                  />
                  <span>申请单步重测（需要前置环境重新复位）</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">复核审计阐述 *</label>
              <textarea
                value={inconclusiveNotes}
                onChange={(e) => setInconclusiveNotes(e.target.value)}
                placeholder="请输入详细的复核说明..."
                rows={3}
                required
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#223040]">
              <button
                type="button"
                onClick={() => setShowInconclusiveModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[4px] bg-amber-900/80 hover:bg-amber-800 text-amber-100 border border-amber-600/50 font-medium"
              >
                确认并写入复核存证
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EVD-04 Verdict Objection Modal */}
      {showObjectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleSubmitObjection}
            className="w-full max-w-lg bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-purple-300 font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                结论异议与覆盖申请 (EVD-04)
              </div>
              <button
                type="button"
                onClick={() => setShowObjectionModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-purple-800 text-purple-300 text-[11px] space-y-1">
              <div>
                <strong>职责分离</strong>：异议人（赵工）≠ 审批人（张总工）。
              </div>
              <div>
                原判决（{currentStep.verdict}）将完整保留在证据账本中；审批通过后仅产生新增覆盖层，并触发指标重算。
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="block text-slate-400 mb-1">建议改判终态 *</label>
                <select
                  value={objProposedVerdict}
                  onChange={(e) => setObjProposedVerdict(e.target.value as SixStateVerdict)}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500"
                >
                  <option value="P1">P1 · 触达未达成</option>
                  <option value="D1">D1 · 阻断有效</option>
                  <option value="D2">D2 · 检出终止</option>
                  <option value="D3">D3 · 检出未阻断</option>
                  <option value="I">I · 不可判定</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">支撑证据 ID 引用 *</label>
                <input
                  type="text"
                  value={objEvidenceRefs}
                  onChange={(e) => setObjEvidenceRefs(e.target.value)}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">异议技术依据说明 (至少 10 字) *</label>
              <textarea
                value={objReason}
                onChange={(e) => setObjReason(e.target.value)}
                placeholder="请输入详细的改判理由（如：EV-2299 属于同机弱证据，缺少外带沉洞数据包双重印证）..."
                rows={3}
                required
                className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] p-2 text-slate-100 outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#223040]">
              <button
                type="button"
                onClick={() => setShowObjectionModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] hover:bg-slate-800 border border-[#223040] text-slate-300"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[4px] bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-600/50 font-medium"
              >
                提交异议至审批人
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EVD-05 Hash Integrity Modal */}
      {showHashCheckerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl bg-[#111821] border border-[#223040] rounded-[4px] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#223040] pb-2">
              <div className="text-cyan-300 font-bold flex items-center gap-2">
                <Hash className="w-4 h-4" />
                证据完整性与哈希一致性校验 (EVD-05)
              </div>
              <button
                onClick={() => setShowHashCheckerModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-emerald-800 text-emerald-300 flex items-start justify-between">
                <div>
                  <div className="font-bold">manifest.json (清单哈希一致)</div>
                  <div className="text-[10px] text-slate-400 mt-1 tabular-nums">
                    sha256:9f3a41c7849e7b21a71923e098492cba1192e4d
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">校验通过</span>
              </div>

              <div className="p-3 rounded-[4px] bg-[#0A0E13] border border-emerald-800 text-emerald-300 flex items-start justify-between">
                <div>
                  <div className="font-bold">evidence_ledger (证据链连续无断点)</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    4 项有效采信证据 SHA-256 哈希均通过 WORM 存证校验
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">存证有效</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#223040]">
              <button
                onClick={() => setShowHashCheckerModal(false)}
                className="px-4 py-1.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-slate-300 hover:bg-slate-800"
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
