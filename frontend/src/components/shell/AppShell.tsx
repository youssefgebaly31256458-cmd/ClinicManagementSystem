import React from 'react';
import { useShell } from '../../context/ShellContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WorkspaceCanvas } from './WorkspaceCanvas';
import { CommandPalette } from './CommandPalette';
import { LoginPage } from '../auth/LoginPage';
import { UserProfileModal } from '../profile/UserProfileModal';
import '../../styles/shell.css';

export const AppShell: React.FC = () => {
  const { isAuthenticated, isSidebarCollapsed } = useShell();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar / Mobile Off-Canvas Drawer */}
      <Sidebar />

      {/* Main Workstation Column */}
      <div className={`main-column ${isSidebarCollapsed ? 'main-column--collapsed' : ''}`}>
        <Header />
        <WorkspaceCanvas />
      </div>

      {/* Global Spotlight Search */}
      <CommandPalette />

      {/* User Profile & Password Modal */}
      <UserProfileModal />
    </div>
  );
};
