import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import AddBookModal from "../modals/AddBook_Modal";
import AddResearchModal from "../modals/AddResearch_Modal";
import EditBookModal from "../modals/EditBook_Modal";
import ViewBookModal from "../modals/ViewBook_Modal";
import TypeSelectionModal from "../modals/TypeSelection_Modal";
import { mockBooks } from "../../data/manage_books/books";

function ManageBooks() {
  const [books, setBooks] = useState(mockBooks);

  const [search, setSearch] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    type: "Book",
    title: "",
    author: "",
    genre: "",
    publisher: "",
    edition: "",
    year: "",
    quantity: 1,
    shelf: "",
    price: "",
    donor: "",
    cover: null,
  });
  const [newResearch, setNewResearch] = useState({
    type: "Research Paper",
    title: "",
    author: "",
    department: "",
    year: "",
    shelf: "",
    abstract: "",
  });

  const [filter, setFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const totalPages = Math.ceil(books.length / rowsPerPage);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleResearchChange = (e) => {
    const { name, value } = e.target;
    setNewResearch({ ...newResearch, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewBook({ ...newBook, cover: e.target.files[0] });
  };

  const handleTypeSelection = (type) => {
    if (type === "book") {
      setShowBookModal(true);
    } else if (type === "research") {
      setShowResearchModal(true);
    }
  };

  const handleAddBook = () => {
    if (editingBook) {
      setBooks(
        books.map((b) =>
          b.id === editingBook.id ? { ...newBook, id: b.id } : b
        )
      );
    } else {
      const bookData = { ...newBook, id: books.length + 1 };
      setBooks([...books, bookData]);
    }
    setShowBookModal(false);
    setEditingBook(null);
    setNewBook({
      type: "Book",
      title: "",
      author: "",
      genre: "",
      publisher: "",
      edition: "",
      year: "",
      quantity: 1,
      shelf: "",
      price: "",
      donor: "",
      cover: null,
    });
  };

  const handleAddResearch = () => {
    const researchData = { 
      ...newResearch, 
      id: books.length + 1, 
      genre: newResearch.department, 
      price: 0,
      quantity: 1,
      publisher: "",
      edition: "",
      donor: ""
    };
    setBooks([...books, researchData]);
    setShowResearchModal(false);
    setNewResearch({
      type: "Research Paper",
      title: "",
      author: "",
      department: "",
      year: "",
      shelf: "",
      abstract: "",
    });
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setNewBook(book);
  };

  const handleDelete = (ids) => {
    setBooks(books.filter((b) => !ids.includes(b.id)));
    setSelectedBooks([]);
  };

  const handleView = (book) => {
    setViewingBook(book);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSelectBook = (id) => {
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((bookId) => bookId !== id) : [...prev, id]
    );
  };

  const paginatedBooks = books.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  };

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Search + Add Button */}
      <div className="card mb-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Search input with icon */}
          <div className="input-group" style={{ width: "600px" }}>
            <span className="input-group-text p-1 bg-white border-end-0">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>

          {/* Right side: filter + add */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <label className="form-label small mb-0">Filter by:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "150px" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">Select Filter</option>
              <option value="type">Type</option>
              <option value="book">Title</option>
              <option value="paper">Author</option>
              <option value="donated">Shelf</option>
              <option value="purchased">Year</option>
            </select>

            <button
              className="btn btn-sm btn-success"
              onClick={() => setShowTypeModal(true)}
            >
              <FaPlus className="me-1" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div
        className="card shadow-sm p-2 flex-grow-1 d-flex flex-column"
        style={{ minHeight: "0", overflow: "hidden" }}
      >
        <div
          className="table-responsive flex-grow-1"
          style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
        >
          <table
            className="table table-sm table-striped align-middle mb-0"
          >
            <thead className="small">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedBooks(
                        e.target.checked ? books.map((b) => b.id) : []
                      )
                    }
                    checked={selectedBooks.length === books.length}
                  />
                </th>
                <th>Type</th>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Qty</th>
                <th>Shelf</th>
                <th>Year</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody className="small">
              {paginatedBooks.length === 0 && books.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No books found.
                  </td>
                </tr>
              )}
              {paginatedBooks.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => handleSelectBook(b.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => e.stopPropagation()}
                      checked={selectedBooks.includes(b.id)}
                    />
                  </td>
                  <td>{b.type}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.genre}</td>
                  <td>{b.quantity}</td>
                  <td>{b.shelf}</td>
                  <td>{b.year}</td>
                  <td>{formatPrice(b.price)}</td>
                </tr>
              ))}
              {currentPage === totalPages && paginatedBooks.length > 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-2">
                    No more rows.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls + Actions */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="small">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div className="btn-group">
            {selectedBooks.length === 1 ? (
              <>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleView(books.find((b) => b.id === selectedBooks[0]))}
                >
                  <FaEye size={12} /> View
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleEdit(books.find((b) => b.id === selectedBooks[0]))}
                >
                  <FaEdit size={12} /> Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(selectedBooks)}
                >
                  <FaTrash size={12} /> Delete
                </button>
              </>
            ) : selectedBooks.length > 1 ? (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(selectedBooks)}
              >
                <FaTrash size={12} /> Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* TYPE SELECTION MODAL */}
      <TypeSelectionModal
        show={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectType={handleTypeSelection}
      />

      {/* ADD BOOK MODAL */}
      <AddBookModal
        show={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          setEditingBook(null);
        }}
        onSave={handleAddBook}
        editingBook={editingBook}
        newBook={newBook}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
      />

      {/* ADD RESEARCH MODAL */}
      <AddResearchModal
        show={showResearchModal}
        onClose={() => setShowResearchModal(false)}
        onSave={handleAddResearch}
        newResearch={newResearch}
        handleChange={handleResearchChange}
      />

      {/* EDIT BOOK MODAL */}
      <EditBookModal
        show={!!editingBook}
        onClose={() => setEditingBook(null)}
        onSave={(updatedBook) => {
          setBooks(
            books.map((b) =>
              b.id === editingBook.id ? { ...updatedBook, id: b.id } : b
            )
          );
          setEditingBook(null);
        }}
        book={editingBook}
      />

      {/* VIEW BOOK MODAL */}
      <ViewBookModal
        show={!!viewingBook}
        onClose={() => setViewingBook(null)}
        book={viewingBook}
      />
    </div>
  );
}

export default ManageBooks;
