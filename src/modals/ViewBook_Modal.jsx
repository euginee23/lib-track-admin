import React from "react";
import { FaTimes } from "react-icons/fa";

function ViewBookModal({ show, onClose, book }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">View Book Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row mb-2">
              <div className="col-6">
                <p><strong>Type:</strong> {book.type}</p>
              </div>
              <div className="col-6">
                <p><strong>Title:</strong> {book.title}</p>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-6">
                <p><strong>Author:</strong> {book.author}</p>
              </div>
              <div className="col-6">
                <p><strong>Genre:</strong> {book.genre}</p>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-6">
                <p><strong>Publisher:</strong> {book.publisher}</p>
              </div>
              <div className="col-6">
                <p><strong>Edition:</strong> {book.edition}</p>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-6">
                <p><strong>Year:</strong> {book.year}</p>
              </div>
              <div className="col-6">
                <p><strong>Quantity:</strong> {book.quantity}</p>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-6">
                <p><strong>Shelf:</strong> {book.shelf}</p>
              </div>
              <div className="col-6">
                <p><strong>Price:</strong> {book.price}</p>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-12">
                <p><strong>Donor:</strong> {book.donor || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewBookModal;
