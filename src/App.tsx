/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CidtpHeader, CidtpTab } from './components/CidtpHeader';
import { CidtpSidebar } from './components/CidtpSidebar';
import { OverviewView } from './components/views/OverviewView';
import { ScenarioWorkbenchView } from './components/views/ScenarioWorkbenchView';
import { DefenseMatrixView } from './components/views/DefenseMatrixView';
import { RealTimeExecutionView } from './components/views/RealTimeExecutionView';
import { ArbitrationAuditView } from './components/views/ArbitrationAuditView';
import { AttributionMetricsView } from './components/views/AttributionMetricsView';
import { ReportScorecardsView } from './components/views/ReportScorecardsView';
import { EnvironmentTestbedView } from './components/views/EnvironmentTestbedView';

import { ActivityManagementModal } from './components/views/ActivityManagementModal';
import { GateChainModal } from './components/views/GateChainModal';
import { AuditLogModal } from './components/views/AuditLogModal';

import {
  campaignQueue,
  defenseSystems as initialDefenseSystems,
  g1ToG8Gates,
  initialActivities,
  initialAuditLogs,
  initialGateCheck,
  initialResetStatus,
  initialSignOffRecord,
  samplePlatformScorecard,
  sampleScenarioScorecard,
  sampleSystemScorecards,
  sixStateSummary,
  tacticPhases,
  userProfiles,
} from './data/cidtpMockData';
import {
  Activity,
  ActivityStatus,
  AuditLogEntry,
  GateItem,
  ResetStatus,
  SignOffRecord,
  SixStateVerdict,
  UserProfile,
} from './types/cidtp';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<CidtpTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as CidtpTab;
      const validTabs: CidtpTab[] = ['overview', 'scenario', 'matrix', 'realtime', 'arbitration', 'attribution', 'reports', 'environment'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'overview';
  });
  const [campaignCode, setCampaignCode] = useState<string>('B3-WATER-001');
  const [isPaused, setIsPaused] = useState(false);
  const [showInvalidBanner, setShowInvalidBanner] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // User Profile & RBAC Separation of Duties (GEN-01)
  const [currentUser, setCurrentUser] = useState<UserProfile>(userProfiles[0]); // default to author

  // Activities (ACT-01 ~ ACT-05)
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // Gates (G1 ~ G8)
  const [gates, setGates] = useState<GateItem[]>(g1ToG8Gates);

  // Modals Visibility
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Application Data States
  const [queue, setQueue] = useState(campaignQueue);
  const [verdictStats, setVerdictStats] = useState(sixStateSummary);
  const [gateCheck, setGateCheck] = useState(initialGateCheck);
  const [defenseSystems, setDefenseSystems] = useState(initialDefenseSystems);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [resetStatus, setResetStatus] = useState<ResetStatus>(initialResetStatus);
  const [signOffRecord, setSignOffRecord] = useState<SignOffRecord>(initialSignOffRecord);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const addAuditLog = (action: string, target: string, reason: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser.name,
      actorRole: currentUser.role,
      role: currentUser.role,
      action,
      target,
      reason,
      immutableHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    showToast(isPaused ? '演练推演已恢复调度' : '演练推演已暂停', 'info');
  };

  const handleAbortCampaign = () => {
    addAuditLog('ABORT_CAMPAIGN', campaignCode, '操作员紧急中止，冻结当前证据现场');
    showToast('已向执行引擎发送 ABORT 紧急中止信号，已就地冻结审计现场', 'warning');
  };

  const handleCommitVerdict = (stepId: string, verdict: SixStateVerdict) => {
    setVerdictStats((prev) =>
      prev.map((v) => (v.code === verdict ? { ...v, count: v.count + 1 } : v))
    );
    addAuditLog('COMMIT_VERDICT', stepId, `裁定终态确认为 [${verdict}]`);
    showToast(`裁判 A9 独立复核完成：步骤 ${stepId} 终态已确认为 [${verdict}]`);
  };

  // Activity Management Handlers
  const handleSelectActivity = (code: string) => {
    setCampaignCode(code);
    addAuditLog('SWITCH_ACTIVITY', code, '切换工作台视察活动');
    showToast(`已切换当前工作活动: ${code}`);
  };

  const handleCreateActivity = (newAct: Activity) => {
    setActivities((prev) => [newAct, ...prev]);
    setCampaignCode(newAct.code);
    addAuditLog('CREATE_ACTIVITY', newAct.code, `创建新测试活动: ${newAct.name} (${newAct.businessClass})`);
    showToast(`成功创建活动 ${newAct.code}，并与基线快照建立哈希关联`);
  };

  const handleCloneActivity = (sourceCode: string, newCode: string, newName: string) => {
    const src = activities.find((a) => a.code === sourceCode);
    if (!src) return;

    const clonedAct: Activity = {
      ...src,
      id: `act-${Date.now()}`,
      code: newCode,
      name: newName,
      status: 'draft',
      runCount: 0, // ACT-03: 清空既有运行结论
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: currentUser.name,
      reviewer: undefined,
      approver: undefined,
    };

    setActivities((prev) => [clonedAct, ...prev]);
    setCampaignCode(newCode);
    addAuditLog('CLONE_ACTIVITY', newCode, `从 ${sourceCode} 克隆活动，已自动清空既有结论数据`);
    showToast(`活动已克隆为 ${newCode}，前序测试数据已重置清空`);
  };

  const handleUpdateStatus = (code: string, newStatus: ActivityStatus, reason: string) => {
    // Duty separation check
    const targetAct = activities.find((a) => a.code === code);
    if (targetAct && newStatus === 'approved' && currentUser.role === 'author' && targetAct.author === currentUser.name) {
      showToast('【职责分离冲突】作者不得审批自己创建的活动！请切换至 Approver 角色。', 'warning');
      return;
    }

    setActivities((prev) =>
      prev.map((a) => (a.code === code ? { ...a, status: newStatus, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) } : a))
    );
    addAuditLog('UPDATE_ACTIVITY_STATUS', code, `状态变更为 ${newStatus}。事由: ${reason}`);
    showToast(`活动 ${code} 状态已更新为 [${newStatus}]`);
  };

  // Sign-off Report Handler (RPT-06)
  const handleSignReport = (signer: string, role: string, notes: string) => {
    // Check duty separation (author cannot sign off)
    const currentAct = activities.find((a) => a.code === campaignCode);
    if (currentUser.role === 'author' || (currentAct && currentAct.author.includes(signer))) {
      showToast('【职责分离阻断】测试方案编写人不得作为报告发布签发人，必须由独立 Admin/Signer 签字！', 'warning');
      return;
    }

    // Check R3 threshold (I <= 10%)
    if (sampleScenarioScorecard.inconclusiveSteps / sampleScenarioScorecard.totalSteps > 0.1) {
      showToast('【门禁 G8 拦截】不可判定比例 I > 10%，违反 R3 阈值，禁止签署系统级评测结论！', 'warning');
      return;
    }

    const updatedSignOff: SignOffRecord = {
      ...signOffRecord,
      signer,
      signerRole: role,
      status: 'signed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      notes,
    };
    setSignOffRecord(updatedSignOff);
    addAuditLog('SIGN_OFF_REPORT', `RPT-${campaignCode}`, `完成最终报告数字签名发布。签署人: ${signer}`);
    showToast(`评测报告 RPT-${campaignCode} 签字成功并加盖 SHA-256 不可篡改时间戳！`);
  };

  // Update System Mode
  const handleUpdateSystemMode = (id: string, mode: '串联' | '旁路' | '终端代理' | '接口') => {
    setDefenseSystems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, mode } : d))
    );
    addAuditLog('CHANGE_DEFENSE_MODE', id, `部署模式变更为 ${mode}`);
    showToast(`系统 ${id} 部署模式已调整为 [${mode}]`);
  };

  // Trigger Reset
  const handleTriggerReset = () => {
    setResetStatus({
      containerLevel: 'clean',
      dataStoreLevel: 'clean',
      otProcessLevel: 'clean',
      lastResetTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isIdempotentVerified: true,
    });
    addAuditLog('TRIGGER_3LEVEL_RESET', campaignCode, '执行三级物理/容器/过程复位');
  };

  const handleExportCsv = () => {
    const headers = ['步骤编号', '技术编号', '战术阶段', '目标资产', '终态结论', 'MFS失效集', '根本原因', '证据数'];
    const rows = [
      ['S-127', 'T0855', '工控影响', 'plc-03', 'S', 'DS-09, DS-01', '工控规则集缺少下线签名', '4'],
      ['S-126', 'T1041', '外带', 'db-01', 'D3', 'DS-10, DS-01', '告警未关联成事件', '3'],
      ['S-125', 'T1071', 'C2', 'ws-mgmt-02', 'I', '无', 'TLS元数据未探测', '1'],
      ['S-124', 'T1190', '初始访问', 'app-portal-01', 'P1', 'DS-07', '编码变体不在规则库', '5'],
      ['S-123', 'T1059', '命令执行', 'ws-app-02', 'D2', 'DS-05, DS-04', '子进程上下文关联断裂', '2'],
      ['S-122', 'T1046', '发现', 'scada-gw', 'D1', 'DS-03', '网络服务扫描探查防护生效', '6'],
      ['S-121', 'T1082', '发现', 'srv-db-01', 'S', 'DS-02, DS-09', '低频凭据滥用策略被绕过', '3'],
      ['S-120', 'T1078', '防御规避', 'bridge-iso', 'D1', 'DS-06', '特权运维堡垒强行阻断', '8'],
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cidtp-attribution-metrics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('EXPORT_METRICS', 'CSV_FILE', '导出因果归因与系统指标报表');
    showToast('已生成并下载 CIDTP 归因与防御有效性指标报告 (CSV)');
  };

  const gatePassedCount = gates.filter((g) => g.status === 'passed').length;
  const currentAct = activities.find((a) => a.code === campaignCode) || activities[0];

  return (
    <div className="flex h-screen w-full bg-[#0A0E13] text-slate-100 font-sans selection:bg-cyan-900 selection:text-cyan-200 overflow-hidden">
      {/* Left Vertical Navigation Sidebar - with vertical scrolling */}
      <CidtpSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        campaignCode={campaignCode}
        activities={activities}
        onSelectActivity={handleSelectActivity}
        onOpenActivityModal={() => setShowActivityModal(true)}
        onOpenGateModal={() => setShowGateModal(true)}
        onOpenAuditModal={() => setShowAuditModal(true)}
        gatePassedCount={gatePassedCount}
        totalGateCount={gates.length}
        currentUser={currentUser}
        allUsers={userProfiles}
        onSwitchUser={(u) => {
          setCurrentUser(u);
          addAuditLog('SWITCH_USER_ROLE', u.role, `切换为 ${u.name} (${u.role})`);
          showToast(`已切换当前登录操作员: ${u.name} [${u.role.toUpperCase()}]`);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace (Right Side) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0A0E13]">
        {/* Platform Header & Banners */}
        <CidtpHeader
          currentTab={currentTab}
          campaignCode={campaignCode}
          currentActivity={currentAct}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onAbortCampaign={handleAbortCampaign}
          showInvalidBanner={showInvalidBanner}
          onDismissBanner={() => setShowInvalidBanner(false)}
          currentUser={currentUser}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main View Area with 24px Page Margins (p-6) */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#0A0E13]">
          <div className="w-full mx-auto">
            {currentTab === 'overview' && (
            <OverviewView
              queue={queue}
              selectedCampaign={campaignCode}
              onSelectCampaign={(code) => handleSelectActivity(code)}
              verdictStats={verdictStats}
              gateCheck={gateCheck}
              defenseSystems={defenseSystems}
              tacticPhases={tacticPhases}
              onOpenArbitration={() => setCurrentTab('arbitration')}
            />
          )}

          {currentTab === 'scenario' && (
            <ScenarioWorkbenchView
              onValidate={() => showToast('YAML 拓扑与规则语法校验完毕：发现 2 处模式冲突警告', 'warning')}
              onFreezeVersion={() => {
                addAuditLog('FREEZE_SCENARIO', 'release-v1.5', '冻结演练编排版本并生成 SHA-256');
                showToast('演练编排已固化并签名冻结为 release-v1.5');
              }}
            />
          )}

          {currentTab === 'matrix' && (
            <DefenseMatrixView
              defenseSystems={defenseSystems}
              onSaveDraft={() => {
                addAuditLog('SAVE_DEM_DRAFT', campaignCode, '保存 DEM 期望矩阵草案');
                showToast('DEM 防御期望矩阵已暂存至版本库');
              }}
              onFreezeMatrix={() => {
                addAuditLog('FREEZE_DEM', campaignCode, '正式冻结 DEM 矩阵为生产对照基线');
                showToast('DEM 防御期望矩阵已正式冻结为生产对照基线');
              }}
            />
          )}

          {currentTab === 'realtime' && (
            <RealTimeExecutionView
              onStepClick={(stepId) => {
                setCurrentTab('arbitration');
                showToast(`已跳转至步骤 ${stepId} 仲裁审计面板`);
              }}
              onOpenArbitration={() => setCurrentTab('arbitration')}
            />
          )}

          {currentTab === 'arbitration' && (
            <ArbitrationAuditView onCommitVerdict={handleCommitVerdict} />
          )}

          {currentTab === 'attribution' && (
            <AttributionMetricsView onExportCsv={handleExportCsv} />
          )}

          {currentTab === 'reports' && (
            <ReportScorecardsView
              activityCode={campaignCode}
              scenarioScorecard={sampleScenarioScorecard}
              systemScorecards={sampleSystemScorecards}
              platformScorecard={samplePlatformScorecard}
              signOffRecord={signOffRecord}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onSignReport={handleSignReport}
              showToast={showToast}
            />
          )}

          {currentTab === 'environment' && (
            <EnvironmentTestbedView
              defenseSystems={defenseSystems}
              gateCheck={gateCheck}
              resetStatus={resetStatus}
              onUpdateSystemMode={handleUpdateSystemMode}
              onTriggerReset={handleTriggerReset}
              showToast={showToast}
            />
          )}
        </div>
      </main>
      </div>

      {/* Global Modals */}
      <ActivityManagementModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activities={activities}
        currentActivityCode={campaignCode}
        onSelectActivity={(code) => {
          handleSelectActivity(code);
          setShowActivityModal(false);
        }}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.name}
        onCreateActivity={handleCreateActivity}
        onCloneActivity={handleCloneActivity}
        onUpdateStatus={handleUpdateStatus}
        showToast={showToast}
      />

      <GateChainModal
        isOpen={showGateModal}
        onClose={() => setShowGateModal(false)}
        gates={gates}
        onTriggerCheckAll={() => {
          addAuditLog('RUN_GATE_CHECKS', 'G1-G8', '全量重新检测八级门禁规则');
          showToast('八级门禁全量流水重检完成：G1~G5/G7 通过，G6 存在交叉支撑告警，G8 等待签发');
        }}
      />

      <AuditLogModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        logs={auditLogs}
        showToast={showToast}
      />

      {/* System Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[4px] bg-[#111821] border border-[#223040] text-xs font-mono font-medium text-slate-100">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

