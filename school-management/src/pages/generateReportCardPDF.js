import { jsPDF } from "jspdf";

export const generateReportCardPDF = (
  studentData,
  gradesData,
  logoBase64 = null
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 10;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const checkNewPage = (neededSpace = 12) => {
    if (y + neededSpace > pageH - 15) {
      doc.addPage();
      y = 15;
    }
  };

  const solidLine = (x1, y1, x2, y2, color = [200, 200, 200]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(x1, y1, x2, y2);
  };

  const sectionHeading = (title) => {
    checkNewPage(14);
    y += 3;
    solidLine(margin, y, margin + contentW, y, [100, 160, 210]);
    doc.setFillColor(240, 246, 255);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 80, 160);
    doc.text(title.toUpperCase(), margin + 3, y + 5);
    solidLine(margin, y + 7, margin + contentW, y + 7, [100, 160, 210]);
    y += 12;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════════════
  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", margin, y, 24, 24);
  } else {
    doc.setDrawColor(100, 160, 210);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, 24, 24);
    doc.setFontSize(7);
    doc.setTextColor(100, 160, 210);
    doc.text("LOGO", margin + 7, y + 13);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 100, 180);
  doc.text("GEOZIIE INTERNATIONAL SCHOOL", pageW / 2, y + 8, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Every Brain Counts", pageW / 2, y + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("OFFICIAL REPORT CARD", pageW / 2, y + 21, {
    align: "center",
  });

  y += 35;

  // ══════════════════════════════════════════════════════════════════════════
  // STUDENT INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentW, 25, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentW, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  
  let infoY = y + 7;
  doc.text("Student Name:", margin + 5, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(`${studentData.firstName} ${studentData.lastName}`, margin + 35, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Student ID:", margin + 110, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(studentData.studentId || "N/A", margin + 135, infoY);

  infoY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Academic Year:", margin + 5, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(studentData.academicYear || "2025/2026", margin + 35, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Term:", margin + 110, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(studentData.termName || "Term 1", margin + 135, infoY);

  y += 35;

  // ══════════════════════════════════════════════════════════════════════════
  // ACADEMIC PERFORMANCE TABLE
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Academic Performance");

  // Table Header
  doc.setFillColor(30, 80, 160);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  
  doc.text("Subject", margin + 3, y + 5.5);
  doc.text("Score", margin + 80, y + 5.5, { align: "center" });
  doc.text("Grade", margin + 110, y + 5.5, { align: "center" });
  doc.text("Remarks", margin + 140, y + 5.5);

  y += 8;

  // Table Body
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");

  gradesData.forEach((g, index) => {
    checkNewPage(10);
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, 8, "F");
    }
    
    // Auto-remark and grade based on score
    const score = g.score || g.percentage || 0;
    let grade = "F";
    let remark = "Fail";
    if (score >= 90) { grade = "A"; remark = "Excellent"; }
    else if (score >= 80) { grade = "B"; remark = "Very Good"; }
    else if (score >= 70) { grade = "C"; remark = "Good"; }
    else if (score >= 60) { grade = "D"; remark = "Credit"; }
    else if (score >= 50) { grade = "E"; remark = "Pass"; }

    doc.text(g.subject, margin + 3, y + 5.5);
    doc.text(score.toString(), margin + 80, y + 5.5, { align: "center" });
    doc.text(grade, margin + 110, y + 5.5, { align: "center" });
    doc.text(g.teacherNote || remark, margin + 140, y + 5.5);
    
    solidLine(margin, y + 8, margin + contentW, y + 8, [230, 230, 230]);
    y += 8;
  });

  y += 15;

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY & SIGNATURES
  // ══════════════════════════════════════════════════════════════════════════
  checkNewPage(40);
  
  const avgScore = gradesData.length > 0 
    ? (gradesData.reduce((acc, curr) => acc + (curr.score || curr.percentage || 0), 0) / gradesData.length).toFixed(1)
    : "0.0";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Average Score: ${avgScore}%`, margin, y);
  
  y += 25;

  solidLine(margin, y, margin + 60, y, [100, 100, 100]);
  solidLine(pageW - margin - 60, y, pageW - margin, y, [100, 100, 100]);
  
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Class Teacher's Signature", margin + 10, y);
  doc.text("Headteacher's Signature", pageW - margin - 50, y);

  // Footer
  y = pageH - 15;
  solidLine(margin, y, margin + contentW, y, [210, 210, 210]);
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Phone: 055-756-4700  |  Geoziie International School  |  Official Student Report",
    pageW / 2,
    y + 5,
    { align: "center" },
  );

  doc.save(`Report_Card_${studentData.firstName}_${studentData.lastName}.pdf`);
};
