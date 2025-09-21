import React from 'react';
import { FaCog, FaUserShield, FaDatabase, FaBell } from "react-icons/fa";
import ManageShelfLocation from "../components/ManageShelfLocation";

function Settings() {
  return (
    <div className="container py-4">

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaCog className="text-primary mb-2" size={24} />
            <h6 className="mb-1">General</h6>
            <p className="fw-bold mb-0">Configure App</p>
            <small className="text-muted">Basic settings</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaUserShield className="text-success mb-2" size={24} />
            <h6 className="mb-1">Security</h6>
            <p className="fw-bold mb-0">Manage Access</p>
            <small className="text-muted">User roles</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaDatabase className="text-warning mb-2" size={24} />
            <h6 className="mb-1">Database</h6>
            <p className="fw-bold mb-0">Backup & Restore</p>
            <small className="text-muted">Data safety</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm text-center p-3">
            <FaBell className="text-danger mb-2" size={24} />
            <h6 className="mb-1">Notifications</h6>
            <p className="fw-bold mb-0">Alerts & Updates</p>
            <small className="text-muted">Stay informed</small>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">General Settings</h6>
            <p>Configure the basic settings of the application.</p>
            <button className="btn btn-primary btn-sm">Edit</button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Security Settings</h6>
            <p>Manage user roles and permissions.</p>
            <button className="btn btn-success btn-sm">Manage</button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Database Settings</h6>
            <p>Backup and restore your data.</p>
            <button className="btn btn-warning btn-sm">Backup</button>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Notification Settings</h6>
            <p>Set up alerts and updates.</p>
            <button className="btn btn-danger btn-sm">Configure</button>
          </div>
        </div>
        <div className="col-12">
          <div className="card shadow-sm p-3">
            <h6 className="fw-bold mb-3">Manage Shelves</h6>
            <ManageShelfLocation />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;