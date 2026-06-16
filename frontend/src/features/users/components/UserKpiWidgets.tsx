export const UserKpiWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-2">Total Users</p>
        <h3 className="font-label-md text-3xl font-bold">1,284</h3>
        <div className="mt-4 flex items-center gap-2 text-emerald-400 font-label-md">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>+12% vs last month</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
      </div>

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-2">Active Now</p>
        <h3 className="font-label-md text-3xl font-bold text-tertiary">142</h3>
        <div className="mt-4 flex items-center gap-2 text-on-surface-variant font-label-md">
          <span className="material-symbols-outlined text-sm">update</span>
          <span>Across 14 timezones</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary/20"></div>
      </div>

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-2">Security Alerts</p>
        <h3 className="font-label-md text-3xl font-bold text-error">02</h3>
        <div className="mt-4 flex items-center gap-2 text-error font-label-md">
          <span className="material-symbols-outlined text-sm">warning</span>
          <span>Requires review</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-error/20"></div>
      </div>

      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <p className="text-on-surface-variant font-label-md uppercase tracking-wider mb-2">Average Uptime</p>
        <h3 className="font-label-md text-3xl font-bold">99.98%</h3>
        <div className="mt-4 flex items-center gap-2 text-on-surface-variant font-label-md">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>Stable Performance</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-outline/20"></div>
      </div>
    </div>
  );
};
