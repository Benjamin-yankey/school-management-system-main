import { jsPDF } from "jspdf";

export const generateTimetablePDF = (studentProfile, timetableData) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 10;

  const solidLine = (x1, y1, x2, y2, color = [200, 200, 200]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(x1, y1, x2, y2);
  };

  const checkNewPage = (neededSpace = 12) => {
    if (y + neededSpace > pageH - 15) {
      doc.addPage();
      y = 15;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════════════════════
  doc.setDrawColor(100, 160, 210);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, 24, 24);
  doc.setFontSize(7);
  doc.setTextColor(100, 160, 210);
  doc.text("LOGO", margin + 7, y + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 100, 180);
  doc.text("GEOZIIE INTERNATIONAL SCHOOL", pageW / 2, y + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Every Brain Counts", pageW / 2, y + 14, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("OFFICIAL ACADEMIC TIMETABLE", pageW / 2, y + 23, { align: "center" });

  y += 35;

  // ══════════════════════════════════════════════════════════════════════════
  // STUDENT INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentW, 20, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentW, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  
  if (studentProfile) {
    const studentName = studentProfile.name || `${studentProfile.firstName || ""} ${studentProfile.lastName || ""}`.trim() || "Student";
    doc.text("Student Name:", margin + 5, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(studentName, margin + 40, y + 7);

    doc.setFont("helvetica", "bold");
    doc.text("Student ID:", margin + 110, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(studentProfile.studentId || "N/A", margin + 135, y + 7);

    doc.setFont("helvetica", "bold");
    doc.text("Academic Term:", margin + 5, y + 15);
    doc.setFont("helvetica", "normal");
    doc.text("Current Term", margin + 40, y + 15);
  }

  y += 30;

  // ══════════════════════════════════════════════════════════════════════════
  // TIMETABLE MATRIX
  // ══════════════════════════════════════════════════════════════════════════
  
  if (!timetableData || timetableData.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("No timetable data available for this student.", pageW / 2, y + 20, { align: "center" });
  } else {
    timetableData.forEach(daySchedule => {
      if (daySchedule.classes && daySchedule.classes.length > 0) {
        checkNewPage(25);
        
        // Day Header
        doc.setFillColor(30, 80, 160);
        doc.rect(margin, y, contentW, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(daySchedule.day.toUpperCase(), margin + 3, y + 5.5);

        y += 8;

        // Column Headers
        doc.setFillColor(240, 246, 255);
        doc.rect(margin, y, contentW, 7, "F");
        doc.setTextColor(30, 80, 160);
        doc.setFontSize(8);
        doc.text("TIME", margin + 3, y + 5);
        doc.text("SUBJECT", margin + 35, y + 5);
        doc.text("TEACHER", margin + 95, y + 5);
        doc.text("ROOM", margin + 145, y + 5);
        solidLine(margin, y + 7, margin + contentW, y + 7, [100, 160, 210]);
        y += 7;

        // Classes
        daySchedule.classes.forEach((cls, index) => {
          checkNewPage(12);

          if (index % 2 === 0) {
            doc.setFillColor(252, 252, 252);
            doc.rect(margin, y, contentW, 10, "F");
          }

          doc.setFont("helvetica", "bold");
          doc.setTextColor(60, 60, 60);
          doc.text(cls.time, margin + 3, y + 6);
          
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 100, 180);
          doc.text(cls.subject, margin + 35, y + 6);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(cls.teacher || "Assigned Faculty", margin + 95, y + 6);
          
          doc.setFont("helvetica", "italic");
          doc.setTextColor(120, 120, 120);
          doc.text(`${cls.room || "TBA"} (${cls.duration})`, margin + 145, y + 6);

          solidLine(margin, y + 10, margin + contentW, y + 10, [235, 235, 235]);
          y += 10;
        });

        y += 10; // Space between days
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  y = pageH - 15;
  solidLine(margin, y, margin + contentW, y, [210, 210, 210]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Geoziie International School  |  Confidential Academic Document",
    pageW / 2,
    y + 5,
    { align: "center" }
  );

  const safeName = studentProfile?.name ? studentProfile.name.replace(/\s+/g, '_') : "Student";
  doc.save(`Timetable_${safeName}.pdf`);
};
