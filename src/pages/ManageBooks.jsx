import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import AddBookModal from "../modals/AddBook_Modal";
import AddResearchModal from "../modals/AddResearch_Modal";
import EditBookModal from "../modals/EditBook_Modal";
import ViewBookModal from "../modals/ViewBook_Modal";
import TypeSelectionModal from "../modals/TypeSelection_Modal";
import ViewResearchModal from "../modals/ViewResearch_Modal";
import { fetchBooksAndResearch } from "../../api/manage_books/get_booksAndResearch";
import { addResearch } from "../../api/manage_books/add_research";

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showViewBookModal, setShowViewBookModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [viewingResearch, setViewingResearch] = useState(null);
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
    shelfRow: "",
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchBooksAndResearch();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books and research:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    setShowTypeModal(false);
    if (type === "Book") {
      setShowAddBookModal(true);
    } else if (type === "Research Paper") {
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
    setShowAddBookModal(false);
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

  const handleAddResearch = async () => {
    try {
      const researchData = {
        ...newResearch,
        authors: Array.isArray(newResearch.authors)
          ? newResearch.authors
          : newResearch.author
          ? newResearch.author.split(", ")
          : [],
        shelfColumn: newResearch.shelfColumn || newResearch.shelf || "A",
        shelfRow: newResearch.shelfRow || "1",
      };

      await addResearch(researchData);

      setBooks((prevBooks) => [
        ...prevBooks,
        {
          ...researchData,
          id: prevBooks.length + 1,
          genre: researchData.department,
          price: 0,
          quantity: 1,
          publisher: "",
          edition: "",
          donor: "",
        },
      ]);

      setShowResearchModal(false);
      setNewResearch({
        type: "Research Paper",
        title: "",
        author: "",
        authors: [],
        department: "",
        year: "",
        shelf: "",
        shelfColumn: "",
        shelfRow: "",
        abstract: "",
      });
    } catch (error) {
      console.error("Failed to add research paper:", error);
      alert(
        "An error occurred while adding the research paper. Please try again."
      );
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setNewBook(book);
  };

  const handleDelete = (ids) => {
    setBooks(books.filter((b) => !ids.includes(b.id)));
    setSelectedBooks([]);
  };

  const handleView = (item) => {
    if (item.type === "Book") {
      setViewingBook(item);
      setShowViewBookModal(true);
    } else {
      setViewingResearch(item);
      setShowResearchModal(false);
    }
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
          <table className="table table-sm table-striped align-middle mb-0">
            <thead className="small">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedBooks(
                        e.target.checked
                          ? paginatedBooks.map((b, index) =>
                              b.type === "Book" 
                                ? (b.batch_registration_key || `book-${index}-${b.book_title}`) 
                                : (b.research_paper_id || `research-${index}-${b.research_title}`)
                            )
                          : []
                      )
                    }
                    checked={
                      paginatedBooks.length > 0 &&
                      selectedBooks.length === paginatedBooks.length
                    }
                  />
                </th>
                <th>Type</th>
                <th>Title</th>
                <th>Author(s)</th>
                <th>Genre / Department</th>
                <th>Qty</th>
                <th>Shelf</th>
                <th>Year</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBooks.length === 0 && books.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    No books found.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((b, index) => {
                  const key = b.type === "Book" 
                    ? (b.batch_registration_key || `book-${index}-${b.book_title}`) 
                    : (b.research_paper_id || `research-${index}-${b.research_title}`);
                  return (
                    <tr
                      key={key}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        handleSelectBook(key);
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          onChange={(e) => e.stopPropagation()}
                          checked={selectedBooks.includes(key)}
                        />
                      </td>
                      <td>{b.type}</td>
                      <td>{b.type === "Book" ? b.book_title : b.research_title}</td>
                      <td>
                        {b.type === "Book"
                          ? b.author
                          : Array.isArray(b.authors)
                          ? b.authors.map((author) => author.trim()).join(", ")
                          : b.authors}
                      </td>
                      <td>{b.type === "Book" ? b.genre : b.department_name}</td>
                      <td>{b.type === "Book" ? b.quantity : 1}</td>
                      <td>
                        {b.shelf_column && b.shelf_row
                          ? `${b.shelf_column}-${b.shelf_row}`
                          : ""}
                      </td>
                      <td>
                        {b.type === "Book" ? b.book_year : b.year_publication}
                      </td>
                      <td>
                        {b.type === "Book"
                          ? formatPrice(b.book_price)
                          : formatPrice(0)}
                      </td>
                    </tr>
                  );
                })
              )}
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
                <div style={{ width: "100px", marginRight: "10px" }}>
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => handleView(books.find((b, index) => {
                      const itemKey = b.type === "Book" 
                        ? (b.batch_registration_key || `book-${index}-${b.book_title}`) 
                        : (b.research_paper_id || `research-${index}-${b.research_title}`);
                      return itemKey === selectedBooks[0];
                    }))}
                  >
                    <FaEye size={12} /> View
                  </button>
                </div>
                <div style={{ width: "100px" }}>
                  <button
                    className="btn btn-sm btn-danger w-100"
                    onClick={() => handleDelete(selectedBooks)}
                  >
                    <FaTrash size={12} /> Delete
                  </button>
                </div>
              </>
            ) : selectedBooks.length > 1 ? (
              <div style={{ width: "100px" }}>
                <button
                  className="btn btn-sm btn-danger w-100"
                  onClick={() => handleDelete(selectedBooks)}
                >
                  <FaTrash size={12} /> Delete
                </button>
              </div>
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
        show={showAddBookModal}
        onClose={() => {
          setShowAddBookModal(false);
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
            shelfRow: "",
            price: "",
            donor: "",
            cover: null,
          });
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
        show={showViewBookModal}
        onClose={() => {
          setShowViewBookModal(false);
          setViewingBook(null);
        }}
        book={viewingBook}
        batchRegistrationKey={viewingBook?.batch_registration_key}
      />

      {/* VIEW RESEARCH MODAL */}
      <ViewResearchModal
        show={!!viewingResearch}
        onClose={() => setViewingResearch(null)}
        research={viewingResearch}
      />
    </div>
  );
}

export default ManageBooks;
