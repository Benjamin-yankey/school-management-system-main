import React, { useState, useEffect } from 'react';
import { Bell, Eye, Plus, Edit, Trash2, Calendar, User, X, Inbox } from 'lucide-react';
import api from '../lib/api';
import './Announcements.css';

const Announcements = ({ userRole = 'admin' }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      // Fetch announcements based on user role
      const data = await api.getAnnouncements(userRole !== 'admin' ? userRole : "");
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-GB", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await api.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
      } catch (err) {
        alert("Failed to delete announcement: " + err.message);
      }
    }
  };

  const handleAddAnnouncement = async (formData) => {
    try {
      const newAnnouncement = await api.createAnnouncement(formData);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setShowForm(false);
    } catch (err) {
      alert("Failed to create announcement: " + err.message);
    }
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
        {announcements.length > 0 ? (
          announcements.slice(0, 3).map((announcement, index) => {
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
                      {formatDate(announcement.createdAt || announcement.date)}
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
          })
        ) : (
          <div className="announcements-empty">
            <Inbox size={48} strokeWidth={1.5} />
            <p>No important announcements today. Stay tuned!</p>
          </div>
        )}
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
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Announcement</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
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
