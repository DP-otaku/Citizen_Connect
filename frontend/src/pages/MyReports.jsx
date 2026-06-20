import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyReports, deleteReport } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { Waves, Flame, Activity, Wind, Mountain, Sun, AlertTriangle, Calendar, MapPin, Inbox } from 'lucide-react';
import './MyReports.css';

const STATUS_CONFIG = {
  PENDING: { color: '#d97706', bg: '#fef3c7', label: 'Pending' },
  VERIFIED: { color: '#2563eb', bg: '#dbeafe', label: 'Verified' },
  RESOLVED: { color: '#059669', bg: '#d1fae5', label: 'Resolved' },
  REJECTED: { color: '#dc2626', bg: '#fee2e2', label: 'Rejected' },
};

const DISASTER_ICONS = {
  FLOOD: <Waves size={20} color="#3b82f6" />, 
  FIRE: <Flame size={20} color="#ef4444" />, 
  EARTHQUAKE: <Activity size={20} color="#8b5cf6" />, 
  CYCLONE: <Wind size={20} color="#06b6d4" />,
  LANDSLIDE: <Mountain size={20} color="#f59e0b" />, 
  DROUGHT: <Sun size={20} color="#f59e0b" />, 
  OTHER: <AlertTriangle size={20} color="#64748b" />,
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getMyReports();
      setReports(res.data);
    } catch (err) {
      error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await deleteReport(id);
      success('Report deleted successfully');
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      error('Failed to delete report');
    }
  };

  const filteredReports = reports
    .filter(r => filter === 'ALL' || r.status === filter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <LoadingSpinner fullscreen message="Loading your reports..." />;

  return (
    <div className="my-reports-page">
      <div className="reports-header">
        <h1 className="reports-title">My Reports</h1>
        <div className="reports-controls">
          <select 
            className="form-select control-select" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            className="form-select control-select" 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-state__icon"><Inbox size={48} color="var(--border-light)" /></div>
          <h3>No Reports Yet</h3>
          <p>You haven't filed any disaster reports.</p>
          <Link to="/reports/new" className="btn btn-primary mt-4">
            File New Report
          </Link>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state glass-card">
          <p>No reports match your current filter.</p>
          <button className="btn btn-secondary mt-2" onClick={() => setFilter('ALL')}>
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map(report => {
            const isExpanded = expandedId === report.id;
            return (
              <div 
                key={report.id} 
                className={`report-card glass-card ${isExpanded ? 'report-card--expanded' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
              >
                <div className="report-card__header">
                  <div className="report-card__type">
                    <span className="report-card__icon">{DISASTER_ICONS[report.disasterType] || <AlertTriangle size={20} />}</span>
                    <span className="report-card__type-label">{report.disasterType}</span>
                  </div>
                  <span 
                    className="badge"
                    style={{ 
                      backgroundColor: STATUS_CONFIG[report.status]?.bg, 
                      color: STATUS_CONFIG[report.status]?.color,
                      border: `1px solid ${STATUS_CONFIG[report.status]?.color}40`
                    }}
                  >
                    {STATUS_CONFIG[report.status]?.label || report.status}
                  </span>
                </div>
                
                <h3 className="report-card__title">{report.title}</h3>
                
                <p className={`report-card__desc ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {report.description}
                </p>

                <div className="report-card__meta">
                  <span className="meta-item">
                    <Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="meta-item">
                    <MapPin size={14} /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </span>
                </div>

                {isExpanded && (
                  <div className="report-card__actions animate-fade-in">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDelete(e, report.id)}
                    >
                      Delete Report
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
