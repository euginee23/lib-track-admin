import React, { useState, useEffect } from 'react';
import { FaBook, FaUndo, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

const ActivityToast = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOK_BORROWED':
        return <FaBook className="text-primary fs-5" />;
      case 'BOOK_RETURNED':
        return <FaUndo className="text-success fs-5" />;
      case 'PENALTY_PAID':
        return <FaMoneyBillWave className="text-warning fs-5" />;
      default:
        return null;
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'BOOK_BORROWED':
        return 'Book Borrowed';
      case 'BOOK_RETURNED':
        return 'Book Returned';
      case 'PENALTY_PAID':
        return 'Penalty Paid';
      default:
        return 'New Activity';
    }
  };

  return (
    <div
      className={`toast-notification ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '350px',
        maxWidth: '450px'
      }}
    >
      <div className="card border-0 shadow-lg">
        <div className="card-body p-3">
          <div className="d-flex align-items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-bold">{getTitle(notification.type)}</h6>
              <p className="mb-0 small text-muted">{notification.message}</p>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Just now
              </small>
            </div>
            <button
              type="button"
              className="btn-close btn-sm"
              onClick={handleClose}
              style={{ fontSize: '0.7rem' }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .toast-enter {
          animation: slideInRight 0.3s ease-out;
        }

        .toast-exit {
          animation: slideOutRight 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default ActivityToast;
