import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import {
  BookOpen,
  Network,
  Binary,
  Database,
  Sparkles,
  Cpu,
  Sigma,
  Save,
} from 'lucide-react';

export const EditNotebookModal = ({
  isOpen,
  onClose,
  onUpdate,
  notebook,
  isUpdating = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (notebook && isOpen) {
      setTitle(notebook.title || '');
      setDescription(notebook.description || '');
      setSelectedIcon(notebook.icon || 'BookOpen');
      setErrors({});
    }
  }, [notebook, isOpen]);

  const icons = [
    { id: 'BookOpen', icon: BookOpen, label: 'Book' },
    { id: 'Network', icon: Network, label: 'Networks' },
    { id: 'Binary', icon: Binary, label: 'Algorithms' },
    { id: 'Database', icon: Database, label: 'Database' },
    { id: 'Sparkles', icon: Sparkles, label: 'AI' },
    { id: 'Cpu', icon: Cpu, label: 'Systems' },
    { id: 'Sigma', icon: Sigma, label: 'Math' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Please enter a notebook title.' });
      return;
    }

    onUpdate({
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Notebook"
      description="Update the name, description, or icon for this study notebook."
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isUpdating}
            leftIcon={Save}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Notebook Title *"
          placeholder="e.g. Distributed Systems & Concurrency"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({});
          }}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Summary of course subjects or research topics..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Icon Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#17211D]">
            Notebook Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {icons.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedIcon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1F5E4B] bg-[#E8F2EE] text-[#1F5E4B] ring-1 ring-[#1F5E4B]'
                      : 'border-[#E2E7E3] bg-white text-[#6B756F] hover:bg-[#F2F5F3] hover:text-[#17211D]'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};
