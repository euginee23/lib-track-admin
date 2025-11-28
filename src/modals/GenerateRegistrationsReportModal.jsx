import React, { useState } from "react";
import { FaFilePdf, FaFileExcel, FaTimes, FaFileDownload } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import ToastNotification from "../components/ToastNotification";
import { getRegistrations } from "../../api/manage_registrations/get_registrations";

function GenerateRegistrationsReportModal({ show, onClose, filterInfo, search, filter, filterStatus, totalCount }) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const fetchAll = async () => {
    // Fetch all matching registrations using a very large limit
    const { users } = await getRegistrations(1, 1000000, search, filter, filterStatus);
    return users || [];
  };

  const generatePDFReport = async () => {
    try {
      setLoading(true);
      const registrations = await fetchAll();

      const doc = new jsPDF("landscape");

      // HEADER
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("Library Registrations Report", 14, 20);

      // SUBTITLE
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

      if (filterInfo) {
        doc.text(`Filter: ${filterInfo}`, 14, 32);
      }

      // SUMMARY CARD (similar to screenshot)
      const total = registrations.length;
      const verified = registrations.filter(r => r.semester_verified === 1).length;
      const unverified = total - verified;
      const percent = total === 0 ? 0 : Math.round((verified / total) * 100);

      const cardX = 14;
      const cardY = 40;
      const cardW = doc.internal.pageSize.getWidth() - 28; // full width minus margins
      const cardH = 36;

      // Card background
      doc.setFillColor(245, 255, 250);
      doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, 'F');
      doc.setDrawColor(200, 230, 200);
      doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, 'S');

      // Card content: left = Total, center = Verified, right = Unverified
      const padding = 12;
      const labelY = cardY + 12;
      const leftX = cardX + padding;
      const centerX = cardX + cardW / 2;
      const rightX = cardX + cardW - padding;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Users: ${total}`, leftX, labelY);

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      // Verified in center
      doc.text(`Verified: ${verified}`, centerX, labelY, { align: 'center' });
      // Percentage on right (green)
      doc.setTextColor(40, 167, 69);
      doc.text(`${percent}% verified`, rightX, labelY, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      // Progress bar (full width with side padding)
      const barX = cardX + padding;
      const barY = cardY + 22;
      const barW = cardW - padding * 2;
      const barH = 10;
      // background
      doc.setFillColor(238, 238, 238);
      doc.rect(barX, barY, barW, barH, 'F');
      // filled (green)
      const filledW = Math.max(0, Math.min(barW, (percent / 100) * barW));
      doc.setFillColor(40, 167, 69);
      doc.rect(barX, barY, filledW, barH, 'F');

      const tableStartY = cardY + cardH + 10;

      const tableData = registrations.map((r, index) => [
        index + 1,
        r.user_id,
        `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}`,
        r.email || "",
        r.department_name || "",
        r.position || "",
        r.librarian_approval === 1 ? 'Approved' : 'Pending',
        r.semester_verified === 1 ? 'Verified' : 'Not Verified',
        r.semester_verified_at ? new Date(r.semester_verified_at).toLocaleString() : '',
        r.created_at ? new Date(r.created_at).toLocaleString() : ''
      ]);

      autoTable(doc, {
        head: [["#", "User ID", "Name", "Email", "Department", "Position", "Librarian Approval", "Semester Verified", "Verified At", "Registered At"]],
        body: tableData,
        startY: tableStartY,
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

      doc.save(`Registrations_Report_${new Date().toISOString().split("T")[0]}.pdf`);
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
      const registrations = await fetchAll();

      const excelData = registrations.map((r, index) => ({
        "#": index + 1,
        "User ID": r.user_id,
        "First Name": r.first_name,
        "Middle Name": r.middle_name || '',
        "Last Name": r.last_name,
        "Email": r.email || '',
        "Student ID": r.student_id || '',
        "Faculty ID": r.faculty_id || '',
        "Department": r.department_name || '',
        "Position": r.position || '',
        "Librarian Approval": r.librarian_approval === 1 ? 'Approved' : 'Pending',
        "Semester Verified": r.semester_verified === 1 ? 'Verified' : 'Not Verified',
        "Semester Verified At": r.semester_verified_at ? new Date(r.semester_verified_at).toLocaleString() : '',
        "Registered At": r.created_at ? new Date(r.created_at).toLocaleString() : ''
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Optionally set column widths
      ws["!cols"] = [
        { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Registrations Report");

      const summaryData = [
        { "Metric": "Total Items", "Value": registrations.length },
        { "Metric": "Report Generated", "Value": new Date().toLocaleString() }
      ];
      if (filterInfo) summaryData.push({ "Metric": "Filter Applied", "Value": filterInfo });

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary["!cols"] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      XLSX.writeFile(wb, `Registrations_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
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
    if (exportFormat === "pdf") {
      generatePDFReport();
    } else {
      generateExcelReport();
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FaFileDownload className="me-2" />
              Generate Registrations Report
            </h5>
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
                <strong>Preview:</strong> This report will include <strong>{totalCount || '0'}</strong> item(s){filterInfo && <> with filter: <strong>{filterInfo}</strong></>}.
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

export default GenerateRegistrationsReportModal;
