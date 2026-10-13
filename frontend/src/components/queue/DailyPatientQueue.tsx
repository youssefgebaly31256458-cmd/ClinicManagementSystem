import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { appointmentsApi, patientsApi, doctorsApi } from '../../api';
import { AppointmentDTO, AppointmentStatus } from '../../api/types';
import { SearchIcon, QueueIcon } from '../common/Icons';
import { PersonAvatar } from '../common/PersonAvatar';
import { EntityDetailsModal, EntityDetailsTarget } from '../common/EntityDetailsModal';

export const DailyPatientQueue: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<EntityDetailsTarget | null>(null);

  const handlePatientClick = async (patientId: number, fallbackName: string) => {
    try {
      const p = await patientsApi.getById(patientId);
      setDetailsTarget({ type: 'patient', data: p });
    } catch {
      setDetailsTarget({
        type: 'patient',
        data: {
          patientId,
          name: fallbackName,
          phone: '',
          gender: '',
          dateOfBirth: '',
          address: '',
          isActive: true,
        },
      });
    }
  };

  const handleDoctorClick = async (doctorId: number, fallbackName: string) => {
    try {
      const d = await doctorsApi.getById(doctorId);
      setDetailsTarget({ type: 'doctor', data: d });
    } catch {
      setDetailsTarget({
        type: 'doctor',
        data: {
          doctorId,
          employeeId: 0,
          employeeName: fallbackName,
          specializationId: 0,
          specializationName: 'General Physician',
        },
      });
    }
  };

  // Fetch real appointments from backend
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load appointments from server.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter for today's appointments
  const todayStr = useMemo(() => new Date().toDateString(), []);

  const todayAppointments = useMemo(() => {
    return appointments.filter(a => {
      try {
        return new Date(a.date).toDateString() === todayStr;
      } catch {
        return true;
      }
    });
  }, [appointments, todayStr]);

  // If there are appointments today, calculate metrics for today; otherwise show across all appointments
  const activeDataset = todayAppointments.length > 0 ? todayAppointments : appointments;

  // Real KPI Metrics derived strictly from backend AppointmentStatus
  const metrics = useMemo(() => {
    const scheduled = activeDataset.filter(a => a.status === AppointmentStatus.Scheduled).length;
    const completed = activeDataset.filter(a => a.status === AppointmentStatus.Completed).length;
    const cancelled = activeDataset.filter(a => a.status === AppointmentStatus.Cancelled).length;
    const total = activeDataset.length;

    return { scheduled, completed, cancelled, total };
  }, [activeDataset]);

  // Filtered rows based on active tab and search query
  const filteredAppointments = useMemo(() => {
    return activeDataset.filter(item => {
      if (activeTab === 'scheduled' && item.status !== AppointmentStatus.Scheduled) return false;
      if (activeTab === 'completed' && item.status !== AppointmentStatus.Completed) return false;
      if (activeTab === 'cancelled' && item.status !== AppointmentStatus.Cancelled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const patientMatch = item.patientName?.toLowerCase().includes(q) || false;
        const doctorMatch = item.doctorName?.toLowerCase().includes(q) || false;
        const notesMatch = item.notes?.toLowerCase().includes(q) || false;
        const idMatch = item.appointmentId.toString().includes(q);
        return patientMatch || doctorMatch || notesMatch || idMatch;
      }

      return true;
    });
  }, [activeDataset, activeTab, searchQuery]);

  // Status transition action: Mark Completed (status = 2) or Cancelled (status = 3)
  const handleStatusChange = async (appointmentId: number, newStatus: AppointmentStatus) => {
    setUpdatingId(appointmentId);
    setActionError(null);
    try {
      await appointmentsApi.changeStatus(appointmentId, newStatus);
      // Refresh local state with updated status
      setAppointments(prev =>
        prev.map(a => (a.appointmentId === appointmentId ? { ...a, status: newStatus } : a))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update appointment status.';
      setActionError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusChipClass = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'status-chip--amber';
      case AppointmentStatus.Completed:
        return 'status-chip--emerald';
      case AppointmentStatus.Cancelled:
        return 'status-chip--slate';
      default:
        return 'status-chip--slate';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'Scheduled';
      case AppointmentStatus.Completed:
        return 'Completed';
      case AppointmentStatus.Cancelled:
        return 'Cancelled';
      default:
        return `Status ${status}`;
    }
  };

  return (
    <div className="daily-queue-workspace">
      {/* 1. Page Header Card */}
      <div className="workspace-header-card">
        <div className="workspace-header-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="workspace-category-tag">Front Desk</span>
            <span className="badge-live-pulse">
              <span className="pulse-dot" aria-hidden="true" />
              <span>Real-time Roster</span>
            </span>
          </div>
          <h1 className="workspace-title">Daily Patient Queue</h1>
          <p className="workspace-description">
            Live patient consultations and scheduled encounters from clinic appointments.
          </p>
        </div>

        <div className="workspace-header-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={fetchAppointments}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Roster'}
          </button>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="form-error-banner" role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Responsive 4-Column Operational Metric Cards (Strictly Contract-Driven) */}
      <div className="metrics-row" aria-label="Queue Metrics">
        <div className="metric-card">
          <div className="metric-card-accent accent-amber" />
          <div className="metric-top-row">
            <span className="metric-label">Scheduled</span>
            <span className="metric-badge">STATUS 1</span>
          </div>
          <div className="metric-value">{metrics.scheduled}</div>
          <div className="metric-meta">Awaiting consultation</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent accent-emerald" />
          <div className="metric-top-row">
            <span className="metric-label">Completed</span>
            <span className="metric-badge">STATUS 2</span>
          </div>
          <div className="metric-value">{metrics.completed}</div>
          <div className="metric-meta">Encounters finalized</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent accent-slate" />
          <div className="metric-top-row">
            <span className="metric-label">Cancelled</span>
            <span className="metric-badge">STATUS 3</span>
          </div>
          <div className="metric-value">{metrics.cancelled}</div>
          <div className="metric-meta">Cancelled visits</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-accent accent-blue" />
          <div className="metric-top-row">
            <span className="metric-label">Total Roster</span>
            <span className="metric-badge">TOTAL</span>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-meta">Total scheduled entries</div>
        </div>
      </div>

      {/* 3. Toolbar: Status Tabs + Search Input */}
      <div className="view-toolbar">
        <div className="toolbar-tabs" role="tablist" aria-label="Filter status">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('all')}
            role="tab"
            aria-selected={activeTab === 'all'}
          >
            <span>All Appointments</span>
            <span className="tab-badge">{activeDataset.length}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'scheduled' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
            role="tab"
            aria-selected={activeTab === 'scheduled'}
          >
            <span>Scheduled</span>
            <span className="tab-badge">{metrics.scheduled}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'completed' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('completed')}
            role="tab"
            aria-selected={activeTab === 'completed'}
          >
            <span>Completed</span>
            <span className="tab-badge">{metrics.completed}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'cancelled' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
            role="tab"
            aria-selected={activeTab === 'cancelled'}
          >
            <span>Cancelled</span>
            <span className="tab-badge">{metrics.cancelled}</span>
          </button>
        </div>

        <div className="toolbar-search">
          <SearchIcon size={15} />
          <input
            type="text"
            className="toolbar-search-input"
            placeholder="Search patient, doctor, notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Filter queue"
          />
          <span className="toolbar-kbd">/</span>
        </div>
      </div>

      {/* 4. High-Density Clinical Workstation Queue Table */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <span>Loading appointments from server...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>{error}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={fetchAppointments}>
              Retry Connection
            </button>
          </div>
        ) : (
          <table className="clinical-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '10%' }}>APPT #</th>
                <th scope="col" style={{ width: '26%' }}>PATIENT</th>
                <th scope="col" style={{ width: '20%' }}>SCHEDULED DATE</th>
                <th scope="col" style={{ width: '14%' }}>STATUS</th>
                <th scope="col" style={{ width: '18%' }}>ATTENDING DOCTOR</th>
                <th scope="col" style={{ width: '12%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty-state">
                      <div className="empty-icon-wrap" aria-hidden="true">
                        <QueueIcon size={24} />
                      </div>
                      <h3 className="empty-title">No appointments found</h3>
                      <p className="empty-subtitle">
                        There are no appointments matching the current filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(item => {
                  const isUpdating = updatingId === item.appointmentId;
                  const formattedDate = new Date(item.date).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.appointmentId}>
                      <td>
                        <span className="queue-number-badge">#{item.appointmentId}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="clickable-person-name"
                          onClick={() => handlePatientClick(item.patientId, item.patientName)}
                          title="View patient file"
                        >
                          <PersonAvatar name={item.patientName} size="xs" />
                          <span>{item.patientName}</span>
                        </button>
                        {item.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            Notes: {item.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {formattedDate}
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${getStatusChipClass(item.status)}`}>
                          <span className="status-dot" aria-hidden="true" />
                          <span>{getStatusLabel(item.status)}</span>
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="clickable-person-name"
                          onClick={() => handleDoctorClick(item.doctorId, item.doctorName)}
                          title="View physician profile"
                        >
                          <PersonAvatar name={item.doctorName} size="xs" />
                          <span>{item.doctorName}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {item.status === AppointmentStatus.Scheduled ? (
                            <>
                              <button
                                type="button"
                                className="btn btn--primary btn--sm"
                                onClick={() => handleStatusChange(item.appointmentId, AppointmentStatus.Completed)}
                                disabled={isUpdating}
                                title="Mark appointment as Completed"
                              >
                                {isUpdating ? '...' : 'Complete'}
                              </button>
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                onClick={() => handleStatusChange(item.appointmentId, AppointmentStatus.Cancelled)}
                                disabled={isUpdating}
                                title="Cancel appointment"
                              >
                                Cancel
                              </button>
                            </>
                          ) : item.status === AppointmentStatus.Cancelled ? (
                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleStatusChange(item.appointmentId, AppointmentStatus.Scheduled)}
                              disabled={isUpdating}
                              title="Reopen appointment as Scheduled"
                            >
                              Reopen
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Finalized</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      <EntityDetailsModal target={detailsTarget} onClose={() => setDetailsTarget(null)} />
    </div>
  </div>
  );
};
