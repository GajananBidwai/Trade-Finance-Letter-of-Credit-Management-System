
interface PermissionMatrixProps {
  roleName: string;
}

export const PermissionMatrix = ({ roleName }: PermissionMatrixProps) => {
  // Fake loading effect when switching roles
  // In a real app, this would use React Query's isLoading
  // useEffect(() => {
  //   setLoading(true);
  //   const timer = setTimeout(() => setLoading(false), 300);
  //   return () => clearTimeout(timer);
  // }, [roleName]);

  return (
    <div className={`glass-raised rounded-[24px] overflow-hidden mb-8 transition-opacity duration-300 opacity-100`}>
      <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
            Editing: <span className="text-primary">{roleName}</span>
          </h3>
          <p className="text-body-md text-on-surface-variant">Configure granular module permissions for the selected role.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-bold hover:bg-white/5 transition-all">Discard</button>
          <button className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Save Policy Changes
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Module Group: Letter of Credit */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-primary">description</span>
            <h4 className="font-bold text-body-lg">Letters of Credit</h4>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Issue / Draft LC</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Amend Existing LC</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Approve Clause Changes</span>
              <input type="checkbox" className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer opacity-50">
              <span className="text-body-md text-on-surface-variant">Cancel Transaction</span>
              <input type="checkbox" disabled className="rounded bg-surface-container-highest border-outline-variant text-primary h-5 w-5" />
            </label>
          </div>
        </div>

        {/* Module Group: Compliance & Risk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary">fact_check</span>
            <h4 className="font-bold text-body-lg">Compliance & Risk</h4>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">View Risk Scores</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Run Sanctions Check</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Override Compliance Flag</span>
              <input type="checkbox" className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Export Audit Logs</span>
              <input type="checkbox" className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
          </div>
        </div>

        {/* Module Group: Settlement */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary">payments</span>
            <h4 className="font-bold text-body-lg">Settlement</h4>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Initiate Payment</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Approve Settlement</span>
              <input type="checkbox" className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Modify Beneficiary Info</span>
              <input type="checkbox" className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
            <label className="flex items-center justify-between group cursor-pointer">
              <span className="text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">View Bank Statements</span>
              <input type="checkbox" defaultChecked className="rounded bg-surface-container-highest border-outline-variant text-primary focus:ring-primary h-5 w-5" />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
