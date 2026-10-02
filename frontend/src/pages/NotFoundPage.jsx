import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#E8F2EE] border border-[#D8E9E2] text-[#1F5E4B] flex items-center justify-center mb-6 shadow-2xs">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#17211D] tracking-tight">404</h1>
      <h2 className="text-lg sm:text-xl font-bold text-[#17211D] mt-2">Study Resource Not Found</h2>
      <p className="text-xs sm:text-sm text-[#6B756F] mt-2 max-w-md leading-relaxed">
        The requested notebook or page does not exist or has been relocated within the StudyLM workspace.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" leftIcon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
