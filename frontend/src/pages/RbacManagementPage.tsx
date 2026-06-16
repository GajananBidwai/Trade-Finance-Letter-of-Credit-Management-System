import { useState } from 'react';
import { SecurityMonitor } from '../features/rbac/components/SecurityMonitor';
import { RoleRegistryTable } from '../features/rbac/components/RoleRegistryTable';
import { PermissionMatrix } from '../features/rbac/components/PermissionMatrix';
import { AiAnalystDrawer } from '../features/rbac/components/AiAnalystDrawer';

export const RbacManagementPage = () => {
  const [selectedRole, setSelectedRole] = useState('Trade Officer');

  return (
    <>
      {/* Header & Summary Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Access Control & Permissions</h2>
          <p className="text-on-surface-variant font-body-md">Configure global role-based policies and audit system access thresholds.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border border-outline-variant text-on-surface px-5 py-2.5 rounded-xl font-bold hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">history</span>
            Audit Permissions
          </button>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Role
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Stats / Overview (Column 1-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-between h-[200px] relative overflow-hidden">
            <div className="z-10">
              <p className="font-label-md text-label-md text-primary uppercase">Active Roles</p>
              <p className="font-display-lg text-display-lg mt-2">12</p>
            </div>
            <div className="z-10 flex items-center gap-2 text-emerald-400 font-body-md">
              <span className="material-symbols-outlined">trending_up</span>
              <span>+2 added this quarter</span>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <span className="material-symbols-outlined text-[160px]">shield</span>
            </div>
          </div>
          
          <SecurityMonitor />
        </div>

        {/* Role Management Table (Column 5-12) */}
        <div className="col-span-12 lg:col-span-8">
          <RoleRegistryTable selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="mt-4">
        <PermissionMatrix roleName={selectedRole} />
      </div>

      {/* AI Analyst Drawer */}
      <AiAnalystDrawer />
    </>
  );
};
