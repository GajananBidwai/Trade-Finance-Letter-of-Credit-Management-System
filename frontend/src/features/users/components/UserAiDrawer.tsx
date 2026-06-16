export const UserAiDrawer = () => {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100%-64px)] w-[320px] bg-surface-container-high/90 dark:bg-surface-container-high/90 border-l border-primary/20 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col p-4 z-50 animate-slide-in-right">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-tertiary-container/30 rounded flex items-center justify-center text-tertiary border border-tertiary/20">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-title-lg text-title-lg text-tertiary">AI Analyst</h3>
            <p className="text-on-surface-variant font-label-md text-[10px] tracking-tight">Contextual Insights</p>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2">
        <div className="p-4 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10">
          <div className="flex items-center gap-2 text-tertiary mb-2">
            <span className="material-symbols-outlined text-sm">security</span>
            <p className="font-label-md">Risk Scoring</p>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Anomalous login pattern detected for <span className="text-on-surface font-semibold">Sarah Mitchell</span>. High frequency from London, UK (Node 142). Recommended action: Multi-factor audit.
          </p>
          <button className="mt-3 w-full py-2 bg-tertiary-container text-on-tertiary-container rounded-lg font-label-md hover:opacity-90 transition-opacity">
            Review Audit Logs
          </button>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <p className="font-label-md">Clause Analysis</p>
          </div>
          <p className="text-body-md text-on-surface-variant">
            User role "Trade Officer" has pending permissions updates for 2024 compliance protocols.
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">Policy Alignment</span>
              <span className="text-emerald-400">88%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[88%]"></div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-dashed border-outline-variant/40">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-sm">description</span>
            <p className="font-label-md">Docs</p>
          </div>
          <p className="text-[12px] text-on-surface-variant italic">
            Drop administrative policy updates here to sync with role permissions...
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/10">
        <div className="flex gap-2">
          <button className="flex-1 flex flex-col items-center gap-1 py-2 bg-tertiary-container text-on-tertiary-container rounded-xl">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span className="font-label-md text-[10px]">Clause</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-2 text-on-surface-variant hover:bg-white/5 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-sm">security</span>
            <span className="font-label-md text-[10px]">Security</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-2 text-on-surface-variant hover:bg-white/5 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-sm">description</span>
            <span className="font-label-md text-[10px]">Docs</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
