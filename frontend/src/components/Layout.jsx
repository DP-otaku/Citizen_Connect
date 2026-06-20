import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FilePlus, ClipboardList, Bot, Settings, Shield, LogOut, Menu } from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/reports/new', label: 'New Report', icon: <FilePlus size={20} /> },
  { path: '/reports', label: 'My Reports', icon: <ClipboardList size={20} />, exact: true },
  { path: '/ai', label: 'Ask AI', icon: <Bot size={20} /> },
  { path: '/admin', label: 'Admin Panel', icon: <Settings size={20} />, adminOnly: true },
];

export default function Layout({ children }) {
  const { user, logout, canManage } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const filteredNav = navItems.filter(
    (item) => !item.adminOnly || canManage
  );

  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'OFFICER') return 'Officer';
    return 'Citizen';
  };

  return (
    <div className="layout">
      {isMobile && sidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`layout__sidebar ${sidebarOpen ? 'layout__sidebar--open' : ''}`}
      >
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon"><Shield size={28} color="var(--color-primary)" /></span>
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-title">Citizen Connect</span>
              <span className="sidebar__logo-sub">Disaster Response</span>
            </div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {filteredNav.map((item) => (
              <li key={item.path} className="sidebar__nav-item">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                  }
                >
                  <span className="sidebar__nav-icon">{item.icon}</span>
                  <span className="sidebar__nav-label">{item.label}</span>
                  <span className="sidebar__nav-indicator" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name || 'User'}</span>
              <span className="sidebar__user-role">
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={logout} title="Logout">
            <span className="sidebar__logout-icon"><LogOut size={16} /></span>
            <span className="sidebar__logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="layout__main">
        <header className="layout__header">
          {isMobile && (
            <button
              className="layout__hamburger"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Menu size={24} color="var(--text-primary)" />
            </button>
          )}
          <div className="layout__header-title">
            {navItems.find((i) => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
          </div>
          <div className="layout__header-right">
            <div className="layout__header-greeting">
              Welcome, <strong>{user?.name?.split(' ')[0] || 'User'}</strong>
            </div>
          </div>
        </header>

        <main className="layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}
