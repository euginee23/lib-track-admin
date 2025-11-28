import { useState, useEffect, useCallback } from "react";
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
  getAllTransactions,
  getNotifications,
} from "../../api/transactions/getTransactions";
import {
  getUserFines,
  getOverdueFines,
  getTransactionFine,
} from "../../api/transactions/getFineCalculations";
import { markTransactionsAsLost } from "../../api/transactions/penalties";
import { postUserNotification } from "../../api/notifications/postUserNotification";
import WebSocketClient from "../../api/websocket/websocket-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    student_daily_fine: 0,
    faculty_daily_fine: 0,
  });

  // Always keep system settings up-to-date by fetching from server
  const fetchSystemSettings = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('Fetching system settings from:', `${apiUrl}/api/settings/system-settings`);
      const res = await fetch(`${apiUrl}/api/settings/system-settings`);
      console.log('Settings fetch response status:', res.status);
      
      if (!res.ok) {
        console.error('Settings fetch failed with status:', res.status);
        return;
      }
      
      const payload = await res.json();
      console.log('Raw API response:', payload);
      
      if (payload && payload.success && payload.data && payload.data.fineStructure) {
        const fineStruct = payload.data.fineStructure;
        console.log('Fine structure from API:', fineStruct);

        const newSettings = {
          student_daily_fine: parseFloat(fineStruct.student.dailyFine) || 0,
          faculty_daily_fine: parseFloat(fineStruct.faculty.dailyFine) || 0,
        };

        // Only update if the values actually changed to prevent infinite loops
        if (
          Math.abs(newSettings.student_daily_fine - systemSettings.student_daily_fine) > 0.001 ||
          Math.abs(newSettings.faculty_daily_fine - systemSettings.faculty_daily_fine) > 0.001
        ) {
          console.log('Applying updated system settings:', newSettings);
          setSystemSettings(newSettings);
        }
      } else {
        console.error('Invalid API response structure:', payload);
      }
    } catch (error) {
      console.error("Failed to fetch system settings:", error);
    }
  }, [systemSettings.student_daily_fine, systemSettings.faculty_daily_fine]);

  // Initialize WebSocket client
  const [wsClient] = useState(() => {
    const client = new WebSocketClient();
    client.connect();
    return client;
  });

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, [wsClient]);

  // Load system settings on mount and poll periodically so the UI always reflects updates made by admin
  useEffect(() => {
    // Fetch settings immediately on mount
    fetchSystemSettings();
    const id = setInterval(fetchSystemSettings, 60 * 1000); // refresh every minute
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when dependencies change, but only after settings are loaded
  useEffect(() => {
    // Only fetch data if we have settings loaded (non-zero values)
    if (systemSettings.student_daily_fine > 0 && systemSettings.faculty_daily_fine > 0) {
      fetchData();
    }
    // Only watch primitive settings to avoid triggering on object reference changes
  }, [activeTab, currentPage, rowsPerPage, filterStatus, systemSettings.student_daily_fine, systemSettings.faculty_daily_fine]);
  const sendReminderNotification = async (transactions) => {
    try {
      const wsConnected = wsClient && wsClient.isConnected && wsClient.isConnected();
      if (!wsConnected) {
        // WebSocket unavailable — we'll still persist notifications to the server
        toast.warning(
          "WebSocket not connected. Saving notifications to server only."
        );
        console.error("WebSocket not connected; posting notifications to server only.");
      }

      let sentCount = 0;
      for (const transaction of transactions) {
        const message = createReminderMessage(transaction);

        // Persist notification to server
        try {
          await postUserNotification({
            user_id: transaction.user_id,
            notification_type: "book_reminder",
            notification_message: message.body,
          });
          sentCount++;
        } catch (postErr) {
          console.error(
            `Failed to persist notification for user ${transaction.user_id}:`,
            postErr
          );
        }

        // Send WebSocket notification to user if available
        if (wsConnected) {
          try {
            wsClient.send("user_notification", {
              user_id: transaction.user_id,
              type: "book_reminder",
              title: message.title,
              message: message.body,
              book_title: transaction.bookTitle || transaction.book_title,
              due_date: transaction.due_date,
              days_overdue: transaction.daysOverdue || 0,
              fine_amount: transaction.fine || 0,
              timestamp: new Date().toISOString(),
              priority: transaction.daysOverdue > 0 ? "high" : "medium",
            });
          } catch (wsErr) {
            console.error("Failed to send websocket notification:", wsErr);
          }
        }
      }

      if (sentCount > 0) {
        toast.success(
          `Reminder${sentCount > 1 ? "s" : ""} saved and dispatched for ${sentCount} user${
            sentCount > 1 ? "s" : ""
          }.`
        );
      } else {
        toast.error("No reminders were saved. Check server logs.");
      }
    } catch (error) {
      console.error("Error sending reminder notifications:", error);
      toast.error("Failed to send reminder notifications");
    }
  };

  // Helper function to create reminder message
  const createReminderMessage = (transaction) => {
    const daysOverdue = transaction.daysOverdue || 0;
    const isOverdue = daysOverdue > 0;
    const fine = transaction.fine || 0;
    const itemTitle = transaction.bookTitle || transaction.book_title || "the item";

    if (isOverdue) {
      return {
        title: "Overdue Book Reminder",
        body: `Your book "${itemTitle}" is ${daysOverdue} day${
          daysOverdue > 1 ? "s" : ""
        } overdue. ${
          fine > 0 ? `Current fine: ₱${fine.toFixed(2)}. ` : ""
        }Please return it as soon as possible to avoid additional charges.`,
      };
    } else {
      return {
        title: "Book Due Soon",
        body: `Your book "${itemTitle}" is due soon. Please return it by ${new Date(
          transaction.due_date
        ).toLocaleDateString()} to avoid late fees.`,
      };
    }
  };

  // Handle send reminder action
  const handleSendReminder = () => {
    // Exclude already-paid transactions from reminders
    const selectedTransactionData = currentData.filter(
      (t) =>
        selectedTransactions.includes(t.transaction_id) &&
        t.penaltyStatus !== "Paid"
    );

    if (selectedTransactionData.length === 0) {
      toast.warning(
        "Please select transactions to send reminders for (selected items may be already paid)."
      );
      return;
    }

    sendReminderNotification(selectedTransactionData);
  };

  // Handle mark as lost action
  const handleMarkAsLost = async () => {
    const selectedTransactionData = currentData.filter((t) =>
      selectedTransactions.includes(t.transaction_id)
    );

    if (selectedTransactionData.length === 0) {
      toast.warning("Please select transactions to mark as lost.");
      return;
    }

    // Confirm action
    const confirmMessage = `Are you sure you want to mark ${selectedTransactionData.length} transaction(s) as lost? This will add the book price to each user's fine.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await markTransactionsAsLost(
        selectedTransactions
      );

      if (response.success) {
        toast.success(
          `${response.data.penalties_updated} transaction(s) marked as lost successfully.`
        );
        
        // Clear selections and refresh data
        setSelectedTransactions([]);
        fetchData();
        fetchFineData();
      } else {
        toast.error(response.message || "Failed to mark transactions as lost");
      }
    } catch (error) {
      console.error("Error marking as lost:", error);
      toast.error(error.message || "Failed to mark transactions as lost");
    }
  };

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        transaction_type: filterStatus === "all" ? undefined : filterStatus,
      };

      if (activeTab === "ongoing") {
        const response = await getAllTransactions(params);
        const transformedData = response.data.map(transformTransaction);
        setOngoingTransactions(transformedData);
        setPagination(
          response.pagination || {
            total: response.count,
            page: 1,
            limit: response.count,
            totalPages: 1,
          }
        );
      } else if (activeTab === "notifications") {
        const response = await getNotifications(params);
        const transformedData = response.data.map(
          transformNotificationTransaction
        );
        setOverdueNotifications(transformedData);
        setPagination(
          response.pagination || {
            total: response.count,
            page: 1,
            limit: response.count,
            totalPages: 1,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, rowsPerPage, filterStatus]);

  // Fetch fine data for overdue transactions
  const fetchFineData = useCallback(async () => {
    try {
      if (fetchFineData.isFetching) {
        console.log('fetchFineData already running, skipping concurrent call');
        return;
      }
      fetchFineData.isFetching = true;
      if (activeTab === "overdue" || activeTab === "ongoing") {
        const overdueData = await getOverdueFines();
        setOverdueFineSummary(overdueData.summary);

        // Store system settings from the API response (only update if changed)
        if (overdueData.system_settings) {
          const apiSettings = {
            student_daily_fine: parseFloat(overdueData.system_settings.student_daily_fine) || systemSettings.student_daily_fine,
            faculty_daily_fine: parseFloat(overdueData.system_settings.faculty_daily_fine) || systemSettings.faculty_daily_fine,
          };

          if (
            Math.abs(apiSettings.student_daily_fine - systemSettings.student_daily_fine) > 0.001 ||
            Math.abs(apiSettings.faculty_daily_fine - systemSettings.faculty_daily_fine) > 0.001
          ) {
            console.log('Overdue API returned different settings, applying:', apiSettings);
            setSystemSettings(apiSettings);
          }
        }

  // Create fine data lookup object
        const fineMap = {};
        overdueData.transactions.forEach((transaction) => {
          const statusNormalized = (transaction.status || "").toString().toLowerCase();
          fineMap[transaction.transaction_id] = {
            fine: statusNormalized === 'paid' ? 0 : (transaction.fine || 0),
            daysOverdue: transaction.daysOverdue,
            dailyFine: transaction.dailyFine,
            userType: transaction.userType,
            status: statusNormalized,
            message: transaction.message,
            penalty_id: transaction.penalty_id || null,
          };
        });
        setFineData(fineMap);

        // Also calculate fines (or retrieve penalty status) for ongoing transactions that might be overdue
        // Ensure we capture transactions that have been paid (fine = 0 but status = 'paid') so UI can show Paid badges
        if (activeTab === "ongoing" && ongoingTransactions.length > 0) {
          for (const transaction of ongoingTransactions) {
            // Only query if not already in overdue data
            if (!fineMap[transaction.transaction_id] && transaction.due_date) {
              try {
                const fineResult = await getTransactionFine(
                  transaction.transaction_id
                );

                // Always record the result so we know if it's paid (even if fine === 0)
                fineMap[transaction.transaction_id] = {
                  fine: fineResult.fine || 0,
                  daysOverdue: fineResult.daysOverdue || 0,
                  dailyFine: fineResult.dailyFine || 0,
                  userType: fineResult.userType || "student",
                  status: fineResult.status || null,
                  message: fineResult.message || "",
                  penalty_id: fineResult.penalty_id || null,
                };
              } catch (error) {
                console.error(
                  `Error calculating fine for transaction ${transaction.transaction_id}:`,
                  error
                );
              }
            }
          }
          setFineData({ ...fineMap });
        }
      }
    } catch (err) {
      console.error("Error fetching fine data:", err);
    } finally {
      fetchFineData.isFetching = false;
    }
  }, [activeTab, ongoingTransactions, systemSettings.student_daily_fine, systemSettings.faculty_daily_fine]);

  // Helper function to calculate fine on-the-fly
  const calculateFineLocally = useCallback((transaction) => {
    console.log('Calculating fine for transaction:', transaction.transaction_id);
    console.log('Current system settings:', systemSettings);
    
    if (!transaction.due_date)
      return {
        fine: 0,
        daysOverdue: 0,
        dailyFine: 0,
        userType: "student",
        status: "no_due_date",
      };

    let dueDate;
    if (typeof transaction.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(transaction.due_date)) {
      const [y, m, d] = transaction.due_date.split("-");
      dueDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    } else {
      dueDate = new Date(transaction.due_date);
    }

    const now = new Date();
    const currentDateLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateLocalMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    const MS_PER_DAY = 1000 * 3600 * 24;
    const daysDifference = Math.floor((currentDateLocalMidnight - dueDateLocalMidnight) / MS_PER_DAY);

    console.log('Due date:', transaction.due_date, 'Days difference:', daysDifference);

    if (daysDifference <= 0) {
      console.log('Book is not overdue');
      return {
        fine: 0,
        daysOverdue: 0,
        dailyFine: 0,
        userType: "student",
        status: "on_time",
      };
    }

    const isStudent =
      !transaction.position || transaction.position === "Student";
    // Use system settings for daily fine rates
    const dailyFine = isStudent
      ? systemSettings.student_daily_fine
      : systemSettings.faculty_daily_fine;
    const totalFine = daysDifference * dailyFine;

    console.log('User type:', isStudent ? 'student' : 'faculty');
    console.log('Daily fine rate:', dailyFine);
    console.log('Total fine:', totalFine);

    return {
      fine: totalFine,
      daysOverdue: daysDifference,
      dailyFine: dailyFine,
      userType: isStudent ? "student" : "faculty",
      status: "overdue",
    };
  }, [systemSettings.student_daily_fine, systemSettings.faculty_daily_fine]);

  // Transform API data to match component structure
  const transformTransaction = (transaction) => {
    const transactionFine = fineData[transaction.transaction_id];
    const localFineCalc = transactionFine || calculateFineLocally(transaction);

    // Determine display status based on database status and fine
    let displayStatus;
    const dbStatus = transaction.status; // "Borrowed" or "Returned" from database
    const hasFine = (localFineCalc.fine || 0) > 0;

    if (dbStatus === "Returned") {
      // If returned, always show as returned regardless of fine history
      displayStatus = "returned";
    } else if (dbStatus === "Borrowed") {
      // If borrowed with fine, show as overdue
      // If borrowed without fine, show as ok
      displayStatus = hasFine ? "overdue" : "ok";
    } else {
      // Fallback for any other status
      displayStatus = "unknown";
    }

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
      bookTitle:
        transaction.book_title || transaction.research_title || "Unknown Item",
      bookISBN: transaction.book_isbn || null,
      status: displayStatus, // Use calculated display status
      dbStatus: dbStatus, // Keep original database status
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
      userType:
        localFineCalc.userType ||
        (transaction.position === "Student" || !transaction.position
          ? "student"
          : "faculty"),
      fineStatus: localFineCalc.status || "on_time",
      fineMessage: localFineCalc.message || "",
      penaltyStatus: localFineCalc.status === 'paid' ? 'Paid' : null,
    };
  };

  const transformNotificationTransaction = (transaction) => ({
    ...transformTransaction(transaction),
    type: transaction.notification_type,
    daysOverdue:
      transaction.days_remaining < 0 ? Math.abs(transaction.days_remaining) : 0,
    lastNotified: new Date().toISOString().split("T")[0], // Mock data
    totalNotifications: 1, // Mock data
  });

  // Fetch fine data after transactions are loaded
  useEffect(() => {
    if (ongoingTransactions.length > 0 || activeTab === "overdue") {
      fetchFineData();
    }
  }, [ongoingTransactions.length, activeTab]);

  useEffect(() => {
    try {
      if (!fineData || Object.keys(fineData).length === 0) return;
      if (!ongoingTransactions || ongoingTransactions.length === 0) return;

      // Check if any transaction actually needs updating to prevent infinite loops
      let hasChanges = false;
      const updated = ongoingTransactions.map((tx) => {
        const f = fineData[tx.transaction_id];
        if (!f) return tx;

        const newTx = {
          ...tx,
          fine: f.fine || 0,
          daysOverdue: f.daysOverdue || 0,
          dailyFine: f.dailyFine || 0,
          userType: f.userType || tx.userType,
          fineStatus: f.status || tx.fineStatus,
          fineMessage: f.message || tx.fineMessage,
          // Normalize penaltyStatus for the UI (match ManagePenalties)
          penaltyStatus: (f.status === 'paid' || f.status === 'Paid') ? 'Paid' : (tx.penaltyStatus || null),
          penalty_id: f.penalty_id || tx.penalty_id,
        };

        // Check if this transaction actually changed
        if (
          tx.fine !== newTx.fine ||
          tx.daysOverdue !== newTx.daysOverdue ||
          tx.fineStatus !== newTx.fineStatus ||
          tx.penaltyStatus !== newTx.penaltyStatus
        ) {
          hasChanges = true;
        }

        return newTx;
      });

      // Only update state if there are actual changes
      if (hasChanges) {
        setOngoingTransactions(updated);
      }
    } catch (err) {
      console.error('Error merging fineData into ongoingTransactions:', err);
    }
  }, [fineData]);

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

  const getStatusBadge = (status, daysRemaining, fineStatus, daysOverdue, penaltyStatus) => {
    const renderBadges = (mainBadge, isPaid = false) => {
      if (isPaid) {
        return (
          <div className="d-flex flex-column gap-1">
            <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Paid</span>
            {mainBadge}
          </div>
        );
      }
      return mainBadge;
    };

    const isPaid = fineStatus === 'paid' || penaltyStatus === 'Paid';

    switch (status) {
      case "ok":
        // Borrowed with no fine
        return <span className="badge bg-success">OK</span>;
      
      case "overdue":
        // Borrowed with fine
        const mainBadge = (
          <span className="badge bg-danger">
            Overdue ({daysOverdue} Day{daysOverdue !== 1 ? "s" : ""})
          </span>
        );
        return renderBadges(mainBadge, isPaid);
      
      case "returned":
        // Returned (may or may not have fine history)
        return <span className="badge bg-info">RETURNED</span>;
      
      case "reserved":
        return <span className="badge bg-primary">Reserved</span>;
      
      default:
        return <span className="badge bg-secondary">UNKNOWN</span>;
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
                ongoingTransactions.filter((t) => t.dbStatus === "Borrowed")
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
                  (t) => t.status === "overdue"
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
                  (t) => t.dbStatus === "Borrowed" && t.daysRemaining === 0
                ).length
              }
            </p>
            <small className="text-muted">Due today</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaCheckCircle className="text-success mb-2" size={24} />
            <h6 className="mb-1">OK Status</h6>
            <p className="fw-bold mb-0 text-success fs-4">
              {
                ongoingTransactions.filter((t) => t.status === "ok")
                  .length
              }
            </p>
            <small className="text-muted">No fines</small>
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
                            (transaction.position === "Student" ||
                              !transaction.position)
                              ? `${transaction.departmentAcronym} - ${
                                  transaction.yearLevel || "N/A"
                                }`
                              : `${transaction.departmentAcronym} - ${
                                  transaction.position || "Faculty"
                                }`}
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
                                Genre: {transaction.bookGenre || "N/A"}
                              </small>
                            </>
                          ) : transaction.research_paper_id ? (
                            <>
                              <div className="fw-bold">Research Paper</div>
                              <small className="text-muted">
                                Department:{" "}
                                {transaction.researchDepartment || "N/A"}
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
                          transaction.daysOverdue,
                          transaction.penaltyStatus
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
                              {transaction.daysOverdue} day
                              {transaction.daysOverdue !== 1 ? "s" : ""} overdue
                            </small>
                            <br />
                            <small className="text-muted">
                              ₱{transaction.dailyFine}/day (
                              {transaction.userType})
                            </small>
                          </div>
                        ) : (
                          <span className="badge bg-success">No Fine</span>
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
                {currentPage === (pagination?.totalPages || 1) &&
                  paginatedData.length > 0 && (
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
                            (notification.position === "Student" ||
                              !notification.position)
                              ? `${notification.departmentAcronym} - ${
                                  notification.yearLevel || "N/A"
                                }`
                              : `${notification.departmentAcronym} - ${
                                  notification.position || "Faculty"
                                }`}{" "}
                            | Ref: {notification.reference_number}
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
                                Genre: {notification.bookGenre || "N/A"}
                              </small>
                            </>
                          )}
                          {notification.research_paper_id && (
                            <>
                              <br />
                              <small className="text-muted">
                                Department:{" "}
                                {notification.researchDepartment || "N/A"}
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
                          {notification.penaltyStatus !== "Paid" ? (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() =>
                                sendReminderNotification([notification])
                              }
                            >
                              Send Reminder
                            </button>
                          ) : (
                            <button className="btn btn-outline-secondary" disabled>
                              Paid
                            </button>
                          )}
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
                <button
                  className="btn btn-sm btn-danger"
                  style={{ width: "120px" }}
                  onClick={handleMarkAsLost}
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
                    onClick={handleSendReminder}
                  >
                    Send Reminder
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default BookTransactions;
