import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUser } from "react-icons/fa";

function FilterByAuthorModal({ show, onClose, onSelectAuthor, selectedAuthor, books }) {
  const [authors, setAuthors] = useState([]);
  const [localSelectedAuthors, setLocalSelectedAuthors] = useState([]);

  useEffect(() => {
    if (!show) return;
    // Extract authors from books and research papers
    const authorSet = new Set();
    books.forEach((item) => {
      if (item.type === "Research Paper") {
        // Research papers: authors may be an array or a string
        if (Array.isArray(item.authors)) {
          item.authors.forEach((author) => {
            if (author && author.trim()) authorSet.add(author.trim());
          });
        } else if (item.authors) {
          authorSet.add(item.authors.trim());
        } else if (item.author) {
          authorSet.add(item.author.trim());
        }
      } else {
        // Books: authors may be an array or a string
        if (Array.isArray(item.authors)) {
          item.authors.forEach((author) => {
            if (author && author.trim()) authorSet.add(author.trim());
          });
        } else if (item.authors) {
          authorSet.add(item.authors.trim());
        } else if (item.author) {
          authorSet.add(item.author.trim());
        }
      }
    });
    setAuthors(Array.from(authorSet).sort());
    setLocalSelectedAuthors(Array.isArray(selectedAuthor) ? selectedAuthor : selectedAuthor ? [selectedAuthor] : []);
  }, [show, books, selectedAuthor]);

  const handleAuthorClick = (author) => {
    setLocalSelectedAuthors((prev) =>
      prev.includes(author)
        ? prev.filter((a) => a !== author)
        : [...prev, author]
    );
  };

  const handleContinue = () => {
    if (localSelectedAuthors.length > 0) {
      onSelectAuthor(localSelectedAuthors);
      setLocalSelectedAuthors([]); // Reset after filtering
    }
  };

  return show ? (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content shadow border-0">
          <div className="modal-header py-2 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <FaUser className="me-2" /> Filter by Author
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-muted mb-3 small text-center">Select author(s) to filter data.</p>
            <div
              className="d-grid gap-2"
              style={
                authors.length > 7
                  ? { maxHeight: "320px", overflowY: "auto" }
                  : {}
              }
            >
              {authors.length === 0 ? (
                <div className="text-center text-muted">No authors found.</div>
              ) : (
                authors.slice(0, 10).map((author) => (
                  <button
                    key={author}
                    className={`btn d-flex align-items-center justify-content-start p-2 ${localSelectedAuthors.includes(author) ? "btn-primary" : "btn-outline-primary"}`}
                    style={{ borderRadius: "8px", transition: "all 0.2s ease" }}
                    onClick={() => handleAuthorClick(author)}
                  >
                    <FaUser className="me-2" />
                    <span className="fw-semibold">{author}</span>
                    {localSelectedAuthors.includes(author) && (
                      <span className="ms-auto badge bg-success">Selected</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="modal-footer py-2">
            <button className="btn btn-sm btn-light" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
            {localSelectedAuthors.length > 0 && (
              <button className="btn btn-sm btn-success" onClick={handleContinue}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

FilterByAuthorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectAuthor: PropTypes.func.isRequired,
  selectedAuthor: PropTypes.string,
  books: PropTypes.array.isRequired,
};

export default FilterByAuthorModal;
