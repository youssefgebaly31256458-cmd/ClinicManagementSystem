import React, { useEffect } from 'react';
import { PatientDTO, DoctorDTO, EmployeeDTO } from '../../api/types';
import { PersonAvatar } from './PersonAvatar';
import { CloseIcon } from './Icons';

export type EntityDetailsTarget =
  | { type: 'patient'; data: PatientDTO }
  | { type: 'doctor'; data: DoctorDTO }
  | { type: 'employee'; data: EmployeeDTO };

interface EntityDetailsModalProps {
  target: EntityDetailsTarget | null;
  onClose: () => void;
}

export const EntityDetailsModal: React.FC<EntityDetailsModalProps> = ({ target, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!target) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container entity-details-modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '460px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PersonAvatar
              name={
                target.type === 'patient'
                  ? target.data.name
                  : target.type === 'doctor'
                  ? target.data.employeeName
                  : target.data.name
              }
              size="md"
            />
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-brand)',
                  backgroundColor: 'var(--color-brand-tint)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginBottom: '2px',
                }}
              >
                {target.type === 'patient'
                  ? 'Patient File'
                  : target.type === 'doctor'
                  ? 'Physician Profile'
                  : 'Staff Member'}
              </span>
              <h3 className="modal-title" style={{ fontSize: '16px', lineHeight: 1.2 }}>
                {target.type === 'patient'
                  ? target.data.name
                  : target.type === 'doctor'
                  ? target.data.employeeName
                  : target.data.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close details"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', gap: '16px' }}>
          {target.type === 'patient' && (
            <div className="entity-details-grid">
              <div className="entity-detail-field">
                <span className="entity-detail-label">Patient ID</span>
                <span className="entity-detail-value">
                  <span className="queue-number-badge">PT-{target.data.patientId}</span>
                </span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Gender</span>
                <span className="entity-detail-value">{target.data.gender || 'Not specified'}</span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Date of Birth</span>
                <span className="entity-detail-value">{target.data.dateOfBirth || 'Not documented'}</span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Contact Phone</span>
                <span className="entity-detail-value font-mono">{target.data.phone || 'N/A'}</span>
              </div>
              <div className="entity-detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="entity-detail-label">Residential Address</span>
                <span className="entity-detail-value">{target.data.address || 'None recorded'}</span>
              </div>
            </div>
          )}

          {target.type === 'doctor' && (
            <div className="entity-details-grid">
              <div className="entity-detail-field">
                <span className="entity-detail-label">Doctor ID</span>
                <span className="entity-detail-value">
                  <span className="queue-number-badge">DOC-{target.data.doctorId}</span>
                </span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Employee ID</span>
                <span className="entity-detail-value">EMP-{target.data.employeeId}</span>
              </div>
              <div className="entity-detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="entity-detail-label">Medical Specialization</span>
                <span className="entity-detail-value">
                  <span className="status-chip status-chip--blue">
                    {target.data.specializationName || 'General Medicine'}
                  </span>
                </span>
              </div>
              <div className="entity-detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="entity-detail-label">Clinical Status</span>
                <span className="entity-detail-value">
                  <span className="status-chip status-chip--emerald">Active Physician</span>
                </span>
              </div>
            </div>
          )}

          {target.type === 'employee' && (
            <div className="entity-details-grid">
              <div className="entity-detail-field">
                <span className="entity-detail-label">Employee ID</span>
                <span className="entity-detail-value">
                  <span className="queue-number-badge">EMP-{target.data.employeeId}</span>
                </span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Employment Status</span>
                <span className="entity-detail-value">
                  <span
                    className={`status-chip ${
                      target.data.isActive ? 'status-chip--emerald' : 'status-chip--amber'
                    }`}
                  >
                    {target.data.isActive ? 'Active Staff' : 'Inactive'}
                  </span>
                </span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Clinic Email</span>
                <span className="entity-detail-value">{target.data.email || 'None on record'}</span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Phone</span>
                <span className="entity-detail-value font-mono">{target.data.phone || 'N/A'}</span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Hire Date</span>
                <span className="entity-detail-value">{target.data.hireDate || 'N/A'}</span>
              </div>
              <div className="entity-detail-field">
                <span className="entity-detail-label">Physical Address</span>
                <span className="entity-detail-value">{target.data.address || 'None recorded'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
