import React, { useEffect, useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';
import { useNavigate } from 'react-router-dom';

interface DashboardSummary {
  activeLCs: number;
  pendingSettlements: number;
  complianceScore: number;
  overdueWorkflows: number;
  dataAsOf: string;
}

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentLCs, setRecentLCs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lcsRes] = await Promise.all([
        workflowApi.getDashboardSummary(token),
        workflowApi.getAllLCs(token)
      ]);
      setSummary(summaryRes.data);
      // Take only the top 5 recent LCs
      setRecentLCs(lcsRes.data?.slice(0, 5) || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-primary-container/20 text-primary';
      case 'PENDING_APPROVAL': return 'bg-tertiary-container/20 text-tertiary';
      case 'AMENDED': return 'bg-secondary-container/20 text-secondary';
      case 'OVERDUE': return 'bg-error-container/20 text-error';
      case 'EXPIRED': return 'bg-error-container/20 text-error';
      default: return 'bg-surface-variant/50 text-on-surface-variant';
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex-1 overflow-y-auto p-gutter relative space-y-6 h-full flex flex-col items-center justify-center">
        {error && <div className="text-error bg-error/10 p-4 rounded-lg mb-4">{error}</div>}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="flex-1 overflow-y-auto p-gutter relative space-y-6 h-full flex items-center justify-center">
        <div className="text-error bg-error/10 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-gutter relative space-y-6 h-full">
      <div className="flex justify-between items-end mb-section-gap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Operational Dashboard</h2>
          <p className="text-secondary mt-1">Real-time status of global trade facilities</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel px-4 py-2 rounded-lg text-label-md font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Live Data as of {summary?.dataAsOf ? new Date(summary.dataAsOf).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </button>
          <button className="bg-surface-bright px-4 py-2 rounded-lg text-label-md font-label-md flex items-center gap-2 border border-white/5 text-on-surface hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* KPI Cards (Row 1) */}
        <div className="col-span-3 glass-panel p-5 rounded-xl flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[80px]">assignment</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Active LCs</span>
            <span className="text-emerald-400 text-label-md font-bold flex items-center">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +5%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[40px] font-bold font-label-md tracking-tighter text-on-surface">{summary?.activeLCs || 0}</span>
            <div className="h-1 w-full bg-surface-container-highest mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary-container w-[72%]"></div>
            </div>
          </div>
        </div>
        
        <div className="col-span-3 glass-panel p-5 rounded-xl border border-tertiary/20 flex flex-col justify-between group relative">
          <div className="flex justify-between items-start">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Pending Settlements</span>
            <span className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold">URGENT</span>
          </div>
          <div className="mt-4">
            <span className="text-[40px] font-bold font-label-md tracking-tighter text-tertiary">{summary?.pendingSettlements || 0}</span>
            <p className="text-[12px] text-secondary/60 mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="col-span-3 glass-panel p-5 rounded-xl flex items-center justify-between border border-transparent">
          <div className="flex flex-col">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Compliance Score</span>
            <span className="text-[40px] font-bold font-label-md tracking-tighter mt-4 text-on-surface">{summary?.complianceScore || 100}<span className="text-[20px]">%</span></span>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
              <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={`${175.9 - (175.9 * (summary?.complianceScore || 100)) / 100}`} strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
            </div>
          </div>
        </div>

        <div className="col-span-3 glass-panel p-5 rounded-xl border border-error/30 bg-error/5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="text-secondary font-label-md text-label-md uppercase tracking-wider">Overdue Workflows</span>
            <span className="material-symbols-outlined text-error animate-pulse">warning</span>
          </div>
          <div className="mt-4">
            <span className="text-[40px] font-bold font-label-md tracking-tighter text-error">{summary?.overdueWorkflows || 0}</span>
            <p className="text-[12px] text-error/80 mt-1 font-medium">{summary?.overdueWorkflows ? 'SLA Breach Imminent' : 'All SLAs met'}</p>
          </div>
        </div>

        {/* Main Chart & Geographic (Row 2) */}
        <div className="col-span-8 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <h3 className="font-title-lg text-title-lg text-on-surface">Trade Volume Trend</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-label-md text-secondary">Issuance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-label-md text-secondary">Settlement</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative p-6 h-[320px]">
            {/* Mock Area Chart */}
            <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8083ff" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#8083ff" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,250 L100,220 L200,240 L300,180 L400,200 L500,150 L600,160 L700,100 L800,120 L800,300 L0,300 Z" fill="url(#chartGradient)"></path>
              <path d="M0,250 L100,220 L200,240 L300,180 L400,200 L500,150 L600,160 L700,100 L800,120" fill="none" stroke="#c0c1ff" strokeWidth="3"></path>
              {/* Grid Lines */}
              <line stroke="white" strokeDasharray="4" strokeOpacity="0.05" x1="0" x2="800" y1="50" y2="50"></line>
              <line stroke="white" strokeDasharray="4" strokeOpacity="0.05" x1="0" x2="800" y1="150" y2="150"></line>
              <line stroke="white" strokeDasharray="4" strokeOpacity="0.05" x1="0" x2="800" y1="250" y2="250"></line>
            </svg>
          </div>
        </div>
        
        <div className="col-span-4 glass-panel rounded-xl flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-title-lg text-title-lg text-on-surface">Geographic Distribution</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-label-md mb-1 text-on-surface">
                <span>APAC</span>
                <span>42%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full">
                <div className="h-full bg-primary-container w-[42%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-md mb-1 text-on-surface">
                <span>EMEA</span>
                <span>31%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full">
                <div className="h-full bg-secondary-container w-[31%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-md mb-1 text-on-surface">
                <span>AMER</span>
                <span>18%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full">
                <div className="h-full bg-outline w-[18%] rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-md mb-1 text-on-surface">
                <span>MENA</span>
                <span>9%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full">
                <div className="h-full bg-tertiary-container w-[9%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Workflow Table (Row 3) */}
        <div className="col-span-9 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg text-on-surface">Recent Active LCs</h3>
            <button onClick={() => navigate('/workflow')} className="text-primary hover:underline text-label-md font-label-md bg-transparent border-none cursor-pointer">View All Workflows</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-highest/30">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">LC Reference</th>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">Applicant</th>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">Beneficiary</th>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">Amount</th>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md uppercase text-secondary/60 tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLCs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-secondary/60 font-body-md">No recent active workflows found.</td>
                  </tr>
                ) : (
                  recentLCs.map(lc => (
                    <tr key={lc._id} onClick={() => navigate(`/workflow/${lc._id}`)} className="hover:bg-primary-container/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4 font-label-md text-primary uppercase">{lc._id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface">{lc.applicant}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface">{lc.beneficiary}</td>
                      <td className="px-6 py-4 font-label-md text-on-surface">{lc.amount?.$numberDecimal || lc.amount} {lc.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusBadge(lc.status)} px-3 py-1 rounded-full text-[11px] font-bold`}>{lc.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-secondary/60 text-sm">{new Date(lc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="col-span-3 flex flex-col gap-gutter">
          <div className="glass-panel ai-pulse rounded-xl p-6 flex-1 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface">AI Insights</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-label-md text-secondary uppercase tracking-wider mb-2">Operational Health</p>
                <div className="flex items-center gap-4">
                  <div className="text-[32px] font-bold text-emerald-400">Optimal</div>
                  <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                </div>
                <p className="text-body-md text-on-surface-variant mt-2">Throughput is up 12% compared to last cycle with no critical blockers identified.</p>
              </div>
              
              <div className="bg-surface-container-high/50 p-4 rounded-lg border border-white/5">
                <p className="text-label-md text-tertiary uppercase font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  Predictive Alerts
                </p>
                <ul className="space-y-3">
                  <li className="text-body-md flex gap-3 text-on-surface">
                    <div className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 shrink-0"></div>
                    <span>{summary?.overdueWorkflows ? `${summary.overdueWorkflows} workflows require immediate attention.` : 'All workflows are operating within defined SLAs.'}</span>
                  </li>
                  <li className="text-body-md flex gap-3 text-on-surface">
                    <div className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 shrink-0"></div>
                    <span>Volatility detected in APAC shipping corridors. Potential delays in document presentation.</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between py-3 border-t border-white/5">
                  <span className="text-label-md text-secondary">Data Freshness</span>
                  <span className="text-label-md text-primary">Live</span>
                </div>
                <p className="text-[10px] text-secondary/40 text-center uppercase tracking-widest mt-2">
                  Refreshed moments ago • Server: HK-G1
                </p>
              </div>
            </div>
          </div>
          
          {/* Data Visual Asset */}
          <div className="glass-panel rounded-xl h-[160px] relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-surface via-transparent to-primary/10"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Global Network Status</span>
              <div className="flex gap-1 mt-2 items-end h-16">
                <div className="w-1 h-8 bg-primary/20 rounded-full animate-[float_2s_infinite]"></div>
                <div className="w-1 h-12 bg-primary/40 rounded-full animate-[float_2.2s_infinite]"></div>
                <div className="w-1 h-16 bg-primary/60 rounded-full animate-[float_1.8s_infinite]"></div>
                <div className="w-1 h-10 bg-primary/30 rounded-full animate-[float_2.5s_infinite]"></div>
                <div className="w-1 h-14 bg-primary/50 rounded-full animate-[float_2.1s_infinite]"></div>
                <div className="w-1 h-6 bg-primary/20 rounded-full animate-[float_1.9s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
