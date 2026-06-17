import React, { useState } from 'react';

export const ReviewSubmit: React.FC<{ onPrev: () => void }> = ({ onPrev }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('LC Application Submitted successfully!');
    }, 2000);
  };

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
          <div className="relative opacity-30">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <p className="font-label-md text-label-md">Step 3</p>
            <h4 className="font-title-lg text-title-lg">Documentary Requirements</h4>
          </div>
          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(192,193,255,0.8)]"></span>
            <p className="font-label-md text-label-md text-primary">Step 4</p>
            <h4 className="font-title-lg text-title-lg text-on-surface">Review &amp; Submit</h4>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-4 bg-white/5 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="font-label-md text-label-md">Ready for Submission</span>
          </div>
          <p className="text-[12px] leading-relaxed text-on-surface-variant">
            All required fields have been completed. Please review the summary before final submission.
          </p>
        </div>
      </div>

      {/* MAIN FORM FIELDS */}
      <div className="col-span-9 space-y-8">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Application Summary</h3>
        
        {/* SUMMARY CARDS */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface/30 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-title-lg text-title-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">corporate_fare</span>
                Entity Details
              </h5>
              <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-body-md font-body-md text-on-surface">
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Applicant</p>
                <p>Global Tech Imports LLC</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Beneficiary</p>
                <p>Shenzhen Electronics Mfg Co.</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Amount</p>
                <p className="text-xl font-bold text-tertiary">$1,250,000.00 USD</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/10 bg-surface/30 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-title-lg text-title-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span>
                Terms &amp; Conditions
              </h5>
              <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-body-md font-body-md text-on-surface">
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Payment Type</p>
                <p>At Sight</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Partial Shipments</p>
                <p>Allowed</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-label-md font-label-md uppercase mb-1">Transshipment</p>
                <p>Not Allowed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACKNOWLEDGEMENT */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg flex gap-4 items-start">
           <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/20 bg-surface text-primary focus:ring-primary focus:ring-offset-surface" />
           <p className="font-body-md text-body-md text-on-surface-variant">
             I confirm that the information provided is accurate and complies with the UCP 600 guidelines and internal banking policies. I authorize the submission of this LC application.
           </p>
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
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all ${isSubmitting ? 'bg-primary/50 text-white cursor-not-allowed' : 'bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] active:scale-95'}`}
            >
              <span className="font-body-md text-body-md font-bold">{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              {!isSubmitting && <span className="material-symbols-outlined">send</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
