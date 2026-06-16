export const SecurityMonitor = () => {
  return (
    <div className="glass-panel p-6 rounded-[24px] space-y-4">
      <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-tertiary">security</span>
        Security Monitor
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-4 p-3 rounded-lg bg-error-container/10 border-l-4 border-error">
          <div className="text-error mt-0.5">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div>
            <p className="text-body-md font-bold text-on-surface">Unauthorized Attempt</p>
            <p className="text-label-md text-on-surface-variant">IP 192.168.1.104 • Settlement Module</p>
            <p className="text-[10px] text-error mt-1 uppercase font-bold">2 minutes ago</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-3 rounded-lg bg-primary-container/10 border-l-4 border-primary">
          <div className="text-primary mt-0.5">
            <span className="material-symbols-outlined text-[20px]">policy</span>
          </div>
          <div>
            <p className="text-body-md font-bold text-on-surface">Policy Update</p>
            <p className="text-label-md text-on-surface-variant">Admin updated 'Trade Officer' LC limit</p>
            <p className="text-[10px] text-primary mt-1 uppercase font-bold">1 hour ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};
