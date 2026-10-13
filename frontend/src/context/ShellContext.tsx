import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { NavRoute, UserRole, ViewportSize } from '../types/shell';
import { authApi, usersApi } from '../api';
import { LoginDTO, LoginResponseDTO, MyProfileDTO } from '../api/types';

// ============================================================================
// Complete 11-Route Master Architecture
// Role-partitioned: Admin, Doctor, Receptionist
// ============================================================================
export const CLINIC_ROUTES: NavRoute[] = [
  // Front Desk Operations
  {
    id: 'daily-queue',
    label: 'Daily Patient Queue',
    category: 'Front Desk',
    icon: 'queue',
    roleScope: ['Receptionist', 'Admin', 'Doctor'],
    description: "Today's scheduled appointments and consultation status",
    phase: 2,
  },
  {
    id: 'intake-patients',
    label: 'Patients (Intake)',
    category: 'Front Desk',
    icon: 'users',
    roleScope: ['Receptionist', 'Admin'],
    description: 'Patient directory and registration ledger',
    phase: 2,
  },
  {
    id: 'appointment-scheduler',
    label: 'Appointment Scheduler',
    category: 'Front Desk',
    icon: 'calendar',
    roleScope: ['Receptionist', 'Admin'],
    description: 'Book, reschedule, or cancel outpatient consultations',
    phase: 2,
  },
  {
    id: 'doctor-schedules',
    label: 'Doctor Availability',
    category: 'Front Desk',
    icon: 'activity',
    roleScope: ['Receptionist', 'Admin'],
    description: 'Active physicians and clinic consultation specializations',
    phase: 2,
  },

  // Clinical Care (Doctor)
  {
    id: 'doctor-consultations',
    label: 'My Consultation Queue',
    category: 'Clinical Care',
    icon: 'stethoscope',
    roleScope: ['Doctor'],
    description: 'Assigned doctor consultations and clinical examination ledger',
    phase: 2,
  },
  {
    id: 'patient-records',
    label: 'Patient Medical History',
    category: 'Clinical Care',
    icon: 'file-text',
    roleScope: ['Doctor', 'Admin'],
    description: 'Review patient demographic records and documented encounters',
    phase: 2,
  },
  {
    id: 'prescriptions',
    label: 'Digital Prescriptions',
    category: 'Clinical Care',
    icon: 'lock',
    roleScope: ['Doctor', 'Admin', 'Receptionist'],
    description: 'Issue and review digital medication prescriptions',
    phase: 2,
  },

  // Clinic Administration
  {
    id: 'staff-directory',
    label: 'Staff & Employees',
    category: 'Administration',
    icon: 'briefcase',
    roleScope: ['Admin'],
    description: 'Manage clinic healthcare personnel and employment records',
    phase: 2,
  },
  {
    id: 'doctor-management',
    label: 'Doctors & Specializations',
    category: 'Administration',
    icon: 'stethoscope',
    roleScope: ['Admin'],
    description: 'Assign physicians to clinical department specializations',
    phase: 2,
  },
  {
    id: 'roles-access',
    label: 'Roles & Access Control',
    category: 'Administration',
    icon: 'shield',
    roleScope: ['Admin'],
    description: 'Manage user credentials and role-based permissions',
    phase: 2,
  },
  {
    id: 'audit-logs',
    label: 'System Audit Logs',
    category: 'Administration',
    icon: 'activity',
    roleScope: ['Admin'],
    description: 'Review system access and operational encounter audit records',
    phase: 2,
  },
];

interface ShellContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeRouteId: string;
  setActiveRouteId: (routeId: string) => void;
  activeRoute: NavRoute;
  visibleRoutes: NavRoute[];
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewport: ViewportSize;
  currentTime: string;
  isAuthenticated: boolean;
  currentUser: LoginResponseDTO | null;
  myProfile: MyProfileDTO | null;
  login: (dto: LoginDTO) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load session from storage if present
  const storedToken = localStorage.getItem('shfaa_token');
  const storedUserJson = localStorage.getItem('shfaa_user');
  let initialUser: LoginResponseDTO | null = null;
  if (storedToken && storedUserJson) {
    try {
      initialUser = JSON.parse(storedUserJson);
    } catch {
      localStorage.removeItem('shfaa_token');
      localStorage.removeItem('shfaa_user');
    }
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!storedToken && !!initialUser);
  const [currentUser, setCurrentUser] = useState<LoginResponseDTO | null>(initialUser);
  const [activeRole, setActiveRoleState] = useState<UserRole>(
    (initialUser?.roleName as UserRole) || 'Receptionist'
  );
  const [activeRouteId, setActiveRouteId] = useState<string>('daily-queue');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [myProfile, setMyProfile] = useState<MyProfileDTO | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Viewport breakpoint detection
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewport('mobile');
      } else if (width < 1024) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Handle unauthorized global event (e.g. 401 response from API)
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('shfaa_token');
      localStorage.removeItem('shfaa_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setMyProfile(null);
    };

    window.addEventListener('shfaa:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('shfaa:unauthorized', handleUnauthorized);
  }, []);

  // Load user profile when authenticated
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const profile = await usersApi.getMyProfile();
      setMyProfile(profile);
      if (profile.photoUrl) {
        setUserAvatar(profile.photoUrl);
      }
    } catch {
      // Profile fetch failed (e.g. unauthenticated or network error)
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated, refreshProfile]);

  // Available routes filtered by active persona
  const visibleRoutes = useMemo(() => {
    return CLINIC_ROUTES.filter(route => route.roleScope.includes(activeRole));
  }, [activeRole]);

  // Current active route object
  const activeRoute = useMemo(() => {
    return CLINIC_ROUTES.find(r => r.id === activeRouteId) || visibleRoutes[0] || CLINIC_ROUTES[0];
  }, [activeRouteId, visibleRoutes]);

  // Handle role change safely without leaving an inaccessible active route
  const setActiveRole = useCallback((newRole: UserRole) => {
    setActiveRoleState(newRole);
    const accessible = CLINIC_ROUTES.filter(r => r.roleScope.includes(newRole));
    if (!accessible.some(r => r.id === activeRouteId)) {
      setActiveRouteId(accessible[0]?.id || 'daily-queue');
    }
  }, [activeRouteId]);

  // Keyboard shortcut listener for Ctrl+K, Cmd+K, and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsMobileDrawerOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer when route changes or viewport switches to desktop
  const handleSelectRoute = useCallback((routeId: string) => {
    setActiveRouteId(routeId);
    setIsMobileDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (viewport !== 'mobile') {
      setIsMobileDrawerOpen(false);
    }
  }, [viewport]);

  // Real API Login
  const login = useCallback(async (dto: LoginDTO) => {
    const res = await authApi.login(dto);
    localStorage.setItem('shfaa_token', res.token);
    localStorage.setItem('shfaa_user', JSON.stringify(res));
    setCurrentUser(res);
    setIsAuthenticated(true);
    // Role matching
    const role = (res.roleName.trim() as UserRole) || 'Receptionist';
    setActiveRoleState(role);
    setActiveRouteId('daily-queue');
  }, []);

  // Real API Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout({ refreshToken: '' });
    } catch {
      // Offline / network failure during logout is safely tolerated
    }
    localStorage.removeItem('shfaa_token');
    localStorage.removeItem('shfaa_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMyProfile(null);
    setIsProfileOpen(false);
  }, []);

  const value = useMemo(() => ({
    activeRole,
    setActiveRole,
    activeRouteId,
    setActiveRouteId: handleSelectRoute,
    activeRoute,
    visibleRoutes,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    viewport,
    currentTime,
    isAuthenticated,
    currentUser,
    myProfile,
    login,
    logout,
    refreshProfile,
    isProfileOpen,
    setIsProfileOpen,
    userAvatar,
    setUserAvatar,
  }), [
    activeRole,
    setActiveRole,
    activeRouteId,
    handleSelectRoute,
    activeRoute,
    visibleRoutes,
    isSidebarCollapsed,
    isMobileDrawerOpen,
    isCommandPaletteOpen,
    viewport,
    currentTime,
    isAuthenticated,
    currentUser,
    myProfile,
    login,
    logout,
    refreshProfile,
    isProfileOpen,
    userAvatar,
  ]);

  return (
    <ShellContext.Provider value={value}>
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
