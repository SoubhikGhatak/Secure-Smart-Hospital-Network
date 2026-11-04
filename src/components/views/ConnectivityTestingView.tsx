import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Radio,
  Search,
  GitFork,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { ConnectivityTestResult } from '../../types/network';

export const ConnectivityTestingView: React.FC = () => {
  const { devices, runTest, activeTestResult } = useNetwork();

  const [selectedTool, setSelectedTool] = useState<'PING' | 'TRACEROUTE' | 'DNS' | 'DHCP' | 'ROUTING' | 'ACL'>('PING');
  const [sourceId, setSourceId] = useState<string>('doctor-ws-1');
  const [targetInput, setTargetInput] = useState<string>('192.168.60.10');
  const [currentResult, setCurrentResult] = useState<ConnectivityTestResult | null>(activeTestResult);

  const clientAndServerDevices = devices.filter(
    d => d.type !== 'router' && d.type !== 'switch'
  );

  const handleExecuteTest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = runTest(selectedTool, sourceId, targetInput);
    setCurrentResult(res);
  };

  // Preconfigured Academic Evaluation Scenarios
  const PRECONFIGURED_SCENARIOS = [
    {
      id: 'sc-1',
      title: 'Administration PC → Hospital Server',
      sourceId: 'admin-pc-1',
      target: '192.168.60.10',
      expected: 'ALLOWED',
      desc: 'Verify administrative staff access to core hospital server cluster.'
    },
    {
      id: 'sc-2',
      title: 'Reception PC → Hospital Server',
      sourceId: 'recept-pc-1',
      target: '192.168.60.10',
      expected: 'ALLOWED',
      desc: 'Verify reception desk patient intake connectivity to EHR database.'
    },
    {
      id: 'sc-3',
      title: 'Medical PC → Hospital Server',
      sourceId: 'doctor-ws-1',
      target: '192.168.60.10',
      expected: 'ALLOWED',
      desc: 'Verify doctor clinical workstations access to patient health records.'
    },
    {
      id: 'sc-4',
      title: 'Laboratory PC → Hospital Server',
      sourceId: 'lab-analyzer-1',
      target: '192.168.60.10',
      expected: 'ALLOWED',
      desc: 'Verify pathology analyzer telemetry ingestion by core hospital server.'
    },
    {
      id: 'sc-5',
      title: 'Guest PC → Hospital Server',
      sourceId: 'guest-laptop-1',
      target: '192.168.60.10',
      expected: 'BLOCKED',
      desc: 'Verify Extended ACL GUEST_ISOLATION blocks visitor laptop from hospital server.'
    },
    {
      id: 'sc-6',
      title: 'Guest PC → Administration PC',
      sourceId: 'guest-laptop-1',
      target: '192.168.10.50',
      expected: 'BLOCKED',
      desc: 'Verify Guest VLAN cannot traverse to administrative finance network.'
    },
    {
      id: 'sc-7',
      title: 'Guest PC → Medical PC',
      sourceId: 'guest-mobile-1',
      target: '192.168.30.50',
      expected: 'BLOCKED',
      desc: 'Verify visitor smartphone cannot probe ICU or doctor clinical terminals.'
    }
  ];

  const runPreconfiguredScenario = (sc: typeof PRECONFIGURED_SCENARIOS[0]) => {
    setSelectedTool('PING');
    setSourceId(sc.sourceId);
    setTargetInput(sc.target);
    const res = runTest('PING', sc.sourceId, sc.target);
    setCurrentResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Network Connectivity & Diagnostic Testing Utility
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Execute professional diagnostic commands including ICMP Echo (Ping), hop-by-hop Traceroute,
            DNS name resolution, DHCP pool validation, routing table verification, and Extended ACL enforcement.
          </p>
        </div>
      </div>

      {/* 6 Diagnostic Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'PING', label: '1. PING (ICMP)', icon: ArrowRight },
          { id: 'TRACEROUTE', label: '2. TRACEROUTE', icon: GitFork },
          { id: 'DNS', label: '3. DNS LOOKUP', icon: Search },
          { id: 'DHCP', label: '4. DHCP TEST', icon: Radio },
          { id: 'ROUTING', label: '5. ROUTING TEST', icon: GitFork },
          { id: 'ACL', label: '6. ACL FIREWALL', icon: ShieldCheck }
        ].map(tool => {
          const Icon = tool.icon;
          const isActive = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id as any);
                if (tool.id === 'DNS') setTargetInput('hospital.local');
                else if (tool.id === 'DHCP') setTargetInput('DHCP Server');
                else if (tool.id === 'ROUTING' || tool.id === 'ACL' || tool.id === 'PING' || tool.id === 'TRACEROUTE') {
                  setTargetInput('192.168.60.10');
                }
              }}
              className={`p-3 rounded-xl border text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Test Formulation Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
            Diagnostic Probe Parameters ({selectedTool})
          </h3>
          <span className="text-[11px] text-cyan-400 font-mono">Engine: Cisco IOS Simulated Core</span>
        </div>

        <form onSubmit={handleExecuteTest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Source Device:
            </label>
            <select
              value={sourceId}
              onChange={e => setSourceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {clientAndServerDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip} - VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Target Host / Domain / Destination:
            </label>
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              required
              placeholder="e.g. 192.168.60.10 or hospital.local"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>RUN {selectedTool} DIAGNOSTIC</span>
            </button>
          </div>
        </form>

        {/* Diagnostic Results Presentation */}
        {currentResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentResult.status === 'SUCCESS' || currentResult.status === 'ALLOWED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm font-mono text-white">
                  {currentResult.testType} Probe to {currentResult.destDeviceOrTarget}: {currentResult.status}
                </span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  currentResult.status === 'SUCCESS' || currentResult.status === 'ALLOWED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {currentResult.status}
              </span>
            </div>

            {/* Performance telemetry stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Packets Sent</div>
                <div className="font-bold text-white mt-0.5">{currentResult.packetsSent} Packets</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Packets Received</div>
                <div className="font-bold text-white mt-0.5">{currentResult.packetsReceived} Packets</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Packet Loss</div>
                <div className={`font-bold mt-0.5 ${currentResult.packetLossPercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentResult.packetLossPercent}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Avg Round-Trip</div>
                <div className="font-bold text-cyan-300 mt-0.5">{currentResult.avgResponseTimeMs} ms</div>
              </div>
            </div>

            {/* Hop-by-hop Traceroute details if present */}
            {currentResult.hops && currentResult.hops.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900">
                  Tracing route to {currentResult.destIp} over a maximum of 30 hops:
                </div>
                {currentResult.hops.map(h => (
                  <div key={h.hop} className="flex items-center gap-3 text-slate-300">
                    <span className="text-slate-500 w-4">{h.hop}</span>
                    <span className="text-cyan-400 w-16">{h.timeMs > 0 ? `${h.timeMs} ms` : '* * *'}</span>
                    <span className="font-semibold text-white">{h.node}</span>
                    <span className="text-slate-400 text-[11px]">({h.ip})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-slate-500">Diagnostic Summary: </span>
              {currentResult.details}
            </div>
          </div>
        )}
      </div>

      {/* Preconfigured Academic Test Scenarios Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Preconfigured Academic Evaluation Scenarios (Project Verification Matrix)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">7 Pre-Loaded Evaluator Tests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Test Scenario</th>
                <th className="py-3 px-4">Source Device</th>
                <th className="py-3 px-4">Target Destination</th>
                <th className="py-3 px-4">Expected Policy Result</th>
                <th className="py-3 px-4">Security Rationale</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {PRECONFIGURED_SCENARIOS.map(sc => (
                <tr key={sc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    {sc.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                    {sc.sourceId}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 text-xs">
                    {sc.target}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sc.expected === 'ALLOWED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {sc.expected}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs max-w-xs">
                    {sc.desc}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => runPreconfiguredScenario(sc)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Run Test
                    </button>
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
