import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  Plus,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sliders,
  Lock,
  Smartphone,
  Save,
  RotateCcw,
} from 'lucide-react';
import { NavItemKey, PermissionAction, RolePermissions, User, UserRole } from '../types';

interface UserManagementViewProps {
  users: User[];
  rolePermissions: RolePermissions[];
  currentRole: UserRole;
  onAddUser: (user: Partial<User>) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateRolePermissions: (newPermissions: RolePermissions[]) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  rolePermissions,
  currentRole,
  onAddUser,
  onToggleUserStatus,
  onDeleteUser,
  onUpdateRolePermissions,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Matrix edit state
  const [editingMatrix, setEditingMatrix] = useState<RolePermissions[]>(rolePermissions);
  const [hasMatrixChanges, setHasMatrixChanges] = useState(false);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('基础平台与DevOps');
  const [newUserRole, setNewUserRole] = useState<UserRole>('system_operator');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUser2FA, setNewUser2FA] = useState(true);
  const [formError, setFormError] = useState('');

  const departments = Array.from(new Set(users.map((u) => u.department)));

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (departmentFilter !== 'all' && u.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const roleNameMap: Record<UserRole, { label: string; badge: string }> = {
    super_admin: { label: '超级管理员', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    devops_lead: { label: 'DevOps负责人', badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    secops: { label: '安全合规', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    system_operator: { label: '运维值班', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    analyst: { label: '数据分析', badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };

  const moduleNames: { key: NavItemKey; name: string }[] = [
    { key: 'dashboard', name: '监控总览' },
    { key: 'nodes', name: '云节点集群' },
    { key: 'rbac', name: '用户与权限' },
    { key: 'workflows', name: '任务流调度' },
    { key: 'audit', name: '安全与审计' },
    { key: 'settings', name: '系统配置' },
  ];

  const actionLabels: { key: PermissionAction; name: string }[] = [
    { key: 'view', name: '查看 (Read)' },
    { key: 'edit', name: '编辑 (Write)' },
    { key: 'create', name: '新建 (Create)' },
    { key: 'delete', name: '删除 (Delete)' },
    { key: 'audit', name: '审计 (Audit)' },
  ];

  const handleTogglePermission = (
    role: UserRole,
    moduleKey: NavItemKey,
    action: PermissionAction
  ) => {
    if (role === 'super_admin') return; // Super admin always has all permissions
    setEditingMatrix((prev) => {
      return prev.map((item) => {
        if (item.role !== role) return item;
        const currentActions = item.permissions[moduleKey] || [];
        const exists = currentActions.includes(action);
        const updatedActions = exists
          ? currentActions.filter((a) => a !== action)
          : [...currentActions, action];

        return {
          ...item,
          permissions: {
            ...item.permissions,
            [moduleKey]: updatedActions,
          },
        };
      });
    });
    setHasMatrixChanges(true);
  };

  const handleSaveMatrix = () => {
    onUpdateRolePermissions(editingMatrix);
    setHasMatrixChanges(false);
  };

  const handleResetMatrix = () => {
    setEditingMatrix(rolePermissions);
    setHasMatrixChanges(false);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setFormError('请填写完整姓名与企业邮箱');
      return;
    }
    if (!newUserEmail.includes('@')) {
      setFormError('请输入有效的企业邮箱地址');
      return;
    }

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      department: newUserDept,
      role: newUserRole,
      phone: newUserPhone.trim() || '138****0000',
      twoFactorEnabled: newUser2FA,
      status: 'active',
      lastActive: '刚刚添加',
      createdDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    setNewUserName('');
    setNewUserEmail('');
    setFormError('');
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>成员账号目录 ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC 角色权限策略矩阵</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>添加平台成员</span>
          </button>
        )}

        {activeTab === 'matrix' && hasMatrixChanges && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleResetMatrix}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>放弃更改</span>
            </button>
            <button
              onClick={handleSaveMatrix}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 animate-pulse"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存权限配置</span>
            </button>
          </div>
        )}
      </div>

      {/* View: User Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                aria-label="搜索成员姓名、邮箱或部门"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索成员姓名、邮箱或部门..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                aria-label="筛选角色类型"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">全部角色身份</option>
                <option value="super_admin">超级管理员</option>
                <option value="devops_lead">DevOps负责人</option>
                <option value="secops">安全合规</option>
                <option value="system_operator">运维值班</option>
                <option value="analyst">数据分析</option>
              </select>

              <select
                aria-label="筛选所属部门"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">全域所有部门</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">成员基本信息</th>
                    <th className="py-3 px-4">所属部门</th>
                    <th className="py-3 px-4">系统授权角色</th>
                    <th className="py-3 px-4">2FA安全加固</th>
                    <th className="py-3 px-4">账号状态</th>
                    <th className="py-3 px-4">最后活跃</th>
                    <th className="py-3 px-4 text-right">管控操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.role === 'super_admin' && (
                                <Lock className="w-3 h-3 text-amber-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{user.department}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleNameMap[user.role].badge}`}
                        >
                          {roleNameMap[user.role].label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.twoFactorEnabled ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                            <Smartphone className="w-3.5 h-3.5" /> 已启用
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                            未开启
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                          }`}
                          title="点击切换启用/冻结状态"
                        >
                          {user.status === 'active' ? '正常启用' : '已冻结'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {user.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onToggleUserStatus(user.id)}
                            className="text-[11px] text-slate-400 hover:text-indigo-400 font-medium px-2 py-1 rounded bg-slate-800"
                          >
                            {user.status === 'active' ? '冻结' : '解冻'}
                          </button>
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-950/40 border border-rose-500/30"
                            >
                              移除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View: RBAC Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>
                细粒度访问控制：可针对不同系统角色在各个功能模块配置 查看(Read)、编辑(Write)、新建(Create)、删除(Delete) 与 审计(Audit) 特权。
              </span>
            </div>
            {hasMatrixChanges && (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                检测到未保存的策略修改
              </span>
            )}
          </div>

          <div className="space-y-6">
            {editingMatrix.map((roleItem) => (
              <div
                key={roleItem.role}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${roleNameMap[roleItem.role].badge}`}
                    >
                      {roleItem.roleName}
                    </span>
                    <span className="text-xs text-slate-400">{roleItem.description}</span>
                  </div>
                  {roleItem.role === 'super_admin' && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      默认内置全局通配特权 (*)
                    </span>
                  )}
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {moduleNames.map((mod) => {
                    const activeActions = roleItem.permissions[mod.key] || [];
                    const isSuper = roleItem.role === 'super_admin';

                    return (
                      <div
                        key={mod.key}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                          <span>{mod.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isSuper ? '全部授权' : `${activeActions.length}/${actionLabels.length}`}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {actionLabels.map((act) => {
                            const isChecked = isSuper || activeActions.includes(act.key);
                            return (
                              <label
                                key={act.key}
                                className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 font-medium'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                } ${isSuper ? 'cursor-not-allowed opacity-80' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={isSuper}
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(roleItem.role, mod.key, act.key)}
                                  className="w-3.5 h-3.5 accent-indigo-500 rounded"
                                />
                                <span>{act.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUserSubmit}
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                邀请并添加新系统平台成员
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                aria-label="关闭添加窗口"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">成员真实姓名</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="例如: 李晓峰"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">企业官方工作邮箱</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="xiaofeng.li@omniflow.io"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">所属组织部门</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="核心基础架构部">核心基础架构部</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">初始授予角色</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="system_operator">运维值班工程师</option>
                    <option value="devops_lead">DevOps负责人</option>
                    <option value="secops">安全合规工程师</option>
                    <option value="analyst">数据分析师</option>
                    <option value="super_admin">超级管理员</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">联系手机号 (选填)</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="13800000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="enable2fa"
                  checked={newUser2FA}
                  onChange={(e) => setNewUser2FA(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <label htmlFor="enable2fa" className="text-slate-300 select-none cursor-pointer">
                  强制要求首次登录绑定双因素验证 (2FA / Authenticator)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  创建并发送入职邀请
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
