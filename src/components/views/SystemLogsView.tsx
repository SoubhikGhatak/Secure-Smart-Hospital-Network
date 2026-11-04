import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  Radio,
  Layers,
  GitFork,
  Server
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { SystemLog } from '../../types/network';

export const SystemLogsView: React.FC = () => {
  const {
    systemLogs,
    clearLogs,
    exportLogsCsv
  } = useNetwork();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.sourceDevice && log.sourceDevice.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.destDevice && log.destDevice.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.ip && log.ip.includes(searchQuery));
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (severity: SystemLog['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              System Logs & Security Event Audit Repository
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Centralized syslogs capturing DHCP DORA handshakes, inter-VLAN routing decisions,
            ACL packet drops, DNS lookups, and simulated hardware configuration changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsCsv}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Download audit logs as CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/80 flex items-center gap-1.5 transition cursor-pointer"
            title="Clear all log entries"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event logs by device, IP, keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="ACL">ACL (Security Drops)</option>
            <option value="DHCP">DHCP (Leases)</option>
            <option value="ROUTING">ROUTING (Inter-VLAN)</option>
            <option value="PING">PING (Diagnostics)</option>
            <option value="DNS">DNS (Queries)</option>
            <option value="SERVER">SERVER (Clinical/Backup)</option>
            <option value="VLAN">VLAN (Segments)</option>
            <option value="DEVICE">DEVICE (Endpoints)</option>
            <option value="CONFIG">CONFIG (System)</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="INFO">INFO Only</option>
            <option value="WARNING">WARNING Only</option>
            <option value="CRITICAL">CRITICAL Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              System Audit Trail
            </h3>
            <span className="text-xs text-slate-500 font-mono">({filteredLogs.length} Events Matching)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Buffer Capacity: 200 Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Source Host</th>
                <th className="py-3 px-4">Target / IP</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No log events found matching the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                      {log.sourceDevice || 'System'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-xs whitespace-nowrap">
                      {log.destDevice || log.ip || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed text-xs">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Logs Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-base text-white">Clear Event Log Repository?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will purge all recorded DHCP, routing, ACL, and diagnostic audit logs from the browser's local memory.
              A fresh initialization log will be appended.
            </p>
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
