import { useState, useEffect } from "react";
import { 
  FaBook, 
  FaUsers, 
  FaClock, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaTrophy,
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaFileAlt,
  FaUserCheck,
  FaBookReader
} from "react-icons/fa";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getDashboardAnalytics } from "../../api/dashboard/getAnalytics";
import { formatCurrencyPHP } from '../utils/format';

ChartJS.register(
  LineElement, 
  BarElement,
  ArcElement,
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend
);

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardAnalytics(period);
      if (response.success) {
        // Temporary debug: log analytics shape to help map fields
        // Remove this log after verifying the backend response shape
        // (kept minimal to avoid noisy console output)
        // eslint-disable-next-line no-console
        console.log('dashboard analytics payload:', response.data);
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Chart data for monthly trend
  const monthlyTrendData = {
    labels: analytics?.monthlyTrend?.map(m => m.month_label) || [],
    datasets: [
      {
        label: "Transactions",
        data: analytics?.monthlyTrend?.map(m => m.transaction_count) || [],
        fill: true,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.3,
      },
      {
        label: "Active Users",
        data: analytics?.monthlyTrend?.map(m => m.unique_users) || [],
        fill: true,
        borderColor: "#198754",
        backgroundColor: "rgba(25, 135, 84, 0.1)",
        tension: 0.3,
      },
    ],
  };

  // Robust fallbacks for overdue / fines metrics — handle changed analytics shape
  const overdueCount = Number(
    analytics?.overdue?.count ??
    analytics?.fines?.summary?.overdue_count ??
    analytics?.fines?.summary?.count ??
    analytics?.overdueCount ??
    0
  );

  const overdueTotalDays = Number(
    analytics?.overdue?.totalDays ??
    analytics?.fines?.summary?.total_overdue_days ??
    analytics?.fines?.summary?.totalDays ??
    analytics?.overdueTotalDays ??
    0
  );

  const affectedUsers = Number(
    analytics?.overdue?.affectedUsers ??
    analytics?.fines?.summary?.affected_users ??
    0
  );

  const finesCollectedTotal = Number(
    analytics?.fines?.totalCollected ??
    analytics?.fines?.summary?.total_collected ??
    0
  );

  const finesPenaltiesCount = Number(
    analytics?.fines?.totalPenalties ??
    analytics?.fines?.summary?.total_penalties ??
    0
  );

  const averageFineVal = Number(
    analytics?.fines?.averageFine ??
    analytics?.fines?.summary?.average ??
    0
  );

  // New: collectable (outstanding) fines
  const finesCollectable = Number(
    analytics?.fines?.collectable ??
    analytics?.fines?.total_unpaid_fines ??
    analytics?.fines?.summary?.total_pending_amount ??
    0
  );

  const finesUnpaidCount = Number(
    analytics?.fines?.unpaidPenalties ??
    analytics?.fines?.unpaid_penalty_count ??
    analytics?.fines?.summary?.pending_penalties ??
    0
  );

  // Use shared currency formatter for thousands separators + 2 decimals
  const formatMoney = (n) => formatCurrencyPHP(n);

  // Top Departments Bar Chart
  const departmentChartData = {
    labels: analytics?.topDepartments?.slice(0, 5).map(d => d.department_acronym) || [],
    datasets: [
      {
        label: "Total Borrows",
        data: analytics?.topDepartments?.slice(0, 5).map(d => d.borrow_count) || [],
        backgroundColor: "rgba(13, 110, 253, 0.7)",
      },
    ],
  };

  // User Type Distribution Doughnut
  const userTypeData = {
    labels: ['Students', 'Faculty'],
    datasets: [
      {
        data: [
          Number(analytics?.userSessions?.students || 0),
          Number(analytics?.userSessions?.faculty || 0)
        ],
        backgroundColor: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(25, 135, 84, 0.7)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Overdue and Fines Trend Chart
  const overdueFineTrendData = {
    labels: analytics?.overdueFineTrend?.map(m => m.month_label) || [],
    datasets: [
      {
        label: "Overdue Books",
        data: analytics?.overdueFineTrend?.map(m => m.overdue_count) || [],
        fill: true,
        borderColor: "#dc3545",
        backgroundColor: "rgba(220, 53, 69, 0.1)",
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: "Fines Collected (₱)",
        data: analytics?.overdueFineTrend?.map(m => m.fines_collected) || [],
        fill: true,
        borderColor: "#198754",
        backgroundColor: "rgba(25, 135, 84, 0.1)",
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Top Authors Bar Chart
  const topAuthorsChartData = {
    labels: analytics?.topAuthors?.slice(0, 8).map(a => a.author) || [],
    datasets: [
      {
        label: "Borrows",
        data: analytics?.topAuthors?.slice(0, 8).map(a => a.borrow_count) || [],
        backgroundColor: "rgba(13, 110, 253, 0.7)",
      },
    ],
  };

  // Top Genres Doughnut Chart
  const topGenresData = {
    labels: analytics?.topGenres?.slice(0, 6).map(g => g.genre) || [],
    datasets: [
      {
        data: analytics?.topGenres?.slice(0, 6).map(g => g.borrow_count) || [],
        backgroundColor: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(25, 135, 84, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(220, 53, 69, 0.7)',
          'rgba(13, 202, 240, 0.7)',
          'rgba(111, 66, 193, 0.7)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Period Selector */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Lib-Track | Dashboard</h4>
        <div className="btn-group" role="group">
          <button 
            className={`btn btn-sm ${period === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPeriod('daily')}
          >
            <FaCalendarDay className="me-1" /> Today
          </button>
          <button 
            className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPeriod('weekly')}
          >
            <FaCalendarWeek className="me-1" /> This Week
          </button>
          <button 
            className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPeriod('monthly')}
          >
            <FaCalendarAlt className="me-1" /> This Month
          </button>
          <button 
            className={`btn btn-sm ${period === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS BOARD - Overdue Books and Fines */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm border-start border-4 border-danger h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block mb-1">Overdue Books</small>
                <h4 className="fw-bold mb-1">{overdueCount}</h4>
                <small className="text-danger">{affectedUsers} users</small>
              </div>
              <FaExclamationTriangle className="text-danger" size={32} />
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm border-start border-4 border-warning h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block mb-1">Overdue Days</small>
                <h4 className="fw-bold mb-1">{overdueTotalDays}</h4>
                <small className="text-muted">Total accumulated</small>
              </div>
              <FaClock className="text-warning" size={32} />
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm border-start border-4 border-success h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block mb-1">Fines Collected</small>
                <h4 className="fw-bold mb-1">{formatMoney(finesCollectedTotal)}</h4>
                <small className="text-success">{finesPenaltiesCount} payments</small>
              </div>
              <FaMoneyBillWave className="text-success" size={32} />
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm border-start border-4 border-info h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                    <small className="text-muted d-block mb-1">Collectable Fine</small>
                    <h4 className="fw-bold mb-1">{formatMoney(finesCollectable)}</h4>
                    <small className="text-muted">{finesUnpaidCount} pending</small>
                  </div>
              <FaChartLine className="text-info" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. USER SESSION ANALYTICS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3 h-100">
            <FaUsers className="text-primary mb-2" size={28} />
            <h6 className="mb-1">Active Users</h6>
            <h4 className="fw-bold mb-0 text-primary">{analytics?.userSessions?.activeUsers || 0}</h4>
            <small className="text-muted">
              {period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time'}
            </small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3 h-100">
            <FaBook className="text-info mb-2" size={28} />
            <h6 className="mb-1">Students</h6>
            <h4 className="fw-bold mb-0 text-info">{analytics?.userSessions?.students || 0}</h4>
            <small className="text-muted">Active borrowers</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3 h-100">
            <FaClipboardList className="text-success mb-2" size={28} />
            <h6 className="mb-1">Faculty</h6>
            <h4 className="fw-bold mb-0 text-success">{analytics?.userSessions?.faculty || 0}</h4>
            <small className="text-muted">Active borrowers</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3 h-100">
            <FaChartLine className="text-warning mb-2" size={28} />
            <h6 className="mb-1">Transactions</h6>
            <h4 className="fw-bold mb-0 text-warning">{analytics?.userSessions?.transactions || 0}</h4>
            <small className="text-muted">Total for period</small>
          </div>
        </div>
      </div>

      {/* 2B. COLLECTION STATISTICS & PENDING REGISTRATIONS */}
      <div className="row g-3 mb-4">
        <div className="col-md-2 col-6">
          <div className="card shadow-sm text-center p-3 h-100 bg-primary bg-gradient text-white">
            <FaBook className="mb-2" size={24} />
            <h6 className="mb-1 fw-semibold">Total Books</h6>
            <h4 className="fw-bold mb-0">{analytics?.collectionStats?.totalBooks || 0}</h4>
            <small className="opacity-75">{analytics?.collectionStats?.totalBookCopies || 0} copies</small>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card shadow-sm text-center p-3 h-100 bg-success bg-gradient text-white">
            <FaFileAlt className="mb-2" size={24} />
            <h6 className="mb-1 fw-semibold">Research Papers</h6>
            <h4 className="fw-bold mb-0">{analytics?.collectionStats?.totalResearch || 0}</h4>
            <small className="opacity-75">Papers</small>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="card shadow-sm text-center p-3 h-100 bg-info bg-gradient text-white">
            <FaBookReader className="mb-2" size={24} />
            <h6 className="mb-1 fw-semibold">Total Items</h6>
            <h4 className="fw-bold mb-0">{analytics?.collectionStats?.totalItems || 0}</h4>
            <small className="opacity-75">Collection</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-2">
                  <FaUserCheck className="me-2 text-warning" />
                  Pending Registration Approvals
                </h6>
                <div className="d-flex gap-3 align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0 text-warning">{analytics?.pendingRegistrations?.total || 0}</h3>
                    <small className="text-muted">Waiting approval</small>
                  </div>
                  <div className="vr"></div>
                  <div>
                    <small className="text-muted d-block">Students</small>
                    <span className="badge bg-info fs-6">{analytics?.pendingRegistrations?.students || 0}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Faculty</small>
                    <span className="badge bg-success fs-6">{analytics?.pendingRegistrations?.faculty || 0}</span>
                  </div>
                </div>
              </div>
              <FaUserCheck className="text-warning opacity-25" size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Monthly Trend */}
        <div className="col-lg-8">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaChartLine className="me-2 text-primary" />
              Users Per Session - Trend
            </h6>
            <div style={{ height: '250px' }}>
              <Line 
                data={monthlyTrendData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaUsers className="me-2 text-success" />
              User Distribution
            </h6>
            <div style={{ height: '250px', position: 'relative' }}>
              <Doughnut 
                data={userTypeData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue & Fines Analytics Row */}
      <div className="row g-3 mb-4">
        {/* Overdue and Fines Trend */}
        <div className="col-lg-8">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaExclamationTriangle className="me-2 text-danger" />
              Overdue Books & Fines Collected - Trend
            </h6>
            <div style={{ height: '250px' }}>
              <Line 
                data={overdueFineTrendData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Overdue Books Count'
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Fines Collected (\u20b1)'
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Top Genres Distribution */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaBook className="me-2 text-info" />
              Top Borrowed Genres
            </h6>
            <div style={{ height: '250px', position: 'relative' }}>
              <Doughnut 
                data={topGenresData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOP BORROWING DEPARTMENT & AUTHORS */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaTrophy className="me-2 text-warning" />
              Top Borrowing Departments
            </h6>
            <div style={{ height: '250px' }}>
              <Bar 
                data={departmentChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Top Borrowed Authors */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">
              <FaBookReader className="me-2 text-primary" />
              Top Borrowed Authors
            </h6>
            <div style={{ height: '250px' }}>
              <Bar 
                data={topAuthorsChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Department Rankings Table */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="card shadow-sm p-3 h-100">
            <h6 className="fw-bold mb-3">Department Rankings</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Rank</th>
                    <th>Department</th>
                    <th className="text-center">Borrows</th>
                    <th className="text-center">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.topDepartments?.slice(0, 8).map((dept, index) => (
                    <tr key={dept.department_acronym}>
                      <td>
                        <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-danger' : 'bg-light text-dark'}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="fw-medium">{dept.department_name}</div>
                        <small className="text-muted">{dept.department_acronym}</small>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary">{dept.borrow_count}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-info">{dept.unique_borrowers}</span>
                      </td>
                    </tr>
                  ))}
                  {(!analytics?.topDepartments || analytics.topDepartments.length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TOP STUDENT BORROWERS */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-bold mb-3">
          <FaTrophy className="me-2 text-success" />
          Top Borrowers
        </h6>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '50px' }}>Rank</th>
                <th>Name</th>
                <th>Student/Faculty ID</th>
                <th>Department</th>
                <th className="text-center">Total Borrows</th>
                <th className="text-center">Currently Borrowed</th>
                <th className="text-center">Returned</th>
                <th>Last Borrow</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topBorrowers?.map((borrower, index) => (
                <tr key={borrower.user_id}>
                  <td>
                    <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-danger' : 'bg-light text-dark'}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                  </td>
                  <td>
                    <div className="fw-medium">{borrower.full_name}</div>
                    <small className="text-muted">
                      {borrower.position || 'Student'}
                      {borrower.year_level ? ` - Year ${borrower.year_level}` : ''}
                    </small>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">{borrower.user_identifier || borrower.student_id || borrower.faculty_id || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="badge bg-info">{borrower.department_acronym || 'N/A'}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary fs-6">{borrower.borrow_count}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-warning text-dark">{borrower.currently_borrowed}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success">{borrower.returned_count}</span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {borrower.last_borrow_date ? new Date(borrower.last_borrow_date).toLocaleDateString() : 'N/A'}
                    </small>
                  </td>
                </tr>
              ))}
              {(!analytics?.topBorrowers || analytics.topBorrowers.length === 0) && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No borrowing data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
