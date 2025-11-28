import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { forgotPassword, resetPassword } from '../../api/login/forgot_password';

const ForgotPasswordModal = ({ show, onHide }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    onHide();
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!code) {
      toast.error('Please enter the verification code.');
      return;
    }

    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, code, newPassword);
      toast.success('Password reset successfully! You can now login with your new password.');
      handleClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show && <div className="modal-backdrop show"></div>}
      <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: '#880000', color: 'white' }}>
              <h5 className="modal-title">
                <i className="fas fa-lock me-2"></i>
                Reset Password
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            </div>
            
            <div className="modal-body">
        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="text-center mb-3">
              <h5>Forgot Your Password?</h5>
              <p className="text-muted">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
            </div>
            
            <div className="mb-3">
              <label htmlFor="reset-email" className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                id="reset-email"
                className="form-control"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ backgroundColor: '#880000', borderColor: '#880000' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="text-center mb-3">
              <h5>Enter Verification Code</h5>
              <p className="text-muted">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>
            
            <div className="mb-3">
              <label htmlFor="verification-code" className="form-label fw-semibold">
                Verification Code
              </label>
              <input
                type="text"
                id="verification-code"
                className="form-control text-center"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                required
                disabled={loading}
                style={{ fontSize: '1.5em', letterSpacing: '0.5em' }}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="new-password" className="form-label fw-semibold">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="6"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label fw-semibold">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
                required
                disabled={loading}
              />
            </div>
            
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ backgroundColor: '#880000', borderColor: '#880000' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Email
              </button>
            </div>
          </form>
        )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;