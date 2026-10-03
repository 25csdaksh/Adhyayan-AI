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
  CreditCard,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
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
import { billingService } from '../api/billingService';
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

  // Billing & Plans State
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

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

  const loadBillingData = async () => {
    setLoadingBilling(true);
    try {
      const [plansData, subData, payData] = await Promise.all([
        billingService.getPlans().catch(() => []),
        billingService.getSubscription().catch(() => null),
        billingService.getPayments().catch(() => []),
      ]);
      setPlans(plansData);
      setSubscription(subData);
      setPayments(payData);
    } catch {
      toast.error('Failed to load billing information');
    } finally {
      setLoadingBilling(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'plans') {
      loadBillingData();
    } else if (activeTab === 'usage') {
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
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
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

  const handleUpgrade = async (planKey) => {
    if (planKey === 'free' || planKey === subscription?.plan) return;

    setIsCheckingOut(true);
    try {
      const checkoutData = await billingService.checkout(planKey);

      // Check if Razorpay script is available or in production mode
      if (window.Razorpay && checkoutData.keyId && checkoutData.keyId !== 'mock_key_id') {
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amountInPaise,
          currency: checkoutData.currency,
          name: 'Adhyayan-AI',
          description: `Subscription: ${checkoutData.planName}`,
          order_id: checkoutData.orderId,
          prefill: checkoutData.prefill,
          theme: { color: '#1F5E4B' },
          handler: async (response) => {
            try {
              await billingService.verifyPayment({
                orderId: response.razorpay_order_id || checkoutData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planKey,
              });
              toast.success(`Successfully upgraded to ${checkoutData.planName}!`);
              loadBillingData();
            } catch (err) {
              toast.error(err.message || 'Payment verification failed');
            }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Safe Simulation / Sandbox verification for Test Mode
        await billingService.verifyPayment({
          orderId: checkoutData.orderId,
          paymentId: `pay_sim_${Date.now()}`,
          signature: 'mock_valid_sig',
          planKey,
        });
        toast.success(`Successfully activated ${checkoutData.planName}!`);
        loadBillingData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initiate checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await billingService.cancelSubscription(false);
      toast.success('Subscription scheduled to cancel at end of billing cycle');
      setCancelModalOpen(false);
      loadBillingData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await billingService.resumeSubscription();
      toast.success('Subscription resumed successfully');
      loadBillingData();
    } catch (err) {
      toast.error(err.message || 'Failed to resume subscription');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await userService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adhyayan-ai-research-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      toast.success('Account and all associated data permanently deleted');
      logout();
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'plans', label: 'Plan & Billing', icon: CreditCard },
    { id: 'usage', label: 'Usage & Quotas', icon: BarChart3 },
    { id: 'privacy', label: 'Data & Privacy', icon: Lock },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#17211D]">Account Settings &amp; Subscription</h1>
        <p className="text-sm text-[#6B756F]">
          Manage your research profile, credentials, subscription plan, usage quotas, and data privacy.
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 1. User Profile */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information and display preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17211D]">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="max-w-md"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17211D]">Email Address</label>
              <Input value={user?.email || ''} disabled className="max-w-md bg-[#F2F4F2] text-[#6B756F]" />
              <p className="text-[11px] text-[#6B756F]">Email address is managed permanently on your account.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              leftIcon={isSavingProfile ? Loader2 : Save}
              disabled={isSavingProfile}
              onClick={handleSaveProfile}
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 2. Security & Password */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password with standard BCrypt encryption.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17211D]">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17211D]">New Password (min. 8 characters)</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#17211D]">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={isUpdatingPassword ? Loader2 : Key}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* 3. Plan & Billing */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Active Subscription Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active billing plan and renewal status</CardDescription>
              </div>
              {subscription && (
                <Badge variant={subscription.plan === 'pro' || subscription.plan === 'enterprise' ? 'primary' : 'neutral'}>
                  {subscription.planName || 'Free Starter'}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {loadingBilling ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#1F5E4B] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-[#6B756F]">Loading subscription details...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-1">
                    <span className="text-xs text-[#6B756F]">Current Tier</span>
                    <p className="text-lg font-bold text-[#17211D]">{subscription?.planName || 'Free Starter'}</p>
                    <p className="text-xs text-[#1F5E4B] font-medium">
                      {subscription?.amount ? `₹${subscription.amount} / ${subscription.billingCycle}` : 'Free Forever'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] space-y-1">
                    <span className="text-xs text-[#6B756F]">Status</span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {subscription?.cancelAtPeriodEnd ? (
                        <Badge variant="warning">Cancels at Period End</Badge>
                      ) : subscription?.status === 'active' ? (
                        <Badge variant="primary">Active &amp; Renews</Badge>
                      ) : (
                        <Badge variant="neutral">Active (Free)</Badge>
                      )}
                    </div>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-[11px] text-[#6B756F]">
                        {subscription.daysRemaining} days remaining (renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()})
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] flex flex-col justify-center gap-2">
                    {subscription?.cancelAtPeriodEnd ? (
                      <Button variant="outline" size="sm" onClick={handleResumeSubscription} leftIcon={RefreshCw}>
                        Resume Subscription
                      </Button>
                    ) : subscription?.isPaid ? (
                      <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(true)} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                        Cancel Subscription
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleUpgrade('pro')} leftIcon={Sparkles} disabled={isCheckingOut}>
                        {isCheckingOut ? 'Loading...' : 'Upgrade to Pro'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Catalog & Plan Comparison */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#17211D]">Choose the Right Plan for Your Research</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((p) => {
                const isCurrent = subscription?.plan === p.key;
                return (
                  <div
                    key={p.key}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                      p.popular
                        ? 'border-[#1F5E4B] bg-[#FAFBF9] shadow-sm relative'
                        : 'border-[#E2E7E3] bg-white'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1F5E4B] text-white text-[10px] font-bold tracking-wide uppercase">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#17211D] text-lg">{p.name}</h4>
                        <p className="text-xs text-[#6B756F] leading-relaxed">{p.description}</p>
                      </div>

                      <div className="pt-2">
                        <span className="text-3xl font-extrabold text-[#17211D]">{p.priceFormatted}</span>
                        {p.interval !== 'forever' && (
                          <span className="text-xs text-[#6B756F]"> / {p.interval}</span>
                        )}
                      </div>

                      <ul className="space-y-2 pt-2 border-t border-[#E2E7E3]/60">
                        {p.featureList.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#17211D]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5E4B] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      {isCurrent ? (
                        <Button variant="outline" size="sm" className="w-full bg-[#E2E7E3]/30 cursor-default" disabled>
                          Current Plan
                        </Button>
                      ) : p.key === 'free' ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Default Free Tier
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          disabled={isCheckingOut}
                          onClick={() => handleUpgrade(p.key)}
                          rightIcon={ArrowRight}
                        >
                          {isCheckingOut ? 'Opening Checkout...' : `Upgrade to ${p.name}`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment &amp; Invoice History</CardTitle>
              <CardDescription>Past billing transactions and verified gateway receipts</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-xs text-[#6B756F] py-4 text-center">No payment history recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E7E3] text-[#6B756F]">
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Order / Reference</th>
                        <th className="py-2.5 px-3 font-semibold">Amount</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E7E3]/60">
                      {payments.map((pay) => (
                        <tr key={pay.id}>
                          <td className="py-3 px-3 text-[#17211D]">
                            {new Date(pay.paidAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#6B756F]">
                            {pay.paymentId || pay.orderId || 'Direct'}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#17211D]">
                            ₹{pay.amount} {pay.currency}
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={pay.status === 'captured' ? 'primary' : 'warning'}>
                              {pay.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Usage & Quotas */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly AI &amp; Research Quotas</CardTitle>
                  <CardDescription>Real-time tracked usage against your active plan limits.</CardDescription>
                </div>
                {usageData && (
                  <Badge variant="primary" className="text-xs">
                    Plan: {usageData.user.planName}
                  </Badge>
                )}
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

      {/* 5. Data & Privacy */}
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
                  Download a structured JSON archive containing your notebooks, sources metadata, subscriptions, saved insights, bookmarks, and research sessions.
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
                  Cascading deletion of all subscriptions, vector embeddings, documents, chats, study tools, research sessions, and account credentials.
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

      {/* Subscription Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Subscription?"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isCanceling}
              onClick={handleCancelSubscription}
              leftIcon={isCanceling ? Loader2 : XCircle}
            >
              {isCanceling ? 'Canceling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm text-[#17211D]">
          <p>
            Are you sure you want to cancel your <strong>{subscription?.planName}</strong> subscription?
          </p>
          <p className="text-xs text-[#6B756F] leading-relaxed">
            Your Pro features will remain active until the end of your current billing period ({subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'cycle'}). You will not be charged again.
          </p>
        </div>
      </Modal>

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
                All your subscriptions, notebooks, documents, vector chunks, chat sessions, research sessions, and personal memories will be permanently removed.
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
