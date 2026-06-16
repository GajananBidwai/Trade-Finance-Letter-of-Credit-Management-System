export const AiAnalystDrawer = () => {
  return (
    <aside className="fixed right-0 top-16 h-[calc(100%-64px)] w-[320px] bg-surface-container-high/90 border-l border-primary/20 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col p-4 z-50 animate-slide-in-right">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-tertiary-container p-2 rounded-lg">
          <span className="material-symbols-outlined text-on-tertiary-container">analytics</span>
        </div>
        <div>
          <h4 className="font-title-lg text-title-lg text-tertiary">AI Analyst</h4>
          <p className="font-label-md text-label-md text-on-surface-variant">Contextual Insights</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="font-bold text-body-md text-on-surface mb-2">RBAC Recommendation</p>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Based on industry standard ISO 20022, the <span className="text-primary font-bold">Trade Officer</span> role typically includes 'Clause Modification' permissions which are currently disabled.
          </p>
          <button className="mt-4 text-tertiary font-bold text-label-md hover:underline">Apply Optimization</button>
        </div>

        <div className="bg-tertiary-container/10 p-4 rounded-xl border border-tertiary/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-tertiary text-[18px]">security</span>
            <p className="font-bold text-body-md text-tertiary">Compliance Alert</p>
          </div>
          <p className="text-body-md text-on-surface-variant">
            Enabling 'Approve Settlement' for this role may violate 4-eyes principle requirements for transactions exceeding $1.2M.
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <nav className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-white/5 rounded-xl transition-all">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <span className="font-label-md text-label-md">Documentation</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-white/5 rounded-xl transition-all">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <span className="font-label-md text-label-md">Audit Prediction</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};
