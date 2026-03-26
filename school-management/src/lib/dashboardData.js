// Dashboard Data and Utilities

export const generateStats = () => [];

export const generateRecentStudents = () => [];

export const generateAttendance = () => [];

export const generateNotifications = () => [];

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

export const generateUpcomingEvents = () => [];

export const generateTopPerformers = () => [];

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
