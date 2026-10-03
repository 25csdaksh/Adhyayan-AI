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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';

export const LandingPage = () => {
  const [activePreviewTab, setActivePreviewTab] = useState('chat');

  const capabilities = [
    {
      title: 'Grounded in Your Own Material',
      description: 'Upload textbooks, lecture PDFs, docx notes, or documentation links. Adhyayan-AI answers exclusively using your uploaded sources, eliminating hallucinations.',
      icon: ShieldCheck,
      badge: 'Zero Hallucinations',
    },
    {
      title: 'Inline Source Citations',
      description: 'Every statement is backed by an exact citation pointing directly to the source document and page number for effortless academic verification.',
      icon: Quote,
      badge: 'Page-level Citations',
    },
    {
      title: 'Automated Study Studio',
      description: 'Turn dense chapters into executive summaries, structured study guides, active recall flashcards, and self-assessment quizzes in seconds.',
      icon: Sparkles,
      badge: 'Study Aids',
    },
    {
      title: 'Multi-Source Synthesis',
      description: 'Connect disparate lecture slides, research papers, and web articles into a single unified knowledge graph for comprehensive analysis.',
      icon: Layers,
      badge: 'Multi-Modal',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Study Materials',
      description: 'Drop your course PDFs, lecture slides, research papers, or paste web URLs into a topic notebook.',
      icon: UploadCloud,
    },
    {
      step: '02',
      title: 'Intelligent Source Indexing',
      description: 'Adhyayan-AI chunks, structures, and embeds your documents into high-dimensional vector search indices.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Ask & Deep Dive',
      description: 'Ask complex questions, clarify difficult concepts, and get comprehensive answers with strict source citations.',
      icon: Search,
    },
    {
      step: '04',
      title: 'Synthesize & Master',
      description: 'Generate flashcards, take practice quizzes, and review auto-generated outlines before your exams.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F6] text-[#17211D]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F2EE] border border-[#D8E9E2] text-[#1F5E4B] text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic AI Research &amp; Study Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17211D] tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Your knowledge, <br className="hidden sm:inline" />
            <span className="text-[#1F5E4B] underline decoration-[#D6A84F] decoration-wavy decoration-2 underline-offset-8">
              one intelligent notebook.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#6B756F] max-w-2xl mx-auto leading-relaxed">
            Upload your study material, ask questions, and learn from your own sources. Grounded AI answers, page-level citations, and automated study tools.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link to="/dashboard">
              <Button variant="primary" size="lg" rightIcon={ArrowRight} className="shadow-md shadow-[#1F5E4B]/20">
                Create your notebook
              </Button>
            </Link>
            <Link to="/notebooks/cn-unit-1">
              <Button variant="outline" size="lg">
                Explore workspace
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B756F]">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#1F5E4B]" /> Strict Source Grounding
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#1F5E4B]" /> Page-Level Citations
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#1F5E4B]" /> Zero Data Leakage
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Workspace Preview */}
      <section id="workspace-preview" className="py-16 sm:py-20 bg-white border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="forest" size="md">Workspace Experience</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D] mt-3">
              Designed for serious researchers and students
            </h2>
            <p className="text-sm sm:text-base text-[#6B756F] mt-2">
              A 3-panel intelligent workspace that unifies your source documents, conversational reasoning, and synthesized study aids.
            </p>
          </div>

          {/* Interactive Workspace Mockup Frame */}
          <div className="rounded-2xl border border-[#E2E7E3] bg-[#F7F8F6] p-2 sm:p-4 shadow-xl overflow-hidden max-w-5xl mx-auto">
            {/* Mock Topbar */}
            <div className="bg-white rounded-xl border border-[#E2E7E3] p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-bold text-[#17211D]">Computer Networks • Unit 1 &amp; 2 Workspace</span>
              </div>
              <Badge variant="forest" size="sm" dot>5 Sources Active</Badge>
            </div>

            {/* 3 Panel Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[380px]">
              {/* Left: Sources Mock */}
              <div className="md:col-span-3 bg-white rounded-xl border border-[#E2E7E3] p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDF1EE]">
                  <span className="text-xs font-bold text-[#17211D]">Sources (5)</span>
                  <span className="text-[10px] text-[#1F5E4B] font-semibold">+ Add</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] text-xs space-y-1">
                  <p className="font-semibold truncate text-[#17211D]">Kurose_Ross_Ch1-4.pdf</p>
                  <p className="text-[10px] text-[#6B756F]">142 pages • Ready</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] text-xs space-y-1">
                  <p className="font-semibold truncate text-[#17211D]">TCP_RFC5681.docx</p>
                  <p className="text-[10px] text-[#6B756F]">24 pages • Ready</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3] text-xs space-y-1">
                  <p className="font-semibold truncate text-[#17211D]">https://ietf.org/rfc793</p>
                  <p className="text-[10px] text-[#6B756F]">Web Source • Ready</p>
                </div>
              </div>

              {/* Center: Chat Mock */}
              <div className="md:col-span-6 bg-white rounded-xl border border-[#E2E7E3] p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F7F8F6] text-[#17211D] max-w-[85%] self-end ml-auto">
                    How does TCP Fast Retransmit trigger?
                  </div>
                  <div className="p-3 rounded-xl bg-[#E8F2EE]/60 border border-[#D8E9E2] text-[#17211D] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#1F5E4B] font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" /> Adhyayan-AI Grounded Response
                    </div>
                    <p className="leading-relaxed">
                      TCP Fast Retransmit is triggered upon receiving <strong>3 duplicate ACKs</strong> (4 identical ACKs total). The sender retransmits without waiting for the RTO timer to expire.
                    </p>
                    <div className="pt-2 border-t border-[#D8E9E2] flex items-center gap-1 text-[10px] text-[#1F5E4B] font-semibold">
                      <Quote className="w-3 h-3" /> Kurose_Ross_Ch1-4.pdf • Page 18
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDF1EE]">
                  <div className="p-2 bg-[#F7F8F6] rounded-xl border border-[#E2E7E3] text-xs text-[#8E9993] flex items-center justify-between">
                    <span>Ask a question about your sources...</span>
                    <span className="w-6 h-6 rounded-lg bg-[#1F5E4B] text-white flex items-center justify-center text-[10px]">↵</span>
                  </div>
                </div>
              </div>

              {/* Right: Studio Mock */}
              <div className="md:col-span-3 bg-white rounded-xl border border-[#E2E7E3] p-3 space-y-2">
                <div className="pb-2 border-b border-[#EDF1EE]">
                  <span className="text-xs font-bold text-[#17211D]">Study Studio</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF4E8] border border-[#F2E4C2] text-xs space-y-1">
                  <p className="font-bold text-[#8A671D]">Quiz Available</p>
                  <p className="text-[10px] text-[#8A671D]">3 practice questions generated</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#E8F2EE] border border-[#D8E9E2] text-xs space-y-1">
                  <p className="font-bold text-[#1F5E4B]">Summary Ready</p>
                  <p className="text-[10px] text-[#1F5E4B]">4 key takeaways compiled</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F2F5F3] border border-[#E2E7E3] text-xs space-y-1">
                  <p className="font-bold text-[#17211D]">Flashcards</p>
                  <p className="text-[10px] text-[#6B756F]">4 active recall cards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="accent" size="md">Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D] mt-3">
              How Adhyayan-AI accelerates your learning
            </h2>
            <p className="text-sm sm:text-base text-[#6B756F] mt-2">
              From raw course documents to deep understanding in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-6 relative flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] border border-[#D8E9E2] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono font-bold text-lg text-[#BAC5C0]">{item.step}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#17211D]">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="py-16 sm:py-20 bg-white border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="forest" size="md">Capabilities</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D] mt-3">
              Grounded AI built for academic rigor
            </h2>
            <p className="text-sm sm:text-base text-[#6B756F] mt-2">
              Unlike generic chatbots that guess, Adhyayan-AI relies strictly on your materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <Card key={idx} className="p-6 sm:p-7 space-y-3 border-[#E2E7E3] hover:border-[#1F5E4B] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="forest" size="sm">{cap.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-[#17211D]">{cap.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed">
                    {cap.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Study Tools Showcase */}
      <section id="study-tools" className="py-16 sm:py-20 border-b border-[#E2E7E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="accent" size="md">Study Studio</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D] mt-3 max-w-2xl mx-auto">
            Comprehensive study artifacts generated in one click
          </h2>
          <p className="text-sm sm:text-base text-[#6B756F] mt-2 max-w-xl mx-auto">
            Stop manually making flashcards and study guides. Let Adhyayan-AI synthesize your notes automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-left">
            <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17211D]">Executive Summaries</h3>
              <p className="text-xs text-[#6B756F] leading-relaxed">
                Extracts the highest yield takeaways, formulas, and definitions from multi-hundred-page textbooks.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E8] text-[#8A671D] flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17211D]">Interactive Quizzes</h3>
              <p className="text-xs text-[#6B756F] leading-relaxed">
                Generates rigorous multiple-choice questions with step-by-step explanations and source citations.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E2E7E3] space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F2EE] text-[#1F5E4B] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17211D]">Active Recall Decks</h3>
              <p className="text-xs text-[#6B756F] leading-relaxed">
                Interactive digital flashcard decks ready for spaced repetition testing before exams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#1F5E4B] to-[#174638] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to experience intelligent, source-grounded research?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Create your first study notebook today and turn dense academic materials into your personal research assistant.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="accent" size="lg" rightIcon={ArrowRight} className="shadow-lg">
                Create your notebook
              </Button>
            </Link>
            <Link to="/notebooks/cn-unit-1">
              <Button variant="outline" size="lg" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white">
                Explore workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};
