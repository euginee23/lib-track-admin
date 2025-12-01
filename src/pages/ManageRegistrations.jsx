import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaFileAlt, FaCalendar, FaCheckCircle, FaBan } from "react-icons/fa";
import ViewRegistrationModal from "../modals/ViewRegistration_Modal";
import SemesterManagementModal from "../modals/SemesterManagementModal";
import DisapproveRegistrationModal from "../modals/DisapproveRegistrationModal";
import { getRegistrations } from "../../api/manage_registrations/get_registrations";
import { getPositions } from "../../api/manage_registrations/get_positions";
import { updateRegistrationApproval } from "../../api/manage_registrations/registrationApproval";
import ToastNotification from "../components/ToastNotification";
import { getDepartments } from "../../api/settings/get_departments";
import { getActiveSemester } from "../../api/semesters/get_semesters";
import { enrollUsersForSemester } from "../../api/semesters/enroll_users";
import GenerateRegistrationsReportModal from "../modals/GenerateRegistrationsReportModal";

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
  const [disapproving, setDisapproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showDisapproveModal, setShowDisapproveModal] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  // computed flag: whether at least one selected registration is not yet approved
  const canApprove = selectedRegistrations.some((userId) => {
    const reg = registrations.find((r) => r.user_id === userId);
    return reg && reg.librarian_approval !== 1;
  });

  // Can disapprove only pending registrations (not already approved)
  const canDisapprove = selectedRegistrations.some((userId) => {
    const reg = registrations.find((r) => r.user_id === userId);
    return reg && reg.librarian_approval === 0;
  });

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const { users, pagination } = await getRegistrations(currentPage, rowsPerPage, search, filter, filterStatus);
        setRegistrations(users);
        setTotalPages(pagination?.totalPages || 1);
        setTotalCount(pagination?.total || 0);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [currentPage, rowsPerPage, search, filter, filterStatus]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchActiveSemester = async () => {
      try {
        const data = await getActiveSemester();
        setActiveSemester(data);
      } catch (error) {
        console.error("Error fetching active semester:", error);
      }
    };

    const fetchPositions = async () => {
      try {
        const data = await getPositions();
        console.debug("Positions API returned:", data);
        setPositions(data.map(p => p.position));
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchDepartments();
    fetchActiveSemester();
    fetchPositions();
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

  // Server-side filtering/pagination: `registrations` already contains the current page
  const paginatedRegistrations = registrations;

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, search, rowsPerPage]);

  const isFiltered = (filter === "status" && !!filterStatus) || (filter === "position" && !!filterStatus) || (filter === "department" && !!filterStatus);

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Active Semester Banner */}
      {activeSemester && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
          <div>
            <FaCalendar className="me-2" />
            <strong>Active Semester:</strong> {activeSemester.semester_name} ({activeSemester.school_year})
            <span className="ms-3 text-muted small">
              {new Date(activeSemester.start_date).toLocaleDateString()} - {new Date(activeSemester.end_date).toLocaleDateString()}
            </span>
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowSemesterModal(true)}
          >
            <FaCalendar className="me-1" />
            Manage Semesters
          </button>
        </div>
      )}

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
            onClick={() => setShowGenerateModal(true)}
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
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p === "N/A" ? "Unknown" : p}
                  </option>
                ))}
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
                <th>Semester</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRegistrations.length === 0 && registrations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
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
                            : registration.librarian_approval === 2
                            ? "bg-danger"
                            : "bg-warning"
                        }`}
                      >
                        {registration.librarian_approval === 1 
                          ? "Approved" 
                          : registration.librarian_approval === 2 
                          ? "Disapproved" 
                          : "Pending"}
                      </span>
                    </td>
                    <td>
                      {registration.position === "Student" ? (
                        <span className={`badge ${registration.semester_verified === 1 ? "bg-success" : "bg-danger"}`}>
                          {registration.semester_verified === 1 ? "Verified" : "Not Verified"}
                        </span>
                      ) : (
                        <span className="badge bg-warning">{registration.position || 'Faculty'}</span>
                      )}
                    </td>
                    <td>{new Date(registration.created_at).toLocaleString()}</td>
                    <td />
                  </tr>
                ))
              )}
              {currentPage === totalPages && paginatedRegistrations.length > 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-2">
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
                {/* Enroll single selected student */}
                {(() => {
                  const reg = registrations.find((r) => r.user_id === selectedRegistrations[0]);
                  if (!reg) return null;
                  const canEnroll = reg.position === "Student" && reg.librarian_approval === 1 && reg.semester_verified === 0;
                  return canEnroll ? (
                    <button
                      className="btn btn-sm btn-success"
                      style={{ width: "110px" }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!activeSemester) {
                          ToastNotification.error("No active semester found");
                          return;
                        }
                        setEnrolling(true);
                        try {
                          await enrollUsersForSemester([reg.user_id]);
                          ToastNotification.success(`${reg.first_name} ${reg.last_name} enrolled successfully`);
                          const updatedRegistrations = registrations.map((r) =>
                            r.user_id === reg.user_id ? { ...r, semester_verified: 1, semester_verified_at: new Date() } : r
                          );
                          setRegistrations(updatedRegistrations);
                          setSelectedRegistrations([]);
                        } catch (error) {
                          console.error("Error enrolling user:", error);
                          ToastNotification.error("Failed to enroll user");
                        } finally {
                          setEnrolling(false);
                        }
                      }}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <><FaCheckCircle size={12} /> Enroll</>
                      )}
                    </button>
                  ) : null;
                })()}
              </>
            )}

            {/* Approve button - show for multiple selections */}
            {selectedRegistrations.length > 0 && (
              <>
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

                      ToastNotification.success(`${approvals.filter(Boolean).length} registration(s) approved successfully. Email notifications sent.`);

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
                  disabled={!canApprove || approving || disapproving}
                >
                  {approving ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Approve"
                  )}
                </button>

                {/* Disapprove button */}
                <button
                  className="btn btn-sm btn-danger"
                  style={{ width: "120px" }}
                  onClick={() => {
                    setShowDisapproveModal(true);
                  }}
                  disabled={!canDisapprove || approving || disapproving}
                >
                  {disapproving ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <>
                      <FaBan size={12} className="me-1" />
                      Disapprove
                    </>
                  )}
                </button>

                {/* Enroll button - only for students who need verification */}
                {(() => {
                  const studentsToEnroll = selectedRegistrations.filter((userId) => {
                    const reg = registrations.find((r) => r.user_id === userId);
                    return reg && reg.position === "Student" && reg.librarian_approval === 1 && reg.semester_verified === 0;
                  });
                  return studentsToEnroll.length > 0 && (
                    <button
                      className="btn btn-sm btn-info"
                      style={{ width: "100px" }}
                      onClick={async () => {
                        if (!activeSemester) {
                          ToastNotification.error("No active semester found");
                          return;
                        }
                        setEnrolling(true);
                        try {
                          await enrollUsersForSemester(studentsToEnroll);
                          ToastNotification.success(`${studentsToEnroll.length} student(s) enrolled successfully`);
                          
                          const updatedRegistrations = registrations.map((reg) =>
                            studentsToEnroll.includes(reg.user_id)
                              ? { ...reg, semester_verified: 1, semester_verified_at: new Date() }
                              : reg
                          );
                          setRegistrations(updatedRegistrations);
                          setSelectedRegistrations([]);
                        } catch (error) {
                          console.error("Error enrolling students:", error);
                          ToastNotification.error("Failed to enroll students");
                        } finally {
                          setEnrolling(false);
                        }
                      }}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <><FaCheckCircle size={12} /> Enroll ({studentsToEnroll.length})</>
                      )}
                    </button>
                  );
                })()}

                {/* Delete button */}
                <button
                  className="btn btn-sm btn-danger"
                  style={{ width: "100px" }}
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to delete ${selectedRegistrations.length} registration(s)? This action cannot be undone.`)) {
                      setDeleting(true);
                      try {
                        // Import delete function
                        const { deleteRegistrations } = await import("../../api/manage_registrations/delete_registrations");
                        
                        await deleteRegistrations(selectedRegistrations);
                        ToastNotification.success(`${selectedRegistrations.length} registration(s) deleted successfully.`);

                        // Remove deleted registrations from state
                        const updatedRegistrations = registrations.filter(
                          (reg) => !selectedRegistrations.includes(reg.user_id)
                        );
                        setRegistrations(updatedRegistrations);
                        setSelectedRegistrations([]);
                      } catch (error) {
                        console.error("Error deleting registrations:", error);
                        ToastNotification.error("Failed to delete some registrations.");
                      } finally {
                        setDeleting(false);
                      }
                    }
                  }}
                  disabled={deleting || approving}
                >
                  {deleting ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </>
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

      {/* Disapprove Registration Modal */}
      <DisapproveRegistrationModal
        show={showDisapproveModal}
        onClose={() => setShowDisapproveModal(false)}
        registrationName={
          selectedRegistrations.length === 1
            ? (() => {
                const reg = registrations.find((r) => r.user_id === selectedRegistrations[0]);
                return reg ? `${reg.first_name} ${reg.last_name}` : "Selected registration";
              })()
            : `${selectedRegistrations.length} selected registrations`
        }
        onDisapprove={async (reason) => {
          setDisapproving(true);
          try {
            const disapprovals = await Promise.all(
              selectedRegistrations.map(async (userId) => {
                const registration = registrations.find((reg) => reg.user_id === userId);
                if (registration) {
                  await updateRegistrationApproval(userId, 2, reason);
                  return userId;
                }
                return null;
              })
            );

            ToastNotification.success(`${disapprovals.filter(Boolean).length} registration(s) disapproved. Email notifications sent.`);

            // Remove disapproved registrations from the list or update their status
            const updatedRegistrations = registrations.filter(
              (reg) => !selectedRegistrations.includes(reg.user_id)
            );
            setRegistrations(updatedRegistrations);
            setSelectedRegistrations([]);
          } catch (error) {
            console.error("Error disapproving registrations:", error);
            ToastNotification.error("Failed to disapprove some registrations.");
          } finally {
            setDisapproving(false);
          }
        }}
      />

      {/* Semester Management Modal */}
      <SemesterManagementModal
        show={showSemesterModal}
        onClose={() => {
          setShowSemesterModal(false);
          // Refresh active semester after closing
          getActiveSemester().then(setActiveSemester).catch(console.error);
        }}
      />

      {/* Generate Registrations Report Modal */}
      <GenerateRegistrationsReportModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        filterInfo={filter ? `${filter}${filterStatus ? `: ${filterStatus}` : ''}` : ''}
        search={search}
        filter={filter}
        filterStatus={filterStatus}
        totalCount={totalCount}
      />
    </div>
  );
};

export default ManageRegistrations;