import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaTags } from "react-icons/fa";

function FilterByCategoryModal({ show, onClose, onSelectCategory, selectedCategory, books }) {
  const [categories, setCategories] = useState([]);
  const [localSelectedCategories, setLocalSelectedCategories] = useState([]);

  useEffect(() => {
    if (!show) return;
    const categorySet = new Set();
    books.forEach((item) => {
      if (item.type === "Research Paper") {
        if (item.department) {
          categorySet.add(item.department.trim());
        } else if (item.department_name) {
          categorySet.add(item.department_name.trim());
        }
      } else {
        if (item.genre) {
          categorySet.add(item.genre.trim());
        }
      }
    });
    setCategories(Array.from(categorySet).sort());
    setLocalSelectedCategories(Array.isArray(selectedCategory) ? selectedCategory : selectedCategory ? [selectedCategory] : []);
  }, [show, books, selectedCategory]);

  const handleCategoryClick = (cat) => {
    setLocalSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const handleContinue = () => {
    if (localSelectedCategories.length > 0) {
      onSelectCategory(localSelectedCategories);
      setLocalSelectedCategories([]);
    }
  };

  return show ? (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content shadow border-0">
          <div className="modal-header py-2 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <FaTags className="me-2" /> Filter by Category / Department
            </h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-muted mb-3 small text-center">Select category or department to filter the library.</p>
            <div
              className="d-grid gap-2"
              style={
                categories.length > 7
                  ? { maxHeight: "320px", overflowY: "auto" }
                  : {}
              }
            >
              {categories.length === 0 ? (
                <div className="text-center text-muted">No categories found.</div>
              ) : (
                categories.slice(0, 10).map((cat) => (
                  <button
                    key={cat}
                    className={`btn d-flex align-items-center justify-content-start p-2 ${localSelectedCategories.includes(cat) ? "btn-primary" : "btn-outline-primary"}`}
                    style={{ borderRadius: "8px", transition: "all 0.2s ease" }}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <FaTags className="me-2" />
                    <span className="fw-semibold">{cat}</span>
                    {localSelectedCategories.includes(cat) && (
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
            {localSelectedCategories.length > 0 && (
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

FilterByCategoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string,
  books: PropTypes.array.isRequired,
};

export default FilterByCategoryModal;
