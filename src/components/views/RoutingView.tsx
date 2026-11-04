import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Info,
  Server
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { traceRoutingPath, RoutingDecision } from '../../simulation/networkEngine';

export const RoutingView: React.FC = () => {
  const {
    subinterfaces,
    routingTable,
    devices,
    aclConfig
  } = useNetwork();

  const [sourceId, setSourceId] = useState<string>('doctor-ws-1');
  const [destId, setDestId] = useState<string>('srv-hospital');
  const [simulation, setSimulation] = useState<RoutingDecision | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const clientAndServerDevices = devices.filter(
    d => d.type !== 'router' && d.type !== 'switch'
  );

  const handleSimulate = (srcId: string = sourceId, dstId: string = destId) => {
    const src = devices.find(d => d.id === srcId);
    const dst = devices.find(d => d.id === dstId);
    if (!src || !dst) return;

    const res = traceRoutingPath(src, dst, aclConfig, subinterfaces);
    setSimulation(res);
    setCurrentStepIdx(0);
    setIsPlaying(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStepIdx(step);
      if (step >= res.steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 750);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Router-on-a-Stick (ROAS) Inter-VLAN Routing Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Logical Cisco 2911 router implementation. Physical interface GigabitEthernet0/0 is subdivided into
            virtual subinterfaces using IEEE 802.1Q trunk tagging to route traffic between isolated departmental broadcast domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
            Trunk: 802.1Q (G0/0)
          </span>
        </div>
      </div>

      {/* Interactive Demonstration Wizard: SIMULATE INTER-VLAN COMMUNICATION */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Simulate Inter-VLAN Communication (Step-by-Step Packet Traversal)
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">8-Stage Routing Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Source Host / Workstation:
            </label>
            <select
              value={sourceId}
              onChange={e => setSourceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {clientAndServerDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (VLAN {d.vlanId} - {d.ip})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Destination Target / Server:
            </label>
            <select
              value={destId}
              onChange={e => setDestId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {clientAndServerDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (VLAN {d.vlanId} - {d.ip})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={() => handleSimulate()}
              disabled={isPlaying}
              className={`w-full px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                isPlaying
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlaying ? 'Analyzing Path...' : 'Simulate Inter-VLAN Route'}</span>
            </button>
          </div>
        </div>

        {/* 8-Stage Step-by-Step Visualization */}
        {simulation && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Step-by-Step Packet Routing Execution:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  simulation.permitted
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {simulation.permitted ? 'TRANSMISSION PERMITTED' : 'DROPPED BY ROUTER ACL'}
              </span>
            </div>

            <div className="space-y-2">
              {simulation.steps.map((st, idx) => {
                const isExecuted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx && isPlaying;
                const isBlockedStep = st.status === 'blocked';

                return (
                  <div
                    key={st.stepNumber}
                    className={`p-3 rounded-xl border text-xs transition-all duration-300 ${
                      isBlockedStep
                        ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                        : isExecuted
                        ? 'bg-slate-950 border-slate-700 text-slate-200'
                        : 'bg-slate-950/30 border-slate-900 text-slate-600 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isBlockedStep
                              ? 'bg-rose-500 text-white'
                              : isExecuted
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {st.stepNumber}
                        </span>
                        <span className="font-bold text-white">{st.action}</span>
                        <span className="text-slate-400">· Node: {st.node}</span>
                      </div>

                      <span className="text-[11px] text-cyan-400">
                        Interface: {st.interfaceName}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-slate-300 font-sans leading-relaxed pl-7">
                      {st.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Router Subinterfaces Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Router Subinterface Status (HOSPITAL-R1: Cisco 2911)
            </h3>
            <span className="text-xs text-slate-500 font-mono">({subinterfaces.length} Virtual Interfaces)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Physical: GigabitEthernet0/0 (Up/Up)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subinterface</th>
                <th className="py-3 px-4">VLAN Tag</th>
                <th className="py-3 px-4">Gateway IP</th>
                <th className="py-3 px-4">Subnet Mask</th>
                <th className="py-3 px-4">Encapsulation</th>
                <th className="py-3 px-4">Attached Security ACL</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {subinterfaces.map(sub => (
                <tr key={sub.interfaceName} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    {sub.interfaceName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    VLAN {sub.vlanId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    {sub.ipAddress}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {sub.subnetMask}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {sub.encapsulation}
                  </td>
                  <td className="py-3.5 px-4">
                    {sub.inboundAcl ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                        {sub.inboundAcl} (IN)
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">None (Unfiltered)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      up/up
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cisco Routing Table (RIB) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Cisco IP Routing Table (show ip route)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Directly Connected Networks</span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto">
          <div className="text-slate-500 text-[11px]">
            Codes: C - connected, S - static, R - RIP, O - OSPF, IA - OSPF inter area
          </div>
          <div className="text-slate-400 text-[11px] pb-1">
            Gateway of last resort is not set
          </div>
          {routingTable.map(r => (
            <div key={r.interface} className="flex items-center gap-2 text-cyan-300 text-xs">
              <span className="font-bold text-white w-4">{r.type}</span>
              <span>{r.network}/24 is directly connected,</span>
              <span className="text-slate-200">{r.interface}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
