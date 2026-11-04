import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlayCircle,
  RotateCcw,
  Bell,
  Menu,
  Activity,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';

interface NavbarProps {
  onOpenDemo: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const { aclConfig, vlans, devices, systemLogs, resetToDefault } = useNetwork();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const recentSecurityAlerts = systemLogs.filter(
    l => l.severity === 'CRITICAL' || l.severity === 'WARNING'
  ).slice(0, 5);

  const activeDevices = devices.filter(d => d.status === 'online').length;

  return (
    <>
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm lg:text-base tracking-tight text-white font-sans">
                  SECURE SMART HOSPITAL NETWORK
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  CISCO ROAS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-md">
                Intelligent Network Management & Security Simulation Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status & Health */}
        <div className="hidden xl:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${aclConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-400">Security Engine:</span>
            <span className={`font-semibold font-mono ${aclConfig.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {aclConfig.enabled ? 'GUEST_ISOLATION ACTIVE' : 'ACL BYPASSED'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{vlans.length} VLANs</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeDevices} Devices</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-pink-400" />
              <span>3 Core Servers</span>
            </span>
          </div>
        </div>

        {/* Right: Actions, Clock, Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          {/* Project Demonstration Mode button */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition cursor-pointer"
            title="Start University Project Guided Demonstration"
          >
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Project Demo</span>
          </button>

          {/* Reset Network State */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-xs transition cursor-pointer"
            title="Reset Network to Default Hospital Configuration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Notifications / Security Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Security Alerts & Logs"
            >
              <Bell className="w-4 h-4" />
              {recentSecurityAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-xs text-white">Recent Security & Network Events</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                  {recentSecurityAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No security alerts recorded. All systems operating normally.
                    </div>
                  ) : (
                    recentSecurityAlerts.map(alert => (
                      <div key={alert.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold font-mono text-[10px] uppercase ${
                              alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                            }`}
                          >
                            {alert.category} · {alert.severity}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">{alert.timestamp.slice(11)}</span>
                        </div>
                        <p className="text-slate-300 mt-1 line-clamp-2">{alert.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile placeholder */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-cyan-400">
              NA
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-medium text-slate-200 leading-tight">NetAdmin</div>
              <div className="text-[10px] text-slate-500 leading-tight">SecOps Level 3</div>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base text-white">Reset to Default Hospital Network?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore the original Cisco 2911 router, Catalyst 2960 switch, 6 departmental VLANs,
              default DHCP pools, hospital server configurations, and GUEST_ISOLATION Extended ACL rules.
              All custom modifications will be cleared.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
