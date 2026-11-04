import React from 'react';
import {
  Server,
  Layers,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Terminal,
  PlayCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { NavView } from '../Sidebar';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onOpenDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenDemo
}) => {
  const {
    devices,
    vlans,
    dhcpLeases,
    aclConfig,
    systemLogs,
    trafficEvents,
    generateTrafficBurst,
    runTest
  } = useNetwork();

  // Statistics calculations
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'online').length;
  const totalVlans = vlans.length;
  const clientDevices = devices.filter(d => d.type !== 'router' && d.type !== 'switch' && d.type !== 'server').length;
  const activeDhcpLeases = dhcpLeases.filter(l => l.status === 'Active').length;
  const servers = devices.filter(d => d.type === 'server');
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const serverAvailability = servers.length > 0 ? Math.round((onlineServers / servers.length) * 100) : 100;
  
  // Total blocked count from ACL hit counters
  const blockedHits = aclConfig.rules
    .filter(r => r.action === 'deny')
    .reduce((sum, r) => sum + r.hitCount, 0);

  const securityStatusText = aclConfig.enabled ? 'GUEST ISOLATION ACTIVE' : 'ACL DISABLED (ALERT)';

  // Calculate overall network health score (weighted)
  const healthScore = Math.min(100, Math.round(
    (activeDevices / totalDevices) * 40 +
    (onlineServers / servers.length) * 30 +
    (aclConfig.enabled ? 30 : 0)
  ));

  // Recent Blocked Events
  const recentBlocked = systemLogs.filter(
    l => l.category === 'ACL' || (l.severity === 'CRITICAL' && l.description.includes('DENIED'))
  ).slice(0, 4);

  // Recent DHCP Assignments
  const recentDhcp = systemLogs.filter(l => l.category === 'DHCP').slice(0, 4);

  // Quick Guest ACL Test
  const handleQuickAclTest = () => {
    const guestDev = devices.find(d => d.vlanId === 50) || devices[0];
    const srvDev = devices.find(d => d.ip === '192.168.60.10');
    if (guestDev && srvDev) {
      runTest('ACL', guestDev.id, srvDev.ip);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                NETWORK OPERATIONS CENTER (NOC) OVERVIEW
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Cisco Packet Tracer Architecture Concept</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Hospital Campus Network Infrastructure
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Real-time monitoring of 6 segmented VLANs, Cisco 2911 Router-on-a-Stick inter-VLAN routing,
              Catalyst 2960 trunking, stateful Extended ACL isolation, and high-availability server cluster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={generateTrafficBurst}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-cyan-500/50 flex items-center gap-2 transition cursor-pointer"
              title="Generate simulated traffic packets across VLANs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Traffic</span>
            </button>

            <button
              onClick={handleQuickAclTest}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-amber-500/50 flex items-center gap-2 transition cursor-pointer"
              title="Verify Guest Isolation Policy against Hospital Server"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Guest ACL</span>
            </button>

            <button
              onClick={onOpenDemo}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Guided Evaluation Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Dynamic Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Devices */}
        <div
          onClick={() => onNavigate('topology')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Devices</span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            {totalDevices}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <span>{activeDevices} Active Nodes</span>
          </div>
        </div>

        {/* Total VLANs */}
        <div
          onClick={() => onNavigate('vlans')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total VLANs</span>
            <Layers className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            {totalVlans}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span>VLANs 10, 20, 30, 40, 50, 60</span>
          </div>
        </div>

        {/* Connected Clients */}
        <div
          onClick={() => onNavigate('ipam')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Connected Clients</span>
            <Server className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            {clientDevices}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span>PCs, Laptops, Medical Monitors</span>
          </div>
        </div>

        {/* DHCP Leases */}
        <div
          onClick={() => onNavigate('dhcp')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>DHCP Leases</span>
            <Radio className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            {activeDhcpLeases}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">
            <span>Across 5 Department Pools</span>
          </div>
        </div>

        {/* Server Availability */}
        <div
          onClick={() => onNavigate('servers')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Server Availability</span>
            <Server className="w-4 h-4 text-pink-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            {serverAvailability}%
          </div>
          <div className="mt-1 text-[11px] text-pink-400">
            <span>{onlineServers}/{servers.length} Core Servers Online</span>
          </div>
        </div>

        {/* Blocked Connections */}
        <div
          onClick={() => onNavigate('security')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Blocked Invasions</span>
            <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
            {blockedHits}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span>ACL GUEST_ISOLATION Drops</span>
          </div>
        </div>

        {/* Network Security Status */}
        <div
          onClick={() => onNavigate('security')}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group col-span-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Network Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-400 font-mono tracking-tight">
            {securityStatusText}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span>VLAN 50 Denied to VLANs 10, 20, 30, 40, 60</span>
          </div>
        </div>
      </div>

      {/* Network Health & Hardware Component Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Health Card */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Overall Network Health
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">{healthScore}%</span>
            </div>

            {/* Health Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${healthScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Inter-VLAN router interfaces, dot1q trunking, and datacenter server services are fully synchronized. Zero packet loss on internal subnets.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Router R1:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Switch SW1:</span>
              <span className="text-emerald-400 font-bold">TRUNKING</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">VLAN State:</span>
              <span className="text-cyan-400 font-bold">6 ISOLATED</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Firewall ACL:</span>
              <span className="text-emerald-400 font-bold">ENFORCING</span>
            </div>
          </div>
        </div>

        {/* Traffic Statistics Summary */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Simulated Traffic Bandwidth
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Simulated Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Rx Rate</span>
                </div>
                <div className="mt-1 text-xl font-bold font-mono text-white">
                  3.42 <span className="text-xs text-slate-400 font-normal">Mbps</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">428 packets/sec</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-blue-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Tx Rate</span>
                </div>
                <div className="mt-1 text-xl font-bold font-mono text-white">
                  2.89 <span className="text-xs text-slate-400 font-normal">Mbps</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">362 packets/sec</div>
              </div>
            </div>

            {/* VLAN traffic distribution bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>VLAN Traffic Distribution</span>
                <span className="font-mono text-cyan-300">100% Normalized</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: '18%' }} className="bg-cyan-500" title="VLAN 10 Admin: 18%" />
                <div style={{ width: '14%' }} className="bg-blue-500" title="VLAN 20 Reception: 14%" />
                <div style={{ width: '32%' }} className="bg-emerald-500" title="VLAN 30 Medical: 32%" />
                <div style={{ width: '16%' }} className="bg-purple-500" title="VLAN 40 Lab: 16%" />
                <div style={{ width: '8%' }} className="bg-amber-500" title="VLAN 50 Guest: 8%" />
                <div style={{ width: '12%' }} className="bg-pink-500" title="VLAN 60 Servers: 12%" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                <span className="text-cyan-400">V10</span>
                <span className="text-blue-400">V20</span>
                <span className="text-emerald-400">V30 (EHR)</span>
                <span className="text-purple-400">V40</span>
                <span className="text-amber-400">V50</span>
                <span className="text-pink-400">V60</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total flows captured:</span>
            <span className="font-mono text-xs font-bold text-white">{trafficEvents.length} Sessions</span>
          </div>
        </div>

        {/* Quick Launch & Diagnostic Console */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
                Direct Simulator Controls
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Cisco Suite</span>
            </div>

            <div className="space-y-2 mt-2">
              <button
                onClick={() => onNavigate('topology')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-white">Visual Network Topology</div>
                    <div className="text-[10px] text-slate-500">Pan/zoom canvas & live packet flows</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('testing')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Diagnostic Testing Suite</div>
                    <div className="text-[10px] text-slate-500">Run Ping, Traceroute, DNS, DHCP tests</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('cisco-cli')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Cisco IOS Exec Simulator</div>
                    <div className="text-[10px] text-slate-500">show vlan, show ip route, show run</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Model: Router-on-a-Stick</span>
            <span className="font-mono text-cyan-400">IEEE 802.1Q</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Blocked Invasions vs Recent DHCP Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocked Guest Invasions */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                Recent Guest Isolation Security Events
              </h3>
            </div>
            <button
              onClick={() => onNavigate('security')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              View ACL Rules →
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2">
            {recentBlocked.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No security violations detected. Zero unauthorized inter-VLAN access.
              </div>
            ) : (
              recentBlocked.map(evt => (
                <div key={evt.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-rose-400 text-[11px]">
                      BLOCKED · {evt.sourceDevice || 'Host'}
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {evt.timestamp.slice(11)}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                    {evt.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent DHCP Assignments */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                Recent Dynamic DHCP Leases
              </h3>
            </div>
            <button
              onClick={() => onNavigate('dhcp')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              Manage Pools →
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2">
            {recentDhcp.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent DHCP lease events.
              </div>
            ) : (
              recentDhcp.map(evt => (
                <div key={evt.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-400 text-[11px]">
                      DHCPACK · {evt.sourceDevice || 'Client'}
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {evt.timestamp.slice(11)}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                    {evt.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
