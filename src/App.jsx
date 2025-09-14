import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/Dashboard";
import ManageBooks from "./pages/ManageBooks";

function SidebarWrapper({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 250, zIndex: 1040, background: 'transparent' }}>
      <Sidebar />
    </div>
  );
}

function App() {
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    function handleResize() {
      setShowSidebar(window.innerWidth >= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <ToastContainer />
      {/* Backgrounds */}
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
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          zIndex: -1,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* SIDEBAR */}
      <SidebarWrapper show={showSidebar} />
      <div style={{ marginLeft: showSidebar ? 250 : 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* NAVBAR */}
        <Navbar />
        {/* Main Content */}
        <main className="container flex-grow-1 py-3">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-books" element={<ManageBooks />} />
            <Route path="/manage-registrations" element={<p>Manage Registrations Page</p>} />
            <Route path="/book-transactions" element={<p>Book Transactions Page</p>} />
            <Route path="/manage-penalties" element={<p>Manage Penalties Page</p>} />
            <Route path="/activity-logs" element={<p>Activity Logs Page</p>} />
            <Route path="/settings" element={<p>Settings Page</p>} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
        {/* Footer */}
        <footer className="text-center py-2 border-top mt-auto text-white wmsu-bg-primary-semi">
          <p className="mb-0 small">
            Lib-Track © {new Date().getFullYear()} | CodeHub.Site
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
