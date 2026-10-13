import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useShell } from '../../context/ShellContext';
import { DailyPatientQueue } from '../queue/DailyPatientQueue';
import {
  patientsApi,
  appointmentsApi,
  doctorsApi,
  specializationsApi,
  prescriptionsApi,
  employeesApi,
  usersApi,
  rolesApi,
  visitsApi,
} from '../../api';
import {
  PatientDTO,
  AddPatientDTO,
  UpdatePatientDTO,
  AppointmentDTO,
  AddAppointmentDTO,
  AppointmentStatus,
  DoctorDTO,
  SpecializationDTO,
  PrescriptionDTO,
  AddPrescriptionDTO,
  EmployeeDTO,
  UserDTO,
  RoleDTO,
  VisitDTO,
  AddVisitDTO,
} from '../../api/types';
import { SearchIcon, ShieldIcon, CloseIcon } from '../common/Icons';
import { PersonAvatar } from '../common/PersonAvatar';
import { EntityDetailsModal, EntityDetailsTarget } from '../common/EntityDetailsModal';

export const WorkspaceCanvas: React.FC = () => {
  const { activeRoute, activeRole } = useShell();

  // Daily Patient Queue renders the dedicated Modern SaaS Workstation layout
  if (activeRoute.id === 'daily-queue') {
    return (
      <main className="workspace-canvas" id="main-content">
        <DailyPatientQueue />
      </main>
    );
  }

  return (
    <main className="workspace-canvas" id="main-content">
      {renderRouteContent(activeRoute.id, activeRoute.label, activeRoute.description, activeRoute.category, activeRole)}
    </main>
  );
};

function renderRouteContent(
  routeId: string,
  title: string,
  description: string,
  category: string,
  activeRole: string
) {
  switch (routeId) {
    case 'intake-patients':
      return <PatientsView title={title} description={description} category={category} />;
    case 'appointment-scheduler':
      return <AppointmentsView title={title} description={description} category={category} />;
    case 'doctor-schedules':
      return <DoctorSchedulesView title={title} description={description} category={category} />;
    case 'doctor-consultations':
      return <DoctorConsultationsView title={title} description={description} category={category} />;
    case 'patient-records':
      return <PatientRecordsView title={title} description={description} category={category} />;
    case 'prescriptions':
      return <PrescriptionsView title={title} description={description} category={category} activeRole={activeRole} />;
    case 'staff-directory':
      return <StaffDirectoryView title={title} description={description} category={category} />;
    case 'doctor-management':
      return <DoctorManagementView title={title} description={description} category={category} />;
    case 'roles-access':
      return <RolesAccessView title={title} description={description} category={category} />;
    case 'audit-logs':
      return <AuditLogsView title={title} description={description} category={category} />;
    default:
      return <div>Select a view from the navigation.</div>;
  }
}

// ============================================================================
// 1. Patients Directory View (intake-patients)
// ============================================================================
const PatientsView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDTO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientsApi.getAll();
      setPatients(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load patients.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const openAddModal = () => {
    setName('');
    setGender('Male');
    setDateOfBirth('');
    setPhone('');
    setAddress('');
    setIsActive(true);
    setFormError(null);
    setEditingPatient(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: PatientDTO) => {
    setEditingPatient(p);
    setName(p.name);
    setGender(p.gender);
    setDateOfBirth(p.dateOfBirth);
    setPhone(p.phone);
    setAddress(p.address);
    setIsActive(p.isActive);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !dateOfBirth) {
      setFormError('Name, Phone, and Date of Birth are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingPatient) {
        const dto: UpdatePatientDTO = {
          name: name.trim(),
          gender,
          dateOfBirth,
          phone: phone.trim(),
          address: address.trim(),
          isActive,
        };
        await patientsApi.update(editingPatient.patientId, dto);
      } else {
        const dto: AddPatientDTO = {
          name: name.trim(),
          gender,
          dateOfBirth,
          phone: phone.trim(),
          address: address.trim(),
          isActive,
        };
        await patientsApi.create(dto);
      }
      setIsAddModalOpen(false);
      await loadPatients();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save patient.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      await patientsApi.delete(id);
      await loadPatients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete patient.');
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        <div className="workspace-header-actions">
          <button type="button" className="btn btn--primary" onClick={openAddModal}>
            + Register Patient
          </button>
        </div>
      </div>

      <div className="view-toolbar">
        <div className="toolbar-search">
          <SearchIcon size={15} />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Search patient name, phone, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Total Patients: <strong>{patients.length}</strong>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading patients from server...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadPatients}>
              Retry
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>ID</th>
                <th style={{ width: '26%' }}>PATIENT NAME</th>
                <th style={{ width: '12%' }}>GENDER</th>
                <th style={{ width: '16%' }}>DOB</th>
                <th style={{ width: '16%' }}>PHONE</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '10%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.patientId}>
                    <td>
                      <span className="queue-number-badge">#{p.patientId}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="clickable-person-name"
                        onClick={() => setDetailsTarget({ type: 'patient', data: p })}
                        title="View patient file"
                      >
                        <PersonAvatar name={p.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          {p.address && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.address}</div>}
                        </div>
                      </button>
                    </td>
                    <td>{p.gender}</td>
                    <td>{p.dateOfBirth}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className={`status-chip ${p.isActive ? 'status-chip--emerald' : 'status-chip--slate'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDeletePatient(p.patientId)}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Patient Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingPatient ? 'Edit Patient' : 'Register New Patient'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePatient}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && <div className="form-error-banner">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="patient-active"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                  />
                  <label htmlFor="patient-active" style={{ fontSize: '12px' }}>
                    Active Patient Record
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingPatient ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 2. Appointment Scheduler View (appointment-scheduler)
// ============================================================================
const AppointmentsView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  const handlePatientClick = async (patientId: number, fallbackName: string) => {
    const existing = patients.find(p => p.patientId === patientId);
    if (existing) {
      setDetailsTarget({ type: 'patient', data: existing });
      return;
    }
    try {
      const p = await patientsApi.getById(patientId);
      setDetailsTarget({ type: 'patient', data: p });
    } catch {
      setDetailsTarget({
        type: 'patient',
        data: { patientId, name: fallbackName, phone: '', gender: '', dateOfBirth: '', address: '', isActive: true },
      });
    }
  };

  const handleDoctorClick = async (doctorId: number, fallbackName: string) => {
    const existing = doctors.find(d => d.doctorId === doctorId);
    if (existing) {
      setDetailsTarget({ type: 'doctor', data: existing });
      return;
    }
    try {
      const d = await doctorsApi.getById(doctorId);
      setDetailsTarget({ type: 'doctor', data: d });
    } catch {
      setDetailsTarget({
        type: 'doctor',
        data: { doctorId, employeeId: 0, employeeName: fallbackName, specializationId: 0, specializationName: 'Physician' },
      });
    }
  };
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [patientId, setPatientId] = useState<number>(0);
  const [doctorId, setDoctorId] = useState<number>(0);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apptsData, ptsData, docsData] = await Promise.all([
        appointmentsApi.getAll(),
        patientsApi.getAll().catch(() => []),
        doctorsApi.getAll().catch(() => []),
      ]);
      setAppointments(apptsData);
      setPatients(ptsData);
      setDoctors(docsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openBookModal = () => {
    setPatientId(patients[0]?.patientId || 0);
    setDoctorId(doctors[0]?.doctorId || 0);
    setAppointmentDate(new Date().toISOString().slice(0, 16));
    setNotes('');
    setFormError(null);
    setIsBookModalOpen(true);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !appointmentDate) {
      setFormError('Patient, Doctor, and Appointment Date are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const dto: AddAppointmentDTO = {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        date: new Date(appointmentDate).toISOString(),
        notes: notes.trim() || null,
      };
      await appointmentsApi.create(dto);
      setIsBookModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to book appointment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: AppointmentStatus) => {
    try {
      await appointmentsApi.changeStatus(id, status);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await appointmentsApi.delete(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete appointment.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        <div className="workspace-header-actions">
          <button type="button" className="btn btn--primary" onClick={openBookModal}>
            + Book Appointment
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading appointments from server...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadData}>
              Retry
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>APPT #</th>
                <th style={{ width: '24%' }}>PATIENT</th>
                <th style={{ width: '22%' }}>DATE & TIME</th>
                <th style={{ width: '20%' }}>ATTENDING DOCTOR</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '12%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No appointments scheduled.
                  </td>
                </tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.appointmentId}>
                    <td>
                      <span className="queue-number-badge">#{a.appointmentId}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="clickable-person-name"
                        onClick={() => handlePatientClick(a.patientId, a.patientName)}
                        title="View patient file"
                      >
                        <PersonAvatar name={a.patientName} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                          {a.notes && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{a.notes}</div>}
                        </div>
                      </button>
                    </td>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="clickable-person-name"
                        onClick={() => handleDoctorClick(a.doctorId, a.doctorName)}
                        title="View physician profile"
                      >
                        <PersonAvatar name={a.doctorName} size="sm" />
                        <span>{a.doctorName}</span>
                      </button>
                    </td>
                    <td>
                      <span
                        className={`status-chip ${
                          a.status === AppointmentStatus.Scheduled
                            ? 'status-chip--amber'
                            : a.status === AppointmentStatus.Completed
                            ? 'status-chip--emerald'
                            : 'status-chip--slate'
                        }`}
                      >
                        {a.status === AppointmentStatus.Scheduled
                          ? 'Scheduled'
                          : a.status === AppointmentStatus.Completed
                          ? 'Completed'
                          : 'Cancelled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {a.status === AppointmentStatus.Scheduled && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => handleStatusChange(a.appointmentId, AppointmentStatus.Cancelled)}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteAppointment(a.appointmentId)}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBookModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Book New Appointment</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsBookModalOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleBookAppointment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && <div className="form-error-banner">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Select Patient *</label>
                  <select
                    className="form-input"
                    value={patientId}
                    onChange={e => setPatientId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.patientId} value={p.patientId}>
                        {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Attending Doctor *</label>
                  <select
                    className="form-input"
                    value={doctorId}
                    onChange={e => setDoctorId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.doctorId} value={d.doctorId}>
                        {d.employeeName} ({d.specializationName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Appointment Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Encounter Notes</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Chief complaint or consultation reason"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsBookModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Entity Details Modal */}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 3. Doctor Availability Directory (doctor-schedules)
// ============================================================================
const DoctorSchedulesView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await doctorsApi.getAll();
      setDoctors(docs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors roster.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading doctor availability...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadData}>
              Retry
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>DOCTOR ID</th>
                <th style={{ width: '32%' }}>PHYSICIAN NAME</th>
                <th style={{ width: '28%' }}>SPECIALIZATION</th>
                <th style={{ width: '16%' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No doctors currently registered in system.
                  </td>
                </tr>
              ) : (
                doctors.map(d => (
                  <tr key={d.doctorId}>
                    <td>
                      <span className="queue-number-badge">DOC-{d.doctorId}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="clickable-person-name"
                        onClick={() => setDetailsTarget({ type: 'doctor', data: d })}
                        title="View physician profile"
                      >
                        <PersonAvatar name={d.employeeName} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.employeeName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Employee ID: {d.employeeId}</div>
                        </div>
                      </button>
                    </td>
                    <td>
                      <span className="status-chip status-chip--blue">{d.specializationName}</span>
                    </td>
                    <td>
                      <span className="status-chip status-chip--emerald">Available</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 4. Doctor Consultations (My Queue) (doctor-consultations)
// ============================================================================
const DoctorConsultationsView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAppt, setActiveAppt] = useState<AppointmentDTO | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  const handlePatientClick = async (patientId: number, fallbackName: string) => {
    try {
      const p = await patientsApi.getById(patientId);
      setDetailsTarget({ type: 'patient', data: p });
    } catch {
      setDetailsTarget({
        type: 'patient',
        data: { patientId, name: fallbackName, phone: '', gender: '', dateOfBirth: '', address: '', isActive: true },
      });
    }
  };
  const [visitNotes, setVisitNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  const loadDoctorQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getMyAppointments();
      setAppointments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load doctor consultation appointments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctorQueue();
  }, [loadDoctorQueue]);

  const handleRecordVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppt) return;
    setIsRecording(true);
    setVisitError(null);
    try {
      const dto: AddVisitDTO = {
        appointmentId: activeAppt.appointmentId,
        visitDate: new Date().toISOString(),
        notes: visitNotes.trim() || null,
      };
      await visitsApi.create(dto);
      setActiveAppt(null);
      await loadDoctorQueue();
    } catch (err: unknown) {
      setVisitError(err instanceof Error ? err.message : 'Failed to record consultation visit.');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading assigned consultations...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadDoctorQueue}>
              Retry
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>APPT #</th>
                <th style={{ width: '28%' }}>PATIENT NAME</th>
                <th style={{ width: '22%' }}>SCHEDULED TIME</th>
                <th style={{ width: '16%' }}>STATUS</th>
                <th style={{ width: '24%', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No consultations currently scheduled for your roster.
                  </td>
                </tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.appointmentId}>
                    <td>
                      <span className="queue-number-badge">#{a.appointmentId}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="clickable-person-name"
                        onClick={() => handlePatientClick(a.patientId, a.patientName)}
                        title="View patient file"
                      >
                        <PersonAvatar name={a.patientName} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                          {a.notes && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{a.notes}</div>}
                        </div>
                      </button>
                    </td>
                    <td>{new Date(a.date).toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-chip ${
                          a.status === AppointmentStatus.Scheduled
                            ? 'status-chip--amber'
                            : a.status === AppointmentStatus.Completed
                            ? 'status-chip--emerald'
                            : 'status-chip--slate'
                        }`}
                      >
                        {a.status === AppointmentStatus.Scheduled
                          ? 'Scheduled'
                          : a.status === AppointmentStatus.Completed
                          ? 'Completed'
                          : 'Cancelled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {a.status === AppointmentStatus.Scheduled ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => {
                            setActiveAppt(a);
                            setVisitNotes(a.notes || '');
                            setVisitError(null);
                          }}
                        >
                          Record Encounter
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Encounter Finalized</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Visit Modal */}
      {activeAppt && (
        <div className="modal-overlay" onClick={() => setActiveAppt(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Consultation Visit: {activeAppt.patientName}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setActiveAppt(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordVisit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visitError && <div className="form-error-banner">{visitError}</div>}
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Appointment #{activeAppt.appointmentId} • {new Date(activeAppt.date).toLocaleString()}
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Encounter & Diagnostic Notes *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={visitNotes}
                    onChange={e => setVisitNotes(e.target.value)}
                    placeholder="Enter diagnosis, clinical observations, and examination notes"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setActiveAppt(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isRecording}>
                  {isRecording ? 'Finalizing Visit...' : 'Complete & Save Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entity Details Modal */}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 5. Patient Medical Records View (patient-records)
// ============================================================================
const PatientRecordsView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [patients, setPatients] = useState<PatientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  useEffect(() => {
    patientsApi
      .getAll()
      .then((data: PatientDTO[]) => setPatients(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
      </div>

      <div className="view-toolbar">
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Showing <strong>{patients.length}</strong> patient records. Note: Detailed longitudinal history queries are not yet supported by backend schema.
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading patient records...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>RECORD #</th>
                <th style={{ width: '30%' }}>PATIENT NAME</th>
                <th style={{ width: '16%' }}>GENDER</th>
                <th style={{ width: '20%' }}>DATE OF BIRTH</th>
                <th style={{ width: '24%' }}>CONTACT PHONE</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.patientId}>
                  <td>
                    <span className="queue-number-badge">PAT-{p.patientId}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="clickable-person-name"
                      onClick={() => setDetailsTarget({ type: 'patient', data: p })}
                      title="View patient file"
                    >
                      <PersonAvatar name={p.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.address}</div>
                      </div>
                    </button>
                  </td>
                  <td>{p.gender}</td>
                  <td>{p.dateOfBirth}</td>
                  <td>{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Entity Details Modal */}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 6. Digital Prescriptions View (prescriptions)
// ============================================================================
const PrescriptionsView: React.FC<{ title: string; description: string; category: string; activeRole: string }> = ({
  title,
  description,
  category,
  activeRole,
}) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDTO[]>([]);
  const [visits, setVisits] = useState<VisitDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [selectedVisitId, setSelectedVisitId] = useState<number>(0);
  const [rxNotes, setRxNotes] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rxData, visitsData] = await Promise.all([
        prescriptionsApi.getAll(),
        visitsApi.getAll().catch(() => []),
      ]);
      setPrescriptions(rxData);
      setVisits(visitsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load prescriptions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openIssueModal = () => {
    setSelectedVisitId(visits[0]?.visitId || 0);
    setRxNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId || !rxNotes.trim()) {
      setFormError('Visit ID and Prescription Notes are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const dto: AddPrescriptionDTO = {
        visitId: Number(selectedVisitId),
        notes: rxNotes.trim(),
      };
      await prescriptionsApi.create(dto);
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to issue prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRx = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await prescriptionsApi.delete(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete prescription.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        {activeRole === 'Doctor' && (
          <div className="workspace-header-actions">
            <button type="button" className="btn btn--primary" onClick={openIssueModal}>
              + Issue Prescription
            </button>
          </div>
        )}
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading prescriptions from server...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadData}>
              Retry
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>RX #</th>
                <th style={{ width: '12%' }}>VISIT ID</th>
                <th style={{ width: '22%' }}>PATIENT</th>
                <th style={{ width: '20%' }}>PRESCRIBING DOCTOR</th>
                <th style={{ width: '26%' }}>MEDICATION REGIMEN & NOTES</th>
                <th style={{ width: '10%', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    No prescriptions found.
                  </td>
                </tr>
              ) : (
                prescriptions.map(p => (
                  <tr key={p.prescriptionId}>
                    <td>
                      <span className="queue-number-badge">RX-{p.prescriptionId}</span>
                    </td>
                    <td>#{p.visitId}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <PersonAvatar name={p.patientName || 'Patient'} size="xs" />
                        <span style={{ fontWeight: 500 }}>{p.patientName || 'Patient'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <PersonAvatar name={p.doctorName || 'Attending Physician'} size="xs" />
                        <span>{p.doctorName || 'Attending Physician'}</span>
                      </div>
                    </td>
                    <td>{p.notes || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      {activeRole === 'Doctor' && (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteRx(p.prescriptionId)}
                        >
                          Del
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Issue Rx Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Issue Digital Prescription</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleIssuePrescription}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && <div className="form-error-banner">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Select Encounter Visit *</label>
                  <select
                    className="form-input"
                    value={selectedVisitId}
                    onChange={e => setSelectedVisitId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Completed Visit --</option>
                    {visits.map(v => (
                      <option key={v.visitId} value={v.visitId}>
                        Visit #{v.visitId} - {v.patientName} ({new Date(v.visitDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medication Regimen & Instructions (Notes) *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={rxNotes}
                    onChange={e => setRxNotes(e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg - 1 capsule TID for 7 days"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Issuing...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. Staff & Employees View (staff-directory)
// ============================================================================
const StaffDirectoryView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeDTO | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openAdd = () => {
    setEditingEmp(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setHireDate(new Date().toISOString().slice(0, 10));
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (emp: EmployeeDTO) => {
    setEditingEmp(emp);
    setName(emp.name);
    setPhone(emp.phone);
    setEmail(emp.email || '');
    setAddress(emp.address || '');
    setHireDate(emp.hireDate);
    setIsActive(emp.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !hireDate) {
      setFormError('Name, Phone, and Hire Date are required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingEmp) {
        await employeesApi.update(editingEmp.employeeId, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          address: address.trim() || null,
          hireDate,
          isActive,
        });
      } else {
        await employeesApi.create({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          address: address.trim() || null,
          hireDate,
          isActive,
        });
      }
      setIsModalOpen(false);
      await loadEmployees();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save employee.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await employeesApi.delete(id);
      await loadEmployees();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete employee.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        <div className="workspace-header-actions">
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            + Add Staff Member
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading staff directory...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>EMP #</th>
                <th style={{ width: '28%' }}>EMPLOYEE NAME</th>
                <th style={{ width: '20%' }}>EMAIL</th>
                <th style={{ width: '16%' }}>PHONE</th>
                <th style={{ width: '14%' }}>HIRE DATE</th>
                <th style={{ width: '14%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.employeeId}>
                  <td>
                    <span className="queue-number-badge">EMP-{emp.employeeId}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="clickable-person-name"
                      onClick={() => setDetailsTarget({ type: 'employee', data: emp })}
                      title="View staff details"
                    >
                      <PersonAvatar name={emp.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{emp.address}</div>
                      </div>
                    </button>
                  </td>
                  <td>{emp.email || '—'}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.hireDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(emp)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => handleDelete(emp.employeeId)}
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingEmp ? 'Edit Employee' : 'Add Employee'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && <div className="form-error-banner">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hire Date *</label>
                  <input type="date" className="form-input" value={hireDate} onChange={e => setHireDate(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entity Details Modal */}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  );
};

// ============================================================================
// 8. Doctors & Specializations View (doctor-management)
// ============================================================================
const DoctorManagementView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationDTO[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  // Modals
  const [isAssignDocOpen, setIsAssignDocOpen] = useState(false);
  const [isAddSpecOpen, setIsAddSpecOpen] = useState(false);
  const [docEmpId, setDocEmpId] = useState<number>(0);
  const [docSpecId, setDocSpecId] = useState<number>(0);
  const [specName, setSpecName] = useState('');
  const [specDesc, setSpecDesc] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docs, specs, emps] = await Promise.all([
        doctorsApi.getAll(),
        specializationsApi.getAll(),
        employeesApi.getAvailableForDoctor().catch(() => []),
      ]);
      setDoctors(docs);
      setSpecializations(specs);
      setAvailableEmployees(emps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors management data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docEmpId || !docSpecId) {
      setModalError('Employee and Specialization are required.');
      return;
    }
    setIsSaving(true);
    setModalError(null);
    try {
      await doctorsApi.create({ employeeId: Number(docEmpId), specializationId: Number(docSpecId) });
      setIsAssignDocOpen(false);
      await loadData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to assign doctor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) {
      setModalError('Specialization Name is required.');
      return;
    }
    setIsSaving(true);
    setModalError(null);
    try {
      await specializationsApi.create({ name: specName.trim(), description: specDesc.trim() || null });
      setIsAddSpecOpen(false);
      await loadData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to create specialization.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!window.confirm('Remove doctor assignment?')) return;
    try {
      await doctorsApi.delete(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete doctor.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        <div className="workspace-header-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setSpecName('');
              setSpecDesc('');
              setModalError(null);
              setIsAddSpecOpen(true);
            }}
          >
            + Add Specialization
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setDocEmpId(availableEmployees[0]?.employeeId || 0);
              setDocSpecId(specializations[0]?.specializationID || 0);
              setModalError(null);
              setIsAssignDocOpen(true);
            }}
          >
            + Assign Doctor
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading doctors and specializations...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>DOCTOR #</th>
                <th style={{ width: '32%' }}>PHYSICIAN NAME</th>
                <th style={{ width: '32%' }}>SPECIALIZATION</th>
                <th style={{ width: '24%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.doctorId}>
                  <td>
                    <span className="queue-number-badge">DOC-{d.doctorId}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="clickable-person-name"
                      onClick={() => setDetailsTarget({ type: 'doctor', data: d })}
                      title="View physician profile"
                    >
                      <PersonAvatar name={d.employeeName} size="sm" />
                      <span>{d.employeeName}</span>
                    </button>
                  </td>
                  <td>
                    <span className="status-chip status-chip--blue">{d.specializationName}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteDoctor(d.doctorId)}
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
      {/* Assign Doctor Modal */}
      {isAssignDocOpen && (
        <div className="modal-overlay" onClick={() => setIsAssignDocOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Physician</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAssignDocOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignDoctor}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalError && <div className="form-error-banner">{modalError}</div>}
                <div className="form-group">
                  <label className="form-label">Available Employee *</label>
                  <select
                    className="form-input"
                    value={docEmpId}
                    onChange={e => setDocEmpId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Eligible Employee --</option>
                    {availableEmployees.map(e => (
                      <option key={e.employeeId} value={e.employeeId}>
                        {e.name} (EMP-{e.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Specialization *</label>
                  <select
                    className="form-input"
                    value={docSpecId}
                    onChange={e => setDocSpecId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Specialization --</option>
                    {specializations.map(s => (
                      <option key={s.specializationID} value={s.specializationID}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsAssignDocOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Assigning...' : 'Assign as Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Specialization Modal */}
      {isAddSpecOpen && (
        <div className="modal-overlay" onClick={() => setIsAddSpecOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Medical Specialization</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddSpecOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSpec}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalError && <div className="form-error-banner">{modalError}</div>}
                <div className="form-group">
                  <label className="form-label">Specialization Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specName}
                    onChange={e => setSpecName(e.target.value)}
                    placeholder="e.g. Cardiology, Pediatrics"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={specDesc}
                    onChange={e => setSpecDesc(e.target.value)}
                    placeholder="Department clinical scope"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsAddSpecOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Specialization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. Roles & Access Control View (roles-access)
// ============================================================================
const RolesAccessView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  const handleUserClick = (u: UserDTO) => {
    const matchedEmp = employees.find(e => e.employeeId === u.employeeId);
    if (matchedEmp) {
      setDetailsTarget({ type: 'employee', data: matchedEmp });
    } else {
      setDetailsTarget({
        type: 'employee',
        data: {
          employeeId: u.employeeId,
          name: u.employeeName || u.username,
          phone: '',
          email: null,
          address: null,
          hireDate: '',
          isActive: u.isActive,
        },
      });
    }
  };

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [userEmpId, setUserEmpId] = useState<number>(0);
  const [userRoleId, setUserRoleId] = useState<number>(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData, empsData] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        employeesApi.getAll().catch(() => []),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setEmployees(empsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users and roles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmpId || !userRoleId || !username.trim() || !password.trim()) {
      setModalError('All user fields are required.');
      return;
    }
    setIsSaving(true);
    setModalError(null);
    try {
      await usersApi.create({
        employeeId: Number(userEmpId),
        roleId: Number(userRoleId),
        username: username.trim(),
        password,
        isActive: true,
      });
      setIsAddUserOpen(false);
      await loadData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to create user account.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setModalError('Role Name is required.');
      return;
    }
    setIsSaving(true);
    setModalError(null);
    try {
      await rolesApi.create({ roleName: roleName.trim() });
      setIsAddRoleOpen(false);
      await loadData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to create role.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await usersApi.delete(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete user.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
        <div className="workspace-header-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setRoleName('');
              setModalError(null);
              setIsAddRoleOpen(true);
            }}
          >
            + Add Role
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setUserEmpId(employees[0]?.employeeId || 0);
              setUserRoleId(roles[0]?.roleId || 0);
              setUsername('');
              setPassword('');
              setModalError(null);
              setIsAddUserOpen(true);
            }}
          >
            + Create User Account
          </button>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading user credentials and roles...
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-danger)' }}>{error}</div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>USER #</th>
                <th style={{ width: '28%' }}>USERNAME / STAFF</th>
                <th style={{ width: '24%' }}>SYSTEM ROLE</th>
                <th style={{ width: '16%' }}>STATUS</th>
                <th style={{ width: '24%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId}>
                  <td>
                    <span className="queue-number-badge">USR-{u.userId}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="clickable-person-name"
                      onClick={() => handleUserClick(u)}
                      title="View staff details"
                    >
                      <PersonAvatar name={u.employeeName || u.username} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>@{u.username}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{u.employeeName}</div>
                      </div>
                    </button>
                  </td>
                  <td>
                    <span className="status-chip status-chip--blue">{u.roleName}</span>
                  </td>
                  <td>
                    <span className={`status-chip ${u.isActive ? 'status-chip--emerald' : 'status-chip--slate'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteUser(u.userId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
      {/* Create User Modal */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create User Account</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddUserOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalError && <div className="form-error-banner">{modalError}</div>}
                <div className="form-group">
                  <label className="form-label">Employee Staff Member *</label>
                  <select
                    className="form-input"
                    value={userEmpId}
                    onChange={e => setUserEmpId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.name} (EMP-{emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    className="form-input"
                    value={userRoleId}
                    onChange={e => setUserRoleId(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Choose Role --</option>
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {isAddRoleOpen && (
        <div className="modal-overlay" onClick={() => setIsAddRoleOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Define New Role</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddRoleOpen(false)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {modalError && <div className="form-error-banner">{modalError}</div>}
                <div className="form-group">
                  <label className="form-label">Role Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    placeholder="e.g. Nurse, Pharmacist"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsAddRoleOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 10. System Audit Logs View (audit-logs) - Contract-Truthful Representation
// ============================================================================
const AuditLogsView: React.FC<{ title: string; description: string; category: string }> = ({
  title,
  description,
  category,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <span className="workspace-category-tag">{category}</span>
          <h1 className="workspace-title">{title}</h1>
          <p className="workspace-description">{description}</p>
        </div>
      </div>

      <div className="table-container" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-muted)',
            marginBottom: '16px',
          }}
        >
          <ShieldIcon size={24} />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
          Audit Logging Not Configured on Backend
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
          Frontend route exists, but the existing ASP.NET Core backend currently has no real audit-log data source, controller, or database entity.
          Per project rules, no fabricated audit records are generated.
        </p>
      </div>
    </div>
  );
};
