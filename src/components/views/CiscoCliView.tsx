import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Layers,
  GitFork,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { executeCiscoCommand } from '../../simulation/networkEngine';

interface HistoryEntry {
  command: string;
  output: string;
  timestamp: string;
}

export const CiscoCliView: React.FC = () => {
  const {
    vlans,
    devices,
    dhcpPools,
    dhcpLeases,
    subinterfaces,
    routingTable,
    aclConfig
  } = useNetwork();

  const [inputCmd, setInputCmd] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: 'show vlan brief',
      output: executeCiscoCommand('show vlan brief', {
        vlans,
        devices,
        dhcpPools,
        dhcpLeases,
        subinterfaces,
        routes: routingTable,
        acl: aclConfig
      }),
      timestamp: '07:00:00'
    }
  ]);

  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandList, setCommandList] = useState<string[]>(['show vlan brief']);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = (cmdToRun: string = inputCmd) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setHistory([]);
      setInputCmd('');
      return;
    }

    const output = executeCiscoCommand(trimmed, {
      vlans,
      devices,
      dhcpPools,
      dhcpLeases,
      subinterfaces,
      routes: routingTable,
      acl: aclConfig
    });

    setHistory(prev => [
      ...prev,
      {
        command: trimmed,
        output,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setCommandList(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputCmd('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputCmd(commandList[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandList.length) {
        setHistoryIndex(-1);
        setInputCmd('');
      } else {
        setHistoryIndex(nextIdx);
        setInputCmd(commandList[nextIdx]);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const REFERENCE_CHEATSHEET = [
    {
      id: 'ref-vlan',
      title: '1. VLAN Creation & Switchport Access Assignment',
      icon: Layers,
      commands: `HOSPITAL-SW1# configure terminal
HOSPITAL-SW1(config)# vlan 10
HOSPITAL-SW1(config-vlan)# name ADMINISTRATION
HOSPITAL-SW1(config)# interface range fa0/1 - 2
HOSPITAL-SW1(config-if-range)# switchport mode access
HOSPITAL-SW1(config-if-range)# switchport access vlan 10
HOSPITAL-SW1(config-if-range)# exit`
    },
    {
      id: 'ref-trunk',
      title: '2. 802.1Q Dot1q Trunk Configuration',
      icon: GitFork,
      commands: `HOSPITAL-SW1(config)# interface gigabitethernet 0/1
HOSPITAL-SW1(config-if)# switchport trunk encapsulation dot1q
HOSPITAL-SW1(config-if)# switchport mode trunk
HOSPITAL-SW1(config-if)# switchport trunk allowed vlan 10,20,30,40,50,60
HOSPITAL-SW1(config-if)# exit`
    },
    {
      id: 'ref-roas',
      title: '3. Router-on-a-Stick (ROAS) Subinterfaces',
      icon: GitFork,
      commands: `HOSPITAL-R1(config)# interface gigabitethernet 0/0.10
HOSPITAL-R1(config-subif)# encapsulation dot1Q 10
HOSPITAL-R1(config-subif)# ip address 192.168.10.1 255.255.255.0
HOSPITAL-R1(config-subif)# exit
HOSPITAL-R1(config)# interface gigabitethernet 0/0.50
HOSPITAL-R1(config-subif)# encapsulation dot1Q 50
HOSPITAL-R1(config-subif)# ip address 192.168.50.1 255.255.255.0
HOSPITAL-R1(config-subif)# ip access-group GUEST_ISOLATION in`
    },
    {
      id: 'ref-dhcp',
      title: '4. Dynamic DHCP Pools & Exclusions',
      icon: Radio,
      commands: `HOSPITAL-R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.5
HOSPITAL-R1(config)# ip dhcp pool ADMIN
HOSPITAL-R1(dhcp-config)# network 192.168.10.0 255.255.255.0
HOSPITAL-R1(dhcp-config)# default-router 192.168.10.1
HOSPITAL-R1(dhcp-config)# dns-server 192.168.60.11
HOSPITAL-R1(dhcp-config)# lease 1 0 0`
    },
    {
      id: 'ref-acl',
      title: '5. Extended ACL Security Policy (GUEST_ISOLATION)',
      icon: ShieldCheck,
      commands: `HOSPITAL-R1(config)# ip access-list extended GUEST_ISOLATION
HOSPITAL-R1(config-ext-nacl)# 10 deny ip 192.168.50.0 0.0.0.255 192.168.10.0 0.0.0.255
HOSPITAL-R1(config-ext-nacl)# 20 deny ip 192.168.50.0 0.0.0.255 192.168.20.0 0.0.0.255
HOSPITAL-R1(config-ext-nacl)# 30 deny ip 192.168.50.0 0.0.0.255 192.168.30.0 0.0.0.255
HOSPITAL-R1(config-ext-nacl)# 40 deny ip 192.168.50.0 0.0.0.255 192.168.40.0 0.0.0.255
HOSPITAL-R1(config-ext-nacl)# 50 deny ip 192.168.50.0 0.0.0.255 192.168.60.0 0.0.0.255
HOSPITAL-R1(config-ext-nacl)# 60 permit ip 192.168.50.0 0.0.0.255 any
HOSPITAL-R1(config-ext-nacl)# 70 permit ip any any`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cisco IOS Command-Line Interface (CLI) Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Execute authentic Cisco IOS verification commands against the active network simulation state.
            Inspect live CAM switchports, 802.1Q dot1q trunks, RIB routing tables, dynamic DHCP bindings, and ACL hit counters.
          </p>
        </div>

        <button
          onClick={() => handleExecute('clear')}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
        >
          Clear Screen
        </button>
      </div>

      {/* Quick Verification Command Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-mono mr-1">Quick Exec:</span>
        {[
          'show vlan brief',
          'show interfaces trunk',
          'show ip interface brief',
          'show ip route',
          'show ip dhcp binding',
          'show access-lists',
          'show running-config',
          'ping 192.168.60.10'
        ].map(cmd => (
          <button
            key={cmd}
            onClick={() => handleExecute(cmd)}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-xs font-mono transition cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Main Terminal Window */}
      <div className="rounded-2xl bg-black border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[520px]">
        {/* Terminal Title Bar */}
        <div className="h-9 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] text-slate-400 font-semibold ml-2">
              HOSPITAL-R1# Console (Cisco IOS Software, C2900 Software, Version 15.1)
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">Line vty 0 4 (SSH/Telnet)</span>
        </div>

        {/* Scrollable Terminal Output Screen */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-slate-200">
          <div className="text-slate-500 text-[11px] leading-relaxed pb-2 border-b border-slate-900">
            Cisco IOS Software, 2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4, RELEASE SOFTWARE (fc2)<br />
            Technical Support: http://www.cisco.com/techsupport<br />
            Copyright (c) 1986-2026 by Cisco Systems, Inc. Simulated Node Active.
          </div>

          {history.map((entry, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span>HOSPITAL-R1#</span>
                <span className="text-white">{entry.command}</span>
                <span className="text-slate-600 text-[10px] font-normal ml-auto">{entry.timestamp}</span>
              </div>
              <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed pl-2 bg-slate-950/40 p-2 rounded border border-slate-900">
                {entry.output}
              </pre>
            </div>
          ))}

          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Prompt Command Line Input */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <span className="text-cyan-400 font-bold font-mono">HOSPITAL-R1#</span>
          <input
            ref={inputRef}
            type="text"
            value={inputCmd}
            onChange={e => setInputCmd(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type Cisco command (e.g. show vlan brief, show ip route, show access-lists)..."
            className="flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none placeholder-slate-600"
          />
          <button
            onClick={() => handleExecute()}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition cursor-pointer"
          >
            EXEC
          </button>
        </div>
      </div>

      {/* Cisco IOS Reference Command Panel */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
              Cisco IOS Academic Configuration Cheatsheet
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Standard Packet Tracer Commands</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Reference configuration snippets for replicating the hospital project in physical Cisco lab hardware
          or Cisco Packet Tracer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REFERENCE_CHEATSHEET.map(ref => {
            const Icon = ref.icon;
            const isCopied = copiedSnippet === ref.id;
            return (
              <div
                key={ref.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs font-sans">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{ref.title}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(ref.commands, ref.id)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Copy Cisco CLI commands"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-black/70 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                  {ref.commands}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
