import React, { useState } from "react";
import { FaFilePdf, FaFileExcel, FaTimes, FaFileDownload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ToastNotification from "../components/ToastNotification";

function GeneratePenaltiesReportModal({ show, onClose, search, filter }) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const fetchAll = async () => {
    const API = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API}/api/penalties?page=1&limit=1000000`);
      if (!res.ok) return [];
      const payload = await res.json();
      const rows = (payload.data?.penalties || []).map((r) => ({ ...r }));

      if (search && search.trim()) {
        const q = search.toLowerCase();
        return rows.filter((r) => (
          (r.reference_number || "").toLowerCase().includes(q) ||
          (r.item_title || r.book_title || r.research_title || "").toLowerCase().includes(q) ||
          (r.user_name || "").toLowerCase().includes(q)
        ));
      }

      if (filter && filter !== 'all') {
        if (filter === 'overdue') return rows.filter(r => Number(r.days_overdue) > 0 && r.status !== 'Paid' && r.status !== 'Waived');
        if (filter === 'paid') return rows.filter(r => r.status === 'Paid');
        if (filter === 'waived') return rows.filter(r => r.status === 'Waived');
      }

      return rows;
    } catch (e) {
      console.error('Failed to fetch penalties for report:', e);
      return [];
    }
  };

  // Use ASCII 'PHP' prefix in exported docs to avoid glyph fallback issues
  const formatCurrencyForExport = (value) => {
    const num = Number(value) || 0;
    return `PHP ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
  };

  const generatePDFReport = async () => {
    try {
      setLoading(true);
      const penalties = await fetchAll();

      const doc = new jsPDF("landscape");
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("Penalties Report", 14, 20);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

      const tableStartY = 36;

      const tableData = penalties.map((p, i) => [
        i + 1,
        p.reference_number || p.penalty_id,
        (p.item_title || p.book_title || p.research_title || '').replace(/\s+/g, ' '),
        p.user_name || '',
        p.due_date || '',
        Math.max(0, Number(p.days_overdue) || 0),
        formatCurrencyForExport(p.fine || 0),
        p.status || '',
      ]);

      autoTable(doc, {
        head: [["#","Reference","Item","User","Due Date","Days Overdue","Fine","Status"]],
        body: tableData,
        startY: tableStartY,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [13,110,253], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245,245,245] },
        margin: { left: 14, right: 14 },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      doc.save(`Penalties_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      ToastNotification.success('PDF report generated successfully!');
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error('Error generating penalties PDF:', err);
      ToastNotification.error('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  const generateExcelReport = async () => {
    try {
      setLoading(true);
      const penalties = await fetchAll();

      const excelData = penalties.map((p, i) => ({
        '#': i + 1,
        'Reference': p.reference_number || p.penalty_id,
        'Item': p.item_title || p.book_title || p.research_title || '',
        'User': p.user_name || '',
        'Due Date': p.due_date || '',
        'Days Overdue': Math.max(0, Number(p.days_overdue) || 0),
        'Fine': formatCurrencyForExport(p.fine || 0),
        'Status': p.status || '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 40 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Penalties Report');

      const summaryData = [
        { 'Metric': 'Total Penalties', 'Value': penalties.length },
        { 'Metric': 'Generated', 'Value': new Date().toLocaleString() }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      XLSX.writeFile(wb, `Penalties_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      ToastNotification.success('Excel report generated successfully!');
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error('Error generating Excel report:', err);
      ToastNotification.error('Failed to generate Excel report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (exportFormat === 'pdf') generatePDFReport(); else generateExcelReport();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title"><FaFileDownload className="me-2" /> Generate Penalties Report</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label fw-bold">Export Format</label>
              <div className="d-flex gap-3">
                <div className="form-check flex-fill">
                  <input className="form-check-input" type="radio" name="exportFormatPen" id="formatPDFPen" value="pdf" checked={exportFormat === "pdf"} onChange={(e) => setExportFormat(e.target.value)} disabled={loading} />
                  <label className="form-check-label w-100" htmlFor="formatPDFPen">
                    <div className="border rounded p-3 text-center">
                      <FaFilePdf size={32} className="text-danger mb-2" />
                      <div className="fw-bold">PDF</div>
                      <small className="text-muted">Portable Document</small>
                    </div>
                  </label>
                </div>
                <div className="form-check flex-fill">
                  <input className="form-check-input" type="radio" name="exportFormatPen" id="formatExcelPen" value="excel" checked={exportFormat === "excel"} onChange={(e) => setExportFormat(e.target.value)} disabled={loading} />
                  <label className="form-check-label w-100" htmlFor="formatExcelPen">
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
                <strong>Preview:</strong> This report will include penalties matching current filters/search.
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

export default GeneratePenaltiesReportModal;
