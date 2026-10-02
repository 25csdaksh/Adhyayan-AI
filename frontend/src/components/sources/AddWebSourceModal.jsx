import React, { useState } from 'react';
import { Globe, X, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { webSourceService } from '../../api/webSourceService';

export const AddWebSourceModal = ({ isOpen, onClose, notebookId, onSourceAdded }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await webSourceService.createWebSource(notebookId, { url: url.trim() });
      if (response.success || response.data) {
        const addedSource = response.data?.webSource || response.data;
        setSuccess('Web source added and processed successfully!');
        if (onSourceAdded) {
          onSourceAdded(addedSource);
        }
        setTimeout(() => {
          setUrl('');
          setSuccess(null);
          onClose();
        }, 1200);
      } else {
        setError(response.message || 'Failed to add web source');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add web source');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-[#E2E7E3] rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF1EE]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17211D]">Add Web Source</h2>
              <p className="text-xs text-[#6B756F]">Extract, clean, and embed readable text from a web page</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17211D] mb-1.5 uppercase tracking-wider">
              Target URL (HTTP / HTTPS)
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/research-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-[#FAFBF9] border border-[#E2E7E3] rounded-xl text-xs text-[#17211D] placeholder-[#8E9993] focus:outline-none focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B] transition-all"
            />
            <p className="mt-1.5 text-[11px] text-[#6B756F]">
              Guarded by server-side SSRF blocks, private IP filtering, script-stripping, and text chunking.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDF1EE]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-2 bg-[#1F5E4B] hover:bg-[#184B3C] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ingesting & Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ingest Source</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWebSourceModal;
