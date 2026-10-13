import { apiClient } from './client';
import * as T from './types';

// ==========================================
// 1. Authentication Endpoints (/api/Authentication)
// ==========================================
export const authApi = {
  login: (dto: T.LoginDTO): Promise<T.LoginResponseDTO> =>
    apiClient<T.LoginResponseDTO>('/api/Authentication', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  changePassword: (dto: T.ChangePasswordDTO): Promise<void> =>
    apiClient<void>('/api/Authentication/change-password', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  refreshToken: (dto: T.RefreshTokenDTO): Promise<{ token: string; refreshToken: string }> =>
    apiClient<{ token: string; refreshToken: string }>('/api/Authentication/refresh-token', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  logout: (dto: T.RefreshTokenDTO): Promise<void> =>
    apiClient<void>('/api/Authentication/logout', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};

// ==========================================
// 2. Users Endpoints (/api/ClinicManagementSystem/Users)
// ==========================================
export const usersApi = {
  getAll: (): Promise<T.UserDTO[]> =>
    apiClient<T.UserDTO[]>('/api/ClinicManagementSystem/Users'),

  getById: (id: number): Promise<T.UserDTO> =>
    apiClient<T.UserDTO>(`/api/ClinicManagementSystem/Users/${id}`),

  create: (dto: T.AddUserDTO): Promise<T.UserDTO> =>
    apiClient<T.UserDTO>('/api/ClinicManagementSystem/Users', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateUserDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Users/${id}`, {
      method: 'DELETE',
    }),

  getMyProfile: (): Promise<T.MyProfileDTO> =>
    apiClient<T.MyProfileDTO>('/api/ClinicManagementSystem/Users/MyProfile'),

  updateMyProfile: (dto: T.UpdateMyProfileDTO): Promise<void> =>
    apiClient<void>('/api/ClinicManagementSystem/Users/MyProfile', {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  uploadProfilePhoto: (file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ photoUrl: string }>('/api/ClinicManagementSystem/Users/MyProfile/Photo', {
      method: 'POST',
      body: formData,
    });
  },
};

// ==========================================
// 3. Roles Endpoints (/api/ClinicManagementSystem/Roles)
// ==========================================
export const rolesApi = {
  getAll: (): Promise<T.RoleDTO[]> =>
    apiClient<T.RoleDTO[]>('/api/ClinicManagementSystem/Roles'),

  getById: (id: number): Promise<T.RoleDTO> =>
    apiClient<T.RoleDTO>(`/api/ClinicManagementSystem/Roles/${id}`),

  create: (dto: T.AddRoleDTO): Promise<T.RoleDTO> =>
    apiClient<T.RoleDTO>('/api/ClinicManagementSystem/Roles', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateRoleDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
};

// ==========================================
// 4. Employees Endpoints (/api/ClinicManagementSystem/Employees)
// ==========================================
export const employeesApi = {
  getAll: (): Promise<T.EmployeeDTO[]> =>
    apiClient<T.EmployeeDTO[]>('/api/ClinicManagementSystem/Employees'),

  getById: (id: number): Promise<T.EmployeeDTO> =>
    apiClient<T.EmployeeDTO>(`/api/ClinicManagementSystem/Employees/${id}`),

  create: (dto: T.AddEmployeeDTO): Promise<T.EmployeeDTO> =>
    apiClient<T.EmployeeDTO>('/api/ClinicManagementSystem/Employees', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateEmployeeDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Employees/${id}`, {
      method: 'DELETE',
    }),

  getAvailableForDoctor: (): Promise<T.EmployeeDTO[]> =>
    apiClient<T.EmployeeDTO[]>('/api/ClinicManagementSystem/Employees/AvailableForDoctor'),
};

// ==========================================
// 5. Specializations Endpoints (/api/ClinicManagementSystem/Specializations)
// ==========================================
export const specializationsApi = {
  getAll: (): Promise<T.SpecializationDTO[]> =>
    apiClient<T.SpecializationDTO[]>('/api/ClinicManagementSystem/Specializations'),

  getById: (id: number): Promise<T.SpecializationDTO> =>
    apiClient<T.SpecializationDTO>(`/api/ClinicManagementSystem/Specializations/${id}`),

  create: (dto: T.AddSpecializationDTO): Promise<T.SpecializationDTO> =>
    apiClient<T.SpecializationDTO>('/api/ClinicManagementSystem/Specializations', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateSpecializationDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Specializations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
};

// ==========================================
// 6. Doctors Endpoints (/api/ClinicManagementSystem/Doctors)
// ==========================================
export const doctorsApi = {
  getAll: (): Promise<T.DoctorDTO[]> =>
    apiClient<T.DoctorDTO[]>('/api/ClinicManagementSystem/Doctors'),

  getById: (id: number): Promise<T.DoctorDTO> =>
    apiClient<T.DoctorDTO>(`/api/ClinicManagementSystem/Doctors/${id}`),

  create: (dto: T.AddDoctorDTO): Promise<T.DoctorDTO> =>
    apiClient<T.DoctorDTO>('/api/ClinicManagementSystem/Doctors', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateDoctorDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Doctors/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// 7. Patients Endpoints (/api/ClinicManagementSystem/Patients)
// ==========================================
export const patientsApi = {
  getAll: (): Promise<T.PatientDTO[]> =>
    apiClient<T.PatientDTO[]>('/api/ClinicManagementSystem/Patients'),

  getById: (id: number): Promise<T.PatientDTO> =>
    apiClient<T.PatientDTO>(`/api/ClinicManagementSystem/Patients/${id}`),

  create: (dto: T.AddPatientDTO): Promise<T.PatientDTO> =>
    apiClient<T.PatientDTO>('/api/ClinicManagementSystem/Patients', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdatePatientDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Patients/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// 8. Appointments Endpoints (/api/ClinicManagementSystem/Appointments)
// ==========================================
export const appointmentsApi = {
  getAll: (): Promise<T.AppointmentDTO[]> =>
    apiClient<T.AppointmentDTO[]>('/api/ClinicManagementSystem/Appointments'),

  getById: (id: number): Promise<T.AppointmentDTO> =>
    apiClient<T.AppointmentDTO>(`/api/ClinicManagementSystem/Appointments/${id}`),

  getMyAppointments: (): Promise<T.AppointmentDTO[]> =>
    apiClient<T.AppointmentDTO[]>('/api/ClinicManagementSystem/Appointments/MyAppointments'),

  create: (dto: T.AddAppointmentDTO): Promise<T.AppointmentDTO> =>
    apiClient<T.AppointmentDTO>('/api/ClinicManagementSystem/Appointments', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateAppointmentDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  changeStatus: (id: number, status: T.AppointmentStatus): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Appointments/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// 9. Visits Endpoints (/api/ClinicManagementSystem/Visits)
// ==========================================
export const visitsApi = {
  getAll: (): Promise<T.VisitDTO[]> =>
    apiClient<T.VisitDTO[]>('/api/ClinicManagementSystem/Visits'),

  getById: (id: number): Promise<T.VisitDTO> =>
    apiClient<T.VisitDTO>(`/api/ClinicManagementSystem/Visits/${id}`),

  create: (dto: T.AddVisitDTO): Promise<T.VisitDTO> =>
    apiClient<T.VisitDTO>('/api/ClinicManagementSystem/Visits', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdateVisitDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Visits/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// 10. Prescriptions Endpoints (/api/ClinicManagementSystem/Prescriptions)
// ==========================================
export const prescriptionsApi = {
  getAll: (): Promise<T.PrescriptionDTO[]> =>
    apiClient<T.PrescriptionDTO[]>('/api/ClinicManagementSystem/Prescriptions'),

  getById: (id: number): Promise<T.PrescriptionDTO> =>
    apiClient<T.PrescriptionDTO>(`/api/ClinicManagementSystem/Prescriptions/${id}`),

  create: (dto: T.AddPrescriptionDTO): Promise<T.PrescriptionDTO> =>
    apiClient<T.PrescriptionDTO>('/api/ClinicManagementSystem/Prescriptions', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: T.UpdatePrescriptionDTO): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: number): Promise<void> =>
    apiClient<void>(`/api/ClinicManagementSystem/Prescriptions/${id}`, {
      method: 'DELETE',
    }),
};
