import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { Vlan, NetworkDevice } from '../../types/network';

export const VlanManagementView: React.FC = () => {
  const {
    vlans,
    devices,
    addVlan,
    updateVlan,
    deleteVlan,
    moveDeviceVlan
  } = useNetwork();

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingVlan, setEditingVlan] = useState<Vlan | null>(null);
  const [reassignDevice, setReassignDevice] = useState<NetworkDevice | null>(null);
  const [targetVlanId, setTargetVlanId] = useState<number>(10);
  const [deleteConfirmVlan, setDeleteConfirmVlan] = useState<Vlan | null>(null);
  const [inspectVlanDevices, setInspectVlanDevices] = useState<Vlan | null>(null);

  // New VLAN form
  const [newVlanId, setNewVlanId] = useState<number>(70);
  const [newVlanName, setNewVlanName] = useState<string>('PHARMACY');
  const [newDepartment, setNewDepartment] = useState<string>('Pharmacy & Dispensary');
  const [newSubnet, setNewSubnet] = useState<string>('192.168.70.0');
  const [newGateway, setNewGateway] = useState<string>('192.168.70.1');
  const [newSecurityClass, setNewSecurityClass] = useState<Vlan['securityClass']>('High');

  // Handle Create Custom VLAN
  const handleCreateVlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (vlans.some(v => v.id === newVlanId)) {
      alert(`VLAN ${newVlanId} already exists!`);
      return;
    }

    addVlan({
      id: newVlanId,
      name: newVlanName.toUpperCase().replace(/\s+/g, '_'),
      department: newDepartment,
      subnet: newSubnet,
      netmask: '255.255.255.0',
      defaultGateway: newGateway,
      switchPorts: 'Fa0/15–16',
      status: 'active',
      securityClass: newSecurityClass,
      description: `Custom simulated VLAN for ${newDepartment}. Connected via subinterface GigabitEthernet0/0.${newVlanId}.`,
      color: '#06b6d4'
    });

    setShowAddModal(false);
  };

  // Handle Edit VLAN
  const handleUpdateVlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVlan) return;

    updateVlan(editingVlan.id, {
      name: editingVlan.name,
      department: editingVlan.department,
      securityClass: editingVlan.securityClass,
      description: editingVlan.description
    });

    setEditingVlan(null);
  };

  // Connected clients count per VLAN
  const getDeviceCount = (vlanId: number) => {
    return devices.filter(d => d.vlanId === vlanId && d.type !== 'router' && d.type !== 'switch').length;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              VLAN Segmentation & Switchport Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage IEEE 802.1Q Virtual Local Area Networks. Traffic between VLANs is completely isolated at Layer 2
            and routed exclusively via Cisco 2911 Router-on-a-Stick subinterfaces.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom VLAN</span>
          </button>
        </div>
      </div>

      {/* VLAN Distribution Visual Meter */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold uppercase">VLAN Client Device Distribution</span>
          <span className="text-slate-500">{devices.filter(d => d.type !== 'router' && d.type !== 'switch').length} Total Endpoints</span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
          {vlans.map(v => {
            const count = getDeviceCount(v.id);
            const total = devices.filter(d => d.type !== 'router' && d.type !== 'switch').length || 1;
            const pct = (count / total) * 100;
            return (
              <div
                key={v.id}
                style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: v.color }}
                className="h-full transition-all duration-500 relative group cursor-pointer"
                title={`VLAN ${v.id} (${v.name}): ${count} devices (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
          {vlans.map(v => (
            <div key={v.id} className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
              <span className="text-slate-300 font-medium">VLAN {v.id}:</span>
              <span>{getDeviceCount(v.id)} devs</span>
            </div>
          ))}
        </div>
      </div>

      {/* VLAN Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Configured Hospital VLAN Matrix (Cisco 2960)
            </h3>
            <span className="text-xs text-slate-500 font-mono">({vlans.length} VLANs)</span>
          </div>
          <span className="text-[11px] text-slate-400">Trunk Port: G0/1 (Encapsulation dot1Q)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">VLAN ID</th>
                <th className="py-3 px-4">Name / Department</th>
                <th className="py-3 px-4">Subnet</th>
                <th className="py-3 px-4">Default Gateway</th>
                <th className="py-3 px-4">Switch Ports</th>
                <th className="py-3 px-4">Endpoints</th>
                <th className="py-3 px-4">Security Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {vlans.map(vlan => {
                const clientCount = getDeviceCount(vlan.id);
                return (
                  <tr key={vlan.id} className="hover:bg-slate-800/40 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vlan.color }} />
                        <span>VLAN {vlan.id}</span>
                        {vlan.isCustom && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px]">
                            Custom
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name / Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{vlan.department}</div>
                      <div className="font-mono text-[10px] text-slate-400">{vlan.name}</div>
                    </td>

                    {/* Subnet */}
                    <td className="py-3.5 px-4 font-mono text-cyan-300">
                      {vlan.subnet}/24
                    </td>

                    {/* Gateway */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {vlan.defaultGateway}
                    </td>

                    {/* Switch Ports */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {vlan.switchPorts}
                    </td>

                    {/* Endpoints */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setInspectVlanDevices(vlan)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-mono transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{clientCount} Clients</span>
                      </button>
                    </td>

                    {/* Security Classification */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          vlan.securityClass === 'Isolated'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : vlan.securityClass === 'Critical'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {vlan.securityClass}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingVlan(vlan)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit VLAN metadata"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {vlan.isCustom && (
                          <button
                            onClick={() => setDeleteConfirmVlan(vlan)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                            title="Delete custom VLAN"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Reassignment Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Workstation VLAN Reassignment & Port Migration
            </h3>
          </div>
          <span className="text-xs text-slate-400">Migrates device Layer-2 broadcast domain</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Select any client workstation to relocate it to a different VLAN. The switch access-port will be reprogrammed,
          and the device will adopt the target VLAN's default gateway.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {devices
            .filter(d => d.type !== 'router' && d.type !== 'switch' && d.type !== 'server')
            .map(dev => {
              const currentVlan = vlans.find(v => v.id === dev.vlanId);
              return (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold font-mono text-white text-xs">{dev.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Current: <span style={{ color: currentVlan?.color }}>VLAN {dev.vlanId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setReassignDevice(dev);
                      setTargetVlanId(dev.vlanId);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Move VLAN
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Inspect VLAN Devices Modal */}
      {inspectVlanDevices && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">
                  Connected Endpoints: VLAN {inspectVlanDevices.id} ({inspectVlanDevices.department})
                </h3>
              </div>
              <button
                onClick={() => setInspectVlanDevices(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {devices
                .filter(d => d.vlanId === inspectVlanDevices.id && d.type !== 'router' && d.type !== 'switch')
                .map(dev => (
                  <div
                    key={dev.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold font-mono text-white">{dev.name}</div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        IP: {dev.ip} · MAC: {dev.mac}
                      </div>
                    </div>
                    <span className="font-mono text-cyan-400 text-[11px]">Port: {dev.switchPort}</span>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectVlanDevices(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Device VLAN Modal */}
      {reassignDevice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                Migrate {reassignDevice.name} to Another VLAN
              </h3>
              <button onClick={() => setReassignDevice(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Select the new destination VLAN. The Catalyst switch will update access-port tagging, and
              the default gateway will update automatically.
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target VLAN:</label>
              <select
                value={targetVlanId}
                onChange={e => setTargetVlanId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {vlans.map(v => (
                  <option key={v.id} value={v.id}>
                    VLAN {v.id} — {v.department} ({v.subnet}/24)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setReassignDevice(null)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  moveDeviceVlan(reassignDevice.id, targetVlanId);
                  setReassignDevice(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Apply Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom VLAN Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateVlan}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Custom Simulated VLAN</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-300 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Custom VLANs are logically appended to the switch and automatically provision a corresponding subinterface on Cisco router HOSPITAL-R1.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">VLAN ID (e.g. 70):</label>
                <input
                  type="number"
                  min="2"
                  max="4094"
                  value={newVlanId}
                  onChange={e => {
                    const id = parseInt(e.target.value, 10);
                    setNewVlanId(id);
                    setNewSubnet(`192.168.${id}.0`);
                    setNewGateway(`192.168.${id}.1`);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">VLAN Name:</label>
                <input
                  type="text"
                  value={newVlanName}
                  onChange={e => setNewVlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Department Label:</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Security Tier:</label>
                <select
                  value={newSecurityClass}
                  onChange={e => setNewSecurityClass(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                  <option value="Isolated">Isolated</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Subnet Network:</label>
                <input
                  type="text"
                  value={newSubnet}
                  onChange={e => setNewSubnet(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Default Gateway:</label>
                <input
                  type="text"
                  value={newGateway}
                  onChange={e => setNewGateway(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Create VLAN & Provision Router Subinterface
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmVlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-base text-white">Delete Custom VLAN {deleteConfirmVlan.id}?</h3>
            </div>
            <p className="text-xs text-slate-300">
              This will remove custom VLAN {deleteConfirmVlan.id} ({deleteConfirmVlan.department}) and
              tear down subinterface GigabitEthernet0/0.{deleteConfirmVlan.id} on router HOSPITAL-R1.
            </p>
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmVlan(null)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteVlan(deleteConfirmVlan.id);
                  setDeleteConfirmVlan(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
