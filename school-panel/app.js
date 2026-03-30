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
    }
}

function renderDashboard() {
    document.getElementById('content-area').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Welcome</div>
                <div class="stat-value">Admin Dashboard</div>
                <div class="stat-label">Manage your school parameters here.</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Status</div>
                <div class="stat-value">Connected</div>
                <div class="stat-label">Ready to test school APIs</div>
            </div>
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
    container.innerHTML = `<div class="modal"><h3>Sections</h3><ul>${sections.map(s => `<li>${s.name} (Cap: ${s.capacity})</li>`).join('')}</ul><button class="btn-secondary mt-1" onclick="closeModal()">Close</button></div>`;
}

async function addSection(classId) {
    const name = prompt("Name:");
    if (name) { await apiFetch(`/classes/${classId}/sections`, { method: 'POST', body: JSON.stringify({ name, capacity: 40 }) }); showToast('Added'); }
}

// -- MISC & INIT --
function renderPromotions() { document.getElementById('content-area').innerHTML = `<div class="card"><h3>Bulk Promotions</h3><p>Promotion logic is managed in the backend service.</p></div>`; }
function closeModal() { document.getElementById('modal-container').classList.add('hidden'); }
function initModules() {
    switchView('dashboard');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => { if (!item.classList.contains('logout')) { e.preventDefault(); switchView(item.dataset.view); } };
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
