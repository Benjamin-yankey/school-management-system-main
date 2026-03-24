import React, { useState, useEffect } from 'react';
import { Bell, Eye, Plus, Edit, Trash2, Calendar, User } from 'lucide-react';
import './Announcements.css';

const Announcements = ({ userRole = 'admin' }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Mock data - in real app, this would come from your API
  const mockAnnouncements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting Scheduled",
      description: "Monthly parent-teacher conference will be held on January 20th at 10:00 AM in the main hall. All parents are requested to attend.",
      date: "2025-01-15",
      type: "meeting",
      priority: "high",
      author: "Principal",
      targetAudience: "Parents",
      status: "active"
    },
    {
      id: 2,
      title: "Mid-Term Examination Notice",
      description: "Mid-term examinations will commence from January 25th to January 30th. Students are advised to prepare thoroughly.",
      date: "2025-01-14",
      type: "exam",
      priority: "high",
      author: "Academic Department",
      targetAudience: "Students",
      status: "active"
    },
    {
      id: 3,
      title: "Sports Day Preparations",
      description: "Annual sports day is scheduled for February 10th. Students interested in participating should register with their respective sports teachers.",
      date: "2025-01-13",
      type: "event",
      priority: "medium",
      author: "Sports Department",
      targetAudience: "Students",
      status: "active"
    },
    {
      id: 4,
      title: "Library Hours Extension",
      description: "The school library will remain open until 6:00 PM from Monday to Friday during examination period to help students with their studies.",
      date: "2025-01-12",
      type: "general",
      priority: "low",
      author: "Library Staff",
      targetAudience: "Students",
      status: "active"
    },
    {
      id: 5,
      title: "Science Fair Registration",
      description: "Students can now register for the annual science fair. Projects should be innovative and demonstrate scientific principles.",
      date: "2025-01-11",
      type: "event",
      priority: "medium",
      author: "Science Department",
      targetAudience: "Students",
      status: "active"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadAnnouncements = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter announcements based on user role
      let filteredAnnouncements = mockAnnouncements;
      
      if (userRole !== 'admin') {
        // Non-admin users see announcements targeted to them
        filteredAnnouncements = mockAnnouncements.filter(announcement => {
          const targetAudience = announcement.targetAudience.toLowerCase();
          return targetAudience.includes(userRole) || 
                 targetAudience.includes('all') || 
                 targetAudience.includes('general');
        });
      }
      
      setAnnouncements(filteredAnnouncements);
      setLoading(false);
    };

    loadAnnouncements();
  }, [userRole]);

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getTypeIcon = (type) => {
    const icons = {
      meeting: '👥',
      exam: '📝',
      event: '🎉',
      general: '📢',
      urgent: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getTypeColor = (type) => {
    const colors = {
      meeting: '#3b82f6',
      exam: '#ef4444',
      event: '#10b981',
      general: '#6b7280',
      urgent: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
  };

  const handleAddAnnouncement = (newAnnouncement) => {
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <div className="header-content">
            <Bell className="header-icon" />
            <h2>Announcements</h2>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <h2>Announcements</h2>
        </div>
        <div className="header-actions">
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="btn-icon" />
              Add Announcement
            </button>
          )}
          <button className="btn btn-secondary">
            <Eye className="btn-icon" />
            View All
          </button>
        </div>
      </div>

      <div className="announcements-grid">
        {announcements.slice(0, 3).map((announcement, index) => {
          const bgColors = ['#e6f3ff', '#f0f9ff', '#fef3c7'];
          const borderColors = ['#3b82f6', '#0ea5e9', '#f59e0b'];
          
          return (
            <div 
              key={announcement.id} 
              className="announcement-card"
              style={{
                backgroundColor: bgColors[index % bgColors.length],
                borderLeftColor: borderColors[index % borderColors.length]
              }}
            >
              <div className="announcement-header">
                <div className="announcement-title-section">
                  <div className="announcement-icon">
                    {getTypeIcon(announcement.type)}
                  </div>
                  <h3 className="announcement-title">{announcement.title}</h3>
                </div>
                <div className="announcement-meta">
                  <span 
                    className="priority-badge"
                    style={{ 
                      backgroundColor: `${getPriorityColor(announcement.priority)}20`,
                      color: getPriorityColor(announcement.priority)
                    }}
                  >
                    {announcement.priority}
                  </span>
                  <span className="date-badge">
                    {formatDate(announcement.date)}
                  </span>
                </div>
              </div>
              
              <p className="announcement-description">{announcement.description}</p>
              
              <div className="announcement-footer">
                <div className="announcement-author">
                  <User className="author-icon" />
                  <span>{announcement.author}</span>
                </div>
                <div className="announcement-actions">
                  <span 
                    className="type-badge"
                    style={{ 
                      backgroundColor: `${getTypeColor(announcement.type)}20`,
                      color: getTypeColor(announcement.type)
                    }}
                  >
                    {announcement.type}
                  </span>
                  {userRole === 'admin' && (
                    <div className="admin-actions">
                      <button 
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {announcements.length > 3 && (
        <div className="view-more">
          <button className="btn btn-outline">
            View {announcements.length - 3} More Announcements
          </button>
        </div>
      )}

      {/* Add Announcement Form Modal */}
      {showForm && (
        <AnnouncementForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddAnnouncement}
        />
      )}
    </div>
  );
};

// Announcement Form Component
const AnnouncementForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    targetAudience: 'all',
    date: new Date().toISOString().split('T')[0]
  });

  const types = [
    { value: 'general', label: 'General' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'exam', label: 'Exam' },
    { value: 'event', label: 'Event' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const audiences = [
    { value: 'all', label: 'Everyone' },
    { value: 'students', label: 'Students' },
    { value: 'parents', label: 'Parents' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'staff', label: 'Staff' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: Date.now(),
      author: 'Admin',
      status: 'active'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Announcement</h2>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Announcement title"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Announcement details..."
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="form-select"
              >
                {audiences.map(audience => (
                  <option key={audience.value} value={audience.value}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Announcements;
