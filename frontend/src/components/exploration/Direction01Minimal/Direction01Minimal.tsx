import React, { useState, useMemo } from 'react';
import { QueueItem, QueueStatus } from '../types';
import { MOCK_QUEUE_ITEMS, INITIAL_METRICS } from '../mockQueueData';
import { SearchIcon } from '../../common/Icons';

export const Direction01Minimal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [items] = useState<QueueItem[]>(MOCK_QUEUE_ITEMS);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Tab filter
      if (activeTab === 'waiting' && item.status !== 'Waiting') return false;
      if (activeTab === 'doctor' && item.status !== 'With Doctor') return false;
      if (activeTab === 'completed' && item.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && item.status !== 'Cancelled') return false;

      // Search filter
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

  const getStatusClass = (status: QueueStatus) => {
    switch (status) {
      case 'Waiting': return 'status-waiting';
      case 'With Doctor': return 'status-doctor';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
    }
  };

  return (
    <div className="dir-minimal-container">
      <div className="dir-minimal-canvas">
        {/* Minimal Header */}
        <header className="min-header">
          <div>
            <div className="min-brand-tag">
              <span>Shfaa</span>
              <span className="min-brand-sep">/</span>
              <span>شفاء</span>
              <span className="min-brand-sep">·</span>
              <span>Clinical Operations</span>
            </div>
            <h1 className="min-title">Daily Patient Queue</h1>
            <p className="min-subtitle">Manage today&rsquo;s patient flow and waiting list.</p>
          </div>

          <div className="min-header-actions">
            <button type="button" className="min-btn-secondary">
              Refresh
            </button>
            <button type="button" className="min-btn-primary">
              <span>+ Check In Patient</span>
            </button>
          </div>
        </header>

        {/* Calm, Open Metrics Strip (Zero heavy box borders) */}
        <section className="min-metrics-strip" aria-label="Queue Metrics">
          <div className="min-metric-item">
            <span className="min-metric-label">Waiting Patients</span>
            <div className="min-metric-val-wrap">
              <span className="min-metric-val">{INITIAL_METRICS.waitingPatients}</span>
              <span className="min-metric-unit">in lobby</span>
            </div>
            <span className="min-metric-sub">Triage priority queue</span>
          </div>

          <div className="min-metric-item">
            <span className="min-metric-label">Currently With Doctor</span>
            <div className="min-metric-val-wrap">
              <span className="min-metric-val">{INITIAL_METRICS.withDoctor}</span>
              <span className="min-metric-unit">active</span>
            </div>
            <span className="min-metric-sub">Across 3 consultation rooms</span>
          </div>

          <div className="min-metric-item">
            <span className="min-metric-label">Completed Today</span>
            <div className="min-metric-val-wrap">
              <span className="min-metric-val">{INITIAL_METRICS.completedToday}</span>
              <span className="min-metric-unit">discharged</span>
            </div>
            <span className="min-metric-sub">Target throughput on track</span>
          </div>

          <div className="min-metric-item">
            <span className="min-metric-label">Average Wait Time</span>
            <div className="min-metric-val-wrap">
              <span className="min-metric-val">{INITIAL_METRICS.averageWaitMinutes}</span>
              <span className="min-metric-unit">min</span>
            </div>
            <span className="min-metric-sub">-4 min compared to yesterday</span>
          </div>
        </section>

        {/* Filter Tabs & Clean Search */}
        <section className="min-controls-row">
          <nav className="min-tabs" aria-label="Queue filter tabs">
            <button
              type="button"
              className={`min-tab ${activeTab === 'all' ? 'min-tab--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Queue ({items.length})
            </button>
            <button
              type="button"
              className={`min-tab ${activeTab === 'waiting' ? 'min-tab--active' : ''}`}
              onClick={() => setActiveTab('waiting')}
            >
              Waiting in Lobby (4)
            </button>
            <button
              type="button"
              className={`min-tab ${activeTab === 'doctor' ? 'min-tab--active' : ''}`}
              onClick={() => setActiveTab('doctor')}
            >
              With Doctor (3)
            </button>
            <button
              type="button"
              className={`min-tab ${activeTab === 'completed' ? 'min-tab--active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed (2)
            </button>
            <button
              type="button"
              className={`min-tab ${activeTab === 'cancelled' ? 'min-tab--active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled (1)
            </button>
          </nav>

          <div className="min-search-wrap">
            <SearchIcon size={16} className="min-search-icon" />
            <input
              type="text"
              className="min-search-input"
              placeholder="Search patient, phone or reference..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Filter queue"
            />
          </div>
        </section>

        {/* Minimal Table */}
        <div className="min-table-wrap">
          <table className="min-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '10%' }}>Queue #</th>
                <th scope="col" style={{ width: '30%' }}>Patient</th>
                <th scope="col" style={{ width: '15%' }}>Appointment</th>
                <th scope="col" style={{ width: '15%' }}>Status</th>
                <th scope="col" style={{ width: '20%' }}>Doctor</th>
                <th scope="col" style={{ width: '10%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="min-qnum">{item.queueNumber}</span>
                    </td>
                    <td>
                      <div className="min-patient-name">
                        <span>{item.patientName}</span>
                        <span className="min-patient-ar">({item.patientNameAr})</span>
                      </div>
                      <div className="min-patient-ref">
                        <span>{item.patientRef}</span> · <span>{item.chiefComplaint}</span>
                      </div>
                    </td>
                    <td>
                      <div className="min-time-primary">{item.appointmentTime}</div>
                      <div className="min-time-wait">
                        {item.waitingMinutes > 0 ? `Wait: ${item.waitingMinutes} min` : 'Completed'}
                      </div>
                    </td>
                    <td>
                      <span className={`min-status-tag ${getStatusClass(item.status)}`}>
                        <span className="min-status-dot" aria-hidden="true" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td>
                      <div className="min-doctor-name">{item.doctorName}</div>
                      <div className="min-room">{item.roomNumber}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="min-action-link">
                        {item.status === 'Waiting' ? 'Call In' : 'Details'}
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
  );
};