/**
 * API Contract Definitions for Shfaa (شفاء)
 * Directly matching ASP.NET Core Backend DTOs
 */

// ==========================================
// Authentication DTOs
// ==========================================

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  userId: number;
  employeeId: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  token: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

// ==========================================
// User & Profile DTOs
// ==========================================

export interface UserDTO {
  userId: number;
  employeeId: number;
  employeeName: string;
  roleId: number;
  roleName: string;
  username: string;
  isActive: boolean;
}

export interface AddUserDTO {
  employeeId: number;
  roleId: number;
  username: string;
  password: string;
  isActive: boolean;
}

export interface UpdateUserDTO {
  employeeId: number;
  roleId: number;
  username: string;
  isActive: boolean;
}

export interface MyProfileDTO {
  employeeId: number;
  username: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  roleName: string;
  hireDate: string;
  isActive: boolean;
  photoUrl?: string | null;
}

export interface UpdateMyProfileDTO {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  photoUrl?: string | null;
}

// ==========================================
// Role DTOs
// ==========================================

export interface RoleDTO {
  roleId: number;
  roleName: string;
}

export interface AddRoleDTO {
  roleName: string;
}

export interface UpdateRoleDTO {
  roleName: string;
}

// ==========================================
// Employee DTOs
// ==========================================

export interface EmployeeDTO {
  employeeId: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  hireDate: string;
  isActive: boolean;
}

export interface AddEmployeeDTO {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  hireDate: string;
  isActive: boolean;
}

export interface UpdateEmployeeDTO {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  hireDate: string;
  isActive: boolean;
}

// ==========================================
// Specialization DTOs
// ==========================================

export interface SpecializationDTO {
  specializationID: number;
  name: string;
  description?: string | null;
}

export interface AddSpecializationDTO {
  name: string;
  description?: string | null;
}

export interface UpdateSpecializationDTO {
  name: string;
  description?: string | null;
}

// ==========================================
// Doctor DTOs
// ==========================================

export interface DoctorDTO {
  doctorId: number;
  employeeId: number;
  employeeName: string;
  specializationId: number;
  specializationName: string;
}

export interface AddDoctorDTO {
  employeeId: number;
  specializationId: number;
}

export interface UpdateDoctorDTO {
  employeeId: number;
  specializationId: number;
}

// ==========================================
// Patient DTOs
// ==========================================

export interface PatientDTO {
  patientId: number;
  name: string;
  gender: string;
  phone: string;
  dateOfBirth: string; // DateOnly serialized as 'YYYY-MM-DD'
  address: string;
  isActive: boolean;
}

export interface AddPatientDTO {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface UpdatePatientDTO {
  name: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  isActive: boolean;
}

// ==========================================
// Appointment DTOs & Enums
// ==========================================

export enum AppointmentStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface AppointmentDTO {
  appointmentId: number;
  date: string; // DateTime ISO string
  notes?: string | null;
  status: AppointmentStatus;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorEmployeeId: number;
}

export interface AddAppointmentDTO {
  date: string;
  notes?: string | null;
  patientId: number;
  doctorId: number;
}

export interface UpdateAppointmentDTO {
  date: string;
  notes?: string | null;
  status: AppointmentStatus;
  patientId: number;
  doctorId: number;
}

export interface ChangeAppointmentStatusDTO {
  status: AppointmentStatus;
}

// ==========================================
// Visit DTOs
// ==========================================

export interface VisitDTO {
  visitId: number;
  visitDate: string;
  notes?: string | null;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  doctorEmployeeId: number;
}

export interface AddVisitDTO {
  visitDate: string;
  notes?: string | null;
  appointmentId: number;
}

export interface UpdateVisitDTO {
  visitDate: string;
  notes?: string | null;
  appointmentId: number;
}

// ==========================================
// Prescription DTOs
// ==========================================

export interface PrescriptionDTO {
  prescriptionId: number;
  visitId: number;
  visitDate?: string | null;
  patientName?: string | null;
  doctorName?: string | null;
  doctorEmployeeId?: number | null;
  notes?: string | null;
}

export interface AddPrescriptionDTO {
  visitId: number;
  notes?: string | null;
}

export interface UpdatePrescriptionDTO {
  visitId: number;
  notes?: string | null;
}
