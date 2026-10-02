import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Globe,
  FileType,
  AlignLeft,
  Link as LinkIcon,
  Plus,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { documentService } from '../../api/documentService';
import { useToast } from '../../context/ToastContext';
import { formatBytes } from '../../utils/formatters';

export const AddSourceModal = ({
  isOpen,
  onClose,
  notebookId,
  onSourceAdded,
}) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Tab 1: File Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Tab 2: URL state
  const [webUrl, setWebUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');

  // Tab 3: Paste Text state
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: UploadCloud },
    { id: 'url', label: 'Web URL', icon: Globe },
    { id: 'paste', label: 'Paste Text', icon: AlignLeft },
  ];

  const resetForm = () => {
    setSelectedFile(null);
    setFileTitle('');
    setWebUrl('');
    setUrlTitle('');
    setPastedTitle('');
    setPastedContent('');
    setErrorMessage('');
    setUploadProgress(0);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  // Handle File selection
  const handleFileChange = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];

    if (!validExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please select a PDF, Word (DOCX), or Text (TXT) file.`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage(`File exceeds 20MB limit (${formatBytes(file.size)}).`);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    if (!fileTitle) {
      setFileTitle(file.name);
    }
  };

  // Submit File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (fileTitle.trim()) {
      formData.append('title', fileTitle.trim());
    }

    try {
      const response = await documentService.uploadDocument(
        notebookId,
        formData,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(95, percentCompleted));
          }
        }
      );

      setUploadProgress(100);
      const createdDoc = response?.data?.document;
      toast.success(`"${createdDoc?.title || selectedFile.name}" added to sources`, 'Source Uploaded');
      onSourceAdded?.(createdDoc);
      handleClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit URL source
  const handleAddWebUrl = async (e) => {
    e.preventDefault();
    if (!webUrl.trim()) {
      setErrorMessage('Please enter a web URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await documentService.createUrlSource(notebookId, {
        title: urlTitle.trim() || webUrl.trim(),
        url: webUrl.trim(),
      });

      const createdDoc = response?.data?.document;
      toast.success(`"${createdDoc?.title || webUrl}" added to sources`, 'Web Source Added');
      onSourceAdded?.(createdDoc);
      handleClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add URL source. Please verify the URL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Pasted Text source
  const handleAddPastedText = async (e) => {
    e.preventDefault();
    if (!pastedContent.trim()) {
      setErrorMessage('Please enter some text content.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await documentService.createTextSource(notebookId, {
        title: pastedTitle.trim() || 'Untitled Note',
        text: pastedContent.trim(),
      });

      const createdDoc = response?.data?.document;
      toast.success(`"${createdDoc?.title || 'Note'}" added to sources`, 'Text Source Added');
      onSourceAdded?.(createdDoc);
      handleClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add text source. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Source to Notebook"
      description="StudyLM grounds all AI responses strictly in your selected study sources."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            if (!isSubmitting) {
              setActiveTab(tab);
              setErrorMessage('');
            }
          }}
          variant="pills"
          className="w-full justify-center"
        />

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 bg-[#FDEDEC] border border-[#F5C2C0] rounded-xl flex items-start gap-2.5 text-xs text-[#D32F2F]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFileChange(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-[#1F5E4B] bg-[#E8F2EE]'
                    : 'border-[#D8DFDB] hover:border-[#1F5E4B] bg-[#FAFBF9]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E7E3] text-[#1F5E4B] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#17211D]">
                  Click or drag &amp; drop study files here
                </p>
                <p className="text-xs text-[#6B756F] mt-1">
                  Supports PDF, Word (DOCX), and Text (TXT) up to 20MB per file
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-[#E2E7E3] rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#17211D] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-[#6B756F]">
                        {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                      </p>
                    </div>
                  </div>
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 text-[#8E9993] hover:text-[#D32F2F] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Input
                  label="Document Title (Optional)"
                  placeholder="Custom label for this source"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  disabled={isSubmitting}
                />

                {isSubmitting && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-[#6B756F]">
                      <span>Uploading to secure storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E2E7E3] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#1F5E4B] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-[#6B756F] px-1">
              <span>Max size: 20MB</span>
              <span>Cloud Storage: Cloudinary</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                leftIcon={isSubmitting ? Loader2 : Plus}
                disabled={!selectedFile || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload & Ground'}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Web URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleAddWebUrl} className="space-y-4">
            <Input
              label="Source Title (Optional)"
              placeholder="e.g. Operating Systems Reference Manual"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="Web Page / Documentation URL"
              placeholder="https://en.wikipedia.org/wiki/Operating_system"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              leftIcon={LinkIcon}
              hint="StudyLM will register this URL as a study source for grounding."
              disabled={isSubmitting}
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                leftIcon={isSubmitting ? Loader2 : Plus}
                disabled={!webUrl.trim() || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Web Source'}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Paste Text */}
        {activeTab === 'paste' && (
          <form onSubmit={handleAddPastedText} className="space-y-4">
            <Input
              label="Snippet Title (Optional)"
              placeholder="e.g. Exam Hints or Formula Sheet"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <Textarea
              label="Text Content"
              placeholder="Paste raw notes, code excerpts, or transcript here..."
              rows={5}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                leftIcon={isSubmitting ? Loader2 : Plus}
                disabled={!pastedContent.trim() || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Add Text Source'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
