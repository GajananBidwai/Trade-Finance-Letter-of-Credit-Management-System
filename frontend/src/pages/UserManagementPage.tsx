import { UserKpiWidgets } from '../features/users/components/UserKpiWidgets';
import { UserFilters } from '../features/users/components/UserFilters';
import { UserTable } from '../features/users/components/UserTable';
import { UserAiDrawer } from '../features/users/components/UserAiDrawer';

export const UserManagementPage = () => {
  return (
    <>
      {/* Header Section */}
      <section className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-md mb-2">
            <span>Admin</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">User Management</span>
          </nav>
          <h2 className="font-display-lg text-display-lg text-on-surface">System Governance</h2>
          <p className="text-on-surface-variant max-w-2xl mt-2 font-body-lg">
            Manage access controls for trade officers, compliance analysts, and administrative staff across the global network.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Export Logs</span>
          </button>
          <button className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined">person_add</span>
            <span>Add New User</span>
          </button>
        </div>
      </section>

      {/* KPI Row */}
      <UserKpiWidgets />

      {/* Table Controls */}
      <UserFilters />

      {/* Data Table */}
      <UserTable />

      {/* AI Contextual Drawer */}
      <UserAiDrawer />
    </>
  );
};
