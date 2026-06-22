import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { workflowApi } from '../features/workflow/services/workflowApi';

export const WorkflowListPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = React.useState('All Statuses');

  const { data: lcsData, isLoading, error } = useQuery({
    queryKey: ['lcs', statusFilter],
    queryFn: () => workflowApi.getAllLCs(token as string, statusFilter),
    enabled: !!token,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-primary/20 text-primary-fixed border border-primary/30';
      case 'PENDING_APPROVAL': return 'bg-secondary/20 text-secondary-fixed border border-secondary/30';
      case 'SETTLED': return 'bg-outline-variant/20 text-on-surface-variant border border-outline-variant/30';
      case 'REJECTED': return 'bg-error/20 text-error-fixed border border-error/30';
      case 'EXPIRED': return 'bg-outline-variant/20 text-outline border border-outline-variant/30';
      default: return 'bg-tertiary/20 text-tertiary-fixed border border-tertiary/30';
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="flex-1 overflow-y-auto p-gutter relative space-y-6 h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">LC Workflow Management</h2>
          <p className="text-on-surface-variant font-body-md">Real-time surveillance of Letters of Credit across global jurisdictions.</p>
        </div>
        <button 
          onClick={() => navigate('/lc/new')}
          className="px-6 py-3 bg-primary text-on-primary font-bold flex items-center gap-2 rounded-xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          New LC Application
        </button>
      </div>

      <div className="grid grid-cols-12 gap-default-gap items-center glass-panel p-4 rounded-xl">
        <div className="col-span-3">
          <label className="block text-label-md text-on-surface-variant mb-1 ml-1 uppercase">Workflow Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-surface-container-high border-none rounded-lg text-body-md py-2 px-3 focus:ring-1 focus:ring-primary"
          >
            <option>All Statuses</option>
            <option>ACTIVE</option>
            <option>PENDING_APPROVAL</option>
            <option>SETTLED</option>
          </select>
        </div>
        <div className="col-span-3">
          <label className="block text-label-md text-on-surface-variant mb-1 ml-1 uppercase">Date Range</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">calendar_today</span>
            <input className="w-full bg-surface-container-high border-none rounded-lg text-body-md py-2 pl-10 pr-3 focus:ring-1 focus:ring-primary text-on-surface" type="text" defaultValue="Current Month" />
          </div>
        </div>
        <div className="col-span-4">
          <label className="block text-label-md text-on-surface-variant mb-1 ml-1 uppercase">Entity Search</label>
          <input className="w-full bg-surface-container-high border-none rounded-lg text-body-md py-2 px-3 focus:ring-1 focus:ring-primary text-on-surface" placeholder="Filter by Applicant or Beneficiary..." type="text" />
        </div>
        <div className="col-span-2 flex items-end pt-5">
          <button className="w-full py-2 border border-outline-variant/30 text-on-surface rounded-lg font-bold hover:bg-white/5 transition-all flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Advanced
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 border-b border-outline-variant/10">
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">LC Reference</th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Applicant</th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Beneficiary</th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Amount</th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant text-center">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {isLoading && (
              <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">Loading LCs...</td></tr>
            )}
            {error && (
              <tr><td colSpan={6} className="text-center py-8 text-error">Error loading LCs</td></tr>
            )}
            {!isLoading && lcsData?.data?.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">No Letters of Credit found.</td></tr>
            )}
            {lcsData?.data?.map((lc: any) => (
              <tr 
                key={lc._id} 
                onClick={() => navigate(`/workflow/${lc._id}`)}
                className="hover:bg-primary/5 transition-colors group cursor-pointer border-l-4 border-transparent hover:border-primary"
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-label-md font-bold text-primary">{lc._id.substring(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">{lc.paymentType}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="font-body-md text-on-surface">{lc.applicant}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-body-md text-on-surface">{lc.beneficiary}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-label-md font-bold">{lc.amount?.$numberDecimal || lc.amount}</span>
                    <span className="text-[10px] text-on-surface-variant">{lc.currency}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-label-md font-bold ${getStatusColor(lc.status)}`}>
                    {getStatusDisplay(lc.status)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">chevron_right</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
