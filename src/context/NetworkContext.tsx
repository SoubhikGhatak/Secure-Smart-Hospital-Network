import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Vlan,
  NetworkDevice,
  DhcpPool,
  DhcpLease,
  RouterSubinterface,
  RouteEntry,
  AclConfig,
  AclRule,
  DnsRecord,
  BackupJob,
  PatientRecord,
  DoctorAppointment,
  SystemLog,
  TrafficEvent,
  ConnectivityTestResult
} from '../types/network';
import {
  DEFAULT_VLANS,
  DEFAULT_DEVICES,
  DEFAULT_SUBINTERFACES,
  DEFAULT_DHCP_POOLS,
  DEFAULT_DHCP_LEASES,
  DEFAULT_ROUTING_TABLE,
  DEFAULT_ACL,
  DEFAULT_DNS_RECORDS,
  DEFAULT_BACKUP_JOBS,
  DEFAULT_PATIENTS,
  DEFAULT_APPOINTMENTS,
  DEFAULT_LOGS,
  INITIAL_TRAFFIC_EVENTS
} from '../simulation/defaultData';
import {
  allocateDhcpAddress,
  evaluateAcl,
  executeDiagnosticTest,
  traceRoutingPath,
  RoutingDecision
} from '../simulation/networkEngine';

const STORAGE_KEY = 'SMART_HOSPITAL_SIMULATION_STATE_V1';

export interface PacketAnimationState {
  id: string;
  sourceDevice: NetworkDevice;
  destDevice: NetworkDevice;
  routingDecision: RoutingDecision;
  currentStepIndex: number;
  isComplete: boolean;
}

interface NetworkContextType {
  vlans: Vlan[];
  devices: NetworkDevice[];
  subinterfaces: RouterSubinterface[];
  dhcpPools: DhcpPool[];
  dhcpLeases: DhcpLease[];
  routingTable: RouteEntry[];
  aclConfig: AclConfig;
  dnsRecords: DnsRecord[];
  backupJobs: BackupJob[];
  patients: PatientRecord[];
  appointments: DoctorAppointment[];
  systemLogs: SystemLog[];
  trafficEvents: TrafficEvent[];
  selectedDevice: NetworkDevice | null;
  setSelectedDevice: (device: NetworkDevice | null) => void;
  activeTestResult: ConnectivityTestResult | null;
  animatingPacket: PacketAnimationState | null;
  setAnimatingPacket: (packet: PacketAnimationState | null) => void;

  // Actions
  resetToDefault: () => void;
  addLog: (
    category: SystemLog['category'],
    severity: SystemLog['severity'],
    description: string,
    sourceDevice?: string,
    destDevice?: string,
    ip?: string
  ) => void;
  requestDhcp: (deviceId: string) => { success: boolean; message: string };
  releaseDhcp: (deviceId: string) => { success: boolean; message: string };
  renewDhcp: (deviceId: string) => { success: boolean; message: string };
  toggleAcl: (enabled: boolean) => void;
  addAclRule: (rule: Omit<AclRule, 'id' | 'hitCount'>) => void;
  updateAclRule: (id: string, updates: Partial<AclRule>) => void;
  deleteAclRule: (id: string) => void;
  addVlan: (vlan: Omit<Vlan, 'isCustom'>) => void;
  updateVlan: (id: number, updates: Partial<Vlan>) => void;
  deleteVlan: (id: number) => void;
  moveDeviceVlan: (deviceId: string, newVlanId: number) => void;
  updateDevice: (id: string, updates: Partial<NetworkDevice>) => void;
  addDevice: (device: Omit<NetworkDevice, 'id' | 'txBytes' | 'rxBytes'>) => void;
  deleteDevice: (id: string) => void;
  addDnsRecord: (record: Omit<DnsRecord, 'id'>) => void;
  deleteDnsRecord: (id: string) => void;
  runBackupJob: (jobId: string) => void;
  addPatient: (patient: Omit<PatientRecord, 'id' | 'mrn'>) => void;
  addAppointment: (appointment: Omit<DoctorAppointment, 'id'>) => void;
  generateTrafficBurst: () => void;
  runTest: (
    type: 'PING' | 'TRACEROUTE' | 'DNS' | 'DHCP' | 'ROUTING' | 'ACL',
    sourceDeviceId: string,
    targetInput: string
  ) => ConnectivityTestResult;
  clearLogs: () => void;
  exportLogsCsv: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [vlans, setVlans] = useState<Vlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vlans`);
    return saved ? JSON.parse(saved) : DEFAULT_VLANS;
  });

  const [devices, setDevices] = useState<NetworkDevice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_devices`);
    return saved ? JSON.parse(saved) : DEFAULT_DEVICES;
  });

  const [subinterfaces, setSubinterfaces] = useState<RouterSubinterface[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subinterfaces`);
    return saved ? JSON.parse(saved) : DEFAULT_SUBINTERFACES;
  });

  const [dhcpPools, setDhcpPools] = useState<DhcpPool[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dhcpPools`);
    return saved ? JSON.parse(saved) : DEFAULT_DHCP_POOLS;
  });

  const [dhcpLeases, setDhcpLeases] = useState<DhcpLease[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dhcpLeases`);
    return saved ? JSON.parse(saved) : DEFAULT_DHCP_LEASES;
  });

  const [routingTable, setRoutingTable] = useState<RouteEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_routes`);
    return saved ? JSON.parse(saved) : DEFAULT_ROUTING_TABLE;
  });

  const [aclConfig, setAclConfig] = useState<AclConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_acl`);
    return saved ? JSON.parse(saved) : DEFAULT_ACL;
  });

  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dns`);
    return saved ? JSON.parse(saved) : DEFAULT_DNS_RECORDS;
  });

  const [backupJobs, setBackupJobs] = useState<BackupJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_backups`);
    return saved ? JSON.parse(saved) : DEFAULT_BACKUP_JOBS;
  });

  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
    return saved ? JSON.parse(saved) : DEFAULT_PATIENTS;
  });

  const [appointments, setAppointments] = useState<DoctorAppointment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_appointments`);
    return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
  });

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_traffic`);
    return saved ? JSON.parse(saved) : INITIAL_TRAFFIC_EVENTS;
  });

  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [activeTestResult, setActiveTestResult] = useState<ConnectivityTestResult | null>(null);
  const [animatingPacket, setAnimatingPacket] = useState<PacketAnimationState | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vlans`, JSON.stringify(vlans));
  }, [vlans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_devices`, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_subinterfaces`, JSON.stringify(subinterfaces));
  }, [subinterfaces]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dhcpPools`, JSON.stringify(dhcpPools));
  }, [dhcpPools]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dhcpLeases`, JSON.stringify(dhcpLeases));
  }, [dhcpLeases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_routes`, JSON.stringify(routingTable));
  }, [routingTable]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_acl`, JSON.stringify(aclConfig));
  }, [aclConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dns`, JSON.stringify(dnsRecords));
  }, [dnsRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_backups`, JSON.stringify(backupJobs));
  }, [backupJobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(systemLogs));
  }, [systemLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_traffic`, JSON.stringify(trafficEvents));
  }, [trafficEvents]);

  const addLog = (
    category: SystemLog['category'],
    severity: SystemLog['severity'],
    description: string,
    sourceDevice?: string,
    destDevice?: string,
    ip?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      category,
      severity,
      sourceDevice,
      destDevice,
      ip,
      description
    };
    setSystemLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  const resetToDefault = () => {
    localStorage.clear();
    setVlans(DEFAULT_VLANS);
    setDevices(DEFAULT_DEVICES);
    setSubinterfaces(DEFAULT_SUBINTERFACES);
    setDhcpPools(DEFAULT_DHCP_POOLS);
    setDhcpLeases(DEFAULT_DHCP_LEASES);
    setRoutingTable(DEFAULT_ROUTING_TABLE);
    setAclConfig(DEFAULT_ACL);
    setDnsRecords(DEFAULT_DNS_RECORDS);
    setBackupJobs(DEFAULT_BACKUP_JOBS);
    setPatients(DEFAULT_PATIENTS);
    setAppointments(DEFAULT_APPOINTMENTS);
    setSystemLogs(DEFAULT_LOGS);
    setTrafficEvents(INITIAL_TRAFFIC_EVENTS);
    setSelectedDevice(null);
    setActiveTestResult(null);
    setAnimatingPacket(null);
    addLog('CONFIG', 'INFO', 'Factory network reset performed: Restored original hospital architecture (6 VLANs, Router-on-a-Stick, Cisco 2911, Catalyst 2960, and ACL).');
  };

  const requestDhcp = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    const pool = dhcpPools.find(p => p.vlanId === dev.vlanId);
    if (!pool) {
      addLog('DHCP', 'WARNING', `DHCPDISCOVER from ${dev.name} failed: No active DHCP pool configured for VLAN ${dev.vlanId}.`, dev.name);
      return { success: false, message: `No active DHCP pool for VLAN ${dev.vlanId}` };
    }

    const alloc = allocateDhcpAddress(dev, pool, devices, dhcpLeases);
    if (!alloc.success || !alloc.ip || !alloc.lease) {
      addLog('DHCP', 'CRITICAL', `DHCP allocation failed for ${dev.name}: ${alloc.error}`, dev.name);
      return { success: false, message: alloc.error || 'DHCP pool allocation failed' };
    }

    // Update device
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          ip: alloc.ip!,
          subnetMask: pool.netmask,
          gateway: pool.defaultRouter,
          ipAssignment: 'DHCP'
        };
      }
      return d;
    }));

    // Update lease table (replace old lease for this MAC if any)
    setDhcpLeases(prev => {
      const filtered = prev.filter(l => l.mac !== dev.mac);
      return [alloc.lease!, ...filtered];
    });

    addLog(
      'DHCP',
      'INFO',
      `DHCPACK assigned ${alloc.ip} to ${dev.name} (MAC: ${dev.mac}) via pool ${pool.name}. Lease duration: ${pool.leaseTimeSeconds / 3600} hrs.`,
      dev.name,
      undefined,
      alloc.ip
    );

    return { success: true, message: `Assigned IP ${alloc.ip} from pool ${pool.name}` };
  };

  const releaseDhcp = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    setDhcpLeases(prev => prev.filter(l => l.mac !== dev.mac));
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return { ...d, ip: '0.0.0.0' };
      }
      return d;
    }));

    addLog('DHCP', 'INFO', `DHCPRELEASE: Address ${dev.ip} released back to pool by ${dev.name}.`, dev.name, undefined, dev.ip);
    return { success: true, message: `Released IP ${dev.ip}` };
  };

  const renewDhcp = (deviceId: string) => {
    return requestDhcp(deviceId);
  };

  const toggleAcl = (enabled: boolean) => {
    setAclConfig(prev => ({ ...prev, enabled }));
    addLog(
      'ACL',
      enabled ? 'WARNING' : 'CRITICAL',
      `ACL GUEST_ISOLATION ${enabled ? 'ENABLED' : 'DISABLED'} on interface GigabitEthernet0/0.50 inbound.`
    );
  };

  const addAclRule = (rule: Omit<AclRule, 'id' | 'hitCount'>) => {
    const newRule: AclRule = {
      ...rule,
      id: `acl-custom-${Date.now()}`,
      hitCount: 0,
      isDefault: false
    };
    setAclConfig(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    addLog('ACL', 'INFO', `Added custom ACL rule sequence ${rule.sequence}: ${rule.action} ${rule.protocol} ${rule.sourceNetwork} -> ${rule.destNetwork}`);
  };

  const updateAclRule = (id: string, updates: Partial<AclRule>) => {
    setAclConfig(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
    addLog('ACL', 'INFO', `Updated ACL rule ID ${id}.`);
  };

  const deleteAclRule = (id: string) => {
    const target = aclConfig.rules.find(r => r.id === id);
    setAclConfig(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== id)
    }));
    addLog('ACL', 'WARNING', `Removed ACL rule ${target?.sequence || id} (${target?.description || ''}).`);
  };

  const addVlan = (vlan: Omit<Vlan, 'isCustom'>) => {
    const newVlan: Vlan = { ...vlan, isCustom: true };
    setVlans(prev => [...prev, newVlan]);

    // Also provision router subinterface for Router-on-a-Stick
    const subName = `GigabitEthernet0/0.${vlan.id}`;
    const newSub: RouterSubinterface = {
      interfaceName: subName,
      vlanId: vlan.id,
      ipAddress: vlan.defaultGateway,
      subnetMask: vlan.netmask,
      status: 'up',
      encapsulation: `dot1Q ${vlan.id}`
    };
    setSubinterfaces(prev => [...prev, newSub]);

    // Add route entry
    const newRoute: RouteEntry = {
      type: 'C',
      network: vlan.subnet,
      netmask: vlan.netmask,
      interface: subName,
      metric: '0'
    };
    setRoutingTable(prev => [...prev, newRoute]);

    addLog('VLAN', 'INFO', `Created custom VLAN ${vlan.id} (${vlan.name}). Provisioned subinterface ${subName} on HOSPITAL-R1.`);
  };

  const updateVlan = (id: number, updates: Partial<Vlan>) => {
    setVlans(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    addLog('VLAN', 'INFO', `Updated VLAN ${id} configuration.`);
  };

  const deleteVlan = (id: number) => {
    setVlans(prev => prev.filter(v => v.id !== id));
    setSubinterfaces(prev => prev.filter(s => s.vlanId !== id));
    setRoutingTable(prev => prev.filter(r => !r.interface.endsWith(`.${id}`)));
    addLog('VLAN', 'WARNING', `Deleted custom VLAN ${id} and removed associated router subinterface.`);
  };

  const moveDeviceVlan = (deviceId: string, newVlanId: number) => {
    const targetVlan = vlans.find(v => v.id === newVlanId);
    if (!targetVlan) return;

    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          vlanId: newVlanId,
          gateway: targetVlan.defaultGateway,
          // release old IP so it can request DHCP or get auto-assigned in new subnet
          ip: `${targetVlan.subnet.split('.').slice(0, 3).join('.')}.${Math.floor(Math.random() * 80) + 120}`
        };
      }
      return d;
    }));

    addLog('DEVICE', 'INFO', `Device ${deviceId} migrated to VLAN ${newVlanId} (${targetVlan.name}). Gateway updated to ${targetVlan.defaultGateway}.`);
  };

  const updateDevice = (id: string, updates: Partial<NetworkDevice>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    addLog('DEVICE', 'INFO', `Updated device parameters for ${id}.`);
  };

  const addDevice = (deviceData: Omit<NetworkDevice, 'id' | 'txBytes' | 'rxBytes'>) => {
    const newDevice: NetworkDevice = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      txBytes: 12000,
      rxBytes: 18000
    };
    setDevices(prev => [...prev, newDevice]);
    addLog('DEVICE', 'INFO', `Added new network device ${newDevice.name} on VLAN ${newDevice.vlanId} (Port ${newDevice.switchPort}).`);
  };

  const deleteDevice = (id: string) => {
    const dev = devices.find(d => d.id === id);
    setDevices(prev => prev.filter(d => d.id !== id));
    setDhcpLeases(prev => prev.filter(l => l.mac !== dev?.mac));
    addLog('DEVICE', 'WARNING', `Removed device ${dev?.name || id} from the topology.`);
  };

  const addDnsRecord = (record: Omit<DnsRecord, 'id'>) => {
    const newRecord: DnsRecord = {
      ...record,
      id: `dns-${Date.now()}`
    };
    setDnsRecords(prev => [...prev, newRecord]);
    addLog('DNS', 'INFO', `Added authoritative DNS record: ${record.hostname} -> ${record.ip} (${record.type}).`);
  };

  const deleteDnsRecord = (id: string) => {
    const rec = dnsRecords.find(r => r.id === id);
    setDnsRecords(prev => prev.filter(r => r.id !== id));
    addLog('DNS', 'WARNING', `Deleted DNS record for ${rec?.hostname || id}.`);
  };

  const runBackupJob = (jobId: string) => {
    setBackupJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'Completed',
          lastRun: 'Just now'
        };
      }
      return j;
    }));
    const job = backupJobs.find(j => j.id === jobId);
    addLog('SERVER', 'INFO', `Executed backup job [${job?.name || jobId}]. Verified sha256 checksum at BACKUP-SRV (192.168.60.12).`);
  };

  const addPatient = (patient: Omit<PatientRecord, 'id' | 'mrn'>) => {
    const count = patients.length + 1;
    const mrn = `HOSP-2026-0${930 + count}`;
    const newPatient: PatientRecord = {
      ...patient,
      id: `pat-${Date.now()}`,
      mrn
    };
    setPatients(prev => [newPatient, ...prev]);
    addLog('SERVER', 'INFO', `EHR Admission: Registered new patient ${patient.name} (${mrn}) in ${patient.department} - ${patient.room}.`);
  };

  const addAppointment = (appointment: Omit<DoctorAppointment, 'id'>) => {
    const newApt: DoctorAppointment = {
      ...appointment,
      id: `apt-${Date.now()}`
    };
    setAppointments(prev => [newApt, ...prev]);
    addLog('SERVER', 'INFO', `Scheduled clinical appointment for ${appointment.patientName} with ${appointment.doctorName} at ${appointment.time}.`);
  };

  const generateTrafficBurst = () => {
    const internalDevices = devices.filter(d => d.type !== 'router' && d.type !== 'switch');
    if (internalDevices.length < 2) return;

    const newEvents: TrafficEvent[] = [];
    const protocols: TrafficEvent['protocol'][] = ['HTTPS', 'HTTP', 'DNS', 'TCP', 'UDP', 'ICMP'];

    for (let i = 0; i < 4; i++) {
      const src = internalDevices[Math.floor(Math.random() * internalDevices.length)];
      let dst = internalDevices[Math.floor(Math.random() * internalDevices.length)];
      while (dst.id === src.id) {
        dst = internalDevices[Math.floor(Math.random() * internalDevices.length)];
      }

      const proto = protocols[Math.floor(Math.random() * protocols.length)];
      const aclRes = evaluateAcl(src.ip, dst.ip, proto.toLowerCase() as any, aclConfig);
      const isAllowed = aclRes.action === 'permit';

      // Increment ACL rule hit count if matched
      if (aclRes.matchedRule) {
        setAclConfig(prev => ({
          ...prev,
          rules: prev.rules.map(r => r.id === aclRes.matchedRule?.id ? { ...r, hitCount: r.hitCount + 1 } : r)
        }));
      }

      const event: TrafficEvent = {
        id: `tr-${Date.now()}-${i}`,
        timestamp: new Date().toTimeString().slice(0, 8),
        sourceIp: src.ip,
        sourceName: src.name,
        destIp: dst.ip,
        destName: dst.name,
        sourceVlan: src.vlanId,
        destVlan: dst.vlanId,
        protocol: proto,
        packetCount: Math.floor(Math.random() * 40) + 4,
        bytes: Math.floor(Math.random() * 50000) + 1200,
        status: isAllowed ? 'ALLOWED' : 'BLOCKED',
        reason: isAllowed ? 'Permitted by security policy' : aclRes.reason
      };

      newEvents.push(event);

      // Increment device tx/rx
      setDevices(prev => prev.map(d => {
        if (d.id === src.id) return { ...d, txBytes: d.txBytes + event.bytes };
        if (d.id === dst.id) return { ...d, rxBytes: d.rxBytes + event.bytes };
        return d;
      }));
    }

    setTrafficEvents(prev => [...newEvents, ...prev.slice(0, 40)]);
    addLog('SECURITY', 'INFO', `Simulated network traffic burst generated (${newEvents.length} flows across 6 VLANs).`);
  };

  const runTest = (
    type: 'PING' | 'TRACEROUTE' | 'DNS' | 'DHCP' | 'ROUTING' | 'ACL',
    sourceDeviceId: string,
    targetInput: string
  ): ConnectivityTestResult => {
    const src = devices.find(d => d.id === sourceDeviceId) || devices[0];
    const dst = devices.find(d => d.ip === targetInput || d.name.toLowerCase() === targetInput.toLowerCase()) || null;

    const result = executeDiagnosticTest(
      type,
      src,
      targetInput,
      dst,
      vlans,
      aclConfig,
      subinterfaces,
      dnsRecords,
      dhcpPools
    );

    setActiveTestResult(result);

    // If destination device is valid, trigger visual packet animation on topology!
    if (dst) {
      const decision = traceRoutingPath(src, dst, aclConfig, subinterfaces);
      setAnimatingPacket({
        id: `packet-${Date.now()}`,
        sourceDevice: src,
        destDevice: dst,
        routingDecision: decision,
        currentStepIndex: 0,
        isComplete: false
      });

      // Update ACL hit counter if rule matched
      if (decision.aclResult?.matchedRule) {
        setAclConfig(prev => ({
          ...prev,
          rules: prev.rules.map(r => r.id === decision.aclResult?.matchedRule?.id ? { ...r, hitCount: r.hitCount + 1 } : r)
        }));
      }
    }

    // Log the diagnostic test
    addLog(
      type === 'ACL' ? 'ACL' : type === 'PING' ? 'PING' : type === 'DNS' ? 'DNS' : 'ROUTING',
      result.status === 'ALLOWED' || result.status === 'SUCCESS' ? 'INFO' : 'CRITICAL',
      `${type} diagnostic from ${src.name} to ${targetInput}: ${result.status} - ${result.details}`,
      src.name,
      dst?.name,
      result.destIp
    );

    return result;
  };

  const clearLogs = () => {
    setSystemLogs([]);
    addLog('CONFIG', 'INFO', 'System event log repository cleared by administrator.');
  };

  const exportLogsCsv = () => {
    const headers = ['Event ID', 'Timestamp', 'Category', 'Severity', 'Source Device', 'Dest Device', 'IP', 'Description'];
    const rows = systemLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      l.category,
      l.severity,
      `"${l.sourceDevice || ''}"`,
      `"${l.destDevice || ''}"`,
      `"${l.ip || ''}"`,
      `"${l.description.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_hospital_network_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <NetworkContext.Provider
      value={{
        vlans,
        devices,
        subinterfaces,
        dhcpPools,
        dhcpLeases,
        routingTable,
        aclConfig,
        dnsRecords,
        backupJobs,
        patients,
        appointments,
        systemLogs,
        trafficEvents,
        selectedDevice,
        setSelectedDevice,
        activeTestResult,
        animatingPacket,
        setAnimatingPacket,
        resetToDefault,
        addLog,
        requestDhcp,
        releaseDhcp,
        renewDhcp,
        toggleAcl,
        addAclRule,
        updateAclRule,
        deleteAclRule,
        addVlan,
        updateVlan,
        deleteVlan,
        moveDeviceVlan,
        updateDevice,
        addDevice,
        deleteDevice,
        addDnsRecord,
        deleteDnsRecord,
        runBackupJob,
        addPatient,
        addAppointment,
        generateTrafficBurst,
        runTest,
        clearLogs,
        exportLogsCsv
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
