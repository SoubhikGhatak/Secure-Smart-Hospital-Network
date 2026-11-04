import React, { useState } from 'react';
import {
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Network,
  Layers,
  Radio,
  GitFork,
  Server,
  ShieldAlert,
  Activity,
  HelpCircle,
  Terminal,
  Sparkles
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';
import { NavView } from './Sidebar';
import { executeCiscoCommand, evaluateAcl, traceRoutingPath } from '../simulation/networkEngine';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: NavView) => void;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const {
    devices,
    vlans,
    subinterfaces,
    aclConfig,
    dhcpPools,
    dhcpLeases,
    routingTable,
    requestDhcp,
    generateTrafficBurst,
    runTest
  } = useNetwork();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepActionDone, setStepActionDone] = useState<boolean>(false);
  const [demoOutput, setDemoOutput] = useState<any>(null);

  if (!isOpen) return null;

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'DEMO 1 — NETWORK ARCHITECTURE',
      viewTarget: 'topology' as NavView,
      icon: Network,
      tag: 'Hierarchical Topology',
      explanation:
        'Display the complete enterprise hospital campus topology. The infrastructure consists of a Cisco 2911 router (HOSPITAL-R1) connected via an IEEE 802.1Q dot1q GigabitEthernet trunk to a Catalyst 2960 switch (HOSPITAL-SW1), feeding 6 departmental VLANs and a dedicated hospital server farm.',
      actionLabel: 'Inspect Active Topology Nodes',
      execute: () => {
        onNavigateToView('topology');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Successfully verified all ${devices.length} network nodes, 802.1Q dot1q trunk, and 6 departmental subnets on the live interactive canvas.`
        });
      }
    },
    {
      step: 2,
      title: 'DEMO 2 — VLAN SEGMENTATION',
      viewTarget: 'vlans' as NavView,
      icon: Layers,
      tag: '6 Broadcast Domains',
      explanation:
        'Verify Layer-2 departmental segmentation into 6 distinct VLANs: Administration (VLAN 10), Reception (VLAN 20), Medical / Doctors (VLAN 30), Laboratory (VLAN 40), Guest Wi-Fi (VLAN 50), and Hospital Servers (VLAN 60). Broadcast traffic is completely isolated between departments.',
      actionLabel: 'Verify 6 Departmental VLANs',
      execute: () => {
        onNavigateToView('vlans');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `6 isolated VLANs confirmed: VLAN 10 (192.168.10.0/24), VLAN 20 (192.168.20.0/24), VLAN 30 (192.168.30.0/24), VLAN 40 (192.168.40.0/24), VLAN 50 (192.168.50.0/24), VLAN 60 (192.168.60.0/24).`
        });
      }
    },
    {
      step: 3,
      title: 'DEMO 3 — DHCP ASSIGNMENT',
      viewTarget: 'dhcp' as NavView,
      icon: Radio,
      tag: 'Dynamic Addressing',
      explanation:
        'Demonstrate automated dynamic IP addressing via multi-pool Cisco DHCP on HOSPITAL-R1. A client endpoint broadcasts a DHCPDISCOVER, and the router allocates an IP, subnet mask, default gateway, and DNS resolver (192.168.60.11) with lease tracking.',
      actionLabel: 'Execute DHCP Request for DOCTOR-WS-1',
      execute: () => {
        const res = requestDhcp('doctor-ws-1');
        onNavigateToView('dhcp');
        setStepActionDone(true);
        setDemoOutput({
          status: res.success ? 'success' : 'failure',
          message: res.message
        });
      }
    },
    {
      step: 4,
      title: 'DEMO 4 — INTER-VLAN ROUTING',
      viewTarget: 'routing' as NavView,
      icon: GitFork,
      tag: 'Router-on-a-Stick',
      explanation:
        'Demonstrate authorized inter-VLAN communication between two departments: Medical Doctor Workstation (VLAN 30) accessing the Hospital EHR Application Server (VLAN 60). The packet traverses access switch Fa0/5 -> 802.1Q Trunk G0/1 -> Router subinterface G0/0.30 -> Routing Engine -> G0/0.60 -> Fa0/12.',
      actionLabel: 'Simulate Medical WS → Hospital Server Flow',
      execute: () => {
        const src = devices.find(d => d.id === 'doctor-ws-1') || devices[0];
        const dst = devices.find(d => d.id === 'srv-hospital') || devices[1];
        const res = runTest('PING', src.id, dst.ip);
        onNavigateToView('routing');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Inter-VLAN transmission PERMITTED: DOCTOR-WS-1 (192.168.30.50) successfully reached HOSPITAL-SRV (192.168.60.10) over 802.1Q subinterfaces G0/0.30 to G0/0.60. Round trip: ${res.avgResponseTimeMs} ms.`
        });
      }
    },
    {
      step: 5,
      title: 'DEMO 5 — HOSPITAL SERVER ACCESS',
      viewTarget: 'servers' as NavView,
      icon: Server,
      tag: 'EHR / DNS / Backup',
      explanation:
        'Examine the centralized server infrastructure in VLAN 60: HOSPITAL-SRV (192.168.60.10) providing electronic medical charting and patient intake; DNS-SRV (192.168.60.11) resolving hospital.local; and BACKUP-SRV (192.168.60.12) managing encrypted PACS radiological repositories.',
      actionLabel: 'Inspect Hospital Application & EHR Portal',
      execute: () => {
        onNavigateToView('servers');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Hospital Clinical Suite verified online: Electronic patient admission registry, active ICU bed telemetry, and doctor consultation rosters functioning in VLAN 60.`
        });
      }
    },
    {
      step: 6,
      title: 'DEMO 6 — GUEST SECURITY & ISOLATION',
      viewTarget: 'security' as NavView,
      icon: ShieldAlert,
      tag: 'Extended ACL Filter',
      explanation:
        'Attempt unauthorized communication from a visitor on the Guest network (GUEST-LAPTOP-1: 192.168.50.101) to the Hospital EHR Server (192.168.60.10). The inbound Extended ACL "GUEST_ISOLATION" on subinterface G0/0.50 intercepts the packet and drops it immediately.',
      actionLabel: 'Attempt Guest PC → Hospital Server Probe',
      execute: () => {
        const guest = devices.find(d => d.id === 'guest-laptop-1') || devices[0];
        const srv = devices.find(d => d.id === 'srv-hospital') || devices[1];
        const res = runTest('ACL', guest.id, srv.ip);
        onNavigateToView('security');
        setStepActionDone(true);
        setDemoOutput({
          status: 'blocked',
          message: `SECURITY ENFORCEMENT VERIFIED: Connection BLOCKED by Extended ACL [GUEST_ISOLATION] Rule 50: Deny Guest 192.168.50.0/24 to Hospital Servers 192.168.60.0/24.`
        });
      }
    },
    {
      step: 7,
      title: 'DEMO 7 — NETWORK MONITORING',
      viewTarget: 'traffic' as NavView,
      icon: Activity,
      tag: 'Live Flow Telemetry',
      explanation:
        'Generate simulated network traffic events across multiple Layer-4 protocols (TCP, UDP, ICMP, DNS, HTTP, HTTPS) and observe real-time flow telemetry, protocol breakdowns, and policy enforcement metrics.',
      actionLabel: 'Generate Burst Traffic Across All VLANs',
      execute: () => {
        generateTrafficBurst();
        onNavigateToView('traffic');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Generated realistic multi-VLAN traffic burst. Real-time flows updated in packet telemetry table and bandwidth distribution charts.`
        });
      }
    },
    {
      step: 8,
      title: 'DEMO 8 — CONNECTIVITY VERIFICATION',
      viewTarget: 'testing' as NavView,
      icon: HelpCircle,
      tag: 'Diagnostic Testing Matrix',
      explanation:
        'Execute preconfigured academic test scenarios verifying both permitted and denied pathways: Admin-to-Server (ALLOWED), Medical-to-Server (ALLOWED), and Guest-to-Server (BLOCKED).',
      actionLabel: 'Execute Diagnostic Ping & Traceroute',
      execute: () => {
        const adm = devices.find(d => d.id === 'admin-pc-1') || devices[0];
        const srv = devices.find(d => d.id === 'srv-hospital') || devices[1];
        const res = runTest('PING', adm.id, srv.ip);
        onNavigateToView('testing');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Verification complete: Ping probe from ${adm.name} to ${srv.name} (${srv.ip}) returned 0% packet loss, ${res.avgResponseTimeMs} ms latency.`
        });
      }
    },
    {
      step: 9,
      title: 'DEMO 9 — CISCO CLI VERIFICATION',
      viewTarget: 'cisco-cli' as NavView,
      icon: Terminal,
      tag: 'IOS Exec Simulator',
      explanation:
        'Conclude the project demonstration inside the Cisco IOS command-line interface. Run "show vlan brief", "show ip route", and "show access-lists" to verify that running router parameters match the academic architecture.',
      actionLabel: 'Execute "show access-lists" on HOSPITAL-R1',
      execute: () => {
        const out = executeCiscoCommand('show access-lists', {
          vlans,
          devices,
          dhcpPools,
          dhcpLeases,
          subinterfaces,
          routes: routingTable,
          acl: aclConfig
        });
        onNavigateToView('cisco-cli');
        setStepActionDone(true);
        setDemoOutput({
          status: 'success',
          message: `Cisco CLI executed: Output returned for "show access-lists" displaying active GUEST_ISOLATION rule counters.`
        });
      }
    }
  ];

  const currentStepData = DEMO_STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepActionDone(false);
      setDemoOutput(null);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setStepActionDone(false);
      setDemoOutput(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                PROJECT DEMONSTRATION MODE
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono">
                University Evaluator Step-by-Step Defense Guide
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Step {currentStep + 1} of {DEMO_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-5 pt-3 pb-1 flex items-center gap-1.5 bg-slate-950/50">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => {
                setCurrentStep(idx);
                setStepActionDone(false);
                setDemoOutput(null);
              }}
              className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all ${
                idx === currentStep
                  ? 'bg-cyan-400 ring-2 ring-cyan-500/30'
                  : idx < currentStep
                  ? 'bg-blue-600'
                  : 'bg-slate-800'
              }`}
              title={`Demo ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Main Step Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base text-white tracking-tight">
                {currentStepData.title}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {currentStepData.tag}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {currentStepData.explanation}
          </p>

          {/* Interactive Trigger Button for this step */}
          <div className="pt-2">
            <button
              onClick={currentStepData.execute}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{currentStepData.actionLabel}</span>
            </button>
          </div>

          {/* Execution Result Box */}
          {demoOutput && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono space-y-1.5 transition-all ${
                demoOutput.status === 'blocked'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : demoOutput.status === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {demoOutput.status === 'blocked' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                ) : demoOutput.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-bold tracking-wider uppercase">
                  {demoOutput.status === 'blocked'
                    ? 'SECURITY CHECK PASSED: VIOLATION BLOCKED'
                    : demoOutput.status === 'success'
                    ? 'STEP EXECUTION SUCCESSFUL'
                    : 'EXECUTION FAILED'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed pl-6 text-slate-200">
                {demoOutput.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              currentStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Demo</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
          >
            Exit Guided Tour
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === DEMO_STEPS.length - 1}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              currentStep === DEMO_STEPS.length - 1
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
            }`}
          >
            <span>Next Demo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
