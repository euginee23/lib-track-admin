import React, { useState, useEffect } from "react";

const EditBookModal = ({ show, onClose, onSave, book }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    quantity: "",
    publisher: "",
    edition: "",
    shelf: "",
    author: "",
    year: "",
    donor: "",
    price: "",
    cover: null,
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        genre: book.genre || "",
        quantity: book.quantity || "",
        publisher: book.publisher || "",
        edition: book.edition || "",
        shelf: book.shelf || "",
        author: book.author || "",
        year: book.year || "",
        donor: book.donor || "",
        price: book.price || "",
        cover: book.cover || null,
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cover" && files.length > 0) {
      setFormData((prev) => ({ ...prev, cover: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Book</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Book Title</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Publisher</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Edition</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Author</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Shelf</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="shelf"
                    value={formData.shelf}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Donor</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="donor"
                    value={formData.donor}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Cover Image</label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    name="cover"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {formData.cover && typeof formData.cover === "string" && (
                    <img
                      src={formData.cover}
                      alt="Book Cover"
                      className="img-thumbnail mt-2"
                      style={{ maxHeight: "100px" }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success btn-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookModal;
