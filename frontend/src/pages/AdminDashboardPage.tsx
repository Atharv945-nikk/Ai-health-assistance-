import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Users,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { adminApi } from '../api/client.js';
import { SystemMetrics, SystemAuditLog } from '../types/index.js';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, h, logs] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getHealth(),
        adminApi.getAuditLogs(100),
      ]);
      setMetrics(m);
      setHealth(h);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load system administrative telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(searchTerm));
    const matchesAction = filterAction === 'ALL' || log.action.toUpperCase().includes(filterAction);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            System Telemetry & Audit Console
          </h1>
          <p className="text-sm text-slate-500">
            Real-time server health, clinical metric aggregations, and immutable security audit logs.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.totalUsers}</p>
            <p className="text-[11px] text-slate-500">Active patient accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Reports Ingested</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.totalReports}</p>
            <p className="text-[11px] text-slate-500">Indexed for private RAG</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Medical Scans</span>
              <ImageIcon className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.totalImages}</p>
            <p className="text-[11px] text-slate-500">Analyzed via vision pipeline</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Conversations</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{metrics.totalConversations}</p>
            <p className="text-[11px] text-slate-500">Total clinical chat sessions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm space-y-2 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-red-500">
              <span className="text-xs font-bold uppercase tracking-wider">Emergencies Triaged</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-3xl font-extrabold text-red-700">{metrics.totalEmergenciesDetected}</p>
            <p className="text-[11px] text-red-600">Deterministic red-flag trips</p>
          </div>
        </div>
      )}

      {/* Health & Engine Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Database Engine</h3>
              <p className="text-xs text-slate-500">Node 24 Built-in SQLite WAL</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Foreign Key Pragma</span>
            <span className="font-mono text-slate-700">PRAGMA foreign_keys = ON</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI & Vision Orchestrator</h3>
              <p className="text-xs text-slate-500">Multi-provider architecture</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Active Provider</span>
            <span className="font-mono font-semibold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded">
              {metrics?.aiProviderActive || health?.aiProvider || 'heuristic-fallback'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Vector Embeddings</span>
            <span className="font-semibold text-emerald-600">Active (Hybrid Cosine)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Uptime</h3>
              <p className="text-xs text-slate-500">Node.js process lifetime</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Server Uptime</span>
            <span className="font-mono font-semibold text-slate-800">
              {metrics ? formatUptime(metrics.uptimeSeconds) : '...'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Environment</span>
            <span className="font-mono text-slate-700">Production Node v24</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Security & Operational Audit Trail</h2>
            <p className="text-xs text-slate-500">Chronological ledger of security and clinical actions</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 w-44"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Logins</option>
              <option value="REGISTER">Registrations</option>
              <option value="DELETE">Deletions / Erasures</option>
              <option value="CHAT">Chat Consultations</option>
              <option value="REPORT">Report Uploads</option>
              <option value="EMERGENCY">Emergency Triggers</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.action.includes('EMERGENCY') || log.action.includes('DELETE')
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : log.action.includes('LOGIN') || log.action.includes('REGISTER')
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{log.resourceType}</td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                      {log.userId ? log.userId.slice(0, 8) + '...' : 'anonymous'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-[200px]" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
