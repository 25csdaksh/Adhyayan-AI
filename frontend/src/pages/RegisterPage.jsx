import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const isMinLength = password.length >= 8;
  const isMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email.trim()) {
      setFormError('Please provide a valid email address.');
      return;
    }

    if (!isMinLength) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success(`Welcome to Adhyayan-AI, ${user.name}! Your workspace is ready.`, 'Account Created');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F8F6] text-[#17211D]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#1F5E4B] text-white flex items-center justify-center shadow-md shadow-[#1F5E4B]/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-[#17211D] tracking-tight font-sans">Adhyayan-AI</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Create research account
        </h1>
        <p className="text-xs sm:text-sm text-[#6B756F]">
          Get started with your personal source-grounded AI study platform.
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
              label="Full Name"
              type="text"
              placeholder="e.g. Daksh Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError) setFormError('');
              }}
              leftIcon={User}
              required
              autoFocus
            />

            <Input
              label="Academic Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError('');
              }}
              leftIcon={Mail}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17211D]">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-[#6B756F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#17211D]">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-[#6B756F]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full rounded-xl bg-white border border-[#E2E7E3] hover:border-[#BAC5C0] focus:border-[#1F5E4B] focus:ring-1 focus:ring-[#1F5E4B] text-sm text-[#17211D] placeholder:text-[#8E9993] pl-10 pr-4 py-2.5 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Validation Checklist */}
            {password && (
              <div className="p-3 bg-[#FAFBF9] rounded-xl border border-[#EDF1EE] space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-600' : 'text-[#8E9993]'}`}
                  />
                  <span className={isMinLength ? 'text-emerald-800 font-medium' : 'text-[#6B756F]'}>
                    Minimum 8 characters
                  </span>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-600' : 'text-rose-500'}`}
                    />
                    <span className={isMatch ? 'text-emerald-800 font-medium' : 'text-rose-600'}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              className="w-full shadow-sm mt-2"
              rightIcon={ArrowRight}
            >
              Create Account &amp; Launch Studio
            </Button>
          </form>

          <div className="pt-2 border-t border-[#EDF1EE] text-center text-xs text-[#6B756F]">
            Already have an account?{' '}
            <Link
              to={`/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
              className="font-semibold text-[#1F5E4B] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Card>

        {/* Security Footnote */}
        <p className="mt-6 text-center text-[11px] text-[#8E9993] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F5E4B]" />
          Bcrypt-hashed passwords &amp; isolated user workspaces
        </p>
      </div>
    </div>
  );
};
