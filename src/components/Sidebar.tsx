import React from 'react';
import {
  LayoutDashboard,
  Network,
  Layers,
  Binary,
  Radio,
  GitFork,
  Server,
  ShieldCheck,
  Activity,
  Terminal,
  FileText,
  BookOpen,
  PlayCircle,
  HelpCircle,
  X
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'topology'
  | 'vlans'
  | 'ipam'
  | 'dhcp'
  | 'routing'
  | 'servers'
  | 'security'
  | 'traffic'
  | 'testing'
  | 'cisco-cli'
  | 'logs'
  | 'docs';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenDemo: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenDemo,
  isOpen,
  onClose
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'topology', label: 'Network Topology', icon: Network, tag: 'Interactive' },
    { id: 'vlans', label: 'VLAN Management', icon: Layers, tag: '6 VLANs' },
    { id: 'ipam', label: 'IP Address Management', icon: Binary },
    { id: 'dhcp', label: 'DHCP Management', icon: Radio, tag: '5 Pools' },
    { id: 'routing', label: 'Routing Management', icon: GitFork, tag: 'ROAS' },
    { id: 'servers', label: 'Server Infrastructure', icon: Server, tag: 'VLAN 60' },
    { id: 'security', label: 'Security & ACL', icon: ShieldCheck, tag: 'Isolation' },
    { id: 'traffic', label: 'Network Traffic Monitor', icon: Activity, tag: 'Live' },
    { id: 'testing', label: 'Connectivity Testing', icon: HelpCircle, tag: 'Ping/Trace' },
    { id: 'cisco-cli', label: 'Cisco CLI Simulator', icon: Terminal, tag: 'IOS Exec' },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'docs', label: 'Documentation', icon: BookOpen }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Mobile Close */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">Smart Hospital Net</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guided Demo Banner */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={() => {
              onOpenDemo();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-slate-800/80 border border-cyan-500/30 text-white text-xs font-semibold hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              <span>Project Demo Mode</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              9 Steps
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-[10px] font-mono text-slate-600 w-4 text-left">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Topology Model:</span>
            <span className="font-mono text-slate-400 text-[10px]">Cisco 2911 + 2960</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Inter-VLAN Mode:</span>
            <span className="font-mono text-cyan-400 text-[10px]">ROAS (802.1Q)</span>
          </div>
        </div>
      </aside>
    </>
  );
};
