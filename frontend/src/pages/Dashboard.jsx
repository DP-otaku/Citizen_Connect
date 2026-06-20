import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyReports, getAdminReports, getAdminUsers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Waves, Flame, Activity, Wind, Mountain, Sun, AlertTriangle, FilePlus, ClipboardList, LayoutDashboard, Clock, CheckCircle, Target, Users, Inbox, MapPin } from 'lucide-react';
import './Dashboard.css';

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

export default function Dashboard() {
  const { user, canManage, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (canManage) {
          const [reportsRes, usersRes] = await Promise.all([
            getAdminReports(),
            isAdmin ? getAdminUsers() : Promise.resolve({ data: [] }),
          ]);
          setReports(reportsRes.data);
          setUsers(usersRes.data);
        } else {
          const res = await getMyReports();
          setReports(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canManage, isAdmin]);

  if (loading) return <LoadingSpinner fullscreen message="Loading dashboard..." />;

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    verified: reports.filter((r) => r.status === 'VERIFIED').length,
    resolved: reports.filter((r) => r.status === 'RESOLVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
  };

  const recentReports = reports.slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            {canManage ? 'Admin Dashboard' : `Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
          </h1>
          <p className="dashboard__date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon"><LayoutDashboard size={28} color="var(--color-primary)" /></div>
          <div className="stat-card__info">
            <span className="stat-card__number">{stats.total}</span>
            <span className="stat-card__label">Total Reports</span>
          </div>
        </div>
        <div className="stat-card stat-card--pending">
          <div className="stat-card__icon"><Clock size={28} color="#d97706" /></div>
          <div className="stat-card__info">
            <span className="stat-card__number">{stats.pending}</span>
            <span className="stat-card__label">Pending</span>
          </div>
        </div>
        <div className="stat-card stat-card--verified">
          <div className="stat-card__icon"><CheckCircle size={28} color="#2563eb" /></div>
          <div className="stat-card__info">
            <span className="stat-card__number">{stats.verified}</span>
            <span className="stat-card__label">Verified</span>
          </div>
        </div>
        <div className="stat-card stat-card--resolved">
          <div className="stat-card__icon"><Target size={28} color="#059669" /></div>
          <div className="stat-card__info">
            <span className="stat-card__number">{stats.resolved}</span>
            <span className="stat-card__label">Resolved</span>
          </div>
        </div>
        {canManage && (
          <div className="stat-card stat-card--users">
            <div className="stat-card__icon"><Users size={28} color="#4f46e5" /></div>
            <div className="stat-card__info">
              <span className="stat-card__number">{users.length}</span>
              <span className="stat-card__label">Total Users</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard__actions">
        {!canManage && (
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/reports/new')}>
            <FilePlus size={18} /> File New Report
          </button>
        )}
        <button className="btn btn-secondary btn-lg" onClick={() => navigate(canManage ? '/admin' : '/reports')}>
          <ClipboardList size={18} /> {canManage ? 'Manage Reports' : 'View My Reports'}
        </button>
      </div>

      {/* Status Breakdown Bar (Admin) */}
      {canManage && stats.total > 0 && (
        <div className="dashboard__chart glass-card">
          <h3>Reports by Status</h3>
          <div className="status-bar-chart">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = stats[key.toLowerCase()] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={key} className="status-bar-chart__item">
                  <div className="status-bar-chart__label">
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="status-bar-chart__track">
                    <div
                      className="status-bar-chart__fill"
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="dashboard__recent glass-card">
        <h3>Recent Reports</h3>
        {recentReports.length === 0 ? (
          <div className="dashboard__empty">
            <span className="dashboard__empty-icon"><Inbox size={48} color="var(--border-light)" /></span>
            <p>No reports yet. {!canManage && 'File your first report!'}</p>
          </div>
        ) : (
          <div className="recent-reports">
            {recentReports.map((report) => (
              <div key={report.id} className="recent-report">
                <span className="recent-report__icon">
                  {DISASTER_ICONS[report.disasterType] || <AlertTriangle size={20} />}
                </span>
                <div className="recent-report__info">
                  <span className="recent-report__title">{report.title}</span>
                  <span className="recent-report__meta">
                    {report.disasterType} • {formatDate(report.createdAt)}
                    {canManage && report.userName && ` • by ${report.userName}`}
                  </span>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: STATUS_CONFIG[report.status]?.bg,
                    color: STATUS_CONFIG[report.status]?.color,
                    border: `1px solid ${STATUS_CONFIG[report.status]?.color}40`,
                  }}
                >
                  {STATUS_CONFIG[report.status]?.label || report.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
