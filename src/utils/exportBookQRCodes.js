/**
 * Utility function to export QR codes for selected book copies as PDF
 * @param {Object} book - The book object containing title and other details
 * @param {Array} selectedCopiesData - Array of copy objects with number and qr properties
 * @returns {Promise} - Promise that resolves when export is complete
 */
export const exportBookQRCodes = async (book, selectedCopiesData) => {
  try {
    // Create HTML content for PDF
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${book?.book_title || 'Book Title'}</title>
        <style>
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 250px);
            gap: 10px;
            justify-content: start;
          }
          .qr-item {
            width: 250px;
            height: auto;
            border: 2px solid #333;
            padding: 8px;
            text-align: center;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            box-sizing: border-box;
          }
          .qr-image {
            margin: 4px 0;
          }
          .qr-title {
            margin: 0 0 4px 0;
            padding: 0;
          }
          .qr-subtitle {
            margin: 0 0 8px 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="qr-grid">
    `;

    selectedCopiesData.forEach(copy => {
      printContent += `
        <div class="qr-item">
          <h6 class="qr-title" style="font-size: 0.9rem; font-weight: bold;">
            ${book?.book_title || 'Book Title'}
          </h6>
          <p class="qr-subtitle" style="font-size: 0.8rem; color: #6c757d;">
            Book Number: #${copy.number}
          </p>
          <div class="qr-image">
            <img src="${copy.qr}" alt="QR Code" style="width: 150px; height: 150px; border: 2px solid #333; border-radius: 8px; display: block;" />
          </div>
        </div>
      `;
    });

    printContent += `
        </div>
      </body>
      </html>
    `;

    // Create a hidden iframe for PDF generation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '8.5in';
    iframe.style.height = '11in';
    document.body.appendChild(iframe);

    // Write content to iframe
    iframe.contentDocument.open();
    iframe.contentDocument.write(printContent);
    iframe.contentDocument.close();

    // Wait for images to load
    const images = iframe.contentDocument.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    });

    await Promise.all(imagePromises);

    // Generate filename
    const sanitizedTitle = (book?.book_title || 'Book Title').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedTitle}_QRCodes.pdf`;

    // Use the browser's print API to save as PDF
    const printWindow = iframe.contentWindow;
    printWindow.focus();
    
    // Override the print function to trigger save as PDF
    const originalPrint = printWindow.print;
    printWindow.print = function() {
      // Create a download link
      const downloadContent = iframe.contentDocument.documentElement.outerHTML;
      const blob = new Blob([downloadContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link for download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename.replace('.pdf', '.html');
      document.body.appendChild(a);
      
      // Show print dialog with PDF as default
      originalPrint.call(this);
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
      }, 1000);
    };

    // Trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error generating PDF. Please try again.');
  }
};

/**
 * Alternative function using jsPDF library (if you want to add jsPDF later)
 * This is a placeholder for future enhancement
 */
export const exportBookQRCodesWithJsPDF = async (book, selectedCopiesData) => {
  // Future implementation with jsPDF library
  // Would require installing jsPDF: npm install jspdf
  throw new Error('jsPDF implementation not yet available. Use exportBookQRCodes instead.');
};
