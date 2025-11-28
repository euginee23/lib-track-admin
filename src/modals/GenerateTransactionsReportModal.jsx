import React, { useState } from "react";
import { FaFilePdf, FaFileExcel, FaTimes, FaFileDownload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ToastNotification from "../components/ToastNotification";
import { getAllTransactions } from "../../api/transactions/getTransactions";
import { getTransactionFine } from "../../api/transactions/getFineCalculations";
import { formatCurrencyPHP } from "../utils/format";

function GenerateTransactionsReportModal({ show, onClose, search, filterStatus, activeTab, totalCount }) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  

  const fetchAll = async () => {
    const params = {
      page: 1,
      limit: 1000000,
      transaction_type: filterStatus === "all" ? undefined : filterStatus,
    };

    const resp = await getAllTransactions(params);
    // api returns { success, data, pagination, count }
    const rows = (resp.data || []).map((r) => ({ ...r }));

    // Apply simple client-side search if provided
    if (search && search.trim()) {
      const q = search.toLowerCase();
      return rows.filter((r) => (
        (r.reference_number || "").toLowerCase().includes(q) ||
        (r.book_title || r.research_title || "").toLowerCase().includes(q) ||
        ((r.first_name || "") + " " + (r.last_name || "")).toLowerCase().includes(q)
      ));
    }

    return rows;
  };

  const generatePDFReport = async () => {
    try {
      setLoading(true);
      const transactions = await fetchAll();

      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Book Transactions Report", 14, 20);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
      if (filterStatus) doc.text(`Filter: ${filterStatus}`, 14, 32);

      // table start position (summary card removed)
      const tableStartY = 40;

      const formatDate = (val, defaultText = "") => {
        if (!val) return defaultText;
        try {
          const d = new Date(val);
          if (isNaN(d)) return String(val);
          return d.toLocaleString();
        } catch (e) {
          return String(val);
        }
      };

      const getDaysOverdue = (row) => {
        return Number(row.daysOverdue ?? row.days_overdue ?? row.days_overdue_count ?? 0) || 0;
      };

      const getFine = (row) => {
        return Number(row.fine ?? row.total_fine ?? row.fine_amount ?? 0) || 0;
      };
          const formatCurrencyForExport = (value) => {
            const num = Number(value) || 0;
            const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
            return `PHP ${formatted}`;
          };

      // enrich transactions with fine/days information by calling fine API per transaction when available
      await Promise.all(transactions.map(async (tx) => {
        try {
          const fineRes = await getTransactionFine(tx.transaction_id);
          if (fineRes) {
            tx.fine = Number(fineRes.fine || fineRes.total_fine || fineRes.amount || 0) || 0;
            tx.daysOverdue = Number(fineRes.daysOverdue || fineRes.days_overdue || fineRes.days || 0) || 0;
          }
        } catch (e) {
          // ignore per-transaction fine errors and keep original values
        }
        return tx;
      }));

      const tableData = transactions.map((t, index) => [
        index + 1,
        t.reference_number || t.transaction_id,
        `${t.first_name ? `${t.first_name} ${t.last_name || ''}` : (t.user_name || '')}`,
        (t.book_title || t.research_title || '').replace(/\s+/g, ' '),
        formatDate(t.transaction_date || t.transaction_datetime),
        formatDate(t.due_date),
        formatDate(t.return_date, 'Not returned'),
        getDaysOverdue(t),
        // Use safe export formatter for the PDF (avoid U+20B1 glyph rendering issues)
        formatCurrencyForExport(getFine(t)),
        t.transaction_type || ''
      ]);

      autoTable(doc, {
        head: [["#", "Ref", "User", "Item", "Transaction Date", "Due Date", "Return Date", "Days Overdue", "Fine", "Type"]],
        body: tableData,
        startY: tableStartY,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
      }

      doc.save(`Transactions_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      ToastNotification.success("PDF report generated successfully!");
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      ToastNotification.error("Failed to generate PDF report");
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = async () => {
    try {
      setLoading(true);
      const transactions = await fetchAll();

      const excelData = transactions.map((t, index) => ({
        "#": index + 1,
        "Reference": t.reference_number || t.transaction_id,
        "User": t.first_name ? `${t.first_name} ${t.last_name || ''}` : (t.user_name || ''),
        "Item": t.book_title || t.research_title || '',
        "Transaction Date": formatDate(t.transaction_date || t.transaction_datetime || ''),
        "Due Date": formatDate(t.due_date || ''),
        "Return Date": formatDate(t.return_date || ''),
        "Days Overdue": getDaysOverdue(t),
        // Use safe export formatter for Excel as well to keep files consistent
        "Fine": formatCurrencyForExport(getFine(t)),
        "Type": t.transaction_type || ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 22 }, { wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Transactions Report");

      const summaryData = [
        { "Metric": "Total Transactions", "Value": transactions.length },
        { "Metric": "Generated", "Value": new Date().toLocaleString() }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      XLSX.writeFile(wb, `Transactions_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      ToastNotification.success("Excel report generated successfully!");
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error("Error generating Excel:", error);
      ToastNotification.error("Failed to generate Excel report");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (exportFormat === "pdf") generatePDFReport(); else generateExcelReport();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title"><FaFileDownload className="me-2" /> Generate Transactions Report</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-bold">Export Format</label>
              <div className="d-flex gap-3">
                <div className="form-check flex-fill">
                  <input className="form-check-input" type="radio" name="exportFormat" id="formatPDF" value="pdf" checked={exportFormat === "pdf"} onChange={(e) => setExportFormat(e.target.value)} disabled={loading} />
                  <label className="form-check-label w-100" htmlFor="formatPDF">
                    <div className="border rounded p-3 text-center">
                      <FaFilePdf size={32} className="text-danger mb-2" />
                      <div className="fw-bold">PDF</div>
                      <small className="text-muted">Portable Document</small>
                    </div>
                  </label>
                </div>
                <div className="form-check flex-fill">
                  <input className="form-check-input" type="radio" name="exportFormat" id="formatExcel" value="excel" checked={exportFormat === "excel"} onChange={(e) => setExportFormat(e.target.value)} disabled={loading} />
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

            <div className="alert alert-info mb-0">
              <small>
                <strong>Preview:</strong> This report will include <strong>{totalCount || '0'}</strong> item(s){filterStatus ? <> with filter: <strong>{filterStatus}</strong></> : ''}.
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}><FaTimes className="me-1" /> Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? (<><ClipLoader size={16} color="#fff" loading={true} /><span className="ms-2">Generating...</span></>) : (<><FaFileDownload className="me-1" /> Generate Report</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateTransactionsReportModal;
