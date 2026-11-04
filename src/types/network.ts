export type DeviceType = 
  | 'router' 
  | 'switch' 
  | 'server' 
  | 'workstation' 
  | 'laptop' 
  | 'mobile' 
  | 'medical-device';

export type DeviceStatus = 'online' | 'offline' | 'warning';
export type IpAssignment = 'DHCP' | 'STATIC';

export interface Vlan {
  id: number;
  name: string;
  department: string;
  subnet: string;
  netmask: string;
  defaultGateway: string;
  switchPorts: string;
  status: 'active' | 'suspended';
  securityClass: 'High' | 'Medium' | 'Critical' | 'Isolated' | 'Restricted';
  description: string;
  color: string;
  isCustom?: boolean;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  mac: string;
  subnetMask: string;
  gateway: string;
  vlanId: number;
  switchPort: string;
  status: DeviceStatus;
  ipAssignment: IpAssignment;
  txBytes: number;
  rxBytes: number;
  description: string;
  connectedInterface?: string;
}

export interface DhcpPool {
  id: string;
  name: string;
  vlanId: number;
  network: string;
  netmask: string;
  defaultRouter: string;
  dnsServer: string;
  leaseTimeSeconds: number;
  startIp: string;
  endIp: string;
  excludedIps: string[];
}

export interface DhcpLease {
  ip: string;
  mac: string;
  clientId: string;
  vlanId: number;
  poolName: string;
  leaseTime: string;
  expireTime: string;
  status: 'Active' | 'Expired';
}

export interface RouterSubinterface {
  interfaceName: string; // e.g. GigabitEthernet0/0.10
  vlanId: number;
  ipAddress: string;
  subnetMask: string;
  status: 'up' | 'down';
  encapsulation: string; // 802.1Q
  inboundAcl?: string;
}

export interface RouteEntry {
  type: 'C' | 'S' | 'O';
  network: string;
  netmask: string;
  interface: string;
  nextHop?: string;
  metric: string;
}

export interface AclRule {
  id: string;
  sequence: number;
  action: 'permit' | 'deny';
  protocol: 'ip' | 'tcp' | 'udp' | 'icmp';
  sourceNetwork: string; // e.g. "192.168.50.0"
  sourceWildcard: string; // e.g. "0.0.0.255"
  destNetwork: string; // e.g. "192.168.10.0" or "any"
  destWildcard: string; // e.g. "0.0.0.255" or "any"
  description: string;
  hitCount: number;
  isDefault?: boolean;
}

export interface AclConfig {
  name: string;
  enabled: boolean;
  interface: string;
  direction: 'in' | 'out';
  rules: AclRule[];
}

export interface DnsRecord {
  id: string;
  hostname: string;
  ip: string;
  type: 'A' | 'CNAME';
  ttl: number;
  description: string;
}

export interface BackupJob {
  id: string;
  name: string;
  target: string;
  schedule: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Failed';
  lastRun: string;
  sizeGb: number;
  retentionDays: number;
}

export interface PatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  admissionDate: string;
  status: 'Admitted' | 'Discharged' | 'In ICU' | 'Outpatient';
  room: string;
  attendingDoctor: string;
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  patientName: string;
  department: string;
  time: string;
  type: 'Consultation' | 'Emergency Review' | 'Surgery' | 'Follow-up';
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface TrafficEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourceName: string;
  destIp: string;
  destName: string;
  sourceVlan: number;
  destVlan: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP' | 'HTTPS';
  packetCount: number;
  bytes: number;
  status: 'ALLOWED' | 'BLOCKED';
  reason: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  category: 
    | 'DHCP' 
    | 'VLAN' 
    | 'DEVICE' 
    | 'ROUTING' 
    | 'PING' 
    | 'ACL' 
    | 'DNS' 
    | 'SERVER' 
    | 'CONFIG' 
    | 'SECURITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  sourceDevice?: string;
  destDevice?: string;
  ip?: string;
  description: string;
}

export interface ConnectivityTestResult {
  id: string;
  testType: 'PING' | 'TRACEROUTE' | 'DNS' | 'DHCP' | 'ROUTING' | 'ACL';
  timestamp: string;
  sourceDevice: string;
  destDeviceOrTarget: string;
  sourceIp: string;
  destIp: string;
  status: 'ALLOWED' | 'BLOCKED' | 'SUCCESS' | 'FAILED';
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  avgResponseTimeMs: number;
  hops?: { hop: number; node: string; ip: string; timeMs: number }[];
  dnsResolvedIp?: string;
  details: string;
}
