import React, { useState } from 'react';
import {
  User,
  Sliders,
  Bell,
  Sparkles,
  Shield,
  Save,
  Check,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
} from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MOCK_USER } from '../mock/mockData';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileName, setProfileName] = useState(MOCK_USER.fullName);
  const [profileEmail, setProfileEmail] = useState(MOCK_USER.email);
  const [profileRole, setProfileRole] = useState(MOCK_USER.role);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [citationDensity, setCitationDensity] = useState('detailed');
  const toast = useToast();

  const handleSave = () => {
    toast.success('Settings and preferences saved successfully', 'Saved');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'ai', label: 'AI & Grounding', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Data & Privacy', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">Settings &amp; Preferences</h1>
        <p className="text-xs sm:text-sm text-[#6B756F] mt-1">
          Manage your research profile, model grounding behavior, and study experience.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* 1. Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Research Profile</CardTitle>
            <CardDescription>Your personal and institutional academic identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                label="Email Address"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>
            <Input
              label="Academic Role / Discipline"
              value={profileRole}
              onChange={(e) => setProfileRole(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <span className="text-xs text-[#6B756F]">Changes take effect immediately across all notebooks.</span>
            <Button variant="primary" size="sm" onClick={handleSave} leftIcon={Save}>
              Save Profile
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 2. Appearance Settings */}
      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle>Interface Appearance</CardTitle>
            <CardDescription>Select your preferred color scheme for reading and research.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setSelectedTheme('light')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedTheme === 'light'
                    ? 'border-[#1F5E4B] bg-[#E8F2EE]'
                    : 'border-[#E2E7E3] bg-white hover:border-[#BAC5C0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="w-5 h-5 text-[#D6A84F]" />
                  {selectedTheme === 'light' && <Check className="w-4 h-4 text-[#1F5E4B]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#17211D]">Light Mode</p>
                  <p className="text-[11px] text-[#6B756F]">Default academic contrast</p>
                </div>
              </div>

              <div
                onClick={() => setSelectedTheme('dark')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedTheme === 'dark'
                    ? 'border-[#1F5E4B] bg-slate-900 text-white'
                    : 'border-[#E2E7E3] bg-slate-950 text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  {selectedTheme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Dark Mode</p>
                  <p className="text-[11px] text-slate-400">Low-light nighttime study</p>
                </div>
              </div>

              <div
                onClick={() => setSelectedTheme('system')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedTheme === 'system'
                    ? 'border-[#1F5E4B] bg-[#E8F2EE]'
                    : 'border-[#E2E7E3] bg-white hover:border-[#BAC5C0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Monitor className="w-5 h-5 text-[#6B756F]" />
                  {selectedTheme === 'system' && <Check className="w-4 h-4 text-[#1F5E4B]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#17211D]">System Sync</p>
                  <p className="text-[11px] text-[#6B756F]">Match OS preference</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-[#6B756F]">Theme is applied automatically.</span>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Appearance
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 3. AI & Grounding Preferences */}
      {activeTab === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Grounding &amp; Model Behavior</CardTitle>
            <CardDescription>Configure Google Gemini API parameters and citation detail thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#17211D]">Default AI Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedModel('gemini-1.5-pro')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === 'gemini-1.5-pro'
                      ? 'border-[#1F5E4B] bg-[#E8F2EE]'
                      : 'border-[#E2E7E3] bg-white hover:border-[#BAC5C0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17211D]">Gemini 1.5 Pro</span>
                    <Badge variant="forest" size="sm">Recommended</Badge>
                  </div>
                  <p className="text-[11px] text-[#6B756F] mt-1">
                    2M token context window. Best for multi-hundred-page textbooks and deep synthesis.
                  </p>
                </div>

                <div
                  onClick={() => setSelectedModel('gemini-1.5-flash')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedModel === 'gemini-1.5-flash'
                      ? 'border-[#1F5E4B] bg-[#E8F2EE]'
                      : 'border-[#E2E7E3] bg-white hover:border-[#BAC5C0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17211D]">Gemini 1.5 Flash</span>
                    <Badge variant="neutral" size="sm">Ultra-fast</Badge>
                  </div>
                  <p className="text-[11px] text-[#6B756F] mt-1">
                    Lightweight latency-optimized model. Best for rapid Q&amp;A and quick flashcards.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#17211D]">Citation Verbosity</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'concise', label: 'Compact Pills' },
                  { id: 'detailed', label: 'Detailed Page Numbers & Excerpts' },
                  { id: 'academic', label: 'Full APA / BibTeX References' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCitationDensity(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      citationDensity === c.id
                        ? 'border-[#1F5E4B] bg-[#E8F2EE] text-[#1F5E4B] font-semibold'
                        : 'border-[#E2E7E3] bg-white text-[#6B756F] hover:bg-[#F2F5F3]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-[#6B756F]">Configured for strict zero-hallucination source grounding.</span>
            <Button variant="primary" size="sm" onClick={handleSave} leftIcon={Save}>
              Save AI Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 4. Notifications */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Study Notifications</CardTitle>
            <CardDescription>Manage updates for document indexing and study reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm text-[#17211D]">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] cursor-pointer">
              <div>
                <p className="font-semibold">Source Indexing Completed</p>
                <p className="text-xs text-[#6B756F]">Notify when large PDF vector embeddings are ready</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#1F5E4B] cursor-pointer" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] cursor-pointer">
              <div>
                <p className="font-semibold">Daily Spaced Repetition Reminders</p>
                <p className="text-xs text-[#6B756F]">Gentle nudge to review active recall flashcards</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#1F5E4B] cursor-pointer" />
            </label>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Notifications
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 5. Data & Privacy */}
      {activeTab === 'privacy' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Management &amp; Privacy</CardTitle>
            <CardDescription>Export your research materials or manage account storage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#17211D]">Export All Notebook Data</p>
                <p className="text-xs text-[#6B756F]">Download all notes, summaries, flashcards, and conversation logs as JSON/Markdown.</p>
              </div>
              <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.info('Data archive export requested', 'Export')}>
                Export Archive
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-rose-900">Delete Account &amp; Indexed Sources</p>
                <p className="text-xs text-rose-700">Permanently remove all vector embeddings and uploaded documents.</p>
              </div>
              <Button variant="danger" size="sm" leftIcon={Trash2} onClick={() => toast.error('Account deletion is locked during preview phase', 'Protected')}>
                Delete Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
