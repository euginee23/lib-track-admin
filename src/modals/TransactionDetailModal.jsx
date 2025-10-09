import { FaBook, FaUser, FaCalendarAlt, FaBarcode, FaTimes } from "react-icons/fa";

function TransactionDetailModal({ show, onHide, transaction, type = "ongoing" }) {
  if (!transaction || !show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header wmsu-bg-primary text-white">
            <h5 className="modal-title">
              <FaBook className="me-2" />
              Transaction Details
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row g-4">
              {/* Transaction Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Transaction Information</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Transaction ID</label>
                      <p className="mb-1">{transaction.transactionId}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <div>
                        {type === "ongoing" ? (
                          <span className={`badge ${
                            transaction.status === "active" ? "bg-success" :
                            transaction.status === "due_tomorrow" ? "bg-warning" :
                            transaction.status === "due_today" ? "bg-orange text-dark" :
                            "bg-danger"
                          }`}>
                            {transaction.status === "active" ? "Active" :
                             transaction.status === "due_tomorrow" ? "Due Tomorrow" :
                             transaction.status === "due_today" ? "Due Today" :
                             `Overdue (${Math.abs(transaction.daysRemaining)} days)`}
                          </span>
                        ) : (
                          <span className="badge bg-info">Returned</span>
                        )}
                      </div>
                    </div>
                    {type === "ongoing" && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Renewals</label>
                        <p className="mb-1">
                          {transaction.renewalCount} / {transaction.maxRenewals} used
                          {transaction.renewalCount < transaction.maxRenewals && (
                            <span className="text-success ms-2">(Can be renewed)</span>
                          )}
                        </p>
                      </div>
                    )}
                    {type === "history" && transaction.fine > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Fine Amount</label>
                        <p className="mb-1 text-danger fw-bold">₱{transaction.fine.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <FaUser className="me-2" />
                      Student Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Name</label>
                      <p className="mb-1">{transaction.studentName}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Student ID</label>
                      <p className="mb-1">{transaction.studentId}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <p className="mb-1">{transaction.studentEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Information */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <FaBook className="me-2" />
                      Book Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Title</label>
                          <p className="mb-1">{transaction.bookTitle}</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <FaBarcode className="me-1" />
                            ISBN
                          </label>
                          <p className="mb-1">{transaction.bookISBN}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <FaCalendarAlt className="me-2" />
                      Date Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Borrow Date</label>
                          <p className="mb-1">{transaction.borrowDate}</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Due Date</label>
                          <p className="mb-1">{transaction.dueDate}</p>
                        </div>
                      </div>
                      {type === "history" && (
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Return Date</label>
                            <p className="mb-1">{transaction.returnDate}</p>
                          </div>
                        </div>
                      )}
                      {type === "ongoing" && (
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Days Remaining</label>
                            <p className={`mb-1 fw-bold ${
                              transaction.daysRemaining >= 3 ? "text-success" :
                              transaction.daysRemaining >= 1 ? "text-warning" :
                              transaction.daysRemaining >= 0 ? "text-orange" :
                              "text-danger"
                            }`}>
                              {transaction.daysRemaining >= 0 
                                ? `${transaction.daysRemaining} days left`
                                : `${Math.abs(transaction.daysRemaining)} days overdue`
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            {type === "ongoing" && (
              <>
                {transaction.renewalCount < transaction.maxRenewals && (
                  <button type="button" className="btn btn-success">
                    Renew Book
                  </button>
                )}
                <button type="button" className="btn wmsu-btn-primary">
                  Process Return
                </button>
              </>
            )}
            {type === "history" && (
              <button type="button" className="btn wmsu-btn-primary">
                Generate Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailModal;