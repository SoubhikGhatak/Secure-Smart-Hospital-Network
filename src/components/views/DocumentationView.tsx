import React from 'react';
import {
  BookOpen,
  Download,
  FileCheck,
  ShieldCheck,
  GitFork,
  Layers,
  Server,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

export const DocumentationView: React.FC = () => {
  const { vlans, devices, subinterfaces, aclConfig } = useNetwork();

  const handleDownloadSummary = () => {
    const summaryMd = `# SECURE SMART HOSPITAL NETWORK
## Academic Project Architecture & Engineering Specification
### Intelligent Network Management & Security Simulation System

---

### 1. ABSTRACT
Modern healthcare facilities rely heavily on interconnected medical instrumentation, electronic health records (EHR), and patient management systems. Unsegmented hospital networks present grave cybersecurity risks, where compromised guest devices or commodity malware can spread laterally to critical patient telemetry and ICU monitors.

This project delivers the architecture and functional simulation of a Secure Smart Hospital Network built on enterprise Cisco networking principles:
1. IEEE 802.1Q Virtual Local Area Network (VLAN) segmentation into 6 dedicated broadcast domains.
2. Router-on-a-Stick (ROAS) inter-VLAN routing utilizing a Cisco 2911 router with GigabitEthernet0/0 subinterfaces.
3. High-density access-port switching with 802.1Q trunking on a Cisco Catalyst 2960 switch.
4. Dynamic Host Configuration Protocol (DHCP) pools dedicated to each department.
5. Zero-Trust Guest Network Isolation enforced via Cisco Extended Access Control List (ACL) 'GUEST_ISOLATION'.
6. Centralized Datacenter Server Farm in VLAN 60 (EHR Clinical Portal, Authoritative DNS, and Automated PACS Backup).

---

### 2. VLAN CONFIGURATION MATRIX

| VLAN ID | Department | Network Subnet | Default Gateway | Switch Ports | Security Classification |
|---|---|---|---|---|---|
| 10 | Administration | 192.168.10.0/24 | 192.168.10.1 | Fa0/1–2 | High |
| 20 | Reception | 192.168.20.0/24 | 192.168.20.1 | Fa0/3–4 | Medium |
| 30 | Medical / Doctors | 192.168.30.0/24 | 192.168.30.1 | Fa0/5–7 | Critical |
| 40 | Laboratory | 192.168.40.0/24 | 192.168.40.1 | Fa0/8–9 | High |
| 50 | Guest | 192.168.50.0/24 | 192.168.50.1 | Fa0/10–11 | Isolated |
| 60 | Hospital Servers | 192.168.60.0/24 | 192.168.60.1 | Fa0/12–14 | Critical |

Trunk Port: GigabitEthernet0/1 (Switch) <-> GigabitEthernet0/0 (Router), Carrying VLANs 10,20,30,40,50,60.

---

### 3. HOSPITAL SERVER INFRASTRUCTURE (VLAN 60)

| Server Hostname | IPv4 Address | MAC Address | Switchport | Primary Role |
|---|---|---|---|---|
| HOSPITAL-SRV | 192.168.60.10 | 00:0A:95:60:10:01 | Fa0/12 | Core EHR Portal, Patient Admission, Bed Occupancy |
| DNS-SRV | 192.168.60.11 | 00:0A:95:60:11:02 | Fa0/13 | Authoritative Resolver (hospital.local, backup.local) |
| BACKUP-SRV | 192.168.60.12 | 00:0A:95:60:12:03 | Fa0/14 | PACS Radiology DICOM & SQL Daily Differential Backups |

---

### 4. EXTENDED ACCESS CONTROL LIST SPECIFICATION
ACL Identifier: GUEST_ISOLATION
Placement: Inbound on router subinterface GigabitEthernet0/0.50

Rules:
10 deny ip 192.168.50.0 0.0.0.255 192.168.10.0 0.0.0.255 (Deny to Admin)
20 deny ip 192.168.50.0 0.0.0.255 192.168.20.0 0.0.0.255 (Deny to Reception)
30 deny ip 192.168.50.0 0.0.0.255 192.168.30.0 0.0.0.255 (Deny to Medical / Doctors)
40 deny ip 192.168.50.0 0.0.0.255 192.168.40.0 0.0.0.255 (Deny to Laboratory)
50 deny ip 192.168.50.0 0.0.0.255 192.168.60.0 0.0.0.255 (Deny to Hospital Servers)
60 permit ip 192.168.50.0 0.0.0.255 any (Permit Outbound Internet/Guest services)
70 permit ip any any (Permit internal authorized inter-VLAN flows)

---

### 5. VERIFICATION & EVALUATION METHODOLOGY
All test scenarios were evaluated using simulated ICMP Echo probes, routing path traces, and ACL matching algorithms:
- Admin PC to Hospital Server: ALLOWED (Direct Inter-VLAN Route)
- Medical PC to Hospital Server: ALLOWED (Authorized Clinical Access)
- Guest PC to Hospital Server: BLOCKED (Matched Rule 50 Deny)
- Guest PC to Medical PC: BLOCKED (Matched Rule 30 Deny)

Generated on: ${new Date().toISOString()}
Academic Project Defense Ready.
`;

    const blob = new Blob([summaryMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Secure_Smart_Hospital_Network_Specification.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Academic Project Documentation & Architecture Blueprint
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Academic paper reference for "Design and Simulation of a Secure Smart Hospital Network".
            Includes problem formulation, IEEE 802.1Q VLAN matrix, Router-on-a-Stick mechanics, and Extended ACL policy.
          </p>
        </div>

        <button
          onClick={handleDownloadSummary}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Project Report (.md)</span>
        </button>
      </div>

      {/* Chapter 1: Abstract & Objectives */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">
            1. Abstract, Problem Statement & Objectives
          </h3>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            <strong className="text-white">Problem Statement:</strong> Traditional legacy hospital networks often operate flat Layer-2 topologies where administrative terminals, visitor mobile devices, and mission-critical telemetry devices (e.g. bedside ICU monitors, MRI scanners) coexist in the same broadcast domain. This creates severe vulnerabilities:
          </p>

          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Broadcast radiation and ARP storm saturation degrading medical telemetry latency.</li>
            <li>Zero segmentation between unauthenticated guest Wi-Fi and patient medical record databases.</li>
            <li>Lateral movement of malware (e.g. ransomware targeting healthcare facilities) across subnets.</li>
          </ul>

          <p>
            <strong className="text-white">Project Objectives:</strong>
          </p>

          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Isolate departments into 6 logically distinct VLANs (VLAN 10, 20, 30, 40, 50, 60).</li>
            <li>Implement Router-on-a-Stick (ROAS) on a single physical link via subinterfaces and 802.1Q dot1q encapsulation.</li>
            <li>Centralize DHCP service provisioning on the router to dynamically assign IP parameters per department.</li>
            <li>Enforce complete isolation of the Guest network (VLAN 50) using an inbound Extended Access Control List (ACL).</li>
            <li>Deploy dedicated hospital infrastructure: Electronic Health Record (EHR) server, internal DNS, and encrypted backup storage.</li>
          </ul>
        </div>
      </div>

      {/* Chapter 2: VLAN Segmentation & IP Scheme Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base text-white">
            2. Hospital VLAN Configuration & Subnet Scheme
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">VLAN ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Network Subnet</th>
                <th className="py-2.5 px-3">Subnet Mask</th>
                <th className="py-2.5 px-3">Default Gateway</th>
                <th className="py-2.5 px-3">Switch Port Range</th>
                <th className="py-2.5 px-3">Security Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vlans.map(v => (
                <tr key={v.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">VLAN {v.id}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-sans">{v.department}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{v.subnet}/24</td>
                  <td className="py-2.5 px-3 text-slate-400">{v.netmask}</td>
                  <td className="py-2.5 px-3 text-slate-300">{v.defaultGateway}</td>
                  <td className="py-2.5 px-3 text-slate-400">{v.switchPorts}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-sans">{v.securityClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chapter 3: Router-on-a-Stick Architecture */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <GitFork className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">
            3. Router-on-a-Stick (ROAS) Mechanics & Subinterface Design
          </h3>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            Rather than requiring a dedicated physical router interface for every departmental VLAN, the network implements
            <strong> Router-on-a-Stick (ROAS)</strong>. A single physical trunk cable connects switch port <code>Gi0/1</code>
            to router port <code>Gi0/0</code>.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="text-cyan-400 font-bold">Subinterface Dot1Q Encapsulation Table:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              {subinterfaces.map(s => (
                <div key={s.interfaceName} className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-white font-bold">{s.interfaceName}: </span>
                  <span className="text-cyan-300">{s.encapsulation}</span> · IP: {s.ipAddress}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter 4: Extended ACL Policy */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">
            4. Security Policy: Extended Access Control List (GUEST_ISOLATION)
          </h3>
        </div>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            The Guest VLAN (192.168.50.0/24) is quarantined using Cisco Extended ACL <code>GUEST_ISOLATION</code> applied
            inbound on router subinterface <code>GigabitEthernet0/0.50</code>. The rule sequence denies guest packets
            from reaching any internal departmental subnet or the VLAN 60 server farm:
          </p>

          <pre className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-[11px] text-amber-300 leading-relaxed overflow-x-auto">
{`ip access-list extended GUEST_ISOLATION
 10 deny ip 192.168.50.0 0.0.0.255 192.168.10.0 0.0.0.255 (Administration)
 20 deny ip 192.168.50.0 0.0.0.255 192.168.20.0 0.0.0.255 (Reception)
 30 deny ip 192.168.50.0 0.0.0.255 192.168.30.0 0.0.0.255 (Medical / Doctors)
 40 deny ip 192.168.50.0 0.0.0.255 192.168.40.0 0.0.0.255 (Laboratory)
 50 deny ip 192.168.50.0 0.0.0.255 192.168.60.0 0.0.0.255 (Hospital Servers)
 60 permit ip 192.168.50.0 0.0.0.255 any (Permit Outbound Internet)
 70 permit ip any any (Permit Internal Inter-Departmental Traffic)`}
          </pre>
        </div>
      </div>

      {/* Chapter 5: Conclusion */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
        <h3 className="font-bold text-base text-white">5. Results and Conclusion</h3>
        <p>
          The simulation confirms that departmental VLAN segmentation combined with stateful Extended ACL filtering
          successfully prevents unauthorized lateral infiltration from guest Wi-Fi clients while permitting high-speed
          inter-VLAN clinical communications between authorized medical workstations and core healthcare services.
        </p>
      </div>
    </div>
  );
};
