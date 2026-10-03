import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Save,
  Check,
  Trash2,
  Download,
  Key,
  BarChart3,
  AlertTriangle,
  Lock,
  Sparkles,
  Layers,
  BookOpen,
  Compass,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Usage State
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'usage') {
      const loadUsage = async () => {
        setLoadingUsage(true);
        try {
          const res = await userService.getUsage();
          if (res?.data?.data) {
            setUsageData(res.data.data);
          }
        } catch {
          toast.error('Failed to load usage metrics');
        } finally {
          setLoadingUsage(false);
        }
      };
      loadUsage();
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      await userService.updateProfile({ name: name.trim() });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter your current and new password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await userService.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await userService.exportData();
      if (res?.data?.data) {
        const jsonStr = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studylm-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('User data archive exported successfully');
      }
    } catch {
      toast.error('Failed to export user data archive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      toast.success('Your account and all associated data have been permanently deleted');
      setDeleteModalOpen(false);
      logout();
      navigate('/register');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'usage', label: 'Plan & Quotas', icon: BarChart3 },
    { id: 'privacy', label: 'Data & Privacy', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">Account Settings</h1>
        <p className="text-xs sm:text-sm text-[#6B756F] mt-1">
          Manage your research profile, security credentials, resource quotas, and privacy controls.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />

      {/* 1. Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Research Profile</CardTitle>
                <CardDescription>Your personal academic identity in StudyLM.</CardDescription>
              </div>
              <Badge variant="forest" size="md">
                Plan: {(user?.plan || 'Free').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email cannot be modified directly"
              />
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-[#6B756F]">Your profile name is displayed across workspaces.</span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              leftIcon={isSavingProfile ? Loader2 : Save}
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 2. Security Settings */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security & Credentials</CardTitle>
            <CardDescription>Update your account password and security keys.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </CardContent>
            <CardFooter>
              <span className="text-xs text-[#6B756F]">Passwords are salted with Bcrypt at cost factor 12.</span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isUpdatingPassword}
                leftIcon={isUpdatingPassword ? Loader2 : Key}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* 3. Usage & Plan Quotas */}
      {activeTab === 'usage' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resource Quotas & AI Usage</CardTitle>
                  <CardDescription>Monthly allocation for your {usageData?.user?.planName || 'Free'} plan.</CardDescription>
                </div>
                <Badge variant="forest" size="md">
                  Active Tier: {usageData?.user?.planName || 'Free'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadingUsage ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#1F5E4B] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-[#6B756F]">Loading usage data...</p>
                </div>
              ) : usageData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Notebooks */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#1F5E4B]" /> Notebooks
                      </span>
                      <span className="text-xs font-semibold text-[#1F5E4B]">
                        {usageData.usage.notebooks.current} / {usageData.usage.notebooks.limit}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E7E3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1F5E4B] h-full rounded-full transition-all"
                        style={{ width: `${usageData.usage.notebooks.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Requests */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" /> Monthly AI RAG
                      </span>
                      <span className="text-xs font-semibold text-[#1F5E4B]">
                        {usageData.usage.aiRequests.current} / {usageData.usage.aiRequests.limit}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E7E3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1F5E4B] h-full rounded-full transition-all"
                        style={{ width: `${usageData.usage.aiRequests.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Deep Research */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-blue-600" /> Research Sessions
                      </span>
                      <span className="text-xs font-semibold text-blue-700">
                        {usageData.usage.researchSessions.current} / {usageData.usage.researchSessions.limit}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E7E3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${usageData.usage.researchSessions.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Study Tools */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" /> Study Tools
                      </span>
                      <span className="text-xs font-semibold text-amber-700">
                        {usageData.usage.studyTools.current} / {usageData.usage.studyTools.limit}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E7E3] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${usageData.usage.studyTools.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Sources Active */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-1">
                    <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#1F5E4B]" /> Total Sources
                    </span>
                    <p className="text-lg font-bold text-[#17211D]">{usageData.usage.sources.current}</p>
                    <p className="text-[10px] text-[#6B756F]">
                      {usageData.usage.sources.documents} Docs • {usageData.usage.sources.web} Web (Max {usageData.usage.sources.maxPerNotebook}/nb)
                    </p>
                  </div>

                  {/* Approximate Tokens */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-1">
                    <span className="text-xs font-bold text-[#17211D] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1F5E4B]" /> Tokens Processed
                    </span>
                    <p className="text-lg font-bold text-[#17211D]">
                      {usageData.usage.approxTokens.total.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#6B756F]">Aggregated prompt & completion tokens</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Data & Privacy */}
      {activeTab === 'privacy' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Management &amp; Privacy</CardTitle>
            <CardDescription>Export your complete research archive or permanently delete your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#17211D]">Export All Research Data</p>
                <p className="text-xs text-[#6B756F]">
                  Download a structured JSON archive containing your notebooks, sources metadata, saved insights, bookmarks, and research sessions.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={isExporting ? Loader2 : Download}
                disabled={isExporting}
                onClick={handleExportData}
              >
                {isExporting ? 'Exporting...' : 'Export JSON'}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-rose-900">Permanently Delete Account &amp; All Data</p>
                <p className="text-xs text-rose-700">
                  Cascading deletion of all vector embeddings, documents, chats, study tools, research sessions, and account credentials.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => {
                  setDeleteConfirmationText('');
                  setDeleteModalOpen(true);
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
              onClick={handleDeleteAccount}
              leftIcon={isDeletingAccount ? Loader2 : Trash2}
            >
              {isDeletingAccount ? 'Deleting Everything...' : 'Permanently Delete'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm text-[#17211D]">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">This action is irreversible.</p>
              <p className="text-xs leading-relaxed">
                All your notebooks, documents, vector chunks, chat sessions, research sessions, and personal memories will be permanently removed.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#17211D]">
              Type <strong className="text-rose-600">DELETE</strong> to confirm:
            </label>
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="font-mono text-center font-bold"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
