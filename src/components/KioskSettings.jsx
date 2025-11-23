import React, { useState, useEffect, useRef } from "react";
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSave, 
  FaDesktop, 
  FaTrashAlt, 
  FaEdit, 
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaKey,
  FaSpinner
} from "react-icons/fa";
import { getKioskPin, saveKioskPin, deleteKioskPin } from "../../api/settings/kiosk_pin";

function KioskSettings() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedPin, setSavedPin] = useState(null);
  const [editingAllowed, setEditingAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modal state for verifying current PIN before edit/delete
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null); // 'edit' | 'delete'
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyShow, setVerifyShow] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const handlePinChange = (e) => {
    // sanitize: remove non-digits and limit to 6
    const raw = e.target.value || '';
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    setPin(cleaned);
    setError('');
    setSuccess('');
  };

  const handleConfirmPinChange = (e) => {
    const raw = e.target.value || '';
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    setConfirmPin(cleaned);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    // Validation
    if (!pin) {
      setError("Please enter a PIN");
      return;
    }

    if (pin.length !== 6) {
      setError("PIN must be exactly 6 digits");
      return;
    }

    if (!confirmPin) {
      setError("Please confirm your PIN");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    // Save PIN to database
    setLoading(true);
    try {
      const currentPin = editingAllowed ? savedPin : null;
      await saveKioskPin(pin, currentPin);
      
      setSavedPin(pin);
      setSuccess('Kiosk PIN saved successfully!');
      setError('');
      setEditingAllowed(false);
      setPin('');
      setConfirmPin('');

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error('Failed to save PIN:', err);
      setError(err || 'Failed to save PIN to database');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPin("");
    setConfirmPin("");
    setError("");
    setSuccess("");
    setShowPin(false);
    setShowConfirmPin(false);
    setEditingAllowed(false);
  };

  useEffect(() => {
    // Load saved PIN from database
    const fetchKioskPin = async () => {
      setInitialLoading(true);
      try {
        const data = await getKioskPin();
        if (data.hasPin && data.pin) {
          setSavedPin(data.pin);
        }
      } catch (err) {
        console.error('Failed to fetch saved PIN:', err);
        // Don't show error to user on initial load
      } finally {
        setInitialLoading(false);
      }
    };

    fetchKioskPin();
  }, []);

  const maskedPin = (p) => {
    if (!p) return '';
    return '•'.repeat(Math.min(6, p.length));
  };

  const requestEdit = () => {
    setVerifyAction('edit');
    setVerifyInput('');
    setVerifyError('');
    setShowVerifyModal(true);
  };

  const requestDelete = () => {
    setVerifyAction('delete');
    setVerifyInput('');
    setVerifyError('');
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = async () => {
    if (!verifyInput || verifyInput.length !== 6) {
      setVerifyError('Enter your current 6-digit PIN');
      return;
    }
    if (verifyInput !== savedPin) {
      setVerifyError('Incorrect PIN');
      return;
    }

    // Verified
    setShowVerifyModal(false);
    setVerifyError('');
    
    if (verifyAction === 'edit') {
      // Allow editing the PIN inputs
      setEditingAllowed(true);
      setPin('');
      setConfirmPin('');
    } else if (verifyAction === 'delete') {
      // Delete saved PIN from database
      setLoading(true);
      try {
        await deleteKioskPin(verifyInput);
        setSavedPin(null);
        setPin('');
        setConfirmPin('');
        setSuccess('Kiosk PIN removed successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Failed to delete saved PIN:', err);
        setError(err || 'Failed to delete saved PIN');
      } finally {
        setLoading(false);
      }
    }
  };

  // Prevent body scrollbar/layout shift when modal is open and add ESC handler
  const bodyOverflowRef = useRef('');
  const bodyPaddingRef = useRef('');
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && showVerifyModal) {
        setShowVerifyModal(false);
      }
    };

    if (showVerifyModal) {
      // store current body styles
      bodyOverflowRef.current = document.body.style.overflow || '';
      bodyPaddingRef.current = document.body.style.paddingRight || '';

      // calculate scrollbar width to avoid layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      document.addEventListener('keydown', onKeyDown);
    }

    return () => {
      // restore
      document.body.style.overflow = bodyOverflowRef.current || '';
      document.body.style.paddingRight = bodyPaddingRef.current || '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showVerifyModal]);

  return (
    <div className="container-fluid py-4">
      {initialLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
          <div className="text-center">
            <FaSpinner className="fa-spin fs-1 text-primary mb-3" />
            <p className="text-muted">Loading kiosk settings...</p>
          </div>
        </div>
      ) : (
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          {/* Page Header */}
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">
              <FaDesktop className="me-3 text-primary" />
              Kiosk Security Settings
            </h2>
            <p className="text-muted mb-0">
              Configure and manage security settings for your kiosk terminals
            </p>
          </div>

          <div className="row g-4">
            {/* Left Column - PIN Management */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-gradient" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaShieldAlt className="me-2" />
                    PIN Security Management
                  </h5>
                </div>
                <div className="card-body p-4">
                  {/* Success Message */}
                  {success && (
                    <div className="alert alert-success alert-dismissible fade show d-flex align-items-center" role="alert">
                      <FaCheckCircle className="me-2 fs-5" />
                      <div className="flex-grow-1">
                        <strong>Success!</strong> {success}
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess("")}
                      ></button>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                      <FaTimesCircle className="me-2 fs-5" />
                      <div className="flex-grow-1">
                        <strong>Error!</strong> {error}
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError("")}
                      ></button>
                    </div>
                  )}

                  {/* Current PIN Status */}
                  {savedPin && !editingAllowed && (
                    <div className="mb-4">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" 
                                  style={{width: '48px', height: '48px'}}>
                                  <FaKey className="text-white fs-5" />
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-1 fw-bold">PIN Active & Secured</h6>
                                <p className="mb-0 text-muted small">
                                  Current PIN: <span className="fw-bold fs-6">{maskedPin(savedPin)}</span>
                                </p>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary d-flex align-items-center" 
                                onClick={requestEdit} 
                                title="Edit PIN"
                              >
                                <FaEdit className="me-1" /> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger d-flex align-items-center" 
                                onClick={requestDelete} 
                                title="Delete PIN"
                              >
                                <FaTrashAlt className="me-1" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Input Form */}
                  {(!savedPin || editingAllowed) && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="kioskPin" className="form-label fw-semibold d-flex align-items-center">
                          <FaLock className="me-2 text-primary" />
                          Kiosk Admin PIN
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <FaKey className="text-muted" />
                          </span>
                          <input
                            type={showPin ? "text" : "password"}
                            className="form-control border-start-0"
                            id="kioskPin"
                            placeholder="••••••"
                            value={pin}
                            onChange={handlePinChange}
                            maxLength={6}
                            inputMode="numeric"
                            style={{
                              letterSpacing: "0.5rem",
                              fontSize: "1.5rem",
                              textAlign: "center",
                              fontFamily: "monospace",
                            }}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                          >
                            {showPin ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="form-text text-muted">
                            {pin.length}/6 digits
                          </small>
                          {pin.length === 6 && (
                            <small className="text-success fw-bold">
                              <FaCheckCircle className="me-1" />
                              Complete
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPin" className="form-label fw-semibold d-flex align-items-center">
                          <FaLock className="me-2 text-primary" />
                          Confirm PIN
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <FaKey className="text-muted" />
                          </span>
                          <input
                            type={showConfirmPin ? "text" : "password"}
                            className="form-control border-start-0"
                            id="confirmPin"
                            placeholder="••••••"
                            value={confirmPin}
                            onChange={handleConfirmPinChange}
                            maxLength={6}
                            inputMode="numeric"
                            style={{
                              letterSpacing: "0.5rem",
                              fontSize: "1.5rem",
                              textAlign: "center",
                              fontFamily: "monospace",
                            }}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfirmPin(!showConfirmPin)}
                          >
                            {showConfirmPin ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <small className="form-text text-muted">
                            {confirmPin.length}/6 digits
                          </small>
                          {confirmPin.length === 6 && pin === confirmPin && (
                            <small className="text-success fw-bold">
                              <FaCheckCircle className="me-1" />
                              PINs match
                            </small>
                          )}
                          {confirmPin.length === 6 && pin !== confirmPin && (
                            <small className="text-danger fw-bold">
                              <FaTimesCircle className="me-1" />
                              PINs don't match
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                        <button
                          className="btn btn-secondary px-4"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary px-4"
                          onClick={handleSave}
                          disabled={!pin || pin.length !== 6 || !confirmPin || pin !== confirmPin || loading}
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="fa-spin me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              Save PIN
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Information & Security Tips */}
            <div className="col-lg-5">
              {/* Security Info Card */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FaInfoCircle className="me-2" />
                    About Kiosk Security
                  </h6>
                </div>
                <div className="card-body">
                  <p className="small mb-3">
                    The Kiosk PIN protects administrative functions on library kiosk terminals. 
                    This ensures only authorized staff can access sensitive operations.
                  </p>
                  <div className="mb-2">
                    <strong className="text-primary small">Protected Features:</strong>
                  </div>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>Administrative settings access</li>
                    <li>User management functions</li>
                    <li>Transaction overrides</li>
                    <li>System configuration changes</li>
                  </ul>
                </div>
              </div>

              {/* Security Tips Card */}
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FaShieldAlt className="me-2" />
                    Security Best Practices
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="small mb-0 ps-3">
                    <li className="mb-2">
                      <strong>Use unique PINs:</strong> Don't reuse PINs from other systems
                    </li>
                    <li className="mb-2">
                      <strong>Change regularly:</strong> Update your PIN every 3-6 months
                    </li>
                    <li className="mb-2">
                      <strong>Keep it confidential:</strong> Never share your PIN with unauthorized users
                    </li>
                    <li className="mb-2">
                      <strong>Avoid obvious patterns:</strong> Don't use sequential numbers like 123456
                    </li>
                    <li className="mb-0">
                      <strong>Store securely:</strong> If you must write it down, keep it in a secure location
                    </li>
                  </ul>
                </div>
              </div>

              {/* Status Card */}
              <div className="card shadow-sm border-0">
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FaDesktop className="me-2" />
                    Current Status
                  </h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small text-muted">PIN Status:</span>
                    {savedPin ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-danger">Not Set</span>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small text-muted">Storage:</span>
                    <span className="badge bg-info">Database</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Security Level:</span>
                    {savedPin ? (
                      <span className="badge bg-success">Protected</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Unprotected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Verification Modal */}
      {showVerifyModal && (
        <div 
          style={{
            position:'fixed', 
            inset:0, 
            zIndex:1050, 
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)'
          }} 
          className="d-flex align-items-center justify-content-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVerifyModal(false);
          }}
        >
          <div className="card shadow-lg border-0" style={{width: '450px', animation: 'fadeIn 0.2s ease-in'}}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FaLock className="me-2" />
                Verify Current PIN
              </h5>
            </div>
            <div className="card-body p-4">
              <p className="text-muted mb-3">
                For security reasons, please enter your current 6-digit PIN to {verifyAction === 'edit' ? 'edit' : 'delete'} it.
              </p>
              
              {verifyError && (
                <div className="alert alert-danger d-flex align-items-center">
                  <FaTimesCircle className="me-2" />
                  {verifyError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="form-label fw-semibold">Current PIN</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light">
                    <FaKey className="text-muted" />
                  </span>
                  <input
                    type={verifyShow ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••"
                    value={verifyInput}
                    inputMode="numeric"
                    onChange={(e) => {
                      setVerifyInput(e.target.value.replace(/[^0-9]/g, '').slice(0,6));
                      setVerifyError('');
                    }}
                    maxLength={6}
                    autoFocus
                    style={{
                      letterSpacing: "0.5rem",
                      fontSize: "1.5rem",
                      textAlign: "center",
                      fontFamily: "monospace",
                    }}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setVerifyShow(!verifyShow)}
                  >
                    {verifyShow ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small className="form-text text-muted">{verifyInput.length}/6 digits</small>
              </div>
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  className="btn btn-secondary px-4" 
                  onClick={() => setShowVerifyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary px-4" 
                  onClick={handleVerifySubmit}
                  disabled={verifyInput.length !== 6}
                >
                  <FaCheckCircle className="me-2" />
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default KioskSettings;
