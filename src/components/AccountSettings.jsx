// Import Necessary Modules And Components
import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaSave } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import authService from "../utils/auth";
import { updateAccount } from "../../api/admin/update_account";
import ToastNotification from "./ToastNotification";

function AccountSettings() {
  const adminUser = authService.getUser();
  
  const [formData, setFormData] = useState({
    firstName: adminUser?.firstName || "",
    lastName: adminUser?.lastName || "",
    email: adminUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATE REQUIRED FIELDS
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      ToastNotification.error("First name, last name, and email are required.");
      return;
    }

    if (!formData.currentPassword) {
      ToastNotification.error("Current password is required to update your account.");
      return;
    }

    // VALIDATE PASSWORD CHANGE IF REQUESTED
    if (showPasswordFields) {
      if (!formData.newPassword) {
        ToastNotification.error("Please enter a new password.");
        return;
      }

      if (formData.newPassword.length < 8) {
        ToastNotification.error("New password must be at least 8 characters long.");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        ToastNotification.error("New passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const updateData = {
        adminId: adminUser.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        currentPassword: formData.currentPassword,
      };

      // INCLUDE NEW PASSWORD IF CHANGING
      if (showPasswordFields && formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateAccount(updateData);

      if (response.success) {
        // UPDATE STORED USER DATA IN AUTH SERVICE
        authService.updateUser(response.user);
        
        ToastNotification.success("Account updated successfully!");

        // CLEAR PASSWORD FIELDS
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setShowPasswordFields(false);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      ToastNotification.error(error.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Account Settings
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* PERSONAL INFORMATION SECTION */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">Personal Information</h6>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted">
                      Role: <strong>{adminUser?.role}</strong>
                    </label>
                  </div>
                </div>

                {/* PASSWORD SECTION */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-dark mb-0">Change Password</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      disabled={loading}
                    >
                      {showPasswordFields ? "Cancel Password Change" : "Change Password"}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="newPassword" className="form-label">
                          New Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter new password (min 8 characters)"
                          />
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CURRENT PASSWORD VERIFICATION */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3">Verify Your Identity</h6>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Enter your current password to confirm changes"
                        required
                      />
                    </div>
                    <small className="form-text text-muted">
                      Required to verify your identity before making changes
                    </small>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ClipLoader size={16} color="#fff" loading={true} />
                        <span className="ms-2">Updating...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Update Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
