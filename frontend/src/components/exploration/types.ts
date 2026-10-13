export type ExplorationDirection = 'minimal' | 'saas' | 'premium';

export type QueueStatus = 'Waiting' | 'With Doctor' | 'Completed' | 'Cancelled';

export interface QueueItem {
  id: string;
  queueNumber: string;
  patientName: string;
  patientNameAr: string;
  patientRef: string;
  appointmentTime: string;
  arrivalTime: string;
  waitingMinutes: number;
  status: QueueStatus;
  doctorName: string;
  doctorNameAr: string;
  roomNumber: string;
  chiefComplaint: string;
  priority: 'normal' | 'priority' | 'urgent';
}

export interface QueueMetricsData {
  waitingPatients: number;
  withDoctor: number;
  completedToday: number;
  averageWaitMinutes: number;
}