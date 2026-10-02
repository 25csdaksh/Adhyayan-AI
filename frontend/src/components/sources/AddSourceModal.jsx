import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import {
  UploadCloud,
  FileText,
  Globe,
  FileType,
  AlignLeft,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';

export const AddSourceModal = ({
  isOpen,
  onClose,
  onAddSource,
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [webUrl, setWebUrl] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const tabs = [
    { id: 'upload', label: 'File Upload (PDF/DOCX/TXT)', icon: UploadCloud },
    { id: 'url', label: 'Website Link', icon: Globe },
    { id: 'paste', label: 'Paste Text', icon: AlignLeft },
  ];

  const handleAddWebUrl = (e) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    onAddSource({
      id: `s-${Date.now()}`,
      title: webUrl.trim(),
      type: 'web',
      size: '120 KB',
      status: 'ready',
      uploadedAt: 'Just now',
      snippet: `Live extracted content from ${webUrl.trim()}`,
    });

    setWebUrl('');
    onClose();
  };

  const handleAddPastedText = (e) => {
    e.preventDefault();
    if (!pastedContent.trim()) return;

    onAddSource({
      id: `s-${Date.now()}`,
      title: pastedTitle.trim() || 'Pasted Notes Snippet',
      type: 'txt',
      size: `${Math.round(pastedContent.length / 1024 * 10) / 10} KB`,
      status: 'ready',
      uploadedAt: 'Just now',
      snippet: pastedContent.slice(0, 140) + '...',
    });

    setPastedTitle('');
    setPastedContent('');
    onClose();
  };

  const handleMockUpload = (fileType, defaultName) => {
    onAddSource({
      id: `s-${Date.now()}`,
      title: defaultName,
      type: fileType,
      size: '4.2 MB',
      pages: fileType === 'pdf' ? 24 : undefined,
      status: 'ready',
      uploadedAt: 'Just now',
      snippet: `Synthesized research content from ${defaultName}`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Source to Notebook"
      description="StudyLM grounds all AI responses strictly in your selected study sources."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="w-full justify-center"
        />

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleMockUpload('pdf', 'Uploaded_Lecture_Slides.pdf'); }}
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
                Supports PDF, DOCX, and TXT up to 50MB per file
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={FileText}
                  onClick={() => handleMockUpload('pdf', 'Network_Security_Ch3.pdf')}
                >
                  Upload Sample PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={FileType}
                  onClick={() => handleMockUpload('docx', 'Lab_Assignment_Draft.docx')}
                >
                  Upload Sample DOCX
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B756F] px-1">
              <span>Source Limit: 50 documents / notebook</span>
              <span>Vector Search: Enabled</span>
            </div>
          </div>
        )}

        {/* Tab 2: Web URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleAddWebUrl} className="space-y-4">
            <Input
              label="Web Page / Documentation URL"
              placeholder="https://en.wikipedia.org/wiki/OSI_model"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              leftIcon={LinkIcon}
              hint="StudyLM will extract clean article content and disregard navigation ads."
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" leftIcon={Plus} disabled={!webUrl.trim()}>
                Add Web Source
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Paste Text */}
        {activeTab === 'paste' && (
          <form onSubmit={handleAddPastedText} className="space-y-4">
            <Input
              label="Snippet Title"
              placeholder="e.g. Professor's Exam Hints or Formula Sheet"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
            />
            <Textarea
              label="Text Content"
              placeholder="Paste raw notes, code excerpts, or transcript here..."
              rows={5}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" leftIcon={Plus} disabled={!pastedContent.trim()}>
                Add Text Source
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
