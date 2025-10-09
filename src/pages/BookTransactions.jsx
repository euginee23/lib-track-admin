import { useState, useEffect } from "react";
import {
  FaBook,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaBell,
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaFileAlt,
} from "react-icons/fa";
import TransactionDetailModal from "../modals/TransactionDetailModal";

function BookTransactions() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalType, setModalType] = useState("ongoing");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  // Mock data for ongoing transactions
  const ongoingTransactions = [
    {
      id: 1,
      transactionId: "TXN-2025-001",
      studentId: "2021-123456",
      studentName: "John Doe",
      studentEmail: "john.doe@wmsu.edu.ph",
      bookTitle: "Introduction to Computer Science",
      bookISBN: "978-0123456789",
      borrowDate: "2025-09-15",
      dueDate: "2025-10-15",
      status: "active",
      daysRemaining: 13,
      renewalCount: 0,
      maxRenewals: 2,
    },
    {
      id: 2,
      transactionId: "TXN-2025-002",
      studentId: "2021-789012",
      studentName: "Jane Smith",
      studentEmail: "jane.smith@wmsu.edu.ph",
      bookTitle: "Advanced Mathematics",
      bookISBN: "978-0987654321",
      borrowDate: "2025-09-20",
      dueDate: "2025-10-03",
      status: "due_tomorrow",
      daysRemaining: 1,
      renewalCount: 1,
      maxRenewals: 2,
    },
    {
      id: 3,
      transactionId: "TXN-2025-003",
      studentId: "2021-345678",
      studentName: "Michael Johnson",
      studentEmail: "michael.johnson@wmsu.edu.ph",
      bookTitle: "Database Management Systems",
      bookISBN: "978-0456789123",
      borrowDate: "2025-08-25",
      dueDate: "2025-10-02",
      status: "due_today",
      daysRemaining: 0,
      renewalCount: 0,
      maxRenewals: 2,
    },
    {
      id: 4,
      transactionId: "TXN-2025-004",
      studentId: "2021-901234",
      studentName: "Sarah Brown",
      studentEmail: "sarah.brown@wmsu.edu.ph",
      bookTitle: "Software Engineering Principles",
      bookISBN: "978-0789012345",
      borrowDate: "2025-08-20",
      dueDate: "2025-09-30",
      status: "overdue",
      daysRemaining: -2,
      renewalCount: 2,
      maxRenewals: 2,
    },
  ];

  // Mock data for transaction history
  const transactionHistory = [
    {
      id: 1,
      transactionId: "TXN-2025-H001",
      studentId: "2021-111222",
      studentName: "Alice Wilson",
      studentEmail: "alice.wilson@wmsu.edu.ph",
      bookTitle: "Data Structures and Algorithms",
      bookISBN: "978-0111222333",
      borrowDate: "2025-08-01",
      returnDate: "2025-08-28",
      dueDate: "2025-08-30",
      status: "returned",
      returnStatus: "on_time",
      fine: 0,
    },
    {
      id: 2,
      transactionId: "TXN-2025-H002",
      studentId: "2021-333444",
      studentName: "Bob Davis",
      studentEmail: "bob.davis@wmsu.edu.ph",
      bookTitle: "Operating Systems Concepts",
      bookISBN: "978-0333444555",
      borrowDate: "2025-07-15",
      returnDate: "2025-08-20",
      dueDate: "2025-08-15",
      status: "returned",
      returnStatus: "late",
      fine: 25.0,
    },
  ];

  // Mock data for overdue notifications
  const overdueNotifications = [
    {
      id: 1,
      type: "overdue",
      studentName: "Sarah Brown",
      studentEmail: "sarah.brown@wmsu.edu.ph",
      bookTitle: "Software Engineering Principles",
      daysOverdue: 2,
      lastNotified: "2025-10-01",
      totalNotifications: 3,
    },
    {
      id: 2,
      type: "due_today",
      studentName: "Michael Johnson",
      studentEmail: "michael.johnson@wmsu.edu.ph",
      bookTitle: "Database Management Systems",
      daysOverdue: 0,
      lastNotified: "2025-10-02",
      totalNotifications: 1,
    },
    {
      id: 3,
      type: "due_tomorrow",
      studentName: "Jane Smith",
      studentEmail: "jane.smith@wmsu.edu.ph",
      bookTitle: "Advanced Mathematics",
      daysOverdue: -1,
      lastNotified: "2025-10-01",
      totalNotifications: 1,
    },
  ];

  const getStatusBadge = (status, daysRemaining) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Active</span>;
      case "due_tomorrow":
        return <span className="badge bg-warning">Due Tomorrow</span>;
      case "due_today":
        return <span className="badge bg-orange text-dark">Due Today</span>;
      case "overdue":
        return (
          <span className="badge bg-danger">
            Overdue ({Math.abs(daysRemaining)} days)
          </span>
        );
      case "returned":
        return <span className="badge bg-info">Returned</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getReturnStatusBadge = (returnStatus, fine) => {
    switch (returnStatus) {
      case "on_time":
        return <span className="badge bg-success">On Time</span>;
      case "late":
        return <span className="badge bg-warning">Late (₱{fine})</span>;
      default:
        return <span className="badge bg-secondary">-</span>;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case "overdue":
        return <span className="badge bg-danger">Overdue</span>;
      case "due_today":
        return <span className="badge bg-warning">Due Today</span>;
      case "due_tomorrow":
        return <span className="badge bg-info">Due Tomorrow</span>;
      default:
        return <span className="badge bg-secondary">-</span>;
    }
  };

  const filteredOngoingTransactions = ongoingTransactions.filter(
    (transaction) => {
      const matchesSearch =
        transaction.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.bookTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.transactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || transaction.status === filterStatus;

      return matchesSearch && matchesFilter;
    }
  );

  const filteredHistory = transactionHistory.filter((transaction) => {
    return (
      transaction.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewTransaction = (transaction, type) => {
    setSelectedTransaction(transaction);
    setModalType(type);
    setShowDetailModal(true);
  };

  const handleSelectTransaction = (id) => {
    setSelectedTransactions((prev) =>
      prev.includes(id)
        ? prev.filter((transactionId) => transactionId !== id)
        : [...prev, id]
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "ongoing":
        return filteredOngoingTransactions;
      case "history":
        return filteredHistory;
      case "notifications":
        return overdueNotifications;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const paginatedData = currentData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(currentData.length / rowsPerPage);

  // Reset current page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterStatus, rowsPerPage]);

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Header with Statistics Cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBook className="text-primary mb-2" size={24} />
            <h6 className="mb-1">Active Loans</h6>
            <p className="fw-bold mb-0 text-primary fs-4">
              {ongoingTransactions.length}
            </p>
            <small className="text-muted">Currently borrowed</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaExclamationTriangle className="text-danger mb-2" size={24} />
            <h6 className="mb-1">Overdue Books</h6>
            <p className="fw-bold mb-0 text-danger fs-4">
              {ongoingTransactions.filter((t) => t.status === "overdue").length}
            </p>
            <small className="text-muted">Need attention</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaClock className="text-warning mb-2" size={24} />
            <h6 className="mb-1">Due Today</h6>
            <p className="fw-bold mb-0 text-warning fs-4">
              {
                ongoingTransactions.filter((t) => t.status === "due_today")
                  .length
              }
            </p>
            <small className="text-muted">Due today</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaCheckCircle className="text-success mb-2" size={24} />
            <h6 className="mb-1">Returned This Month</h6>
            <p className="fw-bold mb-0 text-success fs-4">
              {transactionHistory.length}
            </p>
            <small className="text-muted">Successfully returned</small>
          </div>
        </div>
      </div>

      {/* Search + Controls */}
      <div className="card mb-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Search input with icon */}
          <div className="input-group" style={{ width: "500px" }}>
            <span className="input-group-text p-1 bg-white">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>
          <div
            className="vr mx-2"
            style={{ height: "30px", width: "1px", backgroundColor: "#ccc" }}
          ></div>

          <button
            className="btn btn-sm btn-primary"
            style={{ backgroundColor: "#17a2b8", borderColor: "#17a2b8" }}
            onClick={() =>
              alert("Generate report function hasn't been implemented")
            }
          >
            <FaFileAlt className="me-1" /> Generate Report
          </button>

          {/* Right side: rows per page + filter */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <label className="form-label small mb-0">Rows:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            {activeTab === "ongoing" && (
              <>
                <label className="form-label small mb-0">Filter:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="due_tomorrow">Due Tomorrow</option>
                  <option value="due_today">Due Today</option>
                  <option value="overdue">Overdue</option>
                </select>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card shadow-sm mb-3">
        <div className="card-header p-0" style={{ borderBottom: "none" }}>
          <div className="d-flex" style={{ borderBottom: "1px solid #dee2e6" }}>
            <button
              className={`btn ${
                activeTab === "ongoing" ? "btn-primary" : "btn-outline-secondary"
              } rounded-0 border-0 flex-grow-1`}
              onClick={() => setActiveTab("ongoing")}
              style={{ 
                fontSize: "0.9rem", 
                padding: "0.75rem 1.5rem",
                borderBottom: activeTab === "ongoing" ? "3px solid #0d6efd" : "3px solid transparent",
                borderRadius: "0 !important",
                marginBottom: "0",
                boxSizing: "border-box"
              }}
            >
              <FaBook className="me-2" size={16} />
              Active Transactions
              <span 
                className={`badge ms-2 ${
                  activeTab === "ongoing" ? "bg-white text-primary" : "bg-primary text-white"
                }`} 
                style={{ fontSize: "0.7rem" }}
              >
                {ongoingTransactions.length}
              </span>
            </button>
            <button
              className={`btn ${
                activeTab === "history" ? "btn-primary" : "btn-outline-secondary"
              } rounded-0 border-0 flex-grow-1`}
              onClick={() => setActiveTab("history")}
              style={{ 
                fontSize: "0.9rem", 
                padding: "0.75rem 1.5rem",
                borderBottom: activeTab === "history" ? "3px solid #0d6efd" : "3px solid transparent",
                borderRadius: "0 !important",
                marginBottom: "0",
                boxSizing: "border-box"
              }}
            >
              <FaClock className="me-2" size={16} />
              History
              <span 
                className={`badge ms-2 ${
                  activeTab === "history" ? "bg-white text-primary" : "bg-secondary text-white"
                }`} 
                style={{ fontSize: "0.7rem" }}
              >
                {transactionHistory.length}
              </span>
            </button>
            <button
              className={`btn ${
                activeTab === "notifications" ? "btn-primary" : "btn-outline-secondary"
              } rounded-0 border-0 flex-grow-1`}
              onClick={() => setActiveTab("notifications")}
              style={{ 
                fontSize: "0.9rem", 
                padding: "0.75rem 1.5rem",
                borderBottom: activeTab === "notifications" ? "3px solid #0d6efd" : "3px solid transparent",
                borderRadius: "0 !important",
                marginBottom: "0",
                boxSizing: "border-box"
              }}
            >
              <FaBell className="me-2" size={16} />
              Overdue
              {overdueNotifications.length > 0 && (
                <span
                  className={`badge ms-2 ${
                    activeTab === "notifications" ? "bg-white text-danger" : "bg-danger text-white"
                  }`}
                  style={{ fontSize: "0.7rem" }}
                >
                  {overdueNotifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div
        className="card shadow-sm flex-grow-1 d-flex flex-column"
        style={{ minHeight: "0", overflow: "hidden" }}
      >
        <div
          className="table-responsive flex-grow-1 p-2"
          style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
        >
          {activeTab === "ongoing" && (
            <table className="table table-sm table-striped align-middle mb-0">
              <thead className="small">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedTransactions(
                          e.target.checked ? paginatedData.map((t) => t.id) : []
                        )
                      }
                      checked={
                        paginatedData.length > 0 &&
                        selectedTransactions.length === paginatedData.length
                      }
                    />
                  </th>
                  <th>Transaction ID</th>
                  <th>Student Info</th>
                  <th>Book Details</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Renewals</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No active transactions found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((transaction) => (
                    <tr
                      key={transaction.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectTransaction(transaction.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) => e.stopPropagation()}
                          checked={selectedTransactions.includes(
                            transaction.id
                          )}
                        />
                      </td>
                      <td>
                        <strong>{transaction.transactionId}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {transaction.studentName}
                          </div>
                          <small className="text-muted">
                            {transaction.studentId}
                          </small>
                          <br />
                          <small className="text-muted">
                            {transaction.studentEmail}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{transaction.bookTitle}</div>
                          <small className="text-muted">
                            ISBN: {transaction.bookISBN}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>
                            <FaCalendarAlt className="me-1" />
                            Borrowed: {transaction.borrowDate}
                          </small>
                          <br />
                          <small>
                            <FaClock className="me-1" />
                            Due: {transaction.dueDate}
                          </small>
                          {transaction.daysRemaining >= 0 ? (
                            <>
                              <br />
                              <small className="text-info">
                                {transaction.daysRemaining} days left
                              </small>
                            </>
                          ) : (
                            <>
                              <br />
                              <small className="text-danger">
                                {Math.abs(transaction.daysRemaining)} days
                                overdue
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(
                          transaction.status,
                          transaction.daysRemaining
                        )}
                      </td>
                      <td>
                        <div>
                          {transaction.renewalCount}/{transaction.maxRenewals}
                          {transaction.renewalCount <
                            transaction.maxRenewals && (
                            <>
                              <br />
                              <small className="text-success">Can renew</small>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {currentPage === totalPages && paginatedData.length > 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-2">
                      No more rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "history" && (
            <table className="table table-sm table-striped align-middle mb-0">
              <thead className="small">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedTransactions(
                          e.target.checked ? paginatedData.map((t) => t.id) : []
                        )
                      }
                      checked={
                        paginatedData.length > 0 &&
                        selectedTransactions.length === paginatedData.length
                      }
                    />
                  </th>
                  <th>Transaction ID</th>
                  <th>Student Info</th>
                  <th>Book Details</th>
                  <th>Dates</th>
                  <th>Return Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No history found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((transaction) => (
                    <tr
                      key={transaction.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectTransaction(transaction.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) => e.stopPropagation()}
                          checked={selectedTransactions.includes(
                            transaction.id
                          )}
                        />
                      </td>
                      <td>
                        <strong>{transaction.transactionId}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {transaction.studentName}
                          </div>
                          <small className="text-muted">
                            {transaction.studentId}
                          </small>
                          <br />
                          <small className="text-muted">
                            {transaction.studentEmail}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{transaction.bookTitle}</div>
                          <small className="text-muted">
                            ISBN: {transaction.bookISBN}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>
                            <FaCalendarAlt className="me-1" />
                            Borrowed: {transaction.borrowDate}
                          </small>
                          <br />
                          <small>Due: {transaction.dueDate}</small>
                          <br />
                          <small>
                            <FaCheckCircle className="me-1" />
                            Returned: {transaction.returnDate}
                          </small>
                        </div>
                      </td>
                      <td>
                        {getReturnStatusBadge(
                          transaction.returnStatus,
                          transaction.fine
                        )}
                      </td>
                      <td>
                        <span
                          className={`fw-bold ${
                            transaction.fine > 0
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          ₱{transaction.fine.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {currentPage === totalPages && paginatedData.length > 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-2">
                      No more rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "notifications" && (
            <div className="p-3">
              <div className="alert alert-info mb-4">
                <FaBell className="me-2" />
                <strong>Notification Settings:</strong>
                System automatically sends notifications 1 day before due date,
                on due date, and daily for overdue books.
              </div>

              <div className="row g-3">
                {overdueNotifications.map((notification) => (
                  <div key={notification.id} className="col-md-6">
                    <div className="card border-start border-4 border-warning">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">
                            {notification.studentName}
                          </h6>
                          {getNotificationBadge(notification.type)}
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            <FaUser className="me-1" />
                            {notification.studentEmail}
                          </small>
                        </div>

                        <div className="mb-2">
                          <small>
                            <FaBook className="me-1" />
                            <strong>{notification.bookTitle}</strong>
                          </small>
                        </div>

                        <div className="mb-3">
                          {notification.type === "overdue" && (
                            <small className="text-danger">
                              <FaExclamationTriangle className="me-1" />
                              {notification.daysOverdue} days overdue
                            </small>
                          )}
                          {notification.type === "due_today" && (
                            <small className="text-warning">
                              <FaClock className="me-1" />
                              Due today
                            </small>
                          )}
                          {notification.type === "due_tomorrow" && (
                            <small className="text-info">
                              <FaClock className="me-1" />
                              Due tomorrow
                            </small>
                          )}
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Last notified: {notification.lastNotified} <br />
                            Total notifications sent:{" "}
                            {notification.totalNotifications}
                          </small>
                        </div>

                        <div className="btn-group btn-group-sm w-100">
                          <button className="btn btn-outline-primary">
                            Send Reminder
                          </button>
                          <button className="btn btn-outline-info">
                            Contact Student
                          </button>
                          <button className="btn btn-outline-secondary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {overdueNotifications.length === 0 && (
                <div className="text-center py-4">
                  <FaCheckCircle className="text-success mb-3" size={48} />
                  <h5 className="text-success">All caught up!</h5>
                  <p className="text-muted">
                    No overdue items at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls + Actions */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="small">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div className="d-flex gap-2">
            {/* View button - only show for single selection */}
            {selectedTransactions.length === 1 && (
              <button
                className="btn btn-sm btn-primary"
                style={{ width: "100px" }}
                onClick={() => {
                  const selectedTransaction = currentData.find(
                    (t) => t.id === selectedTransactions[0]
                  );
                  handleViewTransaction(selectedTransaction, activeTab);
                }}
              >
                <FaEye size={12} /> View
              </button>
            )}

            {/* Action buttons based on tab */}
            {activeTab === "ongoing" && selectedTransactions.length > 0 && (
              <>
                <button
                  className="btn btn-sm btn-success"
                  style={{ width: "100px" }}
                >
                  Renew
                </button>
                <button
                  className="btn btn-sm btn-info"
                  style={{ width: "100px" }}
                >
                  Return
                </button>
              </>
            )}

            {activeTab === "notifications" &&
              selectedTransactions.length > 0 && (
                <button
                  className="btn btn-sm btn-warning"
                  style={{ width: "140px" }}
                >
                  Send Reminder
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        transaction={selectedTransaction}
        type={modalType}
      />
    </div>
  );
}

export default BookTransactions;
