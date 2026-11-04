import {
  NetworkDevice,
  Vlan,
  AclConfig,
  AclRule,
  DhcpPool,
  DhcpLease,
  RouterSubinterface,
  RouteEntry,
  DnsRecord,
  ConnectivityTestResult
} from '../types/network';

// IP address mathematical utilities
export function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

export function isValidIp(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && (part === '0' || !part.startsWith('0'));
  });
}

export function isIpInSubnet(ip: string, network: string, netmask: string): boolean {
  if (!isValidIp(ip) || !isValidIp(network) || !isValidIp(netmask)) return false;
  const ipL = ipToLong(ip);
  const netL = ipToLong(network);
  const maskL = ipToLong(netmask);
  return (ipL & maskL) === (netL & maskL);
}

// Cisco Wildcard matcher (0.0.0.255 means host bits must match network where wildcard bits are 0)
export function matchesWildcard(ip: string, network: string, wildcard: string): boolean {
  if (network === 'any' || wildcard === 'any') return true;
  if (!isValidIp(ip) || !isValidIp(network) || !isValidIp(wildcard)) return false;

  const ipL = ipToLong(ip);
  const netL = ipToLong(network);
  const wildL = ipToLong(wildcard);
  const maskL = (~wildL) >>> 0;

  return (ipL & maskL) === (netL & maskL);
}

// Stateful ACL Engine
export interface AclEvalResult {
  action: 'permit' | 'deny';
  matchedRule: AclRule | null;
  reason: string;
}

export function evaluateAcl(
  sourceIp: string,
  destIp: string,
  protocol: 'ip' | 'tcp' | 'udp' | 'icmp' = 'ip',
  aclConfig: AclConfig
): AclEvalResult {
  if (!aclConfig.enabled) {
    return {
      action: 'permit',
      matchedRule: null,
      reason: 'ACL filtering is currently disabled on the router interface'
    };
  }

  // Sort rules strictly by sequence number
  const sortedRules = [...aclConfig.rules].sort((a, b) => a.sequence - b.sequence);

  for (const rule of sortedRules) {
    const srcMatch = matchesWildcard(sourceIp, rule.sourceNetwork, rule.sourceWildcard);
    const destMatch = matchesWildcard(destIp, rule.destNetwork, rule.destWildcard);
    const protoMatch = rule.protocol === 'ip' || rule.protocol === protocol;

    if (srcMatch && destMatch && protoMatch) {
      // Matched rule!
      return {
        action: rule.action,
        matchedRule: rule,
        reason: `Matched ACL rule sequence ${rule.sequence}: ${rule.action.toUpperCase()} ${rule.protocol} from ${rule.sourceNetwork}/${rule.sourceWildcard} to ${rule.destNetwork}/${rule.destWildcard} (${rule.description})`
      };
    }
  }

  // Cisco default implicit deny
  return {
    action: 'deny',
    matchedRule: null,
    reason: 'Implicit Deny All: No matching rule found in ACL GUEST_ISOLATION sequence'
  };
}

// Inter-VLAN Routing Decision Engine
export interface RoutingPathStep {
  stepNumber: number;
  node: string;
  interfaceName: string;
  action: string;
  status: 'passed' | 'blocked' | 'in-transit';
  details: string;
}

export interface RoutingDecision {
  permitted: boolean;
  isSameVlan: boolean;
  sourceVlanId: number;
  destVlanId: number;
  routerInvolved: boolean;
  steps: RoutingPathStep[];
  aclResult?: AclEvalResult;
  summary: string;
}

export function traceRoutingPath(
  sourceDevice: NetworkDevice,
  destDevice: NetworkDevice,
  aclConfig: AclConfig,
  subinterfaces: RouterSubinterface[]
): RoutingDecision {
  const steps: RoutingPathStep[] = [];
  const isSameVlan = sourceDevice.vlanId === destDevice.vlanId;

  // Step 1: Source Workstation Generation
  steps.push({
    stepNumber: 1,
    node: sourceDevice.name,
    interfaceName: sourceDevice.switchPort,
    action: 'Frame Generation',
    status: 'passed',
    details: `Source host ${sourceDevice.name} (${sourceDevice.ip}) encapsulated IP packet into Ethernet II frame with source MAC ${sourceDevice.mac}.`
  });

  // Step 2: Access Switch Ingestion
  steps.push({
    stepNumber: 2,
    node: 'HOSPITAL-SW1',
    interfaceName: sourceDevice.switchPort,
    action: 'Access Port Ingestion',
    status: 'passed',
    details: `Catalyst 2960 received frame on access port ${sourceDevice.switchPort} (VLAN ${sourceDevice.vlanId}). CAM table lookup confirms local port association.`
  });

  if (isSameVlan) {
    // Local switching without router
    steps.push({
      stepNumber: 3,
      node: 'HOSPITAL-SW1',
      interfaceName: destDevice.switchPort,
      action: 'Intra-VLAN Layer-2 Forwarding',
      status: 'passed',
      details: `Destination ${destDevice.name} is in the same VLAN (${sourceDevice.vlanId}). Switch forwards frame directly to port ${destDevice.switchPort} without routing.`
    });

    steps.push({
      stepNumber: 4,
      node: destDevice.name,
      interfaceName: destDevice.switchPort,
      action: 'Packet Delivery',
      status: 'passed',
      details: `Destination host ${destDevice.name} (${destDevice.ip}) received packet successfully.`
    });

    return {
      permitted: true,
      isSameVlan: true,
      sourceVlanId: sourceDevice.vlanId,
      destVlanId: destDevice.vlanId,
      routerInvolved: false,
      steps,
      summary: `Direct Layer-2 switching within VLAN ${sourceDevice.vlanId}. No inter-VLAN routing or ACL traversal required.`
    };
  }

  // Inter-VLAN: Trunk Uplink to Router
  steps.push({
    stepNumber: 3,
    node: 'HOSPITAL-SW1',
    interfaceName: 'GigabitEthernet0/1 (Trunk)',
    action: '802.1Q Dot1q Trunk Encapsulation',
    status: 'passed',
    details: `Frame tagged with 802.1Q VLAN header [VID: ${sourceDevice.vlanId}] and forwarded across trunk link to HOSPITAL-R1.`
  });

  // Step 4: Router Subinterface Ingestion
  const sourceSub = subinterfaces.find(s => s.vlanId === sourceDevice.vlanId);
  const sourceSubName = sourceSub ? sourceSub.interfaceName : `GigabitEthernet0/0.${sourceDevice.vlanId}`;

  steps.push({
    stepNumber: 4,
    node: 'HOSPITAL-R1',
    interfaceName: sourceSubName,
    action: 'Router-on-a-Stick Subinterface Ingestion',
    status: 'passed',
    details: `Cisco 2911 stripped 802.1Q header on ${sourceSubName}. Gateway IP ${sourceDevice.gateway} recognized as local subinterface.`
  });

  // Step 5: Security Policy & ACL Evaluation
  const aclResult = evaluateAcl(sourceDevice.ip, destDevice.ip, 'ip', aclConfig);

  if (aclResult.action === 'deny') {
    steps.push({
      stepNumber: 5,
      node: 'HOSPITAL-R1',
      interfaceName: sourceSubName,
      action: 'Inbound ACL Firewall Filter',
      status: 'blocked',
      details: `BLOCKED by Extended ACL [${aclConfig.name}]: ${aclResult.reason}. Packet dropped. ICMP Administratively Prohibited generated.`
    });

    return {
      permitted: false,
      isSameVlan: false,
      sourceVlanId: sourceDevice.vlanId,
      destVlanId: destDevice.vlanId,
      routerInvolved: true,
      steps,
      aclResult,
      summary: `Traffic blocked by HOSPITAL-R1 inbound ACL on ${sourceSubName}. Guest network isolation enforced.`
    };
  }

  steps.push({
    stepNumber: 5,
    node: 'HOSPITAL-R1',
    interfaceName: sourceSubName,
    action: 'Inbound ACL Firewall Filter',
    status: 'passed',
    details: `PERMITTED: ${aclResult.reason}. Packet admitted to routing engine.`
  });

  // Step 6: FIB Routing Table Lookup
  const destSub = subinterfaces.find(s => s.vlanId === destDevice.vlanId);
  const destSubName = destSub ? destSub.interfaceName : `GigabitEthernet0/0.${destDevice.vlanId}`;

  steps.push({
    stepNumber: 6,
    node: 'HOSPITAL-R1',
    interfaceName: 'FIB / Routing Table',
    action: 'Inter-VLAN Route Forwarding',
    status: 'passed',
    details: `Routing decision: Direct route to network ${destDevice.ip}/24 via subinterface ${destSubName} (VLAN ${destDevice.vlanId}). TTL decremented by 1.`
  });

  // Step 7: Downlink Trunk to Access Switch
  steps.push({
    stepNumber: 7,
    node: 'HOSPITAL-SW1',
    interfaceName: 'GigabitEthernet0/1 (Trunk)',
    action: 'Dot1q De-encapsulation & Switching',
    status: 'passed',
    details: `Frame tagged with [VID: ${destDevice.vlanId}] received from router and switched to destination access port ${destDevice.switchPort}.`
  });

  // Step 8: Destination Delivery
  steps.push({
    stepNumber: 8,
    node: destDevice.name,
    interfaceName: destDevice.switchPort,
    action: 'Packet Delivery',
    status: 'passed',
    details: `Destination host ${destDevice.name} (${destDevice.ip}) received packet successfully on port ${destDevice.switchPort}.`
  });

  return {
    permitted: true,
    isSameVlan: false,
    sourceVlanId: sourceDevice.vlanId,
    destVlanId: destDevice.vlanId,
    routerInvolved: true,
    steps,
    aclResult,
    summary: `Inter-VLAN communication successfully routed between VLAN ${sourceDevice.vlanId} and VLAN ${destDevice.vlanId} via Router-on-a-Stick.`
  };
}

// DHCP Request & Allocation Engine
export function allocateDhcpAddress(
  device: NetworkDevice,
  pool: DhcpPool,
  existingDevices: NetworkDevice[],
  existingLeases: DhcpLease[]
): { success: boolean; ip?: string; lease?: DhcpLease; error?: string } {
  // Check if device is in pool's VLAN
  if (device.vlanId !== pool.vlanId) {
    return {
      success: false,
      error: `Device VLAN (${device.vlanId}) does not match DHCP pool VLAN (${pool.vlanId}).`
    };
  }

  const startL = ipToLong(pool.startIp);
  const endL = ipToLong(pool.endIp);
  const assignedIps = new Set([
    ...existingDevices.filter(d => d.id !== device.id).map(d => d.ip),
    ...pool.excludedIps
  ]);

  for (let currentL = startL; currentL <= endL; currentL++) {
    const candidateIp = longToIp(currentL);
    if (!assignedIps.has(candidateIp)) {
      const now = new Date();
      const expire = new Date(now.getTime() + pool.leaseTimeSeconds * 1000);
      
      const lease: DhcpLease = {
        ip: candidateIp,
        mac: device.mac,
        clientId: `01${device.mac.replace(/:/g, '').toLowerCase()}`,
        vlanId: device.vlanId,
        poolName: pool.name,
        leaseTime: now.toISOString().replace('T', ' ').slice(0, 19),
        expireTime: expire.toISOString().replace('T', ' ').slice(0, 19),
        status: 'Active'
      };

      return {
        success: true,
        ip: candidateIp,
        lease
      };
    }
  }

  return {
    success: false,
    error: `DHCP pool ${pool.name} exhaustion: No available unreserved IP addresses in range ${pool.startIp} - ${pool.endIp}.`
  };
}

// Diagnostic Connectivity Testing
export function executeDiagnosticTest(
  type: 'PING' | 'TRACEROUTE' | 'DNS' | 'DHCP' | 'ROUTING' | 'ACL',
  sourceDevice: NetworkDevice,
  targetIpOrName: string,
  destDevice: NetworkDevice | null,
  vlans: Vlan[],
  aclConfig: AclConfig,
  subinterfaces: RouterSubinterface[],
  dnsRecords: DnsRecord[],
  dhcpPools: DhcpPool[]
): ConnectivityTestResult {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  if (type === 'PING') {
    if (!destDevice) {
      // Destination IP not found on network
      return {
        id: `test-${Date.now()}`,
        testType: 'PING',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: targetIpOrName,
        sourceIp: sourceDevice.ip,
        destIp: targetIpOrName,
        status: 'FAILED',
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `Destination Host Unreachable: No active ARP or routing table entry for target IP ${targetIpOrName}.`
      };
    }

    const routeDecision = traceRoutingPath(sourceDevice, destDevice, aclConfig, subinterfaces);

    if (!routeDecision.permitted) {
      return {
        id: `test-${Date.now()}`,
        testType: 'PING',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: destDevice.name,
        sourceIp: sourceDevice.ip,
        destIp: destDevice.ip,
        status: 'BLOCKED',
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `Request timed out. Blocked by HOSPITAL-R1 Extended ACL [${aclConfig.name}]: ${routeDecision.aclResult?.reason}`
      };
    }

    const latency = routeDecision.isSameVlan ? 0.8 : 2.4;
    return {
      id: `test-${Date.now()}`,
      testType: 'PING',
      timestamp: now,
      sourceDevice: sourceDevice.name,
      destDeviceOrTarget: destDevice.name,
      sourceIp: sourceDevice.ip,
      destIp: destDevice.ip,
      status: 'SUCCESS',
      packetsSent: 4,
      packetsReceived: 4,
      packetLossPercent: 0,
      avgResponseTimeMs: latency,
      details: `Ping statistics for ${destDevice.ip}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss). Approx round trip: Min = 1ms, Max = 4ms, Avg = ${latency}ms.`
    };
  }

  if (type === 'TRACEROUTE') {
    if (!destDevice) {
      return {
        id: `test-${Date.now()}`,
        testType: 'TRACEROUTE',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: targetIpOrName,
        sourceIp: sourceDevice.ip,
        destIp: targetIpOrName,
        status: 'FAILED',
        packetsSent: 3,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `Destination unreachable.`
      };
    }

    const routeDecision = traceRoutingPath(sourceDevice, destDevice, aclConfig, subinterfaces);
    const hops: { hop: number; node: string; ip: string; timeMs: number }[] = [];

    hops.push({ hop: 1, node: 'HOSPITAL-SW1', ip: '192.168.10.2', timeMs: 0.7 });

    if (!routeDecision.isSameVlan) {
      hops.push({ hop: 2, node: 'HOSPITAL-R1', ip: sourceDevice.gateway, timeMs: 1.5 });
      
      if (!routeDecision.permitted) {
        hops.push({ hop: 3, node: '* * * (ACL Filter Drop)', ip: 'Destination Administratively Prohibited', timeMs: 0 });
        return {
          id: `test-${Date.now()}`,
          testType: 'TRACEROUTE',
          timestamp: now,
          sourceDevice: sourceDevice.name,
          destDeviceOrTarget: destDevice.name,
          sourceIp: sourceDevice.ip,
          destIp: destDevice.ip,
          status: 'BLOCKED',
          packetsSent: 3,
          packetsReceived: 2,
          packetLossPercent: 33,
          avgResponseTimeMs: 1.5,
          hops,
          details: `Trace halted at hop 2 (HOSPITAL-R1): Blocked by ACL ${aclConfig.name} on subinterface GigabitEthernet0/0.${sourceDevice.vlanId}.`
        };
      }
    }

    hops.push({ hop: hops.length + 1, node: destDevice.name, ip: destDevice.ip, timeMs: 2.3 });

    return {
      id: `test-${Date.now()}`,
      testType: 'TRACEROUTE',
      timestamp: now,
      sourceDevice: sourceDevice.name,
      destDeviceOrTarget: destDevice.name,
      sourceIp: sourceDevice.ip,
      destIp: destDevice.ip,
      status: 'SUCCESS',
      packetsSent: 3,
      packetsReceived: 3,
      packetLossPercent: 0,
      avgResponseTimeMs: 2.3,
      hops,
      details: `Trace complete: ${hops.length} hops to destination ${destDevice.ip} over 802.1Q Dot1q trunk.`
    };
  }

  if (type === 'DNS') {
    const queryName = targetIpOrName.toLowerCase().trim();
    const record = dnsRecords.find(r => r.hostname.toLowerCase() === queryName);

    if (record) {
      return {
        id: `test-${Date.now()}`,
        testType: 'DNS',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: queryName,
        sourceIp: sourceDevice.ip,
        destIp: '192.168.60.11',
        status: 'SUCCESS',
        packetsSent: 1,
        packetsReceived: 1,
        packetLossPercent: 0,
        avgResponseTimeMs: 1.2,
        dnsResolvedIp: record.ip,
        details: `DNS resolution SUCCESS: ${record.hostname} resolved to ${record.ip} (${record.type} record, TTL ${record.ttl}s) via DNS-SRV (192.168.60.11).`
      };
    } else {
      return {
        id: `test-${Date.now()}`,
        testType: 'DNS',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: queryName,
        sourceIp: sourceDevice.ip,
        destIp: '192.168.60.11',
        status: 'FAILED',
        packetsSent: 1,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `NXDOMAIN: Domain name "${queryName}" not found in DNS-SRV authoritative zone table.`
      };
    }
  }

  if (type === 'DHCP') {
    const pool = dhcpPools.find(p => p.vlanId === sourceDevice.vlanId);
    if (!pool) {
      return {
        id: `test-${Date.now()}`,
        testType: 'DHCP',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: `VLAN ${sourceDevice.vlanId} Pool`,
        sourceIp: '0.0.0.0',
        destIp: '255.255.255.255',
        status: 'FAILED',
        packetsSent: 4,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `DHCPDISCOVER timeout: No configured DHCP server or ip helper-address for VLAN ${sourceDevice.vlanId}.`
      };
    }

    return {
      id: `test-${Date.now()}`,
      testType: 'DHCP',
      timestamp: now,
      sourceDevice: sourceDevice.name,
      destDeviceOrTarget: pool.name,
      sourceIp: '0.0.0.0',
      destIp: '255.255.255.255',
      status: 'SUCCESS',
      packetsSent: 4,
      packetsReceived: 4,
      packetLossPercent: 0,
      avgResponseTimeMs: 3.1,
      details: `DHCP DORA sequence successful: DISCOVER -> OFFER -> REQUEST -> ACK. Pool: ${pool.name}, Network: ${pool.network}/24, Gateway: ${pool.defaultRouter}, DNS: ${pool.dnsServer}.`
    };
  }

  if (type === 'ROUTING') {
    if (!destDevice) {
      return {
        id: `test-${Date.now()}`,
        testType: 'ROUTING',
        timestamp: now,
        sourceDevice: sourceDevice.name,
        destDeviceOrTarget: targetIpOrName,
        sourceIp: sourceDevice.ip,
        destIp: targetIpOrName,
        status: 'FAILED',
        packetsSent: 1,
        packetsReceived: 0,
        packetLossPercent: 100,
        avgResponseTimeMs: 0,
        details: `Routing table lookup failed: Network unreachable.`
      };
    }

    const sub = subinterfaces.find(s => s.vlanId === destDevice.vlanId);
    return {
      id: `test-${Date.now()}`,
      testType: 'ROUTING',
      timestamp: now,
      sourceDevice: sourceDevice.name,
      destDeviceOrTarget: destDevice.name,
      sourceIp: sourceDevice.ip,
      destIp: destDevice.ip,
      status: 'SUCCESS',
      packetsSent: 1,
      packetsReceived: 1,
      packetLossPercent: 0,
      avgResponseTimeMs: 1.0,
      details: `Route entry confirmed: Destination subnet ${destDevice.ip.split('.').slice(0, 3).join('.')}.0/24 is directly connected via subinterface ${sub?.interfaceName ?? 'G0/0'}. Next hop: Local gateway.`
    };
  }

  // ACL Test
  const aclResult = evaluateAcl(sourceDevice.ip, destDevice ? destDevice.ip : targetIpOrName, 'ip', aclConfig);
  return {
    id: `test-${Date.now()}`,
    testType: 'ACL',
    timestamp: now,
    sourceDevice: sourceDevice.name,
    destDeviceOrTarget: destDevice ? destDevice.name : targetIpOrName,
    sourceIp: sourceDevice.ip,
    destIp: destDevice ? destDevice.ip : targetIpOrName,
    status: aclResult.action === 'permit' ? 'ALLOWED' : 'BLOCKED',
    packetsSent: 1,
    packetsReceived: aclResult.action === 'permit' ? 1 : 0,
    packetLossPercent: aclResult.action === 'permit' ? 0 : 100,
    avgResponseTimeMs: 0.5,
    details: aclResult.reason
  };
}

// Cisco IOS Terminal Command Output Formatter
export function executeCiscoCommand(
  cmd: string,
  state: {
    vlans: Vlan[];
    devices: NetworkDevice[];
    dhcpPools: DhcpPool[];
    dhcpLeases: DhcpLease[];
    subinterfaces: RouterSubinterface[];
    routes: RouteEntry[];
    acl: AclConfig;
  }
): string {
  const normalized = cmd.trim().toLowerCase();

  if (normalized === 'help' || normalized === '?') {
    return `Available Cisco IOS Exec Verification Commands:
  show vlan brief         - Display VLAN table, names, status and access ports
  show interfaces trunk   - Display 802.1Q trunk interfaces, encapsulation, and allowed VLANs
  show ip interface brief - Display router physical and subinterfaces status & IP
  show ip route           - Display Cisco IP routing table (directly connected routes)
  show ip dhcp binding    - Display Cisco DHCP address bindings and lease hardware MACs
  show access-lists       - Display configured Extended Access Lists & rule hit counters
  show running-config     - Display full device running configuration
  ping <ip_address>       - Ping target destination IP address
  clear                   - Clear the terminal screen`;
  }

  if (normalized === 'show vlan brief' || normalized === 'show vlan') {
    let out = `HOSPITAL-SW1# show vlan brief\n\n`;
    out += `VLAN Name                             Status    Ports\n`;
    out += `---- -------------------------------- --------- -------------------------------\n`;
    out += `1    default                          active    Fa0/15, Fa0/16, Fa0/17, Fa0/18,\n`;
    out += `                                                Fa0/19, Fa0/20, Fa0/21, Fa0/22,\n`;
    out += `                                                Fa0/23, Fa0/24, Gi0/2\n`;
    for (const v of state.vlans) {
      const vlanIdStr = v.id.toString().padEnd(4);
      const nameStr = v.name.padEnd(32);
      const statusStr = v.status.padEnd(9);
      out += `${vlanIdStr} ${nameStr} ${statusStr} ${v.switchPorts}\n`;
    }
    return out;
  }

  if (normalized === 'show interfaces trunk' || normalized === 'show int trunk') {
    let out = `HOSPITAL-SW1# show interfaces trunk\n\n`;
    out += `Port        Mode             Encapsulation  Status        Native vlan\n`;
    out += `Gi0/1       on               802.1q         trunking      1\n\n`;
    out += `Port        Vlans allowed on trunk\n`;
    out += `Gi0/1       10,20,30,40,50,60\n\n`;
    out += `Port        Vlans allowed and active in management domain\n`;
    const activeVlans = state.vlans.map(v => v.id).join(',');
    out += `Gi0/1       ${activeVlans}\n\n`;
    out += `Port        Vlans in spanning tree forwarding state and not pruned\n`;
    out += `Gi0/1       ${activeVlans}\n`;
    return out;
  }

  if (normalized === 'show ip interface brief' || normalized === 'show ip int brief') {
    let out = `HOSPITAL-R1# show ip interface brief\n\n`;
    out += `Interface              IP-Address      OK? Method Status                Protocol\n`;
    out += `GigabitEthernet0/0     unassigned      YES unset  up                    up      \n`;
    for (const sub of state.subinterfaces) {
      const iface = sub.interfaceName.padEnd(22);
      const ip = sub.ipAddress.padEnd(15);
      const status = sub.status.padEnd(21);
      out += `${iface} ${ip} YES manual ${status} up      \n`;
    }
    out += `GigabitEthernet0/1     unassigned      YES unset  administratively down down    \n`;
    return out;
  }

  if (normalized === 'show ip route') {
    let out = `HOSPITAL-R1# show ip route\n`;
    out += `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP\n`;
    out += `       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n\n`;
    out += `Gateway of last resort is not set\n\n`;
    for (const r of state.routes) {
      out += `${r.type}    ${r.network}/24 is directly connected, ${r.interface}\n`;
    }
    return out;
  }

  if (normalized === 'show ip dhcp binding') {
    let out = `HOSPITAL-R1# show ip dhcp binding\n`;
    out += `Bindings from all pools : ${state.dhcpLeases.length}\n`;
    out += `IP address       Client-ID/              Lease expiration        Type\n`;
    out += `                 Hardware address\n`;
    for (const l of state.dhcpLeases) {
      out += `${l.ip.padEnd(16)} ${l.clientId.padEnd(23)} ${l.expireTime.padEnd(23)} Automatic\n`;
    }
    return out;
  }

  if (normalized === 'show access-lists' || normalized === 'show access-list' || normalized === 'show ip access-lists') {
    let out = `HOSPITAL-R1# show access-lists\n`;
    out += `Extended IP access list ${state.acl.name}${state.acl.enabled ? ' (ACTIVE on Gi0/0.50 inbound)' : ' (DISABLED)'}\n`;
    const sorted = [...state.acl.rules].sort((a, b) => a.sequence - b.sequence);
    for (const r of sorted) {
      out += `    ${r.sequence} ${r.action} ${r.protocol} ${r.sourceNetwork} ${r.sourceWildcard} ${r.destNetwork} ${r.destWildcard} (${r.hitCount} matches)\n`;
    }
    return out;
  }

  if (normalized === 'show running-config' || normalized === 'show run') {
    let out = `HOSPITAL-R1# show running-config\n`;
    out += `!\nversion 15.1\nservice timestamps debug datetime msec\nservice timestamps log datetime msec\nno service password-encryption\n!\nhostname HOSPITAL-R1\n!\nip routing\n!\n`;
    for (const pool of state.dhcpPools) {
      out += `ip dhcp excluded-address ${pool.excludedIps[0]} ${pool.excludedIps[pool.excludedIps.length - 1]}\n`;
      out += `ip dhcp pool ${pool.name}\n network ${pool.network} ${pool.netmask}\n default-router ${pool.defaultRouter}\n dns-server ${pool.dnsServer}\n lease 1 0 0\n!\n`;
    }
    out += `interface GigabitEthernet0/0\n no ip address\n duplex auto\n speed auto\n!\n`;
    for (const sub of state.subinterfaces) {
      out += `interface ${sub.interfaceName}\n encapsulation ${sub.encapsulation}\n ip address ${sub.ipAddress} ${sub.subnetMask}\n`;
      if (sub.inboundAcl) {
        out += ` ip access-group ${sub.inboundAcl} in\n`;
      }
      out += `!\n`;
    }
    out += `ip access-list extended ${state.acl.name}\n`;
    for (const r of state.acl.rules) {
      out += ` ${r.sequence} ${r.action} ${r.protocol} ${r.sourceNetwork} ${r.sourceWildcard} ${r.destNetwork} ${r.destWildcard}\n`;
    }
    out += `!\nend\n`;
    return out;
  }

  if (normalized.startsWith('ping ')) {
    const target = normalized.replace('ping ', '').trim();
    const dest = state.devices.find(d => d.ip === target || d.name.toLowerCase() === target);
    if (!dest) {
      return `HOSPITAL-R1# ping ${target}\nType escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\n.....\nSuccess rate is 0 percent (0/5)`;
    }
    return `HOSPITAL-R1# ping ${target}\nType escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${dest.ip}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`;
  }

  return `HOSPITAL-R1# ${cmd}\n% Invalid input detected at '^' marker.\nType "help" or "?" to see available commands.`;
}
