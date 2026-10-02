import React, { useState, useEffect } from 'react';
import { healthService } from '../api/healthService';
import {
  Activity,
  Server,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/common/Loader';
import { StatusBadge } from '../components/common/StatusBadge';

export const HealthPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await healthService.getHealth();
      setHealth(res.data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to communicate with backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F5E4B] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Infrastructure Health Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">System Diagnostics</h1>
          <p className="text-xs sm:text-sm text-[#6B756F] mt-1">
            Live health verification of backend Express API and MongoDB Atlas connection via <code className="font-mono bg-[#E8F2EE] px-1.5 py-0.5 rounded text-[#1F5E4B]">GET /api/health</code>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          disabled={loading}
          leftIcon={RefreshCw}
          className={loading ? 'animate-pulse' : ''}
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>

      {loading && !health ? (
        <Card className="p-12 text-center">
          <Loader text="Connecting to backend health service..." />
        </Card>
      ) : error ? (
        <Card className="p-6 border-rose-200 bg-rose-50/50">
          <div className="flex items-start gap-4 text-rose-800">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-bold text-base">Backend Health Service Unreachable</h3>
              <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
              <p className="text-xs text-[#6B756F] pt-2">
                Make sure the backend is started via <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2E7E3] text-[#17211D]">npm run dev:backend</code> on port 5000.
              </p>
            </div>
          </div>
        </Card>
      ) : health ? (
        <div className="space-y-6">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B756F]">API Service</span>
                <StatusBadge status={health.status} label="OPERATIONAL" />
              </div>
              <p className="text-base font-bold text-[#17211D] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {health.service}
              </p>
              <p className="text-xs text-[#8E9993]">Version: {health.version}</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B756F]">Database</span>
                <StatusBadge
                  status={health.database?.state === 'connected' ? 'connected' : 'warning'}
                  label={(health.database?.state || 'unknown').toUpperCase()}
                />
              </div>
              <p className="text-base font-bold text-[#17211D] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#D6A84F]" />
                MongoDB Atlas
              </p>
              <p className="text-xs text-[#8E9993] truncate">Host: {health.database?.host || '127.0.0.1'}</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B756F]">Runtime</span>
                <Badge variant="forest" size="sm">{health.environment}</Badge>
              </div>
              <p className="text-base font-bold text-[#17211D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1F5E4B]" />
                Node {health.system?.nodeVersion}
              </p>
              <p className="text-xs text-[#8E9993]">Memory: {health.system?.memoryUsageMB} MB</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B756F]">Uptime</span>
                <span className="text-xs font-mono text-emerald-600 font-bold">Active</span>
              </div>
              <p className="text-base font-bold text-[#17211D] font-mono">
                {health.uptimeSeconds}s
              </p>
              <p className="text-xs text-[#8E9993] truncate">{health.phase}</p>
            </Card>
          </div>

          {/* Raw JSON Diagnostic Inspector */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Health Payload</CardTitle>
              <CardDescription>Response returned by backend Express health controller.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-xl bg-[#FAFBF9] border border-[#E2E7E3] text-xs font-mono text-[#17211D] overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
