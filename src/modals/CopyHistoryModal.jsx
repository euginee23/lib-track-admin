import React, { useState } from "react";
import { FaTimes, FaHistory, FaUser, FaCalendar, FaClock } from "react-icons/fa";

function CopyHistoryModal({ show, onClose, copyData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // compact

  if (!show || !copyData) return null;

  const { bookDetails, borrowHistory } = copyData;

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(borrowHistory.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = borrowHistory.slice(startIndex, endIndex);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const getDaysBorrowed = (transactionDate, returnDate) => {
    if (!returnDate) return "—";
    const days = Math.floor(
      (new Date(returnDate) - new Date(transactionDate)) / (1000 * 60 * 60 * 24)
    );
    return `${days}d`;
  };

  const isOverdue = (dueDate, returnDate) => {
    if (!returnDate) return false;
    return new Date(returnDate) > new Date(dueDate);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-info text-white py-2">
            <div className="d-flex align-items-center w-100">
              <FaHistory className="me-2" />
              <div className="flex-grow-1">
                <div className="fw-bold small text-uppercase">Borrowing History</div>
                <div className="text-truncate" style={{ maxWidth: 600 }}>{bookDetails?.book_title} (Copy #{bookDetails?.book_number})</div>
              </div>
              <button type="button" className="btn btn-sm btn-outline-light ms-3" onClick={onClose} aria-label="Close">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="modal-body py-3">
            {borrowHistory.length === 0 ? (
              <div className="text-center py-4">
                <FaHistory size={48} className="text-muted mb-2" />
                <div className="text-muted small">This book copy has never been borrowed.</div>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="small text-muted">Total: {borrowHistory.length}</div>
                  <div className="small text-muted">Showing {startIndex + 1}-{Math.min(endIndex, borrowHistory.length)} of {borrowHistory.length}</div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th style={{ width: "4%" }}>#</th>
                        <th>Borrower</th>
                        <th style={{ width: "10%" }}>ID</th>
                        <th style={{ width: "12%" }}>Borrowed</th>
                        <th style={{ width: "10%" }}>Return</th>
                        <th style={{ width: "8%" }}>Days</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {currentHistory.map((transaction, index) => {
                        const idx = startIndex + index + 1;
                        const returned = transaction.return_date !== null;
                        const overdue = isOverdue(transaction.due_date, transaction.return_date);
                        return (
                          <tr key={transaction.transaction_id}>
                            <td className="align-middle">{idx}</td>
                            <td>
                              <div className="fw-semibold">{transaction.first_name} {transaction.last_name}</div>
                              <div className="text-muted small">{transaction.email}</div>
                            </td>
                            <td className="align-middle">{transaction.student_id || '—'}</td>
                            <td className="align-middle">{formatDate(transaction.transaction_date)}</td>
                            <td className="align-middle">
                              {returned ? (
                                <span className={overdue ? 'text-danger fw-bold' : ''}>{formatDate(transaction.return_date)}</span>
                              ) : (
                                <span className="badge bg-warning text-dark small"><FaClock className="me-1" />Not returned</span>
                              )}
                            </td>
                            <td className="align-middle">{getDaysBorrowed(transaction.transaction_date, transaction.return_date)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Prev</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next</button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer py-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}><FaTimes className="me-1" />Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopyHistoryModal;
