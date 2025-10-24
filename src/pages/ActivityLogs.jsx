import React, { useEffect, useState } from 'react';
import { FaHistory, FaSearch, FaFilter, FaUser, FaBook, FaCog, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

export default function ActivityLogs() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 0, pages: 1 });

  // Static sample data for now (replace with API call later)
  const sampleLogs = [
    {
      id: 1,
      timestamp: '2025-10-22 14:30:15',
      user_name: 'Juan Dela Cruz',
      user_type: 'Student',
      action: 'Book Borrowed',
      details: 'Borrowed "Introduction to Algorithms" (REF-20251022-001)',
      category: 'transaction',
      ip_address: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      timestamp: '2025-10-22 14:25:30',
      user_name: 'Admin User',
      user_type: 'Admin',
      action: 'User Registration Approved',
      details: 'Approved registration for Maria Santos (ID: 1321-3234)',
      category: 'admin',
      ip_address: '192.168.1.10',
      status: 'success'
    },
    {
      id: 3,
      timestamp: '2025-10-22 14:20:45',
      user_name: 'Pedro Garcia',
      user_type: 'Faculty',
      action: 'Login Attempt',
      details: 'Failed login attempt - Invalid credentials',
      category: 'auth',
      ip_address: '192.168.1.105',
      status: 'error'
    },
    {
      id: 4,
      timestamp: '2025-10-22 14:15:12',
      user_name: 'System',
      user_type: 'System',
      action: 'Fine Calculation',
      details: 'Calculated overdue fines for 5 transactions',
      category: 'system',
      ip_address: 'localhost',
      status: 'info'
    },
    {
      id: 5,
      timestamp: '2025-10-22 14:10:00',
      user_name: 'Anna Lopez',
      user_type: 'Student',
      action: 'Book Returned',
      details: 'Returned "Research Methods" (REF-20251015-045) - 2 days overdue',
      category: 'transaction',
      ip_address: '192.168.1.150',
      status: 'warning'
    },
    {
      id: 6,
      timestamp: '2025-10-22 14:05:30',
      user_name: 'Dr. Smith',
      user_type: 'Faculty',
      action: 'Research Paper Added',
      details: 'Added new research paper "Machine Learning Applications"',
      category: 'content',
      ip_address: '192.168.1.200',
      status: 'success'
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, [pagination.current, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        setLogs(sampleLogs);
        setPagination(prev => ({ ...prev, total: sampleLogs.length, pages: 1 }));
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setLoading(false);
    }
  };

  const getActionIcon = (category) => {
    switch (category) {
      case 'transaction': return <FaBook className="text-primary" />;
      case 'admin': return <FaCog className="text-info" />;
      case 'auth': return <FaUser className="text-warning" />;
      case 'system': return <FaInfoCircle className="text-secondary" />;
      case 'content': return <FaCheckCircle className="text-success" />;
      default: return <FaHistory className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <span className="badge bg-success">Success</span>;
      case 'error': return <span className="badge bg-danger">Error</span>;
      case 'warning': return <span className="badge bg-warning text-dark">Warning</span>;
      case 'info': return <span className="badge bg-info text-dark">Info</span>;
      default: return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const filtered = logs.filter(log => {
    if (filter === 'all') return true;
    return log.category === filter;
  }).filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (log.user_name || '').toLowerCase().includes(q) || 
           (log.action || '').toLowerCase().includes(q) || 
           (log.details || '').toLowerCase().includes(q);
  });

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-3">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-semibold"><FaHistory className="me-2" />Activity Logs</h5>
          <div className="d-flex gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ minWidth: 300 }}>
              <span className="input-group-text py-1"><FaSearch /></span>
              <input 
                className="form-control form-control-sm" 
                placeholder="Search by user, action or details" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <div className="btn-group btn-group-sm">
              <button className={`btn btn-outline-secondary ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`btn btn-outline-secondary ${filter === 'transaction' ? 'active' : ''}`} onClick={() => setFilter('transaction')}>Transactions</button>
              <button className={`btn btn-outline-secondary ${filter === 'admin' ? 'active' : ''}`} onClick={() => setFilter('admin')}>Admin</button>
              <button className={`btn btn-outline-secondary ${filter === 'auth' ? 'active' : ''}`} onClick={() => setFilter('auth')}>Auth</button>
              <button className={`btn btn-outline-secondary ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>System</button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Total Activities</div>
              <div className="h5 mb-0">{logs.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Transactions</div>
              <div className="h5 mb-0">{logs.filter(l => l.category === 'transaction').length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Failed Actions</div>
              <div className="h5 mb-0 text-danger">{logs.filter(l => l.status === 'error').length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Active Users</div>
              <div className="h5 mb-0">{new Set(logs.map(l => l.user_name)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="card">
        <div className="card-body p-2">
          <div className="table-responsive">
            <table className="table table-sm align-middle small">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '100px' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-3">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-3">No activity logs found.</td></tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="align-middle">
                      <td className="py-2 small text-muted">{formatTimestamp(log.timestamp)}</td>
                      <td className="py-2">
                        <div className="d-flex align-items-center gap-2">
                          {getActionIcon(log.category)}
                          <div>
                            <div className="fw-semibold small">{log.user_name}</div>
                            <small className="text-muted">{log.user_type}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 small fw-semibold">{log.action}</td>
                      <td className="py-2 small text-muted" style={{ maxWidth: '300px' }}>
                        <div className="text-truncate" title={log.details}>
                          {log.details}
                        </div>
                      </td>
                      <td className="py-2">{getStatusBadge(log.status)}</td>
                      <td className="py-2 small text-muted">{log.ip_address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing {filtered.length} of {logs.length} activities
              </small>
              <div className="btn-group btn-group-sm">
                <button 
                  className="btn btn-outline-secondary" 
                  disabled={pagination.current === 1}
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                >
                  Previous
                </button>
                <button className="btn btn-outline-secondary disabled">
                  Page {pagination.current} of {pagination.pages}
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  disabled={pagination.current === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}