import React, { useState } from "react";
import { FaFilePdf, FaFileExcel, FaTimes, FaFileDownload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ToastNotification from "../components/ToastNotification";

function GenerateReportModal({ show, onClose, books, filterInfo }) {
  const [reportType, setReportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [includeImages, setIncludeImages] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const getFilteredBooks = () => {
    if (reportType === "all") return books;
    if (reportType === "book") return books.filter(b => b.type === "Book");
    if (reportType === "research") return books.filter(b => b.type === "Research Paper");
    return books;
  };

  const generatePDFReport = () => {
    try {
      setLoading(true);
      const doc = new jsPDF("landscape");
      const filteredBooks = getFilteredBooks();

      // HEADER
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Library Books Report", 14, 20);
      
      // SUBTITLE
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
      doc.text(`Total Items: ${filteredBooks.length}`, 14, 32);
      
      // FILTER INFO
      if (filterInfo) {
        doc.text(`Filter: ${filterInfo}`, 14, 37);
      }

      // PREPARE TABLE DATA
      const tableData = filteredBooks.map((book, index) => {
        if (book.type === "Book") {
          return [
            index + 1,
            book.type,
            book.book_title || "N/A",
            book.author || "N/A",
            book.genre || "N/A",
            book.publisher || "N/A",
            book.book_year || "N/A",
            book.quantity || 0,
            book.available_quantity || 0,
            book.shelf_number && book.shelf_column && book.shelf_row
              ? `(${book.shelf_number}) ${book.shelf_column}-${book.shelf_row}`
              : book.shelf_column && book.shelf_row
              ? `${book.shelf_column}-${book.shelf_row}`
              : "TBA"
          ];
        } else {
          return [
            index + 1,
            book.type,
            book.research_title || "N/A",
            Array.isArray(book.authors) ? book.authors.map(a => a.trim()).join(", ") : (book.authors || "N/A"),
            book.department_name || "N/A",
            "N/A",
            book.year_publication || "N/A",
            1,
            book.available_quantity || 0,
            book.shelf_number && book.shelf_column && book.shelf_row
              ? `(${book.shelf_number}) ${book.shelf_column}-${book.shelf_row}`
              : book.shelf_column && book.shelf_row
              ? `${book.shelf_column}-${book.shelf_row}`
              : "TBA"
          ];
        }
      });

      // TABLE
      autoTable(doc, {
        head: [["#", "Type", "Title", "Author(s)", "Category/Dept", "Publisher", "Year", "Total Qty", "Available", "Shelf"]],
        body: tableData,
        startY: filterInfo ? 42 : 37,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      // FOOTER
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // SAVE PDF
      doc.save(`Library_Books_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      ToastNotification.success("PDF report generated successfully!");
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      ToastNotification.error("Failed to generate PDF report");
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = () => {
    try {
      setLoading(true);
      const filteredBooks = getFilteredBooks();

      // PREPARE DATA FOR EXCEL
      const excelData = filteredBooks.map((book, index) => {
        if (book.type === "Book") {
          return {
            "#": index + 1,
            "Type": book.type,
            "Title": book.book_title || "N/A",
            "Author(s)": book.author || "N/A",
            "Category": book.genre || "N/A",
            "Publisher": book.publisher || "N/A",
            "Edition": book.book_edition || "N/A",
            "Year": book.book_year || "N/A",
            "Total Quantity": book.quantity || 0,
            "Available Quantity": book.available_quantity || 0,
            "Borrowed": (book.quantity || 0) - (book.available_quantity || 0),
            "Shelf Location": book.shelf_number && book.shelf_column && book.shelf_row
              ? `(${book.shelf_number}) ${book.shelf_column}-${book.shelf_row}`
              : book.shelf_column && book.shelf_row
              ? `${book.shelf_column}-${book.shelf_row}`
              : "TBA",
            "Price": book.book_price ? `₱${book.book_price}` : "N/A",
            "Donor": book.book_donor || "N/A"
          };
        } else {
          return {
            "#": index + 1,
            "Type": book.type,
            "Title": book.research_title || "N/A",
            "Author(s)": Array.isArray(book.authors) ? book.authors.map(a => a.trim()).join(", ") : (book.authors || "N/A"),
            "Department": book.department_name || "N/A",
            "Publisher": "N/A",
            "Edition": "N/A",
            "Year": book.year_publication || "N/A",
            "Total Quantity": 1,
            "Available Quantity": book.available_quantity || 0,
            "Borrowed": book.available_quantity === 1 ? 0 : 1,
            "Shelf Location": book.shelf_number && book.shelf_column && book.shelf_row
              ? `(${book.shelf_number}) ${book.shelf_column}-${book.shelf_row}`
              : book.shelf_column && book.shelf_row
              ? `${book.shelf_column}-${book.shelf_row}`
              : "TBA",
            "Price": "N/A",
            "Donor": "N/A"
          };
        }
      });

      // CREATE WORKBOOK
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // SET COLUMN WIDTHS
      ws["!cols"] = [
        { wch: 5 },  // #
        { wch: 15 }, // Type
        { wch: 40 }, // Title
        { wch: 30 }, // Author(s)
        { wch: 20 }, // Category/Department
        { wch: 25 }, // Publisher(s)
        { wch: 10 }, // Edition
        { wch: 8 },  // Year
        { wch: 12 }, // Total Quantity
        { wch: 15 }, // Available Quantity
        { wch: 10 }, // Borrowed
        { wch: 20 }, // Shelf Location
        { wch: 12 }, // Price
        { wch: 20 }  // Donor
      ];

      // ADD WORKSHEET TO WORKBOOK
      XLSX.utils.book_append_sheet(wb, ws, "Books Report");

      // GENERATE SUMMARY SHEET
      const summaryData = [
        { "Metric": "Total Items", "Value": filteredBooks.length },
        { "Metric": "Total Books", "Value": filteredBooks.filter(b => b.type === "Book").length },
        { "Metric": "Total Research Papers", "Value": filteredBooks.filter(b => b.type === "Research Paper").length },
        { "Metric": "Report Generated", "Value": new Date().toLocaleString() }
      ];

      if (filterInfo) {
        summaryData.push({ "Metric": "Filter Applied", "Value": filterInfo });
      }

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // SAVE EXCEL FILE
      XLSX.writeFile(wb, `Library_Books_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      ToastNotification.success("Excel report generated successfully!");
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error generating Excel:", error);
      ToastNotification.error("Failed to generate Excel report");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (exportFormat === "pdf") {
      generatePDFReport();
    } else {
      generateExcelReport();
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FaFileDownload className="me-2" />
              Generate Report
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {/* REPORT TYPE SELECTION */}
            <div className="mb-3">
              <label className="form-label fw-bold">Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Items ({books.length})</option>
                <option value="book">Books Only ({books.filter(b => b.type === "Book").length})</option>
                <option value="research">Research Papers Only ({books.filter(b => b.type === "Research Paper").length})</option>
              </select>
            </div>

            {/* EXPORT FORMAT SELECTION */}
            <div className="mb-3">
              <label className="form-label fw-bold">Export Format</label>
              <div className="d-flex gap-3">
                <div className="form-check flex-fill">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="formatPDF"
                    value="pdf"
                    checked={exportFormat === "pdf"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={loading}
                  />
                  <label className="form-check-label w-100" htmlFor="formatPDF">
                    <div className="border rounded p-3 text-center">
                      <FaFilePdf size={32} className="text-danger mb-2" />
                      <div className="fw-bold">PDF</div>
                      <small className="text-muted">Portable Document</small>
                    </div>
                  </label>
                </div>
                <div className="form-check flex-fill">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="formatExcel"
                    value="excel"
                    checked={exportFormat === "excel"}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={loading}
                  />
                  <label className="form-check-label w-100" htmlFor="formatExcel">
                    <div className="border rounded p-3 text-center">
                      <FaFileExcel size={32} className="text-success mb-2" />
                      <div className="fw-bold">Excel</div>
                      <small className="text-muted">Spreadsheet</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="alert alert-info mb-0">
              <small>
                <strong>Preview:</strong> This report will include{" "}
                <strong>{getFilteredBooks().length}</strong> item(s)
                {filterInfo && <> with filter: <strong>{filterInfo}</strong></>}.
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes className="me-1" />
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ClipLoader size={16} color="#fff" loading={true} />
                  <span className="ms-2">Generating...</span>
                </>
              ) : (
                <>
                  <FaFileDownload className="me-1" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateReportModal;
