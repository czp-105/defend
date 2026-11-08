/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CidtpHeader, CidtpTab } from './components/CidtpHeader';
import { OverviewView } from './components/views/OverviewView';
import { ScenarioWorkbenchView } from './components/views/ScenarioWorkbenchView';
import { DefenseMatrixView } from './components/views/DefenseMatrixView';
import { RealTimeExecutionView } from './components/views/RealTimeExecutionView';
import { ArbitrationAuditView } from './components/views/ArbitrationAuditView';
import { AttributionMetricsView } from './components/views/AttributionMetricsView';

import {
  campaignQueue,
  defenseSystems as initialDefenseSystems,
  initialGateCheck,
  sixStateSummary,
  tacticPhases,
} from './data/cidtpMockData';
import { SixStateVerdict } from './types/cidtp';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<CidtpTab>('overview');
  const [campaignCode, setCampaignCode] = useState<string>('CAMP-B1-FIN-2026-11');
  const [isPaused, setIsPaused] = useState(false);
  const [showInvalidBanner, setShowInvalidBanner] = useState(true);

  // Application Data States
  const [queue, setQueue] = useState(campaignQueue);
  const [verdictStats, setVerdictStats] = useState(sixStateSummary);
  const [gateCheck, setGateCheck] = useState(initialGateCheck);
  const [defenseSystems, setDefenseSystems] = useState(initialDefenseSystems);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    showToast(isPaused ? '演练推演已恢复调度' : '演练推演已暂停', 'info');
  };

  const handleAbortCampaign = () => {
    showToast('已向执行引擎发送 ABORT 紧急中止信号，已就地冻结审计现场', 'warning');
  };

  const handleCommitVerdict = (stepId: string, verdict: SixStateVerdict) => {
    setVerdictStats((prev) =>
      prev.map((v) => (v.code === verdict ? { ...v, count: v.count + 1 } : v))
    );
    showToast(`裁判 A9 独立复核完成：步骤 ${stepId} 终态已确认为 [${verdict}]`);
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
    showToast('已生成并下载 CIDTP 归因与防御有效性指标报告 (CSV)');
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Platform Header */}
      <CidtpHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        campaignCode={campaignCode}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onAbortCampaign={handleAbortCampaign}
        showInvalidBanner={showInvalidBanner}
        onDismissBanner={() => setShowInvalidBanner(false)}
      />

      {/* Main View Area */}
      <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto">
        <div className="max-w-[1720px] mx-auto">
          {currentTab === 'overview' && (
            <OverviewView
              queue={queue}
              selectedCampaign={campaignCode}
              onSelectCampaign={(code) => {
                setCampaignCode(code);
                showToast(`已切换当前视察演练活动: ${code}`);
              }}
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
              onFreezeVersion={() => showToast('演练编排已固化并签名冻结为 release-v1.5')}
            />
          )}

          {currentTab === 'matrix' && (
            <DefenseMatrixView
              defenseSystems={defenseSystems}
              onSaveDraft={() => showToast('DEM 防御期望矩阵已暂存至版本库')}
              onFreezeMatrix={() => showToast('DEM 防御期望矩阵已正式冻结为生产对照基线')}
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
        </div>
      </main>

      {/* System Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0b1324] border border-cyan-500/60 shadow-2xl text-xs font-mono font-medium text-slate-100 animate-in slide-in-from-bottom-5">
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
