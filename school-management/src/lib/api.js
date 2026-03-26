// API client that connects to the backend-fixed microservices
const API_BASE_URL = "https://2e57-196-61-44-164.ngrok-free.app";

const getToken = () => localStorage.getItem("token");

const headers = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.statusCode || "Request failed");
  }
  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// ==================== AUTH ====================

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
  }
  return data;
}

export async function register(email, password, name, role = "student") {
  // Registration is done via superadmin or administration endpoints
  // For self-registration, we throw an error - users must be created by admin
  throw new Error("User registration must be done by an administrator");
}

export async function signout() {
  try {
    await fetch(`${API_BASE_URL}/auth/signout`, {
      method: "POST",
      headers: headers(),
    });
  } catch (e) {
    // Ignore errors on logout
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function logout() {
  signout();
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// ==================== PROFILE ====================

export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(profileData),
  });
  return handleResponse(res);
}

// ==================== STUDENTS (Admin only) ====================

export async function getStudents() {
  const res = await fetch(`${API_BASE_URL}/administration/users?role=student`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createStudent(studentData) {
  const res = await fetch(`${API_BASE_URL}/administration/create-user`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...studentData, role: "student" }),
  });
  return handleResponse(res);
}

export async function updateStudent(id, studentData) {
  // Would need to use PATCH endpoint
  throw new Error("Not implemented");
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE_URL}/administration/deactivate/${id}`, {
    method: "PATCH",
    headers: headers(),
  });
  return handleResponse(res);
}

export async function saveStudents(rows) {
  // Batch sync - create or update students
  for (const student of rows) {
    if (student.id) {
      await updateStudent(student.id, student);
    } else {
      await createStudent(student);
    }
  }
  return rows;
}

// ==================== TEACHERS (Admin only) ====================

export async function getTeachers() {
  const res = await fetch(`${API_BASE_URL}/administration/users?role=teacher`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createTeacher(teacherData) {
  const res = await fetch(`${API_BASE_URL}/administration/create-user`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ...teacherData, role: "teacher" }),
  });
  return handleResponse(res);
}

export async function updateTeacher(id, teacherData) {
  throw new Error("Not implemented");
}

export async function deleteTeacher(id) {
  const res = await fetch(`${API_BASE_URL}/administration/deactivate/${id}`, {
    method: "PATCH",
    headers: headers(),
  });
  return handleResponse(res);
}

export async function saveTeachers(rows) {
  for (const teacher of rows) {
    if (teacher.id) {
      await updateTeacher(teacher.id, teacher);
    } else {
      await createTeacher(teacher);
    }
  }
  return rows;
}

// ==================== SCHOOLS (Superadmin only) ====================

export async function getSchools() {
  const res = await fetch(`${API_BASE_URL}/schools`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createSchool(schoolData) {
  const res = await fetch(`${API_BASE_URL}/schools`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(schoolData),
  });
  return handleResponse(res);
}

// ==================== DASHBOARD ====================

export async function getDashboardStats() {
  // Get counts from users endpoint
  const users = await getStudents();
  const teachers = await getTeachers();

  return {
    totalStudents: Array.isArray(users) ? users.length : 0,
    totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
  };
}

export default {
  getStudents,
  saveStudents,
  getTeachers,
  saveTeachers,
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
  updateProfile,
  getDashboardStats,
  getSchools,
  createSchool,
};
