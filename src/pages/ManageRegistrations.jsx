import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaFileAlt } from "react-icons/fa";
import ViewRegistrationModal from "../modals/ViewRegistration_Modal";
import { getRegistrations } from "../../api/manage_registrations/get_registrations";
import { updateRegistrationApproval } from "../../api/manage_registrations/registrationApproval";
import ToastNotification from "../components/ToastNotification";
import { getDepartments } from "../../api/settings/get_departments";

const ManageRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filter, setFilter] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRegistration, setViewingRegistration] = useState(null);
  const [approving, setApproving] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const data = await getRegistrations(currentPage, rowsPerPage);
        setRegistrations(data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleView = (registration) => {
    console.log("Opening modal for user_id:", registration.user_id);
    console.log("Registration object:", registration);
    setViewingRegistration(registration);
    setShowViewModal(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectRegistration = (id) => {
    setSelectedRegistrations((prev) =>
      prev.includes(id) ? prev.filter((regId) => regId !== id) : [...prev, id]
    );
  };

  // Filter registrations based on search input and status
  let filteredRegistrations = registrations.filter((registration) => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return true;

    const fullName = `${registration.first_name} ${registration.last_name}`.toLowerCase();
    const email = (registration.email || "").toLowerCase();
    const department = (registration.department_name || "").toLowerCase();

    return (
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      department.includes(searchTerm)
    );
  });

  if (filter === "status" && filterStatus) {
    filteredRegistrations = filteredRegistrations.filter((registration) => {
      if (filterStatus === "pending") {
        return registration.librarian_approval === 0;
      } else if (filterStatus === "approved") {
        return registration.librarian_approval === 1;
      }
      return true;
    });
  }

  // Filter by position
  if (filter === "position" && filterStatus) {
    filteredRegistrations = filteredRegistrations.filter(
      (registration) => registration.position === filterStatus
    );
  }

  // Filter by department
  if (filter === "department" && filterStatus) {
    filteredRegistrations = filteredRegistrations.filter(
      (registration) => registration.department_name === filterStatus
    );
  }

  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredRegistrations.length / rowsPerPage);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, search, rowsPerPage]);

  const isFiltered = (filter === "status" && !!filterStatus) || (filter === "position" && !!filterStatus) || (filter === "department" && !!filterStatus);

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Search + Generate Report Button */}
      <div className="card mb-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Search input with icon */}
          <div className="input-group" style={{ width: "350px" }}>
            <span className="input-group-text p-1 bg-white">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search registrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="vr mx-2" style={{ height: "30px", width: "1px", backgroundColor: "#ccc" }}></div>
          <button
            className="btn btn-sm btn-primary"
            style={{ backgroundColor: "#17a2b8", borderColor: "#17a2b8" }}
            onClick={() => alert("Generate report function hasn't been implemented")}
          >
            <FaFileAlt className="me-1" /> Generate Report
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
            <label className="form-label small mb-0">Filter by:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "150px" }}
              value={filter}
              onChange={(e) => {
                if (!isFiltered) {
                  setFilter(e.target.value);
                }
              }}
              disabled={isFiltered}
            >
              <option value="">All</option>
              <option value="status">Status</option>
              <option value="position">Position</option>
              <option value="department">Department</option>
            </select>
            {filter === "status" && (
              <select
                className="form-select form-select-sm"
                style={{ width: "120px" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            )}
            {filter === "position" && (
              <select
                className="form-select form-select-sm"
                style={{ width: "150px" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Positions</option>
                <option value="Student">Student</option>
                <option value="Regular">Regular</option>
                <option value="Visiting Lecturer">Visiting Lecturer</option>
              </select>
            )}
            {/* Filter by department */}
            {filter === "department" && (
              <select
                className="form-select form-select-sm"
                style={{ width: "150px" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department.department_id} value={department.department_name}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            )}
            {/* Undo Filter Button */}
            {isFiltered && (
              <button
                className="btn btn-sm btn-warning"
                onClick={() => {
                  setFilter("");
                  setFilterStatus("");
                }}
              >
                Undo Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div
        className="card shadow-sm p-2 flex-grow-1 d-flex flex-column"
        style={{ minHeight: "0", overflow: "hidden" }}
      >
        <div
          className="table-responsive flex-grow-1"
          style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
        >
          <table className="table table-sm table-striped align-middle mb-0">
            <thead className="small">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedRegistrations(
                        e.target.checked
                          ? paginatedRegistrations.map((reg) => reg.user_id)
                          : []
                      )
                    }
                    checked={
                      paginatedRegistrations.length > 0 &&
                      selectedRegistrations.length === paginatedRegistrations.length
                    }
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRegistrations.length === 0 && registrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((registration) => (
                  <tr
                    key={registration.user_id}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleSelectRegistration(registration.user_id);
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        onChange={(e) => e.stopPropagation()}
                        checked={selectedRegistrations.includes(registration.user_id)}
                      />
                    </td>
                    <td>{`${registration.first_name} ${registration.last_name}`}</td>
                    <td>{registration.email}</td>
                    <td>{registration.department_name}</td>
                    <td>{registration.position || "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          registration.librarian_approval === 1
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {registration.librarian_approval === 1 ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>{new Date(registration.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
              {currentPage === totalPages && paginatedRegistrations.length > 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-2">
                    No more rows.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="small">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div className="d-flex gap-2">
            {/* View button - only show for single selection */}
            {selectedRegistrations.length === 1 && (
              <>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ width: "100px" }}
                  onClick={() => {
                    const registration = registrations.find(
                      (reg) => reg.user_id === selectedRegistrations[0]
                    );
                    if (registration) {
                      handleView(registration);
                    } else {
                      console.error("Registration not found for user_id:", selectedRegistrations[0]);
                    }
                  }}
                >
                  <FaEye size={12} /> View
                </button>
              </>
            )}

            {/* Approve button - show for multiple selections */}
            {selectedRegistrations.length > 0 && (
              <button
                className="btn btn-sm btn-success"
                style={{ width: "100px" }}
                onClick={async () => {
                  setApproving(true);
                  try {
                    const approvals = await Promise.all(
                      selectedRegistrations.map(async (userId) => {
                        const registration = registrations.find((reg) => reg.user_id === userId);
                        if (registration) {
                          await updateRegistrationApproval(userId, 1);
                          return userId;
                        }
                        return null;
                      })
                    );

                    ToastNotification.success(`${approvals.filter(Boolean).length} registration(s) approved successfully.`);

                    const updatedRegistrations = registrations.map((reg) =>
                      selectedRegistrations.includes(reg.user_id)
                        ? { ...reg, librarian_approval: 1 }
                        : reg
                    );
                    setRegistrations(updatedRegistrations);
                    setSelectedRegistrations([]);
                  } catch (error) {
                    console.error("Error approving registrations:", error);
                    ToastNotification.error("Failed to approve some registrations.");
                  } finally {
                    setApproving(false);
                  }
                }}
                disabled={approving}
              >
                {approving ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  "Approve"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Registration Modal */}
      <ViewRegistrationModal
        show={showViewModal}
        onClose={() => {
          console.log("Closing modal");
          setShowViewModal(false);
          setViewingRegistration(null);
        }}
        registration={viewingRegistration}
        userId={viewingRegistration?.user_id}
      />
    </div>
  );
};

export default ManageRegistrations;