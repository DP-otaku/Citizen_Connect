import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getAdminReports, updateReportStatus, getAdminUsers, updateUserRole, deleteUser } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminPanel.css';

const STATUS_CONFIG = {
  PENDING: { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', label: 'Pending' },
  VERIFIED: { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', label: 'Verified' },
  RESOLVED: { color: '#34d399', bg: 'rgba(16,185,129,0.15)', label: 'Resolved' },
  REJECTED: { color: '#f87171', bg: 'rgba(239,68,68,0.15)', label: 'Rejected' },
};

const DISASTER_TYPES = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'CYCLONE', 'LANDSLIDE', 'DROUGHT', 'OTHER'];
const STATUSES = ['PENDING', 'VERIFIED', 'RESOLVED', 'REJECTED'];
const ROLES = ['CITIZEN', 'OFFICER', 'ADMIN'];

export default function AdminPanel() {
  const { user, isAdmin, canManage } = useAuth();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState('REPORTS');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [reportFilter, setReportFilter] = useState('ALL');
  const [disasterFilter, setDisasterFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [isAdmin, canManage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (canManage) {
        const reportsRes = await getAdminReports();
        setReports(reportsRes.data);
      }
      if (isAdmin) {
        const usersRes = await getAdminUsers();
        setUsers(usersRes.data);
      }
    } catch (err) {
      error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    if (!window.confirm(`Change report status to ${newStatus}?`)) return;
    try {
      const res = await updateReportStatus(reportId, newStatus);
      success('Status updated');
      setReports(reports.map(r => r.id === reportId ? res.data : r));
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user.userId) {
      error('You cannot change your own role');
      return;
    }
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      const res = await updateUserRole(userId, newRole);
      success('Role updated');
      setUsers(users.map(u => u.id === userId ? res.data : u));
    } catch (err) {
      error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user.userId) {
      error('You cannot delete yourself');
      return;
    }
    if (!window.confirm('Delete this user and ALL their reports? This cannot be undone.')) return;
    try {
      await deleteUser(userId);
      success('User deleted');
      setUsers(users.filter(u => u.id !== userId));
      const reportsRes = await getAdminReports();
      setReports(reportsRes.data);
    } catch (err) {
      error('Failed to delete user');
    }
  };

  const filteredReports = reports.filter(r => 
    (reportFilter === 'ALL' || r.status === reportFilter) &&
    (disasterFilter === 'ALL' || r.disasterType === disasterFilter)
  );
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullscreen message="Loading admin panel..." />;

  const renderActionButtons = (report) => {
    if (report.status === 'PENDING') {
      return (
        <div className="table-actions">
          <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(report.id, 'VERIFIED')}>Verify</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(report.id, 'REJECTED')}>Reject</button>
        </div>
      );
    }
    if (report.status === 'VERIFIED') {
      return (
        <div className="table-actions">
          <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(report.id, 'RESOLVED')}>Resolve</button>
        </div>
      );
    }
    return <span className="text-muted text-sm">—</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'REPORTS' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('REPORTS')}
          >
            Reports Management
          </button>
          {isAdmin && (
            <button 
              className={`admin-tab ${activeTab === 'USERS' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('USERS')}
            >
              Users Management
            </button>
          )}
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'REPORTS' && (
          <div className="admin-section animate-fade-in">
            <div className="admin-controls">
              <div className="admin-filters">
                <select 
                  className="form-select control-select"
                  value={reportFilter}
                  onChange={(e) => setReportFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                  className="form-select control-select"
                  value={disasterFilter}
                  onChange={(e) => setDisasterFilter(e.target.value)}
                >
                  <option value="ALL">All Disaster Types</option>
                  {DISASTER_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="control-stats">Showing {filteredReports.length} reports</div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Disaster Type</th>
                    <th>Title & Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td className="text-sm text-secondary whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="font-medium">{report.userName}</td>
                      <td>{report.disasterType}</td>
                      <td>
                        <div className="table-title">{report.title}</div>
                        <div className="text-xs text-secondary">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </div>
                      </td>
                      <td>
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
                      </td>
                      <td>{renderActionButtons(report)}</td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">No reports found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && isAdmin && (
          <div className="admin-section animate-fade-in">
            <div className="admin-controls">
              <input 
                type="text" 
                className="form-input search-input" 
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="control-stats">Showing {filteredUsers.length} users</div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Verified</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td className="font-medium">
                        <div className="table-user">
                          <div className="table-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          {u.name} {u.id === user.userId && <span className="text-xs text-muted">(You)</span>}
                        </div>
                      </td>
                      <td className="text-secondary">{u.email}</td>
                      <td>
                        {u.emailVerified ? (
                          <span className="badge badge-resolved">Yes</span>
                        ) : (
                          <span className="badge badge-rejected">No</span>
                        )}
                      </td>
                      <td>
                        <select 
                          className="form-select form-select--sm"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === user.userId}
                          style={{ width: '120px' }}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.userId}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
