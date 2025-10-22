import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaReceipt, FaSearch, FaFilter, FaCheck, FaBell } from 'react-icons/fa';
import TransactionDetailModal from '../modals/TransactionDetailModal';

const API = import.meta.env.VITE_API_URL;

export default function ManagePenalties() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [penalties, setPenalties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Static placeholder data for now
  const sample = [
    {
      transaction_id: 'tx-1001',
      reference_number: 'REF-20251018-0001',
      item_title: 'Introduction to Algorithms',
      user_name: 'Juan Dela Cruz',
      user_id: 31,
      due_date: '2025-10-18',
      daysOverdue: 4,
      fine: 55.00,
      status: 'overdue',
      receipt_image: null
    },
    {
      transaction_id: 'tx-1002',
      reference_number: 'REF-20251012-0054',
      item_title: 'Research Methods',
      user_name: 'Maria Santos',
      user_id: 42,
      due_date: '2025-10-12',
      daysOverdue: 10,
      fine: 110.00,
      status: 'overdue',
      receipt_image: null
    }
  ];

  useEffect(() => {
    // For now load static sample data. In future, replace with API call to fetch overdue fines
    setLoading(true);
    setTimeout(() => {
      setPenalties(sample);
      setLoading(false);
    }, 250);
  }, []);

  const totalOverdue = penalties.length;
  const totalFines = penalties.reduce((s, p) => s + (p.fine || 0), 0);

  const handleView = (tx) => {
    setSelected(tx);
    setShowDetail(true);
  };

  const handleMarkPaid = (txId) => {
    setPenalties(prev => prev.map(p => p.transaction_id === txId ? { ...p, status: 'paid' } : p));
  };

  const handleSendReminder = (tx) => {
    // placeholder: in real app this would use the websocket client or API
    console.log('Send reminder for', tx.transaction_id);
    // optionally show a small local UI feedback
    alert(`Reminder sent to ${tx.user_name} for ${tx.reference_number}`);
  };

  const filtered = penalties.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return p.status === 'overdue';
    if (filter === 'paid') return p.status === 'paid';
    return true;
  }).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.reference_number || '').toLowerCase().includes(q) || (p.item_title || '').toLowerCase().includes(q) || (p.user_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="container py-4">
      <div className="row mb-3">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <h5 className="mb-0 fw-semibold"><FaExclamationTriangle className="me-2" />Manage Penalties</h5>
          <div className="d-flex gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ minWidth: 320 }}>
              <span className="input-group-text py-1"><FaSearch /></span>
              <input className="form-control form-control-sm" placeholder="Search by reference, item or user" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="btn-group btn-group-sm">
              <button className={`btn btn-outline-secondary ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
              <button className={`btn btn-outline-secondary ${filter === 'overdue' ? 'active' : ''}`} onClick={() => setFilter('overdue')}>Overdue</button>
              <button className={`btn btn-outline-secondary ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>Paid</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Overdue Items</div>
              <div className="h5 mb-0">{totalOverdue}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body p-2">
              <div className="text-muted small">Total Fines</div>
              <div className="h5 mb-0">₱{Number(totalFines).toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body p-2 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Actions</div>
                <div className="small mb-0">Bulk: Send Reminders</div>
              </div>
              <div>
                <button className="btn btn-sm btn-primary" onClick={() => alert('Bulk reminder: placeholder')}><FaBell /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-2">
          <div className="table-responsive">
            <table className="table table-sm align-middle small">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Item</th>
                  <th>User</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Fine</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-3">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-3">No penalties found.</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.transaction_id} className="align-middle">
                      <td className="py-2"><strong className="small">{p.reference_number}</strong></td>
                      <td className="py-2 small">{p.item_title}</td>
                      <td className="py-2 small">{p.user_name}</td>
                      <td className="py-2 small">{new Date(p.due_date).toLocaleDateString()}</td>
                      <td className="py-2 small">{p.daysOverdue}</td>
                      <td className="py-2 small">₱{Number(p.fine || 0).toFixed(2)}</td>
                      <td className="text-end py-2">
                        <div className="d-flex justify-content-end gap-1">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleView(p)} title="View receipt"><FaReceipt /></button>
                          <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(p.transaction_id)} disabled={p.status === 'paid'} title="Mark paid"><FaCheck /></button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleSendReminder(p)} title="Send reminder"><FaBell /></button>
                        </div>
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
