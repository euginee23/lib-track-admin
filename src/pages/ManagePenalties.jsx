import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaReceipt, FaSearch, FaFilter, FaCheck, FaBell, FaFileExport, FaEllipsisV, FaFileAlt } from 'react-icons/fa';
import TransactionDetailModal from '../modals/TransactionDetailModal';

const API = import.meta.env.VITE_API_URL;

export default function ManagePenalties() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [penalties, setPenalties] = useState([]);
  const [summary, setSummary] = useState({ total_penalties: 0, total_fines: 0, overdue_count: 0 });
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch penalties from API with automatic cleanup
  const fetchPenalties = async () => {
    setLoading(true);
    try {
      // Automatically cleanup old penalty records first
      await fetch(`${API}/api/penalties/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const [penaltiesRes, summaryRes] = await Promise.all([
        fetch(`${API}/api/penalties`),
        fetch(`${API}/api/penalties/summary`)
      ]);

      if (penaltiesRes.ok) {
        const penaltiesData = await penaltiesRes.json();
        setPenalties(penaltiesData.data?.penalties || []);
      } else {
        console.error('Failed to fetch penalties:', penaltiesRes.status);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data || {});
      }
    } catch (err) {
      console.error('Error fetching penalties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const totalOverdue = summary.overdue_count || 0;
  const totalFines = summary.total_fines || 0;

  const handleView = (tx) => {
    setSelected(tx);
    setShowDetail(true);
  };

  const handleMarkPaid = async (penalty) => {
    if (!window.confirm(`Mark penalty ${penalty.penalty_id} for ${penalty.user_name} as paid?`)) return;
    try {
      const res = await fetch(`${API}/api/penalties/${penalty.penalty_id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'manual', notes: 'Marked as paid from admin' })
      });

      if (res.ok) {
        setPenalties(prev => prev.map(p => p.penalty_id === penalty.penalty_id ? { ...p, status: 'Paid' } : p));
        fetchPenalties();
        alert(`Payment recorded for ${penalty.user_name}`);
      } else {
        const err = await res.text();
        console.error('Mark paid failed:', err);
        alert('Failed to mark as paid');
      }
    } catch (err) {
      console.error('Error marking penalty as paid:', err);
      alert('Error marking penalty as paid');
    }
  };

  const handleSendReminder = (tx) => {
    // placeholder: in real app this would use the websocket client or API
    console.log('Send reminder for', tx.transaction_id);
    alert(`Reminder sent to ${tx.user_name} for ${tx.reference_number}`);
  };

  const exportCSV = () => {
    if (!penalties || penalties.length === 0) return alert('No data to export');
    const headers = ['penalty_id','reference_number','item_title','user_name','due_date','days_overdue','fine','status'];
    const rows = penalties.map(p => headers.map(h => (p[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `penalties_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = penalties.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return p.status !== 'Paid' && (Number(p.days_overdue) || 0) > 0;
    if (filter === 'paid') return p.status === 'Paid';
    return true;
  }).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.reference_number || '').toLowerCase().includes(q) || 
           (p.item_title || '').toLowerCase().includes(q) || 
           (p.user_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Top toolbar */}
      <div className="d-flex gap-3 align-items-center mb-3">
        <div className="input-group shadow-sm" style={{ maxWidth: 640 }}>
          <span className="input-group-text bg-white"><FaSearch /></span>
          <input
            className="form-control form-control-sm"
            placeholder="Search by reference, item or user"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ boxShadow: 'none' }}
          />
          <button className="btn btn-sm btn-success" onClick={() => alert('Generate report function not implemented')}>
            <FaFileAlt className="me-1" /> Generate Report
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <div className="d-flex align-items-center bg-light rounded p-2" style={{ gap: 8 }}>
            <small className="text-muted">Rows</small>
            <select className="form-select form-select-sm" style={{ width: 80 }} value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>

          <div className="d-flex align-items-center bg-light rounded p-2" style={{ gap: 8 }}>
            <small className="text-muted">Filter</small>
            <select className="form-select form-select-sm" style={{ width: 140 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm h-100 border-start border-4 border-danger">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Overdue Items</div>
                <div className="h4 fw-bold">{totalOverdue}</div>
              </div>
              <FaExclamationTriangle className="text-danger" size={28} />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Total Fines</div>
                <div className="h4 fw-bold">₱{Number(totalFines).toFixed(2)}</div>
              </div>
              <FaBell className="text-warning" size={28} />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 d-none d-md-block">
          <div className="card shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small">Actions</div>
                <div className="h6 mb-0">Quick actions</div>
              </div>
              <div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchPenalties()} title="Refresh">
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Penalties table */}
      <div className="card shadow-sm">
        <div className="card-body p-2">
          <div className="table-responsive">
            <table className="table table-hover align-middle table-sm small">
              <thead className="table-light small">
                <tr>
                  <th className="fw-semibold" style={{ width: 160 }}>Reference</th>
                  <th className="fw-semibold">Item</th>
                  <th className="fw-semibold" style={{ width: 220 }}>User</th>
                  <th className="fw-semibold" style={{ width: 120 }}>Due</th>
                  <th className="fw-semibold" style={{ width: 120 }}>Overdue</th>
                  <th className="fw-semibold" style={{ width: 120 }}>Fine</th>
                  <th className="fw-semibold text-end" style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 small text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Loading penalties...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No penalties found.</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.penalty_id} style={{ background: '#fff' }}>
                      <td>
                        <div className="fw-medium">{p.reference_number || p.transaction_id}</div>
                        <div className="text-muted small">#{p.penalty_id}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="fw-medium">{p.item_title}</div>
                          <small className="text-muted">{(p.book_title ? 'Book' : (p.research_title ? 'Research Paper' : (p.transaction_type || 'Borrow')))}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{p.user_name}</div>
                        <div className="text-muted small">{p.position || ''} {p.department_acronym ? `• ${p.department_acronym}` : ''}</div>
                      </td>
                      <td>{p.due_date ? new Date(p.due_date).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {p.status === 'Paid' && (
                            <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Paid</span>
                          )}
                          <span className={`badge ${Number(p.days_overdue) > 0 ? 'bg-danger' : 'bg-secondary'}`}>{p.days_overdue ?? 0} days</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>₱{Number(p.fine || 0).toFixed(2)}</span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleMarkPaid(p)}
                          disabled={p.status === 'Paid'}
                          title={p.status === 'Paid' ? 'Already paid' : 'Mark as paid'}
                        >
                          <FaCheck className="me-1" />
                          <span className="d-none d-md-inline">Mark as Paid</span>
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

      {showDetail && selected && (
        <TransactionDetailModal
          show={showDetail}
          onHide={() => setShowDetail(false)}
          transaction={selected}
          type={'ongoing'}
        />
      )}
    </div>
  );
}
