import React from 'react';

export const DocumentRequirements: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* PROGRESS STEPPER (Left Rail) */}
      <div className="col-span-3 space-y-8">
        <div className="flex flex-col gap-6 border-l border-white/10 pl-6">
          <div className="relative opacity-30">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <p className="font-label-md text-label-md">Step 1</p>
            <h4 className="font-title-lg text-title-lg">Entity Details</h4>
          </div>
          <div className="relative opacity-30">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <p className="font-label-md text-label-md">Step 2</p>
            <h4 className="font-title-lg text-title-lg">Terms &amp; Conditions</h4>
          </div>
          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(192,193,255,0.8)]"></span>
            <p className="font-label-md text-label-md text-primary">Step 3</p>
            <h4 className="font-title-lg text-title-lg text-on-surface">Documentary Requirements</h4>
          </div>
          <div className="relative opacity-30">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <p className="font-label-md text-label-md">Step 4</p>
            <h4 className="font-title-lg text-title-lg">Review &amp; Submit</h4>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-4 bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-sm">info</span>
            <span className="font-label-md text-label-md">Presentation Rules</span>
          </div>
          <p className="text-[12px] leading-relaxed text-on-surface-variant">
            All required documents must be presented within 21 days after the date of shipment, but within the validity of the credit.
          </p>
        </div>
      </div>

      {/* MAIN FORM FIELDS */}
      <div className="col-span-9 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">Required Documents</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-on-surface transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="font-label-md text-label-md">Add Document Requirement</span>
          </button>
        </div>

        {/* DOCUMENT CARDS LIST */}
        <div className="space-y-4">
          {/* Commercial Invoice */}
          <div className="glass-panel p-6 rounded-xl border border-primary/30 relative overflow-hidden bg-surface/30 backdrop-blur-lg">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h4 className="font-title-lg text-title-lg text-on-surface">Commercial Invoice</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Standard trade requirement</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button className="p-2 hover:bg-white/5 rounded text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-white/5">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Originals Required</p>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-sm text-primary">filter_1</span>
                  <span className="font-body-md font-bold text-body-md">3</span>
                </div>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Copies Required</p>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-sm text-secondary">file_copy</span>
                  <span className="font-body-md font-bold text-body-md">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill of Lading */}
          <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden bg-surface/30 backdrop-blur-lg">
            <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">directions_boat</span>
                </div>
                <div>
                  <h4 className="font-title-lg text-title-lg text-on-surface">Full Set Clean On Board Ocean Bill of Lading</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Transport requirement</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                <button className="p-2 hover:bg-white/5 rounded text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-white/5">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Originals Required</p>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-sm text-primary">filter_1</span>
                  <span className="font-body-md font-bold text-body-md">3/3</span>
                </div>
              </div>
              <div className="col-span-2">
                 <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">Special Instructions</p>
                 <p className="font-body-md text-body-md text-on-surface">Made out to order of Issuing Bank, notify Applicant.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={onPrev} className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-lg text-on-surface hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-body-md text-body-md">Previous Step</span>
          </button>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-white/10 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all font-body-md text-body-md">
              Save as Draft
            </button>
            <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-lg hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all active:scale-95">
              <span className="font-body-md text-body-md font-bold">Review Application</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
