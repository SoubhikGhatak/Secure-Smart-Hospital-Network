import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart2,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { TrafficEvent } from '../../types/network';

export const TrafficMonitorView: React.FC = () => {
  const { trafficEvents, generateTrafficBurst } = useNetwork();
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = trafficEvents.filter(e => {
    const matchesProto = protocolFilter === 'all' || e.protocol === protocolFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesProto && matchesStatus;
  });

  // Calculate protocol distributions
  const protoCounts = trafficEvents.reduce((acc, e) => {
    acc[e.protocol] = (acc[e.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allowedCount = trafficEvents.filter(e => e.status === 'ALLOWED').length;
  const blockedCount = trafficEvents.filter(e => e.status === 'BLOCKED').length;
  const totalFlows = trafficEvents.length || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Network Traffic Monitor & Packet Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Live flow inspector across all 6 departmental VLANs. Captures inter-VLAN sessions, Layer-4 protocols,
            packet throughput, and enforcement status by HOSPITAL-R1 security engine.
          </p>
        </div>

        <button
          onClick={generateTrafficBurst}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-2 transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>GENERATE SIMULATED NETWORK TRAFFIC</span>
        </button>
      </div>

      {/* 4 Analytical Visualization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captured Sessions */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Captured Sessions</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-white tabular-nums">
            {trafficEvents.length}
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-mono">Real-time simulation</div>
        </div>

        {/* Permitted Flows */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Permitted Internal Flows</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-emerald-400 tabular-nums">
            {allowedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {Math.round((allowedCount / totalFlows) * 100)}% of total volume
          </div>
        </div>

        {/* Blocked Guest Intrusion Attempts */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Blocked Security Violations</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-rose-400 tabular-nums">
            {blockedCount}
          </div>
          <div className="mt-1 text-[11px] text-rose-400">
            {Math.round((blockedCount / totalFlows) * 100)}% ACL drops
          </div>
        </div>

        {/* Aggregate Transferred Data */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Aggregate Bandwidth</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-cyan-300 tabular-nums">
            {(trafficEvents.reduce((s, e) => s + e.bytes, 0) / (1024 * 1024)).toFixed(2)} MB
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Full payload throughput</div>
        </div>
      </div>

      {/* Protocol Distribution & Allowed vs Blocked Ratio Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold uppercase">Protocol Volume Distribution</span>
            <span className="text-slate-400">Layer 4 / 7 Protocol Breakdown</span>
          </div>

          <div className="space-y-2 pt-2 text-xs font-mono">
            {(['HTTPS', 'HTTP', 'DNS', 'TCP', 'UDP', 'ICMP'] as const).map(p => {
              const count = protoCounts[p] || 0;
              const pct = Math.round((count / totalFlows) * 100);
              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="font-bold">{p}</span>
                    <span className="text-slate-400">{count} sessions ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Verdict Ratio (Allowed vs Denied) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold uppercase">Policy Verdict: Permitted vs Blocked</span>
              <span className="text-cyan-400">GUEST_ISOLATION Filter</span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Allowed Traffic ({allowedCount})
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {Math.round((allowedCount / totalFlows) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(allowedCount / totalFlows) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Blocked Invasions ({blockedCount})
                  </span>
                  <span className="text-rose-300 font-bold">
                    {Math.round((blockedCount / totalFlows) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(blockedCount / totalFlows) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono pt-4 border-t border-slate-800/80 leading-relaxed">
            All attempts from Guest VLAN 50 to access Hospital Servers (VLAN 60) or departmental workstations
            are halted with zero leaks.
          </div>
        </div>
      </div>

      {/* Filterable Recent Traffic Connection Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Real-Time Simulated Packet Stream
            </h3>
            <span className="text-xs text-slate-500 font-mono">({filteredEvents.length} Records)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <select
              value={protocolFilter}
              onChange={e => setProtocolFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Protocols</option>
              <option value="HTTPS">HTTPS</option>
              <option value="HTTP">HTTP</option>
              <option value="DNS">DNS</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="ALLOWED">ALLOWED Only</option>
              <option value="BLOCKED">BLOCKED Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Source Host (VLAN)</th>
                <th className="py-3 px-4">Destination Target (VLAN)</th>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Packets / Bytes</th>
                <th className="py-3 px-4">Policy Verdict</th>
                <th className="py-3 px-4">Evaluation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {evt.timestamp}
                  </td>
                  <td className="py-3 px-4 text-white font-bold">
                    <div>{evt.sourceName}</div>
                    <div className="text-[10px] text-cyan-400 font-normal">
                      {evt.sourceIp} (V{evt.sourceVlan})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">
                    <div>{evt.destName}</div>
                    <div className="text-[10px] text-pink-400 font-normal">
                      {evt.destIp} (V{evt.destVlan})
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      {evt.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">
                    {evt.packetCount} pkts · {(evt.bytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.status === 'ALLOWED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-xs max-w-xs truncate">
                    {evt.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
