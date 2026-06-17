import React, { useEffect, useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';

interface AuditLog {
  eventId: string;
  eventType: string;
  module: string;
  action: string;
  performedBy: string;
  lcId?: string;
  timestamp: string;
}

export const ReportingPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  
  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [eventType, setEventType] = useState('');

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (eventType) params.eventType = eventType;
      
      const res = await workflowApi.getAuditLogs(token, params);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fromDate, toDate, eventType]);

  const handleExport = async (format: 'PDF' | 'CSV') => {
    setExporting(true);
    setExportMessage('');
    try {
      const payload = {
        reportType: 'AUDIT',
        format,
        filters: { fromDate, toDate, eventType }
      };
      const res = await workflowApi.exportReport(payload, token);
      
      if (res.status === 'accepted') {
        setExportMessage(res.data.message); // Async flow
      } else if (res.data.downloadUrl) {
        setExportMessage('Export complete! Download starting...');
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (err) {
      setExportMessage('Export failed.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Audit Trail & Reports</h1>
        <p className="text-on-surface-variant text-sm">Immutable ledger of all system events and compliance exports.</p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl shadow-lg flex flex-col h-[calc(100vh-200px)]">
        
        {/* Top Controls */}
        <div className="p-4 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest/50 rounded-t-xl">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 bg-surface border border-outline-variant/30 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <span className="material-symbols-outlined text-outline text-sm">calendar_today</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent border-none text-sm text-on-surface outline-none" 
              />
              <span className="text-outline mx-1">to</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent border-none text-sm text-on-surface outline-none" 
              />
            </div>
            
            <select 
              className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">All Event Types</option>
              <option value="LC_CREATED">LC Created</option>
              <option value="LC_STATUS_UPDATED">LC Status Updated</option>
              <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
              <option value="SETTLEMENT_PROCESSED">Settlement Processed</option>
            </select>
            
            {(fromDate || toDate || eventType) && (
              <button 
                onClick={() => { setFromDate(''); setToDate(''); setEventType(''); }}
                className="text-xs text-outline hover:text-primary transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-tertiary">{exportMessage}</span>
            <button 
              onClick={() => handleExport('CSV')}
              disabled={exporting}
              className="flex items-center gap-2 bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-container-highest/80 text-on-surface text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              CSV
            </button>
            <button 
              onClick={() => handleExport('PDF')}
              disabled={exporting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-fixed text-on-primary text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {exporting ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>}
              Export PDF
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-surface-container-lowest">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-8">
              <span className="material-symbols-outlined text-5xl opacity-20 mb-4">history</span>
              <p>No audit logs found for the selected criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-lowest sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold tracking-wider uppercase text-outline">Timestamp</th>
                  <th className="py-3 px-6 text-xs font-semibold tracking-wider uppercase text-outline">Event Type</th>
                  <th className="py-3 px-6 text-xs font-semibold tracking-wider uppercase text-outline">Module</th>
                  <th className="py-3 px-6 text-xs font-semibold tracking-wider uppercase text-outline">Action Details</th>
                  <th className="py-3 px-6 text-xs font-semibold tracking-wider uppercase text-outline">Actor / LC Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {logs.map((log) => (
                  <tr key={log.eventId} className="hover:bg-surface-container-highest/30 transition-colors">
                    <td className="py-4 px-6 text-on-surface whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {log.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{log.module}</td>
                    <td className="py-4 px-6 text-on-surface">{log.action}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-mono text-xs">{log.performedBy === 'system_user' ? 'SYSTEM' : log.performedBy.substring(0,8)}</span>
                        {log.lcId && <span className="text-outline text-[10px]">LC: {log.lcId.substring(log.lcId.length - 6)}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Immutable Footer */}
        <div className="bg-surface-container border-t border-outline-variant/20 p-3 rounded-b-xl flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-sm">lock</span>
          <span className="text-xs text-outline font-medium tracking-wide uppercase">Cryptographically secured append-only ledger</span>
        </div>
      </div>
    </div>
  );
};
