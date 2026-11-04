import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Server,
  Monitor,
  Smartphone,
  Laptop,
  HeartPulse,
  Router as RouterIcon,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNetwork, PacketAnimationState } from '../../context/NetworkContext';
import { NetworkDevice, Vlan } from '../../types/network';
import { traceRoutingPath } from '../../simulation/networkEngine';

export const TopologyView: React.FC = () => {
  const {
    devices,
    vlans,
    aclConfig,
    subinterfaces,
    selectedDevice,
    setSelectedDevice,
    animatingPacket,
    setAnimatingPacket,
    requestDhcp,
    runTest
  } = useNetwork();

  // Canvas Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Quick Simulation Controls
  const [simSourceId, setSimSourceId] = useState<string>('doctor-ws-1');
  const [simDestId, setSimDestId] = useState<string>('srv-hospital');
  const [simProtocol, setSimProtocol] = useState<'TCP' | 'HTTP' | 'HTTPS' | 'ICMP'>('HTTPS');

  // Animation Step Tracker
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Core coordinates on 1200x800 logical canvas
  const ROUTER_POS = { x: 600, y: 70 };
  const SWITCH_POS = { x: 600, y: 220 };

  // 6 VLAN Cluster Anchor Centers
  // VLAN 10 (Admin), 20 (Reception), 30 (Medical), 40 (Lab), 50 (Guest), 60 (Servers)
  const VLAN_CENTERS: Record<number, { x: number; y: number; label: string; color: string }> = {
    10: { x: 120, y: 440, label: 'VLAN 10: Admin (Fa0/1-2)', color: '#06b6d4' },
    20: { x: 310, y: 440, label: 'VLAN 20: Reception (Fa0/3-4)', color: '#3b82f6' },
    30: { x: 500, y: 440, label: 'VLAN 30: Medical / ICU (Fa0/5-7)', color: '#10b981' },
    40: { x: 690, y: 440, label: 'VLAN 40: Laboratory (Fa0/8-9)', color: '#8b5cf6' },
    50: { x: 880, y: 440, label: 'VLAN 50: Guest (Fa0/10-11)', color: '#f59e0b' },
    60: { x: 1070, y: 440, label: 'VLAN 60: Server Farm (Fa0/12-14)', color: '#ec4899' }
  };

  // Compute exact (x, y) for all devices
  const getDevicePosition = (device: NetworkDevice) => {
    if (device.type === 'router') return ROUTER_POS;
    if (device.type === 'switch') return SWITCH_POS;

    const cluster = VLAN_CENTERS[device.vlanId] || { x: 600, y: 500 };
    const devicesInVlan = devices.filter(d => d.vlanId === device.vlanId && d.type !== 'router' && d.type !== 'switch');
    const index = devicesInVlan.findIndex(d => d.id === device.id);
    const total = devicesInVlan.length || 1;

    // Distribute vertically or slightly offset inside column
    const offsetY = 540 + index * 85;
    return { x: cluster.x, y: offsetY };
  };

  // Zoom and pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Trigger Packet Animation
  const startPacketSimulation = (srcId: string = simSourceId, dstId: string = simDestId) => {
    const src = devices.find(d => d.id === srcId);
    const dst = devices.find(d => d.id === dstId);
    if (!src || !dst) return;

    const decision = traceRoutingPath(src, dst, aclConfig, subinterfaces);
    setSimulationResult(decision);
    setIsSimulating(true);
    setCurrentStep(0);

    const animState: PacketAnimationState = {
      id: `packet-${Date.now()}`,
      sourceDevice: src,
      destDevice: dst,
      routingDecision: decision,
      currentStepIndex: 0,
      isComplete: false
    };
    setAnimatingPacket(animState);

    // Step by step animation timer
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= decision.steps.length) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 900);
  };

  // Listen to external tests
  useEffect(() => {
    if (animatingPacket && !isSimulating) {
      setSimulationResult(animatingPacket.routingDecision);
      setSimSourceId(animatingPacket.sourceDevice.id);
      setSimDestId(animatingPacket.destDevice.id);
      setIsSimulating(true);
      setCurrentStep(0);

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCurrentStep(step);
        if (step >= animatingPacket.routingDecision.steps.length) {
          clearInterval(interval);
          setIsSimulating(false);
        }
      }, 900);
    }
  }, [animatingPacket]);

  // Render device icon based on type
  const renderDeviceIcon = (dev: NetworkDevice) => {
    switch (dev.type) {
      case 'router':
        return <RouterIcon className="w-6 h-6 text-cyan-300" />;
      case 'switch':
        return <Layers className="w-6 h-6 text-blue-300" />;
      case 'server':
        return <Server className="w-5 h-5 text-pink-300" />;
      case 'medical-device':
        return <HeartPulse className="w-5 h-5 text-emerald-300" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-amber-300" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-amber-300" />;
      default:
        return <Monitor className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Topology Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Interactive Cisco Campus Topology
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              ROAS + 802.1Q Trunk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any network node to inspect interfaces. Select source and destination to simulate real-time packet traversal.
          </p>
        </div>

        {/* Quick Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-mono">From:</span>
            <select
              value={simSourceId}
              onChange={e => setSimSourceId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {devices.filter(d => d.type !== 'router' && d.type !== 'switch').map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500 font-mono">To:</span>
            <select
              value={simDestId}
              onChange={e => setSimDestId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {devices.filter(d => d.type !== 'router' && d.type !== 'switch').map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} (VLAN {d.vlanId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => startPacketSimulation()}
            disabled={isSimulating}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer ${
              isSimulating
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Tracing Flow...' : 'Simulate Packet'}</span>
          </button>

          {/* Canvas View Controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.0))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              title="Reset Canvas View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas + Floating Packet Inspector */}
      <div className="relative w-full h-[620px] rounded-2xl bg-[#030712] border border-slate-800 overflow-hidden shadow-2xl flex">
        {/* SVG Topology Area */}
        <div
          ref={containerRef}
          id="canvas-bg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 h-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
        >
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '50% 50%',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <defs>
              {/* Cyan Glow Filter for Active Trunk Cable */}
              <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Amber Glow Filter for Guest Isolation */}
              <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Trunk Connection: Router HOSPITAL-R1 (G0/0) <---> Switch HOSPITAL-SW1 (G0/1) */}
            <g>
              <line
                x1={ROUTER_POS.x}
                y1={ROUTER_POS.y + 24}
                x2={SWITCH_POS.x}
                y2={SWITCH_POS.y - 24}
                stroke="#06b6d4"
                strokeWidth="4"
                strokeDasharray="6 3"
                filter="url(#cyan-glow)"
              />
              {/* Trunk Badge */}
              <rect
                x={SWITCH_POS.x - 70}
                y={130}
                width="140"
                height="24"
                rx="6"
                fill="#020617"
                stroke="#0891b2"
                strokeWidth="1.5"
              />
              <text
                x={SWITCH_POS.x}
                y={146}
                fill="#22d3ee"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight="bold"
                textAnchor="middle"
              >
                802.1Q TRUNK (G0/0-G0/1)
              </text>
            </g>

            {/* 2. Departmental VLAN Boundaries & Switch-to-Cluster Access Lines */}
            {Object.entries(VLAN_CENTERS).map(([vlanIdStr, info]) => {
              const vlanId = parseInt(vlanIdStr, 10);
              const isGuest = vlanId === 50;
              const isServer = vlanId === 60;

              return (
                <g key={`vlan-cluster-${vlanId}`}>
                  {/* Subtle Boundary Box for Department VLAN */}
                  <rect
                    x={info.x - 75}
                    y={390}
                    width={150}
                    height={380}
                    rx="12"
                    fill={isGuest ? 'rgba(245, 158, 11, 0.04)' : isServer ? 'rgba(236, 72, 153, 0.04)' : 'rgba(30, 41, 59, 0.25)'}
                    stroke={info.color}
                    strokeWidth={isGuest ? '2' : '1'}
                    strokeDasharray={isGuest ? '4 3' : 'none'}
                    opacity={0.8}
                  />

                  {/* Header Tab */}
                  <rect
                    x={info.x - 65}
                    y={398}
                    width={130}
                    height={22}
                    rx="4"
                    fill="#0f172a"
                    stroke={info.color}
                    strokeWidth="1"
                  />
                  <text
                    x={info.x}
                    y={413}
                    fill={info.color}
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    VLAN {vlanId}: {vlans.find(v => v.id === vlanId)?.department.split('/')[0].trim()}
                  </text>

                  {/* Access Line from Switch to VLAN Center */}
                  <line
                    x1={SWITCH_POS.x}
                    y1={SWITCH_POS.y + 24}
                    x2={info.x}
                    y2={390}
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}

            {/* 3. Access Port Cable Lines from Cluster Anchor to Workstations */}
            {devices
              .filter(d => d.type !== 'router' && d.type !== 'switch')
              .map(dev => {
                const pos = getDevicePosition(dev);
                const cluster = VLAN_CENTERS[dev.vlanId] || { x: pos.x, y: 440 };
                return (
                  <line
                    key={`line-${dev.id}`}
                    x1={cluster.x}
                    y1={425}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                );
              })}

            {/* 4. Active Animated Packet Travelling Along Path */}
            {isSimulating && simulationResult && (
              <g>
                {/* Visual pulsating packet ring */}
                {(() => {
                  const srcPos = getDevicePosition(simulationResult.steps[0] ? devices.find(d => d.name === simulationResult.steps[0].node) || devices[0] : devices[0]);
                  let currX = srcPos.x;
                  let currY = srcPos.y;

                  if (currentStep === 1) {
                    currX = SWITCH_POS.x;
                    currY = SWITCH_POS.y;
                  } else if (currentStep === 2) {
                    currX = ROUTER_POS.x;
                    currY = ROUTER_POS.y;
                  } else if (currentStep >= 3) {
                    if (simulationResult.permitted) {
                      const dstDev = devices.find(d => d.id === simDestId) || devices[0];
                      const dstPos = getDevicePosition(dstDev);
                      currX = currentStep === 3 ? SWITCH_POS.x : dstPos.x;
                      currY = currentStep === 3 ? SWITCH_POS.y : dstPos.y;
                    } else {
                      // Blocked at router!
                      currX = ROUTER_POS.x;
                      currY = ROUTER_POS.y;
                    }
                  }

                  const isBlocked = !simulationResult.permitted && currentStep >= 2;

                  return (
                    <g transform={`translate(${currX}, ${currY})`}>
                      <circle
                        r="14"
                        fill={isBlocked ? '#f43f5e' : '#10b981'}
                        opacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        r="8"
                        fill={isBlocked ? '#f43f5e' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })()}
              </g>
            )}

            {/* 5. Render Core Devices (Router & Switch) */}
            {/* HOSPITAL-R1 (Router) */}
            <g
              transform={`translate(${ROUTER_POS.x - 36}, ${ROUTER_POS.y - 28})`}
              onClick={() => setSelectedDevice(devices.find(d => d.id === 'router-1') || null)}
              className="cursor-pointer group"
            >
              <rect
                width="72"
                height="56"
                rx="12"
                fill="#0f172a"
                stroke="#06b6d4"
                strokeWidth="2"
                className="group-hover:stroke-cyan-300 transition"
              />
              <circle cx="36" cy="22" r="14" fill="#083344" />
              <text x="36" y="26" fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">
                R1
              </text>
              <text x="36" y="47" fill="#ffffff" fontSize="9" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
                HOSPITAL-R1
              </text>
            </g>

            {/* HOSPITAL-SW1 (Switch) */}
            <g
              transform={`translate(${SWITCH_POS.x - 36}, ${SWITCH_POS.y - 28})`}
              onClick={() => setSelectedDevice(devices.find(d => d.id === 'switch-1') || null)}
              className="cursor-pointer group"
            >
              <rect
                width="72"
                height="56"
                rx="12"
                fill="#0f172a"
                stroke="#3b82f6"
                strokeWidth="2"
                className="group-hover:stroke-blue-300 transition"
              />
              <circle cx="36" cy="22" r="14" fill="#172554" />
              <text x="36" y="26" fill="#60a5fa" fontSize="12" fontWeight="bold" textAnchor="middle">
                SW1
              </text>
              <text x="36" y="47" fill="#ffffff" fontSize="9" fontFamily="var(--font-mono)" fontWeight="bold" textAnchor="middle">
                HOSPITAL-SW1
              </text>
            </g>

            {/* 6. Render Workstations, Laptops, Servers */}
            {devices
              .filter(d => d.type !== 'router' && d.type !== 'switch')
              .map(dev => {
                const pos = getDevicePosition(dev);
                const isSelected = selectedDevice?.id === dev.id;
                const vlanColor = VLAN_CENTERS[dev.vlanId]?.color || '#94a3b8';

                return (
                  <g
                    key={dev.id}
                    transform={`translate(${pos.x - 38}, ${pos.y - 25})`}
                    onClick={() => setSelectedDevice(dev)}
                    className="cursor-pointer group"
                  >
                    <rect
                      width="76"
                      height="50"
                      rx="8"
                      fill="#090d16"
                      stroke={isSelected ? '#38bdf8' : '#1e293b'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                      className="group-hover:stroke-slate-400 transition"
                    />
                    {/* Status Dot */}
                    <circle
                      cx="66"
                      cy="10"
                      r="3.5"
                      fill={dev.status === 'online' ? '#10b981' : '#f43f5e'}
                    />
                    {/* Device Icon Circle */}
                    <circle cx="20" cy="25" r="11" fill="#1e293b" />
                    <text
                      x="20"
                      y="28"
                      fill={vlanColor}
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {dev.type === 'server' ? 'SRV' : dev.type === 'medical-device' ? 'ICU' : 'PC'}
                    </text>
                    {/* Name */}
                    <text
                      x="46"
                      y="22"
                      fill="#f1f5f9"
                      fontSize="8.5"
                      fontFamily="var(--font-mono)"
                      fontWeight="bold"
                    >
                      {dev.name.length > 9 ? dev.name.slice(0, 9) : dev.name}
                    </text>
                    {/* IP */}
                    <text
                      x="46"
                      y="34"
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="var(--font-mono)"
                    >
                      .{dev.ip.split('.')[3]}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Floating Real-time Packet Diagnostic Card (Bottom Center) */}
        {simulationResult && (
          <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md z-30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {simulationResult.permitted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                    Packet Flow: {devices.find(d => d.id === simSourceId)?.name} → {devices.find(d => d.id === simDestId)?.name}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">({simProtocol})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    simulationResult.permitted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {simulationResult.permitted ? 'DELIVERED (PERMITTED)' : 'BLOCKED BY ACL'}
                </span>
                <button
                  onClick={() => setSimulationResult(null)}
                  className="text-slate-400 hover:text-white text-xs ml-2"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Stepper details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Source Subnet</div>
                <div className="font-mono text-cyan-300 font-semibold truncate">
                  {devices.find(d => d.id === simSourceId)?.ip} (VLAN {simulationResult.sourceVlanId})
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Destination Subnet</div>
                <div className="font-mono text-pink-300 font-semibold truncate">
                  {devices.find(d => d.id === simDestId)?.ip} (VLAN {simulationResult.destVlanId})
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Inter-VLAN Route</div>
                <div className="font-mono text-emerald-300 font-semibold truncate">
                  {simulationResult.isSameVlan ? 'Intra-VLAN Switched' : 'ROAS G0/0 Subinterfaces'}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Security Verdict</div>
                <div className={`font-mono font-semibold truncate ${simulationResult.permitted ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulationResult.permitted ? 'Policy Compliant' : 'Guest Isolation Drop'}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 font-mono text-left bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-500">Router Decision: </span>
              {simulationResult.summary}
            </p>
          </div>
        )}
      </div>

      {/* Device Inspector Drawer (When Node Clicked) */}
      {selectedDevice && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                {renderDeviceIcon(selectedDevice)}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-mono">
                  {selectedDevice.name}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedDevice.description}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Port: {selectedDevice.switchPort}
              </span>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">IP Address</div>
              <div className="font-mono text-cyan-300 font-bold text-sm mt-0.5">{selectedDevice.ip}</div>
              <div className="text-[10px] text-slate-400 mt-1">Assignment: {selectedDevice.ipAssignment}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Hardware MAC Address</div>
              <div className="font-mono text-slate-200 font-bold text-sm mt-0.5">{selectedDevice.mac}</div>
              <div className="text-[10px] text-slate-400 mt-1">Status: {selectedDevice.status.toUpperCase()}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">VLAN & Gateway</div>
              <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">VLAN {selectedDevice.vlanId}</div>
              <div className="text-[10px] text-slate-400 mt-1">GW: {selectedDevice.gateway}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Interface Telemetry</div>
              <div className="font-mono text-indigo-300 font-bold text-sm mt-0.5">
                {(selectedDevice.txBytes / 1024).toFixed(1)} KB Tx
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {(selectedDevice.rxBytes / 1024).toFixed(1)} KB Rx
              </div>
            </div>
          </div>

          {/* Device Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            {selectedDevice.type !== 'router' && selectedDevice.type !== 'switch' && (
              <>
                <button
                  onClick={() => requestDhcp(selectedDevice.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Renew DHCP Lease
                </button>
                <button
                  onClick={() => {
                    const server = devices.find(d => d.ip === '192.168.60.10');
                    if (server) runTest('PING', selectedDevice.id, server.ip);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Quick Ping → Hospital Server (192.168.60.10)
                </button>
                <button
                  onClick={() => {
                    startPacketSimulation(selectedDevice.id, 'srv-hospital');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Simulate Path to Server
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
