import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useShell } from '../../context/ShellContext';
import { CommandItem } from '../../types/shell';
import { SearchIcon, UsersIcon, CalendarIcon, StethoscopeIcon, CloseIcon, ShieldIcon } from '../common/Icons';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveRouteId,
    setIsSidebarCollapsed,
    visibleRoutes,
    viewport,
  } = useShell();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = viewport === 'mobile';

  // Build command item list based on real routes, quick actions, and dev role switching
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. Navigation targets
    visibleRoutes.forEach(route => {
      list.push({
        id: `nav-${route.id}`,
        title: `Navigate: ${route.label}`,
        category: 'Navigation',
        icon: route.icon,
        action: () => {
          setActiveRouteId(route.id);
          setIsCommandPaletteOpen(false);
        },
      });
    });

    // 2. Quick Clinical Actions (navigates to architectural routes; no fake CRUD)
    list.push({
      id: 'action-new-patient',
      title: 'Action: New Patient Registration',
      category: 'Quick Actions',
      icon: 'users',
      action: () => {
        setActiveRouteId('intake-patients');
        setIsCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'action-book-appointment',
      title: 'Action: Book Appointment Slot',
      category: 'Quick Actions',
      icon: 'calendar',
      action: () => {
        setActiveRouteId('appointment-scheduler');
        setIsCommandPaletteOpen(false);
      },
    });

    list.push({
      id: 'action-toggle-sidebar',
      title: 'Action: Toggle Sidebar View',
      category: 'Quick Actions',
      icon: 'shield',
      action: () => {
        setIsSidebarCollapsed(prev => !prev);
        setIsCommandPaletteOpen(false);
      },
    });

    return list;
  }, [visibleRoutes, setActiveRouteId, setIsSidebarCollapsed, setIsCommandPaletteOpen]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const q = searchQuery.toLowerCase();
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
    );
  }, [commands, searchQuery]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="command-overlay"
      onClick={() => setIsCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Search Palette"
    >
      <div
        className={`command-modal ${isMobile ? 'command-modal--mobile' : ''}`}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="command-input-wrap">
          <SearchIcon size={20} className="command-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Type a command, route, or action..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            aria-autocomplete="list"
          />
          <button
            type="button"
            className="command-close-btn"
            onClick={() => setIsCommandPaletteOpen(false)}
            aria-label="Close command palette"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="command-results" role="listbox">
          {filteredCommands.length === 0 ? (
            <div className="command-empty">
              <span>No matching commands or routes found</span>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`command-item ${isSelected ? 'command-item--selected' : ''}`}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="command-item-icon" aria-hidden="true">
                    {cmd.category === 'Role Simulator' ? (
                      cmd.role === 'Admin' ? <ShieldIcon size={16} /> : <StethoscopeIcon size={16} />
                    ) : cmd.category === 'Quick Actions' ? (
                      <CalendarIcon size={16} />
                    ) : (
                      <UsersIcon size={16} />
                    )}
                  </span>
                  <div className="command-item-details">
                    <span className="command-item-title">{cmd.title}</span>
                    <span className="command-item-category">{cmd.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="command-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> · Select with <kbd>Enter</kbd> · Dismiss with <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
