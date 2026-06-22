import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const UserProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('Personal Info');

  // Fallback data if user is missing
  const currentUser = user || {
    name: 'Jameson Vane',
    email: 'j.vane@globaltradecorp.com',
    role: 'TRADE_OFFICER',
    permissions: ['LC_ISSUANCE', 'TREASURY_TRANSFER', 'AUDIT_REVIEW', 'USER_PROVISIONING']
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'System Admin';
      case 'COMPLIANCE_ANALYST': return 'Compliance Analyst';
      case 'TRADE_OFFICER': return 'Lead Treasurer';
      case 'SETTLEMENT_OFFICER': return 'Settlement Officer';
      default: return role.replace('_', ' ');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-section-gap w-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-section-gap w-full">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full pulsing-border overflow-hidden ring-4 ring-primary/20 shadow-2xl bg-surface-container flex items-center justify-center text-4xl font-bold text-primary">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-2 rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface mb-1">{currentUser.name || 'Unknown User'}</h2>
              <div className="flex items-center gap-3">
                <span className="font-label-md text-label-md text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20 uppercase tracking-widest">
                  {getRoleDisplayName(currentUser.role)}
                </span>
                <span className="text-on-surface-variant flex items-center gap-1 font-body-md text-body-md">
                  <span className="material-symbols-outlined text-base">corporate_fare</span>
                  Global Trade Corp
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold flex items-center gap-2 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Profile
            </button>
            <button className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
              Save Changes
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-8">
          {['Personal Info', 'Security & Password', 'Notification Preferences', 'Professional Credentials'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 transition-colors relative ${activeTab === tab ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Settings */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Personal Info Card */}
            <div className="glass-panel rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline-md text-headline-md text-on-surface">Personal Information</h3>
                <span className="text-on-surface-variant italic text-sm">Last updated: 2 days ago</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase transition-colors focus-within:text-primary">Full Name</label>
                  <input className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface transition-all" type="text" defaultValue={currentUser.name} />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase transition-colors focus-within:text-primary">Email Address</label>
                  <input className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface transition-all" type="email" defaultValue={currentUser.email} />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase transition-colors focus-within:text-primary">Phone Number</label>
                  <input className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface transition-all" type="tel" defaultValue="+65 8291 0042" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase transition-colors focus-within:text-primary">Regional Jurisdiction</label>
                  <select className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface transition-all">
                    <option defaultValue="Singapore - APAC">Singapore - APAC</option>
                    <option>London - EMEA</option>
                    <option>New York - AMER</option>
                    <option>Hong Kong - APAC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Management Card */}
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-8">Security & Access</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">authenticator</span>
                    </div>
                    <div>
                      <p className="font-title-lg text-title-lg text-on-surface">Multi-Factor Authentication</p>
                      <p className="text-body-md text-on-surface-variant">Recommended for all lead treasurer accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-xs font-bold border border-emerald-500/20 uppercase">Enabled</span>
                    <button className="text-primary hover:underline font-bold text-sm">Manage</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">lock_reset</span>
                    </div>
                    <div>
                      <p className="font-title-lg text-title-lg text-on-surface">Change Password</p>
                      <p className="text-body-md text-on-surface-variant">Password was last changed 4 months ago</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-outline rounded-lg text-sm font-bold hover:bg-white/5 transition-colors">Update</button>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">desktop_windows</span>
                      <div>
                        <p className="text-on-surface">MacBook Pro 16" • Singapore</p>
                        <p className="text-xs text-on-surface-variant opacity-60">Current Session</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                      <div>
                        <p className="text-on-surface">iPhone 15 Pro • London</p>
                        <p className="text-xs text-on-surface-variant opacity-60">2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-error font-bold hover:underline">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* AI Status / Insight Panel */}
            <div className="glass-modal rounded-2xl p-6 border-primary/20 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/20 blur-[80px] rounded-full"></div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest">AI Compliance Assistant</h4>
              </div>
              <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed relative z-10">
                Your profile is currently <span className="text-on-surface font-bold">Tier 4 Verified</span>. This allows for unrestricted Letter of Credit issuance and high-value treasury movements.
              </p>
              <div className="bg-surface/50 rounded-xl p-4 border border-white/10 relative z-10">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-on-surface-variant">Profile Completeness</span>
                  <span className="text-xs font-bold text-primary">92%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            {/* Professional Credentials Card */}
            <div className="glass-panel rounded-2xl p-6">
              <h4 className="font-headline-md text-headline-md text-on-surface mb-6">Professional Credentials</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-surface-container-high">
                  <div className="w-10 h-10 flex items-center justify-center bg-tertiary/10 text-tertiary rounded-lg shrink-0">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">CDCS® Certified</p>
                    <p className="text-xs text-on-surface-variant">Doc. Credit Specialist (LIBF)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-surface-container-high">
                  <div className="w-10 h-10 flex items-center justify-center bg-tertiary/10 text-tertiary rounded-lg shrink-0">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">CSDG® Certified</p>
                    <p className="text-xs text-on-surface-variant">Demand Guarantees (LIBF)</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <h5 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">System Permissions</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.permissions?.map(perm => (
                      <span key={perm} className="bg-white/5 text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase">
                        {perm}
                      </span>
                    ))}
                    {!currentUser.permissions?.length && (
                      <span className="text-xs text-on-surface-variant italic">Default permissions only</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Accounts / Org */}
            <div className="glass-panel rounded-2xl p-6">
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">Organization</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]">corporate_fare</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">Global Trade Corp</p>
                  <p className="text-xs text-on-surface-variant">Enterprise Tier Account</p>
                </div>
              </div>
              <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                Switch Organization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
