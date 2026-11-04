import {
  Vlan,
  NetworkDevice,
  DhcpPool,
  DhcpLease,
  RouterSubinterface,
  RouteEntry,
  AclConfig,
  DnsRecord,
  BackupJob,
  PatientRecord,
  DoctorAppointment,
  SystemLog,
  TrafficEvent
} from '../types/network';

export const DEFAULT_VLANS: Vlan[] = [
  {
    id: 10,
    name: 'ADMINISTRATION',
    department: 'Administration',
    subnet: '192.168.10.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.10.1',
    switchPorts: 'Fa0/1–2',
    status: 'active',
    securityClass: 'High',
    description: 'Executive management, billing & administrative workstations with restricted access to medical records and infrastructure.',
    color: '#06b6d4', // Cyan
    isCustom: false
  },
  {
    id: 20,
    name: 'RECEPTION',
    department: 'Reception',
    subnet: '192.168.20.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.20.1',
    switchPorts: 'Fa0/3–4',
    status: 'active',
    securityClass: 'Medium',
    description: 'Patient admissions, registration counters, appointments desk, and public hall triage terminals.',
    color: '#3b82f6', // Blue
    isCustom: false
  },
  {
    id: 30,
    name: 'MEDICAL_DOCTORS',
    department: 'Medical / Doctors',
    subnet: '192.168.30.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.30.1',
    switchPorts: 'Fa0/5–7',
    status: 'active',
    securityClass: 'Critical',
    description: 'Doctor consultation rooms, intensive care units (ICU), operating theatres, and clinical charting workstations.',
    color: '#10b981', // Emerald
    isCustom: false
  },
  {
    id: 40,
    name: 'LABORATORY',
    department: 'Laboratory',
    subnet: '192.168.40.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.40.1',
    switchPorts: 'Fa0/8–9',
    status: 'active',
    securityClass: 'High',
    description: 'Pathology diagnostic analyzers, blood bank management, imaging workstations (PACS), and specimen tracking.',
    color: '#8b5cf6', // Violet
    isCustom: false
  },
  {
    id: 50,
    name: 'GUEST',
    department: 'Guest',
    subnet: '192.168.50.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.50.1',
    switchPorts: 'Fa0/10–11',
    status: 'active',
    securityClass: 'Isolated',
    description: 'Patient waiting area Wi-Fi and visitor BYOD devices. Enforced zero-trust isolation from all hospital networks.',
    color: '#f59e0b', // Amber
    isCustom: false
  },
  {
    id: 60,
    name: 'HOSPITAL_SERVERS',
    department: 'Hospital Servers',
    subnet: '192.168.60.0',
    netmask: '255.255.255.0',
    defaultGateway: '192.168.60.1',
    switchPorts: 'Fa0/12–14',
    status: 'active',
    securityClass: 'Critical',
    description: 'Core datacenter cluster hosting Electronic Health Records (EHR), Internal DNS resolver, and PACS Backup storage.',
    color: '#ec4899', // Pink
    isCustom: false
  }
];

export const DEFAULT_DEVICES: NetworkDevice[] = [
  // Core Infrastructure
  {
    id: 'router-1',
    name: 'HOSPITAL-R1',
    type: 'router',
    ip: '192.168.10.1', // Primary management / router subinterfaces
    mac: '00:1C:58:29:11:00',
    subnetMask: '255.255.255.0',
    gateway: 'None (Default Gateway for all VLANs)',
    vlanId: 10,
    switchPort: 'G0/1 (Trunk)',
    status: 'online',
    ipAssignment: 'STATIC',
    txBytes: 1542000,
    rxBytes: 1489000,
    description: 'Cisco 2911 Integrated Services Router performing 802.1Q Router-on-a-Stick inter-VLAN routing and Extended ACL filtering.',
    connectedInterface: 'GigabitEthernet0/0'
  },
  {
    id: 'switch-1',
    name: 'HOSPITAL-SW1',
    type: 'switch',
    ip: '192.168.10.2',
    mac: '00:1E:BD:29:60:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.10.1',
    vlanId: 10,
    switchPort: 'Uplink G0/1',
    status: 'online',
    ipAssignment: 'STATIC',
    txBytes: 2841000,
    rxBytes: 2950000,
    description: 'Cisco Catalyst 2960-24TT Switch managing 6 isolated VLAN broadcast domains and 802.1Q trunk port G0/1.',
    connectedInterface: 'GigabitEthernet0/1'
  },

  // Hospital Servers (VLAN 60)
  {
    id: 'srv-hospital',
    name: 'HOSPITAL-SRV',
    type: 'server',
    ip: '192.168.60.10',
    mac: '00:0A:95:60:10:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.60.1',
    vlanId: 60,
    switchPort: 'Fa0/12',
    status: 'online',
    ipAssignment: 'STATIC',
    txBytes: 984000,
    rxBytes: 1120000,
    description: 'Hospital EHR & Clinical Portal providing patient admission registration, electronic records lookup, and bed management.',
    connectedInterface: 'FastEthernet0/12'
  },
  {
    id: 'srv-dns',
    name: 'DNS-SRV',
    type: 'server',
    ip: '192.168.60.11',
    mac: '00:0A:95:60:11:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.60.1',
    vlanId: 60,
    switchPort: 'Fa0/13',
    status: 'online',
    ipAssignment: 'STATIC',
    txBytes: 420000,
    rxBytes: 390000,
    description: 'Internal authoritative Domain Name System (DNS) server resolving local service names (hospital.local, backup.local).',
    connectedInterface: 'FastEthernet0/13'
  },
  {
    id: 'srv-backup',
    name: 'BACKUP-SRV',
    type: 'server',
    ip: '192.168.60.12',
    mac: '00:0A:95:60:12:03',
    subnetMask: '255.255.255.0',
    gateway: '192.168.60.1',
    vlanId: 60,
    switchPort: 'Fa0/14',
    status: 'online',
    ipAssignment: 'STATIC',
    txBytes: 810000,
    rxBytes: 940000,
    description: 'High-capacity PACS, radiology imaging, and SQL database daily backup repository with cryptographic verification.',
    connectedInterface: 'FastEthernet0/14'
  },

  // VLAN 10 End Devices (Administration)
  {
    id: 'admin-pc-1',
    name: 'ADMIN-PC-1',
    type: 'workstation',
    ip: '192.168.10.50',
    mac: '00:50:79:10:00:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.10.1',
    vlanId: 10,
    switchPort: 'Fa0/1',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 125000,
    rxBytes: 340000,
    description: 'Hospital Director administrative terminal for compliance, finance, and operations management.',
    connectedInterface: 'FastEthernet0/1'
  },
  {
    id: 'admin-pc-2',
    name: 'ADMIN-PC-2',
    type: 'workstation',
    ip: '192.168.10.51',
    mac: '00:50:79:10:00:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.10.1',
    vlanId: 10,
    switchPort: 'Fa0/2',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 98000,
    rxBytes: 210000,
    description: 'Medical billing, payroll, and insurance claims processing desktop.',
    connectedInterface: 'FastEthernet0/2'
  },

  // VLAN 20 End Devices (Reception)
  {
    id: 'recept-pc-1',
    name: 'RECEPT-PC-1',
    type: 'workstation',
    ip: '192.168.20.50',
    mac: '00:50:79:20:00:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.20.1',
    vlanId: 20,
    switchPort: 'Fa0/3',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 164000,
    rxBytes: 420000,
    description: 'Emergency Room triage check-in terminal and patient admission desk.',
    connectedInterface: 'FastEthernet0/3'
  },
  {
    id: 'recept-pc-2',
    name: 'RECEPT-PC-2',
    type: 'workstation',
    ip: '192.168.20.51',
    mac: '00:50:79:20:00:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.20.1',
    vlanId: 20,
    switchPort: 'Fa0/4',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 88000,
    rxBytes: 180000,
    description: 'Outpatient visitor registration and appointment booking desk.',
    connectedInterface: 'FastEthernet0/4'
  },

  // VLAN 30 End Devices (Medical / Doctors)
  {
    id: 'doctor-ws-1',
    name: 'DOCTOR-WS-1',
    type: 'workstation',
    ip: '192.168.30.50',
    mac: '00:50:79:30:00:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.30.1',
    vlanId: 30,
    switchPort: 'Fa0/5',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 340000,
    rxBytes: 650000,
    description: 'Chief of Medicine clinical consultation and prescription workstation.',
    connectedInterface: 'FastEthernet0/5'
  },
  {
    id: 'doctor-ws-2',
    name: 'DOCTOR-WS-2',
    type: 'workstation',
    ip: '192.168.30.51',
    mac: '00:50:79:30:00:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.30.1',
    vlanId: 30,
    switchPort: 'Fa0/6',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 290000,
    rxBytes: 520000,
    description: 'Surgical preparation unit and electronic anesthesia logging workstation.',
    connectedInterface: 'FastEthernet0/6'
  },
  {
    id: 'icu-monitor-1',
    name: 'ICU-MONITOR-1',
    type: 'medical-device',
    ip: '192.168.30.52',
    mac: '00:50:79:30:00:03',
    subnetMask: '255.255.255.0',
    gateway: '192.168.30.1',
    vlanId: 30,
    switchPort: 'Fa0/7',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 710000,
    rxBytes: 220000,
    description: 'Telemetry bedside cardiac monitor transmitting vitals directly to the central EHR server.',
    connectedInterface: 'FastEthernet0/7'
  },

  // VLAN 40 End Devices (Laboratory)
  {
    id: 'lab-analyzer-1',
    name: 'LAB-ANALYZER-1',
    type: 'medical-device',
    ip: '192.168.40.50',
    mac: '00:50:79:40:00:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.40.1',
    vlanId: 40,
    switchPort: 'Fa0/8',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 450000,
    rxBytes: 310000,
    description: 'Automated Hematology and Clinical Chemistry specimen analyzer.',
    connectedInterface: 'FastEthernet0/8'
  },
  {
    id: 'path-pc-1',
    name: 'PATH-PC-1',
    type: 'workstation',
    ip: '192.168.40.51',
    mac: '00:50:79:40:00:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.40.1',
    vlanId: 40,
    switchPort: 'Fa0/9',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 210000,
    rxBytes: 380000,
    description: 'Pathology diagnostic reporting PC and digital microscope feed.',
    connectedInterface: 'FastEthernet0/9'
  },

  // VLAN 50 End Devices (Guest)
  {
    id: 'guest-laptop-1',
    name: 'GUEST-LAPTOP-1',
    type: 'laptop',
    ip: '192.168.50.101',
    mac: '00:50:79:50:00:01',
    subnetMask: '255.255.255.0',
    gateway: '192.168.50.1',
    vlanId: 50,
    switchPort: 'Fa0/10',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 95000,
    rxBytes: 610000,
    description: 'Visitor personal laptop connected in cafeteria lounge waiting area.',
    connectedInterface: 'FastEthernet0/10'
  },
  {
    id: 'guest-mobile-1',
    name: 'GUEST-MOBILE-1',
    type: 'mobile',
    ip: '192.168.50.102',
    mac: '00:50:79:50:00:02',
    subnetMask: '255.255.255.0',
    gateway: '192.168.50.1',
    vlanId: 50,
    switchPort: 'Fa0/11',
    status: 'online',
    ipAssignment: 'DHCP',
    txBytes: 42000,
    rxBytes: 280000,
    description: 'Patient family smartphone connected via hospital guest portal.',
    connectedInterface: 'FastEthernet0/11'
  }
];

export const DEFAULT_SUBINTERFACES: RouterSubinterface[] = [
  {
    interfaceName: 'GigabitEthernet0/0.10',
    vlanId: 10,
    ipAddress: '192.168.10.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 10'
  },
  {
    interfaceName: 'GigabitEthernet0/0.20',
    vlanId: 20,
    ipAddress: '192.168.20.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 20'
  },
  {
    interfaceName: 'GigabitEthernet0/0.30',
    vlanId: 30,
    ipAddress: '192.168.30.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 30'
  },
  {
    interfaceName: 'GigabitEthernet0/0.40',
    vlanId: 40,
    ipAddress: '192.168.40.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 40'
  },
  {
    interfaceName: 'GigabitEthernet0/0.50',
    vlanId: 50,
    ipAddress: '192.168.50.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 50',
    inboundAcl: 'GUEST_ISOLATION'
  },
  {
    interfaceName: 'GigabitEthernet0/0.60',
    vlanId: 60,
    ipAddress: '192.168.60.1',
    subnetMask: '255.255.255.0',
    status: 'up',
    encapsulation: 'dot1Q 60'
  }
];

export const DEFAULT_DHCP_POOLS: DhcpPool[] = [
  {
    id: 'pool-admin',
    name: 'ADMIN',
    vlanId: 10,
    network: '192.168.10.0',
    netmask: '255.255.255.0',
    defaultRouter: '192.168.10.1',
    dnsServer: '192.168.60.11',
    leaseTimeSeconds: 86400,
    startIp: '192.168.10.50',
    endIp: '192.168.10.200',
    excludedIps: ['192.168.10.1', '192.168.10.2', '192.168.10.3', '192.168.10.4', '192.168.10.5']
  },
  {
    id: 'pool-reception',
    name: 'RECEPTION',
    vlanId: 20,
    network: '192.168.20.0',
    netmask: '255.255.255.0',
    defaultRouter: '192.168.20.1',
    dnsServer: '192.168.60.11',
    leaseTimeSeconds: 86400,
    startIp: '192.168.20.50',
    endIp: '192.168.20.200',
    excludedIps: ['192.168.20.1', '192.168.20.2', '192.168.20.3', '192.168.20.4', '192.168.20.5']
  },
  {
    id: 'pool-medical',
    name: 'MEDICAL',
    vlanId: 30,
    network: '192.168.30.0',
    netmask: '255.255.255.0',
    defaultRouter: '192.168.30.1',
    dnsServer: '192.168.60.11',
    leaseTimeSeconds: 86400,
    startIp: '192.168.30.50',
    endIp: '192.168.30.200',
    excludedIps: ['192.168.30.1', '192.168.30.2', '192.168.30.3', '192.168.30.4', '192.168.30.5']
  },
  {
    id: 'pool-lab',
    name: 'LAB',
    vlanId: 40,
    network: '192.168.40.0',
    netmask: '255.255.255.0',
    defaultRouter: '192.168.40.1',
    dnsServer: '192.168.60.11',
    leaseTimeSeconds: 86400,
    startIp: '192.168.40.50',
    endIp: '192.168.40.200',
    excludedIps: ['192.168.40.1', '192.168.40.2', '192.168.40.3', '192.168.40.4', '192.168.40.5']
  },
  {
    id: 'pool-guest',
    name: 'GUEST',
    vlanId: 50,
    network: '192.168.50.0',
    netmask: '255.255.255.0',
    defaultRouter: '192.168.50.1',
    dnsServer: '192.168.60.11',
    leaseTimeSeconds: 43200, // 12 hours for guests
    startIp: '192.168.50.100',
    endIp: '192.168.50.250',
    excludedIps: ['192.168.50.1', '192.168.50.2', '192.168.50.3', '192.168.50.4', '192.168.50.5']
  }
];

export const DEFAULT_DHCP_LEASES: DhcpLease[] = [
  {
    ip: '192.168.10.50',
    mac: '00:50:79:10:00:01',
    clientId: '0100.5079.1000.01',
    vlanId: 10,
    poolName: 'ADMIN',
    leaseTime: '2026-11-03 06:00:00',
    expireTime: '2026-11-04 06:00:00',
    status: 'Active'
  },
  {
    ip: '192.168.10.51',
    mac: '00:50:79:10:00:02',
    clientId: '0100.5079.1000.02',
    vlanId: 10,
    poolName: 'ADMIN',
    leaseTime: '2026-11-03 06:15:00',
    expireTime: '2026-11-04 06:15:00',
    status: 'Active'
  },
  {
    ip: '192.168.20.50',
    mac: '00:50:79:20:00:01',
    clientId: '0100.5079.2000.01',
    vlanId: 20,
    poolName: 'RECEPTION',
    leaseTime: '2026-11-03 06:30:00',
    expireTime: '2026-11-04 06:30:00',
    status: 'Active'
  },
  {
    ip: '192.168.20.51',
    mac: '00:50:79:20:00:02',
    clientId: '0100.5079.2000.02',
    vlanId: 20,
    poolName: 'RECEPTION',
    leaseTime: '2026-11-03 06:45:00',
    expireTime: '2026-11-04 06:45:00',
    status: 'Active'
  },
  {
    ip: '192.168.30.50',
    mac: '00:50:79:30:00:01',
    clientId: '0100.5079.3000.01',
    vlanId: 30,
    poolName: 'MEDICAL',
    leaseTime: '2026-11-03 07:00:00',
    expireTime: '2026-11-04 07:00:00',
    status: 'Active'
  },
  {
    ip: '192.168.30.51',
    mac: '00:50:79:30:00:02',
    clientId: '0100.5079.3000.02',
    vlanId: 30,
    poolName: 'MEDICAL',
    leaseTime: '2026-11-03 07:10:00',
    expireTime: '2026-11-04 07:10:00',
    status: 'Active'
  },
  {
    ip: '192.168.30.52',
    mac: '00:50:79:30:00:03',
    clientId: '0100.5079.3000.03',
    vlanId: 30,
    poolName: 'MEDICAL',
    leaseTime: '2026-11-03 07:12:00',
    expireTime: '2026-11-04 07:12:00',
    status: 'Active'
  },
  {
    ip: '192.168.40.50',
    mac: '00:50:79:40:00:01',
    clientId: '0100.5079.4000.01',
    vlanId: 40,
    poolName: 'LAB',
    leaseTime: '2026-11-03 07:14:00',
    expireTime: '2026-11-04 07:14:00',
    status: 'Active'
  },
  {
    ip: '192.168.40.51',
    mac: '00:50:79:40:00:02',
    clientId: '0100.5079.4000.02',
    vlanId: 40,
    poolName: 'LAB',
    leaseTime: '2026-11-03 07:15:00',
    expireTime: '2026-11-04 07:15:00',
    status: 'Active'
  },
  {
    ip: '192.168.50.101',
    mac: '00:50:79:50:00:01',
    clientId: '0100.5079.5000.01',
    vlanId: 50,
    poolName: 'GUEST',
    leaseTime: '2026-11-03 07:16:00',
    expireTime: '2026-11-03 19:16:00',
    status: 'Active'
  },
  {
    ip: '192.168.50.102',
    mac: '00:50:79:50:00:02',
    clientId: '0100.5079.5000.02',
    vlanId: 50,
    poolName: 'GUEST',
    leaseTime: '2026-11-03 07:18:00',
    expireTime: '2026-11-03 19:18:00',
    status: 'Active'
  }
];

export const DEFAULT_ROUTING_TABLE: RouteEntry[] = [
  { type: 'C', network: '192.168.10.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.10', metric: '0' },
  { type: 'C', network: '192.168.20.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.20', metric: '0' },
  { type: 'C', network: '192.168.30.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.30', metric: '0' },
  { type: 'C', network: '192.168.40.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.40', metric: '0' },
  { type: 'C', network: '192.168.50.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.50', metric: '0' },
  { type: 'C', network: '192.168.60.0', netmask: '255.255.255.0', interface: 'GigabitEthernet0/0.60', metric: '0' }
];

export const DEFAULT_ACL: AclConfig = {
  name: 'GUEST_ISOLATION',
  enabled: true,
  interface: 'GigabitEthernet0/0.50',
  direction: 'in',
  rules: [
    {
      id: 'acl-10',
      sequence: 10,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: '192.168.10.0',
      destWildcard: '0.0.0.255',
      description: 'Deny Guest VLAN 50 access to Administration VLAN 10',
      hitCount: 42,
      isDefault: true
    },
    {
      id: 'acl-20',
      sequence: 20,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: '192.168.20.0',
      destWildcard: '0.0.0.255',
      description: 'Deny Guest VLAN 50 access to Reception VLAN 20',
      hitCount: 19,
      isDefault: true
    },
    {
      id: 'acl-30',
      sequence: 30,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: '192.168.30.0',
      destWildcard: '0.0.0.255',
      description: 'Deny Guest VLAN 50 access to Medical / Doctors VLAN 30',
      hitCount: 78,
      isDefault: true
    },
    {
      id: 'acl-40',
      sequence: 40,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: '192.168.40.0',
      destWildcard: '0.0.0.255',
      description: 'Deny Guest VLAN 50 access to Laboratory VLAN 40',
      hitCount: 31,
      isDefault: true
    },
    {
      id: 'acl-50',
      sequence: 50,
      action: 'deny',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: '192.168.60.0',
      destWildcard: '0.0.0.255',
      description: 'Deny Guest VLAN 50 access to Hospital Server Farm VLAN 60',
      hitCount: 156,
      isDefault: true
    },
    {
      id: 'acl-60',
      sequence: 60,
      action: 'permit',
      protocol: 'ip',
      sourceNetwork: '192.168.50.0',
      sourceWildcard: '0.0.0.255',
      destNetwork: 'any',
      destWildcard: 'any',
      description: 'Permit remaining Guest outbound / internet access',
      hitCount: 340,
      isDefault: true
    },
    {
      id: 'acl-70',
      sequence: 70,
      action: 'permit',
      protocol: 'ip',
      sourceNetwork: 'any',
      sourceWildcard: 'any',
      destNetwork: 'any',
      destWildcard: 'any',
      description: 'Permit authorized internal inter-departmental communication',
      hitCount: 1280,
      isDefault: true
    }
  ]
};

export const DEFAULT_DNS_RECORDS: DnsRecord[] = [
  { id: 'dns-1', hostname: 'hospital.local', ip: '192.168.60.10', type: 'A', ttl: 3600, description: 'Core Hospital Patient & Clinical Portal' },
  { id: 'dns-2', hostname: 'dns.local', ip: '192.168.60.11', type: 'A', ttl: 86400, description: 'Internal Domain Resolution Server' },
  { id: 'dns-3', hostname: 'backup.local', ip: '192.168.60.12', type: 'A', ttl: 3600, description: 'PACS & Database Repository Server' },
  { id: 'dns-4', hostname: 'router.hospital.local', ip: '192.168.10.1', type: 'A', ttl: 86400, description: 'Cisco 2911 Router Management' },
  { id: 'dns-5', hostname: 'switch.hospital.local', ip: '192.168.10.2', type: 'A', ttl: 86400, description: 'Cisco 2960 Switch Management' },
  { id: 'dns-6', hostname: 'ehr.hospital.local', ip: '192.168.60.10', type: 'CNAME', ttl: 3600, description: 'Alias for Core Hospital Server' }
];

export const DEFAULT_BACKUP_JOBS: BackupJob[] = [
  { id: 'job-1', name: 'EHR Patient Database Daily Full Snapshot', target: '192.168.60.10 -> 192.168.60.12', schedule: 'Daily at 01:00 AM', status: 'Completed', lastRun: 'Today, 01:00 AM', sizeGb: 142.6, retentionDays: 90 },
  { id: 'job-2', name: 'PACS Radiology & MRI DICOM Archive', target: '192.168.40.0 -> 192.168.60.12', schedule: 'Continuous / Hourly', status: 'In Progress', lastRun: '15 mins ago', sizeGb: 618.4, retentionDays: 365 },
  { id: 'job-3', name: 'Cisco R1 & SW1 Config Backups (TFTP)', target: 'Running-Config -> 192.168.60.12', schedule: 'Daily at 03:00 AM', status: 'Completed', lastRun: 'Today, 03:00 AM', sizeGb: 0.12, retentionDays: 180 },
  { id: 'job-4', name: 'Laboratory Assay Results Differential', target: '192.168.40.50 -> 192.168.60.12', schedule: 'Every 6 Hours', status: 'Completed', lastRun: '2 hours ago', sizeGb: 34.2, retentionDays: 60 }
];

export const DEFAULT_PATIENTS: PatientRecord[] = [
  { id: 'pat-1', mrn: 'HOSP-2026-0891', name: 'Elena Rostova', age: 44, gender: 'Female', department: 'Cardiology', admissionDate: '2026-11-01', status: 'Admitted', room: 'Ward 3B - Bed 12', attendingDoctor: 'Dr. Marcus Vance (MD)' },
  { id: 'pat-2', mrn: 'HOSP-2026-0904', name: 'Arthur Pendelton', age: 67, gender: 'Male', department: 'Intensive Care Unit (ICU)', admissionDate: '2026-11-02', status: 'In ICU', room: 'ICU Pod 4', attendingDoctor: 'Dr. Sarah Lin (Intensivist)' },
  { id: 'pat-3', mrn: 'HOSP-2026-0912', name: 'Kavita Sharma', age: 31, gender: 'Female', department: 'Obstetrics & Gynaecology', admissionDate: '2026-11-03', status: 'Admitted', room: 'Maternity 2A', attendingDoctor: 'Dr. Rachel Green' },
  { id: 'pat-4', mrn: 'HOSP-2026-0925', name: 'David Kim', age: 52, gender: 'Male', department: 'Orthopedics', admissionDate: '2026-10-29', status: 'Discharged', room: 'Recovery Suite 5', attendingDoctor: 'Dr. James Thorne' },
  { id: 'pat-5', mrn: 'HOSP-2026-0931', name: 'Lucas Montgomery', age: 23, gender: 'Male', department: 'Emergency Medicine', admissionDate: '2026-11-03', status: 'Admitted', room: 'Triage Trauma 2', attendingDoctor: 'Dr. Marcus Vance (MD)' }
];

export const DEFAULT_APPOINTMENTS: DoctorAppointment[] = [
  { id: 'apt-1', doctorName: 'Dr. Marcus Vance (MD)', patientName: 'Elena Rostova', department: 'Cardiology', time: '09:00 AM', type: 'Consultation', status: 'Completed' },
  { id: 'apt-2', doctorName: 'Dr. Sarah Lin (MD)', patientName: 'Arthur Pendelton', department: 'ICU / Pulmonary', time: '10:30 AM', type: 'Emergency Review', status: 'In Progress' },
  { id: 'apt-3', doctorName: 'Dr. James Thorne (Surg)', patientName: 'Marcus Bradley', department: 'Orthopedics', time: '01:15 PM', type: 'Surgery', status: 'Scheduled' },
  { id: 'apt-4', doctorName: 'Dr. Rachel Green (MD)', patientName: 'Kavita Sharma', department: 'Obstetrics', time: '03:00 PM', type: 'Follow-up', status: 'Scheduled' }
];

export const DEFAULT_LOGS: SystemLog[] = [
  { id: 'log-1', timestamp: '2026-11-03 07:12:00', category: 'DHCP', severity: 'INFO', sourceDevice: 'ICU-MONITOR-1', ip: '192.168.30.52', description: 'DHCPACK issued from pool MEDICAL for MAC 00:50:79:30:00:03.' },
  { id: 'log-2', timestamp: '2026-11-03 07:15:22', category: 'ROUTING', severity: 'INFO', sourceDevice: 'DOCTOR-WS-1', destDevice: 'HOSPITAL-SRV', ip: '192.168.60.10', description: 'Inter-VLAN packet routed: Subinterface G0/0.30 -> G0/0.60 (VLAN 30 to VLAN 60).' },
  { id: 'log-3', timestamp: '2026-11-03 07:17:40', category: 'ACL', severity: 'CRITICAL', sourceDevice: 'GUEST-LAPTOP-1', destDevice: 'HOSPITAL-SRV', ip: '192.168.60.10', description: 'ACL GUEST_ISOLATION Rule 50 DENIED: Source 192.168.50.101 attempted connection to Hospital Server 192.168.60.10:443.' },
  { id: 'log-4', timestamp: '2026-11-03 07:18:15', category: 'DNS', severity: 'INFO', sourceDevice: 'ADMIN-PC-1', ip: '192.168.60.11', description: 'DNS query resolved: hospital.local -> 192.168.60.10 (TTL 3600).' },
  { id: 'log-5', timestamp: '2026-11-03 07:19:01', category: 'SERVER', severity: 'INFO', sourceDevice: 'BACKUP-SRV', ip: '192.168.60.12', description: 'Automated PACS differential backup snapshot verified intact (34.2 GB).' },
  { id: 'log-6', timestamp: '2026-11-03 07:20:10', category: 'SECURITY', severity: 'WARNING', sourceDevice: 'GUEST-MOBILE-1', destDevice: 'DOCTOR-WS-1', ip: '192.168.30.50', description: 'ACL GUEST_ISOLATION Rule 30 DENIED: Unauthorized probe from Guest subnet to Medical workstation.' }
];

export const INITIAL_TRAFFIC_EVENTS: TrafficEvent[] = [
  { id: 'tr-1', timestamp: '07:20:12', sourceIp: '192.168.30.50', sourceName: 'DOCTOR-WS-1', destIp: '192.168.60.10', destName: 'HOSPITAL-SRV', sourceVlan: 30, destVlan: 60, protocol: 'HTTPS', packetCount: 64, bytes: 84200, status: 'ALLOWED', reason: 'Authorized Medical VLAN clinical access' },
  { id: 'tr-2', timestamp: '07:20:25', sourceIp: '192.168.50.101', sourceName: 'GUEST-LAPTOP-1', destIp: '192.168.60.10', destName: 'HOSPITAL-SRV', sourceVlan: 50, destVlan: 60, protocol: 'HTTP', packetCount: 12, bytes: 720, status: 'BLOCKED', reason: 'ACL GUEST_ISOLATION Rule 50 Deny' },
  { id: 'tr-3', timestamp: '07:20:30', sourceIp: '192.168.10.50', sourceName: 'ADMIN-PC-1', destIp: '192.168.60.11', destName: 'DNS-SRV', sourceVlan: 10, destVlan: 60, protocol: 'DNS', packetCount: 4, bytes: 256, status: 'ALLOWED', reason: 'Recursive domain query' },
  { id: 'tr-4', timestamp: '07:20:44', sourceIp: '192.168.40.50', sourceName: 'LAB-ANALYZER-1', destIp: '192.168.60.10', destName: 'HOSPITAL-SRV', sourceVlan: 40, destVlan: 60, protocol: 'TCP', packetCount: 128, bytes: 145000, status: 'ALLOWED', reason: 'HL7 assay telemetry ingestion' },
  { id: 'tr-5', timestamp: '07:21:02', sourceIp: '192.168.20.50', sourceName: 'RECEPT-PC-1', destIp: '192.168.60.10', destName: 'HOSPITAL-SRV', sourceVlan: 20, destVlan: 60, protocol: 'HTTPS', packetCount: 32, bytes: 42100, status: 'ALLOWED', reason: 'Patient registration update' },
  { id: 'tr-6', timestamp: '07:21:18', sourceIp: '192.168.50.102', sourceName: 'GUEST-MOBILE-1', destIp: '192.168.30.50', destName: 'DOCTOR-WS-1', sourceVlan: 50, destVlan: 30, protocol: 'ICMP', packetCount: 4, bytes: 240, status: 'BLOCKED', reason: 'ACL GUEST_ISOLATION Rule 30 Deny' }
];
