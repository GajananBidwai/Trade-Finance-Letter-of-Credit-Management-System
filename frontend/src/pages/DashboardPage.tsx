import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-gutter h-full">
      <div className="mb-section-gap">
        <h1 className="font-display-lg text-display-lg text-primary">Global Operations Dashboard</h1>
        <p className="font-body-lg text-on-surface-variant mt-2">Welcome to Lumina Trade Finance AI. Select a module below to begin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {/* Module 1: LC Issuance */}
        <div 
          onClick={() => navigate('/lc/new')}
          className="glass-panel p-container-padding rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all border border-outline-variant/10 group"
        >
          <div className="w-14 h-14 rounded-xl bg-primary-container/30 flex items-center justify-center mb-unit group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-[32px]">note_add</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Issue Letter of Credit</h3>
          <p className="font-body-md text-on-surface-variant">Create a new Letter of Credit application with AI compliance checks.</p>
        </div>

        {/* Workflow Management */}
        <div 
          onClick={() => navigate('/workflow')}
          className="glass-panel p-container-padding rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all border border-outline-variant/10 group"
        >
          <div className="w-14 h-14 rounded-xl bg-primary-container/30 flex items-center justify-center mb-unit group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-[32px]">account_tree</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Workflow Management</h3>
          <p className="font-body-md text-on-surface-variant">Manage LC approvals, discrepancies, and settlements.</p>
        </div>

        {/* Module 2: RBAC */}
        <div 
          onClick={() => navigate('/rbac')}
          className="glass-panel p-container-padding rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all border border-outline-variant/10 group"
        >
          <div className="w-14 h-14 rounded-xl bg-tertiary-container/30 flex items-center justify-center mb-unit group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-tertiary text-[32px]">admin_panel_settings</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">RBAC Management</h3>
          <p className="font-body-md text-on-surface-variant">Manage role-based access control, scopes, and dual-control policies.</p>
        </div>

        {/* Module 3: Users */}
        <div 
          onClick={() => navigate('/users')}
          className="glass-panel p-container-padding rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl transition-all border border-outline-variant/10 group"
        >
          <div className="w-14 h-14 rounded-xl bg-secondary-container/30 flex items-center justify-center mb-unit group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-secondary text-[32px]">group</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">User Directory</h3>
          <p className="font-body-md text-on-surface-variant">Manage global staff, update PII, and assign workflow roles.</p>
        </div>

        {/* Feature Module: Operational Analytics */}
        <Link to="/analytics" className="glass-panel p-6 rounded-xl hover:bg-surface-container-highest transition-all group block relative overflow-hidden border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-primary-container text-on-primary-container p-3 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[28px]">monitoring</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
          </div>
          <h2 className="font-title-lg text-title-lg mb-2 text-on-surface relative">Operational Analytics</h2>
          <p className="font-body-md text-on-surface-variant relative">Monitor system KPIs, active workflows, compliance scores, and overarching risk metrics in real-time.</p>
        </Link>

        {/* Feature Module: Audit Trail & Reporting */}
        <Link to="/reports" className="glass-panel p-6 rounded-xl hover:bg-surface-container-highest transition-all group block relative overflow-hidden border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/5 rounded-full blur-xl group-hover:bg-tertiary/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-tertiary-container text-on-tertiary-container p-3 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[28px]">gavel</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
          </div>
          <h2 className="font-title-lg text-title-lg mb-2 text-on-surface relative">Audit & Reports</h2>
          <p className="font-body-md text-on-surface-variant relative">View immutable ledgers, compliance trails, and generate regulatory reports across all system activity.</p>
        </Link>

        {/* Feature Module: AI Assistant Hub */}
        <Link to="/ai-hub" className="glass-panel p-6 rounded-xl hover:bg-surface-container-highest transition-all group block relative overflow-hidden border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--md-sys-color-primary-container)]/10 rounded-full blur-xl group-hover:bg-[var(--md-sys-color-primary-container)]/30 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] p-3 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[28px]">smart_toy</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
          </div>
          <h2 className="font-title-lg text-title-lg mb-2 text-on-surface relative">Lumina AI Hub</h2>
          <p className="font-body-md text-on-surface-variant relative">Contextual discrepancy analysis, trade term resolution, and semantic search powered by MongoDB Atlas Vector Search.</p>
        </Link>

        {/* Feature Module: User Management */}
        <Link to="/users" className="glass-panel p-6 rounded-xl hover:bg-surface-container-highest transition-all group block relative overflow-hidden border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--md-sys-color-error-container)]/10 rounded-full blur-xl group-hover:bg-[var(--md-sys-color-error-container)]/30 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-3 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[28px]">manage_accounts</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-error group-hover:translate-x-1 transition-all">arrow_forward</span>
          </div>
          <h2 className="font-title-lg text-title-lg mb-2 text-on-surface relative">Access Control</h2>
          <p className="font-body-md text-on-surface-variant relative">Manage platform users, orchestrate RBAC permissions, and enforce security policies globally.</p>
        </Link>
      </div>
    </div>
  );
};
