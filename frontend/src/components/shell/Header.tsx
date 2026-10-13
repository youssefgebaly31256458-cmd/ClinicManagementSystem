import React from 'react';
import { useShell } from '../../context/ShellContext';
import { MenuIcon, SearchIcon, LockIcon } from '../common/Icons';

export const Header: React.FC = () => {
  const {
    activeRole,
    currentUser,
    myProfile,
    setIsMobileDrawerOpen,
    setIsCommandPaletteOpen,
    setIsProfileOpen,
    viewport,
    userAvatar,
  } = useShell();

  const isMobile = viewport === 'mobile';
  const isDoctor = activeRole === 'Doctor';

  // Display name and role from real authenticated user or fallback profile
  const displayName = myProfile?.name || currentUser?.name || 'Staff Member';
  const displayRole = myProfile?.roleName || currentUser?.roleName || activeRole;

  // Derive 2-letter initials from display name
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CU';

  return (
    <header className="workstation-header">
      <div className="header-left">
        {/* Mobile Hamburger Drawer Toggle */}
        {isMobile && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon size={20} />
          </button>
        )}

        {/* Contextual Doctor Scope Indicator strictly for Doctor role */}
        {isDoctor && (
          <div className="doctor-scope-indicator" title="Clinical scope isolated to assigned patients">
            <LockIcon size={13} />
            <span>Assigned Patients Only</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Command Search Trigger */}
        <button
          type="button"
          className="search-trigger-btn"
          onClick={() => setIsCommandPaletteOpen(true)}
          aria-label="Open command search"
        >
          <SearchIcon size={14} />
          <span>{isMobile ? 'Search...' : 'Search workstation...'}</span>
          {!isMobile && <kbd className="search-kbd">Ctrl K</kbd>}
        </button>

        {/* User Profile Area Trigger */}
        <button
          type="button"
          className="user-profile-trigger"
          onClick={() => setIsProfileOpen(true)}
          aria-label="Open user profile and settings"
          title="User Profile & Settings"
        >
          <div className="user-avatar-badge" aria-hidden="true">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="user-avatar-img" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          {!isMobile && (
            <div className="user-trigger-info">
              <span className="user-trigger-name">{displayName}</span>
              <span className="user-trigger-role">{displayRole}</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
