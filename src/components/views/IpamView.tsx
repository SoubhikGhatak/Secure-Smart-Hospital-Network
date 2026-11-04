import React, { useState } from 'react';
import {
  Binary,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Search,
  Server,
  Layers,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { NetworkDevice } from '../../types/network';
import { isValidIp } from '../../simulation/networkEngine';

export const IpamView: React.FC = () => {
  const { devices, vlans, updateDevice } = useNetwork();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVlanFilter, setSelectedVlanFilter] = useState<string>('all');
  const [manualIpModal, setManualIpModal] = useState<NetworkDevice | null>(null);
  const [newIpInput, setNewIpInput] = useState<string>('');
  const [ipError, setIpError] = useState<string | null>(null);

  // Scan for duplicate IPs
  const ipCounts = devices.reduce((acc, d) => {
    acc[d.ip] = (acc[d.ip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const duplicateIps = Object.keys(ipCounts).filter(ip => ip !== '0.0.0.0' && ipCounts[ip] > 1);

  // Filter devices
  const filteredDevices = devices.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ip.includes(searchQuery) ||
      d.mac.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVlan = selectedVlanFilter === 'all' || d.vlanId.toString() === selectedVlanFilter;
    return matchesSearch && matchesVlan;
  });

  // Calculate allocation metrics
  const totalAllocated = devices.filter(d => d.ip !== '0.0.0.0').length;
  const dhcpCount = devices.filter(d => d.ipAssignment === 'DHCP').length;
  const staticCount = devices.filter(d => d.ipAssignment === 'STATIC').length;

  const handleSaveManualIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpModal) return;

    if (!isValidIp(newIpInput)) {
      setIpError('Invalid IPv4 address format (e.g. 192.168.10.50)');
      return;
    }

    // Check if IP is already used by another device
    const conflict = devices.find(d => d.id !== manualIpModal.id && d.ip === newIpInput.trim());
    if (conflict) {
      setIpError(`IP address conflict: ${newIpInput} is already assigned to ${conflict.name}`);
      return;
    }

    updateDevice(manualIpModal.id, {
      ip: newIpInput.trim(),
      ipAssignment: 'STATIC'
    });

    setManualIpModal(null);
    setIpError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              IP Address Management (IPAM)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Centralized IP address tracking, subnet prefix utilization, automated duplicate address detection,
            and static vs dynamic DHCP allocation audit.
          </p>
        </div>
      </div>

      {/* Duplicate IP Warning Banner (If detected) */}
      {duplicateIps.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold">CRITICAL IP CONFLICT DETECTED: </span>
              Duplicate IP address detected for [{duplicateIps.join(', ')}]. ARP table collisions and packet drops will occur.
            </div>
          </div>
        </div>
      )}

      {/* IP Allocation Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Total IP Addresses Assigned</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-white tabular-nums">
            {totalAllocated}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across 6 subnets (/24)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">DHCP Dynamic Assigned</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-cyan-400 tabular-nums">
            {dhcpCount}
          </div>
          <div className="mt-1 text-[11px] text-cyan-500">Active pool leases</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Static Servers & Infrastructure</div>
          <div className="mt-1 text-2xl font-extrabold font-mono text-pink-400 tabular-nums">
            {staticCount}
          </div>
          <div className="mt-1 text-[11px] text-pink-500">Router, Switch, Core Servers</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">IP Conflicts / Duplicates</div>
          <div className={`mt-1 text-2xl font-extrabold font-mono tabular-nums ${duplicateIps.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {duplicateIps.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">
            {duplicateIps.length === 0 ? 'Zero conflicts' : 'Attention required'}
          </div>
        </div>
      </div>

      {/* Subnet Utilization Visualizer */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
            Hospital Subnet Allocation Matrix (/24 Ranges)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Netmask: 255.255.255.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {vlans.map(v => {
            const devsInVlan = devices.filter(d => d.vlanId === v.id);
            const utilizationPct = Math.round((devsInVlan.length / 254) * 100);
            return (
              <div key={v.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                    VLAN {v.id}: {v.department.split('/')[0].trim()}
                  </span>
                  <span className="text-slate-400">{devsInVlan.length} / 254 IPs</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(utilizationPct, 3)}%`,
                      backgroundColor: v.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Net: {v.subnet}/24</span>
                  <span className="text-slate-400">GW: {v.defaultGateway}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device name, IP address, MAC..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter VLAN:</span>
          <select
            value={selectedVlanFilter}
            onChange={e => setSelectedVlanFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All VLANs</option>
            {vlans.map(v => (
              <option key={v.id} value={v.id.toString()}>
                VLAN {v.id} ({v.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* IPAM Device Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Device Name</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Subnet Mask</th>
                <th className="py-3 px-4">Default Gateway</th>
                <th className="py-3 px-4">VLAN ID</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredDevices.map(dev => {
                const isConflict = duplicateIps.includes(dev.ip);
                return (
                  <tr
                    key={dev.id}
                    className={`hover:bg-slate-800/40 transition ${
                      isConflict ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Device Name */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        {dev.type === 'server' ? (
                          <Server className="w-4 h-4 text-pink-400" />
                        ) : dev.type === 'router' ? (
                          <Layers className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        )}
                        <span>{dev.name}</span>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={isConflict ? 'text-rose-400 underline decoration-rose-500' : 'text-cyan-300'}>
                        {dev.ip}
                      </span>
                      {isConflict && (
                        <span className="ml-2 text-[10px] text-rose-400 font-semibold">[CONFLICT]</span>
                      )}
                    </td>

                    {/* Subnet Mask */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {dev.subnetMask}
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {dev.gateway}
                    </td>

                    {/* VLAN ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                        VLAN {dev.vlanId}
                      </span>
                    </td>

                    {/* Assignment */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          dev.ipAssignment === 'STATIC'
                            ? 'bg-pink-950 text-pink-400 border border-pink-800'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}
                      >
                        {dev.ipAssignment}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Online
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {dev.type !== 'router' && dev.type !== 'switch' && (
                        <button
                          onClick={() => {
                            setManualIpModal(dev);
                            setNewIpInput(dev.ip);
                            setIpError(null);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                        >
                          Manual IP
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual IP Assignment Modal */}
      {manualIpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveManualIp}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                Assign Static IP: {manualIpModal.name}
              </h3>
              <button
                type="button"
                onClick={() => setManualIpModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Assigned to <span className="font-mono text-white">VLAN {manualIpModal.vlanId}</span> (Gateway: {manualIpModal.gateway}).
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                New Static IPv4 Address:
              </label>
              <input
                type="text"
                value={newIpInput}
                onChange={e => setNewIpInput(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-cyan-300 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {ipError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {ipError}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setManualIpModal(null)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Save Static IP
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
