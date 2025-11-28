import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaHistory, FaSearch, FaFilter, FaUser, FaBook, FaCog, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaMoneyBillWave, FaUndo, FaEye, FaSync } from 'react-icons/fa';
import WebSocketClient from '../../api/websocket/websocket-client';
import activityNotifications from '../utils/activityNotifications';
import ActivityToast from '../components/ActivityToast';
import { getAllActivityLogs, getActivityLogStats, markActivityLogRead, markActivityLogsBatch, markAllActivityLogsRead } from '../../api/activity_logs/getActivityLogs';
import authService from '../utils/auth';

export default function ActivityLogs() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ 
    current: 1, 
    total: 0, 
    pages: 1,
    limit: 50,
    offset: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    borrowed: 0,
    returned: 0,
    penalties_paid: 0
  });
  const [toastNotifications, setToastNotifications] = useState([]);

  // WebSocket client
  const [wsClient] = useState(() => new WebSocketClient());

  // Initialize WebSocket and mark all logs as read on mount
  useEffect(() => {
    wsClient.connect();

    // Listen for real-time activity events
    wsClient.on('BOOK_BORROWED', handleNewActivity);
    wsClient.on('BOOK_RETURNED', handleNewActivity);
    wsClient.on('PENALTY_PAID', handleNewActivity);

    // Mark all current logs as read when component mounts
    activityNotifications.markAllAsRead();

    return () => {
      wsClient.off('BOOK_BORROWED', handleNewActivity);
      wsClient.off('BOOK_RETURNED', handleNewActivity);
      wsClient.off('PENALTY_PAID', handleNewActivity);
      wsClient.close();
    };
  }, []);

  // Handle new activity from WebSocket
  const handleNewActivity = useCallback((data) => {
    console.log('📩 New activity received:', data);
    
    // Add to unread notifications
    const newLogId = `ws_${Date.now()}_${data.type}`;
    activityNotifications.addUnread(newLogId);

    // Show toast notification
    const notification = {
      id: newLogId,
      type: data.type,
      message: activityNotifications.formatNotification(data),
      timestamp: new Date()
    };
    
    setToastNotifications(prev => [...prev, notification]);

    // Refresh the logs list
    fetchLogs();
    fetchStats();
  }, []);

  // Remove toast notification
  const removeToast = useCallback((id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Fetch logs from API
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.current, pagination.limit, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const offset = (pagination.current - 1) * pagination.limit;
      const params = {
        limit: pagination.limit,
        offset: offset
      };
      
      if (filter !== 'all') {
        params.action = filter;
      }

      const result = await getAllActivityLogs(params);

      if (result.success) {
        setLogs(result.data.logs || []);
        setPagination(prev => ({
          ...prev,
          total: result.data.pagination.total,
          pages: result.data.pagination.pages
        }));
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getActivityLogStats();

      if (result.success) {
        const byAction = result.data.by_action || [];
        setStats({
          total: result.data.total_activities || 0,
          borrowed: byAction.find(a => a.action === 'BOOK_BORROWED')?.count || 0,
          returned: byAction.find(a => a.action === 'BOOK_RETURNED')?.count || 0,
          penalties_paid: byAction.find(a => a.action === 'PENALTY_PAID')?.count || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BOOK_BORROWED': return <FaBook className="text-primary" />;
      case 'BOOK_RETURNED': return <FaUndo className="text-success" />;
      case 'PENALTY_PAID': return <FaMoneyBillWave className="text-warning" />;
      default: return <FaHistory className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge bg-success">Completed</span>;
      case 'pending': return <span className="badge bg-warning text-dark">Pending</span>;
      case 'failed': return <span className="badge bg-danger">Failed</span>;
      default: return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'BOOK_BORROWED': return <span className="badge" style={{ background: '#3b82f6', color: 'white' }}>Borrowed</span>;
      case 'BOOK_RETURNED': return <span className="badge" style={{ background: '#10b981', color: 'white' }}>Returned</span>;
      case 'PENALTY_PAID': return <span className="badge" style={{ background: '#f59e0b', color: 'white' }}>Penalty Paid</span>;
      default: return <span className="badge bg-secondary">{action}</span>;
    }
  };

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !search || 
        (log.user_name || '').toLowerCase().includes(search.toLowerCase()) || 
        (log.action || '').toLowerCase().includes(search.toLowerCase()) || 
        (log.details || '').toLowerCase().includes(search.toLowerCase());
      
      return matchesSearch;
    });
  }, [logs, search]);

  const formatTimestamp = (timestamp) => {
    try {
      // Handle different timestamp shapes coming from the server:
      // - JS Date objects
      // - ISO strings with timezone
      // - MySQL DATETIME strings like "2025-11-28 02:53:40" (no timezone)
      // For bare MySQL DATETIME strings we assume the value is UTC on the server
      // and append a 'Z' (or convert space to 'T') so the JS Date parser treats
      // it as UTC and toLocaleString converts it to the client local timezone.
      let date;
      if (!timestamp) return '';

      if (typeof timestamp === 'string') {
        // Detect MySQL DATETIME format (YYYY-MM-DD HH:MM:SS...) without 'T' or timezone
        const mysqlDatetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
        if (mysqlDatetimeRegex.test(timestamp) && !/[TtZz+-]/.test(timestamp)) {
          // Convert to ISO by replacing space with 'T' and append 'Z' to mark UTC
          date = new Date(timestamp.replace(' ', 'T') + 'Z');
        } else {
          date = new Date(timestamp);
        }
      } else {
        // If it's already a Date object or number
        date = new Date(timestamp);
      }

      if (Number.isNaN(date.getTime())) return String(timestamp);

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      console.error('formatTimestamp error:', err, timestamp);
      return String(timestamp);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
  };

  // Mark a single log as read (no toggle - user requested explicit mark as read)
  const handleMarkRead = async (log) => {
    try {
      if (log.is_read) return; // already read
      const admin = authService.getUser() || authService.getUserFromToken();
      const adminId = admin?.id || admin?.adminId || null;
      if (!adminId) {
        console.warn('No admin id available to mark read');
      }

      await markActivityLogRead(log.activity_log_id, adminId, true);

      // Update local state
      setLogs(prev => prev.map(l => l.activity_log_id === log.activity_log_id ? { ...l, is_read: 1, read_at: (new Date()).toISOString(), read_by_admin_id: adminId } : l));

      activityNotifications.markAsRead(String(log.activity_log_id));
      window.dispatchEvent(new CustomEvent('activityLogsUpdated'));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkVisibleAsRead = async () => {
    try {
      const admin = authService.getUser() || authService.getUserFromToken();
      const adminId = admin?.id || admin?.adminId || null;
      const ids = filtered.map(l => l.activity_log_id);
      if (ids.length === 0) return;
      await markActivityLogsBatch(ids, adminId, true);
      setLogs(prev => prev.map(l => ids.includes(l.activity_log_id) ? { ...l, is_read: 1, read_at: (new Date()).toISOString(), read_by_admin_id: adminId } : l));
      ids.forEach(id => activityNotifications.markAsRead(String(id)));
      window.dispatchEvent(new CustomEvent('activityLogsUpdated'));
    } catch (err) {
      console.error('Error marking visible logs as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const admin = authService.getUser() || authService.getUserFromToken();
      const adminId = admin?.id || admin?.adminId || null;
      if (!adminId) {
        console.warn('No admin id available to mark all read');
      }

      await markAllActivityLogsRead(adminId);

      // Update local state: mark everything currently loaded as read
      setLogs(prev => prev.map(l => ({ ...l, is_read: 1, read_at: (new Date()).toISOString(), read_by_admin_id: adminId })));
      // Clear notification storage
      activityNotifications.markAllAsRead();
      window.dispatchEvent(new CustomEvent('activityLogsUpdated'));
    } catch (err) {
      console.error('Error marking all logs as read:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  return (
    <div className="container-fluid p-4">
      {/* Toast Notifications */}
      {toastNotifications.map((notification, index) => (
        <div key={notification.id} style={{ top: `${20 + (index * 100)}px` }}>
          <ActivityToast 
            notification={notification} 
            onClose={() => removeToast(notification.id)} 
          />
        </div>
      ))}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold d-flex align-items-center gap-2">
            <FaHistory className="text-primary" />
            Activity Logs
          </h4>
          <p className="text-muted mb-0 small">Monitor system activities | Notifications</p>
        </div>
        <div />
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total Activities</p>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <FaHistory className="text-primary fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Books Borrowed</p>
                  <h3 className="mb-0 fw-bold text-primary">{stats.borrowed}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <FaBook className="text-primary fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Books Returned</p>
                  <h3 className="mb-0 fw-bold text-success">{stats.returned}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <FaUndo className="text-success fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Penalties Paid</p>
                  <h3 className="mb-0 fw-bold text-warning">{stats.penalties_paid}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                  <FaMoneyBillWave className="text-warning fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Controls (actions) */}
      <div className="d-flex justify-content-end align-items-center mb-3 gap-2">
        <button 
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={handleMarkVisibleAsRead}
          disabled={loading || filtered.length === 0}
          title="Mark visible logs as read"
        >
          <FaCheckCircle />
          Mark Visible Read
        </button>
        <button 
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
          onClick={() => {
            if (!logs.some(l => !l.is_read)) return;
            if (!window.confirm('Mark ALL unread activity logs as read? This will affect all records in the database.')) return;
            handleMarkAllRead();
          }}
          disabled={loading || !logs.some(l => !l.is_read)}
          title="Mark all logs as read (all records)"
        >
          <FaCheckCircle />
          Mark All Read
        </button>
        <button 
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FaSync className={loading ? 'fa-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch className="text-muted" />
                </span>
                <input 
                  type="text"
                  className="form-control border-start-0" 
                  placeholder="Search by user, action or details..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'BOOK_BORROWED' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter('BOOK_BORROWED')}
                >
                  <FaBook className="me-1" /> Borrowed
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'BOOK_RETURNED' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter('BOOK_RETURNED')}
                >
                  <FaUndo className="me-1" /> Returned
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'PENALTY_PAID' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter('PENALTY_PAID')}
                >
                  <FaMoneyBillWave className="me-1" /> Penalties
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0" style={{ width: '180px' }}>Timestamp</th>
                  <th className="px-4 py-3 border-0">User</th>
                  <th className="px-4 py-3 border-0" style={{ width: '150px' }}>Action</th>
                  <th className="px-4 py-3 border-0">Details</th>
                  <th className="px-4 py-3 border-0" style={{ width: '100px' }}>Status</th>
                  <th className="px-4 py-3 border-0 text-center" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2 mb-0">Loading activity logs...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <FaInfoCircle className="text-muted fs-1 mb-3" />
                      <p className="text-muted mb-0">No activity logs found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.activity_log_id} className="border-bottom">
                      <td className="px-4 py-3">
                        <small className="text-muted">{formatTimestamp(log.created_at)}</small>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          {getActionIcon(log.action)}
                          <div>
                            <div className="fw-semibold">{log.user_name || 'Unknown User'}</div>
                            <small className="text-muted">{log.position || 'N/A'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-truncate" style={{ maxWidth: '400px' }} title={log.details}>
                          {log.details || 'No details available'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <button 
                            className={`btn btn-sm ${log.is_read ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                            onClick={() => handleMarkRead(log)}
                            title={log.is_read ? 'Already read' : 'Mark as read'}
                            disabled={!!log.is_read}
                          >
                            <FaCheckCircle />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(log)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <div className="text-muted small">
                Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                {pagination.total} activities
              </div>
              <div className="btn-group">
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  disabled={pagination.current === 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                >
                  Previous
                </button>
                <button className="btn btn-sm btn-outline-secondary disabled">
                  Page {pagination.current} of {pagination.pages}
                </button>
                <button 
                  className="btn btn-sm btn-outline-secondary" 
                  disabled={pagination.current >= pagination.pages}
                  onClick={() => handlePageChange(pagination.current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Activity Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Activity ID</label>
                    <div className="fw-semibold">{selectedLog.activity_log_id}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Timestamp</label>
                    <div className="fw-semibold">{formatTimestamp(selectedLog.created_at)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">User</label>
                    <div className="fw-semibold">{selectedLog.user_name || 'Unknown User'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Position</label>
                    <div className="fw-semibold">{selectedLog.position || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Department</label>
                    <div className="fw-semibold">{selectedLog.department_acronym || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Action Type</label>
                    <div>{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">Status</label>
                    <div>{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small mb-1">User ID</label>
                    <div className="fw-semibold">{selectedLog.user_id}</div>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small mb-1">Details</label>
                    <div className="p-3 bg-light rounded">{selectedLog.details || 'No details available'}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}