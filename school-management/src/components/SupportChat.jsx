import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './SupportChat.css';

const BOT_NAME = "GEOZIIE Assistant";

const KNOWLEDGE_BASE = [
  {
    keywords: ["admission", "enroll", "apply", "join"],
    response: "You can manage student admissions in the 'Admissions' menu. If you are an admin, check the 'Enroll Student' section in the Admin Dashboard to manually link students to class levels and sections."
  },
  {
    keywords: ["pay", "payment", "fee", "billing", "invoice", "school fees"],
    response: "Billing and fees can be managed in 'Settings > Billing'. Students and parents can view unpaid invoices directly from their specific payment portals."
  },
  {
    keywords: ["grade", "result", "score", "performance"],
    response: "Grades and exam results are available in the Student and Parent dashboards. Teachers can enter new scores through the 'Results' entry module."
  },
  {
    keywords: ["time", "timezone", "language", "clock"],
    response: "You can change the system language, timezone, and date format in 'Settings > General > Language & Region'. This will update the system clock and all date displays."
  },
  {
    keywords: ["theme", "dark", "light", "appearance", "font"],
    response: "Appearance settings, including Dark Mode, Font Size, and Layout Density, are located in 'Settings > General > Appearance'."
  },
  {
    keywords: ["hello", "hi", "hey", "help"],
    response: "Hello! I'm your GEOZIIE Assistant. How can I help you manage your school tasks today? I know about admissions, payments, grades, and system settings."
  },
  {
    keywords: ["recent", "registrations", "statistics"],
    response: "You can find recent student registrations and current enrollment statistics on the 'Insights' tab of your Admin Dashboard."
  },
  {
    keywords: ["academic", "years"],
    response: "Academic years and terms can be configured in the 'Academic Control' section of the SuperAdmin panel."
  },
  {
    keywords: ["assignments", "tasks"],
    response: "Individual assignments and deadlines are listed in the 'Assignments' tab of the Student portal. You can submit your work directly there."
  },
  {
    keywords: ["timetable", "schedule"],
    response: "Your personal weekly timetable is available in the 'Timetable' section of your dashboard."
  }
];

const DEFAULT_RESPONSE = "I'm not quite sure about that specific detail. You might find more information in the 'Help & Documentation' section or by contacting the school administration directly.";

export default function SupportChat() {
  const { isDarkMode, formatTime } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi ${user?.firstName || 'there'}! I'm the GEOZIIE Assistant. How can I help you today?`, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Global listener to open/close chat from other components
  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail?.open !== undefined) {
        setIsOpen(e.detail.open);
      } else {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('toggleSupportChat', handleToggle);
    return () => window.removeEventListener('toggleSupportChat', handleToggle);
  }, []);

  const getQuickQuestions = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) {
      return ["How to enroll students?", "View recent registrations", "Manage academic years"];
    }
    if (path.includes('/settings')) {
      return ["How to change theme?", "Switch language", "Setup notifications", "Billing help"];
    }
    if (path.includes('/student/dashboard')) {
      return ["Where are my grades?", "Check assignments", "Pay school fees", "View timetable"];
    }
    if (path.includes('/teacher/dashboard')) {
      return ["Attendance tracking", "Enter result scores", "View my schedule"];
    }
    return ["How to apply?", "Campus location", "Contact support"];
  };

  const handleSend = (text) => {
    const messageText = typeof text === 'string' ? text : inputValue;
    if (!messageText.trim()) return;

    const userMsg = { role: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate thinking
    setTimeout(() => {
      const responseText = findResponse(messageText.toLowerCase());
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: responseText, timestamp: new Date() }]);
    }, 1200);
  };

  const findResponse = (input) => {
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => input.includes(kw))) {
        return item.response;
      }
    }
    return DEFAULT_RESPONSE;
  };

  const chatContent = (
    <div className={`support-chat-wrapper ${isDarkMode ? 'dark' : ''}`}>
      {/* Floating Button */}
      <button 
        className={`support-chat-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle support chat"
      >
        <div className="fab-icon">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          )}
        </div>
      </button>

      {/* Chat Window */}
      <div className={`support-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">G</div>
            <div>
              <div className="bot-name">{BOT_NAME}</div>
              <div className="bot-status">Online</div>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              <div className="message-bubble">
                {m.text}
                <div className="message-time">
                  {formatTime(m.timestamp, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-row bot">
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          {/* Quick Actions */}
          <div className="quick-actions">
            {getQuickQuestions().map((q, idx) => (
              <button 
                key={idx} 
                className="quick-pill"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={!inputValue.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(chatContent, document.body);
}
