// Import Necessary Modules And Components
import React, { useState, useEffect } from "react";
import GeneralSettings from "../components/GeneralSettings";
import RulesAndRegulations from "../components/RulesAndRegulations";
import { FaPlus, FaTrash, FaCog, FaBookOpen, FaGavel } from "react-icons/fa";
import ManageShelfLocation from "../components/ManageShelfLocation";
import { getDepartments } from "../../api/settings/get_departments";
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

  const addProgram = () => {
    if (
      newProgram.trim() &&
      !programs.some((program) => program.department_name === newProgram.trim())
    ) {
      setPrograms([...programs, { department_name: newProgram.trim() }]);
      setNewProgram("");
    }
  };

  const removeProgram = (programName) => {
    setPrograms(
      programs.filter((program) => program.department_name !== programName)
    );
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
                borderTopRightRadius: "0.375rem",
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
        </div>
      </div>
    </div>
  );
}

export default Settings;
