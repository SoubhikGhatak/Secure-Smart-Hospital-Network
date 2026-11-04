import React, { useState } from 'react';
import {
  Server,
  Globe,
  Database,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Users,
  Calendar,
  Clock,
  Trash2,
  Search,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { DnsRecord, PatientRecord, DoctorAppointment } from '../../types/network';

export const ServerInfrastructureView: React.FC = () => {
  const {
    dnsRecords,
    addDnsRecord,
    deleteDnsRecord,
    backupJobs,
    runBackupJob,
    patients,
    addPatient,
    appointments,
    addAppointment
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<'hospital' | 'dns' | 'backup'>('hospital');

  // Patient registration form state
  const [showAddPatientModal, setShowAddPatientModal] = useState<boolean>(false);
  const [newPatName, setNewPatName] = useState<string>('Jonathan Reed');
  const [newPatAge, setNewPatAge] = useState<number>(38);
  const [newPatGender, setNewPatGender] = useState<string>('Male');
  const [newPatDept, setNewPatDept] = useState<string>('Neurology');
  const [newPatRoom, setNewPatRoom] = useState<string>('Ward 4C - Bed 8');
  const [newPatDoctor, setNewPatDoctor] = useState<string>('Dr. Marcus Vance (MD)');

  // Appointment form state
  const [showAddAptModal, setShowAddAptModal] = useState<boolean>(false);
  const [aptDoctor, setAptDoctor] = useState<string>('Dr. Marcus Vance (MD)');
  const [aptPatient, setAptPatient] = useState<string>('Elena Rostova');
  const [aptDept, setAptDept] = useState<string>('Cardiology');
  const [aptTime, setAptTime] = useState<string>('02:30 PM');
  const [aptType, setAptType] = useState<DoctorAppointment['type']>('Consultation');

  // DNS form state
  const [showAddDnsModal, setShowAddDnsModal] = useState<boolean>(false);
  const [dnsHost, setDnsHost] = useState<string>('pacs.hospital.local');
  const [dnsIp, setDnsIp] = useState<string>('192.168.60.12');
  const [dnsType, setDnsType] = useState<'A' | 'CNAME'>('A');

  // Interactive DNS Query Tester state
  const [testDomainQuery, setTestDomainQuery] = useState<string>('hospital.local');
  const [dnsQueryResult, setDnsQueryResult] = useState<{ found: boolean; ip?: string; details: string } | null>(null);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({
      name: newPatName,
      age: newPatAge,
      gender: newPatGender,
      department: newPatDept,
      admissionDate: new Date().toISOString().slice(0, 10),
      status: 'Admitted',
      room: newPatRoom,
      attendingDoctor: newPatDoctor
    });
    setShowAddPatientModal(false);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      doctorName: aptDoctor,
      patientName: aptPatient,
      department: aptDept,
      time: aptTime,
      type: aptType,
      status: 'Scheduled'
    });
    setShowAddAptModal(false);
  };

  const handleCreateDns = (e: React.FormEvent) => {
    e.preventDefault();
    addDnsRecord({
      hostname: dnsHost.toLowerCase().trim(),
      ip: dnsIp.trim(),
      type: dnsType,
      ttl: 3600,
      description: `Authoritative entry for ${dnsHost}`
    });
    setShowAddDnsModal(false);
  };

  const handleTestDnsQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const query = testDomainQuery.toLowerCase().trim();
    const rec = dnsRecords.find(r => r.hostname.toLowerCase() === query);
    if (rec) {
      setDnsQueryResult({
        found: true,
        ip: rec.ip,
        details: `DNS Query SUCCESS: Resolved ${rec.hostname} to IPv4 ${rec.ip} (${rec.type} record, TTL ${rec.ttl}s) via DNS-SRV (192.168.60.11).`
      });
    } else {
      setDnsQueryResult({
        found: false,
        details: `NXDOMAIN: Domain name "${query}" not found in DNS-SRV authoritative lookup table.`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hospital Server Farm Infrastructure (VLAN 60)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Centralized datacenter services in VLAN 60 (192.168.60.0/24). Hosting the Electronic Health Record (EHR) Portal,
            authoritative DNS resolver, and continuous PACS radiological backup storage.
          </p>
        </div>

        {/* Server Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('hospital')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hospital'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>HOSPITAL-SRV (.10)</span>
          </button>

          <button
            onClick={() => setActiveTab('dns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dns'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>DNS-SRV (.11)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>BACKUP-SRV (.12)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HOSPITAL-SRV (192.168.60.10) */}
      {activeTab === 'hospital' && (
        <div className="space-y-6">
          {/* Server Status Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white font-mono text-sm">HOSPITAL-SRV</span>
                <span className="text-slate-400 font-mono ml-2">(192.168.60.10:443 - SSL Active)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Port: Fa0/12</span>
              <span>·</span>
              <span>Gateway: 192.168.60.1</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">Service: EHR Clinical Suite v4.2</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Active Patient Inpatients</div>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {patients.filter(p => p.status === 'Admitted' || p.status === 'In ICU').length}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">84% Bed Occupancy</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">ICU Patients Monitored</div>
              <div className="mt-1 text-xl font-bold font-mono text-pink-400 tabular-nums">
                {patients.filter(p => p.status === 'In ICU').length}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Critical Telemetry Stream</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Consultations Today</div>
              <div className="mt-1 text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {appointments.length}
              </div>
              <div className="text-[10px] text-cyan-500 mt-0.5">Roster Synchronized</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400">Access Security Policy</div>
              <div className="mt-1 text-sm font-bold font-mono text-emerald-400">
                INTERNAL ONLY
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Guest VLAN 50 Denied</div>
            </div>
          </div>

          {/* Patient Records Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Electronic Health Records (Simulated Patient Registry)
                </h3>
              </div>
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Patient Admission</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Medical Record #</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Age / Sex</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Room & Bed</th>
                    <th className="py-3 px-4">Attending Physician</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {p.mrn}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {p.age} y / {p.gender}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {p.department}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {p.room}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {p.attendingDoctor}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            p.status === 'In ICU'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : p.status === 'Admitted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Appointments Roster */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Clinical Appointments & Surgical Schedule
                </h3>
              </div>
              <button
                onClick={() => setShowAddAptModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Appointment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {appointments.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold">{apt.time}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {apt.type}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-400">{apt.doctorName}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                    Dept: {apt.department}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DNS-SRV (192.168.60.11) */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          {/* Server Status Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white font-mono text-sm">DNS-SRV</span>
                <span className="text-slate-400 font-mono ml-2">(192.168.60.11:53 - Authoritative Resolver)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Port: Fa0/13</span>
              <span>·</span>
              <span>Zone: hospital.local</span>
              <span>·</span>
              <span className="text-blue-400 font-semibold">{dnsRecords.length} Active Records</span>
            </div>
          </div>

          {/* Interactive Domain Name Resolution Testing */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Test Internal Domain Name Resolution (nslookup Simulation)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">UDP Port 53 Query</span>
            </div>

            <form onSubmit={handleTestDnsQuery} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. hospital.local, backup.local, router.hospital.local"
                value={testDomainQuery}
                onChange={e => setTestDomainQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Resolve Domain
              </button>
            </form>

            {dnsQueryResult && (
              <div
                className={`p-3 rounded-lg border text-xs font-mono leading-relaxed ${
                  dnsQueryResult.found
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                {dnsQueryResult.details}
              </div>
            )}
          </div>

          {/* DNS Record Management Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Authoritative DNS Zone Records (hospital.local)
                </h3>
              </div>
              <button
                onClick={() => setShowAddDnsModal(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Hostname / FQDN</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Target IP Address</th>
                    <th className="py-3 px-4">TTL (Seconds)</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dnsRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-cyan-300">
                        {rec.hostname}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                          {rec.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        {rec.ip}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {rec.ttl}s
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {rec.description}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteDnsRecord(rec.id)}
                          className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
                          title="Delete DNS record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP-SRV (192.168.60.12) */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Server Status Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white font-mono text-sm">BACKUP-SRV</span>
                <span className="text-slate-400 font-mono ml-2">(192.168.60.12 - SAN / NAS Storage Target)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Port: Fa0/14</span>
              <span>·</span>
              <span>RAID-6 Array</span>
              <span>·</span>
              <span className="text-purple-400 font-semibold">Storage: 795.3 GB / 2000 GB Used (39%)</span>
            </div>
          </div>

          {/* Storage Capacity Gauge */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">Encrypted Backup Repository Storage Pool</span>
              <span className="text-purple-400">39.7% Capacity Consumed</span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
              <div style={{ width: '28%' }} className="bg-purple-600" title="PACS Radiology & MRI: 618 GB" />
              <div style={{ width: '8%' }} className="bg-pink-500" title="EHR Patient DB: 142 GB" />
              <div style={{ width: '3.7%' }} className="bg-blue-500" title="Lab Assays: 34 GB" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>PACS DICOM (618 GB)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>EHR Database (142 GB)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Lab Assays (34 GB)</span>
              </span>
              <span className="flex items-center gap-1.5 ml-auto text-slate-300">
                1,204.7 GB Available
              </span>
            </div>
          </div>

          {/* Automated Backup Jobs Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-2">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Automated PACS & EHR Backup Schedule
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Retention: 60–365 Days</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Backup Job Target</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Last Run</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Retention</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Execute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {backupJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {job.name}
                        <div className="text-[10px] text-slate-400 font-mono">{job.target}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {job.schedule}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {job.lastRun}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300">
                        {job.sizeGb} GB
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {job.retentionDays} Days
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            job.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => runBackupJob(job.id)}
                          className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Run Snapshot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreatePatient}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Register Patient Admission (EHR)</h3>
              <button type="button" onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Full Patient Name:</label>
                <input
                  type="text"
                  value={newPatName}
                  onChange={e => setNewPatName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Age:</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={newPatAge}
                  onChange={e => setNewPatAge(parseInt(e.target.value, 10))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gender:</label>
                <select
                  value={newPatGender}
                  onChange={e => setNewPatGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department:</label>
                <input
                  type="text"
                  value={newPatDept}
                  onChange={e => setNewPatDept(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Room / Bed Assignment:</label>
                <input
                  type="text"
                  value={newPatRoom}
                  onChange={e => setNewPatRoom(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Attending Physician:</label>
                <input
                  type="text"
                  value={newPatDoctor}
                  onChange={e => setNewPatDoctor(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold"
              >
                Admit to Hospital EHR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateAppointment}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Schedule Clinical Appointment</h3>
              <button type="button" onClick={() => setShowAddAptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name:</label>
                <input
                  type="text"
                  value={aptPatient}
                  onChange={e => setAptPatient(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Doctor Name:</label>
                <input
                  type="text"
                  value={aptDoctor}
                  onChange={e => setAptDoctor(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Department:</label>
                  <input
                    type="text"
                    value={aptDept}
                    onChange={e => setAptDept(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Time Slot:</label>
                  <input
                    type="text"
                    value={aptTime}
                    onChange={e => setAptTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddAptModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add DNS Record Modal */}
      {showAddDnsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateDns}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Authoritative DNS Record</h3>
              <button type="button" onClick={() => setShowAddDnsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Domain Hostname (FQDN):</label>
                <input
                  type="text"
                  value={dnsHost}
                  onChange={e => setDnsHost(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Record Type:</label>
                  <select
                    value={dnsType}
                    onChange={e => setDnsType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="A">A (Host Address)</option>
                    <option value="CNAME">CNAME (Alias)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target IPv4 Address:</label>
                  <input
                    type="text"
                    value={dnsIp}
                    onChange={e => setDnsIp(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddDnsModal(false)}
                className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Add DNS Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
