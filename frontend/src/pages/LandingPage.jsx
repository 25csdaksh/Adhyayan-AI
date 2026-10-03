import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  Layers,
  HelpCircle,
  Quote,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
  Brain,
  FileQuestion,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Play,
  GraduationCap,
  Users,
  Clock,
  Send,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { BrandLogo } from '../components/common/BrandLogo';
import { CinematicVideoIntro } from '../components/common/CinematicVideoIntro';
import { LandingFooter } from '../components/layout/LandingFooter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  // 5-second cinematic brand intro on site load
  const [showIntro, setShowIntro] = useState(true);

  const [activeSimulatorTab, setActiveSimulatorTab] = useState('chat');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Please fill out all fields.');
      return;
    }
    setContactSubmitted(true);
    toast.success('Thank you for reaching out! Our academic team will connect with you shortly.', 'Message Sent');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  // 6 Core Features
  const features = [
    {
      title: 'Zero-Hallucination Grounding',
      description: 'Upload textbooks, lecture PDFs, research papers, or web links. Adhyayan LM answers strictly using your uploaded sources with zero speculation.',
      icon: ShieldCheck,
      badge: 'Academic Authority',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-700 bg-emerald-50',
    },
    {
      title: 'Verifiable Page-Level Citations',
      description: 'Every statement and theorem points directly to the source document title and exact page number for effortless citation verification.',
      icon: Quote,
      badge: 'Instant Proof',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-700 bg-blue-50',
    },
    {
      title: 'Automated Concept Mind Maps',
      description: 'Convert dense multi-chapter PDFs into clear, hierarchical visual knowledge maps that illustrate relationships between complex topics.',
      icon: Brain,
      badge: 'Visual Synthesis',
      gradient: 'from-teal-500/10 to-emerald-500/10',
      iconColor: 'text-teal-700 bg-teal-50',
    },
    {
      title: 'Active Recall Flashcards',
      description: 'Instantly generate question-and-answer flashcard decks with flip animations designed for optimal spaced repetition exam prep.',
      icon: Layers,
      badge: 'Spaced Repetition',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-700 bg-purple-50',
    },
    {
      title: 'Exam-Grade Practice Quizzes',
      description: 'Generate rigorous self-assessment multiple choice quizzes with instant step-by-step explanations and source references.',
      icon: FileQuestion,
      badge: 'Test Readiness',
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-700 bg-amber-50',
    },
    {
      title: 'Executive Dossier Summaries',
      description: 'Synthesize multi-hundred-page textbooks and research articles into structured executive summaries, formulas, and key definitions.',
      icon: FileText,
      badge: 'Executive Briefs',
      gradient: 'from-indigo-500/10 to-blue-500/10',
      iconColor: 'text-indigo-700 bg-indigo-50',
    },
  ];

  // Academic Disciplines / Courses
  const academicDisciplines = [
    { name: 'Computer Science & Engineering', icon: Cpu, items: ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'AI & Machine Learning'] },
    { name: 'Medicine & Life Sciences', icon: Brain, items: ['Human Anatomy', 'Pathology & Pharmacology', 'Genetics', 'Biomedical Engineering'] },
    { name: 'Business, Finance & Economics', icon: TrendingUp, items: ['Macroeconomics', 'Corporate Finance', 'Strategic Management', 'Econometrics'] },
    { name: 'Law, Policy & Humanities', icon: Award, items: ['Constitutional Law', 'International Relations', 'Ethics & Philosophy', 'Legal Research'] },
    { name: 'Mathematics & Data Science', icon: Database, items: ['Linear Algebra', 'Multivariate Calculus', 'Probability & Statistics', 'Deep Neural Networks'] },
    { name: 'Physical & Natural Sciences', icon: Globe, items: ['Quantum Mechanics', 'Organic Chemistry', 'Thermodynamics', 'Astrophysics'] },
  ];

  // 4 Steps Workflow
  const steps = [
    {
      step: '01',
      title: 'Ingest Course Materials',
      description: 'Drag and drop course syllabus PDFs, lecture slides, research papers, or paste web documentation URLs.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Semantic Vector Indexing',
      description: 'Adhyayan LM chunks and embeds your materials into an isolated vector index using Google Gemini embeddings.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Inquire & Explore with AI',
      description: 'Ask complex research questions and receive multi-source answers backed by exact page-level citations.',
      icon: Search,
    },
    {
      step: '04',
      title: 'Synthesize & Master Knowledge',
      description: 'Generate visual mind maps, flashcard decks, and practice tests to master topics and ace your exams.',
      icon: Sparkles,
    },
  ];

  // Testimonials
  const testimonials = [
    {
      quote: 'Adhyayan LM changed how I study for my computer science exams. Uploading Kurose & Ross and getting citation-grounded mind maps and quizzes saved me 15+ hours every week.',
      name: 'Aarav Sharma',
      role: 'B.Tech Computer Science Senior',
      institution: 'IIT Delhi',
    },
    {
      quote: 'The page-level citations give me complete confidence that the AI is not making up medical facts. It is the only AI tool I trust for clinical research synthesis.',
      name: 'Dr. Priya Patel',
      role: 'Biomedical Research Fellow',
      institution: 'All India Institute of Medical Sciences',
    },
    {
      quote: 'Being able to turn 80-page case law PDFs into interactive active recall decks in one click is pure magic. Adhyayan LM is essential for serious academic work.',
      name: 'Rohan Mehta',
      role: 'LL.M Candidate',
      institution: 'National Law School',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-700 selection:text-white relative">
      {/* 5-Second Cinematic Brand Intro Animation on site load */}
      {showIntro && (
        <CinematicVideoIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* Sticky Modern Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group py-2">
              <BrandLogo size="lg" className="h-11 sm:h-12 w-auto max-w-[210px] object-contain group-hover:scale-[1.03] transition-transform" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
              <a href="#hero" className="hover:text-emerald-700 transition-colors">Home</a>
              <a href="#about" className="hover:text-emerald-700 transition-colors">About</a>
              <a href="#features" className="hover:text-emerald-700 transition-colors">Features</a>
              <a href="#simulator" className="hover:text-emerald-700 transition-colors">Learning Studio</a>
              <a href="#disciplines" className="hover:text-emerald-700 transition-colors">Courses/Services</a>
              <a href="#contact" className="hover:text-emerald-700 transition-colors">Contact</a>
            </nav>

            {/* Action CTAs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIntro(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-600 text-xs font-semibold text-slate-600 hover:text-emerald-800 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-2xs"
                title="Play 5s Cinematic Brand Intro"
              >
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Play Intro (5s)</span>
              </button>

              {isAuthenticated ? (
                <Link to="/dashboard" className="flex items-center gap-2">
                  <Button variant="primary" size="md" rightIcon={ArrowRight} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20">
                    Workspace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-block">
                    <Button variant="ghost" size="md" className="text-slate-700 hover:text-slate-900 font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="md" rightIcon={ArrowRight} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section: "Learn Smarter. Grow Further." */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9]">
        {/* Ambient Mesh Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Adhyayan LM • Modern Intelligent Learning Platform</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1] sm:leading-[1.12]">
            Learn Smarter. <br />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
              Grow Further.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Adhyayan LM is a modern, high-performance learning platform powered by intelligent technology. Master complex textbooks, lecture notes, and research materials with 100% citation-grounded precision.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 shadow-xl shadow-emerald-700/25 hover:shadow-emerald-700/35 hover:-translate-y-0.5 transition-all text-base rounded-2xl"
              >
                Get Started
              </Button>
            </Link>

            <a href="#simulator">
              <Button
                variant="outline"
                size="lg"
                className="bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm font-semibold px-7 py-4 text-base rounded-2xl hover:-translate-y-0.5 transition-all"
              >
                Explore Learning
              </Button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Hallucinations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Page-Level Citations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Private &amp; Secure Vectors</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Mind Maps &amp; Quizzes</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4. Why Adhyayan LM */}
      <section id="about" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Academic Superiority
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Adhyayan LM is Built Different
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Standard chatbots guess and fabricate answers. Adhyayan LM acts as your verified academic copilot, anchoring every response strictly in your uploaded course materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">100% Grounded In Your Syllabus</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adhyayan LM retrieves exclusively from your uploaded textbook pages and lecture slides. If a fact is not in your documents, it never invents it.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Quote className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Direct Page-Number Deep Links</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Click any citation badge to view the exact sentence in your PDF with highlighted evidence, making verification instant for research papers and exam revision.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Automated Visual Synthesis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Beyond text chat, generate structured mind maps, active recall flashcards, and test quizzes in a single click without tedious manual prompting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Features Bento Grid */}
      <section id="features" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Comprehensive AI Toolkit
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Features for Academic Excellence
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Everything you need to digest, comprehend, and master complex study materials in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-200 space-y-4 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform ${item.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-bold text-emerald-700 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. AI-Powered Learning In Action (Interactive Simulator) */}
      <section id="simulator" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Interactive Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Test the AI Learning Studio Live
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Switch between interactive tools below to see how Adhyayan LM analyzes documents in real time.
            </p>
          </div>

          {/* Tool Switcher */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'chat', label: '💬 Grounded RAG Chat', icon: Search },
              { id: 'mindmap', label: '🧠 Concept Mind Map', icon: Brain },
              { id: 'flashcards', label: '🗂️ Active Recall Cards', icon: Layers },
              { id: 'quiz', label: '🎯 Self-Assessment Quiz', icon: FileQuestion },
              { id: 'summary', label: '📝 Executive Dossier', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSimulatorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSimulatorTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Workspace Window */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-900/5 p-2 sm:p-4 shadow-2xl shadow-slate-900/10 max-w-5xl mx-auto overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 mb-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-bold text-slate-800 truncate">
                  Computer Networks • Unit 1 &amp; 2 Workspace
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                4 Sources Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[420px]">
              {/* Left Column: Uploaded Sources */}
              <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sources (4)</span>
                    <span className="text-[11px] text-emerald-700 font-bold">+ Add</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kurose_Ross_Ch1-4.pdf</span>
                    </p>
                    <p className="text-[10px] text-slate-500">142 pages • Ready</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>TCP_Congestion.docx</span>
                    </p>
                    <p className="text-[10px] text-slate-500">28 pages • Ready</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>https://ietf.org/rfc793</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Web RFC Standard</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Grounding: <strong className="text-emerald-700">Strict</strong></span>
                  <span className="text-emerald-700 font-bold">100% Verified</span>
                </div>
              </div>

              {/* Center Column: Live Feature Display */}
              <div className="md:col-span-9 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4">
                {activeSimulatorTab === 'chat' && (
                  <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
                    <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 max-w-[85%] self-end ml-auto font-medium">
                      How does TCP Fast Retransmit trigger and why is it faster than timeout?
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Adhyayan LM Grounded Synthesis</span>
                      </div>
                      <p className="leading-relaxed">
                        TCP Fast Retransmit triggers upon receiving <strong>3 duplicate ACKs</strong> (4 identical ACKs total for the same segment). Instead of idling and waiting for the retransmission timeout (RTO) to expire, the sender immediately retransmits the missing segment, preventing connection stalls and maintaining high throughput.
                      </p>
                      <div className="pt-2.5 border-t border-emerald-200 flex flex-wrap items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center gap-1">
                          <Quote className="w-3 h-3" /> Kurose_Ross_Ch1-4.pdf • Page 18
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center gap-1">
                          <Quote className="w-3 h-3" /> TCP_Congestion.docx • Page 6
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimulatorTab === 'mindmap' && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-emerald-600" />
                        <span>Hierarchical Concept Map: Transport Layer Protocols</span>
                      </span>
                      <Badge variant="forest" size="sm">Auto-Generated</Badge>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs text-slate-700 overflow-x-auto">
                      <div className="font-bold text-emerald-800">Transport Layer</div>
                      <div className="pl-4 border-l-2 border-emerald-300 space-y-2">
                        <div>├── <strong className="text-slate-900">TCP (Transmission Control Protocol)</strong></div>
                        <div className="pl-6 space-y-1 text-[11px] text-slate-600">
                          <div>├── Connection-oriented (3-way handshake)</div>
                          <div>├── Flow Control (Sliding Window)</div>
                          <div>└── Congestion Control (Slow Start, Fast Retransmit, AIMD)</div>
                        </div>
                        <div>└── <strong className="text-slate-900">UDP (User Datagram Protocol)</strong></div>
                        <div className="pl-6 space-y-1 text-[11px] text-slate-600">
                          <div>├── Connectionless &amp; Lightweight</div>
                          <div>└── Used for Real-time Streaming, DNS, VoIP</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimulatorTab === 'flashcards' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>Active Recall Deck • Card 1 of 8</span>
                      </span>
                      <span className="text-xs text-slate-500">Click card to flip</span>
                    </div>

                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-center min-h-[160px] flex flex-col items-center justify-center space-y-3 ${
                        flashcardFlipped
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                          : 'bg-white border-slate-200 shadow-sm hover:border-purple-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {flashcardFlipped ? 'Answer & Explanation' : 'Concept Question'}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-900 max-w-md">
                        {flashcardFlipped
                          ? 'TCP Fast Retransmit retransmits missing packets upon receiving 3 duplicate ACKs without waiting for RTO.'
                          : 'What specific condition triggers TCP Fast Retransmit before the timeout expires?'}
                      </p>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5" /> Tap anywhere to flip
                      </span>
                    </div>
                  </div>
                )}

                {activeSimulatorTab === 'quiz' && (
                  <div className="space-y-3 animate-in fade-in duration-150 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 text-amber-600" />
                        <span>Self-Assessment Question 1</span>
                      </span>
                      <Badge variant="forest" size="sm">Exam Practice</Badge>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Why does TCP require 3 duplicate ACKs before initiating Fast Retransmit rather than just 1 duplicate ACK?
                    </p>

                    <div className="space-y-2">
                      {[
                        { id: 0, text: 'A) To tolerate out-of-order packet arrivals without false retransmissions.', correct: true },
                        { id: 1, text: 'B) Because the receiver cannot send more than 3 ACKs in one window.', correct: false },
                        { id: 2, text: 'C) To allow the router buffer to drain completely.', correct: false },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedQuizOption(opt.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                            selectedQuizOption === opt.id
                              ? opt.correct
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                : 'bg-rose-50 border-rose-300 text-rose-900'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {selectedQuizOption === opt.id && (
                            <span>{opt.correct ? '✅ Correct' : '❌ Incorrect'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSimulatorTab === 'summary' && (
                  <div className="space-y-3 animate-in fade-in duration-150 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Executive Dossier Summary: Chapter 3 Key Takeaways</span>
                      </span>
                      <Badge variant="forest" size="sm">Grounded</Badge>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                        <p className="font-bold text-blue-950">1. Multiplexing &amp; Demultiplexing</p>
                        <p className="text-[11px] text-slate-600">Sockets use port numbers and IP headers to steer segments to the right process.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <p className="font-bold text-emerald-950">2. Congestion Window (cwnd) Dynamics</p>
                        <p className="text-[11px] text-slate-600">Grows exponentially in Slow Start, linearly in Congestion Avoidance, drops on loss.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Interactive Bar */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                    <span>Ask a research query across your documents...</span>
                    <Link to="/register">
                      <span className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-800 transition-colors">
                        <span>Launch Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Academic Disciplines & Services */}
      <section id="disciplines" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Supported Academic Domains
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Every Course &amp; Discipline
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Whether you are analyzing complex mathematical proofs, biochemical pathways, or legal jurisprudence, Adhyayan LM adapts seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicDisciplines.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{d.name}</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {d.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. 4-Step Learning Workflow */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Four Simple Steps
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Adhyayan LM Accelerates Learning
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              From raw course documents to deep understanding in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-extrabold text-lg text-slate-300">{item.step}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Student & Researcher Testimonials */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Academic Proof
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Top University Students &amp; Researchers
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              See why learners choose Adhyayan LM over generic chatbots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                  <p className="text-xs text-emerald-800 font-semibold">{t.role}</p>
                  <p className="text-[11px] text-slate-400">{t.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Contact Section */}
      <section id="contact" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Contact the Adhyayan LM Team
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Have questions about academic deployment, university licenses, or custom syllabus integration? Reach out to us.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
            {contactSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out. A senior academic advisor from the Adhyayan LM team will contact you within 24 hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setContactSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Full Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Prof. or Student Name"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-700"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Academic Inquiry</label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your courses, research topics, or university requirements..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-emerald-700"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  rightIcon={Send}
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 shadow-lg shadow-emerald-700/20"
                >
                  Send Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. High-Impact Call To Action Banner */}
      <section className="py-20 bg-gradient-to-br from-slate-950 via-[#132A22] to-[#1F5E4B] text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white backdrop-blur-md shadow-lg">
            <BookOpen className="w-7 h-7 text-emerald-300" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to master your study materials with grounded AI?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your first study notebook in seconds. Upload textbooks, research papers, and lecture slides with 100% verified citations.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-4 text-base rounded-2xl shadow-xl shadow-emerald-500/30 border-none hover:scale-105 transition-all"
              >
                Create Free Account
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold px-7 py-4 text-base rounded-2xl backdrop-blur-md transition-all"
              >
                Open Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
