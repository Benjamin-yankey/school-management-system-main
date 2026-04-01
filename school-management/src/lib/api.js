// API client that connects to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  // Extract firstName and lastName from name
  const nameParts = name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName, role }),
  });
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE_URL}/administration/update-user/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(studentData),
  });
  return handleResponse(res);
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
    if (student.id && typeof student.id === 'string' && student.id.length > 5) {
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
  const res = await fetch(`${API_BASE_URL}/administration/update-user/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(teacherData),
  });
  return handleResponse(res);
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
    if (teacher.id && typeof teacher.id === 'string' && teacher.id.length > 5) {
      await updateTeacher(teacher.id, teacher);
    } else {
      await createTeacher(teacher);
    }
  }
  return rows;
}

// ==================== ATTENDANCE ====================

export async function getAttendance(date) {
  const res = await fetch(`${API_BASE_URL}/attendance?date=${date}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function saveAttendance(date, attendanceData) {
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ date, data: attendanceData }),
  });
  return handleResponse(res);
}

export async function getActiveAcademicYear() {
  const res = await fetch(`${API_BASE_URL}/academic-years/active`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getAcademicTerms(academicYearId) {
  const res = await fetch(`${API_BASE_URL}/academic-terms?academicYearId=${academicYearId}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getClassLevels() {
  const res = await fetch(`${API_BASE_URL}/classes`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getClassSections(classLevelId) {
  const res = await fetch(`${API_BASE_URL}/classes/${classLevelId}/sections`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createSchoolUser(userData) {
  const res = await fetch(`${API_BASE_URL}/administration/create-user`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function getAdministrationUsers() {
  const res = await fetch(`${API_BASE_URL}/administration/users`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function assignTeacherToSection(teacherUserId, sectionId) {
  const res = await fetch(`${API_BASE_URL}/administration/teachers/${teacherUserId}/sections`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sectionId }),
  });
  return handleResponse(res);
}

export async function enrollStudent(enrollmentData) {
  const res = await fetch(`${API_BASE_URL}/students/enroll`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(enrollmentData),
  });
  return handleResponse(res);
}

export async function getStudentsPaginated(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.academicYearId) queryParams.append("academicYearId", params.academicYearId);
  if (params.classLevelId) queryParams.append("classLevelId", params.classLevelId);

  const res = await fetch(`${API_BASE_URL}/students?${queryParams.toString()}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createFee(feeData) {
  const res = await fetch(`${API_BASE_URL}/fees`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(feeData),
  });
  return handleResponse(res);
}

export async function payFee(feeId, paymentData) {
  const res = await fetch(`${API_BASE_URL}/fees/${feeId}/pay`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(paymentData),
  });
  return handleResponse(res);
}

export async function resetUserPassword(userId) {
  const res = await fetch(`${API_BASE_URL}/administration/reset-password/${userId}`, {
    method: "POST",
    headers: headers(),
  });
  return handleResponse(res);
}

export async function deactivateUser(userId) {
  const res = await fetch(`${API_BASE_URL}/administration/deactivate/${userId}`, {
    method: "PATCH",
    headers: headers(),
  });
  return handleResponse(res);
}

export async function activateUser(userId) {
  const res = await fetch(`${API_BASE_URL}/administration/activate/${userId}`, {
    method: "PATCH",
    headers: headers(),
  });
  return handleResponse(res);
}

export async function withdrawStudent(studentId, reason) {
  const res = await fetch(`${API_BASE_URL}/students/${studentId}/withdraw`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function signOut() {
  const res = await fetch(`${API_BASE_URL}/auth/signout`, {
    method: "POST",
    headers: headers(),
  });
  return handleResponse(res);
}

// ==================== TEACHER ROLE ====================

export async function getTeacherSections() {
  const res = await fetch(`${API_BASE_URL}/teacher/sections`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getTeacherStudents() {
  const res = await fetch(`${API_BASE_URL}/teacher/students`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getSectionStudents(sectionId) {
  const res = await fetch(`${API_BASE_URL}/teacher/sections/${sectionId}/students`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function bulkRecordAttendance(attendanceData) {
  const res = await fetch(`${API_BASE_URL}/attendance/bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(attendanceData),
  });
  return handleResponse(res);
}

export async function getStudentAttendanceSummary(studentId, termId) {
  const res = await fetch(`${API_BASE_URL}/attendance/student/${studentId}/summary?termId=${termId}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function bulkRecordGrades(gradeData) {
  const res = await fetch(`${API_BASE_URL}/grades/bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(gradeData),
  });
  return handleResponse(res);
}

export async function getStudentReportCard(studentId, termId) {
  const res = await fetch(`${API_BASE_URL}/grades/report-card/${studentId}?termId=${termId}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

// ==================== PARENT ROLE ====================

export async function linkChild(studentId, relationship = "") {
  const res = await fetch(`${API_BASE_URL}/parent/children`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ studentId, relationship }),
  });
  return handleResponse(res);
}

export async function getLinkedChildren() {
  const res = await fetch(`${API_BASE_URL}/parent/children`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getLinkedChild(childStudentId) {
  const res = await fetch(`${API_BASE_URL}/parent/children/${childStudentId}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function unlinkChild(childStudentId) {
  const res = await fetch(`${API_BASE_URL}/parent/children/${childStudentId}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleResponse(res);
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

export async function forceResetPassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/auth/first-login-reset`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

// ==================== SUPERADMIN ====================

export async function getAdministrations() {
  const res = await fetch(`${API_BASE_URL}/superadmin/administrations`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createAdministration(adminData) {
  const res = await fetch(`${API_BASE_URL}/superadmin/create-administration`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(adminData),
  });
  return handleResponse(res);
}

export async function getSchoolUsers(schoolId) {
  const res = await fetch(`${API_BASE_URL}/superadmin/schools/${schoolId}/users`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createUserForSchool(schoolId, userData) {
  const res = await fetch(`${API_BASE_URL}/superadmin/schools/${schoolId}/users`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE_URL}/administration/deactivate/${id}`, {
    method: "PATCH",
    headers: headers(),
  });
  return handleResponse(res);
}


// ==================== DASHBOARD & PORTALS ====================
export async function getStudentPortalMe() {
  const res = await fetch(`${API_BASE_URL}/student-portal/me`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getStudentEnrollments() {
  const res = await fetch(`${API_BASE_URL}/student-portal/enrollments`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getStudentFees(studentId = "", termId = "") {
  const queryParams = new URLSearchParams();
  if (studentId) queryParams.append("studentId", studentId);
  if (termId) queryParams.append("termId", termId);
  
  const res = await fetch(`${API_BASE_URL}/fees?${queryParams.toString()}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function getStudentFeeBalance(studentId) {
  const res = await fetch(`${API_BASE_URL}/fees/balance/${studentId}`, {
    headers: headers(),
  });
  return handleResponse(res);
}

// ==================== ANNOUNCEMENTS ====================

export async function getAnnouncements(role = "") {
  const url = role 
    ? `${API_BASE_URL}/announcements?role=${role}`
    : `${API_BASE_URL}/announcements`;
  const res = await fetch(url, {
    headers: headers(),
  });
  return handleResponse(res);
}

export async function createAnnouncement(announcementData) {
  const res = await fetch(`${API_BASE_URL}/announcements`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(announcementData),
  });
  return handleResponse(res);
}

export async function updateAnnouncement(id, announcementData) {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(announcementData),
  });
  return handleResponse(res);
}

export async function deleteAnnouncement(id) {
  const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleResponse(res);
}

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
  getAttendance,
  saveAttendance,
  login,
  register,
  logout,
  forceResetPassword,
  getCurrentUser,
  getProfile,
  updateProfile,
  getDashboardStats,
  getSchools,
  createSchool,
  getAdministrations,
  createAdministration,
  getSchoolUsers,
  createUserForSchool,
  deleteUser,
  getStudentPortalMe,
  getStudentEnrollments,
  getStudentAttendanceSummary,
  getStudentReportCard,
  getStudentFees,
  getStudentFeeBalance,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAcademicYear,
  getAcademicTerms,
  getClassLevels,
  getClassSections,
  createSchoolUser,
  getAdministrationUsers,
  assignTeacherToSection,
  enrollStudent,
  getStudentsPaginated,
  createFee,
  payFee,
  resetUserPassword,
  deactivateUser,
  activateUser,
  withdrawStudent,
  signOut,
  getTeacherSections,
  getTeacherStudents,
  getSectionStudents,
  bulkRecordAttendance,
  bulkRecordGrades,
  getStudentReportCard,
  changePassword,
  linkChild,
  getLinkedChildren,
  getLinkedChild,
  unlinkChild,
};
