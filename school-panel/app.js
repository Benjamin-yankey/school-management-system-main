const API_BASE = "http://localhost:3000";

const state = {
  user: null,
  token: localStorage.getItem("school_token"),
  currentView: "dashboard",
  academicYears: [],
  classes: [],
  activeYear: null,
};

// --- API HELPERS ---
async function apiFetch(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (state.token) {
    headers["Authorization"] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) logout();
      throw new Error(data.message || "API request failed");
    }
    return data;
  } catch (err) {
    showToast(err.message, "error");
    document
      .querySelectorAll(".loading")
      .forEach(
        (el) => (el.innerHTML = `<div class="error-msg">${err.message}</div>`),
      );
    throw err;
  }
}

// --- AUTH ---
async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  try {
    const res = await apiFetch("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    state.token = res.accessToken;
    localStorage.setItem("school_token", res.accessToken);

    const payload = JSON.parse(atob(res.accessToken.split(".")[1]));
    state.user = payload;

    document.getElementById("login-overlay").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("user-email").textContent = payload.email;
    document.getElementById("user-avatar").textContent =
      payload.email[0].toUpperCase();

    showToast("Successfully logged in!", "success");
    initModules();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  }
}

function logout() {
  localStorage.removeItem("school_token");
  window.location.reload();
}

// --- UI HELPERS ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "error" ? "❌" : "✅"}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function switchView(view) {
  state.currentView = view;
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`)?.classList.add("active");
  document.getElementById("view-title").textContent =
    view.charAt(0).toUpperCase() + view.slice(1);
  renderView();
}

async function renderView() {
  const area = document.getElementById("content-area");
  area.innerHTML = '<div class="loading">Loading...</div>';

  switch (state.currentView) {
    case "dashboard":
      renderDashboard();
      break;
    case "admissions":
      renderAdmissions();
      break;
    case "applications":
      renderOpenApplications();
      break;
    case "academic":
      renderAcademicYears();
      break;
    case "curriculum":
      renderCurriculum();
      break;
    case "students":
      renderStudents();
      break;
    case "staff":
      renderStaff();
      break;
    case "parents":
      renderParentRegistry();
      break;
    case "promotions":
      renderPromotions();
      break;
    case "fees-admin":
      renderFeesAdmin();
      break;
    case "student-fees":
      renderStudentFees();
      break;
    case "parent-fees":
      renderParentFees();
      break;
    case "teacher-sections":
      renderTeacherSections();
      break;
    case "teacher-students":
      renderTeacherStudents();
      break;
    case "student-profile":
      renderStudentProfile();
      break;
    case "student-history":
      renderStudentHistory();
      break;
    case "parent-children":
      renderParentPortal();
      break;
  }
}

function renderDashboard() {
  const role = state.user?.role?.toUpperCase() || "USER";
  document.getElementById("content-area").innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Welcome back,</div>
                <div class="stat-value">${role} Portal</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Session Status</div>
                <div class="stat-value">Active</div>
                <div class="stat-label">${state.user?.email}</div>
            </div>
        </div>
        <div class="card">
            <h3>Portal Overview</h3>
            <p>You are currently logged in as a <strong>${role}</strong>. Use the sidebar to navigate through your authorized features.</p>
        </div>
    `;
}

// -- ADMISSIONS --
async function renderAdmissions() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Public Admission Test</h3>
                <button class="btn-primary" onclick="showPublicApplyModal()">Open Apply Form</button>
            </div>
        </div>
        <div class="card mt-1">
            <div class="flex-between">
                <h3>Admission Years</h3>
                <button class="btn-primary" onclick="createAdmissionYear()">Create New Year</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="admission-years-body"></tbody>
                </table>
            </div>
        </div>
    `;
  loadAdmissionYears();
}

async function loadAdmissionYears() {
  const years = await apiFetch("/admissions/years");
  const body = document.getElementById("admission-years-body");
  body.innerHTML = years
    .map(
      (y) => `
        <tr>
            <td>${y.year}</td>
            <td><span class="badge ${y.isOpen ? "success" : "muted"}">${y.isOpen ? "OPEN" : "CLOSED"}</span></td>
            <td>
                <button class="btn-sm" onclick="toggleAdmissionYear('${y.id}', ${y.isOpen})">${y.isOpen ? "Close" : "Open"}</button>
                <button class="btn-sm" onclick="viewApplications('${y.id}')">Applications</button>
            </td>
        </tr>
    `,
    )
    .join("");
}

async function toggleAdmissionYear(id, isOpen) {
  const action = isOpen ? "close" : "open";
  await apiFetch(`/admissions/years/${id}/${action}`, { method: "PATCH" });
  showToast(`Admission year ${action}ed`);
  loadAdmissionYears();
}

async function createAdmissionYear() {
  const year = prompt("Enter Admission Year (e.g., 2025/2026):");
  if (!year) return;
  await apiFetch("/admissions/years", {
    method: "POST",
    body: JSON.stringify({ year }),
  });
  loadAdmissionYears();
}

async function renderOpenApplications() {
  const container = document.getElementById("content-area");
  container.innerHTML =
    '<div class="loading">Finding open admission year...</div>';
  try {
    const openYear = await apiFetch("/admissions/current");
    if (!openYear) {
      container.innerHTML = `<div class="card"><h3>No Open Admission</h3><p>Please open an admission year first.</p></div>`;
      return;
    }
    renderApplications(openYear.id);
  } catch (e) {}
}

async function viewApplications(yearId) {
  state.currentView = "applications";
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("view-title").textContent = "Applications";
  renderApplications(yearId);
}

async function renderApplications(yearId) {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between"><h3>Applications List</h3><button class="btn-sm" onclick="switchView('admissions')">Back</button></div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Applicant</th><th>Year</th><th>Interest</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="applications-body"></tbody>
                </table>
            </div>
        </div>
    `;
  loadApplications(yearId);
}

async function loadApplications(yearId) {
  const apps = await apiFetch(`/admissions/years/${yearId}/applications`);
  const body = document.getElementById("applications-body");
  body.innerHTML =
    apps
      .map((a) => {
        const fullName = `${a.firstName} ${a.middleName ? a.middleName + " " : ""}${a.lastName}`;
        const date = new Date(a.submittedAt).toLocaleDateString();
        return `
            <tr>
                <td><strong>${fullName}</strong><br><small>${a.email}</small></td>
                <td>${a.admissionYear?.year || yearId}</td>
                <td>${a.areaOfInterest}</td>
                <td><span class="badge ${a.status.toLowerCase()}">${a.status.toUpperCase()}</span></td>
                <td>
                    ${
                      a.status === "pending"
                        ? `
                        <button class="btn-sm success" onclick="updateAppStatus('${a.id}', 'accepted', '${yearId}')">Accept</button>
                        <button class="btn-sm error" onclick="updateAppStatus('${a.id}', 'rejected', '${yearId}')">Reject</button>
                    `
                        : a.status === "accepted"
                          ? `<button class="btn-sm success" onclick="showEnrollModal('${a.id}')">Enroll</button>`
                          : `<span>${a.status.toUpperCase()} ${date}</span>`
                    }
                </td>
            </tr>
        `;
      })
      .join("") ||
    '<tr><td colspan="5" class="text-center">No applications found.</td></tr>';
}

async function updateAppStatus(id, status, yearId) {
  await apiFetch(`/admissions/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  showToast(`Application ${status}`);
  renderApplications(yearId);
}

// -- ENROLLMENT --
async function showEnrollModal(applicantId) {
  const container = document.getElementById("modal-container");
  container.innerHTML = `<div class="loading">Preparing enrollment...</div>`;
  container.classList.remove("hidden");
  try {
    const [years, classes, applicant] = await Promise.all([
      apiFetch("/academic-years"),
      apiFetch("/classes"),
      apiFetch(`/admissions/applications/${applicantId}`),
    ]);
    container.innerHTML = `
            <div class="modal">
                <h3>Enroll ${applicant.firstName}</h3>
                <div class="input-group"><label>Academic Year</label><select id="enroll-year">${years.map((y) => `<option value="${y.id}">${y.year}</option>`).join("")}</select></div>
                <div class="input-group"><label>Class Level</label><select id="enroll-class" onchange="loadSectionsForEnroll(this.value)"><option>Select Class</option>${classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
                <div class="input-group"><label>Section</label><select id="enroll-section"><option value="">No Section</option></select></div>
                
                <div class="card bg-muted mt-1">
                    <p class="small mb-1"><strong>Parent Linking (Optional)</strong></p>
                    <div class="input-group"><label>Parent User ID</label><input type="text" id="enroll-parent-id" placeholder="Parent UUID"></div>
                    <div class="input-group"><label>Relationship</label><input type="text" id="enroll-relationship" placeholder="e.g. Father"></div>
                </div>

                <div class="flex-end gap-1 mt-1"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="submitEnrollment('${applicantId}')">Enroll Now</button></div>
            </div>
        `;
  } catch (e) {
    closeModal();
  }
}

async function loadSectionsForEnroll(classId) {
  const sections = await apiFetch(`/classes/${classId}/sections`);
  document.getElementById("enroll-section").innerHTML =
    '<option value="">No Section</option>' +
    sections.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
}

async function submitEnrollment(applicantId) {
  const payload = {
    applicantId,
    academicYearId: document.getElementById("enroll-year").value,
    classLevelId: document.getElementById("enroll-class").value,
    sectionId: document.getElementById("enroll-section").value || null,
    parentUserId: document.getElementById("enroll-parent-id").value || null,
    relationship: document.getElementById("enroll-relationship").value || null,
  };
  await apiFetch("/students/enroll", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  showToast("Enrollment complete");
  closeModal();
  renderView();
}

// -- STUDENTS --
async function renderStudents() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Student Registry</h3>
                <div class="gap-1">
                    <button class="btn-secondary" onclick="showEnrollModal()">Direct Enrollment</button>
                    <button class="btn-primary" onclick="showCreateUserModal('student')">Create New Student Account</button>
                </div>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Email / ID</th><th>Guardians</th><th>Actions</th></tr></thead>
                    <tbody id="student-body"></tbody>
                </table>
            </div>
        </div>
    `;
  loadStudents();
}

async function loadStudents() {
  const students = await apiFetch("/students");
  document.getElementById("student-body").innerHTML =
    students
      .map(
        (s) => `
        <tr>
            <td>
                <strong>${s.firstName} ${s.lastName}</strong><br>
                <small>${s.studentId}</small>
                ${s.status === "WITHDRAWN" ? '<span class="badge absent">WITHDRAWN</span>' : ""}
            </td>
            <td>${s.email || "-"}</td>
            <td><small>${s.parents?.length || 0} Linked</small></td>
            <td>
                <div class="gap-05" style="display:flex; flex-wrap: wrap;">
                    <button class="btn-sm" onclick="viewStudentEnrollments('${s.id}')">History</button>
                    <button class="btn-sm" onclick="showManageGuardiansModal('${s.id}', '${s.firstName} ${s.lastName}')">Guardians</button>
                    ${s.status !== "WITHDRAWN" ? `<button class="btn-sm error" onclick="withdrawStudent('${s.id}')">Withdraw</button>` : ""}
                </div>
            </td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No students found.</td></tr>';
}

async function withdrawStudent(studentId) {
  if (
    confirm(
      "Are you sure you want to withdraw this student? This action sets their status to WITHDRAWN.",
    )
  ) {
    await apiFetch(`/students/${studentId}/withdraw`, { method: "PATCH" });
    showToast("Student withdrawn");
    loadStudents();
  }
}

async function viewStudentEnrollments(studentId) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = '<div class="loading">Loading history...</div>';
  try {
    const history = await apiFetch(`/students/${studentId}/enrollments`);
    container.innerHTML = `
            <div class="modal large">
                <h3>Enrollment History</h3>
                <div class="table-container mt-1">
                    <table>
                        <thead><tr><th>Year</th><th>Class</th><th>Section</th><th>Date</th></tr></thead>
                        <tbody>${history
                          .map(
                            (h) => `
                            <tr>
                                <td>${h.academicYear?.year}</td>
                                <td>${h.classLevel?.name}</td>
                                <td>${h.section?.name || "-"}</td>
                                <td>${new Date(h.enrolledAt).toLocaleDateString()}</td>
                            </tr>
                        `,
                          )
                          .join("")}</tbody>
                    </table>
                </div>
                <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
            </div>
        `;
  } catch (e) {
    closeModal();
  }
}

async function showManageGuardiansModal(studentId, studentName) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = '<div class="loading">Loading guardians...</div>';

  try {
    const student = await apiFetch(`/students/${studentId}`);
    container.innerHTML = `
            <div class="modal large">
                <h3>Manage Guardians for ${studentName}</h3>
                <div class="card bg-muted mt-1">
                    <h4>Current Links</h4>
                    <div class="table-container mt-1">
                        <table>
                            <thead><tr><th>User ID / Email</th><th>Relationship</th><th>Actions</th></tr></thead>
                            <tbody>${
                              (student.parents || [])
                                .map(
                                  (p) => `
                                <tr>
                                    <td>${p.parentUserId}</td>
                                    <td><span class="badge">${p.relationship || "Guardian"}</span></td>
                                    <td><button class="btn-sm error" onclick="unlinkGuardian('${studentId}', '${p.parentUserId}')">Unlink</button></td>
                                </tr>
                            `,
                                )
                                .join("") ||
                              '<tr><td colspan="3">No guardians linked.</td></tr>'
                            }</tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card mt-1">
                    <h4>Link New Guardian</h4>
                    <p class="small text-muted mb-1">Search for a registered parent by their User ID and specify relationship.</p>
                    <div class="flex-column gap-1">
                        <div class="input-group">
                            <label>Parent User ID</label>
                            <input type="text" id="link-parent-id" placeholder="Paste Parent UUID here...">
                        </div>
                        <div class="input-group">
                            <label>Relationship</label>
                            <input type="text" id="link-relationship" placeholder="e.g. Father, Mother, Aunt">
                        </div>
                        <button class="btn-primary" onclick="submitLinkParentAdmin('${studentId}')">Create Link</button>
                    </div>
                </div>
                
                <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
            </div>
        `;
  } catch (e) {
    closeModal();
  }
}

async function submitLinkParentAdmin(studentId) {
  const parentUserId = document.getElementById("link-parent-id").value;
  const relationship = document.getElementById("link-relationship").value;
  if (!parentUserId) return showToast("Please enter Parent User ID", "error");

  try {
    await apiFetch(
      `/administration/parents/${parentUserId}/students/${studentId}`,
      {
        method: "POST",
        body: JSON.stringify({ relationship }),
      },
    );
    showToast("Student successfully linked to parent");
    closeModal();
    renderStudents();
  } catch (e) {}
}

async function unlinkGuardian(studentId, parentUserId) {
  if (confirm("Are you sure you want to remove this connection?")) {
    try {
      await apiFetch(
        `/administration/parents/${parentUserId}/students/${studentId}`,
        { method: "DELETE" },
      );
      showToast("Guardian unlinked");
      closeModal();
      renderStudents();
    } catch (e) {}
  }
}

// -- ACADEMIC YEARS --
function renderAcademicYears() {
  document.getElementById("content-area").innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Academic Cycles</h3>
                <button class="btn-primary" onclick="createAcademicYear()">Create New Year</button>
            </div>
            <div id="academic-years-list" class="mt-1"></div>
        </div>
    `;
  loadAcademicYears();
}

async function loadAcademicYears() {
  const list = await apiFetch("/academic-years");
  const container = document.getElementById("academic-years-list");
  container.innerHTML = "";

  for (const y of list) {
    const yearCard = document.createElement("div");
    yearCard.className = "card bg-muted mb-1";
    yearCard.innerHTML = `
            <div class="flex-between">
                <div>
                    <strong>${y.year}</strong>
                    <span class="badge ${y.isActive ? "success" : "muted"} ml-1">${y.isActive ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <div class="gap-1">
                    ${!y.isActive ? `<button class="btn-sm" onclick="activateAcademicYear('${y.id}')">Activate Year</button>` : ""}
                    <button class="btn-sm success" onclick="createAcademicTerm('${y.id}')">+ Add Term</button>
                </div>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Term Name</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody id="terms-body-${y.id}"></tbody>
                </table>
            </div>
        `;
    container.appendChild(yearCard);
    loadAcademicTerms(y.id);
  }
}

async function loadAcademicTerms(yearId) {
  const terms = await apiFetch(`/academic-terms?academicYearId=${yearId}`);
  const body = document.getElementById(`terms-body-${yearId}`);
  body.innerHTML =
    terms
      .map(
        (t) => `
        <tr>
            <td>${t.name}</td>
            <td><span class="badge ${t.isCurrent ? "success" : "muted"}">${t.isCurrent ? "CURRENT" : "-"}</span></td>
            <td>
                ${!t.isCurrent ? `<button class="btn-sm" onclick="activateAcademicTerm('${t.id}', '${yearId}')">Set Current</button>` : ""}
            </td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="3" class="text-center">No terms defined</td></tr>';
}

async function createAcademicYear() {
  const year = prompt("Enter Year (e.g. 2024/2025):");
  if (year) {
    await apiFetch("/academic-years", {
      method: "POST",
      body: JSON.stringify({ year }),
    });
    loadAcademicYears();
  }
}

async function activateAcademicYear(id) {
  await apiFetch(`/academic-years/${id}/activate`, { method: "PATCH" });
  loadAcademicYears();
}

async function createAcademicTerm(academicYearId) {
  const name = prompt("Enter Term Name (e.g. Term 1, First Semester):");
  if (!name) return;

  const rawStart = prompt(
    "Enter Start Date (YYYY-MM-DD):",
    new Date().toISOString().split("T")[0],
  );
  if (!rawStart) return;

  const rawEnd = prompt(
    "Enter End Date (YYYY-MM-DD):",
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  if (!rawEnd) return;

  try {
    const startDate = new Date(rawStart).toISOString();
    const endDate = new Date(rawEnd).toISOString();

    await apiFetch("/academic-terms", {
      method: "POST",
      body: JSON.stringify({ name, academicYearId, startDate, endDate }),
    });
    loadAcademicTerms(academicYearId);
  } catch (e) {
    showToast("Invalid dates provided", "error");
  }
}

async function activateAcademicTerm(id, yearId) {
  await apiFetch(`/academic-terms/${id}/activate`, { method: "PATCH" });
  loadAcademicTerms(yearId);
}

// -- CURRICULUM --
function renderCurriculum() {
  document.getElementById("content-area").innerHTML =
    `<div class="card"><div class="flex-between"><h3>Classes</h3><div class="gap-1"><button class="btn-secondary" onclick="seedClasses()">Seed</button><button class="btn-primary" onclick="createClass()">New</button></div></div><div class="table-container mt-1"><table><thead><tr><th>Name</th><th>Sections</th></tr></thead><tbody id="classes-body"></tbody></table></div></div>`;
  loadClasses();
}

async function loadClasses() {
  const classes = await apiFetch("/classes");
  document.getElementById("classes-body").innerHTML = classes
    .map(
      (c) =>
        `<tr><td>${c.name}</td><td><button class="btn-sm" onclick="addSection('${c.id}')">+ Section</button> <button class="btn-sm" onclick="viewSections('${c.id}')">View</button></td></tr>`,
    )
    .join("");
}

async function seedClasses() {
  await apiFetch("/classes/seed", { method: "POST" });
  loadClasses();
}

async function createClass() {
  const name = prompt("Name:");
  const level = parseInt(prompt("Level (1-12):"));
  if (name && level) {
    await apiFetch("/classes", {
      method: "POST",
      body: JSON.stringify({ name, level }),
    });
    loadClasses();
  }
}

async function viewSections(classId) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  const sections = await apiFetch(`/classes/${classId}/sections`);
  container.innerHTML = `
        <div class="modal large">
            <h3>Sections for Class</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Section</th><th>Capacity</th><th>Teacher</th><th>Actions</th></tr></thead>
                    <tbody>${sections
                      .map(
                        (s) => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.capacity}</td>
                            <td><small id="teacher-name-${s.id}">Loading...</small></td>
                            <td>
                                <button class="btn-sm" onclick="showAssignTeacherModal('${s.id}')">Assign Teacher</button>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}</tbody>
                </table>
            </div>
            <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
        </div>
    `;
  // Load existing teachers for these sections
  sections.forEach(async (s) => {
    try {
      const teachers = await apiFetch(
        `/administration/sections/${s.id}/teachers`,
      );
      document.getElementById(`teacher-name-${s.id}`).textContent =
        teachers.map((t) => t.email.split("@")[0]).join(", ") || "Unassigned";
    } catch (e) {
      document.getElementById(`teacher-name-${s.id}`).textContent = "Error";
    }
  });
}

async function showAssignTeacherModal(sectionId) {
  const container = document.getElementById("modal-container");
  // We reuse the modal but show a nested one or replace
  const users = await apiFetch("/administration/users");
  const teachers = users.filter((u) => u.role === "teacher");

  const subModal = document.createElement("div");
  subModal.className = "overlay";
  subModal.innerHTML = `
        <div class="modal">
            <h3>Assign Teacher</h3>
            <div class="input-group">
                <label>Select Teacher</label>
                <select id="assign-teacher-id">
                    ${teachers.map((t) => `<option value="${t.id}">${t.email}</option>`).join("")}
                </select>
            </div>
            <div class="flex-end gap-1">
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                <button class="btn-primary" onclick="submitAssignTeacher('${sectionId}')">Assign</button>
            </div>
        </div>
    `;
  container.appendChild(subModal);
}

async function submitAssignTeacher(sectionId) {
  const teacherUserId = document.getElementById("assign-teacher-id").value;
  await apiFetch(`/administration/teachers/${teacherUserId}/sections`, {
    method: "POST",
    body: JSON.stringify({ sectionId }),
  });
  showToast("Teacher assigned successfully");
  closeModal();
}

async function addSection(classId) {
  const name = prompt("Name:");
  if (name) {
    const activeYear = await apiFetch("/academic-years/active");
    if (!activeYear) return showToast("No active academic year set", "error");
    await apiFetch(`/classes/${classId}/sections`, {
      method: "POST",
      body: JSON.stringify({
        name,
        capacity: 40,
        academicYearId: activeYear.id,
      }),
    });
    showToast("Added");
  }
}

// -- TEACHER PORTAL --
async function renderTeacherSections() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <h3>My Assigned Classes</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Class</th><th>Section</th><th>Capacity</th><th>Actions</th></tr></thead>
                    <tbody id="teacher-sections-body"></tbody>
                </table>
            </div>
        </div>
    `;
  const sections = await apiFetch("/teacher/sections");
  document.getElementById("teacher-sections-body").innerHTML =
    sections
      .map(
        (s) => `
        <tr>
            <td>${s.classLevel?.name}</td>
            <td>${s.name}</td>
            <td>${s.capacity}</td>
            <td><button class="btn-sm" onclick="viewSectionStudents('${s.id}', '${s.name}')">View Students</button></td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No assignments found.</td></tr>';
}

async function viewSectionStudents(sectionId, sectionName) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  const students = await apiFetch(`/teacher/sections/${sectionId}/students`);
  container.innerHTML = `
        <div class="modal large">
            <div class="flex-between">
                <h3>Students in Section ${sectionName}</h3>
                <div class="gap-1">
                    <button class="btn-primary" onclick="renderAttendanceMarking('${sectionId}', '${sectionName}')">Mark Attendance</button>
                    <button class="btn-primary" onclick="renderGradeEntry('${sectionId}', '${sectionName}')">Enter Grades</button>
                </div>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>${students
                      .map(
                        (s) => `
                        <tr>
                            <td>${s.firstName} ${s.lastName}</td>
                            <td>${s.email || "-"}</td>
                            <td>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <button class="btn-sm" onclick="viewStudentSummary('${s.id}', '${s.firstName}')">View Summary</button>
                                    <button class="btn-sm" onclick="promptReportCard('${s.id}')">Report Card</button>
                                </div>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}</tbody>
                </table>
            </div>
            <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
        </div>
    `;
}

async function renderAttendanceMarking(sectionId, sectionName) {
  const container = document.getElementById("modal-container");
  const students = await apiFetch(`/teacher/sections/${sectionId}/students`);
  const activeYear = await apiFetch("/academic-years/active"); // Simplified: assumes active year
  const terms = await apiFetch(
    `/academic-terms?academicYearId=${activeYear.id}`,
  );
  const currentTerm = terms.find((t) => t.isCurrent);

  if (!currentTerm) return showToast("No current academic term set!", "error");

  container.innerHTML = `
        <div class="modal large">
            <h3>Mark Attendance: ${sectionName}</h3>
            <p class="small text-muted mb-1">Date: ${new Date().toLocaleDateString()} | Term: ${currentTerm.name}</p>
            <div class="table-container">
                <table>
                    <thead><tr><th>Student</th><th>Status</th></tr></thead>
                    <tbody>${students
                      .map(
                        (s) => `
                        <tr>
                            <td>${s.firstName} ${s.lastName}</td>
                            <td>
                                <div class="attendance-grid" id="att-row-${s.id}">
                                    <button class="att-btn active" data-status="present" onclick="setAttendanceStatus('${s.id}', 'present')">P</button>
                                    <button class="att-btn" data-status="absent" onclick="setAttendanceStatus('${s.id}', 'absent')">A</button>
                                    <button class="att-btn" data-status="late" onclick="setAttendanceStatus('${s.id}', 'late')">L</button>
                                    <button class="att-btn" data-status="excused" onclick="setAttendanceStatus('${s.id}', 'excused')">E</button>
                                </div>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}</tbody>
                </table>
            </div>
            <div class="flex-end gap-1 mt-1">
                <button class="btn-secondary" onclick="viewSectionStudents('${sectionId}', '${sectionName}')">Back</button>
                <button class="btn-primary" onclick="submitAttendance('${sectionId}', '${currentTerm.id}')">Submit Attendance</button>
            </div>
        </div>
    `;
}

const attendanceState = {};
function setAttendanceStatus(studentId, status) {
  attendanceState[studentId] = status;
  const row = document.getElementById(`att-row-${studentId}`);
  row.querySelectorAll(".att-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });
}

async function submitAttendance(sectionId, termId) {
  const records = Object.entries(attendanceState).map(
    ([studentId, status]) => ({
      studentId,
      status,
    }),
  );

  // Default remaining to 'present' if not clicked
  const rowIds = Array.from(document.querySelectorAll('[id^="att-row-"]')).map(
    (el) => el.id.replace("att-row-", ""),
  );
  rowIds.forEach((id) => {
    if (!attendanceState[id]) {
      records.push({ studentId: id, status: "present" });
    }
  });

  await apiFetch("/attendance/bulk", {
    method: "POST",
    body: JSON.stringify({
      sectionId,
      termId,
      date: new Date().toISOString().split("T")[0],
      records,
    }),
  });
  showToast("Attendance recorded successfully");
  closeModal();
}

async function renderGradeEntry(sectionId, sectionName) {
  const container = document.getElementById("modal-container");
  const students = await apiFetch(`/teacher/sections/${sectionId}/students`);
  const activeYear = await apiFetch("/academic-years/active");
  const terms = await apiFetch(
    `/academic-terms?academicYearId=${activeYear.id}`,
  );
  const currentTerm = terms.find((t) => t.isCurrent);

  if (!currentTerm) return showToast("No current academic term set!", "error");

  container.innerHTML = `
        <div class="modal large">
            <h3>Grade Entry: ${sectionName}</h3>
            <div class="flex-between mb-1">
                <div class="input-group" style="margin:0"><label>Subject</label><input type="text" id="grade-subject" placeholder="e.g. Mathematics"></div>
                <p class="small text-muted">Term: ${currentTerm.name}</p>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>Student</th><th>Score (0-100)</th></tr></thead>
                    <tbody>${students
                      .map(
                        (s) => `
                        <tr>
                            <td>${s.firstName} ${s.lastName}</td>
                            <td><input type="number" class="grade-input" id="grade-score-${s.id}" min="0" max="100" value="0"></td>
                        </tr>
                    `,
                      )
                      .join("")}</tbody>
                </table>
            </div>
            <div class="flex-end gap-1 mt-1">
                <button class="btn-secondary" onclick="viewSectionStudents('${sectionId}', '${sectionName}')">Back</button>
                <button class="btn-primary" onclick="submitGrades('${sectionId}', '${currentTerm.id}')">Submit Grades</button>
            </div>
        </div>
    `;
}

async function submitGrades(sectionId, termId) {
  const subject = document.getElementById("grade-subject").value;
  if (!subject) return showToast("Subject name is required", "error");

  const inputs = document.querySelectorAll(".grade-input");
  const grades = Array.from(inputs).map((input) => ({
    studentId: input.id.replace("grade-score-", ""),
    score: parseInt(input.value) || 0,
  }));

  await apiFetch("/grades/bulk", {
    method: "POST",
    body: JSON.stringify({
      termId,
      subject,
      grades,
    }),
  });
  showToast("Grades submitted successfully");
  closeModal();
}

async function viewStudentSummary(studentId, name) {
  const summary = await apiFetch(`/attendance/student/${studentId}/summary`);
  const container = document.getElementById("modal-container");
  container.innerHTML = `
        <div class="modal">
            <h3>Summary for ${name}</h3>
            <div class="stats-grid mt-1">
                <div class="stat-card" style="border-color: var(--success)"><div class="stat-label">Present</div><div class="stat-value">${summary.present}</div></div>
                <div class="stat-card" style="border-color: var(--error)"><div class="stat-label">Absent</div><div class="stat-value">${summary.absent}</div></div>
            </div>
            <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
        </div>
    `;
}

async function renderTeacherStudents() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <h3>My Students (All Sections)</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Class</th><th>Section</th></tr></thead>
                    <tbody id="teacher-all-students-body"></tbody>
                </table>
            </div>
        </div>
    `;
  const students = await apiFetch("/teacher/students");
  document.getElementById("teacher-all-students-body").innerHTML =
    students
      .map(
        (s) => `
        <tr>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.currentClass || "-"}</td>
            <td>${s.currentSection || "-"}</td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No students found.</td></tr>';
}

// -- STUDENT PORTAL --
async function renderStudentProfile() {
  const container = document.getElementById("content-area");
  const me = await apiFetch("/student-portal/me");
  container.innerHTML = `
        <div class="card">
            <h3>My Academic Record</h3>
            <div class="stats-grid mt-1">
                <div class="stat-card">
                    <div class="stat-label">Full Name</div>
                    <div class="stat-value">${me.firstName} ${me.lastName}</div>
                </div>
                <div class="stat-card" style="border-color: var(--accent)">
                    <div class="stat-label">Student ID</div>
                    <div class="stat-value" style="font-size: 1.2rem">${me.studentId}</div>
                </div>
            </div>
            <div class="card mt-1">
                <p><strong>Email:</strong> ${me.email}</p>
                <p><strong>Phone:</strong> ${me.phoneNumber || "Not provided"}</p>
                <p><strong>DOB:</strong> ${new Date(me.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Interest:</strong> ${me.areaOfInterest}</p>
                <div class="mt-1">
                    <button class="btn-primary" onclick="promptReportCard('${me.id}')">View Current Report Card</button>
                </div>
            </div>
        </div>
    `;
}

async function renderStudentHistory() {
  const container = document.getElementById("content-area");
  const history = await apiFetch("/student-portal/enrollments");
  container.innerHTML = `
        <div class="card">
            <h3>Enrollment History</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Year</th><th>Class</th><th>Section</th><th>Date</th></tr></thead>
                    <tbody>${history
                      .map(
                        (h) => `
                        <tr>
                            <td>${h.academicYear?.year}</td>
                            <td>${h.classLevel?.name}</td>
                            <td>${h.section?.name || "-"}</td>
                            <td>${new Date(h.enrolledAt).toLocaleDateString()}</td>
                        </tr>
                    `,
                      )
                      .join("")}</tbody>
                </table>
            </div>
        </div>
    `;
}

// -- PARENT PORTAL --
async function viewChildDetail(studentId) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = `<div class="loading">Fetching child details...</div>`;

  try {
    const child = await apiFetch(`/parent/children/${studentId}`);
    // Assuming child object contains .enrollments based on backend logic
    const history = child.enrollments || [];

    container.innerHTML = `
            <div class="modal large">
                <h3>Child Profile: ${child.firstName} ${child.lastName}</h3>
                <div class="stats-grid mt-1">
                    <div class="stat-card">
                        <div class="stat-label">Student ID</div>
                        <div class="stat-value" style="font-size: 1.1rem">${child.studentId}</div>
                    </div>
                </div>
                <div class="card">
                    <p><strong>Email:</strong> ${child.email}</p>
                    <p><strong>Enrollment History:</strong></p>
                    <div class="table-container mt-1">
                        <table>
                            <thead><tr><th>Year</th><th>Class</th><th>Enrolled At</th></tr></thead>
                            <tbody>${history
                              .map(
                                (h) => `
                                <tr>
                                    <td>${h.academicYear?.year}</td>
                                    <td>${h.classLevel?.name}</td>
                                    <td>${new Date(h.enrolledAt).toLocaleDateString()}</td>
                                </tr>
                            `,
                              )
                              .join("")}</tbody>
                        </table>
                    </div>
                </div>
                <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
            </div>
        `;
  } catch (e) {
    container.innerHTML = `<div class="modal"><p class="error-msg">Error loading child details.</p><button class="btn-secondary mt-1" onclick="closeModal()">Close</button></div>`;
  }
}

async function renderStaff() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Staff Registry (Teachers)</h3>
                <button class="btn-primary" onclick="showCreateUserModal('teacher')">Add New Teacher</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
                    <tbody id="staff-body"></tbody>
                </table>
            </div>
        </div>
    `;
  const users = await apiFetch("/administration/users");
  const teachers = users.filter((u) => u.role === "teacher");
  document.getElementById("staff-body").innerHTML =
    teachers
      .map(
        (u) => `
        <tr>
            <td><small>${u.id}</small></td>
            <td>
                <strong>${u.email}</strong>
                ${!u.isActive ? '<span class="badge absent">INACTIVE</span>' : ""}
            </td>
            <td><span class="badge success">${u.role.toUpperCase()}</span></td>
            <td>
                <button class="btn-sm ${u.isActive ? "error" : "success"}" onclick="toggleUserStatus('${u.id}', ${u.isActive})">
                    ${u.isActive ? "Deactivate" : "Activate"}
                </button>
            </td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No teachers found.</td></tr>';
}

async function toggleUserStatus(userId, currentStatus) {
  const action = currentStatus ? "deactivate" : "activate";
  if (confirm(`Are you sure you want to ${action} this user?`)) {
    await apiFetch(`/administration/users/${userId}/${action}`, {
      method: "PATCH",
    });
    showToast(`User ${action}d`);
    renderView();
  }
}

async function renderParentRegistry() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Parent Registry</h3>
                <button class="btn-primary" onclick="showCreateUserModal('parent')">Add New Parent</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody id="parents-registry-body"></tbody>
                </table>
            </div>
        </div>
    `;
  const users = await apiFetch("/administration/users");
  const parents = users.filter((u) => u.role === "parent");
  document.getElementById("parents-registry-body").innerHTML =
    parents
      .map(
        (u) => `
        <tr>
            <td><small>${u.id}</small></td>
            <td>
                <strong>${u.email}</strong>
                ${!u.isActive ? '<span class="badge absent">INACTIVE</span>' : ""}
            </td>
            <td><span class="badge">${u.role.toUpperCase()}</span></td>
            <td>
                <button class="btn-sm ${u.isActive ? "error" : "success"}" onclick="toggleUserStatus('${u.id}', ${u.isActive})">
                    ${u.isActive ? "Deactivate" : "Activate"}
                </button>
            </td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No parents found.</td></tr>';
}

function showCreateUserModal(role) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = `
        <div class="modal">
            <h3>Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account</h3>
            <p class="small text-muted mb-1">A temporary password will be generated. The user must reset it on first login.</p>
            <div class="input-group">
                <label>Email Address</label>
                <input type="email" id="new-user-email" placeholder="email@school.com">
            </div>
            <div class="flex-end gap-1">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitCreateUser('${role}')">Create Account</button>
            </div>
        </div>
    `;
}

async function submitCreateUser(role) {
  const email = document.getElementById("new-user-email").value;
  if (!email) return showToast("Email is required", "error");

  try {
    await apiFetch("/administration/create-user", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
    showToast(`${role} account created successfully`);
    closeModal();
    renderView();
  } catch (e) {}
}

async function renderParentPortal() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Linked Children</h3>
                <button class="btn-primary" onclick="showLinkChildModal()">Link New Child</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Student ID</th><th>Class</th><th>Details</th><th>Actions</th></tr></thead>
                    <tbody id="parent-children-body"></tbody>
                </table>
            </div>
        </div>
    `;
  const children = await apiFetch("/parent/children");
  document.getElementById("parent-children-body").innerHTML =
    children
      .map(
        (c) => `
        <tr>
            <td>${c.firstName} ${c.lastName}</td>
            <td>${c.studentId}</td>
            <td>${c.currentClass || "-"}</td>
            <td><button class="btn-sm" onclick="promptReportCard('${c.id}')">Report Card</button></td>
            <td><button class="btn-sm error" onclick="unlinkChild('${c.id}')">Unlink</button></td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="5" class="text-center">No children linked yet.</td></tr>';
}

async function showLinkChildModal() {
  const studentId = prompt("Enter Child's Student UUID:");
  const relationship = prompt("Relationship (e.g. father, mother):");
  if (studentId && relationship) {
    await apiFetch("/parent/children", {
      method: "POST",
      body: JSON.stringify({ studentId, relationship }),
    });
    showToast("Child linked successfully");
    renderParentPortal();
  }
}

async function unlinkChild(id) {
  if (confirm("Unlink this child from your account?")) {
    await apiFetch(`/parent/children/${id}`, { method: "DELETE" });
    showToast("Unlinked");
    renderParentPortal();
  }
}

// -- MISC & INIT --
async function renderPromotions() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <h3>Bulk Promotions</h3>
            <p class="text-muted mb-1">Promote eligible students to the next class level in bulk.</p>
            <div class="table-container">
                <table>
                    <thead><tr><th>Class Level</th><th>Sections</th><th>Action</th></tr></thead>
                    <tbody id="promotions-body"></tbody>
                </table>
            </div>
        </div>
    `;

  try {
    const classes = await apiFetch("/classes/levels");
    document.getElementById("promotions-body").innerHTML =
      classes
        .map(
          (c) => `
            <tr>
                <td>${c.name}</td>
                <td>${c.sections?.length || 0}</td>
                <td><button class="btn-sm" onclick="showToast('Promotion logic is executed via the backend promotion engine.')">Promote All</button></td>
            </tr>
        `,
        )
        .join("") ||
      '<tr><td colspan="3" class="text-center">No classes defined</td></tr>';
  } catch (e) {}
}

async function promptReportCard(studentId) {
  try {
    const activeYear = await apiFetch("/academic-years/active");
    const terms = await apiFetch(
      `/academic-terms?academicYearId=${activeYear.id}`,
    );
    const currentTerm = terms.find((t) => t.isCurrent);
    if (!currentTerm)
      return showToast("No current academic term set!", "error");
    renderReportCard(studentId, currentTerm.id);
  } catch (e) {
    showToast("Error generating report card", "error");
  }
}

async function renderReportCard(studentId, termId) {
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = `
        <div class="modal report-card large">
            <div class="text-center"><div class="loading">Generating Report Card...</div></div>
        </div>
    `;

  try {
    const rc = await apiFetch(
      `/grades/report-card/${studentId}/term/${termId}`,
    );
    container.innerHTML = `
            <div class="modal report-card large">
                <div class="report-card-header">
                    <h2>Student Report Card</h2>
                    <h3>${rc.academicTerm.name}</h3>
                </div>
                <div class="report-card-grid">
                    <div class="report-card-field"><strong>Student Name:</strong> ${rc.student.firstName} ${rc.student.lastName}</div>
                    <div class="report-card-field"><strong>Student ID:</strong> ${rc.student.studentId}</div>
                </div>
                
                <h4 class="mt-1 mb-05">Academic Performance</h4>
                <div class="table-container grade-table">
                    <table>
                        <thead><tr><th>Subject</th><th>Score</th><th>Remark</th></tr></thead>
                        <tbody>
                            ${
                              rc.grades
                                .map(
                                  (g) => `
                                <tr>
                                    <td>${g.subject}</td>
                                    <td>${g.score}</td>
                                    <td class="remark-${g.remark.toLowerCase()}">${g.remark}</td>
                                </tr>
                            `,
                                )
                                .join("") ||
                              '<tr><td colspan="3" class="text-center">No grades recorded for this term.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
                
                <div class="flex-between mt-1 pt-1" style="border-top: 2px solid var(--border);">
                    <div><strong>Average Score:</strong> ${rc.average.toFixed(2)}</div>
                    <div><strong>Overall Remark:</strong> <span class="remark-${rc.overallRemark.toLowerCase()}">${rc.overallRemark}</span></div>
                </div>
                
                <div class="flex-end gap-1 mt-1 no-print">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" onclick="window.print()">Print Report Card</button>
                </div>
            </div>
        `;
  } catch (e) {
    container.innerHTML = `
            <div class="modal">
                <h3 class="error">Error</h3>
                <p>Could not generate report card. Ensure the term exists and grades are submitted.</p>
                <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
            </div>
        `;
  }
}

// -- FEES MANAGEMENT --
async function renderFeesAdmin() {
  const container = document.getElementById("content-area");
  container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>System Fees</h3>
                <button class="btn-primary" onclick="showCreateFeeModal()">Create New Fee</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Amount</th><th>Category</th><th>Term</th></tr></thead>
                    <tbody id="fees-admin-body"></tbody>
                </table>
            </div>
        </div>
        <div class="card">
            <h3>Record Payment</h3>
            <div class="flex-column gap-1">
                <div class="input-group">
                    <label>Student UUID</label>
                    <input type="text" id="pay-student-id" placeholder="Paste Student UUID...">
                </div>
                <div class="flex-end">
                    <button class="btn-primary" onclick="showRecordPaymentModal()">Next: Payment Details</button>
                </div>
            </div>
        </div>
    `;
  const fees = await apiFetch("/fees");
  document.getElementById("fees-admin-body").innerHTML =
    fees
      .map(
        (f) => `
        <tr>
            <td>${f.name}</td>
            <td>$${f.amount}</td>
            <td><span class="badge">${f.category}</span></td>
            <td>${f.academicTerm?.name || "-"}</td>
        </tr>
    `,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center">No fees defined</td></tr>';
}

async function showCreateFeeModal() {
  const activeYear = await apiFetch("/academic-years/active");
  const terms = await apiFetch(
    `/academic-terms?academicYearId=${activeYear.id}`,
  );

  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = `
        <div class="modal">
            <h3>Create New Fee</h3>
            <div class="input-group"><label>Fee Name</label><input type="text" id="new-fee-name" placeholder="e.g. Tuition Fee Q1"></div>
            <div class="input-group"><label>Amount</label><input type="number" id="new-fee-amount" placeholder="0.00"></div>
            <div class="input-group"><label>Category</label><select id="new-fee-cat"><option value="tuition">Tuition</option><option value="registration">Registration</option><option value="other">Other</option></select></div>
            <div class="input-group"><label>Target Term</label><select id="new-fee-term">${terms.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
            <div class="flex-end gap-1">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitCreateFee()">Create Fee</button>
            </div>
        </div>
    `;
}

async function submitCreateFee() {
  const payload = {
    name: document.getElementById("new-fee-name").value,
    amount: parseFloat(document.getElementById("new-fee-amount").value),
    category: document.getElementById("new-fee-cat").value,
    academicTermId: document.getElementById("new-fee-term").value,
  };
  await apiFetch("/fees", { method: "POST", body: JSON.stringify(payload) });
  showToast("Fee created successfully");
  closeModal();
  renderFeesAdmin();
}

async function showRecordPaymentModal() {
  const studentId = document.getElementById("pay-student-id").value;
  if (!studentId) return showToast("Please enter Student UUID", "error");

  const balance = await apiFetch(`/fees/student/${studentId}/balance`);
  const container = document.getElementById("modal-container");
  container.classList.remove("hidden");
  container.innerHTML = `
        <div class="modal">
            <h3>Record Payment</h3>
            <div class="stat-card fee-card mb-1">
                <div class="stat-label">Total Outstanding Balance</div>
                <div class="balance-value">$${balance.balance}</div>
            </div>
            <div class="input-group"><label>Payment Amount</label><input type="number" id="pay-amount" value="${balance.balance}"></div>
            <div class="input-group"><label>Reference/Note</label><input type="text" id="pay-note" placeholder="Receipt # or Check info"></div>
            <div class="flex-end gap-1">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitRecordPayment('${studentId}')">Confirm Payment</button>
            </div>
        </div>
    `;
}

async function submitRecordPayment(studentId) {
  const payload = {
    amount: parseFloat(document.getElementById("pay-amount").value),
    reference: document.getElementById("pay-note").value,
  };
  await apiFetch(`/fees/student/${studentId}/pay`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  showToast("Payment recorded!");
  closeModal();
  renderFeesAdmin();
}

async function renderStudentFees() {
  const container = document.getElementById("content-area");
  const me = await apiFetch("/student-portal/me");
  const balance = await apiFetch(`/fees/student/${me.id}/balance`);

  container.innerHTML = `
        <div class="card">
            <h3>My Fee Status</h3>
            <div class="stats-grid mt-1">
                <div class="stat-card fee-card"><div class="stat-label">Total Balance Due</div><div class="balance-value">$${balance.balance}</div></div>
                <div class="stat-card" style="border-color: var(--success)"><div class="stat-label">Total Paid</div><div class="stat-value">$${balance.totalPaid}</div></div>
            </div>
            <div class="card mt-1">
                <h4>Payment History</h4>
                <p>Contact the accounting office for detailed transaction history.</p>
            </div>
        </div>
    `;
}

async function renderParentFees() {
  const container = document.getElementById("content-area");
  container.innerHTML = `<div class="card"><h3>Children Fee Balances</h3><div id="parent-fees-list" class="flex-column gap-1 mt-1"></div></div>`;

  const children = await apiFetch("/parent/children");
  const list = document.getElementById("parent-fees-list");

  for (const c of children) {
    const balance = await apiFetch(`/fees/student/${c.id}/balance`);
    list.innerHTML += `
            <div class="stat-card flex-between">
                <div>
                    <div class="stat-label">${c.firstName} ${c.lastName}</div>
                    <div class="balance-value" style="font-size: 1.25rem">$${balance.balance}</div>
                </div>
                <div class="text-right">
                    <span class="badge ${balance.balance <= 0 ? "success" : "late"}">${balance.balance <= 0 ? "PAID" : "PENDING"}</span>
                </div>
            </div>
        `;
  }
}
function closeModal() {
  document.getElementById("modal-container").classList.add("hidden");
}
function initModules() {
  const role = state.user.role;
  // Hide ALL nav items by default
  document
    .querySelectorAll(".nav-item[data-role], .nav-group[data-role]")
    .forEach((el) => {
      const roles = el.dataset.role.split(",");
      if (roles.includes(role)) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });

  switchView("dashboard");
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.onclick = (e) => {
      if (!item.classList.contains("logout")) {
        e.preventDefault();
        switchView(item.dataset.view);
      }
    };
  });
  loadActiveTerm();
}

async function loadActiveTerm() {
  try {
    const activeYear = await apiFetch("/academic-years/active");
    const terms = await apiFetch(
      `/academic-terms?academicYearId=${activeYear.id}`,
    );
    const currentTerm = terms.find((t) => t.isCurrent);
    document.getElementById("active-term-display").textContent = currentTerm
      ? `Term: ${currentTerm.name}`
      : "Term: Not Set";
  } catch (e) {
    document.getElementById("active-term-display").textContent = "Term: N/A";
  }
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logout;

if (state.token) {
  document.getElementById("login-overlay").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  const payload = JSON.parse(atob(state.token.split(".")[1]));
  state.user = payload;
  document.getElementById("user-email").textContent = payload.email;
  document.getElementById("user-avatar").textContent =
    payload.email[0].toUpperCase();
  initModules();
}
