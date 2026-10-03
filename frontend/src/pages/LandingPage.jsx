import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);

  const capabilities = [
    {
      title: 'Zero-Hallucination Grounding',
      description: 'Upload textbooks, lecture PDFs, research papers, or documentation links. AdhyayanLM answers exclusively using your uploaded sources, eliminating hallucinations entirely.',
      icon: ShieldCheck,
      badge: 'Academic Authority',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-700 bg-emerald-50',
    },
    {
      title: 'Verifiable Page-Level Citations',
      description: 'Every statement and formula is backed by an exact citation pointing directly to the source document and page number for effortless academic verification.',
      icon: Quote,
      badge: 'Instant Verification',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-700 bg-blue-50',
    },
    {
      title: '4-in-1 Automated Study Studio',
      description: 'Turn dense 200-page chapters into visual hierarchical mind maps, executive summaries, active recall flashcards, and exam-grade quizzes in seconds.',
      icon: Brain,
      badge: 'Automated Synthesis',
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-700 bg-amber-50',
    },
    {
      title: 'Multi-Document Semantic Synthesis',
      description: 'Cross-reference disparate lecture slides, research papers, and web articles into a single high-dimensional knowledge base for comprehensive analysis.',
      icon: Layers,
      badge: 'Multi-Modal RAG',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-700 bg-purple-50',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Course Materials',
      description: 'Drop your textbook PDFs, lecture slides, research notes, or paste web documentation URLs into a dedicated workspace.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'High-Dimension Indexing',
      description: 'AdhyayanLM structures, cleans, and vector-indexes your documents using Google Gemini embeddings for semantic retrieval.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Ask & Deep Dive',
      description: 'Ask complex research questions, clarify difficult concepts, and get comprehensive answers with exact source citations.',
      icon: Search,
    },
    {
      step: '04',
      title: 'Generate Visual Study Aids',
      description: 'Instantly generate hierarchical mind maps, spaced repetition flashcards, and test quizzes to ace your exams.',
      icon: Sparkles,
    },
  ];

  const comparisonPoints = [
    {
      feature: 'Factual Accuracy & Reliability',
      generic: 'Prone to hallucinations, fabricates facts, assumes unverified data',
      adhyayan: '100% strictly grounded in your uploaded textbooks & notes',
    },
    {
      feature: 'Source Citation Verification',
      generic: 'No citations or fabricated imaginary reference links',
      adhyayan: 'Direct clickable citations mapping to exact source & page numbers',
    },
    {
      feature: 'Built-in Study Tools',
      generic: 'Requires complex manual prompting & formatting',
      adhyayan: '1-Click Mind Maps, Interactive Flashcards, Quizzes & Dossiers',
    },
    {
      feature: 'Data Privacy & Isolation',
      generic: 'Data often used for public model training',
      adhyayan: '100% private, isolated vector indices with strict security guards',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-700 selection:text-white">
      <LandingNavbar />

      {/* Hero Section with Ambient Glow & Modern SaaS Depth */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9]">
        {/* Subtle Ambient Glow Mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs hover:border-emerald-300 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Next-Gen Academic Research &amp; Study Platform • Powered by Gemini 3.5</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12] sm:leading-[1.15]">
            Turn Complex Textbooks into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
              Instant, Verified Intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload lecture slides, PDFs, notes, and web sources. AdhyayanLM synthesizes citation-grounded answers, visual mind maps, active recall flashcards, and exam-grade quizzes with <strong>zero hallucination</strong>.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-7 py-3.5 shadow-xl shadow-emerald-700/25 hover:shadow-emerald-700/35 hover:-translate-y-0.5 transition-all text-sm sm:text-base rounded-xl"
              >
                Get Started Free
              </Button>
            </Link>

            <a href="#workspace-preview">
              <Button
                variant="outline"
                size="lg"
                className="bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm font-semibold px-6 py-3.5 text-sm sm:text-base rounded-xl hover:-translate-y-0.5 transition-all"
              >
                Explore Live Demo
              </Button>
            </a>
          </div>

          {/* Feature Trust Bullets */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Citation Grounding</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Page-Level Provenance</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Private Vector Storage</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PDF, DOCX &amp; Web Support</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Live Workspace Showcase (The Centerpiece) */}
      <section id="workspace-preview" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Interactive Product Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for serious students and researchers
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Experience the 3-panel intelligent studio: source documents on the left, citation-grounded conversational reasoning in the center, and automated study aids on the right.
            </p>
          </div>

          {/* Interactive Feature Demo Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'chat', label: '💬 Grounded RAG Chat', icon: Search },
              { id: 'mindmap', label: '🧠 Concept Mind Map', icon: Brain },
              { id: 'flashcards', label: '🗂️ Active Recall Cards', icon: Layers },
              { id: 'quiz', label: '🎯 Self-Assessment Quiz', icon: FileQuestion },
              { id: 'summary', label: '📝 Executive Dossier', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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

          {/* Realistic Window Mockup Frame */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-900/5 p-2 sm:p-4 shadow-2xl shadow-slate-900/10 max-w-5xl mx-auto overflow-hidden">
            {/* Window Top Controls Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 mb-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-bold text-slate-800 truncate">
                  Computer Networks • Unit 1 &amp; 2 Comprehensive Research
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  4 Sources Grounded
                </span>
              </div>
            </div>

            {/* 3 Panel Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[420px]">
              {/* Left Column: Uploaded Sources */}
              <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sources (4)</span>
                    <span className="text-[11px] text-emerald-700 font-bold cursor-pointer hover:underline">+ Add</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1 hover:border-emerald-500/40 transition-colors">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kurose_Ross_Ch1-4.pdf</span>
                    </p>
                    <p className="text-[10px] text-slate-500">142 pages • Vector Indexed</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1 hover:border-emerald-500/40 transition-colors">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>TCP_Congestion_Control.pdf</span>
                    </p>
                    <p className="text-[10px] text-slate-500">28 pages • Ready</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1 hover:border-emerald-500/40 transition-colors">
                    <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>https://ietf.org/rfc793</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Web RFC Standard • Ready</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Grounding: <strong className="text-emerald-700">Strict</strong></span>
                  <span className="text-emerald-700 font-bold">100% Verified</span>
                </div>
              </div>

              {/* Center Column: Live Feature Dynamic Display */}
              <div className="md:col-span-9 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4">
                {activeTab === 'chat' && (
                  <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
                    <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 max-w-[85%] self-end ml-auto font-medium">
                      How does TCP Fast Retransmit trigger and why is it faster than timeout?
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>AdhyayanLM Grounded Synthesis</span>
                      </div>
                      <p className="leading-relaxed">
                        TCP Fast Retransmit triggers upon receiving <strong>3 duplicate ACKs</strong> (4 identical ACKs total for the same segment). Instead of idling and waiting for the retransmission timeout (RTO) to expire, the sender immediately retransmits the missing segment, preventing connection stalls and maintaining high throughput.
                      </p>
                      <div className="pt-2.5 border-t border-emerald-200 flex flex-wrap items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center gap-1">
                          <Quote className="w-3 h-3" /> Kurose_Ross_Ch1-4.pdf • Page 18
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center gap-1">
                          <Quote className="w-3 h-3" /> TCP_Congestion_Control.pdf • Page 6
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'mindmap' && (
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

                {activeTab === 'flashcards' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Active Recall Deck • Card 1 of 8</span>
                      </span>
                      <span className="text-xs text-slate-500">Click to flip</span>
                    </div>

                    <div
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-center min-h-[160px] flex flex-col items-center justify-center space-y-3 ${
                        flashcardFlipped
                          ? 'bg-blue-50/80 border-blue-300 text-blue-950'
                          : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
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

                {activeTab === 'quiz' && (
                  <div className="space-y-3 animate-in fade-in duration-150 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 text-purple-600" />
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

                {activeTab === 'summary' && (
                  <div className="space-y-3 animate-in fade-in duration-150 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>Executive Dossier Summary: Chapter 3 Key Takeaways</span>
                      </span>
                      <Badge variant="forest" size="sm">Grounded</Badge>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <p className="font-bold text-amber-950">1. Multiplexing &amp; Demultiplexing</p>
                        <p className="text-[11px] text-slate-600">Sockets use port numbers and IP headers to steer segments to the right process.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <p className="font-bold text-emerald-950">2. Congestion Window (cwnd) Dynamics</p>
                        <p className="text-[11px] text-slate-600">Grows exponentially in Slow Start, linearly in Congestion Avoidance, drops on loss.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Bar Placeholder */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 flex items-center justify-between">
                    <span>Ask a research question or generate study tools...</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1">
                      <span>Ask AI</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="capabilities" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Core Superpowers
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Grounded AI built for academic rigor
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Unlike generic chatbots that guess or make up citations, AdhyayanLM relies strictly on your materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-200 space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform ${cap.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix (Why AdhyayanLM) */}
      <section id="comparison" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Direct Comparison
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why students &amp; researchers choose AdhyayanLM
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              See how AdhyayanLM outperforms generic chatbots for academic study and research.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="grid grid-cols-12 bg-slate-900 text-white p-4 font-bold text-xs sm:text-sm">
              <div className="col-span-4">Feature / Capability</div>
              <div className="col-span-4 text-rose-300">Generic AI / ChatGPT</div>
              <div className="col-span-4 text-emerald-300 font-extrabold">AdhyayanLM AI Studio</div>
            </div>

            <div className="divide-y divide-slate-100">
              {comparisonPoints.map((pt, i) => (
                <div key={i} className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center bg-white hover:bg-slate-50/80 transition-colors">
                  <div className="col-span-4 font-bold text-slate-900">{pt.feature}</div>
                  <div className="col-span-4 text-slate-500 pr-2 flex items-start gap-1.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{pt.generic}</span>
                  </div>
                  <div className="col-span-4 font-semibold text-emerald-900 flex items-start gap-1.5 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{pt.adhyayan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-slate-200/80 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Four Simple Steps
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How AdhyayanLM accelerates your learning
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
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-4"
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

      {/* Call To Action Banner */}
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

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
