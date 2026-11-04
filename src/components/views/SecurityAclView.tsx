import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { AclRule } from '../../types/network';
import { evaluateAcl } from '../../simulation/networkEngine';

export const SecurityAclView: React.FC = () => {
  const {
    aclConfig,
    toggleAcl,
    addAclRule,
    deleteAclRule,
    devices,
    runTest
  } = useNetwork();

  const [testSourceId, setTestSourceId] = useState<string>('guest-laptop-1');
  const [testDestId, setTestDestId] = useState<string>('srv-hospital');
  const [testProtocol, setTestProtocol] = useState<'ip' | 'tcp' | 'udp' | 'icmp'>('ip');
  const [evalResult, setEvalResult] = useState<any>(null);

  // Add rule modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newSeq, setNewSeq] = useState<number>(55);
  const [newAction, setNewAction] = useState<'permit' | 'deny'>('deny');
  const [newProto, setNewProto] = useState<'ip' | 'tcp' | 'udp' | 'icmp'>('ip');
  const [newSrcNet, setNewSrcNet] = useState<string>('192.168.50.0');
  const [newSrcWild, setNewSrcWild] = useState<string>('0.0.0.255');
  const [newDstNet, setNewDstNet] = useState<string>('192.168.70.0');
  const [newDstWild, setNewDstWild] = useState<string>('0.0.0.255');
  const [newDesc, setNewDesc] = useState<string>('Deny Guest access to Pharmacy');

  const [deleteRuleConfirm, setDeleteRuleConfirm] = useState<AclRule | null>(null);

  // Filter client & server devices
  const availableDevices = devices.filter(
    d => d.type !== 'router' && d.type !== 'switch'
  );

  const handleRunAclTest = (e: React.FormEvent) => {
    e.preventDefault();
    const src = devices.find(d => d.id === testSourceId);
    const dst = devices.find(d => d.id === testDestId);
    if (!src || !dst) return;

    // Execute real diagnostic ACL evaluation
    const res = runTest('ACL', src.id, dst.ip);
    const rawEval = evaluateAcl(src.ip, dst.ip, testProtocol, aclConfig);
    setEvalResult({
      ...rawEval,
      sourceDevice: src,
      destDevice: dst,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    addAclRule({
      sequence: newSeq,
      action: newAction,
      protocol: newProto,
      sourceNetwork: newSrcNet.trim(),
      sourceWildcard: newSrcWild.trim(),
      destNetwork: newDstNet.trim(),
      destWildcard: newDstWild.trim(),
      description: newDesc
    });
    setShowAddRuleModal(false);
  };

  const sortedRules = [...aclConfig.rules].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Extended Access Control List (ACL) Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Extended ACL <span className="font-mono text-cyan-300 font-semibold">{aclConfig.name}</span> applied inbound on
            Cisco subinterface GigabitEthernet0/0.50 (Guest VLAN). Enforces zero-trust medical segmentation by filtering
            source and destination IPv4 addresses with wildcard masks.
          </p>
        </div>

        {/* Global ACL Enforce Toggle */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-white">
              {aclConfig.enabled ? 'ACL ENFORCING' : 'ACL BYPASSED'}
            </div>
            <div className="text-[10px] text-slate-400">
              {aclConfig.enabled ? 'Active on Gi0/0.50' : 'Permit All (Unrestricted)'}
            </div>
          </div>

          <button
            onClick={() => toggleAcl(!aclConfig.enabled)}
            className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
            title="Toggle ACL enforcement on router"
          >
            {aclConfig.enabled ? (
              <ToggleRight className="w-8 h-8 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Demonstration: TEST SECURITY POLICY */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Interactive Security Verification: Test Security Policy
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Rule-Ordering Evaluation Engine</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Verify whether a source endpoint is allowed to connect to a target network. The evaluation engine computes
          wildcard mask matches across the ordered rules sequentially, increments hit counters, and generates an audit log.
        </p>

        <form onSubmit={handleRunAclTest} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Source Device (Traffic Origin):
            </label>
            <select
              value={testSourceId}
              onChange={e => setTestSourceId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {availableDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip} - VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Destination Target (Target Network):
            </label>
            <select
              value={testDestId}
              onChange={e => setTestDestId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-pink-300 focus:outline-none focus:border-cyan-500"
            >
              {availableDevices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip} - VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              Evaluated Protocol:
            </label>
            <select
              value={testProtocol}
              onChange={e => setTestProtocol(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ip">IP (Any IP Flow)</option>
              <option value="tcp">TCP (Transmission Control)</option>
              <option value="udp">UDP (Datagrams / DNS)</option>
              <option value="icmp">ICMP (Ping Probe)</option>
            </select>
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold transition shadow-md shadow-amber-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>TEST POLICY</span>
            </button>
          </div>
        </form>

        {/* Live Evaluation Result Box */}
        {evalResult && (
          <div
            className={`p-4 rounded-xl border space-y-2.5 transition-all ${
              evalResult.action === 'permit'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evalResult.action === 'permit' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-extrabold text-sm font-mono tracking-wider uppercase">
                  {evalResult.action === 'permit' ? 'ALLOWED (ACCESS PERMITTED)' : 'BLOCKED (ACCESS DENIED)'}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                Audit Log Generated at {evalResult.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Source: </span>
                <span className="text-white font-semibold">{evalResult.sourceDevice.name} ({evalResult.sourceDevice.ip})</span>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Destination: </span>
                <span className="text-white font-semibold">{evalResult.destDevice.name} ({evalResult.destDevice.ip})</span>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500">Rule Matched: </span>
                <span className="text-cyan-300 font-semibold">
                  {evalResult.matchedRule ? `Sequence ${evalResult.matchedRule.sequence}` : 'Implicit Deny'}
                </span>
              </div>
            </div>

            <p className="text-xs font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              <span className="text-slate-400 font-semibold">Evaluation Logic: </span>
              {evalResult.reason}
            </p>
          </div>
        )}
      </div>

      {/* Extended ACL Rule Matrix Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Extended IP Access List: {aclConfig.name}
            </h3>
            <span className="text-xs text-slate-500 font-mono">({sortedRules.length} Sequential Rules)</span>
          </div>

          <button
            onClick={() => setShowAddRuleModal(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add ACL Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Seq #</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Protocol</th>
                <th className="py-3 px-4">Source Network / Wildcard</th>
                <th className="py-3 px-4">Destination Network / Wildcard</th>
                <th className="py-3 px-4">Hit Matches</th>
                <th className="py-3 px-4">Rule Description</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedRules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-800/40 transition">
                  {/* Sequence */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    {rule.sequence}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        rule.action === 'permit'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {rule.action}
                    </span>
                  </td>

                  {/* Protocol */}
                  <td className="py-3.5 px-4 text-cyan-300 uppercase">
                    {rule.protocol}
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4 text-slate-200">
                    {rule.sourceNetwork} {rule.sourceWildcard}
                  </td>

                  {/* Destination */}
                  <td className="py-3.5 px-4 text-slate-200">
                    {rule.destNetwork} {rule.destWildcard}
                  </td>

                  {/* Hit Count */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-400">
                      {rule.hitCount} matches
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">
                    {rule.description}
                  </td>

                  {/* Delete button (for custom added rules) */}
                  <td className="py-3.5 px-4 text-right">
                    {!rule.isDefault && (
                      <button
                        onClick={() => setDeleteRuleConfirm(rule)}
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition cursor-pointer"
                        title="Delete custom rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateRule}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Extended ACL Rule</h3>
              <button type="button" onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Sequence Number (e.g. 55):</label>
                <input
                  type="number"
                  value={newSeq}
                  onChange={e => setNewSeq(parseInt(e.target.value, 10))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Action:</label>
                <select
                  value={newAction}
                  onChange={e => setNewAction(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="deny">deny</option>
                  <option value="permit">permit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Protocol:</label>
                <select
                  value={newProto}
                  onChange={e => setNewProto(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ip">ip</option>
                  <option value="tcp">tcp</option>
                  <option value="udp">udp</option>
                  <option value="icmp">icmp</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Source Network (or any):</label>
                <input
                  type="text"
                  value={newSrcNet}
                  onChange={e => setNewSrcNet(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Source Wildcard Mask:</label>
                <input
                  type="text"
                  value={newSrcWild}
                  onChange={e => setNewSrcWild(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Destination Network (or any):</label>
                <input
                  type="text"
                  value={newDstNet}
                  onChange={e => setNewDstNet(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Destination Wildcard Mask:</label>
                <input
                  type="text"
                  value={newDstWild}
                  onChange={e => setNewDstWild(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 mb-1 font-sans">Rule Description:</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Insert Rule into ACL Sequence
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Rule Confirmation */}
      {deleteRuleConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-base text-white">Delete ACL Rule Sequence {deleteRuleConfirm.sequence}?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove rule: <span className="font-mono text-white">{deleteRuleConfirm.sequence} {deleteRuleConfirm.action} {deleteRuleConfirm.protocol} {deleteRuleConfirm.sourceNetwork} → {deleteRuleConfirm.destNetwork}</span>?
            </p>
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setDeleteRuleConfirm(null)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteAclRule(deleteRuleConfirm.id);
                  setDeleteRuleConfirm(null);
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
