import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaBook,
  FaUser,
  FaBuilding,
  FaCalendar,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHeart,
  FaImage,
} from "react-icons/fa";
import { getBookDetails } from "../../../api/manage_books/get_bookDetails";
import { updateBooks } from "../../../api/manage_books/update_books";
import ToastNotification from "../../components/ToastNotification";
import SelectShelfLocation from "../../components/SelectShelfLocation";
import ViewBookRemoveCopies from "./ViewBook_RemoveCopies";
import { getDepartments } from "../../../api/settings/get_departments";

function ViewBookBookDetails({ batchRegistrationKey }) {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState({});
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const [showCoverCancel, setShowCoverCancel] = useState(false);
  const [showRemoveCopies, setShowRemoveCopies] = useState(false);
  const [copiesToRemove, setCopiesToRemove] = useState([]); 
  const [copiesToAdd, setCopiesToAdd] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [useDepartmentInstead, setUseDepartmentInstead] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await getBookDetails();
        const book = details.find(
          (b) => b.batch_registration_key === batchRegistrationKey
        );
        if (book && book.book_cover) {
          
          // Handle both URL string and BLOB data for backward compatibility
          if (typeof book.book_cover === 'string') {
            // book_cover is a URL from the API
            // Add cache-busting parameter to always get the latest image
            const timestamp = new Date().getTime();
            book.cover = `${book.book_cover}?t=${timestamp}`;
          } else if (book.book_cover && book.book_cover.data) {
            // Fallback: handle BLOB data if still present
            const uint8Array = new Uint8Array(book.book_cover.data);
            let binaryString = "";
            const chunkSize = 0x8000;

            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, i + chunkSize);
              binaryString += String.fromCharCode.apply(null, chunk);
            }

            const base64String = `data:image/jpeg;base64,${btoa(binaryString)}`;
            book.cover = base64String;
          }
        }
        setBookDetails(book);
        // Set the department toggle based on the book's isUsingDepartment flag
        const isDepartmentMode = book?.isUsingDepartment === 1 || book?.isUsingDepartment === true;
        setUseDepartmentInstead(isDepartmentMode);
        
        // Initialize editedBook with proper department/genre fields
        const initialEditedBook = { ...book };
        if (isDepartmentMode) {
          initialEditedBook.department = String(book?.genre_id || "");
        }
        setEditedBook(initialEditedBook);
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    if (batchRegistrationKey) {
      fetchBookDetails();
    }
  }, [batchRegistrationKey]);

  // Fetch departments for the department dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        ToastNotification.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Year validation: only allow 4 digits, no letters
    if (name === "book_year") {
      const yearValue = value.replace(/[^0-9]/g, "");
      if (yearValue.length > 4) return; // Prevent more than 4 digits
      setEditedBook((prev) => ({ ...prev, [name]: yearValue }));
      return;
    }
    // Price validation: only allow numbers and max 9 digits (e.g. 999999999)
    if (name === "book_price") {
      const priceValue = value.replace(/[^0-9.]/g, "");
      // Prevent more than 9 digits before decimal
      const [whole, decimal] = priceValue.split(".");
      if (whole.length > 9) return;
      // Only one decimal point allowed
      const validPrice = decimal !== undefined ? `${whole}.${decimal.replace(/\./g, "")}` : whole;
      setEditedBook((prev) => ({ ...prev, [name]: validPrice }));
      return;
    }
    setEditedBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // VALIDATE REQUIRED FIELDS
      const requiredFields = [
        { key: "book_title", label: "Title" },
        { key: "author", label: "Author" },
        { key: useDepartmentInstead ? "department" : "genre", label: useDepartmentInstead ? "Department" : "Genre" },
        { key: "publisher", label: "Publisher" },
        { key: "book_edition", label: "Edition" },
        { key: "book_year", label: "Year" },
        { key: "book_price", label: "Price" },
      ];
      const emptyFields = requiredFields.filter(
        (field) => !editedBook[field.key] || editedBook[field.key].toString().trim() === ""
      );
      if (emptyFields.length > 0) {
        ToastNotification.error(
          `Please fill in the following required fields before saving:\n` +
            emptyFields.map((f) => `- ${f.label}`).join("\n")
        );
        return;
      }

      // Get only the fields that have actually changed
      const changedFields = {};
      let hasChanges = false;
      if (editedBook.book_title !== bookDetails.book_title) {
        changedFields.book_title = editedBook.book_title;
        hasChanges = true;
      }
      if (editedBook.author !== bookDetails.author) {
        changedFields.author = editedBook.author;
        hasChanges = true;
      }
      // Handle genre/department changes
      const currentIsUsingDepartment = bookDetails.isUsingDepartment === 1 || bookDetails.isUsingDepartment === true;
      if (useDepartmentInstead !== currentIsUsingDepartment) {
        changedFields.useDepartmentInstead = useDepartmentInstead;
        hasChanges = true;
      }
      if (useDepartmentInstead) {
        // When using department mode, compare department selection with current genre_id
        const currentDepartmentId = currentIsUsingDepartment ? bookDetails.genre_id : "";
        // Convert both to strings for proper comparison
        const currentDepartmentStr = String(currentDepartmentId);
        const selectedDepartmentStr = String(editedBook.department || "");
        
        console.log("Department comparison:", {
          current: currentDepartmentStr,
          selected: selectedDepartmentStr,
          equal: currentDepartmentStr === selectedDepartmentStr
        });
        
        if (selectedDepartmentStr !== currentDepartmentStr) {
          changedFields.department = editedBook.department;
          hasChanges = true;
        }
      } else {
        // When using genre mode, compare genre text with current genre
        const currentGenre = !currentIsUsingDepartment ? bookDetails.genre : "";
        if (editedBook.genre !== currentGenre) {
          changedFields.genre = editedBook.genre;
          hasChanges = true;
        }
      }
      if (editedBook.publisher !== bookDetails.publisher) {
        changedFields.publisher = editedBook.publisher;
        hasChanges = true;
      }
      if (editedBook.book_edition !== bookDetails.book_edition) {
        changedFields.book_edition = editedBook.book_edition;
        hasChanges = true;
      }
      if (editedBook.book_year !== bookDetails.book_year) {
        changedFields.book_year = editedBook.book_year;
        hasChanges = true;
      }
      if (editedBook.book_shelf_loc_id !== bookDetails.book_shelf_loc_id) {
        changedFields.book_shelf_loc_id = editedBook.book_shelf_loc_id;
        hasChanges = true;
      }
      if (editedBook.book_donor !== bookDetails.book_donor) {
        changedFields.book_donor = editedBook.book_donor;
        hasChanges = true;
      }
      if (editedBook.book_price !== bookDetails.book_price) {
        changedFields.book_price = editedBook.book_price;
        hasChanges = true;
      }
      // Add book cover to changed fields if there's a new preview
      if (newCoverPreview && editedBook.cover) {
        changedFields.book_cover = editedBook.cover;
        hasChanges = true;
      }
      // Only show add quantity if a new add is pending (copiesToAdd > 0 and showQuantityInput is false)
      if (copiesToAdd > 0 && !showQuantityInput) {
        hasChanges = true;
      }
      if (copiesToRemove.length > 0) {
        hasChanges = true;
      }
      if (!hasChanges) {
        ToastNotification.info("No changes to save.");
        return;
      }
      setLoading(true);
      // Call the update API
      await updateBooks(batchRegistrationKey, changedFields, copiesToRemove, copiesToAdd);
      ToastNotification.success("Book Details Updated Successfully.");
      // Refresh book details to get updated data
      const details = await getBookDetails();
      const updatedBook = details.find(
        (b) => b.batch_registration_key === batchRegistrationKey
      );
      if (updatedBook && updatedBook.book_cover) {
        console.log("Updated book cover data:", { 
          book_cover: updatedBook.book_cover, 
          type: typeof updatedBook.book_cover,
          hasData: updatedBook.book_cover?.data 
        });
        
        // Handle both URL string and BLOB data for backward compatibility
        if (typeof updatedBook.book_cover === 'string') {
          // book_cover is a URL from the API
          // Add cache-busting parameter to force reload the updated image
          const timestamp = new Date().getTime();
          updatedBook.cover = `${updatedBook.book_cover}?t=${timestamp}`;
        } else if (updatedBook.book_cover && updatedBook.book_cover.data) {
          // Fallback: handle BLOB data if still present
          const uint8Array = new Uint8Array(updatedBook.book_cover.data);
          let binaryString = "";
          const chunkSize = 0x8000;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, chunk);
          }
          const base64String = `data:image/jpeg;base64,${btoa(binaryString)}`;
          updatedBook.cover = base64String;
        }
      }
      setBookDetails(updatedBook);
      setEditedBook(updatedBook || {});
      setEditMode(false);
      setNewCoverPreview(null);
      setShowCoverCancel(false);
      setCopiesToAdd(0);
      setCopiesToRemove([]);
      // Update the department toggle state with the new book data
      setUseDepartmentInstead(updatedBook?.isUsingDepartment === 1 || updatedBook?.isUsingDepartment === true);
    } catch (err) {
      console.error("Save error:", err);
      ToastNotification.error("Failed to save changes.");
      setError(err.message || "An error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedBook(bookDetails || {});
    setEditMode(false);
    setNewCoverPreview(null);
    setShowCoverCancel(false);
    setCopiesToAdd(0); // Reset copies to add badge
    setCopiesToRemove([]); // Reset copies to remove badge
    // Reset the department toggle to the original state
    setUseDepartmentInstead(bookDetails?.isUsingDepartment === 1 || bookDetails?.isUsingDepartment === true);
  };

  const handleAddQuantity = async () => {
    try {
      setLoading(true);

      // Update the book details locally
      setBookDetails((prev) => ({
        ...prev,
        quantity: prev.quantity + quantityToAdd,
      }));

      // Set the copies being added for badge display
      setCopiesToAdd(quantityToAdd); // Only show the latest quantity added

      setShowQuantityInput(false);
      setQuantityToAdd(0); // Reset the input value
    } catch (err) {
      setError(err.message || "An error occurred while adding quantity.");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCoverPreview(e.target.result);
        setShowCoverCancel(true);
      };
      reader.readAsDataURL(file);
      
      // Store the actual File object for the API call
      setEditedBook((prev) => ({
        ...prev,
        cover: file, // Store the File object, not the base64 string
      }));
    }
  };

  const handleCoverCancel = () => {
    setNewCoverPreview(null);
    setEditedBook((prev) => ({
      ...prev,
      cover: null, // Reset the File object
    }));
    setShowCoverCancel(false);
  };

  const handleRemoveCopies = (selectedCopyIds) => {
    setCopiesToRemove(selectedCopyIds); // Store the book_ids of copies marked for removal
    setShowRemoveCopies(false); // Close the modal
  };

  const handleShowQuantityInput = () => {
    setShowQuantityInput(true);
    setCopiesToAdd(0); // Reset badge when preparing to add a new quantity
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (error) return <div>{error}</div>;
  if (!bookDetails) return <div>No book details found.</div>;

  if (!bookDetails || (!bookDetails.copies && !bookDetails.quantity)) {
    console.error("bookDetails or copies/quantity is undefined:", bookDetails);
    return <div>No book details or copies/quantity found.</div>;
  }

  return (
    <div className="row g-3">
      {/* Book Cover Card */}
      <div className="col-md-3">
        <div
          className="card h-100"
          style={{
            border: "none",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div className="card-body p-3 text-center">
            <h6
              className="card-title text-muted mb-3"
              style={{ fontSize: "0.875rem" }}
            >
              <FaImage className="me-1" size={14} />
              Book Cover
            </h6>
            <div className="d-flex justify-content-center mb-3">
              {newCoverPreview || bookDetails?.cover ? (
                <img
                  src={newCoverPreview || bookDetails.cover}
                  alt={`Cover of ${bookDetails?.title || "Book"}`}
                  style={{
                    width: "200px",
                    height: "320px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #dee2e6",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  width: "200px",
                  height: "320px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "8px",
                  border: "2px solid #dee2e6",
                  display:
                    newCoverPreview || bookDetails?.cover ? "none" : "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#6c757d",
                  padding: "10px",
                }}
              >
                <FaBook size={30} className="mb-2" />
                <span
                  style={{
                    fontSize: "0.7rem",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  No Cover Available
                </span>
              </div>
            </div>
            {editMode && (
              <div className="mt-2 d-flex flex-column gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.75rem", width: "100%" }}
                  onClick={() => {
                    const fileInput = document.createElement("input");
                    fileInput.type = "file";
                    fileInput.accept = "image/*";
                    fileInput.onchange = (event) => {
                      const file = event.target.files[0];
                      handleCoverChange(file);
                    };
                    fileInput.click();
                  }}
                >
                  Change
                </button>
                {showCoverCancel && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    style={{ fontSize: "0.75rem", width: "100%" }}
                    onClick={handleCoverCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side information cards */}
      <div className="col-md-9">
        <div className="row g-3">
          {/* Basic Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6
                    className="card-title text-muted mb-0"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <FaBook className="me-1" size={14} />
                    Basic Information
                  </h6>
                </div>
                <div className="row g-2">
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Title:
                      </span>
                      {editMode ? (
                        <input
                          name="book_title"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_title || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_title || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaUser className="me-1" size={12} />
                        Author:
                      </span>
                      {editMode ? (
                        <input
                          name="author"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.author || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.author || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="text-muted"
                          style={{ minWidth: "120px" }}
                        >
                          <i className={`${useDepartmentInstead ? "bi bi-building" : "fas fa-layer-group"} me-1`}></i>
                          {useDepartmentInstead ? "Department:" : "Genre:"}
                        </span>
                        {editMode ? (
                          <div style={{ flex: "1", marginLeft: "10px" }}>
                            {/* Checkbox to toggle between genre and department */}
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="useDepartmentCheckEdit"
                                checked={useDepartmentInstead}
                                onChange={(e) => {
                                  setUseDepartmentInstead(e.target.checked);
                                  // Set appropriate field value when switching
                                  if (e.target.checked) {
                                    // Switching to department mode - set department if book is using department
                                    setEditedBook(prev => ({ 
                                      ...prev, 
                                      genre: "",
                                      department: String(bookDetails?.isUsingDepartment ? bookDetails?.genre_id || "" : "")
                                    }));
                                  } else {
                                    // Switching to genre mode - set genre if book is using genre
                                    setEditedBook(prev => ({ 
                                      ...prev, 
                                      department: "",
                                      genre: !bookDetails?.isUsingDepartment ? bookDetails?.genre || "" : ""
                                    }));
                                  }
                                }}
                              />
                              <label 
                                className="form-check-label" 
                                htmlFor="useDepartmentCheckEdit"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Use department instead
                              </label>
                            </div>
                            
                            {/* Conditional rendering based on checkbox */}
                            {useDepartmentInstead ? (
                              <select
                                name="department"
                                className="form-select form-select-sm"
                                value={editedBook?.department || (bookDetails?.isUsingDepartment ? bookDetails?.genre_id : "") || ""}
                                onChange={(e) => setEditedBook(prev => ({ ...prev, department: e.target.value }))}
                                style={{ fontSize: "0.8rem" }}
                              >
                                <option value="">Select Department</option>
                                {departments.map((department) => (
                                  <option 
                                    key={department.department_id} 
                                    value={department.department_id}
                                  >
                                    {department.department_name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                name="genre"
                                className="form-control form-control-sm"
                                value={editedBook?.genre || ""}
                                onChange={handleChange}
                                style={{ fontSize: "0.8rem" }}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="fw-medium">
                            {bookDetails?.genre || "N/A"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publication Details Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaBuilding className="me-1" size={14} />
                  Publication Details
                </h6>
                <div className="row g-2">
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Publisher:
                      </span>
                      {editMode ? (
                        <input
                          name="publisher"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.publisher || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.publisher || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Edition:
                      </span>
                      {editMode ? (
                        <input
                          name="book_edition"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_edition || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_edition || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaCalendar className="me-1" size={12} />
                        Year:
                      </span>
                      {editMode ? (
                        <input
                          name="book_year"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_year || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_year || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Library Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaMapMarkerAlt className="me-1" size={14} />
                  Library Information
                </h6>
                <div className="row g-2">
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Shelf Location:
                      </span>
                      {editMode ? (
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex gap-2">
                            <span className="badge bg-primary" style={{ fontSize: "0.75rem" }}>
                              Shelf: {editedBook.shelf_number || "N/A"}
                            </span>
                            <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>
                              Column: {editedBook.shelf_column || "N/A"}
                            </span>
                            <span className="badge bg-warning" style={{ fontSize: "0.75rem" }}>
                              Row: {editedBook.shelf_row || "N/A"}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm align-self-end"
                            onClick={() => setShowShelfSelector(true)}
                            style={{ fontSize: "0.75rem" }}
                          >
                            <i className="bi bi-grid-3x3-gap me-1" style={{ fontSize: "0.7rem" }}></i>
                            Select New Location
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <span className="badge bg-primary" style={{ fontSize: "0.75rem" }}>
                            Shelf: {bookDetails.shelf_number}
                          </span>
                          <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>
                            Column: {bookDetails.shelf_column || "N/A"}
                          </span>
                          <span className="badge bg-warning" style={{ fontSize: "0.75rem" }}>
                            Row: {bookDetails.shelf_row || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted">Total Copies:</span>
                      {editMode ? (
                        <div className="d-flex align-items-center gap-2">
                          {copiesToRemove.length > 0 && (
                            <span className="badge bg-danger text-white">
                              Removing {copiesToRemove.length}{" "}
                              {copiesToRemove.length === 1 ? "copy" : "copies"}
                            </span>
                          )}
                          {copiesToAdd > 0 && (
                            <span className="badge bg-success text-white">
                              Adding {copiesToAdd}{" "}
                              {copiesToAdd === 1 ? "copy" : "copies"}
                            </span>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ width: "32px" }}
                            onClick={() => setShowRemoveCopies(true)}
                            disabled={
                              editedBook?.quantity <= 1 ||
                              bookDetails.quantity <= 1
                            }
                          >
                            -
                          </button>
                          <span className="badge bg-info">
                            {editedBook?.quantity || bookDetails.quantity}
                          </span>
                          {showQuantityInput ? (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: "80px" }}
                                value={quantityToAdd || ""} // Clear the input field
                                onChange={(e) =>
                                  setQuantityToAdd(
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                              />
                              <button
                                className="btn btn-sm btn-success"
                                onClick={handleAddQuantity}
                              >
                                Add
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowQuantityInput(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-success"
                              style={{ width: "32px" }}
                              onClick={handleShowQuantityInput}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-info">
                          {bookDetails?.quantity || bookDetails.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaHeart className="me-1" size={12} />
                        Donor:
                      </span>
                      {editMode ? (
                        <input
                          name="book_donor"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_donor || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_donor && bookDetails.book_donor.trim() !== "" ? bookDetails.book_donor : "No Donor"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaDollarSign className="me-1" size={14} />
                  Other Information
                </h6>
                <div className="row g-2">
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Price:
                      </span>
                      {editMode ? (
                        <input
                          name="book_price"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_price || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-bold text-success">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          }).format(bookDetails?.book_price || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted">Available:</span>
                      <span className="badge bg-success">
                        {bookDetails.copies
                          ? bookDetails.copies.filter(
                              (c) => c.status === "Available"
                            ).length
                          : bookDetails.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted">Lost:</span>
                      <span className="badge bg-danger">
                        {bookDetails.copies
                          ? bookDetails.copies.filter(
                              (c) => c.status === "Lost"
                            ).length
                          : 0}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex justify-content-between align-items-center p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted">Borrowed:</span>
                      <span className="badge bg-warning">
                        {bookDetails.copies
                          ? bookDetails.copies.filter(
                              (c) => c.status === "Borrowed"
                            ).length
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Action Buttons */}
      <div className="col-12 mt-3 d-flex gap-2 justify-content-end">
        {editMode ? (
          <>
            <button
              className="btn btn-sm btn-success"
              style={{ width: "100px" }}
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ width: "100px" }}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            style={{ width: "100px" }}
            onClick={() => {
              setEditMode(true);
              // Initialize department field when entering edit mode
              if (useDepartmentInstead && bookDetails?.isUsingDepartment) {
                setEditedBook(prev => ({ 
                  ...prev, 
                  department: bookDetails.genre_id 
                }));
              }
            }}
          >
            Edit
          </button>
        )}
      </div>

      {showShelfSelector && (
        <SelectShelfLocation
          onLocationSelect={(location) => {
            setEditedBook((prev) => ({
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

      {showRemoveCopies && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            style={{ maxWidth: "90%" }}
          >
            <div className="modal-content shadow border-0">
              <div className="modal-header py-2 wmsu-bg-primary text-white">
                <h6
                  className="modal-title fw-semibold mb-0"
                  style={{ fontSize: "0.9rem" }}
                >
                  <i
                    className="bi bi-trash me-1"
                    style={{ fontSize: "0.8rem" }}
                  ></i>
                  Remove Book Copies
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowRemoveCopies(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <ViewBookRemoveCopies
                  batchRegistrationKey={batchRegistrationKey}
                  onClose={() => setShowRemoveCopies(false)}
                  onRemove={handleRemoveCopies}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ViewBookBookDetails.propTypes = {
  batchRegistrationKey: PropTypes.string.isRequired,
};

export default ViewBookBookDetails;
