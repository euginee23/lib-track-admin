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
import { 
  getOngoingTransactions, 
  getNotifications 
} from "../../api/transactions/getTransactions";
import { getUserFines, getOverdueFines, getTransactionFine } from "../../api/transactions/getFineCalculations";

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
  const [error, setError] = useState(null);

  // Data states
  const [ongoingTransactions, setOngoingTransactions] = useState([]);
  const [overdueNotifications, setOverdueNotifications] = useState([]);
  const [pagination, setPagination] = useState({});
  
  // Fine calculation states
  const [fineData, setFineData] = useState({});
  const [overdueFineSummary, setOverdueFineSummary] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    student_daily_fine: 11,
    faculty_daily_fine: 11
  });

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        transaction_type: filterStatus === "all" ? undefined : filterStatus,
      };

      if (activeTab === "ongoing") {
        const response = await getOngoingTransactions(params);
        const transformedData = response.data.map(transformTransaction);
        setOngoingTransactions(transformedData);
        setPagination(response.pagination || { total: response.count, page: 1, limit: response.count, totalPages: 1 });
      } else if (activeTab === "notifications") {
        const response = await getNotifications(params);
        const transformedData = response.data.map(transformNotificationTransaction);
        setOverdueNotifications(transformedData);
        setPagination(response.pagination || { total: response.count, page: 1, limit: response.count, totalPages: 1 });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch fine data for overdue transactions
  const fetchFineData = async () => {
    try {
      if (activeTab === "overdue" || activeTab === "ongoing") {
        const overdueData = await getOverdueFines();
        setOverdueFineSummary(overdueData.summary);
        
        // Store system settings from the API response
        if (overdueData.system_settings) {
          setSystemSettings(overdueData.system_settings);
        }
        
        // Create fine data lookup object
        const fineMap = {};
        overdueData.transactions.forEach(transaction => {
          fineMap[transaction.transaction_id] = {
            fine: transaction.fine,
            daysOverdue: transaction.daysOverdue,
            dailyFine: transaction.dailyFine,
            userType: transaction.userType,
            status: transaction.status,
            message: transaction.message
          };
        });
        setFineData(fineMap);

        // Also calculate fines for ongoing transactions that might be overdue
        if (activeTab === "ongoing" && ongoingTransactions.length > 0) {
          for (const transaction of ongoingTransactions) {
            // Only calculate if not already in overdue data
            if (!fineMap[transaction.transaction_id] && transaction.due_date) {
              try {
                const fineResult = await getTransactionFine(transaction.transaction_id);
                if (fineResult.fine > 0) {
                  fineMap[transaction.transaction_id] = {
                    fine: fineResult.fine,
                    daysOverdue: fineResult.daysOverdue,
                    dailyFine: fineResult.dailyFine,
                    userType: fineResult.userType,
                    status: fineResult.status,
                    message: fineResult.message
                  };
                }
              } catch (error) {
                console.error(`Error calculating fine for transaction ${transaction.transaction_id}:`, error);
              }
            }
          }
          setFineData({...fineMap});
        }
      }
    } catch (err) {
      console.error("Error fetching fine data:", err);
    }
  };

  // Helper function to calculate fine on-the-fly
  const calculateFineLocally = (transaction) => {
    if (!transaction.due_date) return { fine: 0, daysOverdue: 0, dailyFine: 0, userType: 'student', status: 'no_due_date' };
    
    const dueDate = new Date(transaction.due_date);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - dueDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    if (daysDifference <= 0) {
      return { fine: 0, daysOverdue: 0, dailyFine: 0, userType: 'student', status: 'on_time' };
    }
    
    const isStudent = !transaction.position || transaction.position === 'Student';
    // Use system settings for daily fine rates
    const dailyFine = isStudent 
      ? systemSettings.student_daily_fine 
      : systemSettings.faculty_daily_fine;
    const totalFine = daysDifference * dailyFine;
    
    return {
      fine: totalFine,
      daysOverdue: daysDifference,
      dailyFine: dailyFine,
      userType: isStudent ? 'student' : 'faculty',
      status: 'overdue'
    };
  };

  // Transform API data to match component structure
  const transformTransaction = (transaction) => {
    const transactionFine = fineData[transaction.transaction_id];
    const localFineCalc = transactionFine || calculateFineLocally(transaction);
    
    return {
      transaction_id: transaction.transaction_id,
      reference_number: transaction.reference_number,
      user_id: transaction.user_id,
      book_id: transaction.book_id,
      research_paper_id: transaction.research_paper_id,
      receipt_image: transaction.receipt_image,
      due_date: transaction.due_date,
      transaction_type: transaction.transaction_type,
      transaction_date: transaction.transaction_date,
      studentName: `${transaction.first_name} ${transaction.last_name}`,
      studentEmail: transaction.email,
      bookTitle: transaction.book_title || transaction.research_title || "Unknown Item",
      bookISBN: transaction.book_isbn || null,
      status: transaction.status,
      daysRemaining: transaction.days_remaining,
      // New fields for enhanced display
      departmentAcronym: transaction.department_acronym,
      yearLevel: transaction.year_level,
      position: transaction.position,
      bookGenre: transaction.book_genre,
      researchDepartment: transaction.research_department,
      // Fine calculation fields
      fine: localFineCalc.fine || 0,
      daysOverdue: localFineCalc.daysOverdue || 0,
      dailyFine: localFineCalc.dailyFine || 0,
      userType: localFineCalc.userType || (transaction.position === 'Student' || !transaction.position ? 'student' : 'faculty'),
      fineStatus: localFineCalc.status || 'on_time',
      fineMessage: localFineCalc.message || ''
    };
  };

  const transformNotificationTransaction = (transaction) => ({
    ...transformTransaction(transaction),
    type: transaction.notification_type,
    daysOverdue: transaction.days_remaining < 0 ? Math.abs(transaction.days_remaining) : 0,
    lastNotified: new Date().toISOString().split('T')[0], // Mock data
    totalNotifications: 1, // Mock data
  });

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, rowsPerPage, filterStatus]);

  // Fetch fine data after transactions are loaded
  useEffect(() => {
    if (ongoingTransactions.length > 0 || activeTab === "overdue") {
      fetchFineData();
    }
  }, [ongoingTransactions, activeTab]);

  // Filter data locally based on search term
  const filterDataBySearch = (data) => {
    if (!searchTerm) return data;
    
    return data.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.studentName?.toLowerCase().includes(searchLower) ||
        transaction.bookTitle?.toLowerCase().includes(searchLower) ||
        transaction.reference_number?.toLowerCase().includes(searchLower) ||
        transaction.user_id?.toString().includes(searchTerm)
      );
    });
  };

  const getStatusBadge = (status, daysRemaining, fineStatus, daysOverdue) => {
    switch (status) {
      case "borrowed":
        // Use fine calculation data if available for more accurate status
        if (fineStatus === 'overdue' && daysOverdue > 0) {
          return (
            <span className="badge bg-danger">
              Past Due ({daysOverdue} Day{daysOverdue !== 1 ? 's' : ''})
            </span>
          );
        } else if (daysRemaining < 0) {
          return (
            <span className="badge bg-danger">
              Past Due ({Math.abs(daysRemaining)} Day{Math.abs(daysRemaining) !== 1 ? 's' : ''})
            </span>
          );
        } else if (daysRemaining === 0) {
          return <span className="badge bg-warning">Due Today</span>;
        } else {
          return <span className="badge bg-success">Ok</span>;
        }
      case "returned":
        return <span className="badge bg-info">Returned</span>;
      case "reserved":
        return <span className="badge bg-primary">Reserved</span>;
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
        transaction.reference_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.user_id.toString().includes(searchTerm);

      const matchesFilter =
        filterStatus === "all" || transaction.transaction_type === filterStatus;

      return matchesSearch && matchesFilter;
    }
  );

  const handleViewTransaction = (transaction, type) => {
    setSelectedTransaction(transaction);
    setModalType(type);
    setShowDetailModal(true);
  };

  const handleSelectTransaction = (transaction_id) => {
    setSelectedTransactions((prev) =>
      prev.includes(transaction_id)
        ? prev.filter((id) => id !== transaction_id)
        : [...prev, transaction_id]
    );
  };

  const handleNextPage = () => {
    if (currentPage < (pagination?.totalPages || 1)) {
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
        return filterDataBySearch(ongoingTransactions);
      case "notifications":
        return filterDataBySearch(overdueNotifications);
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  // For API-based pagination, we don't slice the data since it's already paginated
  const paginatedData = currentData;

  // Reset current page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterStatus, rowsPerPage]);

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Header with Statistics Cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBook className="text-primary mb-2" size={24} />
            <h6 className="mb-1">Active Borrows</h6>
            <p className="fw-bold mb-0 text-primary fs-4">
              {
                ongoingTransactions.filter((t) => t.status === "borrowed")
                  .length
              }
            </p>
            <small className="text-muted">Currently borrowed</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaExclamationTriangle className="text-danger mb-2" size={24} />
            <h6 className="mb-1">Overdue Items</h6>
            <p className="fw-bold mb-0 text-danger fs-4">
              {
                ongoingTransactions.filter(
                  (t) => t.status === "borrowed" && t.daysRemaining < 0
                ).length
              }
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
                ongoingTransactions.filter(
                  (t) => t.status === "borrowed" && t.daysRemaining === 0
                ).length
              }
            </p>
            <small className="text-muted">Due today</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaCheckCircle className="text-success mb-2" size={24} />
            <h6 className="mb-1">Active Reservations</h6>
            <p className="fw-bold mb-0 text-success fs-4">
              {
                ongoingTransactions.filter((t) => t.status === "reserved")
                  .length
              }
            </p>
            <small className="text-muted">Items reserved</small>
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
              placeholder="Search by reference number, user ID, student name, or book title..."
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

          <button
            className="btn btn-sm btn-secondary"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
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
                <label className="form-label small mb-0">Type Filter:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "120px" }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="borrow">Borrow</option>
                  <option value="return">Return</option>
                  <option value="reserve">Reserve</option>
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
                activeTab === "ongoing"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } rounded-0 border-0 flex-grow-1`}
              onClick={() => setActiveTab("ongoing")}
              style={{
                fontSize: "0.9rem",
                padding: "0.75rem 1.5rem",
                borderBottom:
                  activeTab === "ongoing"
                    ? "3px solid #0d6efd"
                    : "3px solid transparent",
                borderRadius: "0 !important",
                marginBottom: "0",
                boxSizing: "border-box",
              }}
            >
              <FaBook className="me-2" size={16} />
              Borrowings & Reservations
              <span
                className={`badge ms-2 ${
                  activeTab === "ongoing"
                    ? "bg-white text-primary"
                    : "bg-primary text-white"
                }`}
                style={{ fontSize: "0.7rem" }}
              >
                {ongoingTransactions.length}
              </span>
            </button>
            <button
              className={`btn ${
                activeTab === "notifications"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } rounded-0 border-0 flex-grow-1`}
              onClick={() => setActiveTab("notifications")}
              style={{
                fontSize: "0.9rem",
                padding: "0.75rem 1.5rem",
                borderBottom:
                  activeTab === "notifications"
                    ? "3px solid #0d6efd"
                    : "3px solid transparent",
                borderRadius: "0 !important",
                marginBottom: "0",
                boxSizing: "border-box",
              }}
            >
              <FaBell className="me-2" size={16} />
              Due & Overdue
              {overdueNotifications.length > 0 && (
                <span
                  className={`badge ms-2 ${
                    activeTab === "notifications"
                      ? "bg-white text-danger"
                      : "bg-danger text-white"
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
                          e.target.checked
                            ? paginatedData.map((t) => t.transaction_id)
                            : []
                        )
                      }
                      checked={
                        paginatedData.length > 0 &&
                        selectedTransactions.length === paginatedData.length
                      }
                    />
                  </th>
                  <th>Reference Number</th>
                  <th>Student / Faculty</th>
                  <th>Book / Research Info</th>
                  <th>Transaction Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
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
                    <td colSpan="9" className="text-center text-muted py-4">
                      No active borrowings or reservations found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleSelectTransaction(transaction.transaction_id)
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) => e.stopPropagation()}
                          checked={selectedTransactions.includes(
                            transaction.transaction_id
                          )}
                        />
                      </td>
                      <td>
                        <strong>{transaction.reference_number}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {transaction.studentName}
                          </div>
                          <small className="text-muted">
                            {transaction.studentEmail}
                          </small>
                          <br />
                          <small className="text-muted">
                            {transaction.departmentAcronym && 
                              (transaction.position === 'Student' || !transaction.position) 
                                ? `${transaction.departmentAcronym} - ${transaction.yearLevel || 'N/A'}`
                                : `${transaction.departmentAcronym} - ${transaction.position || 'Faculty'}`
                            }
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {transaction.book_id ? (
                            <>
                              <div className="fw-bold">
                                {transaction.bookTitle}
                              </div>
                              <small className="text-muted">
                                Genre: {transaction.bookGenre || 'N/A'}
                              </small>
                            </>
                          ) : transaction.research_paper_id ? (
                            <>
                              <div className="fw-bold">Research Paper</div>
                              <small className="text-muted">
                                Department: {transaction.researchDepartment || 'N/A'}
                              </small>
                            </>
                          ) : (
                            <small className="text-muted">
                              No item specified
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>
                            <FaCalendarAlt className="me-1" />
                            {new Date(
                              transaction.transaction_date
                            ).toLocaleDateString()}
                          </small>
                          <br />
                          <small>
                            <FaClock className="me-1" />
                            Time:{" "}
                            {new Date(
                              transaction.transaction_date
                            ).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>{transaction.due_date}</small>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(
                          transaction.status,
                          transaction.daysRemaining,
                          transaction.fineStatus,
                          transaction.daysOverdue
                        )}
                      </td>
                      <td>
                        {transaction.fine > 0 ? (
                          <div>
                            <span className="badge bg-danger">
                              ₱{transaction.fine.toFixed(2)}
                            </span>
                            <br />
                            <small className="text-muted">
                              {transaction.daysOverdue} day{transaction.daysOverdue !== 1 ? 's' : ''} overdue
                            </small>
                            <br />
                            <small className="text-muted">
                              ₱{transaction.dailyFine}/day ({transaction.userType})
                            </small>
                          </div>
                        ) : (
                          <span className="badge bg-success">
                            No Fine
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {transaction.transaction_type}
                        </span>
                        {transaction.receipt_image && (
                          <>
                            <br />
                            <small className="text-success">
                              Receipt available
                            </small>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {currentPage === (pagination?.totalPages || 1) && paginatedData.length > 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-2">
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
                on due date, and daily for overdue items. Reservation
                notifications are sent when items become available.
              </div>

              <div className="row g-3">
                {overdueNotifications.map((notification) => (
                  <div key={notification.transaction_id} className="col-md-6">
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
                          <br />
                          <small className="text-muted">
                            {notification.departmentAcronym && 
                              (notification.position === 'Student' || !notification.position) 
                                ? `${notification.departmentAcronym} - ${notification.yearLevel || 'N/A'}`
                                : `${notification.departmentAcronym} - ${notification.position || 'Faculty'}`
                            } | Ref: {notification.reference_number}
                          </small>
                        </div>

                        <div className="mb-2">
                          <small>
                            <FaBook className="me-1" />
                            <strong>{notification.bookTitle}</strong>
                          </small>
                          {notification.book_id && (
                            <>
                              <br />
                              <small className="text-muted">
                                Genre: {notification.bookGenre || 'N/A'}
                              </small>
                            </>
                          )}
                          {notification.research_paper_id && (
                            <>
                              <br />
                              <small className="text-muted">
                                Department: {notification.researchDepartment || 'N/A'}
                              </small>
                            </>
                          )}
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            Transaction Type:
                            <span className="badge bg-secondary ms-1">
                              {notification.transaction_type}
                            </span>
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
                  <h5 className="text-success">All up to date!</h5>
                  <p className="text-muted">
                    No overdue items or urgent notifications at the moment.
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
              Page {currentPage} of {pagination?.totalPages || 1}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === (pagination?.totalPages || 1)}
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
                    (t) => t.transaction_id === selectedTransactions[0]
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
                {/* Show different actions based on transaction status */}
                {currentData.some(
                  (t) =>
                    selectedTransactions.includes(t.transaction_id) &&
                    t.status === "reserved"
                ) && (
                  <button
                    className="btn btn-sm btn-success"
                    style={{ width: "120px" }}
                  >
                    Convert to Borrow
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  style={{ width: "120px" }}
                >
                  Mark as Lost
                </button>
              </>
            )}

            {activeTab === "notifications" &&
              selectedTransactions.length > 0 && (
                <>
                  <button
                    className="btn btn-sm btn-warning"
                    style={{ width: "140px" }}
                  >
                    Send Reminder
                  </button>
                  <button
                    className="btn btn-sm btn-info"
                    style={{ width: "120px" }}
                  >
                    View Details
                  </button>
                </>
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
