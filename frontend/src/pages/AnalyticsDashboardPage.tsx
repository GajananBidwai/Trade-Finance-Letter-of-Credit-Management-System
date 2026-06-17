import React, { useEffect, useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';

interface DashboardSummary {
  activeLCs: number;
  pendingSettlements: number;
  complianceScore: number;
  overdueWorkflows: number;
  dataAsOf: string;
}

export const AnalyticsDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock token retrieval
  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  const fetchDashboardData = async () => {
    try {
      const response = await workflowApi.getDashboardSummary(token);
      setSummary(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-primary">Operational Analytics Dashboard</h1>
          <p className="text-on-surface-variant text-sm">Real-time analytics and monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-outline bg-surface-container-high px-3 py-1.5 rounded-full border border-outline/10">
          <span className="material-symbols-outlined text-[14px]">history</span>
          Live Data as of {summary?.dataAsOf ? new Date(summary.dataAsOf).toLocaleTimeString() : 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active LCs Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">description</span>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-medium mb-1">Active Letters of Credit</h3>
          <div className="text-4xl font-bold text-on-surface">{summary?.activeLCs || 0}</div>
        </div>

        {/* Pending Settlements Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-medium mb-1">Pending Settlements</h3>
          <div className="text-4xl font-bold text-on-surface">{summary?.pendingSettlements || 0}</div>
        </div>

        {/* Compliance Score Card */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">30 Days</span>
          </div>
          <h3 className="text-on-surface-variant text-sm font-medium mb-1">Compliance Score</h3>
          <div className="text-4xl font-bold text-on-surface flex items-baseline gap-1">
            {summary?.complianceScore || 100}<span className="text-lg text-outline">%</span>
          </div>
        </div>

        {/* Overdue Workflows Card */}
        <div className="bg-surface-container-low border border-error/30 rounded-xl p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(255,180,171,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            {summary && summary.overdueWorkflows > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </span>
            )}
          </div>
          <h3 className="text-on-surface-variant text-sm font-medium mb-1">Overdue Workflows</h3>
          <div className="text-4xl font-bold text-error">{summary?.overdueWorkflows || 0}</div>
        </div>
      </div>

      {summary && summary.overdueWorkflows > 0 && (
        <div className="mt-6 bg-error/10 border border-error/30 rounded-lg p-4 flex gap-4 items-start">
          <span className="material-symbols-outlined text-error mt-0.5">error</span>
          <div>
            <h4 className="text-error font-medium">Attention Required</h4>
            <p className="text-on-surface-variant text-sm mt-1">There are {summary.overdueWorkflows} workflows that have breached their SLA threshold. Please review the pending approvals immediately.</p>
          </div>
        </div>
      )}
    </div>
  );
};
