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

// --- MODULES ---
async function renderView() {
    const area = document.getElementById('content-area');
    area.innerHTML = '<div class="loading">Loading...</div>';

    switch (state.currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'admissions':
            renderAdmissions();
            break;
        case 'applications':
            renderOpenApplications();
            break;
        case 'academic':
            renderAcademicYears();
            break;
        case 'curriculum':
            renderCurriculum();
            break;
        case 'students':
            renderStudents();
            break;
        case 'promotions':
            renderPromotions();
            break;
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
        <div class="card">
            <h3>System Status</h3>
            <p>This dashboard is configured to test endpoints proxied to the <strong>School Service</strong>.</p>
            <br>
            <p>Ensure your gateway is running on <code>:3000</code>.</p>
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
            <p class="text-muted">Test the public /admissions/apply endpoint without authenticating.</p>
        </div>

        <div class="card">
            <div class="flex-between">
                <h3>Admission Years</h3>
                <button class="btn-primary" id="btn-create-year">Create New Year</button>
            </div>
            <div class="table-container mt-1">
                <table id="admission-years-table">
                    <thead>
                        <tr><th>Year</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody id="admission-years-body"></tbody>
                </table>
            </div>
        </div>
    `;

    loadAdmissionYears();
    document.getElementById('btn-create-year').onclick = createAdmissionYear;
}

async function loadAdmissionYears() {
    try {
        const years = await apiFetch('/admissions/years');
        const body = document.getElementById('admission-years-body');
        body.innerHTML = years.map(y => `
            <tr>
                <td>${y.year}</td>
                <td><span class="badge ${y.isOpen ? 'success' : 'muted'}">${y.isOpen ? 'OPEN' : 'CLOSED'}</span></td>
                <td>
                    <button class="btn-sm" onclick="toggleAdmissionYear('${y.id}', ${y.isOpen})">
                        ${y.isOpen ? 'Close' : 'Open'}
                    </button>
                    <button class="btn-sm" onclick="viewApplications('${y.id}')">Applications</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {}
}

async function createAdmissionYear() {
    const year = prompt("Enter Admission Year (e.g., 2025/2026):");
    if (!year) return;
    try {
        await apiFetch('/admissions/years', {
            method: 'POST',
            body: JSON.stringify({ year })
        });
        showToast('Admission year created');
        loadAdmissionYears();
    } catch (e) {}
}

async function toggleAdmissionYear(id, isOpen) {
    const action = isOpen ? 'close' : 'open';
    try {
        await apiFetch(`/admissions/years/${id}/${action}`, { method: 'PATCH' });
        showToast(`Admission year ${action}ed`);
        loadAdmissionYears();
    } catch (e) {}
}

async function renderOpenApplications() {
    const container = document.getElementById('content-area');
    container.innerHTML = '<div class="loading">Finding open admission year...</div>';
    
    try {
        const openYear = await apiFetch('/admissions/current');
        if (!openYear) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Open Admission</h3>
                    <p>There is currently no open admission year. Please open one in the Admission Years tab.</p>
                </div>
            `;
            return;
        }
        renderApplications(openYear.id);
    } catch (e) {
        container.innerHTML = '<div class="error-msg">Failed to load open admission year.</div>';
    }
}

async function viewApplications(yearId) {
    state.currentView = 'applications';
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('view-title').textContent = 'Applications';
    renderApplications(yearId);
}

async function renderApplications(yearId = null) {
    const container = document.getElementById('content-area');
    container.innerHTML = `
        <div class="card">
            <h3>${yearId ? 'Year Applications' : 'All Applications'}</h3>
            <div class="table-container mt-1">
                <table>
                    <thead>
                        <tr><th>Applicant</th><th>Year</th><th>Interest</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody id="applications-body"></tbody>
                </table>
            </div>
        </div>
    `;
    loadApplications(yearId);
}

async function loadApplications(yearId) {
    if (!yearId) return;
    try {
        const apps = await apiFetch(`/admissions/years/${yearId}/applications`);
        const body = document.getElementById('applications-body');
        body.innerHTML = apps.map(a => {
            const fullName = `${a.firstName} ${a.middleName ? a.middleName + ' ' : ''}${a.lastName}`;
            const date = new Date(a.submittedAt).toLocaleDateString();
            const yearStr = a.admissionYear?.year || yearId;
            
            return `
                <tr>
                    <td>
                        <div class="applicant-info">
                            <strong>${fullName}</strong>
                            <span>${a.email}</span>
                            <small>${a.phoneNumber}</small>
                        </div>
                    </td>
                    <td>${yearStr}</td>
                    <td>${a.areaOfInterest}</td>
                    <td><span class="badge ${a.status.toLowerCase()}">${a.status.toUpperCase()}</span></td>
                    <td>
                        <div class="actions-cell">
                            ${a.status === 'pending' ? `
                                <button class="btn-sm success" onclick="updateAppStatus('${a.id}', 'accepted', '${yearId}')">Accept</button>
                                <button class="btn-sm error" onclick="updateAppStatus('${a.id}', 'rejected', '${yearId}')">Reject</button>
                            ` : `<span>Processed ${date}</span>`}
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" class="text-center">No applications found.</td></tr>';
    } catch (e) {}
}

async function updateAppStatus(id, status, yearId) {
    try {
        await apiFetch(`/admissions/applications/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        showToast(`Application ${status}`);
        renderApplications(yearId); // refreshed
    } catch (e) {}
}

function showPublicApplyModal() {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
        <div class="modal">
            <h3>Apply for Admission (Public)</h3>
            <br>
            <div class="input-group">
                <label>First Name</label>
                <input id="app-fname" value="Kofi">
            </div>
            <div class="input-group">
                <label>Last Name</label>
                <input id="app-lname" value="Mensah">
            </div>
            <div class="input-group">
                <label>Email</label>
                <input id="app-email" value="kofi@test.com">
            </div>
            <div class="input-group">
                <label>Area of Interest</label>
                <select id="app-interest">
                    <option>Sciences</option><option>Arts</option><option>Business</option>
                </select>
            </div>
            <div class="flex-end gap-1">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitPublicApply()">Submit Application</button>
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

async function submitPublicApply() {
    const payload = {
        firstName: document.getElementById('app-fname').value,
        lastName: document.getElementById('app-lname').value,
        email: document.getElementById('app-email').value,
        areaOfInterest: document.getElementById('app-interest').value,
        phoneNumber: "+233000000000",
        dateOfBirth: "2010-01-01"
    };
    try {
        await apiFetch('/admissions/apply', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Application submitted successfully!');
        closeModal();
    } catch (e) {}
}

// -- STUDENTS --
async function renderStudents() {
    const container = document.getElementById('content-area');
    container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Student Registry</h3>
                <button class="btn-primary" onclick="showEnrollModal()">Enroll New Student</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody id="student-body"></tbody>
                </table>
            </div>
        </div>
    `;
    loadStudents();
}

async function loadStudents() {
    try {
        const students = await apiFetch('/students');
        const body = document.getElementById('student-body');
        body.innerHTML = students.map(s => `
            <tr>
                <td>${s.firstName} ${s.lastName}</td>
                <td>${s.email || '-'}</td>
                <td><span class="badge success">${s.status}</span></td>
                <td><button class="btn-sm" onclick="viewStudentEnrollments('${s.id}')">History</button></td>
            </tr>
        `).join('');
    } catch (e) {}
}

// -- ACADEMIC YEARS --
async function renderAcademicYears() {
    const container = document.getElementById('content-area');
    container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Academic Cycles</h3>
                <button class="btn-primary" onclick="createAcademicYear()">Create Year</button>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Year</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody id="academic-years-body"></tbody>
                </table>
            </div>
        </div>
    `;
    loadAcademicYears();
}

async function loadAcademicYears() {
    const list = await apiFetch('/academic-years');
    const body = document.getElementById('academic-years-body');
    body.innerHTML = list.map(y => `
        <tr>
            <td>${y.year}</td>
            <td><span class="badge ${y.isActive ? 'success' : 'muted'}">${y.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
            <td>${!y.isActive ? `<button class="btn-sm" onclick="activateAcademicYear('${y.id}')">Activate</button>` : ''}</td>
        </tr>
    `).join('');
}

async function createAcademicYear() {
    const year = prompt("Enter Academic Year (e.g., 2024/2025):");
    if (!year) return;
    await apiFetch('/academic-years', { method: 'POST', body: JSON.stringify({ year }) });
    showToast('Academic year created');
    loadAcademicYears();
}

async function activateAcademicYear(id) {
    await apiFetch(`/academic-years/${id}/activate`, { method: 'PATCH' });
    showToast('Academic year activated');
    loadAcademicYears();
}

// -- CURRICULUM --
async function renderCurriculum() {
    const container = document.getElementById('content-area');
    container.innerHTML = `
        <div class="card">
            <div class="flex-between">
                <h3>Class Management</h3>
                <div class="gap-1">
                    <button class="btn-secondary" onclick="seedClasses()">Seed Defaults</button>
                    <button class="btn-primary" onclick="createClass()">New Class</button>
                </div>
            </div>
            <div class="table-container mt-1">
                <table>
                    <thead><tr><th>Name</th><th>Level</th><th>Sections</th><th>Actions</th></tr></thead>
                    <tbody id="classes-body"></tbody>
                </table>
            </div>
        </div>
    `;
    loadClasses();
}

async function loadClasses() {
    const classes = await apiFetch('/classes');
    const body = document.getElementById('classes-body');
    body.innerHTML = classes.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.level}</td>
            <td id="sec-count-${c.id}">...</td>
            <td>
                <button class="btn-sm" onclick="addSection('${c.id}')">+ Section</button>
                <button class="btn-sm" onclick="viewSections('${c.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

async function seedClasses() {
    await apiFetch('/classes/seed', { method: 'POST' });
    showToast('Classes seeded');
    loadClasses();
}

// --- INITIALIZATION ---
function closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
}

function initModules() {
    switchView('dashboard');
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            if (item.classList.contains('logout')) return;
            e.preventDefault();
            switchView(item.dataset.view);
        };
    });
}

// Event Listeners
document.getElementById('btn-login').onclick = login;
document.getElementById('btn-logout').onclick = logout;

// Initial state check
if (state.token) {
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    // Simplified: re-fetch user info or decode
    const payload = JSON.parse(atob(state.token.split('.')[1]));
    state.user = payload;
    document.getElementById('user-email').textContent = payload.email;
    document.getElementById('user-avatar').textContent = payload.email[0].toUpperCase();
    initModules();
}
