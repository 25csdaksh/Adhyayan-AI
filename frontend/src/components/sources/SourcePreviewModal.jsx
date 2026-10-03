import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FileText, Globe, ExternalLink, BookOpen, Layers, Sparkles, Quote, Copy, Check } from 'lucide-react';
import { overviewService } from '../../api/overviewService';
import { useToast } from '../../context/ToastContext';

export const SourcePreviewModal = ({ isOpen, onClose, notebookId, citation }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !citation) {
      setPreviewData(null);
      return;
    }

    const loadPreview = async () => {
      // If citation contains chunkId and notebookId, fetch full preview context
      if (citation.chunkId && notebookId) {
        setLoading(true);
        try {
          const res = await overviewService.getChunkPreview(notebookId, citation.chunkId);
          if (res?.data) {
            setPreviewData(res.data);
          }
        } catch (err) {
          // Fallback to citation snippet if API call fails
          setPreviewData({
            targetChunk: {
              text: citation.snippet || 'Excerpt content unavailable.',
              pageNumber: citation.pageNumber,
            },
            source: {
              title: citation.documentTitle,
              sourceType: citation.sourceType,
              url: citation.url,
            },
            surroundingChunks: [],
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Direct snippet fallback
        setPreviewData({
          targetChunk: {
            text: citation.snippet || citation.text || 'Source excerpt',
            pageNumber: citation.pageNumber,
          },
          source: {
            title: citation.documentTitle || citation.title || 'Referenced Source',
            sourceType: citation.sourceType || 'document',
            url: citation.url,
          },
          surroundingChunks: [],
        });
      }
    };

    loadPreview();
  }, [isOpen, citation, notebookId]);

  const handleCopyText = () => {
    const textToCopy = previewData?.targetChunk?.text || citation?.snippet || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Excerpt copied to clipboard', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const isWeb = citation?.sourceType === 'web' || previewData?.source?.sourceType === 'web';
  const title = previewData?.source?.title || citation?.documentTitle || 'Source Preview';
  const pageNum = previewData?.targetChunk?.pageNumber || citation?.pageNumber;
  const webUrl = previewData?.source?.url || citation?.url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 max-w-xl truncate">
          <div className={`p-1.5 rounded-lg ${isWeb ? 'bg-blue-50 text-blue-700' : 'bg-[#E8F2EE] text-[#1F5E4B]'}`}>
            {isWeb ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <span className="truncate">{title}</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Source Meta Header */}
        <div className="flex items-center justify-between p-3 bg-[#F7F8F6] rounded-xl border border-[#E2E7E3] text-xs">
          <div className="flex items-center gap-2">
            <Badge variant={isWeb ? 'accent' : 'forest'} size="sm">
              {isWeb ? 'Web Source' : (citation?.sourceType || 'Document').toUpperCase()}
            </Badge>
            {pageNum && (
              <span className="text-[#17211D] font-bold">
                Page {pageNum}
              </span>
            )}
            {citation?.citationNumber && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#E2E7E3] font-bold text-[#1F5E4B]">
                Citation [{citation.citationNumber}]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 text-[#6B756F] hover:text-[#17211D] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E2E7E3]"
              title="Copy quoted passage"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {webUrl && (
              <a
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#1F5E4B] hover:underline font-semibold text-xs"
              >
                <span>Visit URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Highlighted Cited Chunk */}
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#1F5E4B] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-[#6B756F]">Loading deep-link source passage...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#17211D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#1F5E4B]" />
                Cited Passage
              </h4>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[#17211D] text-sm leading-relaxed font-serif">
                {previewData?.targetChunk?.text || citation?.snippet || 'No excerpt available.'}
              </div>
            </div>

            {/* Surrounding Context */}
            {previewData?.surroundingChunks?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#6B756F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Surrounding Document Context
                </h4>
                <div className="space-y-2">
                  {previewData.surroundingChunks.map((chunk, idx) => (
                    <div
                      key={chunk._id || idx}
                      className="p-3 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] text-xs text-[#4A5550] leading-relaxed"
                    >
                      <span className="text-[10px] font-bold text-[#8E9993] block mb-1">
                        Passage #{chunk.chunkIndex + 1} {chunk.pageNumber ? `(Page ${chunk.pageNumber})` : ''}
                      </span>
                      {chunk.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-[#E2E7E3]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
