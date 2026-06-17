import React, { useState } from 'react';

export const TermsConditions: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const [paymentType, setPaymentType] = useState('At Sight');
  const [partialShipments, setPartialShipments] = useState(false);
  const [transshipment, setTransshipment] = useState(false);

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
          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(192,193,255,0.8)]"></span>
            <p className="font-label-md text-label-md text-primary">Step 2</p>
            <h4 className="font-title-lg text-title-lg text-on-surface">Terms &amp; Conditions</h4>
          </div>
          <div className="relative opacity-30">
            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <p className="font-label-md text-label-md">Step 3</p>
            <h4 className="font-title-lg text-title-lg">Documentary Requirements</h4>
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
            <span className="font-label-md text-label-md">UCP 600 Guidelines</span>
          </div>
          <p className="text-[12px] leading-relaxed text-on-surface-variant">
            Ensure all payment terms adhere to ICC Uniform Customs and Practice for Documentary Credits.
          </p>
        </div>
      </div>

      {/* MAIN FORM FIELDS */}
      <div className="col-span-9 space-y-8">
        {/* PAYMENT TERMS SECTION */}
        <div className="glass-panel p-container-padding rounded-xl bg-surface/30 border border-white/10 p-6 backdrop-blur-lg">
          <h5 className="font-title-lg text-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            Payment Terms
          </h5>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {['At Sight', 'Deferred', 'Mixed'].map((type) => (
              <label key={type} className="relative flex flex-col p-4 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                <input
                  type="radio"
                  name="payment_type"
                  checked={paymentType === type}
                  onChange={() => setPaymentType(type)}
                  className="absolute top-4 right-4 text-primary focus:ring-primary bg-surface border-white/20"
                />
                <span className="font-title-lg text-title-lg text-on-surface">{type}</span>
                <span className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {type === 'At Sight' ? 'Payment upon presentation of compliant documents.' :
                   type === 'Deferred' ? 'Payment after a fixed period from document receipt.' :
                   'Combination of At Sight and Deferred payments.'}
                </span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase">Maturity Reference</label>
              <select className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none appearance-none bg-white/5">
                <option>Date of Shipment</option>
                <option>Date of Presentation</option>
                <option>Acceptance Date</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase">Credit Period (Days)</label>
              <input type="number" placeholder="e.g. 90" className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder-white/20 focus:ring-2 focus:ring-primary outline-none bg-white/5" />
            </div>
          </div>
        </div>

        {/* SHIPMENT RULES SECTION */}
        <div className="glass-panel p-container-padding rounded-xl bg-surface/30 border border-white/10 p-6 backdrop-blur-lg">
          <h5 className="font-title-lg text-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Shipment Rules
          </h5>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 mb-4">
            <div>
              <p className="font-title-lg text-title-lg text-on-surface">Partial Shipments</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Allow cargo to be split into multiple shipments.</p>
            </div>
            <button
              onClick={() => setPartialShipments(!partialShipments)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${partialShipments ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${partialShipments ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
            <div>
              <p className="font-title-lg text-title-lg text-on-surface">Transshipment</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Allow goods to be transferred from one vessel to another.</p>
            </div>
            <button
              onClick={() => setTransshipment(!transshipment)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${transshipment ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${transshipment ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>
        </div>

        {/* ADDITIONAL TERMS SECTION */}
        <div className="glass-panel p-container-padding rounded-xl bg-surface/30 border border-white/10 p-6 backdrop-blur-lg">
          <h5 className="font-title-lg text-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Additional Terms &amp; Special Instructions
          </h5>
          <div className="relative">
            <textarea
              rows={6}
              placeholder="Specify any additional clauses, document handling instructions, or unique bank requirements..."
              className="w-full bg-surface-container border border-white/10 rounded-lg p-4 text-on-surface placeholder-white/20 focus:ring-2 focus:ring-primary outline-none font-body-md text-body-md resize-none bg-white/5"
            ></textarea>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-on-surface-variant" title="Insert Template">
                <span className="material-symbols-outlined text-sm">data_object</span>
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-on-surface-variant" title="Voice Dictation">
                <span className="material-symbols-outlined text-sm">mic</span>
              </button>
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
              <span className="font-body-md text-body-md font-bold">Continue to Documents</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
