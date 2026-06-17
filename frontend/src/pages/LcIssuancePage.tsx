import React, { useState } from 'react';
import { TermsConditions } from '../features/lc/components/TermsConditions';
import { DocumentRequirements } from '../features/lc/components/DocumentRequirements';
import { ReviewSubmit } from '../features/lc/components/ReviewSubmit';

export const LcIssuancePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(2);

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return <TermsConditions onNext={() => setCurrentStep(3)} onPrev={() => setCurrentStep(1)} />;
      case 3:
        return <DocumentRequirements onNext={() => setCurrentStep(4)} onPrev={() => setCurrentStep(2)} />;
      case 4:
        return <ReviewSubmit onPrev={() => setCurrentStep(3)} />;
      default:
        // Mock Step 1 for Entity Details
        return (
          <div className="flex flex-col items-center justify-center h-64 border border-white/10 rounded-xl bg-surface/30 backdrop-blur-lg">
             <h2 className="text-on-surface text-xl">Entity Details (Step 1)</h2>
             <button onClick={() => setCurrentStep(2)} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg">Next to Terms & Conditions</button>
          </div>
        );
    }
  };

  return (
    <div className="p-container-padding max-w-5xl mx-auto pb-32">
      {/* STEPPER HEADER */}
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
            {currentStep}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {currentStep === 2 ? 'Terms & Conditions' : currentStep === 3 ? 'Documentary Requirements' : currentStep === 4 ? 'Review & Submit' : 'Entity Details'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {currentStep === 2 ? 'Defining financial obligations and shipment rules.' : 
               currentStep === 3 ? 'Specify necessary shipping and commercial documents.' :
               currentStep === 4 ? 'Final review before application submission.' :
               'Applicant and Beneficiary details.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Step {currentStep} of 4</span>
          <div className="w-32 h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full bg-primary transition-all duration-300`} style={{ width: `${(currentStep / 4) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {renderStep()}

    </div>
  );
};
