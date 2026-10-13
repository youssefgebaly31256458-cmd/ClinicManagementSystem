import React, { useState, useMemo } from 'react';
import { QueueItem, QueueStatus } from '../types';
import { MOCK_QUEUE_ITEMS, INITIAL_METRICS } from '../mockQueueData';
import { SearchIcon } from '../../common/Icons';

export const Direction03Premium: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [items] = useState<QueueItem[]>(MOCK_QUEUE_ITEMS);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeTab === 'waiting' && item.status !== 'Waiting') return false;
      if (activeTab === 'doctor' && item.status !== 'With Doctor') return false;
      if (activeTab === 'completed' && item.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && item.status !== 'Cancelled') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.patientName.toLowerCase().includes(q) ||
          item.patientNameAr.includes(q) ||
          item.patientRef.toLowerCase().includes(q) ||
          item.queueNumber.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'Waiting': return 'badge-waiting';
      case 'With Doctor': return 'badge-doctor';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
    }
  };

  return (
    <div className="dir-premium-container">
      <div className="dir-premium-canvas">
        {/* Executive Header with Clinic Insignia */}
        <header className="prem-header-deck">
          <div className="prem-brand-lockup">
            <div className="prem-clinic-crest" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <div className="prem-title-stack">
              <div className="prem-clinic-label">
                <span>SHFAA CLINICAL WORKSTATION</span>
                <span>·</span>
                <span className="prem-ar-tag">نظام شفاء الطبي</span>
              </div>
              <h1 className="prem-main-title">Daily Patient Queue</h1>
            </div>
          </div>

          <div className="prem-header-actions">
            <button type="button" className="prem-btn-secondary">
              Queue Settings
            </button>
            <button type="button" className="prem-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Check In Patient</span>
            </button>
          </div>
        </header>

        {/* Elevated Telemetry Bar with Refined Depth */}
        <section className="prem-telemetry-bar" aria-label="Clinical Telemetry">
          <div className="prem-stat-cell">
            <div className="prem-stat-header">
              <span className="prem-stat-label">Waiting in Lobby</span>
              <span className="prem-stat-trend">Priority Intake</span>
            </div>
            <div className="prem-stat-val-group">
              <span className="prem-stat-val">{INITIAL_METRICS.waitingPatients}</span>
              <span className="prem-stat-unit">patients</span>
            </div>
          </div>

          <div className="prem-stat-cell">
            <div className="prem-stat-header">
              <span className="prem-stat-label">With Doctor</span>
              <span className="prem-stat-trend">3 Chambers Active</span>
            </div>
            <div className="prem-stat-val-group">
              <span className="prem-stat-val">{INITIAL_METRICS.withDoctor}</span>
              <span className="prem-stat-unit">in consult</span>
            </div>
          </div>

          <div className="prem-stat-cell">
            <div className="prem-stat-header">
              <span className="prem-stat-label">Completed Today</span>
              <span className="prem-stat-trend">Discharged</span>
            </div>
            <div className="prem-stat-val-group">
              <span className="prem-stat-val">{INITIAL_METRICS.completedToday}</span>
              <span className="prem-stat-unit">encounters</span>
            </div>
          </div>

          <div className="prem-stat-cell">
            <div className="prem-stat-header">
              <span className="prem-stat-label">Average Wait Time</span>
              <span className="prem-stat-trend" style={{ color: '#0284c7' }}>Clinical Standard</span>
            </div>
            <div className="prem-stat-val-group">
              <span className="prem-stat-val">{INITIAL_METRICS.averageWaitMinutes}</span>
              <span className="prem-stat-unit">minutes</span>
            </div>
          </div>
        </section>

        {/* Polished Queue Deck */}
        <div className="prem-queue-deck">
          <div className="prem-deck-header">
            {/* Underline Refined Tabs */}
            <nav className="prem-tabs" aria-label="Queue views">
              <button
                type="button"
                className={`prem-tab ${activeTab === 'all' ? 'prem-tab--active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Queue ({items.length})
              </button>
              <button
                type="button"
                className={`prem-tab ${activeTab === 'waiting' ? 'prem-tab--active' : ''}`}
                onClick={() => setActiveTab('waiting')}
              >
                Waiting (4)
              </button>
              <button
                type="button"
                className={`prem-tab ${activeTab === 'doctor' ? 'prem-tab--active' : ''}`}
                onClick={() => setActiveTab('doctor')}
              >
                With Doctor (3)
              </button>
              <button
                type="button"
                className={`prem-tab ${activeTab === 'completed' ? 'prem-tab--active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed (2)
              </button>
              <button
                type="button"
                className={`prem-tab ${activeTab === 'cancelled' ? 'prem-tab--active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled (1)
              </button>
            </nav>

            <div className="prem-deck-tools">
              <div className="prem-search-box">
                <SearchIcon size={16}  />
                <input
                  type="text"
                  className="prem-search-input"
                  placeholder="Filter patient roster..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Filter patient roster"
                />
              </div>
            </div>
          </div>

          {/* Clinical Ledger Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="prem-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '8%' }}>QUEUE #</th>
                  <th scope="col" style={{ width: '32%' }}>PATIENT</th>
                  <th scope="col" style={{ width: '15%' }}>APPOINTMENT</th>
                  <th scope="col" style={{ width: '15%' }}>STATUS</th>
                  <th scope="col" style={{ width: '18%' }}>ATTENDING PHYSICIAN</th>
                  <th scope="col" style={{ width: '12%', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                      No queue records match the active filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className="prem-qbadge">{item.queueNumber}</span>
                      </td>
                      <td>
                        <div className="prem-patient-col">
                          <span className="prem-patient-name">{item.patientName}</span>
                          <span className="prem-patient-meta">
                            <span>{item.patientNameAr}</span>
                            <span>·</span>
                            <span style={{ fontFamily: 'ui-monospace, monospace' }}>{item.patientRef}</span>
                            <span>·</span>
                            <span>{item.chiefComplaint}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.appointmentTime}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Arrived at {item.arrivalTime}
                        </div>
                      </td>
                      <td>
                        <span className={`prem-badge ${getStatusBadge(item.status)}`}>
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.doctorName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.roomNumber} ({item.doctorNameAr})</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="prem-action-btn">
                          {item.status === 'Waiting' ? 'Admit to Room' : 'View Record'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};