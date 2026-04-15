// DashboardSidebar.jsx — Shared sidebar navigation for all dashboards

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import "./DashboardSidebar.css";

/**
 * @param {Object} props
 * @param {{ id: string, label: string, icon: React.ReactNode, action?: string | function }[]} props.navItems
 *   - action: if string starting with "/", navigates to that route. Otherwise calls onNavigate(id).
 * @param {string} props.activeItem — The currently active navigation item ID
 * @param {function} props.onNavigate — Called with item.id when a non-route item is clicked
 * @param {boolean} props.isOpen — Whether the sidebar is open (mobile)
 * @param {function} props.onClose — Called to close the sidebar on mobile
 * @param {boolean} props.collapsed — Whether desktop sidebar is collapsed
 * @param {function} props.onToggleCollapse — Toggle desktop collapse state
 * @param {string} [props.portalLabel] — Optional label like "Admin Portal v2.0"
 */
export default function DashboardSidebar({
  navItems = [],
  activeItem,
  onNavigate,
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
  portalLabel = "",
  primaryAction = null, // { label, icon, onClick }
}) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleItemClick = (item) => {
    if (typeof item.action === "string" && item.action.startsWith("/")) {
      navigate(item.action);
    } else if (typeof item.action === "function") {
      item.action();
    } else {
      onNavigate?.(item.id);
    }
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`dash-sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`dash-sidebar ${isOpen ? "mobile-open" : ""} ${collapsed ? "collapsed" : ""}`}>
        {/* Mobile close button */}
        <button className="dash-sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Collapse/Expand Toggle Arrow — fixed clipping issue by allowing overflow */}
        <button
          id="dash-sidebar-collapse-btn"
          className="dash-sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Brand / Logo */}
        <div className="dash-sidebar-brand" onClick={() => { navigate("/"); onClose?.(); }}>
          <img
            src="/images/schoolLogo.jpeg"
            alt="School Logo"
            className="dash-sidebar-logo"
          />
          {!collapsed && (
            <span className="dash-sidebar-school-name">
              GEOZIIE INTERNATIONAL SCHOOL
            </span>
          )}
        </div>

        {/* Primary Action (e.g. Broadcast) */}
        {primaryAction && (
          <div className="dash-sidebar-primary-container">
            <button 
              className="dash-sidebar-primary-btn"
              onClick={primaryAction.onClick}
              title={collapsed ? primaryAction.label : undefined}
            >
              <span className="dash-sidebar-primary-icon">
                {primaryAction.icon}
              </span>
              {!collapsed && (
                <span className="dash-sidebar-primary-label">
                  {primaryAction.label}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Section label */}
        {!collapsed && <div className="dash-sidebar-label">Main</div>}
        {collapsed && <div style={{ height: 16 }} />}

        {/* Nav items */}
        <nav className="dash-sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const isHovered = hoveredItem === item.id;
            return (
              <div key={item.id} style={{ position: "relative" }}>
                <button
                  className={`dash-sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="dash-sidebar-item-icon">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="dash-sidebar-item-label">
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && <span className="dash-sidebar-active-dot" />}
                </button>

                {/* Tooltip when collapsed */}
                {collapsed && isHovered && (
                  <div className="dash-sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="dash-sidebar-footer">
          {!collapsed ? (
            <div className="dash-sidebar-footer-text">
              <span className="dash-sidebar-footer-brand">
                GEOZIIE INTERNATIONAL SCHOOL
              </span>
              {portalLabel || "School Management System"}
            </div>
          ) : (
            <div className="dash-sidebar-footer-text">
              <span className="dash-sidebar-footer-brand">GIS</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
