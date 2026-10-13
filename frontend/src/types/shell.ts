export type UserRole = 'Receptionist' | 'Doctor' | 'Admin';

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export interface NavRoute {
  id: string;
  label: string;
  category: string;
  icon: string;
  roleScope: UserRole[];
  badgeCount?: number;
  description: string;
  phase: number;
}

export interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Quick Actions' | 'Role Simulator';
  shortcut?: string;
  icon: string;
  action: () => void;
  role?: UserRole;
}
