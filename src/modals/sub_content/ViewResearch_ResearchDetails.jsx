import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaFileAlt, FaUser, FaBuilding, FaCalendar, FaBookOpen } from "react-icons/fa";
import SelectShelfLocation from "../../components/SelectShelfLocation";
import { getResearchDetails } from "../../../api/manage_books/get_researchDetails";
import { updateResearch } from "../../../api/manage_books/update_research";
import ToastNotification from "../../components/ToastNotification";
import { getDepartments } from '../../../api/settings/get_departments';

function ViewResearchResearchDetails({ research }) {
  const [editMode, setEditMode] = useState(false);
  const [editedResearch, setEditedResearch] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchResearch = async () => {
      setFetching(true);
      try {
        const details = await getResearchDetails();
        // If a research prop is passed, try to match by id/key/title
        let selected = null;
        if (research && research.research_paper_key) {
          selected = details.find(r => r.research_paper_key === research.research_paper_key);
        } else if (research && research.id) {
          selected = details.find(r => r.id === research.id);
        } else if (research && research.research_title) {
          selected = details.find(r => r.research_title === research.research_title);
        }
        setResearchData(selected || details[0] || null);
        const data = selected || details[0] || {};
        // Initialize editedResearch with department_name set to department_id for the form
        setEditedResearch({
          ...data,
          department_name: data.department_id || ""
        });
        if (data.authors) {
          if (Array.isArray(data.authors)) {
            setAuthors(data.authors);
          } else if (typeof data.authors === 'string') {
            setAuthors(data.authors.split(',').map(author => author.trim()).filter(author => author));
          }
        } else if (data.author) {
          if (typeof data.author === 'string') {
            setAuthors(data.author.split(',').map(author => author.trim()).filter(author => author));
          }
        }
      } catch (err) {
        setResearchData(null);
      } finally {
        setFetching(false);
      }
    };
    fetchResearch();
  }, [research]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedResearch((prev) => ({ ...prev, [name]: value }));
  };

  const formatPrice = (value) => {
    if (!value || value === "" || value === "0") return "₱ 0.00";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "₱ 0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleChange(e);
    }
  };

  const handlePriceBlur = (e) => {
    const value = e.target.value;
    if (value === "" || value === "0" || value === "0.") {
      setEditedResearch((prev) => ({ ...prev, research_paper_price: "0" }));
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const addAuthor = () => {
    if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
      const updatedAuthors = [...authors, currentAuthor.trim()];
      setAuthors(updatedAuthors);
      setCurrentAuthor("");
      setEditedResearch((prev) => ({ 
        ...prev, 
        authors: updatedAuthors,
        author: updatedAuthors.join(", ")
      }));
    }
  };

  const removeAuthor = (indexToRemove) => {
    const updatedAuthors = authors.filter((_, index) => index !== indexToRemove);
    setAuthors(updatedAuthors);
    setEditedResearch((prev) => ({ 
      ...prev, 
      authors: updatedAuthors,
      author: updatedAuthors.join(", ")
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  const handleSave = async () => {
    // Validation for required fields
    if (!editedResearch.research_title || editedResearch.research_title.trim() === "") {
      ToastNotification.error("Please add a research title.");
      return;
    }
    if (!editedResearch.department_name || editedResearch.department_name.toString().trim() === "") {
      ToastNotification.error("Please add a department.");
      return;
    }
    if (!editedResearch.year_publication || editedResearch.year_publication.toString().trim() === "") {
      ToastNotification.error("Please add a year of publication.");
      return;
    }
    if (!/^\d{4}$/.test(editedResearch.year_publication)) {
      ToastNotification.error("Year must be a 4-digit number.");
      return;
    }
    if (!editedResearch.research_abstract || editedResearch.research_abstract.trim() === "") {
      ToastNotification.error("Please add an abstract.");
      return;
    }
    if (!authors || authors.length === 0) {
      ToastNotification.error("Please add authors.");
      return;
    }

    setLoading(true);
    try {
      // PAYLOAD WITH ONLY CHANGES ON FIELDS
      const originalAuthors = Array.isArray(researchData.authors)
        ? researchData.authors
        : (researchData.authors || researchData.author || "").split(',').map(a => a.trim()).filter(a => a);
      const currentAuthors = authors;
      const updatePayload = {};
      if (editedResearch.research_title !== researchData.research_title) {
        updatePayload.research_title = editedResearch.research_title;
      }
      if (editedResearch.department_name !== researchData.department_id) {
        updatePayload.department_id = editedResearch.department_name;
      }
      if (editedResearch.year_publication !== researchData.year_publication) {
        updatePayload.year_publication = editedResearch.year_publication;
      }
      if (editedResearch.research_abstract !== researchData.research_abstract) {
        updatePayload.research_abstract = editedResearch.research_abstract;
      }
      if (editedResearch.book_shelf_loc_id !== researchData.book_shelf_loc_id) {
        updatePayload.book_shelf_loc_id = editedResearch.book_shelf_loc_id;
      }
      if (editedResearch.research_paper_price !== researchData.research_paper_price) {
        updatePayload.research_paper_price = editedResearch.research_paper_price || "0";
      }
      if (JSON.stringify(originalAuthors.sort()) !== JSON.stringify(currentAuthors.sort())) {
        updatePayload.authors = currentAuthors;
      }

      // Save to server
      const response = await updateResearch(researchData.research_paper_id, updatePayload);
      if (response.success) {
        const selectedDepartment = departments.find(dept => dept.department_id == editedResearch.department_name);
        const updatedResearchData = {
          ...editedResearch,
          department_id: editedResearch.department_name, 
          department_name: selectedDepartment ? selectedDepartment.department_name : researchData.department_name 
        };
        setResearchData(updatedResearchData);
        setEditMode(false);
        ToastNotification.success("Research Details Updated Successfully.");
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error saving research:', error);
      ToastNotification.error(`Failed to save changes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedResearch({
      ...researchData,
      department_name: researchData.department_id || ""
    });
    setEditMode(false);
    // Reset authors array to original data
    if (researchData.authors) {
      if (Array.isArray(researchData.authors)) {
        setAuthors(researchData.authors);
      } else if (typeof researchData.authors === 'string') {
        setAuthors(researchData.authors.split(',').map(author => author.trim()).filter(author => author));
      }
    } else if (researchData.author) {
      if (typeof researchData.author === 'string') {
        setAuthors(researchData.author.split(',').map(author => author.trim()).filter(author => author));
      }
    }
    setCurrentAuthor("");
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">Loading research data...</h5>
      </div>
    );
  }
  if (!researchData) {
    return (
      <div className="text-center py-5">
        <FaFileAlt size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No research data available</h5>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Main Content Area */}
      <div className="col-12">
        <div className="row g-3">
          {/* Research Information Card - 35% width */}
          <div className="col-4" style={{ flex: "0 0 35%" }}>
            <div
              className="card"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body" style={{ padding: editMode ? "8px" : "10px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6
                    className="card-title text-muted mb-0"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <FaFileAlt className="me-1" size={14} />
                    Research Information
                  </h6>
                </div>
                <div className="row" style={{ gap: editMode ? "3px" : "6px" }}>
                  <div className="col-12">
                    <div
                      className="d-flex flex-column"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        Title:
                      </span>
                      {editMode ? (
                        <textarea
                          name="research_title"
                          className="form-control form-control-sm"
                          style={{ fontSize: "0.875rem", resize: "none" }}
                          rows="3"
                          value={editedResearch.research_title || editedResearch.title || ""}
                          onChange={handleChange}
                          placeholder="Enter research title"
                        />
                      ) : (
                        <span className="fw-medium" style={{ lineHeight: "1.4" }} title={researchData.research_title || researchData.title || "N/A"}>
                          {truncateText(researchData.research_title || researchData.title, 80)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex flex-column"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        <FaUser className="me-1" size={12} />
                        Author(s):
                      </span>
                      {editMode ? (
                        <div>
                          <div className="input-group input-group-sm mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter author name"
                              value={currentAuthor}
                              onChange={(e) => setCurrentAuthor(e.target.value)}
                              onKeyPress={handleKeyPress}
                            />
                            <button
                              className="btn btn-success btn-sm"
                              type="button"
                              onClick={addAuthor}
                              disabled={!currentAuthor.trim()}
                            >
                              Add
                            </button>
                          </div>
                          {/* Authors List */}
                          {authors.length > 0 && (
                            <div>
                              <small className="text-muted" style={{ fontSize: "0.65rem" }}>Added Authors:</small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {authors.map((author, index) => (
                                  <span key={index} className="badge bg-light text-dark border d-flex align-items-center" style={{ fontSize: "0.6rem", padding: "2px 4px" }}>
                                    {author.length > 15 ? author.substring(0, 15) + "..." : author}
                                    <button
                                      type="button"
                                      className="btn-close btn-close-sm ms-1"
                                      style={{ fontSize: "0.4rem" }}
                                      onClick={() => removeAuthor(index)}
                                    ></button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="fw-medium" title={Array.isArray(researchData.authors) ? researchData.authors.join(", ") : researchData.authors || researchData.author || "N/A"}>
                          {truncateText(
                            Array.isArray(researchData.authors)
                              ? researchData.authors.join(", ")
                              : researchData.authors || researchData.author,
                            50
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted" style={{ minWidth: "120px" }}>
                        <FaBuilding className="me-1" size={12} />
                        Department:
                      </span>
                      {editMode ? (
                        <select
                          name="department_name"
                          className="form-select form-select-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedResearch.department_name || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select a department</option>
                          {departments.map((department) => (
                            <option key={department.department_id} value={department.department_id}>
                              {department.department_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="fw-medium">
                          {researchData.department_name || researchData.department || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted" style={{ minWidth: "60px" }}>
                        <FaCalendar className="me-1" size={12} />
                        Year:
                      </span>
                      {editMode ? (
                        <input
                          name="year_publication"
                          type="text"
                          inputMode="numeric"
                          pattern="\\d{4}"
                          maxLength={4}
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedResearch.year_publication || editedResearch.year || ""}
                          onChange={e => {
                            // Only allow digits, max 4
                            const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                            setEditedResearch(prev => ({ ...prev, year_publication: val }));
                          }}
                        />
                      ) : (
                        <span className="fw-medium">
                          {researchData.year_publication || researchData.year || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted" style={{ minWidth: "60px" }}>
                        <i className="bi bi-currency-dollar me-1"></i>
                        Price:
                      </span>
                      {editMode ? (
                        <div className="input-group input-group-sm" style={{ flex: "1", marginLeft: "10px" }}>
                          <span className="input-group-text" style={{ fontSize: "0.75rem" }}>₱</span>
                          <input
                            name="research_paper_price"
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="0.00"
                            value={editedResearch.research_paper_price || ""}
                            onChange={handlePriceChange}
                            onBlur={handlePriceBlur}
                            style={{ fontSize: "0.75rem" }}
                          />
                        </div>
                      ) : (
                        <span className="fw-medium">
                          {formatPrice(researchData.research_paper_price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        padding: editMode ? "6px" : "8px",
                      }}
                    >
                      <span className="text-muted" style={{ minWidth: "120px" }}>
                        <FaBookOpen className="me-1" size={12} />
                        Shelf:
                      </span>
                      {editMode ? (
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex gap-2">
                            <span
                              className="badge bg-primary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Shelf: {editedResearch.shelf_number || "N/A"}
                            </span>
                            <span
                              className="badge bg-success"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Column: {editedResearch.shelf_column || "N/A"}
                            </span>
                            <span
                              className="badge bg-warning"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Row: {editedResearch.shelf_row || "N/A"}
                            </span>
                          </div>
                          {/* Store book_shelf_loc_id in editedResearch, do not display */}
                          <input type="hidden" name="book_shelf_loc_id" value={editedResearch.book_shelf_loc_id || ""} />
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm align-self-end"
                            onClick={() => setShowShelfSelector(true)}
                            style={{ fontSize: "0.75rem" }}
                          >
                            <i className="bi bi-grid-3x3-gap me-1" style={{ fontSize: "0.7rem" }}></i>
                            Select Location
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <span
                            className="badge bg-primary"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Shelf: {researchData.shelf_number}
                          </span>
                          <span
                            className="badge bg-success"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Column: {researchData.shelf_column || "N/A"}
                          </span>
                          <span
                            className="badge bg-warning"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Row: {researchData.shelf_row || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract Card - 65% width */}
          <div className="col-8" style={{ flex: "0 0 65%" }}>
            <div
              className="card"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                minHeight: editMode ? "400px" : "350px",
              }}
            >
              <div className="card-body d-flex flex-column" style={{ padding: "10px" }}>
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaFileAlt className="me-1" size={14} />
                  Abstract
                </h6>
                <div 
                  className="flex-grow-1"
                  style={{ 
                    height: editMode ? "320px" : "280px", 
                    maxHeight: editMode ? "320px" : "280px",
                    overflow: "hidden"
                  }}
                >
                  {editMode ? (
                    <textarea
                      name="research_abstract"
                      className="form-control form-control-sm"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        resize: "none",
                        height: "100%",
                        maxHeight: "100%",
                      }}
                      value={editedResearch.research_abstract || editedResearch.abstract || ""}
                      onChange={handleChange}
                      placeholder="Enter research abstract"
                    />
                  ) : (
                    <div
                      className="p-3"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        overflowY: "auto",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        height: "100%",
                        maxHeight: "100%",
                      }}
                    >
                      {researchData.research_abstract || researchData.abstract ? (
                        <div 
                          className="mb-0 text-dark"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                          }}
                        >
                          {researchData.research_abstract || researchData.abstract}
                        </div>
                      ) : (
                        <p className="mb-0 text-muted fst-italic">
                          No abstract available for this research paper.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="col-12 mt-2 d-flex gap-2 justify-content-end">
        {editMode ? (
          <>
            <button
              className="btn btn-sm btn-success"
              style={{ width: "100px" }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" style={{ width: "0.8rem", height: "0.8rem" }} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ width: "100px" }}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            style={{ width: "100px" }}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>

      {/* Shelf Location Selector - Modal or Component */}
      {showShelfSelector && (
        <SelectShelfLocation
          onLocationSelect={(location) => {
            setEditedResearch((prev) => ({
              ...prev,
              shelf_number: location.shelf_number,
              shelf_column: location.shelf_column,
              shelf_row: location.shelf_row,
              book_shelf_loc_id: location.book_shelf_loc_id,
            }));
            setShowShelfSelector(false);
          }}
          showModal={showShelfSelector}
          onCloseModal={() => setShowShelfSelector(false)}
        />
      )}
    </div>
  );
}

export default ViewResearchResearchDetails;