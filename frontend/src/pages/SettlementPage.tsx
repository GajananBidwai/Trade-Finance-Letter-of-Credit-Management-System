import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { workflowApi } from '../features/workflow/services/workflowApi';
import type { RootState } from '../store';

export const SettlementPage: React.FC = () => {
  const { id: lcId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [settlementAmount, setSettlementAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [overrideComment, setOverrideComment] = useState('');
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [overrideApprovedBy, setOverrideApprovedBy] = useState('');

  const [successData, setSuccessData] = useState<any>(null);

  const { data: lcData, isLoading: isLoadingLc } = useQuery({
    queryKey: ['lc', lcId],
    queryFn: () => workflowApi.getLC(lcId!, token!),
    enabled: !!lcId && !!token
  });

  const settlementMutation = useMutation({
    mutationFn: (payload: any) => workflowApi.processSettlement(lcId!, payload, token!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lc', lcId] });
      setSuccessData(data.data);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message;
      if (msg.includes('Senior officer approval required')) {
        setIsOverrideMode(true);
      } else {
        alert('Settlement failed: ' + msg);
      }
    }
  });

  if (isLoadingLc) {
    return <div className="p-8 text-on-surface">Loading Settlement Hub...</div>;
  }

  const lc = lcData?.data;

  const handleSettlement = () => {
    if (!settlementAmount) {
      alert("Please enter a settlement amount.");
      return;
    }
    
    const payload: any = {
      settlementAmount: parseFloat(settlementAmount),
      currency,
      authorizedBy: user?.id || 'system'
    };

    if (isOverrideMode) {
      if (!overrideApprovedBy || !overrideComment) {
        alert("Please provide Senior Officer ID and Override Comment.");
        return;
      }
      payload.overrideApprovedBy = overrideApprovedBy;
      payload.overrideComment = overrideComment;
    }

    settlementMutation.mutate(payload);
  };

  if (successData) {
    return (
      <div className="pt-24 px-gutter pb-section-gap flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-white/10 mx-auto">
            <span className="material-symbols-outlined text-on-primary text-5xl font-bold">check</span>
          </div>
        </div>
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Settlement Successfully Authorized</h2>
        <p className="font-title-lg text-title-lg text-on-surface-variant mb-12">The funds have been earmarked and the LC lifecycle state has been updated to SETTLED.</p>

        <div className="glass-card rounded-2xl p-8 max-w-xl w-full text-left mx-auto mb-12 border border-primary/20 bg-surface-container-lowest">
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Settlement ID</p>
              <p className="font-label-md text-sm text-primary break-all">{successData.settlementId}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Timestamp</p>
              <p className="font-body-md text-on-surface">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/workflow/${lcId}`)}
          className="bg-primary text-on-primary px-8 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          Return to LC Details
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 px-gutter pb-section-gap">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/workflow/${lcId}`)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Settlement Authorization
          </h1>
          <p className="text-on-surface-variant font-label-md text-label-md mt-1 uppercase tracking-widest">
            LC REFERENCE: {lc?.lcId || lcId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 glass-panel rounded-2xl p-6 glow-indigo relative group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-title-lg text-title-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              Payment Processing
            </h2>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center bg-white/5">
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Approved LC Amount</label>
                <div className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2 text-on-surface-variant">
                  {lc?.currency} {lc?.amount?.$numberDecimal || lc?.amount || '0.00'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Settlement Amount</label>
                <div className="flex gap-2">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2 text-on-surface"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input 
                    type="number" 
                    step="0.01"
                    className="flex-1 bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2 text-on-surface"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    placeholder="Enter final settlement amount"
                  />
                </div>
              </div>

              {isOverrideMode && (
                <div className="p-4 bg-error-container/20 border border-error/30 rounded-xl mt-4 space-y-4">
                  <h3 className="text-error font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    Amount Mismatch Override Required
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-error mb-1">Senior Officer ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-container-lowest border border-error/50 rounded-lg px-4 py-2 text-on-surface"
                      value={overrideApprovedBy}
                      onChange={(e) => setOverrideApprovedBy(e.target.value)}
                      placeholder="Enter Senior Officer ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-error mb-1">Override Comment</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-container-lowest border border-error/50 rounded-lg px-4 py-2 text-on-surface"
                      value={overrideComment}
                      onChange={(e) => setOverrideComment(e.target.value)}
                      placeholder="Reason for deviation"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSettlement}
                disabled={settlementMutation.isPending}
                className="w-full bg-primary text-on-primary px-8 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {settlementMutation.isPending ? 'Processing...' : (isOverrideMode ? 'Authorize Override & Settle' : 'Process Settlement')}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 glass-panel rounded-2xl p-6">
          <h3 className="font-title-lg mb-4 text-primary">Settlement Details</h3>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p><strong>Applicant:</strong> {lc?.applicant}</p>
            <p><strong>Beneficiary:</strong> {lc?.beneficiary}</p>
            <p><strong>Status:</strong> {lc?.status}</p>
            <p className="mt-4 p-4 bg-surface-container-lowest border border-white/10 rounded-lg">
              Settlement processing requires a perfect match between the approved LC amount and the settlement amount. Deviations will trigger a senior officer override flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
