const API_BASE = 'http://localhost:3000';

const state = {
    user: null,
    token: localStorage.getItem('school_token'),
    currentView: 'dashboard',
    academicYears: [],
    classes: [],
    activeYear: null,
};

// --- API HELPERS ---
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status === 401) logout();
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        document.querySelectorAll('.loading').forEach(el => el.innerHTML = `<div class="error-msg">${err.message}</div>`);
        throw err;
    }
}

// --- AUTH ---
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await apiFetch('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        state.token = res.accessToken;
        localStorage.setItem('school_token', res.accessToken);
        
        const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
        state.user = payload;
        
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-email').textContent = payload.email;
        document.getElementById('user-avatar').textContent = payload.email[0].toUpperCase();
        
        showToast('Successfully logged in!', 'success');
        initModules();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('school_token');
    window.location.reload();
}

// --- UI HELPERS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'error' ? '❌' : '✅'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function switchView(view) {
    state.currentView = view;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    document.getElementById('view-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
    renderView();
}

async function renderView() {
    const area = document.getElementById('content-area');
    area.innerHTML = '<div class="loading">Loading...</div>';

    switch (state.currentView) {
        case 'dashboard': renderDashboard(); break;
        case 'admissions': renderAdmissions(); break;
        case 'applications': renderOpenApplications(); break;
        case 'academic': renderAcademicYears(); break;
        case 'curriculum': renderCurriculum(); break;
        case 'students': renderStudents(); break;
        case 'promotions': renderPromotions(); break;
        case 'teacher-sections': renderTeacherSections(); break;
        case 'teacher-students': renderTeacherStudents(); break;
        case 'student-profile': renderStudentProfile(); break;
        case 'student-history': renderStudentHistory(); break;
        case 'parent-children': renderParentPortal(); break;
    }
}

function renderDashboard() {
    const role = state.user?.role?.toUpperCase() || 'USER';
    document.getElementById('content-area').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Welcome back,</div>
                <div class="stat-value">${role} Portal</div>
                <div class="stat-label">SchoolSync Pro v1.0</div>
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
    const container = document.getElementById('content-area');
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
    const years = await apiFetch('/admissions/years');
    const body = document.getElementById('admission-years-body');
    body.innerHTML = years.map(y => `
        <tr>
            <td>${y.year}</td>
            <td><span class="badge ${y.isOpen ? 'success' : 'muted'}">${y.isOpen ? 'OPEN' : 'CLOSED'}</span></td>
            <td>
                <button class="btn-sm" onclick="toggleAdmissionYear('${y.id}', ${y.isOpen})">${y.isOpen ? 'Close' : 'Open'}</button>
                <button class="btn-sm" onclick="viewApplications('${y.id}')">Applications</button>
            </td>
        </tr>
    `).join('');
}

async function toggleAdmissionYear(id, isOpen) {
    const action = isOpen ? 'close' : 'open';
    await apiFetch(`/admissions/years/${id}/${action}`, { method: 'PATCH' });
    showToast(`Admission year ${action}ed`);
    loadAdmissionYears();
}

async function createAdmissionYear() {
    const year = prompt("Enter Admission Year (e.g., 2025/2026):");
    if (!year) return;
    await apiFetch('/admissions/years', { method: 'POST', body: JSON.stringify({ year }) });
    loadAdmissionYears();
}

async function renderOpenApplications() {
    const container = document.getElementById('content-area');
    container.innerHTML = '<div class="loading">Finding open admission year...</div>';
    try {
        const openYear = await apiFetch('/admissions/current');
        if (!openYear) {
            container.innerHTML = `<div class="card"><h3>No Open Admission</h3><p>Please open an admission year first.</p></div>`;
            return;
        }
        renderApplications(openYear.id);
    } catch (e) {}
}

async function viewApplications(yearId) {
    state.currentView = 'applications';
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('view-title').textContent = 'Applications';
    renderApplications(yearId);
}

async function renderApplications(yearId) {
    const container = document.getElementById('content-area');
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
    const body = document.getElementById('applications-body');
    body.innerHTML = apps.map(a => {
        const fullName = `${a.firstName} ${a.middleName ? a.middleName + ' ' : ''}${a.lastName}`;
        const date = new Date(a.submittedAt).toLocaleDateString();
        return `
            <tr>
                <td><strong>${fullName}</strong><br><small>${a.email}</small></td>
                <td>${a.admissionYear?.year || yearId}</td>
                <td>${a.areaOfInterest}</td>
                <td><span class="badge ${a.status.toLowerCase()}">${a.status.toUpperCase()}</span></td>
                <td>
                    ${a.status === 'pending' ? `
                        <button class="btn-sm success" onclick="updateAppStatus('${a.id}', 'accepted', '${yearId}')">Accept</button>
                        <button class="btn-sm error" onclick="updateAppStatus('${a.id}', 'rejected', '${yearId}')">Reject</button>
                    ` : a.status === 'accepted' ? `<button class="btn-sm success" onclick="showEnrollModal('${a.id}')">Enroll</button>` : `<span>${a.status.toUpperCase()} ${date}</span>`}
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5" class="text-center">No applications found.</td></tr>';
}

async function updateAppStatus(id, status, yearId) {
    await apiFetch(`/admissions/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    showToast(`Application ${status}`);
    renderApplications(yearId);
}

// -- ENROLLMENT --
async function showEnrollModal(applicantId) {
    const container = document.getElementById('modal-container');
    container.innerHTML = `<div class="loading">Preparing enrollment...</div>`;
    container.classList.remove('hidden');
    try {
        const [years, classes, applicant] = await Promise.all([
            apiFetch('/academic-years'),
            apiFetch('/classes'),
            apiFetch(`/admissions/applications/${applicantId}`)
        ]);
        container.innerHTML = `
            <div class="modal">
                <h3>Enroll ${applicant.firstName}</h3>
                <div class="input-group"><label>Academic Year</label><select id="enroll-year">${years.map(y => `<option value="${y.id}">${y.year}</option>`).join('')}</select></div>
                <div class="input-group"><label>Class Level</label><select id="enroll-class" onchange="loadSectionsForEnroll(this.value)"><option>Select Class</option>${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
                <div class="input-group"><label>Section</label><select id="enroll-section"><option value="">No Section</option></select></div>
                <div class="flex-end gap-1"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="submitEnrollment('${applicantId}')">Enroll Now</button></div>
            </div>
        `;
    } catch (e) { closeModal(); }
}

async function loadSectionsForEnroll(classId) {
    const sections = await apiFetch(`/classes/${classId}/sections`);
    document.getElementById('enroll-section').innerHTML = '<option value="">No Section</option>' + sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function submitEnrollment(applicantId) {
    const payload = { applicantId, academicYearId: document.getElementById('enroll-year').value, classLevelId: document.getElementById('enroll-class').value, sectionId: document.getElementById('enroll-section').value || null };
    await apiFetch('/students/enroll', { method: 'POST', body: JSON.stringify(payload) });
    showToast('Enrollment complete');
    closeModal();
    renderView();
}

// -- STUDENTS --
async function renderStudents() {
    const container = document.getElementById('content-area');
    container.innerHTML = `<div class="card"><div class="flex-between"><h3>Student Registry</h3><button class="btn-primary" onclick="showEnrollModal()">Direct Enrollment</button></div><div class="table-container mt-1"><table><thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead><tbody id="student-body"></tbody></table></div></div>`;
    loadStudents();
}

async function loadStudents() {
    const students = await apiFetch('/students');
    document.getElementById('student-body').innerHTML = students.map(s => `<tr><td>${s.firstName} ${s.lastName}</td><td>${s.email || '-'}</td><td><button class="btn-sm" onclick="viewStudentEnrollments('${s.id}')">History</button></td></tr>`).join('');
}

async function viewStudentEnrollments(studentId) {
    const container = document.getElementById('modal-container');
    container.classList.remove('hidden');
    const history = await apiFetch(`/students/${studentId}/enrollments`);
    container.innerHTML = `<div class="modal"><h3>History</h3><div class="table-container"><table><thead><tr><th>Year</th><th>Class</th></tr></thead><tbody>${history.map(h => `<tr><td>${h.academicYear?.year}</td><td>${h.classLevel?.name}</td></tr>`).join('')}</tbody></table></div><button class="btn-secondary mt-1" onclick="closeModal()">Close</button></div>`;
}

// -- ACADEMIC YEARS --
function renderAcademicYears() {
    document.getElementById('content-area').innerHTML = `<div class="card"><div class="flex-between"><h3>Academic Cycles</h3><button class="btn-primary" onclick="createAcademicYear()">Create</button></div><div class="table-container mt-1"><table><thead><tr><th>Year</th><th>Status</th><th>Action</th></tr></thead><tbody id="academic-years-body"></tbody></table></div></div>`;
    loadAcademicYears();
}

async function loadAcademicYears() {
    const list = await apiFetch('/academic-years');
    document.getElementById('academic-years-body').innerHTML = list.map(y => `<tr><td>${y.year}</td><td><span class="badge ${y.isActive ? 'success' : 'muted'}">${y.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td><td>${!y.isActive ? `<button class="btn-sm" onclick="activateAcademicYear('${y.id}')">Activate</button>` : ''}</td></tr>`).join('');
}

async function createAcademicYear() {
    const year = prompt("Year (e.g. 24/25):");
    if (year) { await apiFetch('/academic-years', { method: 'POST', body: JSON.stringify({ year }) }); loadAcademicYears(); }
}

async function activateAcademicYear(id) {
    await apiFetch(`/academic-years/${id}/activate`, { method: 'PATCH' });
    loadAcademicYears();
}

// -- CURRICULUM --
function renderCurriculum() {
    document.getElementById('content-area').innerHTML = `<div class="card"><div class="flex-between"><h3>Classes</h3><div class="gap-1"><button class="btn-secondary" onclick="seedClasses()">Seed</button><button class="btn-primary" onclick="createClass()">New</button></div></div><div class="table-container mt-1"><table><thead><tr><th>Name</th><th>Sections</th></tr></thead><tbody id="classes-body"></tbody></table></div></div>`;
    loadClasses();
}

async function loadClasses() {
    const classes = await apiFetch('/classes');
    document.getElementById('classes-body').innerHTML = classes.map(c => `<tr><td>${c.name}</td><td><button class="btn-sm" onclick="addSection('${c.id}')">+ Section</button> <button class="btn-sm" onclick="viewSections('${c.id}')">View</button></td></tr>`).join('');
}

async function seedClasses() { await apiFetch('/classes/seed', { method: 'POST' }); loadClasses(); }

async function createClass() {
    const name = prompt("Name:");
    const level = parseInt(prompt("Level (1-12):"));
    if (name && level) { await apiFetch('/classes', { method: 'POST', body: JSON.stringify({ name, level }) }); loadClasses(); }
}

async function viewSections(classId) {
    const container = document.getElementById('modal-container');
    container.classList.remove('hidden');
    const sections = await apiFetch(`/classes/${classId}/sections`);
    container.innerHTML = `
        <div class="modal large">
            <h3>Sections for Class</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Section</th><th>Capacity</th><th>Teacher</th><th>Actions</th></tr></thead>
                    <tbody>${sections.map(s => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.capacity}</td>
                            <td><small id="teacher-name-${s.id}">Loading...</small></td>
                            <td>
                                <button class="btn-sm" onclick="showAssignTeacherModal('${s.id}')">Assign Teacher</button>
                            </td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>
            <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
        </div>
    `;
    // Load existing teachers for these sections
    sections.forEach(async s => {
        try {
            const teachers = await apiFetch(`/administration/sections/${s.id}/teachers`);
            document.getElementById(`teacher-name-${s.id}`).textContent = teachers.map(t => t.email.split('@')[0]).join(', ') || 'Unassigned';
        } catch (e) {
            document.getElementById(`teacher-name-${s.id}`).textContent = 'Error';
        }
    });
}

async function showAssignTeacherModal(sectionId) {
    const container = document.getElementById('modal-container');
    // We reuse the modal but show a nested one or replace
    const users = await apiFetch('/administration/users');
    const teachers = users.filter(u => u.role === 'teacher');

    const subModal = document.createElement('div');
    subModal.className = 'overlay';
    subModal.innerHTML = `
        <div class="modal">
            <h3>Assign Teacher</h3>
            <div class="input-group">
                <label>Select Teacher</label>
                <select id="assign-teacher-id">
                    ${teachers.map(t => `<option value="${t.id}">${t.email}</option>`).join('')}
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
    const teacherUserId = document.getElementById('assign-teacher-id').value;
    await apiFetch(`/administration/teachers/${teacherUserId}/sections`, {
        method: 'POST',
        body: JSON.stringify({ sectionId })
    });
    showToast('Teacher assigned successfully');
    closeModal();
}

async function addSection(classId) {
    const name = prompt("Name:");
    if (name) { 
        const activeYear = await apiFetch('/academic-years/active');
        if (!activeYear) return showToast('No active academic year set', 'error');
        await apiFetch(`/classes/${classId}/sections`, { method: 'POST', body: JSON.stringify({ name, capacity: 40, academicYearId: activeYear.id }) }); 
        showToast('Added'); 
    }
}

// -- TEACHER PORTAL --
async function renderTeacherSections() {
    const container = document.getElementById('content-area');
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
    const sections = await apiFetch('/teacher/sections');
    document.getElementById('teacher-sections-body').innerHTML = sections.map(s => `
        <tr>
            <td>${s.classLevel?.name}</td>
            <td>${s.name}</td>
            <td>${s.capacity}</td>
            <td><button class="btn-sm" onclick="viewSectionStudents('${s.id}', '${s.name}')">View Students</button></td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">No assignments found.</td></tr>';
}

async function viewSectionStudents(sectionId, sectionName) {
    const container = document.getElementById('modal-container');
    container.classList.remove('hidden');
    const students = await apiFetch(`/teacher/sections/${sectionId}/students`);
    container.innerHTML = `
        <div class="modal large">
            <h3>Students in Section ${sectionName}</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>${students.map(s => `
                        <tr>
                            <td>${s.firstName} ${s.lastName}</td>
                            <td>${s.email || '-'}</td>
                            <td><button class="btn-sm" onclick="showToast('Grade management coming soon...')">Manage</button></td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>
            <button class="btn-secondary mt-1" onclick="closeModal()">Close</button>
        </div>
    `;
}

async function renderTeacherStudents() {
    const container = document.getElementById('content-area');
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
    const students = await apiFetch('/teacher/students');
    document.getElementById('teacher-all-students-body').innerHTML = students.map(s => `
        <tr>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.email}</td>
            <td>${s.currentClass || '-'}</td>
            <td>${s.currentSection || '-'}</td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">No students found.</td></tr>';
}

// -- STUDENT PORTAL --
async function renderStudentProfile() {
    const container = document.getElementById('content-area');
    const me = await apiFetch('/student-portal/me');
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
            <div class="card">
                <p><strong>Email:</strong> ${me.email}</p>
                <p><strong>Phone:</strong> ${me.phoneNumber || 'Not provided'}</p>
                <p><strong>DOB:</strong> ${new Date(me.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Interest:</strong> ${me.areaOfInterest}</p>
            </div>
        </div>
    `;
}

async function renderStudentHistory() {
    const container = document.getElementById('content-area');
    const history = await apiFetch('/student-portal/enrollments');
    container.innerHTML = `
        <div class="card">
            <h3>Enrollment History</h3>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Year</th><th>Class</th><th>Section</th><th>Date</th></tr></thead>
                    <tbody>${history.map(h => `
                        <tr>
                            <td>${h.academicYear?.year}</td>
                            <td>${h.classLevel?.name}</td>
                            <td>${h.section?.name || '-'}</td>
                            <td>${new Date(h.enrolledAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            </div>
        </div>
    `;
}

// -- PARENT PORTAL --
async function viewChildDetail(studentId) {
    const container = document.getElementById('modal-container');
    container.classList.remove('hidden');
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
                            <tbody>${history.map(h => `
                                <tr>
                                    <td>${h.academicYear?.year}</td>
                                    <td>${h.classLevel?.name}</td>
                                    <td>${new Date(h.enrolledAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}</tbody>
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

async function renderParentPortal() {
    const container = document.getElementById('content-area');
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
    const children = await apiFetch('/parent/children');
    document.getElementById('parent-children-body').innerHTML = children.map(c => `
        <tr>
            <td>${c.firstName} ${c.lastName}</td>
            <td>${c.studentId}</td>
            <td>${c.currentClass || '-'}</td>
            <td><button class="btn-sm" onclick="viewChildDetail('${c.id}')">Performance</button></td>
            <td><button class="btn-sm error" onclick="unlinkChild('${c.id}')">Unlink</button></td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="text-center">No children linked yet.</td></tr>';
}

async function showLinkChildModal() {
    const studentId = prompt("Enter Child's Student UUID:");
    const relationship = prompt("Relationship (e.g. father, mother):");
    if (studentId && relationship) {
        await apiFetch('/parent/children', {
            method: 'POST',
            body: JSON.stringify({ studentId, relationship })
        });
        showToast('Child linked successfully');
        renderParentPortal();
    }
}

async function unlinkChild(id) {
    if (confirm('Unlink this child from your account?')) {
        await apiFetch(`/parent/children/${id}`, { method: 'DELETE' });
        showToast('Unlinked');
        renderParentPortal();
    }
}

// -- MISC & INIT --
function renderPromotions() { document.getElementById('content-area').innerHTML = `<div class="card"><h3>Bulk Promotions</h3><p>Promotion logic is managed in the backend service.</p></div>`; }
function closeModal() { document.getElementById('modal-container').classList.add('hidden'); }
function initModules() {
    const role = state.user.role;
    // Hide ALL nav items by default
    document.querySelectorAll('.nav-item[data-role], .nav-group[data-role]').forEach(el => {
        const roles = el.dataset.role.split(',');
        if (roles.includes(role)) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    switchView('dashboard');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => { 
            if (!item.classList.contains('logout')) { 
                e.preventDefault(); 
                switchView(item.dataset.view); 
            } 
        };
    });
}

document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logout;

if (state.token) {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    const payload = JSON.parse(atob(state.token.split('.')[1]));
    state.user = payload;
    document.getElementById('user-email').textContent = payload.email;
    document.getElementById('user-avatar').textContent = payload.email[0].toUpperCase();
    initModules();
}
