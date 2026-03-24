// Dashboard Data and Utilities

export const generateStats = () => [
  {
    title: "Total Students",
    value: 1247,
    change: 3.2,
    color: "#667eea",
    icon: "👥",
    trend: "up",
  },
  {
    title: "Active Teachers",
    value: 68,
    change: 1.5,
    color: "#48bb78",
    icon: "👨‍🏫",
    trend: "up",
  },
  {
    title: "Classes",
    value: 42,
    change: 0,
    color: "#ed8936",
    icon: "🏫",
    trend: "stable",
  },
  {
    title: "Pending Fees",
    value: 27,
    change: -5.2,
    color: "#f56565",
    icon: "💰",
    trend: "down",
  },
];

export const generateRecentStudents = () => [
  {
    id: 1,
    name: "Aisha Khan",
    className: "Grade 10-A",
    date: "2025-01-15",
    status: "Active",
    avatar: "AK",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    className: "Grade 9-B",
    date: "2025-01-14",
    status: "Active",
    avatar: "RM",
  },
  {
    id: 3,
    name: "Sara Ali",
    className: "Grade 8-C",
    date: "2025-01-13",
    status: "Pending",
    avatar: "SA",
  },
  {
    id: 4,
    name: "Tom Brown",
    className: "Grade 11-A",
    date: "2025-01-12",
    status: "Active",
    avatar: "TB",
  },
  {
    id: 5,
    name: "Maya Singh",
    className: "Grade 7-B",
    date: "2025-01-11",
    status: "Active",
    avatar: "MS",
  },
];

export const generateAttendance = () => [
  { name: "Grade 10-A", pct: 96, present: 28, total: 30, trend: "up" },
  { name: "Grade 9-B", pct: 89, present: 25, total: 28, trend: "down" },
  { name: "Grade 8-C", pct: 92, present: 27, total: 29, trend: "stable" },
  { name: "Grade 11-A", pct: 85, present: 22, total: 26, trend: "up" },
  { name: "Grade 7-B", pct: 94, present: 24, total: 25, trend: "up" },
];

export const generateNotifications = () => [
  {
    id: 1,
    type: "info",
    title: "New Student Registration",
    message: "Aisha Khan has been registered in Grade 10-A",
    time: "2 hours ago",
    icon: "👤",
  },
  {
    id: 2,
    type: "warning",
    title: "Fee Payment Due",
    message: "15 students have pending fee payments",
    time: "4 hours ago",
    icon: "⚠️",
  },
  {
    id: 3,
    type: "success",
    title: "Exam Results Published",
    message: "Mid-term exam results are now available",
    time: "6 hours ago",
    icon: "✅",
  },
  {
    id: 4,
    type: "info",
    title: "Parent-Teacher Meeting",
    message: "Scheduled for tomorrow at 2:00 PM",
    time: "1 day ago",
    icon: "📅",
  },
];

export const generateQuickActions = () => [
  {
    id: 1,
    label: "Add Student",
    icon: "👥",
    color: "#667eea",
    action: "addStudent",
  },
  {
    id: 2,
    label: "Create Class",
    icon: "🏫",
    color: "#48bb78",
    action: "createClass",
  },
  {
    id: 3,
    label: "Generate Report",
    icon: "📊",
    color: "#ed8936",
    action: "generateReport",
  },
  {
    id: 4,
    label: "Manage Fees",
    icon: "💰",
    color: "#f56565",
    action: "manageFees",
  },
  {
    id: 5,
    label: "View Attendance",
    icon: "📋",
    color: "#9f7aea",
    action: "viewAttendance",
  },
  {
    id: 6,
    label: "Send Notifications",
    icon: "📢",
    color: "#38b2ac",
    action: "sendNotifications",
  },
];

export const generateUpcomingEvents = () => [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "2025-01-20",
    time: "10:00 AM",
    type: "meeting",
    priority: "high",
  },
  {
    id: 2,
    title: "Mid-Term Exams",
    date: "2025-01-25",
    time: "All Day",
    type: "exam",
    priority: "high",
  },
  {
    id: 3,
    title: "Sports Day",
    date: "2025-01-30",
    time: "8:00 AM",
    type: "event",
    priority: "medium",
  },
  {
    id: 4,
    title: "Science Fair",
    date: "2025-02-05",
    time: "9:00 AM",
    type: "event",
    priority: "medium",
  },
];

export const generateTopPerformers = () => [
  {
    id: 1,
    name: "Emma Wilson",
    class: "10-A",
    score: 98,
    rank: 1,
    subject: "Mathematics",
  },
  {
    id: 2,
    name: "Liam Chen",
    class: "10-B",
    score: 96,
    rank: 2,
    subject: "Physics",
  },
  {
    id: 3,
    name: "Sophia Kumar",
    class: "10-A",
    score: 95,
    rank: 3,
    subject: "Chemistry",
  },
  {
    id: 4,
    name: "Noah Patel",
    class: "10-C",
    score: 94,
    rank: 4,
    subject: "Biology",
  },
];

// Utility functions
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  const colors = {
    Active: "#48bb78",
    Pending: "#ed8936",
    Inactive: "#f56565",
  };
  return colors[status] || "#718096";
};

export const getPriorityColor = (priority) => {
  const colors = {
    high: "#f56565",
    medium: "#ed8936",
    low: "#48bb78",
  };
  return colors[priority] || "#718096";
};
