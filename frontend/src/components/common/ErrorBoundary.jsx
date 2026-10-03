import React from 'react';
import { AlertCircle, RefreshCw, LogOut, Home } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[StudyLM Runtime Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    tokenStorage.removeToken();
    window.location.href = '/login';
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8F6] p-6 text-[#17211D]">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E2E7E3] p-8 shadow-lg text-center space-y-6 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#17211D]">Something went wrong</h2>
              <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed">
                An unexpected UI rendering error occurred. You can reload the workspace or reset your session.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-left text-xs font-mono text-rose-800 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F5E4B] text-white text-xs font-semibold hover:bg-[#174638] shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E7E3] text-[#17211D] text-xs font-semibold hover:bg-[#F2F5F3] transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset &amp; Log In</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
