import React, { useEffect, useState, useRef } from 'react';
import { FaSyncAlt, FaSearch, FaTimes, FaBook, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import reservationsApi from '../../api/book_reservations/getReservations';
import reservationActions from '../../api/book_reservations/approveReservation';
import WebSocketClient from '../../api/websocket/websocket-client';
import { postUserNotification } from '../../api/notifications/postUserNotification';

/**
 * BookReservations
 * Admin view to manage reservations. This is a presentational redesign
 * that focuses on a clean, professional layout. It uses placeholder data
 * and is ready to be hooked to your admin API.
 */
const BookReservations = () => {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalReservation, setModalReservation] = useState(null);
  const [modalReason, setModalReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const wsRef = useRef(null);

  // Load when component mounts or when filters/pagination change
  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, currentPage, perPage]);

  // Setup websocket connection for notifications
  useEffect(() => {
    try {
      wsRef.current = new WebSocketClient();
      wsRef.current.connect();
    } catch (err) {
      console.error('Failed to init websocket client', err);
    }

    return () => {
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (err) {}
    };
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);

      // include pagination params
      filters.page = currentPage;
      filters.limit = perPage;
      const resp = await reservationsApi.fetchAllReservations(filters);
      // resp may be { success: true, data: [...] } or an array
      const data = resp?.data ?? resp ?? [];
      if (!Array.isArray(data)) {
        setReservations([]);
        setTotalCount(0);
      } else {
        // try to extract total count from response
        const respTotal = resp?.total ?? resp?.count ?? resp?.totalCount ?? resp?.meta?.total;
        if (typeof respTotal === 'number') {
          setTotalCount(respTotal);
        } else {
          // best-effort fallback: if returned array length < perPage, compute total
          if (data.length < perPage) {
            setTotalCount((currentPage - 1) * perPage + data.length);
          } else if (currentPage === 1) {
            // unknown total, at least set to length
            setTotalCount(data.length);
          } else {
            setTotalCount(currentPage * perPage);
          }
        }
        // map fields from API to what UI expects if needed
  setReservations(data.map(item => {
          const rawStatus = (item.status || '').toString();
          let normalizedStatus = rawStatus.toLowerCase();
          if (normalizedStatus === 'ready') normalizedStatus = 'approved';
          if (normalizedStatus.includes('approve')) normalizedStatus = 'approved';
          if (normalizedStatus.includes('reject')) normalizedStatus = 'rejected';
          if (normalizedStatus.includes('cancel')) normalizedStatus = 'cancelled';

          return {
            id: item.reservation_id || item.id || item.reservationId || item._id || item.id,
            title: item.book_title || item.research_title || item.title,
            user: item.user_fullname || item.user_name || (item.user && (item.user.fullname || item.user.name)) || (item.user_id ? `User ${item.user_id}` : 'Unknown'),
            user_id: item.user_id || (item.user && (item.user.id || item.user.user_id)) || item.requested_by || null,
            type: item.reservation_type || item.type || (item.research_paper_id ? 'research_paper' : 'book'),
            status: normalizedStatus || 'pending',
            reservedOn: item.reserved_on || item.updated_at || item.created_at || ''
          };
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reservations.filter(r => {
    if (statusFilter !== 'all') {
      const normalizedStatus = (r.status || '').toLowerCase();
      const normalizedFilter = statusFilter.toLowerCase();
      if (normalizedStatus !== normalizedFilter) return false;
    }
    if (!query) return true;
    const q = query.toLowerCase();
    return (r.title || '').toLowerCase().includes(q) || (r.user || '').toLowerCase().includes(q) || (r.id || '').toLowerCase().includes(q);
  });

  // Approve reservation
  // Open confirm modal for approve
  const handleApprove = (reservationId) => {
    setModalType('approve');
    setModalReservation(reservationId);
    setModalReason('');
    setModalOpen(true);
  };

  // Reject reservation (requires reason)
  // Open confirm modal for reject
  const handleReject = (reservationId) => {
    setModalType('reject');
    setModalReservation(reservationId);
    setModalReason('');
    setModalOpen(true);
  };

  // Cancel/delete reservation
  const handleCancel = async (reservationId) => {
    if (!window.confirm('Cancel this reservation? This action cannot be undone.')) return;
    try {
      await reservationActions.cancelReservation(reservationId);
      toast.success('Reservation cancelled');
      // emit user_notification for the affected user (preferred)
      try {
        const target = reservations.find(r => String(r.id) === String(reservationId));
        const payload = {
          user_id: target?.user_id || null,
          type: 'reservation_cancelled',
          title: 'Reservation Cancelled',
          message: `${target?.title || 'A reservation'} has been cancelled.`,
          reservation_id: reservationId,
          timestamp: new Date().toISOString(),
          priority: 'high'
        };
        wsRef.current?.send?.('user_notification', payload);
          // persist notification to server
          try {
            await postUserNotification({
              user_id: payload.user_id,
              notification_type: 'Reservation Notification',
              notification_message: payload.message
            });
          } catch (err) {
            console.warn('Failed to persist notification (cancel)', err);
          }
      } catch (err) {
        console.warn('Failed to send websocket user_notification (cancel)', err);
      }
      await loadReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel reservation');
    }
  };

  // Perform the action from modal (approve or reject)
  const performModalAction = async () => {
    if (!modalReservation || !modalType) return;
    setActionLoading(true);
    try {
      if (modalType === 'approve') {
        await reservationActions.approveReservation(modalReservation);
        toast.success('Reservation approved');
        // emit user_notification for the affected user (preferred)
        try {
          const target = reservations.find(r => String(r.id) === String(modalReservation));
          const payload = {
            user_id: target?.user_id || null,
            type: 'reservation_approved',
            title: 'Reservation Approved',
            message: `${target?.title || 'A reservation'} has been approved.`,
            reservation_id: modalReservation,
            timestamp: new Date().toISOString(),
            priority: 'high'
          };
          wsRef.current?.send?.('user_notification', payload);
          // persist notification to server
          try {
              await postUserNotification({
                user_id: payload.user_id,
                notification_type: 'Reservation Notification',
                notification_message: payload.message
              });
            } catch (err) {
              console.warn('Failed to persist notification (approve)', err);
            }
        } catch (err) {
          console.warn('Failed to send websocket user_notification (approve)', err);
        }
      } else if (modalType === 'reject') {
        if (!modalReason || !modalReason.trim()) {
          toast.error('Rejection reason is required');
          setActionLoading(false);
          return;
        }
        await reservationActions.rejectReservation(modalReservation, modalReason.trim());
        toast.success('Reservation rejected');
        // emit user_notification for the affected user (preferred)
        try {
          const target = reservations.find(r => String(r.id) === String(modalReservation));
          const payload = {
            user_id: target?.user_id || null,
            type: 'reservation_rejected',
            title: 'Reservation Rejected',
            message: `${target?.title || 'A reservation'} was rejected. Reason: ${modalReason.trim()}`,
            reservation_id: modalReservation,
            timestamp: new Date().toISOString(),
            priority: 'high'
          };
          wsRef.current?.send?.('user_notification', payload);
          // persist notification to server
          try {
              await postUserNotification({
                user_id: payload.user_id,
                notification_type: 'Reservation Notification',
                notification_message: payload.message
              });
            } catch (err) {
              console.warn('Failed to persist notification (reject)', err);
            }
        } catch (err) {
          console.warn('Failed to send websocket user_notification (reject)', err);
        }
      }
      setModalOpen(false);
      setModalReservation(null);
      setModalReason('');
      await loadReservations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'ready':
        return <span className="badge bg-success">Ready</span>;
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{s}</span>;
    }
  };

  const formatDate = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val; // not a parseable date
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return val;
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <style>{`
        .br-header { 
          background: linear-gradient(135deg, #7d1818 0%, #a02020 100%);
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(125, 24, 24, 0.25);
        }
        .br-title {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        .br-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          margin: 0;
        }
        .br-controls {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .br-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
        }
        .br-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          font-size: 16px;
        }
        .br-search-input {
          width: 100%;
          padding: 10px 14px 10px 42px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .br-search-input:focus {
          outline: none;
          border-color: #7d1818;
          box-shadow: 0 0 0 3px rgba(125, 24, 24, 0.1);
        }
        .br-select {
          padding: 10px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          min-width: 160px;
          transition: all 0.2s;
        }
        .br-select:focus {
          outline: none;
          border-color: #7d1818;
          box-shadow: 0 0 0 3px rgba(125, 24, 24, 0.1);
        }
        .br-btn-refresh {
          padding: 10px 16px;
          background: #7d1818;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .br-btn-refresh:hover {
          background: #9a1f1f;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(125, 24, 24, 0.4);
        }
        .br-card { 
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .br-stats-container {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .br-stat-card {
          background: linear-gradient(135deg, #7d1818 0%, #a02020 100%);
          padding: 16px 24px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(125, 24, 24, 0.3);
        }
        .br-stat-number {
          color: #fff;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          margin: 0;
        }
        .br-stat-label {
          color: rgba(255,255,255,0.9);
          font-size: 13px;
          margin: 4px 0 0 0;
        }
        .br-table-wrapper {
          overflow-x: auto;
        }
        .br-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .br-table thead th {
          background: #f8f9fa;
          padding: 14px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        .br-table tbody td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: middle;
        }
        .br-table tbody tr:hover {
          background: #f8f9fa;
        }
        .br-table tbody tr:last-child td {
          border-bottom: none;
        }
        .br-id {
          font-weight: 600;
          color: #7d1818;
        }
        .br-title-cell {
          max-width: 320px;
          font-weight: 500;
          color: #1f2937;
        }
        .br-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 13px;
          color: #4b5563;
        }
        .br-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .br-btn {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .br-btn-approve {
          background: #10b981;
          color: #fff;
        }
        .br-btn-approve:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .br-btn-reject {
          background: #fff;
          color: #ef4444;
          border: 2px solid #ef4444;
        }
        .br-btn-reject:hover {
          background: #ef4444;
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .br-btn[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
          filter: grayscale(10%);
        }
        .br-mobile-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .br-mobile-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        @media (max-width:767px) { 
          .br-table-wrapper { display:none }
          .br-header { padding: 24px 20px; }
          .br-title { font-size: 22px; }
          .br-controls { padding: 16px; }
        }
        @media (min-width:768px) { 
          .br-cards-mobile { display:none }
        }

        /* Modal styles */
        .br-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .br-modal {
          background: #fff;
          width: 520px;
          max-width: 92%;
          border-radius: 10px;
          padding: 18px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        }
        .br-modal-header { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .br-modal-body { margin-bottom: 12px; color: #374151; }
        .br-modal-footer { display:flex; justify-content:flex-end; gap:8px }
        .br-modal-textarea { width:100%; min-height:100px; padding:10px; border:1px solid #e5e7eb; border-radius:6px }
        .br-modal-muted { color:#6b7280; font-size:13px }
      `}</style>

      <div className="br-controls">
        <div className="br-search-wrapper">
          <FaSearch className="br-search-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, title, or user name..."
            className="br-search-input"
          />
        </div>

        <select className="br-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button className="br-btn-refresh" onClick={loadReservations} title="Refresh">
          <FaSyncAlt /> Refresh
        </button>
      </div>

      <div className="br-card">
        <div className="br-stats-container">
          <div className="br-stat-card">
            <p className="br-stat-number">{reservations.length}</p>
            <p className="br-stat-label">Total Reservations</p>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        {/* Confirmation Modal */}
            {modalOpen && (
              <div className="br-modal-overlay" onClick={() => { if(!actionLoading) setModalOpen(false); }}>
                <div className="br-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="br-modal-header">{modalType === 'approve' ? 'Approve Reservation' : 'Reject Reservation'}</div>
                  <div className="br-modal-body">
                    {modalType === 'approve' ? (
                      <>
                        <div className="br-modal-muted">Are you sure you want to approve this reservation?</div>
                      </>
                    ) : (
                      <>
                        <div className="br-modal-muted">Provide a reason for rejecting this reservation:</div>
                        <div style={{ marginTop: 8 }}>
                          <textarea
                            className="br-modal-textarea"
                            value={modalReason}
                            onChange={(e) => setModalReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            disabled={actionLoading}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="br-modal-footer">
                    <button className="br-btn" onClick={() => { if(!actionLoading) { setModalOpen(false); setModalReason(''); } }} disabled={actionLoading} style={{ background:'#fff', border:'1px solid #e5e7eb' }}>Cancel</button>
                    <button className="br-btn br-btn-approve" onClick={performModalAction} disabled={actionLoading}>
                      {actionLoading ? 'Processing...' : (modalType === 'approve' ? 'Approve' : 'Reject')}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading reservations...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No reservations found</div>
            <div style={{ fontSize: '14px' }}>Try adjusting your filters or search query</div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="br-table-wrapper">
              <table className="br-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reserved On</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td className="br-id">{r.id}</td>
                      <td className="br-title-cell">{r.title}</td>
                      <td style={{ color: '#4b5563', fontSize: '14px' }}>{r.user}</td>
                      <td>
                        <span className="br-type-badge">
                          {r.type === 'research_paper' ? (
                            <>
                              <FaFileAlt /> Research
                            </>
                          ) : (
                            <>
                              <FaBook /> Book
                            </>
                          )}
                        </span>
                      </td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>
                        <FaCalendarAlt style={{ marginRight: 6, fontSize: '12px' }} />
                        {formatDate(r.reservedOn)}
                      </td>
                      <td>
                        <div className="br-actions">
                          <button
                            className="br-btn br-btn-reject"
                            onClick={() => (r.status || '').toLowerCase() === 'pending' && handleReject(r.id)}
                            disabled={((r.status || '').toLowerCase() !== 'pending')}
                            title={((r.status || '').toLowerCase() === 'pending') ? 'Reject reservation' : `Actions disabled — status: ${r.status}`}
                          >
                            Reject
                          </button>
                          <button
                            className="br-btn br-btn-approve"
                            onClick={() => (r.status || '').toLowerCase() === 'pending' && handleApprove(r.id)}
                            disabled={((r.status || '').toLowerCase() !== 'pending')}
                            title={((r.status || '').toLowerCase() === 'pending') ? 'Approve reservation' : `Actions disabled — status: ${r.status}`}
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <div style={{ color: '#6b7280', fontSize: 13 }}>
                {totalCount > 0 ? (
                  <>Showing {(totalCount === 0) ? 0 : ((currentPage - 1) * perPage + 1)} to {Math.min(currentPage * perPage, totalCount)} of {totalCount}</>
                ) : (
                  <>Showing 0</>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="br-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  Prev
                </button>
                {/* simple page numbers: show up to 5 pages around current */}
                {(() => {
                  const pages = [];
                  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(totalPages, currentPage + 2);
                  for (let p = start; p <= end; p++) {
                    pages.push(
                      <button key={p} className="br-btn" onClick={() => setCurrentPage(p)} style={{ background: p === currentPage ? '#e6f7f6' : undefined, fontWeight: p === currentPage ? 700 : 600 }}>
                        {p}
                      </button>
                    );
                  }
                  return pages;
                })()}
                <button className="br-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * perPage >= totalCount}>
                  Next
                </button>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ marginLeft: 8 }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="br-cards-mobile">
              {filtered.map(r => (
                <div key={r.id} className="br-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#1f2937', marginBottom: 4 }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {r.user} • <span className="br-id">{r.id}</span>
                      </div>
                    </div>
                    <div>{statusBadge(r.status)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: '13px', color: '#6b7280' }}>
                    <span className="br-type-badge">
                      {r.type === 'research_paper' ? <><FaFileAlt /> Research</> : <><FaBook /> Book</>}
                    </span>
                    <span>•</span>
                    <span><FaCalendarAlt style={{ marginRight: 4 }} />{formatDate(r.reservedOn)}</span>
                  </div>
                  <div className="br-actions">
                    <button
                      className="br-btn br-btn-reject"
                      onClick={() => (r.status || '').toLowerCase() === 'pending' && handleReject(r.id)}
                      disabled={((r.status || '').toLowerCase() !== 'pending')}
                      title={((r.status || '').toLowerCase() === 'pending') ? 'Reject reservation' : `Actions disabled — status: ${r.status}`}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                    <button
                      className="br-btn br-btn-approve"
                      onClick={() => (r.status || '').toLowerCase() === 'pending' && handleApprove(r.id)}
                      disabled={((r.status || '').toLowerCase() !== 'pending')}
                      title={((r.status || '').toLowerCase() === 'pending') ? 'Approve reservation' : `Actions disabled — status: ${r.status}`}
                      style={{ flex: 1 }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookReservations;
