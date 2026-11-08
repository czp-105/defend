import React, { useState } from 'react';
import {
  Activity,
  ActivityStatus,
  UserRole,
} from '../../types/cidtp';
import {
  X,
  Plus,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  FileCode,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Lock,
  Ban,
} from 'lucide-react';

interface ActivityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  currentActivityCode: string;
  onSelectActivity: (code: string) => void;
  currentUserRole: UserRole;
  currentUserName: string;
  onCreateActivity: (newAct: Activity) => void;
  onCloneActivity: (sourceCode: string, newCode: string, newName: string) => void;
  onUpdateStatus: (code: string, newStatus: ActivityStatus, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ActivityManagementModal: React.FC<ActivityManagementModalProps> = ({
  isOpen,
  onClose,
  activities,
  currentActivityCode,
  onSelectActivity,
  currentUserRole,
  currentUserName,
  onCreateActivity,
  onCloneActivity,
  onUpdateStatus,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'clone'>('list');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Create form state (ACT-01)
  const [newCode, setNewCode] = useState('B3-WATER-002');
  const [newName, setNewName] = useState('水务二次供水调频加压泵站破坏推演');
  const [newBizClass, setNewBizClass] = useState<'B1' | 'B2' | 'B3'>('B3');
  const [newFidelity, setNewFidelity] = useState<'L1' | 'L2' | 'L3 硬件在环' | 'L2 组件仿真'>('L3 硬件在环');
  const [newScenarioTemplate, setNewScenarioTemplate] = useState('water-plant-b3.yaml');
  const [newDesc, setNewDesc] = useState('模拟针对二次加压泵站变频器及控制阀门的连续多变体指令注入。');

  // Clone form state (ACT-03)
  const [cloneSource, setCloneSource] = useState(currentActivityCode);
  const [cloneCode, setCloneCode] = useState(`${currentActivityCode}-CLONE`);
  const [cloneName, setCloneName] = useState('历史活动复制作业 (清空运行结果)');

  // Void reason state (ACT-04)
  const [voidingActivity, setVoidingActivity] = useState<Activity | null>(null);
  const [voidReason, setVoidReason] = useState('');

  if (!isOpen) return null;

  const filteredActivities = activities.filter((act) => {
    if (filterClass !== 'all' && act.businessClass !== filterClass) return false;
    if (filterStatus !== 'all' && act.status !== filterStatus) return false;
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      return (
        act.code.toLowerCase().includes(q) ||
        act.name.toLowerCase().includes(q) ||
        act.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBizClass === 'B2') {
      showToast('B2 运维支撑型无内置模板与演示场景，当前已被平台锁定禁选 (规划中)', 'warning');
      return;
    }
    if (!newCode.trim() || !newName.trim()) {
      showToast('请完整填写活动编号与活动名称', 'warning');
      return;
    }
    if (activities.some((a) => a.code.toLowerCase() === newCode.trim().toLowerCase())) {
      showToast(`活动编号 ${newCode} 已存在，不可重复创建`, 'warning');
      return;
    }

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      businessClass: newBizClass,
      fidelity: newFidelity,
      scenarioId: newScenarioTemplate.replace('.yaml', ''),
      scenarioVersion: 'v1.0-draft',
      status: 'draft',
      author: currentUserName,
      baselineSnapshotId: `snap-${newCode.toLowerCase()}-init`,
      scenarioSha256: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...`,
      configSha256: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...`,
      runCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: newDesc,
    };

    onCreateActivity(newAct);
    showToast(`活动 ${newAct.code} 已创建为草稿 (draft)`);
    setActiveTab('list');
    onSelectActivity(newAct.code);
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneCode.trim() || !cloneName.trim()) {
      showToast('请填写目标活动编号与名称', 'warning');
      return;
    }
    if (activities.some((a) => a.code.toLowerCase() === cloneCode.trim().toLowerCase())) {
      showToast(`目标活动编号 ${cloneCode} 已存在`, 'warning');
      return;
    }
    onCloneActivity(cloneSource, cloneCode.trim(), cloneName.trim());
    showToast(`已从 ${cloneSource} 复制创建新活动 ${cloneCode}，运行结果与结论已显式清空`);
    setActiveTab('list');
    onSelectActivity(cloneCode);
  };

  const handleStatusTransition = (act: Activity, targetStatus: ActivityStatus) => {
    // Separation of duties enforcement (ACT-04 & Section 0 Constraint 5)
    if (targetStatus === 'approved') {
      if (currentUserRole !== 'approver' && currentUserRole !== 'admin') {
        showToast('权限不足：活动审批必须由 Approver (技术委员会) 或 Admin 角色执行', 'warning');
        return;
      }
      if (act.author === currentUserName && currentUserRole !== 'admin') {
        showToast('职责分离冲突：活动作者不得审批自己创建的活动！请由其他审批人批复。', 'warning');
        return;
      }
    }

    if (targetStatus === 'pending_review') {
      if (currentUserRole !== 'author' && currentUserRole !== 'admin') {
        showToast('只有测试作者或管理员可提交活动进入评审状态', 'warning');
        return;
      }
    }

    if (targetStatus === 'void') {
      setVoidingActivity(act);
      return;
    }

    onUpdateStatus(act.code, targetStatus, `状态流转至 ${targetStatus}`);
    showToast(`活动 ${act.code} 状态已流转至 [${targetStatus}]`);
  };

  const confirmVoid = () => {
    if (!voidingActivity) return;
    if (!voidReason.trim() || voidReason.trim().length < 5) {
      showToast('作废活动必须输入至少 5 字有效原因审计记录', 'warning');
      return;
    }
    onUpdateStatus(voidingActivity.code, 'void', `作废原因: ${voidReason}`);
    showToast(`活动 ${voidingActivity.code} 已正式作废 (VOID)`);
    setVoidingActivity(null);
    setVoidReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#111821] border border-[#223040] rounded-[4px] flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#223040] bg-[#111821]">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-[4px] bg-[#0A0E13] text-cyan-400 border border-[#223040]">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                测试活动治理中心 (ACT MANAGEMENT)
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-cyan-400">
                  ACT-01 ~ ACT-05
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                管理场景、防御基线快照、运行实例与报告容器 · 严格遵循状态机与职责分离
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

        {/* Tab Switcher */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0A0E13] border-b border-[#223040] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              活动列表与流转 (ACT-04/05)
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              新建活动草案 (ACT-01)
            </button>
            <button
              onClick={() => setActiveTab('clone')}
              className={`px-3 py-1.5 rounded-[4px] font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'clone'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              克隆历史活动 (ACT-03)
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span>当前身份:</span>
            <span className="text-cyan-300 font-bold">{currentUserName}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 uppercase">
              {currentUserRole}
            </span>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Filter and Search Bar (ACT-05) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[4px] bg-[#0A0E13] border border-[#223040] text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="按活动号、名称、作者筛选..."
                    className="w-full bg-transparent text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">业务类:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-[#111821] border border-[#223040] rounded-[4px] px-2 py-1 text-slate-200 outline-none"
                  >
                    <option value="all">全部业务类</option>
                    <option value="B1">B1 在线服务型</option>
                    <option value="B2">B2 运维支撑型 (规划中)</option>
                    <option value="B3">B3 工业过程闭环型</option>
                  </select>

                  <span className="text-slate-400 ml-2">状态:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#111821] border border-[#223040] rounded-[4px] px-2 py-1 text-slate-200 outline-none"
                  >
                    <option value="all">全部状态</option>
                    <option value="draft">草稿 (draft)</option>
                    <option value="pending_review">待审 (pending_review)</option>
                    <option value="approved">已批准 (approved)</option>
                    <option value="running">运行中 (running)</option>
                    <option value="completed">已完成 (completed)</option>
                    <option value="void">已作废 (void)</option>
                  </select>
                </div>
              </div>

              {/* Activities Table */}
              <div className="border border-[#223040] rounded-[4px] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0A0E13] text-slate-400 uppercase tracking-wider font-mono border-b border-[#223040]">
                    <tr>
                      <th className="py-2.5 px-3">活动编号 / 名称</th>
                      <th className="py-2.5 px-3">业务 / 保真度</th>
                      <th className="py-2.5 px-3">生命周期状态</th>
                      <th className="py-2.5 px-3">负责人 / 审批流</th>
                      <th className="py-2.5 px-3">重复次数</th>
                      <th className="py-2.5 px-3 text-right">流转操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#223040]/80">
                    {filteredActivities.map((act) => {
                      const isCurrent = act.code === currentActivityCode;
                      const statusBadge = {
                        draft: 'bg-slate-700/50 text-slate-300 border-slate-600',
                        pending_review: 'bg-amber-950/40 text-amber-400 border-amber-600/40',
                        approved: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40',
                        queued: 'bg-purple-950/40 text-purple-400 border-purple-500/40',
                        running: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40',
                        completed: 'bg-blue-950/40 text-blue-400 border-blue-500/40',
                        void: 'bg-rose-950/40 text-rose-400 border-rose-500/40 line-through',
                      }[act.status];

                      return (
                        <tr
                          key={act.id}
                          className={`hover:bg-[#1a2332]/40 transition-colors ${
                            isCurrent ? 'bg-cyan-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-cyan-300">{act.code}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-[4px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  当前活动
                                </span>
                              )}
                            </div>
                            <div className="text-slate-300 font-medium truncate max-w-xs">{act.name}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
                              {act.scenarioSha256}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono px-1.5 py-0.5 rounded-[4px] bg-[#111821] border border-[#223040] text-slate-200">
                                {act.businessClass}
                              </span>
                              <span className="text-slate-300">{act.fidelity}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              基线: {act.baselineSnapshotId}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono border ${statusBadge}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-[1px] bg-current" />
                              {act.status}
                            </span>
                            {act.status === 'draft' && (
                              <div className="text-[10px] text-slate-400 mt-1">可自由编辑输入</div>
                            )}
                            {act.status === 'approved' && (
                              <div className="text-[10px] text-cyan-400 mt-1">输入已固化冻结</div>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-slate-200">编排: {act.author}</div>
                            <div className="text-[11px] text-slate-400">
                              审批: {act.approver || <span className="text-amber-400">待审批</span>}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono">
                            <span
                              className={
                                act.runCount >= 5 ? 'text-emerald-400 font-bold' : 'text-amber-400'
                              }
                            >
                              {act.runCount} 次 / ≥5次
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {act.runCount >= 5 ? '支持系统级结论' : '仅作案例验证'}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCurrent && (
                                <button
                                  onClick={() => {
                                    onSelectActivity(act.code);
                                    showToast(`已切换至活动 ${act.code}`);
                                  }}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px]"
                                >
                                  设为当前
                                </button>
                              )}

                              {act.status === 'draft' && (
                                <button
                                  onClick={() => handleStatusTransition(act, 'pending_review')}
                                  className="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-[11px]"
                                >
                                  提交评审
                                </button>
                              )}

                              {act.status === 'pending_review' && (
                                <button
                                  onClick={() => handleStatusTransition(act, 'approved')}
                                  className="px-2 py-1 rounded bg-cyan-600/40 hover:bg-cyan-600/60 text-cyan-200 border border-cyan-500/40 text-[11px] font-semibold"
                                >
                                  批准活动
                                </button>
                              )}

                              {act.status !== 'void' && act.status !== 'completed' && (
                                <button
                                  onClick={() => handleStatusTransition(act, 'void')}
                                  className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 text-[11px]"
                                >
                                  作废
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs">
                💡 <strong>ACT-01 规范</strong>：活动是场景、防御基线与运行评分的治理容器。创建后处于
                <code>draft</code> 状态；业务类 <code>B2</code> 因尚未提供自动化模板在此阶段强制禁选。
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    活动唯一编号 (activity_id) *
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 font-mono outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">测试活动名称 *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">关键基础设施业务类 *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewBizClass('B1')}
                      className={`py-2 px-2 rounded-md font-mono border text-center transition-all ${
                        newBizClass === 'B1'
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      B1 在线服务
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBizClass('B3')}
                      className={`py-2 px-2 rounded-md font-mono border text-center transition-all ${
                        newBizClass === 'B3'
                          ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      B3 工业过程
                    </button>
                    <button
                      type="button"
                      disabled
                      title="B2 无模板/无 demo，必须禁选并说明规划中"
                      className="py-2 px-2 rounded-md font-mono border border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed text-center flex flex-col items-center justify-center"
                    >
                      <span>B2 运维支撑</span>
                      <span className="text-[9px] text-amber-500/80">规划中禁选</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">靶场保真度等级 *</label>
                  <select
                    value={newFidelity}
                    onChange={(e) => setNewFidelity(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 outline-none"
                  >
                    <option value="L3 硬件在环">L3 硬件在环 (真实硬件/PLC/RTU)</option>
                    <option value="L2 组件仿真">L2 组件仿真 (模拟协议通信)</option>
                    <option value="L1">L1 纯逻辑进程模拟</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">绑定场景模板与基线 *</label>
                <select
                  value={newScenarioTemplate}
                  onChange={(e) => setNewScenarioTemplate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 font-mono outline-none"
                >
                  <option value="water-plant-b3.yaml">
                    water-plant-b3.yaml (供水网管 Modbus/TCP 过程控制闭环)
                  </option>
                  <option value="fin-core-b1.yaml">fin-core-b1.yaml (金融线上微服务凭据碰撞验证)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">活动目标描述与假定</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#223040] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-[4px] bg-[#1a2332] hover:bg-[#223040] text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-medium"
                >
                  确认创建活动草稿
                </button>
              </div>
            </form>
          )}

          {activeTab === 'clone' && (
            <form onSubmit={handleCloneSubmit} className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-3 rounded-[4px] bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                ⚠️ <strong>ACT-03 规范</strong>：克隆活动将完整复制场景 YAML、DEM 期望矩阵以及防御基线快照；
                <strong>所有过去的运行日志、E/R/O 裁判结论与评分卡将被严格清空</strong>，生成全新的独立版本哈希。
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">源活动克隆母本 *</label>
                <select
                  value={cloneSource}
                  onChange={(e) => setCloneSource(e.target.value)}
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] px-3 py-2 text-slate-100 font-mono outline-none"
                >
                  {activities.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} - {a.name} ({a.businessClass} · {a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">新活动唯一代号 *</label>
                <input
                  type="text"
                  value={cloneCode}
                  onChange={(e) => setCloneCode(e.target.value)}
                  required
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] px-3 py-2 text-slate-100 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">新活动全名 *</label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  required
                  className="w-full bg-[#0A0E13] border border-[#223040] rounded-[4px] px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#223040] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-[4px] bg-[#1a2332] hover:bg-[#223040] text-slate-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[4px] bg-cyan-700 hover:bg-cyan-600 text-white font-medium"
                >
                  确认克隆并清空历史结论
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Void Reason Modal */}
        {voidingActivity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md bg-[#111821] border border-rose-500/50 rounded-[4px] p-5 text-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Ban className="w-4 h-4" />
                作废活动确认 (ACT-04 审计)
              </div>
              <p className="text-slate-300">
                您即将作废活动 <span className="font-mono text-cyan-300">{voidingActivity.code}</span>
                。作废后该活动将不可被执行或流转。
              </p>
              <div>
                <label className="block text-slate-400 mb-1">作废原因阐述 (必填审计记录) *</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="请输入作废理由（如：前置靶场硬件故障 / 场景参数不符合准入条件）"
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setVoidingActivity(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  onClick={confirmVoid}
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  确认作废活动
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
