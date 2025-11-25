import React, { useState, useEffect } from "react";
import {
  FaUserShield,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCog,
  FaShieldAlt
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners';

import ToastNotification from "../components/ToastNotification";
import AddAdminModal from "../modals/AddAdminModal";
import EditAdminModal from "../modals/EditAdminModal";
import DeleteAdminModal from "../modals/DeleteAdminModal";
import PermissionsModal from "../modals/PermissionsModal";

import { getAdmins } from "../../api/manage_admins/get_admin";
import { createAdmin } from "../../api/manage_admins/create_admin";
import { updateAdmin } from "../../api/manage_admins/update_admin";
import { deleteAdmin } from "../../api/manage_admins/delete_admin";

function ManageAdministrators() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // API-backed administrators list (start empty; always fetched from API)
  const [administrators, setAdministrators] = useState([]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Helper to convert API admin shape to frontend shape
  const convertAdmin = (a) => ({
    id: a.admin_id ?? a.id,
    firstName: a.firstName ?? a.first_name,
    lastName: a.lastName ?? a.last_name,
    email: a.email,
    role: a.role,
    status: a.status,
    createdAt: a.createdAt ?? a.created_at,
    lastLogin: (() => {
      const raw = a.lastLogin ?? a.last_login;
      if (!raw) return 'Never';
      try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return String(raw);
        return d.toLocaleString();
      } catch (err) {
        return String(raw);
      }
    })(),
    permissions: a.permissions ?? {
      dashboard: !!a.perm_dashboard,
      manageBooks: !!a.perm_manage_books,
      bookReservations: !!a.perm_book_reservations,
      manageRegistrations: !!a.perm_manage_registrations,
      bookTransactions: !!a.perm_book_transactions,
      managePenalties: !!a.perm_manage_penalties,
      activityLogs: !!a.perm_activity_logs,
      settings: !!a.perm_settings,
      manageAdministrators: !!a.perm_manage_administrators,
    }
  });

  // Sort admins ascending by id
  const sortAdminsAsc = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((x, y) => (Number(x.id) || 0) - (Number(y.id) || 0));
  };

  // Load admins from API on mount (if backend available)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdmins();
        if (mounted && Array.isArray(data)) {
          setAdministrators(sortAdminsAsc(data.map(convertAdmin)));
        } else if (mounted) {
          setAdministrators([]);
          setApiError('Failed to load administrators');
        }
      } catch (err) {
        console.error('Could not load admins from API:', err);
        if (mounted) {
          setAdministrators([]);
          setApiError('Failed to load administrators from server');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  // Permission list for modals

  const permissionsList = [
    { key: "dashboard", label: "Dashboard", icon: "📊", description: "View system overview and statistics" },
    { key: "manageBooks", label: "Manage Books", icon: "📚", description: "Add, edit, and remove books from the library" },
    { key: "bookReservations", label: "Book Reservations", icon: "🔖", description: "Manage book reservation requests" },
    { key: "manageRegistrations", label: "Manage Registrations", icon: "👥", description: "Approve or reject user registrations" },
    { key: "bookTransactions", label: "Book Transactions", icon: "🔄", description: "View and manage book borrowing transactions" },
    { key: "managePenalties", label: "Manage Penalties", icon: "⚠️", description: "Handle overdue fines and penalties" },
    { key: "activityLogs", label: "Activity Logs", icon: "📋", description: "View system activity and audit logs" },
    { key: "settings", label: "Settings", icon: "⚙️", description: "Configure system settings and preferences" }
  ];

  const roles = ["Super Admin", "Admin"];

  // Filtered administrators
  const filteredAdmins = administrators.filter((admin) =>
    `${admin.firstName} ${admin.lastName} ${admin.email} ${admin.role}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddAdmin = async (formData) => {
    // Validate passwords
    if (!formData.password) {
      ToastNotification.error('Password is required');
      throw new Error('Password is required');
    }
    if (formData.password !== formData.confirmPassword) {
      ToastNotification.error('Passwords do not match');
      throw new Error('Passwords do not match');
    }

    try {
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        permissions: {
          dashboard: true,
          manageBooks: false,
          bookReservations: false,
          manageRegistrations: false,
          bookTransactions: false,
          managePenalties: false,
          activityLogs: false,
          settings: false,
          manageAdministrators: formData.role === 'Super Admin'
        }
      };
      const created = await createAdmin(payload);
      setAdministrators(sortAdminsAsc([...administrators, convertAdmin(created)]));
      setShowAddModal(false);
      ToastNotification.success(`Administrator ${formData.firstName} ${formData.lastName} added successfully!`);
    } catch (err) {
      console.error(err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to create administrator');
      ToastNotification.error(errorMsg);
      throw err;
    }
  };

  const handleEditAdmin = async (formData) => {
    if (!selectedAdmin) return;
    if (formData.password && formData.password !== formData.confirmPassword) {
      ToastNotification.error('Passwords do not match');
      throw new Error('Passwords do not match');
    }

    try {
      
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: {
          ...selectedAdmin.permissions,
          manageAdministrators: formData.role === 'Super Admin'
        }
      };
      if (formData.password) payload.password = formData.password;

      const updated = await updateAdmin(selectedAdmin.id, payload);
      setAdministrators(
        sortAdminsAsc(administrators.map((admin) => (admin.id === selectedAdmin.id ? convertAdmin(updated) : admin)))
      );
      setShowEditModal(false);
      setSelectedAdmin(null);
      ToastNotification.success(`Administrator ${formData.firstName} ${formData.lastName} updated successfully!`);
    } catch (err) {
      console.error(err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to update administrator');
      ToastNotification.error(errorMsg);
      throw err;
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      
      await deleteAdmin(selectedAdmin.id);
      const deletedName = `${selectedAdmin.firstName} ${selectedAdmin.lastName}`;
      setAdministrators(sortAdminsAsc(administrators.filter((admin) => admin.id !== selectedAdmin.id)));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      ToastNotification.success(`Administrator ${deletedName} deleted successfully!`);
    } catch (err) {
      console.error(err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to delete administrator');
      ToastNotification.error(errorMsg);
      throw err;
    }
  };

  const handleUpdatePermissions = async (permissionsData) => {
    if (!selectedAdmin) return;

    try {
      
      const payload = { 
        permissions: {
          ...permissionsData,
          manageAdministrators: selectedAdmin.role === 'Super Admin' // Always true for Super Admin
        }
      };
      const updated = await updateAdmin(selectedAdmin.id, payload);
      setAdministrators(
        sortAdminsAsc(administrators.map((admin) => (admin.id === selectedAdmin.id ? convertAdmin(updated) : admin)))
      );
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
      ToastNotification.success(`Permissions updated for ${selectedAdmin.firstName} ${selectedAdmin.lastName}!`);
    } catch (err) {
      console.error(err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Failed to update permissions');
      ToastNotification.error(errorMsg);
      throw err;
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin);
    setShowPermissionsModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };



  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-2">
                <FaUserShield className="me-3 text-primary" />
                Manage Administrators
              </h2>
              <p className="text-muted mb-0">
                Add, edit, and manage administrator accounts and permissions
              </p>
            </div>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Add Administrator
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaUserShield className="text-primary fs-4" />
                  </div>
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Total Admins</h6>
                  <h3 className="mb-0 fw-bold">{administrators.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div
                    className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaCheckCircle className="text-success fs-4" />
                  </div>
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Active</h6>
                  <h3 className="mb-0 fw-bold">
                    {administrators.filter((a) => a.status === "Active").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div
                    className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaTimesCircle className="text-warning fs-4" />
                  </div>
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Inactive</h6>
                  <h3 className="mb-0 fw-bold">
                    {administrators.filter((a) => a.status === "Inactive").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div
                    className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaShieldAlt className="text-info fs-4" />
                  </div>
                </div>
                <div>
                  <h6 className="text-muted mb-1 small">Super Admins</h6>
                  <h3 className="mb-0 fw-bold">
                    {administrators.filter((a) => a.role === "Super Admin").length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Administrators Table */}
      {loading ? (
        <div className="card shadow-sm border-0">
          <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
            <div className="text-center">
              <ClipLoader color="#0d6efd" size={60} />
              <div className="mt-3 text-muted">Loading administrators...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {apiError && (
              <div className="alert alert-danger">{apiError}</div>
            )}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Administrator</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2"
                              style={{ width: 40, height: 40 }}
                            >
                              <FaUserShield className="text-primary" />
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {admin.firstName} {admin.lastName}
                              </div>
                              <small className="text-muted">ID: {admin.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{admin.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              admin.role === "Super Admin"
                                ? "bg-danger"
                                : admin.role === "Admin"
                                ? "bg-primary"
                                : admin.role === "Librarian"
                                ? "bg-info"
                                : "bg-secondary"
                            }`}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              admin.status === "Active" ? "bg-success" : "bg-warning text-dark"
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{admin.lastLogin}</small>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => openPermissionsModal(admin)}
                              title="Manage Permissions"
                            >
                              <FaUserCog />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditModal(admin)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openDeleteModal(admin)}
                              title="Delete"
                              disabled={admin.role === "Super Admin"}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No administrators found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddAdminModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAdmin}
        roles={roles}
      />

      <EditAdminModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleEditAdmin}
        admin={selectedAdmin}
        roles={roles}
      />

      <DeleteAdminModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAdmin}
        admin={selectedAdmin}
      />

      <PermissionsModal
        show={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        onUpdate={handleUpdatePermissions}
        admin={selectedAdmin}
        permissionsList={permissionsList}
      />
    </div>
  );
}

export default ManageAdministrators;
