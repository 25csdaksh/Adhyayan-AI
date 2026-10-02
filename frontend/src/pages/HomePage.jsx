import React, { useState, useEffect } from 'react';
import { healthService } from '../api/healthService';
import { StatusBadge } from '../components/common/StatusBadge';
import { Loader } from '../components/common/Loader';
import {
  Server,
  Database,
  Layers,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthService.getHealth();
      setHealth(response.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const stackItems = [
    { title: 'Frontend Framework', value: 'React 19 + Vite', icon: Layers, color: 'text-cyan-400' },
    { title: 'Styling & Design', value: 'Tailwind CSS v4', icon: Zap, color: 'text-indigo-400' },
    { title: 'Backend Runtime', value: 'Node.js + Express', icon: Server, color: 'text-emerald-400' },
    { title: 'Database Engine', value: 'MongoDB Atlas', icon: Database, color: 'text-amber-400' },
  ];

  const roadmapPhases = [
    { phase: 'Phase 01', name: 'Project Foundation', status: 'Completed', desc: 'Monorepo architecture, Express server, Vite client, CORS, error handling & health checks.' },
    { phase: 'Phase 02', name: 'Authentication & Security', status: 'Upcoming', desc: 'JWT user authentication, password hashing with bcrypt, protected routes.' },
    { phase: 'Phase 03', name: 'Notebooks & Document Ingestion', status: 'Upcoming', desc: 'Document upload (PDF/DOCX/TXT), Cloudinary storage, web URL scraping.' },
    { phase: 'Phase 04', name: 'Vector Search & Gemini RAG', status: 'Upcoming', desc: 'MongoDB Atlas Vector Search embeddings and Gemini grounded Q&A with citations.' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-slate-800 p-8 sm:p-10 shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> StudyLM Architectural Foundation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Mini NotebookLM-style AI Study & Research Platform
          </h1>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            A production-ready foundation designed for grounded AI research, document synthesis, and multi-source notebook intelligence.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Link
              to="/notebooks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
            >
              Explore Notebooks Foundation <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium transition-all duration-150"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              Test API Health
            </button>
          </div>
        </div>
      </section>

      {/* Real-Time Health & Diagnostic Monitor */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Live Backend Diagnostic Monitor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time verification of backend API and MongoDB database state via <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">GET /api/health</code>
            </p>
          </div>
          {lastChecked && (
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Last checked: {lastChecked}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          {loading && !health ? (
            <Loader text="Connecting to backend health endpoint..." />
          ) : error ? (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Backend Service Unreachable</p>
                <p className="text-xs text-rose-300/80">{error}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Ensure the backend is running via <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">npm run dev:backend</code> on port 5000.
                </p>
              </div>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* API Service Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">API Status</span>
                  <StatusBadge status={health.status} label="OPERATIONAL" />
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  {health.service}
                </div>
                <div className="text-xs text-slate-400">
                  Version: <span className="text-slate-200">{health.version}</span>
                </div>
              </div>

              {/* Database State */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Database Status</span>
                  <StatusBadge
                    status={health.database?.state === 'connected' ? 'connected' : 'warning'}
                    label={(health.database?.state || 'unknown').toUpperCase()}
                  />
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-amber-400" />
                  MongoDB
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Host: <span className="text-slate-200">{health.database?.host || 'Local/Atlas'}</span>
                </div>
              </div>

              {/* Server Environment */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Environment</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {health.environment}
                  </span>
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Node {health.system?.nodeVersion}
                </div>
                <div className="text-xs text-slate-400">
                  Memory: <span className="text-slate-200">{health.system?.memoryUsageMB} MB heap</span>
                </div>
              </div>

              {/* Service Uptime */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Uptime</span>
                  <span className="text-xs font-mono text-emerald-400">Active</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {health.uptimeSeconds}s
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Phase: <span className="text-slate-200">{health.phase}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Configured Tech Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700 transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-slate-800/80 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{item.title}</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Roadmap */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Engineering Plan & Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmapPhases.map((phase, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border ${
                phase.status === 'Completed'
                  ? 'border-indigo-500/30 bg-indigo-950/20'
                  : 'border-slate-800/80 bg-slate-900/30 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                  {phase.phase}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    phase.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {phase.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">{phase.name}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{phase.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
