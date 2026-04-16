import { jsPDF } from "jspdf";

export const generatePaymentsPDF = async (studentProfile, payments, balance) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 15;

  const solidLine = (x1, y1, x2, y2, color = [200, 200, 200], width = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };

  const checkNewPage = (neededSpace = 12) => {
    if (y + neededSpace > pageH - 20) {
      doc.addPage();
      y = 15;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER - INVOICE STYLE
  // ══════════════════════════════════════════════════════════════════════════
  
  // Load Logo safely
  const img = new Image();
  img.src = "/images/schoolLogo.jpeg";
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve; 
  });

  if (img.complete && img.naturalWidth > 0) {
    doc.addImage(img, "JPEG", margin, y, 22, 22);
  } else {
    doc.setDrawColor(20, 40, 80);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 22, 22);
    doc.setFontSize(6);
    doc.setTextColor(20, 40, 80);
    doc.text("LOGO", margin + 6, y + 12);
  }

  // School identity (Left side next to logo)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // very dark slate
  doc.text("GEOZIIE INTERNATIONAL SCHOOL", margin + 28, y + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate
  doc.text("Every Brain Counts | Finance Department", margin + 28, y + 11);
  doc.text("Phone: 055-756-4700 | Email: finance@geoziie.edu", margin + 28, y + 16);

  // Invoice identifiers (Right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129); // Premium emerald green
  doc.text("FEE BREAKDOWN", pageW - margin, y + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Document Ref: INV-${Math.floor(100000 + Math.random() * 900000)}`, pageW - margin, y + 14, { align: "right" });
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, pageW - margin, y + 19, { align: "right" });
  
  y += 35;
  solidLine(margin, y, margin + contentW, y, [226, 232, 240], 0.5);
  y += 10;

  // ══════════════════════════════════════════════════════════════════════════
  // BILL TO
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("BILL TO:", margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const studentName = studentProfile?.name || `${studentProfile?.firstName || ""} ${studentProfile?.lastName || ""}`.trim() || "Account Holder";
  doc.text(studentName, margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID: ${studentProfile?.studentId || "N/A"}`, margin, y);
  
  y += 5;
  doc.text("Term: Current Academic Term", margin, y);

  y += 15;

  // ══════════════════════════════════════════════════════════════════════════
  // FINANCIAL SUMMARY METRICS
  // ══════════════════════════════════════════════════════════════════════════
  
  const outstanding = balance?.outstanding || 0;
  const total = balance?.total || 0;
  const paid = total - outstanding;

  // Summary Box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentW, 25, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentW, 25);

  const blockW = contentW / 3;

  const renderMetric = (label, value, posH, colorVal) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(label, posH, y + 8, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(...colorVal);
    doc.text(`GHS ${value.toLocaleString()}`, posH, y + 17, { align: "center" });
  };

  renderMetric("TOTAL ASSESSED FEES", total, margin + blockW / 2, [15, 23, 42]);
  solidLine(margin + blockW, y + 4, margin + blockW, y + 21, [226, 232, 240]);
  
  renderMetric("TOTAL AMOUNT PAID", paid, margin + blockW * 1.5, [16, 185, 129]);
  solidLine(margin + blockW * 2, y + 4, margin + blockW * 2, y + 21, [226, 232, 240]);
  
  renderMetric("OUTSTANDING BALANCE", outstanding, margin + blockW * 2.5, [225, 29, 72]); // Crimson alert

  y += 40;

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTION HISTORY (TABLE)
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("TRANSACTION HISTORY", margin, y);
  
  y += 6;

  if (!payments || payments.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("No transactions found on this account.", margin, y + 5);
    y += 15;
  } else {
    // Table Header
    doc.setFillColor(15, 23, 42); // very dark header
    doc.rect(margin, y, contentW, 9, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("DATE", margin + 4, y + 6);
    doc.text("DESCRIPTION", margin + 35, y + 6);
    doc.text("METHOD", margin + 115, y + 6);
    doc.text("STATUS", margin + 150, y + 6);
    doc.text("AMOUNT", margin + 174, y + 6, { align: "right" });
    
    y += 9;

    payments.forEach((p, idx) => {
      checkNewPage(12);

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentW, 11, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      
      doc.text(p.date, margin + 4, y + 7);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(p.title, margin + 35, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(p.method || "-", margin + 115, y + 7);

      doc.setFont("helvetica", "bold");
      if (p.status.toLowerCase() === "success" || p.status.toLowerCase() === "paid") {
        doc.setTextColor(16, 185, 129); // Green
      } else {
        doc.setTextColor(245, 158, 11); // Amber
      }
      doc.text(p.status, margin + 150, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`GHS ${p.amount.toLocaleString()}`, margin + 190, y + 7, { align: "right" });

      solidLine(margin, y + 11, margin + contentW, y + 11, [241, 245, 249]);
      y += 11;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER NOTE
  // ══════════════════════════════════════════════════════════════════════════
  checkNewPage(30);
  
  y += 15;
  doc.setFillColor(236, 253, 245); // super light green
  doc.rect(margin, y, contentW, 15, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70); // dark green
  doc.text("Thank you for your prompt payments.", margin + contentW / 2, y + 6, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Please ensure outstanding balances are cleared before examinations.", margin + contentW / 2, y + 11, { align: "center" });

  y = pageH - 20;
  solidLine(margin, y, margin + contentW, y, [226, 232, 240]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Geoziie International School - Financial Records Department", margin, y + 5);
  doc.text("This is an electronically generated statement. No signature is required.", pageW - margin, y + 5, { align: "right" });

  const safeName = studentProfile?.name ? studentProfile.name.replace(/\s+/g, '_') : "Student";
  doc.save(`Invoice_${safeName}.pdf`);
};
