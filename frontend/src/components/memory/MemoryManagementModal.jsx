import React, { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Edit3, CheckCircle2, ToggleLeft, ToggleRight, Sparkles, BookOpen } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { memoryService } from '../../api/memoryService';
import { useToast } from '../../context/ToastContext';

export const MemoryManagementModal = ({ isOpen, onClose, notebookId }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'notebook'
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Memory Form State
  const [formType, setFormType] = useState('preference');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Notebook Memory State
  const [nbGoal, setNbGoal] = useState('');
  const [nbStyle, setNbStyle] = useState('standard');
  const [nbInstructions, setNbInstructions] = useState('');
  const [savingNbMem, setSavingNbMem] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const [userRes, nbRes] = await Promise.all([
        memoryService.getUserMemories(),
        notebookId ? memoryService.getNotebookMemory(notebookId).catch(() => null) : null,
      ]);

      if (userRes?.data?.memories) {
        setMemories(userRes.data.memories);
      }

      if (nbRes?.data?.memory) {
        setNbGoal(nbRes.data.memory.studyGoal || '');
        setNbStyle(nbRes.data.memory.preferredStyle || 'standard');
        setNbInstructions(nbRes.data.memory.customInstructions || '');
      }
    } catch {
      toast.error('Failed to load memory context', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, notebookId]);

  const handleCreateUserMemory = async (e) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    setIsCreating(true);
    const tagsArray = formTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    try {
      const res = await memoryService.createUserMemory({
        type: formType,
        content: formContent.trim(),
        tags: tagsArray,
      });

      if (res?.data?.memory) {
        setMemories((prev) => [res.data.memory, ...prev]);
        setFormContent('');
        setFormTags('');
        toast.success('Research memory saved', 'Personalized');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save memory', 'Error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (memory) => {
    try {
      const res = await memoryService.updateUserMemory(memory._id, {
        active: !memory.active,
      });
      if (res?.data?.memory) {
        setMemories((prev) =>
          prev.map((m) => (m._id === memory._id ? res.data.memory : m))
        );
      }
    } catch {
      toast.error('Failed to update memory status', 'Error');
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await memoryService.deleteUserMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
      toast.info('Memory deleted', 'Deleted');
    } catch {
      toast.error('Failed to delete memory', 'Error');
    }
  };

  const handleSaveNotebookMemory = async (e) => {
    e.preventDefault();
    if (!notebookId) return;

    setSavingNbMem(true);
    try {
      await memoryService.updateNotebookMemory(notebookId, {
        studyGoal: nbGoal.trim(),
        preferredStyle: nbStyle,
        customInstructions: nbInstructions.trim(),
      });
      toast.success('Notebook study guidelines updated', 'Saved');
    } catch {
      toast.error('Failed to save notebook instructions', 'Error');
    } finally {
      setSavingNbMem(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#1F5E4B]" />
          <span>Research Memory & Personalization</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4 max-h-[75vh] flex flex-col">
        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#F2F5F3] rounded-xl text-xs font-semibold text-[#6B756F]">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'user' ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold' : 'hover:text-[#17211D]'
            }`}
          >
            User Research Preferences ({memories.length})
          </button>
          {notebookId && (
            <button
              type="button"
              onClick={() => setActiveTab('notebook')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'notebook' ? 'bg-white text-[#1F5E4B] shadow-2xs font-bold' : 'hover:text-[#17211D]'
              }`}
            >
              Notebook Study Guidelines
            </button>
          )}
        </div>

        {/* Tab 1: User Memories */}
        {activeTab === 'user' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-[#4A5550] leading-relaxed font-serif">
              💡 <strong>Explicit Memory Only</strong>: StudyLM only saves preferences and learning goals you explicitly define. Source documents always remain the factual authority in RAG responses.
            </div>

            {/* Add Memory Form */}
            <form onSubmit={handleCreateUserMemory} className="p-4 rounded-2xl bg-[#F7F8F6] border border-[#E2E7E3] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17211D]">Add Research Preference / Goal</span>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[#E2E7E3] bg-white text-xs font-semibold text-[#17211D]"
                >
                  <option value="preference">Study Preference</option>
                  <option value="learning_goal">Learning Goal</option>
                  <option value="research_interest">Research Interest</option>
                  <option value="saved_instruction">Custom Instruction</option>
                </select>
              </div>

              <textarea
                required
                rows={2}
                placeholder="e.g. Prefer concise answers with bullet points and code examples."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] bg-white text-xs focus:outline-none focus:border-[#1F5E4B]"
              />

              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Tags (e.g. style, exams)"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E7E3] bg-white text-xs flex-1"
                />
                <Button variant="primary" size="sm" type="submit" isLoading={isCreating}>
                  Save Memory
                </Button>
              </div>
            </form>

            {/* Memory List */}
            <div className="space-y-2">
              {memories.map((mem) => (
                <div
                  key={mem._id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    mem.active ? 'bg-white border-[#E2E7E3]' : 'bg-[#FAFBF9] border-[#EDF1EE] opacity-60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={mem.active ? 'forest' : 'gray'} size="sm">
                        {mem.type.replace('_', ' ')}
                      </Badge>
                      {!mem.active && (
                        <span className="text-[10px] text-[#8E9993] font-semibold">(Disabled)</span>
                      )}
                    </div>
                    <p className="text-xs text-[#17211D] font-serif">{mem.content}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(mem)}
                      className="p-1 text-[#8E9993] hover:text-[#1F5E4B] rounded"
                      title={mem.active ? 'Disable memory' : 'Enable memory'}
                    >
                      {mem.active ? <ToggleRight className="w-5 h-5 text-[#1F5E4B]" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(mem._id)}
                      className="p-1 text-[#8E9993] hover:text-red-600 rounded"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Notebook Specific Memory */}
        {activeTab === 'notebook' && (
          <form onSubmit={handleSaveNotebookMemory} className="space-y-4 overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-[#17211D] mb-1">Study Goal / Focus Area</label>
              <input
                type="text"
                placeholder="e.g. Master CPU Scheduling and Deadlock handling for exam preparation."
                value={nbGoal}
                onChange={(e) => setNbGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs focus:outline-none focus:border-[#1F5E4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211D] mb-1">Preferred Explanation Style</label>
              <select
                value={nbStyle}
                onChange={(e) => setNbStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs bg-white focus:outline-none focus:border-[#1F5E4B]"
              >
                <option value="standard">Standard Balanced Academic Tone</option>
                <option value="detailed">In-Depth & Comprehensive Explanations</option>
                <option value="concise">Concise & Direct Answers</option>
                <option value="bullet_points">Structured Bullet Points & Key Formulas</option>
                <option value="conversational">Conversational & Intuitive Analogies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17211D] mb-1">Custom Notebook Directives</label>
              <textarea
                rows={3}
                placeholder="e.g. Always define technical acronyms first and highlight practical system implications."
                value={nbInstructions}
                onChange={(e) => setNbInstructions(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E7E3] text-xs focus:outline-none focus:border-[#1F5E4B]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" type="submit" isLoading={savingNbMem}>
                Save Notebook Guidelines
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
