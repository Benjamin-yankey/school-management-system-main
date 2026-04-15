// DashboardLayout.jsx — Shared layout: Sidebar + Topbar + Content area

import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import DashboardTour from "./DashboardTour";

/**
 * Wraps any dashboard content with the standard sidebar + topbar layout.
 *
 * @param {Object} props
 * @param {{ id: string, label: string, icon: React.ReactNode, action?: string | function }[]} props.navItems
 * @param {string} props.activeItem — Currently active sidebar item ID
 * @param {function} props.onNavigate — Called when a sidebar item is clicked (non-route items)
 * @param {string} [props.pageTitle] — Title shown in topbar
 * @param {string} [props.portalLabel] — Label for sidebar footer
 * @param {React.ReactNode} props.children — The dashboard content
 */
export default function DashboardLayout({
  navItems,
  activeItem,
  onNavigate,
  pageTitle,
  portalLabel,
  children,
  primaryAction,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Unified width variable for synced transitions
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div 
      className="dash-layout-root"
      style={{ 
        minHeight: "100vh", 
        background: "var(--bg)",
        "--sidebar-width": `${sidebarWidth}px` 
      }}
    >
      <DashboardTour />
      
      {/* Sidebar */}
      <DashboardSidebar
        navItems={navItems}
        activeItem={activeItem}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        portalLabel={portalLabel}
        primaryAction={primaryAction}
      />

      {/* Topbar */}
      <DashboardTopbar
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        pageTitle={pageTitle}
        sidebarWidth={sidebarWidth}
      />

      {/* Main content area */}
      <main
        className="dash-main-content"
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "calc(100vh - 60px)",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "var(--bg)",
          position: "relative"
        }}
      >
        <style>{`
          .dash-layout-root {
            transition: --sidebar-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          @media (max-width: 900px) {
            .dash-main-content {
              margin-left: 0 !important;
              padding-top: 0;
            }
          }
        `}</style>
        {children}
      </main>
    </div>
  );
}
