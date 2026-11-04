import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Clock,
  Trash2
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { NetworkDevice, DhcpPool } from '../../types/network';

export const DhcpManagementView: React.FC = () => {
  const {
    dhcpPools,
    dhcpLeases,
    devices,
    requestDhcp,
    releaseDhcp,
    renewDhcp
  } = useNetwork();

  const [selectedClientForDhcp, setSelectedClientForDhcp] = useState<string>('doctor-ws-1');
  const [requestStatus, setRequestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showCliPreview, setShowCliPreview] = useState<boolean>(true);

  const clientDevices = devices.filter(
    d => d.type !== 'router' && d.type !== 'switch' && d.type !== 'server'
  );

  const handleExecuteDhcpRequest = () => {
    const res = requestDhcp(selectedClientForDhcp);
    setRequestStatus(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              DHCP Service & Dynamic Lease Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-pool Cisco DHCP server configuration on HOSPITAL-R1. Each VLAN operates an independent pool
            with default gateway, DNS server pointer (192.168.60.11), and excluded reserved infrastructure ranges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
            5 Pools Active
          </span>
        </div>
      </div>

      {/* Interactive DHCP Request Wizard (Demonstration Tool) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Interactive DHCP Demonstration: Request Dynamic Address
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">DORA Sequence (Discover → Offer → Request → Ack)</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Simulate an endpoint broadcasting a DHCPDISCOVER. The simulation will identify the device's VLAN, locate the
          corresponding subnet pool, assign an available lease, configure the default gateway, and register the Cisco binding.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Select Client Workstation:
            </label>
            <select
              value={selectedClientForDhcp}
              onChange={e => setSelectedClientForDhcp(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {clientDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — Current IP: {d.ip} (VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:self-end">
            <button
              onClick={handleExecuteDhcpRequest}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REQUEST DHCP ADDRESS</span>
            </button>
          </div>
        </div>

        {requestStatus && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              requestStatus.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {requestStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{requestStatus.message}</span>
            </div>
            <button
              onClick={() => setRequestStatus(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 5 DHCP Department Pools */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
          Configured Router DHCP Pools (HOSPITAL-R1)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dhcpPools.map(pool => {
            const leasesInPool = dhcpLeases.filter(l => l.poolName === pool.name && l.status === 'Active');
            return (
              <div
                key={pool.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-bold font-mono text-white text-xs">
                      POOL {pool.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    VLAN {pool.vlanId}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Network:</span>
                    <span className="text-cyan-300">{pool.network}/24</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Default Router:</span>
                    <span className="text-slate-200">{pool.defaultRouter}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>DNS Resolver:</span>
                    <span className="text-slate-200">{pool.dnsServer}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Dynamic Range:</span>
                    <span className="text-slate-200">{pool.startIp} - {pool.endIp}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Lease Duration:</span>
                    <span className="text-slate-200">{pool.leaseTimeSeconds / 3600} Hours</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Active Leases:</span>
                  <span className="font-bold text-emerald-400">{leasesInPool.length} Granted</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DHCP Binding Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Active DHCP Address Bindings (Lease Table)
            </h3>
            <span className="text-xs text-slate-500 font-mono">({dhcpLeases.length} Active Leases)</span>
          </div>

          <button
            onClick={() => setShowCliPreview(!showCliPreview)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            {showCliPreview ? 'Hide Cisco CLI Output' : 'Show Cisco CLI Format'}
          </button>
        </div>

        {/* Cisco Terminal Preview Box */}
        {showCliPreview && (
          <div className="mx-4 p-3 rounded-lg bg-black/80 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="text-cyan-400 font-bold mb-1">HOSPITAL-R1# show ip dhcp binding</div>
            <div className="text-slate-400 text-[11px]">
              IP address &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Client-ID/Hardware address &nbsp;&nbsp; Lease expiration &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Type
            </div>
            {dhcpLeases.map(l => (
              <div key={l.ip} className="text-emerald-400 text-[11px] leading-5">
                {l.ip.padEnd(16)} {l.clientId.padEnd(28)} {l.expireTime.padEnd(24)} Automatic
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Allocated IP</th>
                <th className="py-3 px-4">Hardware MAC</th>
                <th className="py-3 px-4">Client Identifier</th>
                <th className="py-3 px-4">DHCP Pool</th>
                <th className="py-3 px-4">VLAN</th>
                <th className="py-3 px-4">Lease Acquired</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dhcpLeases.map(lease => {
                const associatedDev = devices.find(d => d.mac === lease.mac);
                return (
                  <tr key={lease.ip} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-cyan-300">
                      {lease.ip}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      <div className="font-mono text-xs">{lease.mac}</div>
                      <div className="text-[10px] text-slate-500">{associatedDev?.name || 'Unknown Host'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {lease.clientId}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {lease.poolName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      VLAN {lease.vlanId}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {lease.leaseTime}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {lease.expireTime}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {associatedDev && (
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => renewDhcp(associatedDev.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] transition cursor-pointer"
                            title="Renew DHCP Lease"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => releaseDhcp(associatedDev.id)}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] transition cursor-pointer"
                            title="Release Lease to Pool"
                          >
                            Release
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
