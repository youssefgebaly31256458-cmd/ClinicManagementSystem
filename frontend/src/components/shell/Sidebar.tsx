import React from 'react';
import { useShell } from '../../context/ShellContext';
import shfaaLogo from '../../../Logo/shifaa-شفاء.jfif';
import {
  UsersIcon,
  QueueIcon,
  CalendarIcon,
  StethoscopeIcon,
  FileTextIcon,
  ShieldIcon,
  BriefcaseIcon,
  ActivityIcon,
  LockIcon,
  CloseIcon,
  CrosshairIcon,
} from '../common/Icons';

const renderIcon = (iconName: string, size = 18) => {
  switch (iconName) {
    case 'users': return <UsersIcon size={size} />;
    case 'queue': return <QueueIcon size={size} />;
    case 'calendar': return <CalendarIcon size={size} />;
    case 'stethoscope': return <StethoscopeIcon size={size} />;
    case 'file-text': return <FileTextIcon size={size} />;
    case 'shield': return <ShieldIcon size={size} />;
    case 'briefcase': return <BriefcaseIcon size={size} />;
    case 'activity': return <ActivityIcon size={size} />;
    case 'lock': return <LockIcon size={size} />;
    default: return <CrosshairIcon size={size} />;
  }
};

export const Sidebar: React.FC = () => {
  const {
    activeRouteId,
    setActiveRouteId,
    visibleRoutes,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    viewport,
  } = useShell();

  const isMobile = viewport === 'mobile';

  // Group routes by category for clean visual hierarchy
  const groupedRoutes = React.useMemo(() => {
    const groups: { [key: string]: typeof visibleRoutes } = {};
    visibleRoutes.forEach(route => {
      if (!groups[route.category]) {
        groups[route.category] = [];
      }
      groups[route.category].push(route);
    });
    return groups;
  }, [visibleRoutes]);

  const navContent = (
    <div className="sidebar-inner">
      {/* Brand Header with Real Shfaa Logo as Sidebar Toggle */}
      <div className="sidebar-brand">
        <button
          type="button"
          className="sidebar-logo-toggle-btn"
          onClick={() => {
            if (!isMobile) {
              setIsSidebarCollapsed(prev => !prev);
            }
          }}
          aria-label={
            isMobile
              ? 'Shfaa Clinical Workstation'
              : isSidebarCollapsed
              ? 'Expand sidebar navigation'
              : 'Collapse sidebar navigation'
          }
          title={
            isMobile
              ? 'Shfaa Clinical Workstation'
              : isSidebarCollapsed
              ? 'Click logo to expand sidebar'
              : 'Click logo to collapse sidebar'
          }
        >
          <div className="brand-logo-wrap">
            <img
              src={shfaaLogo}
              alt="Shfaa / شفاء"
              className="brand-logo-img"
            />
          </div>
          {(!isSidebarCollapsed || isMobile) && (
            <div className="brand-text">
              <span className="brand-title">
                <span>Shfaa</span>
                <span className="brand-title-ar">/ شفاء</span>
              </span>
              <span className="brand-subtitle">Clinical Workstation</span>
            </div>
          )}
        </button>

        {isMobile && (
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon size={20} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav" aria-label="Main Navigation">
        {Object.entries(groupedRoutes).map(([category, routes]) => (
          <div key={category} className="nav-group">
            {(!isSidebarCollapsed || isMobile) && (
              <div className="nav-group-header">
                <span>{category}</span>
              </div>
            )}
            <ul className="nav-list">
              {routes.map(route => {
                const isActive = route.id === activeRouteId;
                return (
                  <li key={route.id}>
                    <button
                      type="button"
                      className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                      onClick={() => setActiveRouteId(route.id)}
                      title={isSidebarCollapsed && !isMobile ? route.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-item-icon" aria-hidden="true">
                        {renderIcon(route.icon, 18)}
                      </span>
                      {(!isSidebarCollapsed || isMobile) && (
                        <span className="nav-item-label">{route.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  // Mobile Off-Canvas Drawer with Backdrop
  if (isMobile) {
    return (
      <>
        {isMobileDrawerOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`mobile-drawer ${isMobileDrawerOpen ? 'mobile-drawer--open' : ''}`}
          aria-label="Mobile Navigation"
          role="dialog"
          aria-modal="true"
        >
          {navContent}
        </aside>
      </>
    );
  }

  // Desktop / Tablet Fixed Rail
  return (
    <aside
      className={`sidebar-desktop ${isSidebarCollapsed ? 'sidebar-desktop--collapsed' : ''}`}
      aria-label="Desktop Navigation"
    >
      {navContent}
    </aside>
  );
};