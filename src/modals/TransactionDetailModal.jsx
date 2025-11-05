import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimes, FaFileAlt, FaReceipt, FaInfoCircle } from 'react-icons/fa';
import { getTransactionFine } from '../../api/transactions/getFineCalculations';
import { fetchBooksAndResearch } from '../../api/manage_books/get_booksAndResearch';
import { getRegistrations } from '../../api/manage_registrations/get_registrations';

function TransactionDetailModal({ show, onHide, transaction, type }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fineDetails, setFineDetails] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bookCoverImage, setBookCoverImage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', title: '' });

  // Fetch detailed transaction and fine information
  useEffect(() => {
    if (show && transaction?.transaction_id) {
      fetchTransactionDetails();
    }
  }, [show, transaction]);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Set basic transaction details
      setTransactionDetails(transaction);
      
      // Process receipt image - now handling URLs instead of Buffers
      if (transaction.receipt_image) {
        // Check if it's a URL string
        if (typeof transaction.receipt_image === 'string') {
          // Add cache-busting timestamp to ensure updated images are loaded
          const timestamp = new Date().getTime();
          setReceiptImage(`${transaction.receipt_image}?t=${timestamp}`);
        } 
        // Legacy support: Handle old Buffer format if it still exists
        else if (transaction.receipt_image.type === "Buffer") {
          try {
            const uint8Array = new Uint8Array(transaction.receipt_image.data);
            let binaryString = "";
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              binaryString += String.fromCharCode.apply(
                null,
                uint8Array.slice(i, i + chunkSize)
              );
            }
            const base64String = btoa(binaryString);
            setReceiptImage(`data:image/jpeg;base64,${base64String}`);
          } catch (error) {
            console.error("Error processing receipt image buffer:", error);
            setReceiptImage(null);
          }
        } else {
          setReceiptImage(null);
        }
      } else {
        setReceiptImage(null);
      }

      // Fetch user profile photo and details from registrations API
      if (transaction.user_id || transaction.studentEmail) {
        try {
          const registrations = await getRegistrations(1, 1000); // Fetch all registrations
          const userRegistration = registrations.find(reg => 
            reg.user_id === transaction.user_id || 
            reg.email === transaction.studentEmail
          );
          
          if (userRegistration) {
            // Set user details
            setUserDetails(userRegistration);
            
            // Process profile photo if available
            if (userRegistration.profile_photo && userRegistration.profile_photo.type === "Buffer") {
              const uint8Array = new Uint8Array(userRegistration.profile_photo.data);
              let binaryString = "";
              const chunkSize = 8192;
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                binaryString += String.fromCharCode.apply(
                  null,
                  uint8Array.slice(i, i + chunkSize)
                );
              }
              const base64String = btoa(binaryString);
              setProfileImage(`data:image/jpeg;base64,${base64String}`);
            } else {
              setProfileImage(null);
            }
          } else {
            setUserDetails(null);
            setProfileImage(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserDetails(null);
          setProfileImage(null);
        }
      }

      // Fetch book cover and details from books API if it's a book transaction
      if (transaction.book_id || transaction.batch_registration_key) {
        try {
          const booksAndResearch = await fetchBooksAndResearch();
          let bookData = null;
          
          if (transaction.batch_registration_key) {
            bookData = booksAndResearch.find(item => 
              item.batch_registration_key === transaction.batch_registration_key && 
              item.type === 'Book'
            );
          } else if (transaction.book_id) {
            bookData = booksAndResearch.find(item => 
              item.book_id === transaction.book_id && 
              item.type === 'Book'
            );
          }
          
          if (bookData) {
            // Set book details
            setBookDetails(bookData);
            
            // Process book cover if available (URL-based)
            if (bookData.book_cover) {
              // Add cache-busting timestamp to ensure updated images are loaded
              const timestamp = new Date().getTime();
              setBookCoverImage(`${bookData.book_cover}?t=${timestamp}`);
            } else {
              setBookCoverImage(null);
            }
          } else {
            setBookDetails(null);
            setBookCoverImage(null);
          }
        } catch (error) {
          console.error("Error fetching book cover:", error);
          setBookDetails(null);
          setBookCoverImage(null);
        }
      } else if (transaction.research_paper_id) {
        // Handle research paper
        try {
          const booksAndResearch = await fetchBooksAndResearch();
          const researchData = booksAndResearch.find(item => 
            item.research_paper_id === transaction.research_paper_id && 
            item.type === 'Research Paper'
          );
          
          if (researchData) {
            setBookDetails(researchData);
          } else {
            setBookDetails(null);
          }
        } catch (error) {
          console.error("Error fetching research paper:", error);
          setBookDetails(null);
        }
      }
      
      // Fetch fine details if transaction exists
      if (transaction.transaction_id) {
        const fineData = await getTransactionFine(transaction.transaction_id);
        setFineDetails(fineData);
      }
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError(err.message || 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!transactionDetails) return null;

    const { status, daysRemaining } = transactionDetails;
    const overdueDays = fineDetails?.daysOverdue || 0;
    
    switch (status) {
      case "borrowed":
        if (overdueDays > 0) {
          return (
            <div className="d-flex flex-column">
              <span className="badge bg-danger mb-2">
                <FaExclamationTriangle className="me-1" />
                Overdue ({overdueDays} day{overdueDays !== 1 ? 's' : ''})
              </span>
              {fineDetails && (
                <div className="small text-danger">
                  <strong>Fine: ₱{fineDetails.fine.toFixed(2)}</strong>
                  <br />
                  Daily Rate: ₱{fineDetails.dailyFine}/day ({fineDetails.userType})
                  <br />
                  {fineDetails.message}
                </div>
              )}
            </div>
          );
        } else if (daysRemaining === 0) {
          return (
            <span className="badge bg-warning">
              <FaClock className="me-1" />
              Due Today
            </span>
          );
        } else {
          return (
            <span className="badge bg-success">
              <FaCheckCircle className="me-1" />
              Active ({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining)
            </span>
          );
        }
      case "returned":
        return (
          <span className="badge bg-info">
            <FaCheckCircle className="me-1" />
            Returned
          </span>
        );
      case "reserved":
        return (
          <span className="badge bg-primary">
            <FaClock className="me-1" />
            Reserved
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary">
            Unknown Status
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (imageSrc, title) => {
    setModalImage({ src: imageSrc, title });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImage({ src: '', title: '' });
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content"
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          {/* Compact Header */}
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #800000 0%, #b71c1c 100%)",
              color: "white",
              padding: "6px 14px",
              border: "none",
              minHeight: "unset",
              height: "38px",
              alignItems: "center",
            }}
          >
            <div
              className="d-flex align-items-center w-100 justify-content-between"
              style={{ minHeight: 0 }}
            >
              <div
                className="d-flex align-items-center"
                style={{ minHeight: 0 }}
              >
                <FaReceipt className="me-2" size={15} />
                <span
                  className="modal-title mb-0"
                  style={{
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {transactionDetails?.reference_number || "Transaction Details"}
                  <span
                    style={{
                      opacity: 0.8,
                      fontWeight: 400,
                      fontSize: "0.85em",
                      marginLeft: 10,
                    }}
                  >
                    — {transactionDetails?.studentName || "Loading..."}
                  </span>
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={onHide}
                style={{ filter: "brightness(0) invert(1)", marginLeft: 10 }}
              ></button>
            </div>
          </div>

          <div
            className="modal-body"
            style={{ padding: "20px", minHeight: "500px" }}
          >
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading transaction details...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <FaExclamationTriangle className="me-2" />
                {error}
              </div>
            ) : transactionDetails ? (
              <div className="row g-4">
                {/* Top Row - Receipt Image and Transaction/Student Info */}
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-header" style={{ backgroundColor: "#fff5f5" }}>
                      <h6 className="mb-0 text-center">
                        <FaReceipt className="me-2 text-danger" />
                        Receipt Image
                      </h6>
                    </div>
                    <div className="card-body d-flex align-items-center justify-content-center p-2">
                      {receiptImage ? (
                        <div className="text-center w-100">
                          <img
                            src={receiptImage}
                            alt="Transaction Receipt"
                            className="img-fluid rounded shadow-sm"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "calc(100vh - 300px)",
                              objectFit: "contain",
                              border: "2px solid #e9ecef",
                              cursor: "pointer",
                              transition: "transform 0.2s ease"
                            }}
                            onClick={() => handleImageClick(receiptImage, 'Transaction Receipt')}
                            onMouseOver={(e) => e.target.style.transform = "scale(1.02)"}
                            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                          />
                          <p className="mt-2 small text-muted">Click to enlarge</p>
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          <FaFileAlt size={60} className="mb-3 opacity-25" />
                          <p className="mb-0">No receipt image available</p>
                          <small>Receipt was not uploaded for this transaction</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Transaction and Student Info */}
                <div className="col-md-8">
                  <div className="row g-3">
                    {/* Transaction Information Card */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header" style={{ backgroundColor: "#fff5f5" }}>
                          <h6 className="mb-0">
                            <FaInfoCircle className="me-2 text-danger" />
                            Transaction Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">Reference Number</label>
                                <p className="mb-0 fw-semibold">{transactionDetails.reference_number}</p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">Transaction Type</label>
                                <p className="mb-0">
                                  <span className="badge bg-primary">
                                    {transactionDetails.transaction_type}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">Due Date</label>
                                <p className="mb-0">{formatDate(transactionDetails.due_date)}</p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">Current Status</label>
                                <div>{getStatusDisplay()}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student/Faculty Information Card */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header" style={{ backgroundColor: "#fff5f5" }}>
                          <h6 className="mb-0">
                            <FaUser className="me-2 text-danger" />
                            {userDetails?.position === 'Student' || !userDetails?.position ? 'Student' : 'Faculty'} Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            {/* Profile Photo */}
                            <div className="col-md-3 d-flex flex-column align-items-center">
                              <div className="mb-2" style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {profileImage ? (
                                  <img
                                    src={profileImage}
                                    alt="Profile Photo"
                                    className="img-fluid rounded shadow-sm"
                                    style={{
                                      maxWidth: "120px",
                                      maxHeight: "160px",
                                      objectFit: "cover",
                                      border: "2px solid #e9ecef",
                                      cursor: "pointer",
                                      transition: "transform 0.2s ease"
                                    }}
                                    onClick={() => handleImageClick(profileImage, 'Profile Photo')}
                                    onMouseOver={(e) => e.target.style.transform = "scale(1.02)"}
                                    onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                                  />
                                ) : (
                                  <div 
                                    className="d-flex align-items-center justify-content-center rounded shadow-sm"
                                    style={{
                                      width: "120px",
                                      height: "160px",
                                      backgroundColor: "#f8f9fa",
                                      border: "2px solid #e9ecef"
                                    }}
                                  >
                                    <FaUser size={40} className="text-muted" />
                                  </div>
                                )}
                              </div>
                              <p className="small text-muted text-center mb-0">
                                {profileImage ? "Click to enlarge" : "No photo available"}
                              </p>
                            </div>

                            <div className="col-md-9">
                              <div className="row">
                                {/* Full Name */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Full Name</label>
                                    <p className="mb-0 fw-semibold">
                                      {userDetails ? 
                                        `${userDetails.first_name || ''} ${userDetails.middle_name ? `${userDetails.middle_name} ` : ''}${userDetails.last_name || ''}`.trim() :
                                        transactionDetails.studentName || 'N/A'
                                      }
                                    </p>
                                  </div>
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Email</label>
                                    <p className="mb-0">{userDetails?.email || transactionDetails.student_email}</p>
                                  </div>
                                </div>

                                {/* Contact Number */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Contact Number</label>
                                    <p className="mb-0">
                                      {userDetails?.contact_number || 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {/* Conditional Fields based on Position */}
                                {(userDetails?.position === 'Student' || !userDetails?.position) ? (
                                  <>
                                    {/* Student ID */}
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Student ID</label>
                                        <p className="mb-0">{userDetails?.student_id || transactionDetails.student_id || 'N/A'}</p>
                                      </div>
                                    </div>
                                    {/* Department and Year Level */}
                                    <div className="col-md-12">
                                      <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Department and Year Level</label>
                                        <p className="mb-0">
                                          <span className="badge bg-primary me-2">
                                            {userDetails?.departmentAcronym || transactionDetails.departmentAcronym || 'N/A'}
                                          </span>
                                          <span className="badge bg-info">
                                            Year {userDetails?.yearLevel || transactionDetails.yearLevel || 'N/A'}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Faculty ID */}
                                    <div className="col-md-6">
                                      <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Faculty ID</label>
                                        <p className="mb-0">{userDetails?.faculty_id || userDetails?.student_id || transactionDetails.student_id || 'N/A'}</p>
                                      </div>
                                    </div>
                                    {/* Position */}
                                    <div className="col-md-12">
                                      <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Position</label>
                                        <p className="mb-0">
                                          <span className="badge bg-success">
                                            {userDetails?.position || transactionDetails.position || 'Faculty'}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book/Research Information Card - Full Width */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header" style={{ backgroundColor: "#fff5f5" }}>
                      <h6 className="mb-0">
                        <FaBook className="me-2 text-danger" />
                        {(transactionDetails.book_id || transaction.book_id) ? 'Book Information' : 'Research Paper Information'}
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {/* Book Cover or Research Image */}
                        <div className="col-md-2 d-flex flex-column align-items-center">
                          <div className="mb-2" style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {(transactionDetails.book_id || transaction.book_id) ? (
                              bookCoverImage ? (
                                <img
                                  src={bookCoverImage}
                                  alt="Book Cover"
                                  className="img-fluid rounded shadow-sm"
                                  style={{
                                    maxWidth: "120px",
                                    maxHeight: "160px",
                                    objectFit: "cover",
                                    border: "2px solid #e9ecef",
                                    cursor: "pointer",
                                    transition: "transform 0.2s ease"
                                  }}
                                  onClick={() => handleImageClick(bookCoverImage, 'Book Cover')}
                                  onMouseOver={(e) => e.target.style.transform = "scale(1.02)"}
                                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                                />
                              ) : (
                                <div 
                                  className="d-flex align-items-center justify-content-center rounded shadow-sm"
                                  style={{
                                    width: "120px",
                                    height: "160px",
                                    backgroundColor: "#f8f9fa",
                                    border: "2px solid #e9ecef"
                                  }}
                                >
                                  <FaBook size={40} className="text-muted" />
                                </div>
                              )
                            ) : (
                              <div 
                                className="d-flex align-items-center justify-content-center rounded shadow-sm"
                                style={{
                                  width: "120px",
                                  height: "160px",
                                  backgroundColor: "#f8f9fa",
                                  border: "2px solid #e9ecef"
                                }}
                              >
                                <FaFileAlt size={40} className="text-muted" />
                              </div>
                            )}
                          </div>
                          <p className="small text-muted text-center mb-0">
                            {bookCoverImage ? "Click to enlarge" : "No cover available"}
                          </p>
                        </div>

                        <div className="col-md-10">
                          <div className="row">
                            {/* Title */}
                            <div className="col-md-12">
                              <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">Title</label>
                                <p className="mb-0 fw-semibold">
                                  {bookDetails?.book_title || 
                                   bookDetails?.title || 
                                   transactionDetails?.book_title || 
                                   transaction?.book_title || 
                                   transactionDetails?.research_title || 
                                   transaction?.research_title || 
                                   'Unknown Item'}
                                </p>
                              </div>
                            </div>

                            {(transactionDetails.book_id || transaction.book_id) ? (
                              <>
                                {/* Book Author */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Author</label>
                                    <p className="mb-0">{bookDetails?.author || transactionDetails?.author || transaction?.author || 'N/A'}</p>
                                  </div>
                                </div>
                                {/* Book Genre */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Genre</label>
                                    <p className="mb-0">
                                      <span className="badge bg-secondary">
                                        {bookDetails?.genre || transactionDetails?.genre || transaction?.genre || 'N/A'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                {/* Publisher */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Publisher</label>
                                    <p className="mb-0">{bookDetails?.publisher || transactionDetails?.publisher || transaction?.publisher || 'N/A'}</p>
                                  </div>
                                </div>
                                {/* Year & Edition */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Year & Edition</label>
                                    <p className="mb-0">
                                      <span className="badge bg-info me-2">
                                        {bookDetails?.book_year || transactionDetails?.book_year || transaction?.book_year || 'N/A'}
                                      </span>
                                      <span className="badge bg-warning">
                                        {(bookDetails?.book_edition || transactionDetails?.book_edition || transaction?.book_edition) ? 
                                         `${bookDetails?.book_edition || transactionDetails?.book_edition || transaction?.book_edition} Edition` : 'N/A'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                {/* Price */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Price</label>
                                    <p className="mb-0 text-success fw-bold">
                                      {(bookDetails?.book_price || transactionDetails?.book_price || transaction?.book_price) ? 
                                        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
                                          bookDetails?.book_price || transactionDetails?.book_price || transaction?.book_price
                                        ) : 'N/A'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Research Authors */}
                                <div className="col-md-12">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Authors</label>
                                    <p className="mb-0">{bookDetails?.authors || transactionDetails?.authors || transaction?.authors || 'N/A'}</p>
                                  </div>
                                </div>
                                {/* Research Department */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Department</label>
                                    <p className="mb-0">
                                      <span className="badge bg-primary">
                                        {bookDetails?.department || transactionDetails?.department || transaction?.department || 'N/A'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                {/* Research Year */}
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Year Published</label>
                                    <p className="mb-0">
                                      <span className="badge bg-info">
                                        {bookDetails?.year_published || 
                                         (bookDetails?.created_at ? new Date(bookDetails.created_at).getFullYear() : null) || 
                                         transactionDetails?.year_published || 
                                         transaction?.year_published || 'N/A'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                {/* Research Abstract */}
                                <div className="col-md-12">
                                  <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Abstract</label>
                                    <div 
                                      className="p-3 bg-light rounded border"
                                      style={{ maxHeight: "150px", overflowY: "auto" }}
                                    >
                                      <p className="mb-0 small">
                                        {bookDetails?.abstract || transactionDetails?.abstract || transaction?.abstract || 'No abstract available'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <FaExclamationTriangle className="me-2" />
                No transaction details available
              </div>
            )}
          </div>

          <div
            className="modal-footer"
            style={{
              backgroundColor: "#fff5f5",
              border: "none",
              padding: "10px 20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <small className="text-muted">Lib-Track</small>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={onHide}
                style={{
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  padding: "6px 16px",
                }}
              >
                <FaTimes className="me-1" size={12} />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1060 }}
          onClick={closeImageModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">{modalImage.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeImageModal}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img
                  src={modalImage.src}
                  alt={modalImage.title}
                  className="img-fluid rounded shadow-lg"
                  style={{
                    maxHeight: "80vh",
                    maxWidth: "100%",
                    objectFit: "contain"
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionDetailModal;