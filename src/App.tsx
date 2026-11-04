import React, { useState } from 'react';
import { NetworkProvider } from './context/NetworkContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TopologyView } from './components/views/TopologyView';
import { VlanManagementView } from './components/views/VlanManagementView';
import { IpamView } from './components/views/IpamView';
import { DhcpManagementView } from './components/views/DhcpManagementView';
import { RoutingView } from './components/views/RoutingView';
import { ServerInfrastructureView } from './components/views/ServerInfrastructureView';
import { SecurityAclView } from './components/views/SecurityAclView';
import { TrafficMonitorView } from './components/views/TrafficMonitorView';
import { ConnectivityTestingView } from './components/views/ConnectivityTestingView';
import { CiscoCliView } from './components/views/CiscoCliView';
import { SystemLogsView } from './components/views/SystemLogsView';
import { DocumentationView } from './components/views/DocumentationView';
import { DemoModeModal } from './components/DemoModeModal';

function MainApp() {
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        );
      case 'topology':
        return <TopologyView />;
      case 'vlans':
        return <VlanManagementView />;
      case 'ipam':
        return <IpamView />;
      case 'dhcp':
        return <DhcpManagementView />;
      case 'routing':
        return <RoutingView />;
      case 'servers':
        return <ServerInfrastructureView />;
      case 'security':
        return <SecurityAclView />;
      case 'traffic':
        return <TrafficMonitorView />;
      case 'testing':
        return <ConnectivityTestingView />;
      case 'cisco-cli':
        return <CiscoCliView />;
      case 'logs':
        return <SystemLogsView />;
      case 'docs':
        return <DocumentationView />;
      default:
        return (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top persistent Navbar */}
      <Navbar
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left persistent Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#020617]/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>

          {/* Quiet Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>Secure Smart Hospital Network · Academic Simulation Engine</span>
              <span>Cisco 2911 Router-on-a-Stick (ROAS) & Catalyst 2960 Dot1Q</span>
              <span>All internal services operating on simulated local state</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Project Demonstration Mode Walkthrough Modal */}
      <DemoModeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigateToView={(view) => {
          setCurrentView(view);
          setIsDemoModalOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <MainApp />
    </NetworkProvider>
  );
}
