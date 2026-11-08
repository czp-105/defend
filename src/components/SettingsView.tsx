import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Clock,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Server,
  Lock,
} from 'lucide-react';
import { PlatformConfig } from '../types';

interface SettingsViewProps {
  config: PlatformConfig;
  onSaveConfig: (newConfig: PlatformConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [form, setForm] = useState<PlatformConfig>(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setForm(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Alert banner if maintenance mode is on */}
      {form.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block">注意：维护模式已启用</span>
            非管理员访问将被重定向至系统维护页面，API网关将拒绝外部流量。
          </div>
        </div>
      )}

      {/* Basic Platform Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <SettingsIcon className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-100">基础平台配置</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">系统平台名称</label>
            <input
              type="text"
              value={form.platformName}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">所属企业机构</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">紧急安全报警通知邮箱</label>
            <input
              type="email"
              value={form.alertEmail}
              onChange={(e) => setForm({ ...form, alertEmail: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">审计日志法定存留周期</label>
            <select
              value={form.defaultRetentionDays}
              onChange={(e) => setForm({ ...form, defaultRetentionDays: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={30}>30 天 (标准测试)</option>
              <option value={90}>90 天 (等保三级推荐)</option>
              <option value={180}>180 天 (金融标准)</option>
              <option value={365}>365 天 (高安全永久合规)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">企业级安全策略基线</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div>
              <div className="text-xs font-semibold text-slate-200">强制多因素身份验证 (2FA / MFA)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">要求所有访问系统的运维与管理员登录时输入TOTP动态验证码。</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enforce2FA}
                onChange={(e) => setForm({ ...form, enforce2FA: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div>
              <div className="text-xs font-semibold text-slate-200">云原生集群自动水平弹性扩缩容 (HPA)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">在CPU/内存持续超过80%时自动调度拉起备用Pod容器组。</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.clusterAutoScaling}
                onChange={(e) => setForm({ ...form, clusterAutoScaling: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div>
              <div className="text-xs font-semibold text-rose-300">系统维护模式 (Maintenance Lock)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">封锁外部业务访问，仅允许应急管理通道进入。</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>
        </div>

        {/* Session Timeout */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>无操作会话超时时间:</span>
            <span className="font-semibold text-indigo-400 font-mono">{form.sessionTimeoutMinutes} 分钟</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={form.sessionTimeoutMinutes}
            onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>10 分钟 (极严苛)</span>
            <span>30 分钟 (标准)</span>
            <span>120 分钟 (宽松)</span>
          </div>
        </div>
      </div>

      {/* Webhook notification */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Bell className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100">通知网络钩子 (Webhook Integrations)</h2>
        </div>

        <div className="text-xs space-y-2">
          <label className="block text-slate-300 font-medium">企业微信 / 钉钉 / 飞书机器人 Webhook 地址</label>
          <input
            type="url"
            value={form.webhookUrl}
            onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
            placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-500">当系统触发 CRITICAL 或 WARNING 等级告警时，平台将以 JSON 载荷秒级推送到此 Hook。</p>
        </div>
      </div>

      {/* Submit footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>恢复默认配置</span>
        </button>

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> 配置已成功持久化并同步至各集群节点
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>保存并生效全局配置</span>
          </button>
        </div>
      </div>
    </form>
  );
};
