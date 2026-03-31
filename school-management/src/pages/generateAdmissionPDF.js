import { jsPDF } from "jspdf";

export const generateAdmissionPDF = (
  logoBase64 = null,
  childImageBase64 = null,
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

  const dottedLine = (x, yPos, w) => {
    doc.setDrawColor(160, 160, 160);
    doc.setLineDashPattern([1, 1.5], 0);
    doc.setLineWidth(0.3);
    doc.line(x, yPos, x + w, yPos);
    doc.setLineDashPattern([], 0);
  };

  const fieldLine = (label, x, yPos, fieldWidth) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(label, x, yPos);
    const labelW = doc.getTextWidth(label) + 2;
    dottedLine(x + labelW, yPos, fieldWidth - labelW);
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

  const radioOption = (label, x, yPos) => {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.circle(x, yPos - 1.5, 1.8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(label, x + 3.5, yPos);
  };

  const checkboxOption = (label, x, yPos) => {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos - 3, 3.5, 3.5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(label, x + 5, yPos);
  };

  const col2 = margin + contentW / 2 + 3;

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
  doc.text("GEOZIIE ADMISSIONS FORM", pageW / 2, y + 21, {
    align: "center",
  });

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(pageW - margin - 22, y, 22, 26);
  doc.setLineDashPattern([], 0);
  if (childImageBase64) {
    doc.addImage(childImageBase64, "JPEG", pageW - margin - 22, y, 22, 26);
  } else {
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("Photo", pageW - margin - 11, y + 14, { align: "center" });
  }

  y += 28;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, contentW, 9, "F");
  solidLine(margin, y, margin + contentW, y, [180, 180, 180]);
  solidLine(margin, y + 9, margin + contentW, y + 9, [180, 180, 180]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("DAY CARE REGISTRATION FORM", pageW / 2, y + 6.3, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Phone: 055-756-4700", pageW / 2, y + 14, { align: "center" });

  y += 20;
  solidLine(margin, y - 2, margin + contentW, y - 2);

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM DETAILS
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Program Details");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("PROGRAM", margin, y);
  y += 5;
  const programs = ["Day Care", "Preschool", "After School Program", "Other"];
  let px = margin;
  programs.forEach((p) => {
    radioOption(p, px, y);
    px += doc.getTextWidth(p) + 14;
  });
  y += 9;

  checkNewPage(10);
  fieldLine("Start Date :", margin, y, 85);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("DAYS", margin, y);
  y += 5;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let dx = margin;
  days.forEach((d) => {
    checkboxOption(d, dx, y);
    dx += doc.getTextWidth(d) + 14;
  });
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("GENDER", margin, y);
  y += 5;
  radioOption("Female", margin, y);
  radioOption("Male", margin + 25, y);
  y += 9;

  // ══════════════════════════════════════════════════════════════════════════
  // CHILD INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Child Information");

  checkNewPage(10);
  fieldLine("Full Name of Child :", margin, y, 85);
  fieldLine("Date of Birth :", col2, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Phone :", margin, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Zip :", margin, y, 60);
  y += 11;

  // ══════════════════════════════════════════════════════════════════════════
  // MOTHER / GUARDIAN INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Mother or Guardian Information");

  checkNewPage(10);
  fieldLine("Mother or Guardian Name :", margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Home Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Employment :", margin, y, 85);
  fieldLine("Phone :", col2, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Hours :", margin, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Work Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Email Address :", margin, y, contentW);
  y += 11;

  // ══════════════════════════════════════════════════════════════════════════
  // FATHER / GUARDIAN INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Father or Guardian Information");

  checkNewPage(10);
  fieldLine("Father or Guardian Name :", margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Home Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Employment :", margin, y, 85);
  fieldLine("Phone :", col2, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Work Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Email Address :", margin, y, contentW);
  y += 11;

  // ══════════════════════════════════════════════════════════════════════════
  // AUTHORIZED PICK-UP PERSONS
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Authorized Pick-up Persons");

  checkNewPage(30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const pickupNote =
    "List Name, Relationship, Address, Day Time Phone No, Cell Phone No for each person.";
  doc.text(doc.splitTextToSize(pickupNote, contentW), margin, y);
  y += 8;
  for (let i = 0; i < 3; i++) {
    checkNewPage(10);
    dottedLine(margin, y, contentW);
    y += 8;
  }
  y += 5;

  // ══════════════════════════════════════════════════════════════════════════
  // EMERGENCY CONTACTS
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Emergency Contacts");

  checkNewPage(30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const emergNote =
    "People to call in case of EMERGENCY (must list two people; do not list parents of the child)\nList Name, Relationship, Address, Day Time Phone No, Cell Phone No for each person.";
  const emergSplit = doc.splitTextToSize(emergNote, contentW);
  doc.text(emergSplit, margin, y);
  y += emergSplit.length * 5 + 3;
  for (let i = 0; i < 4; i++) {
    checkNewPage(10);
    dottedLine(margin, y, contentW);
    y += 8;
  }
  y += 5;

  // ══════════════════════════════════════════════════════════════════════════
  // MEDICAL INFORMATION
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Medical Information");

  checkNewPage(10);
  fieldLine("Child's Physician :", margin, y, 85);
  fieldLine("Phone No. :", col2, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Emergency Hospital Preference :", margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Phone No. :", margin, y, 85);
  y += 9;
  checkNewPage(10);
  fieldLine("Hospital Address :", margin, y, contentW);
  y += 8;
  dottedLine(margin, y, contentW);
  y += 9;
  checkNewPage(10);
  fieldLine("Dentist :", margin, y, 85);
  y += 11;

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENT & ADMINISTRATION
  // ══════════════════════════════════════════════════════════════════════════
  sectionHeading("Payment & Administration");

  checkNewPage(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("Registration Paid :", margin, y);
  radioOption("Yes", margin + 38, y);
  radioOption("No", margin + 55, y);
  doc.text("Security Deposit Paid :", col2, y);
  radioOption("Yes", col2 + 44, y);
  radioOption("No", col2 + 61, y);
  y += 9;

  checkNewPage(10);
  fieldLine("Date Paid :", margin, y, 85);
  fieldLine("Weekly Parent Fee :", col2, y, 85);
  y += 9;

  checkNewPage(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text("Received Parent Handbook (initial) :", margin, y);
  radioOption("Yes", margin + 74, y);
  radioOption("No", margin + 91, y);
  y += 13;

  // ══════════════════════════════════════════════════════════════════════════
  // DECLARATION
  // ══════════════════════════════════════════════════════════════════════════
  checkNewPage(35);
  solidLine(margin, y, margin + contentW, y, [180, 180, 180]);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("DECLARATION", pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const declaration =
    "I hereby declare that I will abide by all the rules and regulations of the institution and be fully responsible for any violation of the rules.";
  const declSplit = doc.splitTextToSize(declaration, contentW);
  doc.text(declSplit, margin, y);
  y += declSplit.length * 5 + 12;

  // Signatures
  checkNewPage(20);
  solidLine(margin, y, margin + 55, y, [80, 80, 80]);
  solidLine(pageW - margin - 55, y, pageW - margin, y, [80, 80, 80]);
  y += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Student's Signature", margin, y);
  doc.text("Authorized's Signature", pageW - margin - 55, y);
  y += 5;
  fieldLine("Date :", margin, y, 55);
  fieldLine("Date :", pageW - margin - 55, y, 55);
  y += 12;

  // Footer
  solidLine(margin, y, margin + contentW, y, [210, 210, 210]);
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Phone: 055-756-4700  |  Geoziie International School  |  Admissions Form",
    pageW / 2,
    y + 5,
    { align: "center" },
  );

  doc.save("Geoziie_Admissions_Form.pdf");
};
