import React from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUserPlus, FaExchangeAlt, FaExclamationTriangle, FaClipboardList, FaCog, FaBookmark } from "react-icons/fa";

const Sidebar = () => {
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
        <div className="fw-semibold fs-6 text-center">Administrator</div>
        <div className="small text-white-50">Admin</div>
      </div>
      <hr className="border-light opacity-25" />
      <ul className="nav flex-column mb-auto gap-2">
        <li className="nav-item">
          <Link to="/dashboard" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaTachometerAlt className="sidebar-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/manage-books" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaBook className="sidebar-icon" /> Manage Books
          </Link>
        </li>
        <li>
          <Link to="/book-reservations" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaBookmark className="sidebar-icon" /> Book Reservations
          </Link>
        </li>
        <li>
          <Link to="/manage-registrations" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaUserPlus className="sidebar-icon" /> Manage Registrations
          </Link>
        </li>
        <li>
          <Link to="/book-transactions" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaExchangeAlt className="sidebar-icon" /> Book Transactions
          </Link>
        </li>
        <li>
          <Link to="/manage-penalties" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaExclamationTriangle className="sidebar-icon" /> Manage Penalties
          </Link>
        </li>
        <li>
          <Link to="/activity-logs" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaClipboardList className="sidebar-icon" /> Activity Logs
          </Link>
        </li>
        <li>
          <Link to="/settings" className="sidebar-btn nav-link w-100 text-start d-flex align-items-center gap-2 fw-semibold">
            <FaCog className="sidebar-icon" /> Settings
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
`;
if (!document.head.querySelector('style[data-sidebar-btn]')) {
  sidebarBtnStyle.setAttribute('data-sidebar-btn', 'true');
  document.head.appendChild(sidebarBtnStyle);
}

export default Sidebar;
