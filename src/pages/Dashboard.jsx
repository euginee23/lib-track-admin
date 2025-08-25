import { useState } from "react";
import { FaBook, FaUsers, FaClock, FaClipboardList, FaHistory } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function Dashboard() {
  const [chartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    datasets: [
      {
        label: "Books Borrowed",
        data: [120, 150, 180, 220, 200, 240, 260, 300, 350],
        fill: true,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.3,
      },
    ],
  });

  const recentHistory = [
    { id: 1, user: "John Doe", book: "Harry Potter", date: "2025-08-15", status: "Returned" },
    { id: 2, user: "Jane Smith", book: "The Hobbit", date: "2025-08-14", status: "Borrowed" },
    { id: 3, user: "Michael Lee", book: "1984", date: "2025-08-13", status: "Borrowed" },
    { id: 4, user: "Sarah Brown", book: "To Kill a Mockingbird", date: "2025-08-12", status: "Returned" },
  ];

  return (
    <div className="container py-4">

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBook className="text-primary mb-2" size={24} />
            <h6 className="mb-1">Books Borrowed</h6>
            <p className="fw-bold mb-0">1,240</p>
            <small className="text-success">+8% this month</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaUsers className="text-success mb-2" size={24} />
            <h6 className="mb-1">Total Members</h6>
            <p className="fw-bold mb-0">560</p>
            <small className="text-success">+12 new</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaClipboardList className="text-warning mb-2" size={24} />
            <h6 className="mb-1">Books in Library</h6>
            <p className="fw-bold mb-0">3,200</p>
            <small className="text-muted">Updated daily</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaClock className="text-danger mb-2" size={24} />
            <h6 className="mb-1">Pending Requests</h6>
            <p className="fw-bold mb-0">15</p>
            <small className="text-danger">+5 since yesterday</small>
          </div>
        </div>
      </div>

      {/* Chart + Top Books */}
      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Monthly Borrowed Books</h6>
            <Line data={chartData} height={100} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Top Borrowed Books</h6>
            <div className="mb-2">
              <small>Harry Potter</small>
              <div className="progress">
                <div className="progress-bar bg-primary" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div className="mb-2">
              <small>The Hobbit</small>
              <div className="progress">
                <div className="progress-bar bg-success" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="mb-2">
              <small>1984</small>
              <div className="progress">
                <div className="progress-bar bg-warning" style={{ width: "50%" }}></div>
              </div>
            </div>
            <div className="mb-2">
              <small>To Kill a Mockingbird</small>
              <div className="progress">
                <div className="progress-bar bg-danger" style={{ width: "40%" }}></div>
              </div>
            </div>
            <button className="btn btn-link btn-sm mt-2">View More</button>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="card shadow-sm p-3">
        <h6 className="fw-bold mb-3">
          <FaHistory className="me-2 text-secondary" />
          Recent History
        </h6>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((item) => (
                <tr key={item.id}>
                  <td>{item.user}</td>
                  <td>{item.book}</td>
                  <td>{item.date}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === "Borrowed" ? "bg-primary" : "bg-success"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
