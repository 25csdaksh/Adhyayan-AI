import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success(`Welcome back, ${user.name}!`, 'Signed In');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F8F6] text-[#17211D]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center justify-center group mb-2">
          <BrandLogo size="lg" className="group-hover:scale-105 transition-transform" />
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-[#6B756F]">
          Sign in to access your intelligent notebooks and grounded sources.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 shadow-md border-[#E2E7E3] space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError('');
              }}
              leftIcon={Mail}
              required
              autoFocus
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#17211D]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password recovery will be available in next phase.', 'Coming Soon')}
                  className="text-[11px] font-medium text-[#1F5E4B] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-[#6B756F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full rounded-xl bg-white border border-[#E2E7E3] hover:border-[#BAC5C0] focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B] text-sm text-[#17211D] placeholder:text-[#8E9993] pl-10 pr-10 py-2.5 transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#6B756F] hover:text-[#17211D] p-1 rounded-md cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B756F] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E7E3] text-[#1F5E4B] focus:ring-[#1F5E4B] accent-[#1F5E4B]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              className="w-full shadow-sm mt-2"
              rightIcon={ArrowRight}
            >
              Sign In to Adhyayan-AI
            </Button>
          </form>

          {/* Demo Credentials Quick-Fill Hint */}
          <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#EDF1EE] text-xs text-[#6B756F] space-y-1">
            <p className="font-semibold text-[#17211D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1F5E4B]" /> Quick Test Hint
            </p>
            <p className="text-[11px]">
              Need a quick account? Use the <strong>Register</strong> tab below or create a new student researcher profile.
            </p>
          </div>

          <div className="pt-2 border-t border-[#EDF1EE] text-center text-xs text-[#6B756F]">
            Don't have an account yet?{' '}
            <Link
              to={`/register${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
              className="font-semibold text-[#1F5E4B] hover:underline"
            >
              Create free account
            </Link>
          </div>
        </Card>

        {/* Security Pledge Footnote */}
        <p className="mt-6 text-center text-[11px] text-[#8E9993] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F5E4B]" />
          Zero-leakage encrypted authentication session
        </p>
      </div>
    </div>
  );
};
