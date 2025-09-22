import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFileAlt } from "react-icons/fa";
import AddBookModal from "../modals/AddBook_Modal";
import AddResearchModal from "../modals/AddResearch_Modal";
import EditBookModal from "../modals/EditBook_Modal";
import ViewBookModal from "../modals/ViewBook_Modal";
import TypeSelectionModal from "../modals/TypeSelection_Modal";
import FilterByTypeModal from "../modals/filter_modals/FilterByType";
import FilterByShelfLocationModal from "../modals/filter_modals/FilterByShelfLocation";
import FilterByAuthorModal from "../modals/filter_modals/FilterByAuthorModal";
import FilterByCategoryModal from "../modals/filter_modals/FilterByCategoryModal";
import FilterByYearModal from "../modals/filter_modals/FilterByYearModal";
import ViewResearchModal from "../modals/ViewResearch_Modal";
import PrintQRModal from "../modals/PrintQR_Modal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { fetchBooksAndResearch } from "../../api/manage_books/get_booksAndResearch";
import { addResearch } from "../../api/manage_books/add_research";
import { deleteBooks } from "../../api/manage_books/delete_books";
import { deleteResearch } from "../../api/manage_books/delete_research";
import { deleteBooksAndResearch } from "../../api/manage_books/delete_BooksAndResearch";
import ToastNotification from "../components/ToastNotification";

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showViewBookModal, setShowViewBookModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showPrintQRModal, setShowPrintQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterTypeModal, setShowFilterTypeModal] = useState(false);
  const [showFilterShelfModal, setShowFilterShelfModal] = useState(false);
  const [showFilterAuthorModal, setShowFilterAuthorModal] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterShelf, setFilterShelf] = useState(null);
  const [filterAuthor, setFilterAuthor] = useState("");
  const [showFilterCategoryModal, setShowFilterCategoryModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilterYearModal, setShowFilterYearModal] = useState(false);
  const [filterYearRange, setFilterYearRange] = useState(null);
  const [itemsToDelete, setItemsToDelete] = useState([]);
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
  const [selectedUserIdsForQR, setSelectedUserIdsForQR] = useState([]);

  const [filter, setFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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

  const refetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchBooksAndResearch();
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA - dateB;
      });
      setBooks(sortedData);
    } catch (error) {
      console.error("Error refetching books and research:", error);
    } finally {
      setLoading(false);
    }
  };

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
    refetchData();
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
      refetchData();
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
    setItemsToDelete(ids);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      // Separate books and research papers from selected items
      const booksToDelete = [];
      const researchToDelete = [];
      itemsToDelete.forEach(id => {
        const item = books.find(book => {
          if (book.type === "Book") {
            return book.batch_registration_key === id;
          } else {
            return book.research_paper_id === id;
          }
        });
        if (item) {
          if (item.type === "Book") {
            booksToDelete.push(item.batch_registration_key);
          } else {
            researchToDelete.push(item.research_paper_id);
          }
        }
      });
      // Delete books and research papers
      const deletePromises = [];
      booksToDelete.forEach(batchKey => {
        deletePromises.push(deleteBooks(batchKey));
      });
      researchToDelete.forEach(researchId => {
        deletePromises.push(deleteResearch(researchId));
      });
      await Promise.all(deletePromises);
      // Refresh the data after successful deletion
      await refetchData();
      setSelectedBooks([]);
      setShowDeleteModal(false);
      setItemsToDelete([]);
      ToastNotification.success("Successfully deleted item(s).");
    } catch (error) {
      console.error('Error deleting items:', error);
      ToastNotification.error('Failed to delete items. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Filter books and research papers based on search input and type
  let filteredBooks = books.filter((item) => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return true;
    // Search in title, author(s), genre/department, shelf, year
    const title = item.book_title || item.research_title || item.title || "";
    const authors = Array.isArray(item.authors)
      ? item.authors.join(", ")
      : item.authors || item.author || "";
    const genreOrDept = item.genre || item.department_name || item.department || "";
    const shelf = item.shelf_number && item.shelf_column && item.shelf_row
      ? `(${item.shelf_number}) ${item.shelf_column}-${item.shelf_row}`
      : item.shelf_column && item.shelf_row
      ? `${item.shelf_column}-${item.shelf_row}`
      : "";
    const year = item.book_year || item.year_publication || item.year || "";
    return (
      title.toLowerCase().includes(searchTerm) ||
      authors.toLowerCase().includes(searchTerm) ||
      genreOrDept.toLowerCase().includes(searchTerm) ||
      shelf.toLowerCase().includes(searchTerm) ||
      year.toString().toLowerCase().includes(searchTerm)
    );
  });

  if (filter === "type" && filterType) {
    filteredBooks = filteredBooks.filter((item) => item.type === filterType);
  }
  if (filter === "donated" && filterShelf) {
    filteredBooks = filteredBooks.filter((item) => {
      return (
        item.shelf_number === filterShelf.shelf_number ||
        item.shelf_id === filterShelf.shelf_id
      );
    });
  }
  if (filter === "paper" && filterAuthor && Array.isArray(filterAuthor) && filterAuthor.length > 0) {
    filteredBooks = filteredBooks.filter((item) => {
      // For books and research papers, check if any selected author matches
      const selectedAuthors = filterAuthor.map((a) => a.trim());
      let itemAuthors = [];
      if (item.type === "Research Paper") {
        if (Array.isArray(item.authors)) {
          itemAuthors = item.authors.map((a) => a.trim());
        } else if (item.authors) {
          itemAuthors = [item.authors.trim()];
        } else if (item.author) {
          itemAuthors = [item.author.trim()];
        }
      } else {
        if (Array.isArray(item.authors)) {
          itemAuthors = item.authors.map((a) => a.trim());
        } else if (item.authors) {
          itemAuthors = [item.authors.trim()];
        } else if (item.author) {
          itemAuthors = [item.author.trim()];
        }
      }
      // Check if any selected author is in itemAuthors
      return selectedAuthors.some((selected) => itemAuthors.includes(selected));
    });
  }

  if (filter === "category" && filterCategory && Array.isArray(filterCategory) && filterCategory.length > 0) {
    filteredBooks = filteredBooks.filter((item) => {
      const selectedCategories = filterCategory.map((c) => c.trim());
      let itemCategory = "";
      if (item.type === "Research Paper") {
        itemCategory = item.department ? item.department.trim() : item.department_name ? item.department_name.trim() : "";
      } else {
        itemCategory = item.genre ? item.genre.trim() : "";
      }
      return selectedCategories.includes(itemCategory);
    });
  }

  if (filter === "year" && filterYearRange && filterYearRange.start && filterYearRange.end) {
    filteredBooks = filteredBooks.filter((item) => {
      let itemYear = null;
      if (item.type === "Book") {
        itemYear = item.book_year || item.year || item.year_publication;
      } else {
        itemYear = item.year_publication || item.year || item.book_year;
      }
      itemYear = Number(itemYear);
      return (
        itemYear >= Number(filterYearRange.start) &&
        itemYear <= Number(filterYearRange.end)
      );
    });
  }

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredBooks.length / rowsPerPage);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterShelf, search, rowsPerPage]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  };

  // Update the "Print QR" button functionality for single research paper selection
  const handlePrintQR = (selectedItems) => {
    const userIds = selectedItems.map(
      (item) => item.research_paper_id || item.id
    );
    setSelectedUserIdsForQR(userIds);
    setShowPrintQRModal(true);
  };

  const isFiltered = (
    (filter === "type" && !!filterType) ||
    (filter === "donated" && !!filterShelf) ||
    (filter === "paper" && !!filterAuthor) ||
    (filter === "category" && !!filterCategory && Array.isArray(filterCategory) && filterCategory.length > 0) ||
    (filter === "year" && filterYearRange && filterYearRange.start && filterYearRange.end)
  );

  return (
    <div className="container-fluid d-flex flex-column py-3">
      {/* Search + Add Button */}
      <div className="card mb-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Search input with icon */}
          <div className="input-group" style={{ width: "500px" }}>
            <span className="input-group-text p-1 bg-white">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="vr mx-2" style={{ height: "30px", width: "1px", backgroundColor: "#ccc" }}></div>
          <button
            className="btn btn-sm btn-primary"
            style={{ backgroundColor: "#17a2b8", borderColor: "#17a2b8" }}
            onClick={() => alert("Generate report function hasn't been implemented")}
          >
            <FaFileAlt className="me-1" /> Generate Report
          </button>

          {/* Right side: rows per page + filter + add */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <label className="form-label small mb-0">Rows:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <label className="form-label small mb-0">Filter by:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "150px" }}
              value={filter}
              onChange={(e) => {
                if (!isFiltered) {
                  setFilter(e.target.value);
                  if (e.target.value === "type") {
                    setShowFilterTypeModal(true);
                  } else if (e.target.value === "donated") {
                    setShowFilterShelfModal(true);
                  } else if (e.target.value === "paper") {
                    setShowFilterAuthorModal(true);
                  } else if (e.target.value === "category") {
                    setShowFilterCategoryModal(true);
                  } else if (e.target.value === "year") {
                    setShowFilterYearModal(true);
                  }
                }
              }}
              disabled={isFiltered}
            >
              <option value="">All</option>
              <option value="type">Type</option>
              <option value="paper">Author</option>
              <option value="category">Category / Department</option>
              <option value="donated">Shelf</option>
              <option value="year">Year</option>
            </select>
            {isFiltered && (
              <button
                className="btn btn-sm btn-warning"
                onClick={() => {
                  setFilter("");
                  setFilterType("");
                  setFilterShelf(null);
                  setFilterAuthor([]);
                  setShowFilterAuthorModal(false);
                  setFilterCategory([]);
                  setShowFilterCategoryModal(false);
                  setFilterYearRange(null);
                  setShowFilterYearModal(false);
                }}
              >
                Undo Filter
              </button>
            )}
      {/* FILTER BY YEAR MODAL */}
      <FilterByYearModal
        show={showFilterYearModal}
        onClose={() => {
          setShowFilterYearModal(false);
          if (!filterYearRange || !filterYearRange.start || !filterYearRange.end) {
            setFilter("");
            setFilterYearRange(null);
          }
        }}
        onSelectYear={(range) => {
          if (range && range.start && range.end && Number(range.start) <= Number(range.end)) {
            setFilterYearRange(range);
            setShowFilterYearModal(false);
            setFilter("year");
          } else {
            setShowFilterYearModal(false);
            setFilter("");
            setFilterYearRange(null);
          }
        }}
        selectedYearRange={filterYearRange}
      />
      {/* FILTER BY CATEGORY MODAL */}
      <FilterByCategoryModal
        show={showFilterCategoryModal}
        onClose={() => {
          setShowFilterCategoryModal(false);
          if (!filterCategory || (Array.isArray(filterCategory) && filterCategory.length === 0)) {
            setFilter("");
            setFilterCategory([]);
          }
        }}
        onSelectCategory={(cat) => {
          if (cat && Array.isArray(cat) && cat.length > 0) {
            setFilterCategory(cat);
            setShowFilterCategoryModal(false);
            setFilter("category");
          } else {
            setShowFilterCategoryModal(false);
            setFilter("");
            setFilterCategory([]);
          }
        }}
        selectedCategory={filterCategory}
        books={books}
      />
      {/* FILTER BY AUTHOR MODAL */}
      <FilterByAuthorModal
        show={showFilterAuthorModal}
        onClose={() => {
          setShowFilterAuthorModal(false);
          // If no authors selected, do not set filter
          if (!filterAuthor || (Array.isArray(filterAuthor) && filterAuthor.length === 0)) {
            setFilter("");
            setFilterAuthor([]);
          }
        }}
        onSelectAuthor={(author) => {
          if (author && Array.isArray(author) && author.length > 0) {
            setFilterAuthor(author);
            setShowFilterAuthorModal(false);
            setFilter("paper");
          } else {
            setShowFilterAuthorModal(false);
            setFilter("");
            setFilterAuthor([]);
          }
        }}
        selectedAuthor={filterAuthor}
        books={books}
      />
            <button
              className="btn btn-sm btn-success"
              onClick={() => setShowTypeModal(true)}
              disabled={isFiltered}
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
                        {b.shelf_number && b.shelf_column && b.shelf_row
                          ? `(${b.shelf_number}) ${b.shelf_column}-${b.shelf_row}`
                          : b.shelf_column && b.shelf_row
                          ? `${b.shelf_column}-${b.shelf_row}`
                          : "TBA"}
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

          <div className="d-flex gap-2">
            {/* View button - only show for single selection */}
            {selectedBooks.length === 1 && (
              <button
                className="btn btn-sm btn-primary"
                style={{ width: "100px" }}
                onClick={() => handleView(books.find((b, index) => {
                  const itemKey = b.type === "Book" 
                    ? (b.batch_registration_key || `book-${index}-${b.book_title}`) 
                    : (b.research_paper_id || `research-${index}-${b.research_title}`);
                  return itemKey === selectedBooks[0];
                }))}
              >
                <FaEye size={12} /> View
              </button>
            )}
            
            {/* Delete button - show for single or multiple selection */}
            {selectedBooks.length > 0 && (
              <button
                className="btn btn-sm btn-danger"
                style={{ width: "100px" }}
                onClick={() => handleDelete(selectedBooks)}
              >
                <FaTrash size={12} /> Delete
              </button>
            )}
            
            {/* Print QR button - only show for research papers */}
            {(() => {
              const selectedItems = selectedBooks.map(selectedKey => 
                books.find((b, index) => {
                  const itemKey = b.type === "Book" 
                    ? (b.batch_registration_key || `book-${index}-${b.book_title}`) 
                    : (b.research_paper_id || `research-${index}-${b.research_title}`);
                  return itemKey === selectedKey;
                })
              ).filter(Boolean);
              
              const allResearchPapers = selectedItems.length > 0 && selectedItems.every(item => item.type === "Research Paper");
              
              return allResearchPapers ? (
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ width: "100px" }}
                  onClick={() => {
                    handlePrintQR(selectedItems);
                  }}
                >
                  Print QR
                </button>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* TYPE SELECTION MODAL */}
      <TypeSelectionModal
        show={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectType={handleTypeSelection}
      />

      {/* FILTER BY TYPE MODAL */}
      <FilterByTypeModal
        show={showFilterTypeModal}
        onClose={() => {
          setShowFilterTypeModal(false);
          // If no type selected, reset filter and type state
          if (!filterType) {
            setFilter("");
            setFilterType("");
          }
        }}
        onSelectType={(type) => {
          if (type) {
            setFilterType(type);
            setShowFilterTypeModal(false);
            setFilter("type");
          } else {
            setShowFilterTypeModal(false);
            setFilter("");
            setFilterType("");
          }
        }}
        selectedType={filterType}
      />

      {/* FILTER BY SHELF LOCATION MODAL */}
      <FilterByShelfLocationModal
        show={showFilterShelfModal}
        onClose={() => {
          setShowFilterShelfModal(false);
          if (!filterShelf || !filterShelf.shelf_number) {
            setFilter("");
            setFilterShelf(null);
          }
        }}
        onSelectShelf={(shelf) => {
          if (shelf && shelf.shelf_number) {
            setFilterShelf(shelf);
            setShowFilterShelfModal(false);
            setFilter("donated");
          } else {
            setShowFilterShelfModal(false);
            setFilter("");
            setFilterShelf(null);
          }
        }}
        selectedShelfId={filterShelf?.shelf_number || null}
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

      {/* PRINT QR MODAL */}
      <PrintQRModal
        show={showPrintQRModal}
        onClose={() => setShowPrintQRModal(false)}
        selectedResearchIds={selectedUserIdsForQR}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemsToDelete([]);
        }}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete ${itemsToDelete.length} item(s)? This action cannot be undone.`}
      />
    </div>
  );
}

export default ManageBooks;
