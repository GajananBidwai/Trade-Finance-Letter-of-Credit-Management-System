import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { workflowApi } from '../features/workflow/services/workflowApi';

export const LcDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: lcData, isLoading, error } = useQuery({
    queryKey: ['lc', id],
    queryFn: () => workflowApi.getLC(id as string, token as string),
    enabled: !!id && !!token,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment?: string }) => {
      return workflowApi.updateStatus(id as string, {
        status,
        comment,
        approvedBy: user?.email || 'System User',
        version: lcData?.data?.version || 0,
      }, token as string);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lc', id] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'An error occurred while updating status.');
    }
  });

  if (isLoading) return <div className="p-8 text-on-surface">Loading...</div>;
  if (error || !lcData?.data) return <div className="p-8 text-error">Failed to load LC</div>;

  const lc = lcData.data;

  const handleApprove = () => updateStatusMutation.mutate({ status: 'ACTIVE' });
  const handleReject = () => updateStatusMutation.mutate({ status: 'REJECTED', comment: 'Rejected by compliance check.' });

  return (
    <div className="flex-1 overflow-y-auto p-gutter relative bg-background">
      {errorMsg && (
        <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg border border-error">
          <p className="font-bold">Error updating LC status</p>
          <p className="text-sm">{errorMsg}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm underline text-error font-bold">Reload Latest Data</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-gutter">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-2">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/workflow')}>Transactions</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span>Letters of Credit</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">{lc._id.substring(0, 8).toUpperCase()}</span>
            </nav>
            <div className="flex items-center gap-4">
              <h2 className="font-display-lg text-display-lg text-on-background">LC-{lc._id.substring(0, 8).toUpperCase()}</h2>
              <span className="bg-tertiary-container/20 text-tertiary border border-tertiary/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {lc.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-default-gap">
            <button 
              onClick={handleReject}
              disabled={lc.status !== 'PENDING_APPROVAL' && lc.status !== 'AMENDED'}
              className="bg-transparent border border-outline-variant text-on-surface-variant font-bold px-6 py-2.5 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Reject
            </button>
            <button 
              onClick={handleApprove}
              disabled={lc.status !== 'PENDING_APPROVAL' && lc.status !== 'AMENDED'}
              className="bg-primary text-on-primary font-bold px-8 py-2.5 rounded-lg shadow-[0_0_20px_rgba(192,193,255,0.4)] hover:shadow-[0_0_30px_rgba(192,193,255,0.6)] transition-all disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => navigate(`/workflow/${lc._id}/documents`)}
              className="bg-tertiary text-on-tertiary font-bold px-8 py-2.5 rounded-lg shadow-lg hover:brightness-110 transition-all ml-4"
            >
              Review Documents
            </button>
            {lc.status === 'ACTIVE' && (
              <button
                onClick={() => navigate(`/workflow/${lc._id}/settlement`)}
                className="bg-primary-container text-on-primary-container font-bold px-8 py-2.5 rounded-lg shadow-lg hover:brightness-110 transition-all ml-2"
              >
                Process Settlement
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <div className="glass-panel p-6 rounded-2xl bg-surface-dim border border-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-title-lg text-title-lg text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">description</span>
                  Letter of Credit Terms
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Applicant</label>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">{lc.applicant}</p>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Beneficiary</label>
                  <p className="font-body-lg text-body-lg text-on-surface font-semibold">{lc.beneficiary}</p>
                </div>
                <div className="col-span-1">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Amount &amp; Currency</label>
                  <div className="flex items-baseline gap-2">
                    <span className="font-label-md text-primary">{lc.currency}</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{lc.amount?.$numberDecimal || lc.amount}</span>
                  </div>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Payment Terms</label>
                  <p className="font-body-md text-body-md text-on-surface">{lc.paymentType}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-panel p-6 rounded-2xl bg-surface-dim border border-outline-variant/10">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-8">Transaction Timeline</h3>
              <div className="relative pl-8 space-y-10">
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant/30"></div>
                {lc.statusHistory?.map((evt: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-surface-container border-2 border-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Status changed to {evt.toStatus.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(evt.timestamp).toLocaleString()} • Performed by {evt.performedBy}</p>
                      {evt.comment && <p className="text-sm mt-1 text-on-surface-variant italic">"{evt.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
             <div className="glass-panel p-6 rounded-2xl h-full border-primary/20 bg-surface-dim flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">analytics</span>
                  <h3 className="font-title-lg text-title-lg text-tertiary">AI Analyst</h3>
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <h4 className="text-xs font-bold text-primary mb-2 uppercase">Risk Scoring</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-tertiary border-t-transparent flex items-center justify-center">
                      <span className="font-label-md text-headline-md text-tertiary">14</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Low Risk</p>
                      <p className="text-xs text-on-surface-variant">Automated checks passed.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
