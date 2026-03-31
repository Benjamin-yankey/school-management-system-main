// Dashboard Data and Utilities

export const generateStats = () => [
  {
    title: "Total Students",
    value: 2854,
    change: 12.5,
    color: "#667eea",
    trend: "up",
    icon: "🎓",
  },
  {
    title: "Active Teachers",
    value: 124,
    change: 5.2,
    color: "#48bb78",
    trend: "up",
    icon: "👨‍🏫",
  },
  {
    title: "Online Classes",
    value: 42,
    change: -2.4,
    color: "#ed8936",
    trend: "down",
    icon: "💻",
  },
  {
    title: "Monthly Revenue",
    value: 45200,
    change: 18.7,
    color: "#f56565",
    trend: "up",
    icon: "💰",
  },
];

export const generateRecentStudents = () => [
  { 
    id: 1, 
    name: "John Doe", 
    status: "Active", 
    className: "Grade 10-A", 
    date: "2024-03-20",
    avatar: "JD"
  },
  { 
    id: 2, 
    name: "Jane Smith", 
    status: "Pending", 
    className: "Grade 12-B", 
    date: "2024-03-22",
    avatar: "JS"
  },
  { 
    id: 3, 
    name: "Alice Brown", 
    status: "Active", 
    className: "Grade 11-C", 
    date: "2024-03-23",
    avatar: "AB"
  },
  { 
    id: 4, 
    name: "Bob Wilson", 
    status: "Inactive", 
    className: "Grade 9-A", 
    date: "2024-03-24",
    avatar: "BW"
  },
];

export const generateAttendance = () => [
  { name: "10A", present: 28, total: 30, pct: 93 },
  { name: "11C", present: 24, total: 30, pct: 80 },
  { name: "12B", present: 29, total: 30, pct: 97 },
  { name: "9A", present: 22, total: 30, pct: 73 },
];

export const generateNotifications = () => [
  { id: 1, title: "Registration", message: "New student registration: Jane Smith", time: "2 hours ago", priority: "high", icon: "👤" },
  { id: 2, title: "Attendance", message: "Class 10A attendance is below average", time: "4 hours ago", priority: "medium", icon: "📋" },
  { id: 3, title: "Meeting", message: "Staff meeting tomorrow at 9:00 AM", time: "1 day ago", priority: "low", icon: "🤝" },
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
  {
    id: 7,
    label: "Manage Users",
    icon: "👤",
    color: "#4a5568",
    action: "manageUsers",
  },
];

export const generateUpcomingEvents = () => [
  { id: 1, title: "Parent-Teacher Meeting", date: "2024-04-15", time: "10:00 AM", type: "academic", priority: "high" },
  { id: 2, title: "Annual Science Fair", date: "2024-04-20", time: "09:00 AM", type: "event", priority: "medium" },
  { id: 3, title: "Spring Break Starts", date: "2024-05-01", time: "08:00 AM", type: "holiday", priority: "low" },
];

export const generateTopPerformers = () => [
  { id: 1, name: "Sara Lee", score: 98, className: "12th Grade", subject: "Advanced Mathematics", rank: 1 },
  { id: 2, name: "Mark Hamill", score: 95, className: "11th Grade", subject: "Quantum Physics", rank: 2 },
  { id: 3, name: "Daisy Ridley", score: 94, className: "10th Grade", subject: "World History", rank: 3 },
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
