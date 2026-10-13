import React, { useState, useMemo } from 'react';
import { QueueItem, QueueStatus } from '../types';
import { MOCK_QUEUE_ITEMS, INITIAL_METRICS } from '../mockQueueData';
import { SearchIcon, QueueIcon } from '../../common/Icons';

export const Direction02SaaS: React.FC = () => {
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

  const getStatusChip = (status: QueueStatus) => {
    switch (status) {
      case 'Waiting': return 'chip-waiting';
      case 'With Doctor': return 'chip-doctor';
      case 'Completed': return 'chip-completed';
      case 'Cancelled': return 'chip-cancelled';
    }
  };

  return (
    <div className="dir-saas-container">
      <div className="dir-saas-canvas">
        {/* Structured Header Card */}
        <header className="saas-header-card">
          <div className="saas-header-left">
            <div className="saas-icon-badge" aria-hidden="true">
              <QueueIcon size={22} />
            </div>
            <div className="saas-title-group">
              <div className="saas-title-row">
                <h1 className="saas-title">Daily Patient Queue</h1>
                <span className="saas-badge-live">
                  <span className="saas-pulse-dot" aria-hidden="true" />
                  <span>Real-time Roster</span>
                </span>
              </div>
              <span className="saas-subtitle">
                Shfaa / شفاء Workstation · Outpatient Clinic Operational Flow
              </span>
            </div>
          </div>

          <div className="saas-header-right">
            <button type="button" className="saas-btn-action">
              Export Roster
            </button>
            <button type="button" className="saas-btn-primary">
              <span>+ Check In Patient</span>
            </button>
          </div>
        </header>

        {/* 4 Modular KPI Cards with Micro-Accents */}
        <section className="saas-metrics-grid" aria-label="Operational Metrics">
          <div className="saas-card">
            <div className="saas-card-accent accent-amber" />
            <div className="saas-card-top">
              <span className="saas-card-label">Waiting Patients</span>
              <span className="saas-kbd-hint">LOBBY</span>
            </div>
            <div className="saas-card-val">{INITIAL_METRICS.waitingPatients}</div>
            <div className="saas-card-meta">
              <span>Next estimated call: ~4 min</span>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-card-accent accent-blue" />
            <div className="saas-card-top">
              <span className="saas-card-label">With Doctor</span>
              <span className="saas-kbd-hint">EXAM</span>
            </div>
            <div className="saas-card-val">{INITIAL_METRICS.withDoctor}</div>
            <div className="saas-card-meta">
              <span>Rooms 102, 104, 108 active</span>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-card-accent accent-emerald" />
            <div className="saas-card-top">
              <span className="saas-card-label">Completed Today</span>
              <span className="saas-kbd-hint">DONE</span>
            </div>
            <div className="saas-card-val">{INITIAL_METRICS.completedToday}</div>
            <div className="saas-card-meta">
              <span>+14 encounters finalized</span>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-card-accent accent-slate" />
            <div className="saas-card-top">
              <span className="saas-card-label">Average Wait Time</span>
              <span className="saas-kbd-hint">KPI</span>
            </div>
            <div className="saas-card-val">{INITIAL_METRICS.averageWaitMinutes} min</div>
            <div className="saas-card-meta">
              <span>Target threshold &lt;20 min</span>
            </div>
          </div>
        </section>

        {/* Workspace Deck: Toolbar + High-Density Table */}
        <div className="saas-workspace-card">
          <div className="saas-toolbar">
            {/* Segmented Control Tabs */}
            <div className="saas-segmented-tabs" role="tablist" aria-label="Filter status">
              <button
                type="button"
                className={`saas-seg-tab ${activeTab === 'all' ? 'saas-seg-tab--active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span>All Queue</span>
                <span className="saas-tab-badge">{items.length}</span>
              </button>
              <button
                type="button"
                className={`saas-seg-tab ${activeTab === 'waiting' ? 'saas-seg-tab--active' : ''}`}
                onClick={() => setActiveTab('waiting')}
              >
                <span>Waiting in Lobby</span>
                <span className="saas-tab-badge">4</span>
              </button>
              <button
                type="button"
                className={`saas-seg-tab ${activeTab === 'doctor' ? 'saas-seg-tab--active' : ''}`}
                onClick={() => setActiveTab('doctor')}
              >
                <span>With Doctor</span>
                <span className="saas-tab-badge">3</span>
              </button>
              <button
                type="button"
                className={`saas-seg-tab ${activeTab === 'completed' ? 'saas-seg-tab--active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                <span>Completed</span>
                <span className="saas-tab-badge">2</span>
              </button>
              <button
                type="button"
                className={`saas-seg-tab ${activeTab === 'cancelled' ? 'saas-seg-tab--active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                <span>Cancelled</span>
                <span className="saas-tab-badge">1</span>
              </button>
            </div>

            {/* Search Input with Keyboard Shortcut hint */}
            <div className="saas-search-group">
              <div className="saas-search-box">
                <SearchIcon size={15}  />
                <input
                  type="text"
                  className="saas-search-input"
                  placeholder="Search patient, phone, or ref..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Filter queue"
                />
                <span className="saas-kbd-hint">/</span>
              </div>
            </div>
          </div>

          {/* High-Density Workstation Table */}
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '8%' }}>QUEUE #</th>
                  <th scope="col" style={{ width: '28%' }}>PATIENT</th>
                  <th scope="col" style={{ width: '16%' }}>APPOINTMENT</th>
                  <th scope="col" style={{ width: '16%' }}>STATUS</th>
                  <th scope="col" style={{ width: '20%' }}>DOCTOR / ROOM</th>
                  <th scope="col" style={{ width: '12%', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                      No patients found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className="saas-qbadge">{item.queueNumber}</span>
                      </td>
                      <td>
                        <div className="saas-pname">
                          {item.patientName} <span style={{ color: '#64748b', fontWeight: 400 }}>({item.patientNameAr})</span>
                        </div>
                        <div className="saas-pcomplaint">
                          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{item.patientRef}</span> · {item.chiefComplaint}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.appointmentTime}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Arrived: {item.arrivalTime}
                        </div>
                      </td>
                      <td>
                        <span className={`saas-chip ${getStatusChip(item.status)}`}>
                          <span>●</span>
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.doctorName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.roomNumber}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="saas-row-btn">
                          {item.status === 'Waiting' ? 'Call Next' : 'Open Chart'}
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