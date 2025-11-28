// Import Necessary Modules And Components
import React, { useState, useEffect } from "react";
import GeneralSettings from "../components/GeneralSettings";
import RulesAndRegulations from "../components/RulesAndRegulations";
import KioskSettings from "../components/KioskSettings";
import AccountSettings from "../components/AccountSettings";
import ChatbotFAQs from "../components/ChatbotFAQs";
import { FaPlus, FaTrash, FaCog, FaBookOpen, FaGavel, FaDesktop, FaUser, FaQuestionCircle } from "react-icons/fa";
import ManageShelfLocation from "../components/ManageShelfLocation";
import { getDepartments } from "../../api/settings/get_departments";
import { createDepartment } from "../../api/settings/create_department";
import { updateDepartment } from "../../api/settings/update_department";
import { deleteDepartment } from "../../api/settings/delete_department";
import { getSystemSettings } from "../../api/settings/get_settings";
import { updateSystemSettings } from "../../api/settings/update_settings";
import ToastNotification from "../components/ToastNotification";

function Settings() {
  const [activeMainTab, setActiveMainTab] = useState("general");
  const [activeTab, setActiveTab] = useState("borrowing");
  const [programs, setPrograms] = useState([]);
  const [newProgram, setNewProgram] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowingLimits, setBorrowingLimits] = useState({});
  const [fineStructure, setFineStructure] = useState({});
  const [kioskSettings, setKioskSettings] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // FETCH DEPARTMENTS AND SYSTEM SETTINGS IN PARALLEL
        const [departments, systemSettings] = await Promise.all([
          getDepartments(),
          getSystemSettings()
        ]);

        setPrograms(departments);
        
        // UPDATE STATE WITH FETCHED SYSTEM SETTINGS
        if (systemSettings.borrowingLimits) {
          setBorrowingLimits(prev => ({
            ...prev,
            ...systemSettings.borrowingLimits
          }));
        }

        if (systemSettings.fineStructure) {
          setFineStructure(prev => ({
            ...prev,
            ...systemSettings.fineStructure
          }));
        }

        if (systemSettings.kioskSettings) {
          setKioskSettings(prev => ({
            ...prev,
            ...systemSettings.kioskSettings
          }));
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLimitChange = (role, field, value) => {
    setBorrowingLimits((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleFineChange = (role, field, value) => {
    setFineStructure((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const addProgram = (opts) => {
    (async () => {
      if (opts && (opts.name || opts.acronym !== undefined)) {
        await createProgram({ name: opts.name, acronym: opts.acronym || '' });
        return;
      }

      // Maintain compatibility with previous usage (no args)
      const name = (newProgram || '').trim();
      if (!name) return;
      await createProgram({ name, acronym: '' });
    })();
  };

  const removeProgram = (programName) => {
    (async () => {
      // programName may be an object (department) or a string
      let id = null;
      let nameToRemove = null;
      if (typeof programName === 'object' && programName !== null) {
        id = programName.department_id;
        nameToRemove = programName.department_name || '';
      } else {
        nameToRemove = String(programName || '');
      }

      if (id) {
        try {
          await deleteDepartment(id);
          setPrograms(programs.filter(p => (p.department_id ? p.department_id !== id : (p.department_name || p) !== nameToRemove)));
          ToastNotification.success('Program deleted');
        } catch (err) {
          console.error('Delete failed:', err);
          ToastNotification.error('Failed to delete program: ' + (err?.message || err));
        }
      } else {
        // fallback: remove locally by name
        setPrograms(programs.filter((program) => (program.department_name || program) !== nameToRemove));
      }
    })();
  };
  const createProgram = async ({ name, acronym = '' }) => {
    if (!name || !name.trim()) return;
    if (programs.some((program) => (program.department_name || program) === name.trim())) {
      ToastNotification.error('Program already exists');
      return;
    }
    try {
      const created = await createDepartment({ department_name: name.trim(), department_acronym: acronym });
      setPrograms([...programs, created]);
      setNewProgram('');
      ToastNotification.success('Program created');
      return created;
    } catch (err) {
      console.error('Create program failed:', err);
      ToastNotification.error('Failed to create program: ' + (err?.message || err));
      throw err;
    }
  };

  const editProgram = (programObj, newName, newAcronym = '') => {
    (async () => {
      const id = programObj.department_id;
      if (!id) {
        ToastNotification.error('Cannot edit program without id');
        return;
      }
      try {
        const updated = await updateDepartment(id, { department_name: newName, department_acronym: newAcronym });
        setPrograms(programs.map(p => (p.department_id === id ? updated : p)));
        ToastNotification.success('Program updated');
      } catch (err) {
        console.error('Update failed:', err);
        ToastNotification.error('Failed to update program: ' + (err?.message || err));
      }
    })();
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const settingsData = {
        borrowingLimits,
        fineStructure,
        kioskSettings
      };

      await updateSystemSettings(settingsData);
      
      // SHOW SUCCESS MESSAGE USING TOAST NOTIFICATION
      ToastNotification.success("Settings saved successfully!");
      
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError(error.message || "Failed to save settings");
      ToastNotification.error("Failed to save settings: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* MAIN TAB NAVIGATION */}
      <div className="card shadow-sm mb-4">
        <div className="card-header p-0" style={{ backgroundColor: "#f8f9fa" }}>
          <div className="d-flex">
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "general"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("general")}
              style={{
                borderRadius: 0,
                borderTopLeftRadius: "0.375rem",
                borderTop: activeMainTab === "general" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "general" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "general" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "general" ? "#0d6efd" : "#fff",
                color: activeMainTab === "general" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaCog className="me-2" />
              General Settings
            </button>
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "shelves"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("shelves")}
              style={{
                borderRadius: 0,
                borderTop: activeMainTab === "shelves" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "shelves" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "shelves" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "shelves" ? "#0d6efd" : "#fff",
                color: activeMainTab === "shelves" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaBookOpen className="me-2" />
              Manage Shelves
            </button>
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "rules"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("rules")}
              style={{
                borderRadius: 0,
                borderTop: activeMainTab === "rules" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "rules" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "rules" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "rules" ? "#0d6efd" : "#fff",
                color: activeMainTab === "rules" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaGavel className="me-2" />
              Rules & Regulations
            </button>
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "kiosk"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("kiosk")}
              style={{
                borderRadius: 0,
                borderTop: activeMainTab === "kiosk" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "kiosk" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "kiosk" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "kiosk" ? "#0d6efd" : "#fff",
                color: activeMainTab === "kiosk" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaDesktop className="me-2" />
              Kiosk Settings
            </button>
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "faqs"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("faqs")}
              style={{
                borderRadius: 0,
                borderTop: activeMainTab === "faqs" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "faqs" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "faqs" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "faqs" ? "#0d6efd" : "#fff",
                color: activeMainTab === "faqs" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaQuestionCircle className="me-2" />
              FAQs
            </button>
            <button
              className={`btn d-flex align-items-center px-4 py-3 flex-grow-1 ${
                activeMainTab === "account"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setActiveMainTab("account")}
              style={{
                borderRadius: 0,
                borderTopRightRadius: "0.375rem",
                borderTop: activeMainTab === "account" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderLeft: activeMainTab === "account" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderRight: activeMainTab === "account" ? "2px solid #0d6efd" : "1px solid #dee2e6",
                borderBottom: "none",
                backgroundColor:
                  activeMainTab === "account" ? "#0d6efd" : "#fff",
                color: activeMainTab === "account" ? "#fff" : "#6c757d",
                fontWeight: "500",
              }}
            >
              <FaUser className="me-2" />
              Account Settings
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {/* GENERAL SETTINGS TAB CONTENT */}
          {activeMainTab === "general" && (
            <div className="p-4">
              {loading && (
                <div className="text-center mb-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading settings...</p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger mb-4">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {!loading && (
                <GeneralSettings
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  borrowingLimits={borrowingLimits}
                  handleLimitChange={handleLimitChange}
                  fineStructure={fineStructure}
                  handleFineChange={handleFineChange}
                  programs={programs}
                  newProgram={newProgram}
                  setNewProgram={setNewProgram}
                  addProgram={addProgram}
                  removeProgram={removeProgram}
                  editProgram={editProgram}
                  kioskSettings={kioskSettings}
                  setKioskSettings={setKioskSettings}
                  onSaveSettings={saveSettings}
                  isSaving={loading}
                />
              )}
            </div>
          )}

          {/* MANAGE SHELVES TAB CONTENT */}
          {activeMainTab === "shelves" && (
            <div className="p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2">Shelf Management</h5>
                <p className="text-muted mb-4">
                  Organize and manage your library shelf locations
                </p>
              </div>
              <ManageShelfLocation />
            </div>
          )}

          {/* RULES & REGULATIONS TAB CONTENT */}
          {activeMainTab === "rules" && (
            <div className="p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2">Library Rules & Regulations</h5>
                <p className="text-muted mb-4">
                  Define and manage library rules, policies, and patron conduct guidelines
                </p>
              </div>
              <RulesAndRegulations />
            </div>
          )}

          {/* KIOSK SETTINGS TAB CONTENT */}
          {activeMainTab === "kiosk" && (
            <div className="p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2">Kiosk Configuration</h5>
                <p className="text-muted mb-4">
                  Configure security settings and access controls for library kiosk terminals
                </p>
              </div>
              <KioskSettings />
            </div>
          )}

          {/* FAQS TAB CONTENT */}
          {activeMainTab === "faqs" && (
            <div className="p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-2">Chatbot FAQs Management</h5>
                <p className="text-muted mb-4">
                  Create and manage frequently asked questions for the library chatbot system
                </p>
              </div>
              <ChatbotFAQs />
            </div>
          )}

          {/* ACCOUNT SETTINGS TAB CONTENT */}
          {activeMainTab === "account" && (
            <div className="p-4">
              <AccountSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
