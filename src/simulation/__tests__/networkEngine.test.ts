import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  ipToLong,
  longToIp,
  isValidIp,
  isIpInSubnet,
  matchesWildcard,
  evaluateAcl,
  traceRoutingPath,
  allocateDhcpAddress,
  executeCiscoCommand
} from '../networkEngine';
import {
  DEFAULT_VLANS,
  DEFAULT_DEVICES,
  DEFAULT_SUBINTERFACES,
  DEFAULT_DHCP_POOLS,
  DEFAULT_DHCP_LEASES,
  DEFAULT_ROUTING_TABLE,
  DEFAULT_ACL
} from '../defaultData';

describe('Network Engine Pure Logic Tests', () => {
  test('IP mathematical conversions and validation', () => {
    assert.strictEqual(isValidIp('192.168.10.1'), true);
    assert.strictEqual(isValidIp('256.0.0.1'), false);
    assert.strictEqual(isValidIp('abc.def.ghi.jkl'), false);

    const longVal = ipToLong('192.168.10.1');
    assert.strictEqual(longToIp(longVal), '192.168.10.1');
  });

  test('Subnet containment and wildcard matches', () => {
    assert.strictEqual(isIpInSubnet('192.168.10.50', '192.168.10.0', '255.255.255.0'), true);
    assert.strictEqual(isIpInSubnet('192.168.20.50', '192.168.10.0', '255.255.255.0'), false);

    assert.strictEqual(matchesWildcard('192.168.50.101', '192.168.50.0', '0.0.0.255'), true);
    assert.strictEqual(matchesWildcard('192.168.30.50', '192.168.50.0', '0.0.0.255'), false);
    assert.strictEqual(matchesWildcard('192.168.10.1', 'any', 'any'), true);
  });

  test('Extended ACL evaluation (GUEST_ISOLATION)', () => {
    // Guest (192.168.50.101) to Hospital Server (192.168.60.10) must be DENIED
    const guestToServer = evaluateAcl('192.168.50.101', '192.168.60.10', 'ip', DEFAULT_ACL);
    assert.strictEqual(guestToServer.action, 'deny');
    assert.strictEqual(guestToServer.matchedRule?.sequence, 50);

    // Guest to Medical (192.168.30.50) must be DENIED
    const guestToMedical = evaluateAcl('192.168.50.101', '192.168.30.50', 'ip', DEFAULT_ACL);
    assert.strictEqual(guestToMedical.action, 'deny');
    assert.strictEqual(guestToMedical.matchedRule?.sequence, 30);

    // Admin (192.168.10.50) to Hospital Server (192.168.60.10) must be PERMITTED
    const adminToServer = evaluateAcl('192.168.10.50', '192.168.60.10', 'ip', DEFAULT_ACL);
    assert.strictEqual(adminToServer.action, 'permit');
  });

  test('Router-on-a-Stick packet path simulation', () => {
    const admin = DEFAULT_DEVICES.find(d => d.id === 'admin-pc-1')!;
    const server = DEFAULT_DEVICES.find(d => d.id === 'srv-hospital')!;
    const guest = DEFAULT_DEVICES.find(d => d.id === 'guest-laptop-1')!;

    // Admin to Server (Permitted via ROAS subinterface G0/0.10 to G0/0.60)
    const adminTrace = traceRoutingPath(admin, server, DEFAULT_ACL, DEFAULT_SUBINTERFACES);
    assert.strictEqual(adminTrace.permitted, true);
    assert.strictEqual(adminTrace.routerInvolved, true);
    assert.strictEqual(adminTrace.steps.length, 8);

    // Guest to Server (Blocked at Router Subinterface G0/0.50)
    const guestTrace = traceRoutingPath(guest, server, DEFAULT_ACL, DEFAULT_SUBINTERFACES);
    assert.strictEqual(guestTrace.permitted, false);
    assert.strictEqual(guestTrace.routerInvolved, true);
    assert.strictEqual(guestTrace.aclResult?.action, 'deny');
  });

  test('DHCP dynamic allocation engine', () => {
    const adminDev = DEFAULT_DEVICES.find(d => d.id === 'admin-pc-1')!;
    const pool = DEFAULT_DHCP_POOLS.find(p => p.name === 'ADMIN')!;

    const alloc = allocateDhcpAddress(adminDev, pool, DEFAULT_DEVICES, DEFAULT_DHCP_LEASES);
    assert.strictEqual(alloc.success, true);
    assert.ok(alloc.ip);
    assert.strictEqual(alloc.lease?.poolName, 'ADMIN');
  });

  test('Cisco CLI simulation command output', () => {
    const outVlan = executeCiscoCommand('show vlan brief', {
      vlans: DEFAULT_VLANS,
      devices: DEFAULT_DEVICES,
      dhcpPools: DEFAULT_DHCP_POOLS,
      dhcpLeases: DEFAULT_DHCP_LEASES,
      subinterfaces: DEFAULT_SUBINTERFACES,
      routes: DEFAULT_ROUTING_TABLE,
      acl: DEFAULT_ACL
    });
    assert.ok(outVlan.includes('VLAN Name'));
    assert.ok(outVlan.includes('ADMINISTRATION'));
    assert.ok(outVlan.includes('HOSPITAL_SERVERS'));

    const outAcl = executeCiscoCommand('show access-lists', {
      vlans: DEFAULT_VLANS,
      devices: DEFAULT_DEVICES,
      dhcpPools: DEFAULT_DHCP_POOLS,
      dhcpLeases: DEFAULT_DHCP_LEASES,
      subinterfaces: DEFAULT_SUBINTERFACES,
      routes: DEFAULT_ROUTING_TABLE,
      acl: DEFAULT_ACL
    });
    assert.ok(outAcl.includes('Extended IP access list GUEST_ISOLATION'));
    assert.ok(outAcl.includes('10 deny ip 192.168.50.0'));
  });
});
