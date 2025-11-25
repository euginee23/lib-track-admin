import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUserPlus, FaExchangeAlt, FaExclamationTriangle, FaClipboardList, FaCog, FaBookmark, FaUserShield } from "react-icons/fa";
import activityNotifications from '../utils/activityNotifications';
import authService from '../utils/auth';

const Sidebar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUser, setAdminUser] = useState(null);
  const location = useLocation();

  // Load admin user on mount
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setAdminUser(user);
    }
  }, []);

  // Get permissions (default all true if not available)
  const permissions = adminUser?.permissions || {
    dashboard: true,
    manageBooks: true,
    bookReservations: true,
    manageRegistrations: true,
    bookTransactions: true,
    managePenalties: true,
    activityLogs: true,
    settings: true,
    manageAdministrators: true
  };

  // Update unread count on mount and when storage changes
  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(activityNotifications.getUnreadCount());
    };

    // Initial load
    updateUnreadCount();

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', updateUnreadCount);
    
    // Listen for custom event when logs are updated
    window.addEventListener('activityLogsUpdated', updateUnreadCount);

    // Check every 2 seconds for updates
    const interval = setInterval(updateUnreadCount, 2000);

    return () => {
      window.removeEventListener('storage', updateUnreadCount);
      window.removeEventListener('activityLogsUpdated', updateUnreadCount);
      clearInterval(interval);
    };
  }, []);

  // Clear unread count when visiting activity logs page
  useEffect(() => {
    if (location.pathname === '/activity-logs') {
      activityNotifications.markAllAsRead();
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <aside
      className="d-flex flex-column flex-shrink-0 p-3 border-end"
      style={{
        width: 250,
        minHeight: '100vh',
        color: '#fff',
        background: '#23272f',
        borderRight: '2px solid #e5e7eb'
      }}
    >
      {/* User Info */}
      <hr className="border-light opacity-25" />
      <div className="d-flex flex-column align-items-center mb-4">
        <img
          src="/avatar-default.png"
          alt="Profile"
          className="rounded-circle mb-2 border border-2"
          style={{ width: 80, height: 80, objectFit: 'cover', background: '#fff' }}
        />
        <div className="fw-semibold fs-6 text-center">
          {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Administrator'}
        </div>
        <div className="small text-white-50">{adminUser?.role || 'Admin'}</div>
      </div>
      <hr className="border-light opacity-25" />
      <ul className="nav flex-column mb-auto gap-2">
        <li className="nav-item">
          <Link 
            to="/dashboard" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.dashboard ? 'disabled' : ''}`}
            style={!permissions.dashboard ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaTachometerAlt className="sidebar-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/manage-books" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.manageBooks ? 'disabled' : ''}`}
            style={!permissions.manageBooks ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaBook className="sidebar-icon" /> Manage Books
          </Link>
        </li>
        <li>
          <Link 
            to="/book-reservations" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.bookReservations ? 'disabled' : ''}`}
            style={!permissions.bookReservations ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaBookmark className="sidebar-icon" /> Book Reservations
          </Link>
        </li>
        <li>
          <Link 
            to="/manage-registrations" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.manageRegistrations ? 'disabled' : ''}`}
            style={!permissions.manageRegistrations ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaUserPlus className="sidebar-icon" /> Manage Registrations
          </Link>
        </li>
        <li>
          <Link 
            to="/book-transactions" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.bookTransactions ? 'disabled' : ''}`}
            style={!permissions.bookTransactions ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaExchangeAlt className="sidebar-icon" /> Book Transactions
          </Link>
        </li>
        <li>
          <Link 
            to="/manage-penalties" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.managePenalties ? 'disabled' : ''}`}
            style={!permissions.managePenalties ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaExclamationTriangle className="sidebar-icon" /> Manage Penalties
          </Link>
        </li>
        <li>
          <Link
            to="/activity-logs"
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.activityLogs ? 'disabled' : ''}`}
            style={!permissions.activityLogs ? { position: 'relative', opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : { position: 'relative' }}
          >
            {/* Notification badge on upper-left */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                left: 8,
                minWidth: 20,
                height: 20,
                padding: '0 6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ef4444',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 9999,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                lineHeight: 1,
                zIndex: 5,
                animation: 'pulse 2s infinite'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            <FaClipboardList className="sidebar-icon" /> Activity Logs
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.settings ? 'disabled' : ''}`}
            style={!permissions.settings ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaCog className="sidebar-icon" /> Settings
          </Link>
        </li>
        <li>
          <Link 
            to="/manage-administrators" 
            className={`sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold ${!permissions.manageAdministrators ? 'disabled' : ''}`}
            style={!permissions.manageAdministrators ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          >
            <FaUserShield className="sidebar-icon" /> Manage Admins
          </Link>
        </li>
      </ul>
    </aside>
  );
};


// STYLES
const sidebarBtnStyle = document.createElement('style');
sidebarBtnStyle.innerHTML = `
  .sidebar-btn {
    background: rgba(255,255,255,0.08);
    color: #fff;
    border: none;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    margin-bottom: 2px;
    font-size: 0.90rem;
    padding: 0.65rem 1rem;
  }
  .sidebar-btn:hover, .sidebar-btn.active {
    background: #880000;
    color: #fff;
    text-decoration: none;
  }
  .sidebar-icon {
    font-size: 1.2em;
    color: #fbbf24;
  }
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
`;
if (!document.head.querySelector('style[data-sidebar-btn]')) {
  sidebarBtnStyle.setAttribute('data-sidebar-btn', 'true');
  document.head.appendChild(sidebarBtnStyle);
}

export default Sidebar;
