import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import ManageBooks from "./pages/ManageBooks";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <ToastContainer />
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          zIndex: -1,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3CradialGradient id='a' cx='0' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23880000'/%3E%3Cstop offset='1' stop-color='%23880000' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='b' cx='1200' cy='800' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23880000'/%3E%3Cstop offset='1' stop-color='%23880000' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='c' cx='600' cy='0' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23880000'/%3E%3Cstop offset='1' stop-color='%23880000' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='d' cx='600' cy='800' r='600' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23FFFFFF'/%3E%3Cstop offset='1' stop-color='%23FFFFFF' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='e' cx='0' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23880000'/%3E%3Cstop offset='1' stop-color='%23880000' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='f' cx='1200' cy='0' r='800' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23880000'/%3E%3Cstop offset='1' stop-color='%23880000' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='1200' height='800'/%3E%3Crect fill='url(%23b)' width='1200' height='800'/%3E%3Crect fill='url(%23c)' width='1200' height='800'/%3E%3Crect fill='url(%23d)' width='1200' height='800'/%3E%3Crect fill='url(%23e)' width='1200' height='800'/%3E%3Crect fill='url(%23f)' width='1200' height='800'/%3E%3C/svg%3E")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Subtle patterns overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          zIndex: -1,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg py-2 wmsu-bg-primary text-white">
        <div className="container">
          <Link
            className="navbar-brand fw-semibold fs-6 text-white d-flex align-items-center"
            to="/"
          >
            <img
              src="/wmsu_logo.png"
              alt="WMSU Logo"
              height="30"
              className="me-2"
            />
            WMSU Lib-Track
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto text-center small">
              <li className="nav-item">
                <Link className="nav-link text-white" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/manage-books">
                  Manage Books
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" to="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <main className="container flex-grow-1 py-3">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="text-center mb-4">
                  <img
                    src="/wmsu_logo.png"
                    alt="WMSU Logo"
                    height="80"
                    className="mb-2"
                  />
                  <header className="px-2">
                    <h2 className="fw-bold fs-4 mb-1 wmsu-text-primary">
                      WMSU Library Tracker
                    </h2>
                    <p className="text-muted small mb-0">
                      Western Mindanao State University Library Management
                      System
                    </p>
                  </header>
                </div>
              </>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage-books" element={<ManageBooks />} />
          <Route path="/contact" element={<p>Contact Page</p>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 border-top mt-auto text-white wmsu-bg-primary-semi">
        <p className="mb-0 small">
          Lib-Track © {new Date().getFullYear()} | CodeHub.Site
        </p>
      </footer>
    </div>
  );
}

export default App;
