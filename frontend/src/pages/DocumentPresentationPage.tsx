import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { workflowApi } from '../features/workflow/services/workflowApi';
import type { RootState } from '../store';

export const DocumentPresentationPage: React.FC = () => {
  const { id: lcId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [documentType, setDocumentType] = useState('CERTIFICATE_OF_ORIGIN');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: lcData, isLoading: isLoadingLc } = useQuery({
    queryKey: ['lc', lcId],
    queryFn: () => workflowApi.getLC(lcId!, token!),
    enabled: !!lcId && !!token
  });

  const { data: docsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents', lcId],
    queryFn: () => workflowApi.getDocuments(lcId!, token!),
    enabled: !!lcId && !!token
  });

  const uploadMutation = useMutation({
    mutationFn: (payload: any) => workflowApi.uploadDocument(lcId!, payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', lcId] });
      setFileUrl('');
      setUploading(false);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
      setUploading(false);
      setUploadProgress(0);
    }
  });

  const reviewMutation = useMutation({
    mutationFn: ({ docId, discId, payload }: any) => workflowApi.reviewDiscrepancy(lcId!, docId, discId, payload, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', lcId] });
    }
  });

  const handleSimulateUpload = () => {
    if (!fileUrl) {
      alert("Please enter a mock file URL (e.g., https://example.com/invoice.pdf or https://example.com/fail.pdf)");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          uploadMutation.mutate({
            documentType,
            fileUrl,
            submittedBy: user?.id || 'system'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReview = (docId: string, discId: string, status: 'RAISED' | 'WAIVED') => {
    const comment = prompt(`Enter comment for ${status}:`);
    if (status === 'RAISED' && !comment) {
      alert("Comment is required to raise a discrepancy.");
      return;
    }
    reviewMutation.mutate({
      docId,
      discId,
      payload: { status, comment, decidedBy: user?.id }
    });
  };

  if (isLoadingLc || isLoadingDocs) {
    return <div className="p-8 text-on-surface">Loading Document Presentation Hub...</div>;
  }

  const lc = lcData?.data;
  const documents = docsData?.data || [];

  // Filter unresolved discrepancies for the Review Queue
  const unresolvedDiscrepancies = documents.flatMap((doc: any) => 
    doc.discrepancies
      .filter((d: any) => d.status === 'PENDING')
      .map((d: any) => ({ ...d, documentId: doc._id, documentType: doc.documentType }))
  );

  return (
    <div className="pt-24 px-gutter pb-section-gap">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/workflow/${lcId}`)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Document Presentation & AI Compliance
          </h1>
          <p className="text-on-surface-variant font-label-md text-label-md mt-1 uppercase tracking-widest">
            LC REFERENCE: {lc?.lcId || lcId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Document Upload Hub */}
        <div className="col-span-8 glass-panel rounded-2xl p-6 glow-indigo relative group">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-title-lg text-title-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">cloud_upload</span>
              Document Presentation Hub
            </h2>
            <select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="bg-surface-container-high border-white/10 rounded-lg text-xs font-label-md px-4 py-2 focus:ring-primary focus:border-primary"
            >
              <option value="BILL_OF_LADING">BILL_OF_LADING</option>
              <option value="COMMERCIAL_INVOICE">COMMERCIAL_INVOICE</option>
              <option value="CERTIFICATE_OF_ORIGIN">CERTIFICATE_OF_ORIGIN</option>
              <option value="PACKING_LIST">PACKING_LIST</option>
              <option value="INSURANCE_CERTIFICATE">INSURANCE_CERTIFICATE</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center bg-white/5 hover:bg-white/[0.08] hover:border-primary/40 transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
            </div>
            <p className="font-headline-md text-headline-md mb-2">Simulate Document Upload</p>
            <input 
              type="text" 
              placeholder="Enter mock file URL (e.g. https://example.com/fail.pdf)"
              className="w-full max-w-md bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2 text-sm text-center mb-4 focus:ring-primary focus:border-primary"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              disabled={uploading}
            />
            <button 
              onClick={handleSimulateUpload}
              disabled={uploading}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {uploading ? 'Processing AI Analysis...' : 'Simulate Upload & AI Scan'}
            </button>
          </div>

          {uploading && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-label-md text-on-surface-variant">
                <span>Processing: {fileUrl}</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* AI Compliance Result Summary */}
        <div className="col-span-4 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">AI Engine v4.2</span>
            <div className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-primary text-[10px] font-bold uppercase tracking-tighter">
              Active Monitoring
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">Upload a document to see AI compliance analysis. If the URL contains "fail", it will generate discrepancies.</p>
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-white/5">
              <h4 className="text-xs font-bold text-on-surface mb-2 uppercase tracking-widest">AI Instructions</h4>
              <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1">
                <li>Uses vector search to map LC clauses.</li>
                <li>Validates shipment dates against LC.</li>
                <li>Verifies insurance coverage minimums.</li>
                <li>Extracts entities and cross-references.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Discrepancy Review Interface */}
        {unresolvedDiscrepancies.length > 0 && (
          <div className="col-span-12 glass-panel rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-title-lg text-title-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">fact_check</span>
                Discrepancy Review Queue
              </h3>
              <div className="flex gap-2">
                <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant">
                  {unresolvedDiscrepancies.length} UNRESOLVED
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {unresolvedDiscrepancies.map((disc: any) => (
                <div key={`${disc.documentId}-${disc._id}`} className="grid grid-cols-12 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-error">warning</span>
                      <h4 className="font-semibold text-on-surface">{disc.documentType} Discrepancy</h4>
                    </div>
                    <p className="text-sm text-on-surface-variant ml-8">{disc.description}</p>
                  </div>
                  <div className="col-span-6 flex justify-end gap-4">
                    <button onClick={() => handleReview(disc.documentId, disc._id, 'RAISED')} className="py-2 px-6 bg-error-container/30 border border-error/50 text-error rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-error-container/50 transition-all">RAISE</button>
                    <button onClick={() => handleReview(disc.documentId, disc._id, 'WAIVED')} className="py-2 px-6 bg-white/5 border border-white/20 text-on-surface-variant rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">WAIVE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document History Table */}
        <div className="col-span-12 glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-surface-container-high/50 p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-label-md text-label-md uppercase tracking-widest font-bold">Document Submission Audit</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-dim font-label-md text-label-md uppercase text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">TYPE</th>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">UPLOADED</th>
                  <th className="px-6 py-4">AI SCORE</th>
                  <th className="px-6 py-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map((doc: any) => (
                  <tr key={doc._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-primary">{doc.documentType}</td>
                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-[200px]">{doc.fileUrl}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{new Date(doc.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono">{doc.riskScore.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {doc.complianceStatus === 'PASS' && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold">PASS</span>}
                      {doc.complianceStatus === 'FAIL' && <span className="px-2 py-0.5 bg-error/20 text-error rounded-md text-[10px] font-bold">FAIL</span>}
                      {doc.complianceStatus === 'MANUAL_REVIEW' && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-md text-[10px] font-bold">MANUAL</span>}
                      {doc.qualityWarning && <div className="mt-1 text-[10px] text-error">{doc.qualityWarning}</div>}
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No documents uploaded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
