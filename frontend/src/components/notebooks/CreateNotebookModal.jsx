import React, { useState } from 'react';
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
  FolderPlus,
} from 'lucide-react';

export const CreateNotebookModal = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');
  const [selectedColor, setSelectedColor] = useState('#1F5E4B');
  const [errors, setErrors] = useState({});

  const icons = [
    { id: 'BookOpen', icon: BookOpen, label: 'Book' },
    { id: 'Network', icon: Network, label: 'Networks' },
    { id: 'Binary', icon: Binary, label: 'Algorithms' },
    { id: 'Database', icon: Database, label: 'Database' },
    { id: 'Sparkles', icon: Sparkles, label: 'AI' },
    { id: 'Cpu', icon: Cpu, label: 'Systems' },
    { id: 'Sigma', icon: Sigma, label: 'Math' },
  ];

  const colors = [
    { value: '#1F5E4B', label: 'Forest Green' },
    { value: '#2B5A84', label: 'Academic Blue' },
    { value: '#8A4F1D', label: 'Warm Ochre' },
    { value: '#4B3F72', label: 'Deep Purple' },
    { value: '#78350F', label: 'Bronze Amber' },
    { value: '#374151', label: 'Slate Gray' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Please enter a notebook name' });
      return;
    }

    const newNotebook = {
      id: `nb-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Custom study notebook with user sources.',
      category: 'General',
      icon: selectedIcon,
      color: selectedColor,
      sourceCount: 0,
      lastUpdated: 'Just now',
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      sources: [],
    };

    onCreate(newNotebook);
    handleReset();
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSelectedIcon('BookOpen');
    setSelectedColor('#1F5E4B');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Create New Notebook"
      description="Set up an intelligent workspace to organize your research sources, notes, and AI queries."
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} leftIcon={FolderPlus}>
            Create Notebook
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Notebook Title *"
          placeholder="e.g. Distributed Systems & Consensus Protocols"
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
          placeholder="What topic, course, or research subject will this notebook cover?"
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

        {/* Color Palette */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-[#17211D]">
            Theme Accent
          </label>
          <div className="flex items-center gap-3">
            {colors.map((c) => {
              const isSelected = selectedColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                    isSelected ? 'scale-110 ring-2 ring-offset-2 ring-[#1F5E4B]' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};
