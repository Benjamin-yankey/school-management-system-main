// ═══════════════════════════════════════════════════════════
// SchoolSync Pro — Super Admin Panel (app.js)
// ═══════════════════════════════════════════════════════════

const API = "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────
function getToken() { return localStorage.getItem("sa_token"); }
function setToken(t) { localStorage.setItem("sa_token", t); }
function clearToken() { localStorage.removeItem("sa_token"); }

function authHeaders() {
  const t = getToken();
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Error ${res.status}` }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : {};
}

function toast(msg, type = "success") {
  const c = document.getElementById("toast-container");
  const d = document.createElement("div");
  d.className = `toast toast--${type}`;
  d.textContent = msg;
  c.appendChild(d);
  setTimeout(() => { d.style.opacity = "0"; d.style.transform = "translateX(40px)"; setTimeout(() => d.remove(), 300); }, 3500);
}

function decodeJWT(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

// ── Navigate ─────────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll(".nav-item[data-page]").forEach(n => n.classList.toggle("active", n.dataset.page === page));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === `page-${page}`));
  document.getElementById("page-title").textContent = { dashboard: "Dashboard", schools: "Schools", admins: "Administrations", profile: "Profile", settings: "Settings" }[page] || page;
  if (page === "dashboard") loadDashboard();
  if (page === "schools") loadSchools();
  if (page === "admins") loadAdmins();
  if (page === "profile") loadProfile();
}
// expose globally for inline onclick
window.navigateTo = navigateTo;

// ── Auth ──────────────────────────────────────────────────────
function showApp() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
  const payload = decodeJWT(getToken());
  if (payload) {
    document.getElementById("user-email").textContent = payload.email || "";
    document.getElementById("user-avatar").textContent = (payload.email || "SA").substring(0, 2).toUpperCase();
  }
  navigateTo("dashboard");
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("login-btn");
  const errEl = document.getElementById("login-error");
  errEl.textContent = "";
  btn.classList.add("loading");
  try {
    const data = await api("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email: document.getElementById("login-email").value.trim(), password: document.getElementById("login-password").value }),
    });
    if (!data.accessToken) throw new Error("No token received");
    setToken(data.accessToken);
    const payload = decodeJWT(data.accessToken);
    if (payload && payload.role !== "superadmin") { clearToken(); throw new Error("Access denied — superadmin only"); }
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
  } finally { btn.classList.remove("loading"); }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  try { await api("/auth/signout", { method: "POST" }); } catch {}
  clearToken();
  location.reload();
});

// Auto-login if token exists
if (getToken()) { const p = decodeJWT(getToken()); if (p && p.role === "superadmin") showApp(); else clearToken(); }

// ── Sidebar navigation ──────────────────────────────────────
document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.page));
});

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [schools, admins] = await Promise.all([api("/schools"), api("/superadmin/administrations")]);
    document.getElementById("stat-schools").textContent = Array.isArray(schools) ? schools.length : 0;
    document.getElementById("stat-admins").textContent = Array.isArray(admins) ? admins.length : 0;
  } catch (err) { toast(err.message, "error"); }
}

// ══════════════════════════════════════════════════════════════
// SCHOOLS
// ══════════════════════════════════════════════════════════════
let schoolsCache = [];

async function loadSchools() {
  try {
    schoolsCache = await api("/schools");
    renderSchools();
  } catch (err) { toast(err.message, "error"); }
}

function renderSchools() {
  const tb = document.getElementById("schools-tbody");
  if (!schoolsCache.length) { tb.innerHTML = '<tr><td colspan="5" class="empty-row">No schools yet</td></tr>'; return; }
  tb.innerHTML = schoolsCache.map(s => `
    <tr>
      <td><strong>${esc(s.name)}</strong></td>
      <td>${esc(s.address || "—")}</td>
      <td><span class="badge ${s.isActive !== false ? "badge--active" : "badge--inactive"}">${s.isActive !== false ? "Active" : "Inactive"}</span></td>
      <td>${new Date(s.createdAt).toLocaleDateString()}</td>
      <td><button class="btn btn--outline btn--sm" onclick="editSchool('${s.id}')">Edit</button></td>
    </tr>`).join("");
}

document.getElementById("btn-add-school").addEventListener("click", () => {
  document.getElementById("school-form-card").style.display = "";
  document.getElementById("school-form-title").textContent = "Create School";
  document.getElementById("school-form").reset();
  document.getElementById("school-edit-id").value = "";
});
document.getElementById("btn-cancel-school").addEventListener("click", () => { document.getElementById("school-form-card").style.display = "none"; });

window.editSchool = (id) => {
  const s = schoolsCache.find(x => x.id === id);
  if (!s) return;
  document.getElementById("school-form-card").style.display = "";
  document.getElementById("school-form-title").textContent = "Edit School";
  document.getElementById("school-edit-id").value = id;
  document.getElementById("school-name").value = s.name || "";
  document.getElementById("school-address").value = s.address || "";
};

document.getElementById("school-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("school-edit-id").value;
  const body = { name: document.getElementById("school-name").value.trim(), address: document.getElementById("school-address").value.trim() };
  try {
    if (id) { await api(`/schools/${id}`, { method: "PATCH", body: JSON.stringify(body) }); toast("School updated"); }
    else { await api("/schools", { method: "POST", body: JSON.stringify(body) }); toast("School created"); }
    document.getElementById("school-form-card").style.display = "none";
    loadSchools();
  } catch (err) { toast(err.message, "error"); }
});

// ══════════════════════════════════════════════════════════════
// ADMINISTRATIONS
// ══════════════════════════════════════════════════════════════
async function loadAdmins() {
  try {
    // Populate school dropdown
    if (!schoolsCache.length) schoolsCache = await api("/schools");
    const sel = document.getElementById("admin-school");
    sel.innerHTML = '<option value="">Select a school…</option>' + schoolsCache.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");

    const admins = await api("/superadmin/administrations");
    const tb = document.getElementById("admins-tbody");
    if (!admins.length) { tb.innerHTML = '<tr><td colspan="5" class="empty-row">No administrators yet</td></tr>'; return; }
    tb.innerHTML = admins.map(a => `
      <tr>
        <td>${esc(a.email)}</td>
        <td style="font-family:monospace;font-size:.8rem;color:var(--text-muted)">${a.schoolId || "—"}</td>
        <td><span class="badge ${a.isActive !== false ? "badge--active" : "badge--inactive"}">${a.isActive !== false ? "Active" : "Inactive"}</span></td>
        <td>${new Date(a.createdAt).toLocaleDateString()}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn--outline btn--sm" onclick="resetAdminPw('${a.id}')">Reset PW</button>
          ${a.isActive !== false ? `<button class="btn btn--danger btn--sm" onclick="deactivateUser('${a.id}')">Deactivate</button>` : ""}
        </td>
      </tr>`).join("");
  } catch (err) { toast(err.message, "error"); }
}

document.getElementById("btn-add-admin").addEventListener("click", () => { document.getElementById("admin-form-card").style.display = ""; });
document.getElementById("btn-cancel-admin").addEventListener("click", () => { document.getElementById("admin-form-card").style.display = "none"; });

document.getElementById("admin-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { email: document.getElementById("admin-email").value.trim(), schoolId: document.getElementById("admin-school").value };
  try {
    await api("/superadmin/create-administration", { method: "POST", body: JSON.stringify(body) });
    toast("Administration account created");
    document.getElementById("admin-form-card").style.display = "none";
    document.getElementById("admin-form").reset();
    loadAdmins();
  } catch (err) { toast(err.message, "error"); }
});

window.resetAdminPw = (id) => showConfirm("Reset Password", "This will generate a new temporary password and email it to the admin.", async () => {
  try { await api(`/superadmin/reset-admin-password/${id}`, { method: "POST" }); toast("Password reset — email sent"); } catch (err) { toast(err.message, "error"); }
});

window.deactivateUser = (id) => showConfirm("Deactivate Account", "This user will no longer be able to sign in. Continue?", async () => {
  try { await api(`/superadmin/deactivate/${id}`, { method: "PATCH" }); toast("Account deactivated"); loadAdmins(); } catch (err) { toast(err.message, "error"); }
});

// ══════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════
async function loadProfile() {
  try {
    const p = await api("/profile/me");
    document.getElementById("profile-first").value = p.firstName || "";
    document.getElementById("profile-last").value = p.lastName || "";
    document.getElementById("profile-phone").value = p.phone || "";
  } catch (err) { toast(err.message, "error"); }
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/profile/me", { method: "PATCH", body: JSON.stringify({ firstName: document.getElementById("profile-first").value.trim(), lastName: document.getElementById("profile-last").value.trim(), phone: document.getElementById("profile-phone").value.trim() }) });
    toast("Profile updated");
  } catch (err) { toast(err.message, "error"); }
});

// ══════════════════════════════════════════════════════════════
// SETTINGS (password + credentials)
// ══════════════════════════════════════════════════════════════
document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: document.getElementById("pw-current").value, newPassword: document.getElementById("pw-new").value }) });
    toast("Password changed — please sign in again", "info");
    clearToken(); setTimeout(() => location.reload(), 1500);
  } catch (err) { toast(err.message, "error"); }
});

document.getElementById("credentials-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { currentPassword: document.getElementById("cred-current").value };
  const em = document.getElementById("cred-email").value.trim();
  const pw = document.getElementById("cred-password").value;
  if (em) body.newEmail = em;
  if (pw) body.newPassword = pw;
  if (!em && !pw) { toast("Provide a new email or password", "error"); return; }
  try {
    await api("/superadmin/update-credentials", { method: "PATCH", body: JSON.stringify(body) });
    toast("Credentials updated");
    document.getElementById("credentials-form").reset();
  } catch (err) { toast(err.message, "error"); }
});

// ══════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ══════════════════════════════════════════════════════════════
function showConfirm(title, message, onYes) {
  const overlay = document.getElementById("confirm-modal");
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;
  overlay.classList.remove("hidden");
  const yesBtn = document.getElementById("confirm-yes");
  const noBtn = document.getElementById("confirm-no");
  const cleanup = () => { overlay.classList.add("hidden"); yesBtn.replaceWith(yesBtn.cloneNode(true)); noBtn.replaceWith(noBtn.cloneNode(true)); };
  // re-query after clone
  document.getElementById("confirm-yes").addEventListener("click", async () => { cleanup(); await onYes(); });
  document.getElementById("confirm-no").addEventListener("click", cleanup);
}

// ── Utils ────────────────────────────────────────────────────
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
