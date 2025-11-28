import React from "react";
import { FaTimes, FaQrcode, FaFileAlt, FaUser, FaCalendar, FaInfoCircle } from "react-icons/fa";

function ViewResearchCopyModal({ show, onClose, copyData }) {
  if (!show || !copyData) return null;

  const { researchDetails, currentBorrower } = copyData;

  const bufferObjToBase64 = (buf) => {
    if (!buf) return null;
    if (typeof buf === 'string') return buf;
    if (buf && buf.data) {
      const byteArray = new Uint8Array(buf.data);
      let binary = '';
      for (let i = 0; i < byteArray.length; i++) binary += String.fromCharCode(byteArray[i]);
      return window.btoa(binary);
    }
    return null;
  };

  const qrSrc = researchDetails?.research_paper_qr ? `data:image/png;base64,${bufferObjToBase64(researchDetails.research_paper_qr)}` : null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white py-2">
            <div className="d-flex align-items-center w-100">
              <FaFileAlt className="me-2" />
              <div className="flex-grow-1">
                <div className="fw-bold small">Research Paper Details</div>
                <div className="text-truncate small" style={{ maxWidth: 600 }}>{researchDetails?.research_title}</div>
              </div>
              <button type="button" className="btn btn-sm btn-outline-light ms-3" onClick={onClose} aria-label="Close">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="modal-body py-3">
            {/* Top: Research Information */}
            <div className="row g-3">
              <div className="col-md-4 d-flex flex-column align-items-center">
                <div className="mb-2 small text-muted">QR Code</div>
                <div className="p-2 bg-white rounded border" style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {qrSrc ? (
                    <img src={qrSrc} alt="QR" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  ) : (
                    <FaQrcode size={48} className="text-muted" />
                  )}
                </div>
              </div>

              <div className="col-md-8">
                <div className="card small">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{researchDetails?.research_title}</div>
                        <div className="text-muted small mt-1">{researchDetails?.research_abstract ? researchDetails.research_abstract.slice(0,140) + (researchDetails.research_abstract.length>140 ? '...' : '') : ''}</div>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">Year</div>
                        <div className="fw-semibold">{researchDetails?.year_publication || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="row mt-2 small">
                      <div className="col-6 text-muted">Department</div>
                      <div className="col-6">{researchDetails?.department_name || 'N/A'}</div>
                      <div className="col-6 text-muted mt-1">Status</div>
                      <div className="col-6 mt-1">
                        {researchDetails?.status === 'Removed' ? (
                          <span className="badge bg-danger">Removed</span>
                        ) : currentBorrower ? (
                          <span className="badge bg-warning">Borrowed</span>
                        ) : (
                          <span className="badge bg-success">Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Current Status */}
            <div className="row mt-3">
              <div className="col-12">
                <div className="fw-semibold small mb-2"><FaUser className="me-1" />Current Status</div>

                {currentBorrower ? (
                  <div className="card border-warning small">
                    <div className="card-body py-2">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{currentBorrower.first_name} {currentBorrower.last_name}</div>
                          <div className="text-muted small">{currentBorrower.email}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-muted small">ID</div>
                          <div className="fw-semibold">{currentBorrower.student_id || '—'}</div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-2 small text-muted">
                        <div>Borrowed: <span className="text-dark">{new Date(currentBorrower.transaction_date).toLocaleDateString()}</span></div>
                        <div>Days: <span className="text-dark">{Math.floor((new Date() - new Date(currentBorrower.transaction_date))/(1000*60*60*24))}d</span></div>
                      </div>

                      {new Date(currentBorrower.due_date) < new Date() && (
                        <div className="mt-2">
                          <div className="badge bg-danger">Overdue</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card border-success small">
                    <div className="card-body text-center py-4">
                      <FaFileAlt size={36} className="text-success mb-2" />
                      <div className="text-muted">This research paper is currently available for borrowing.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer py-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}><FaTimes className="me-1" />Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResearchCopyModal;
