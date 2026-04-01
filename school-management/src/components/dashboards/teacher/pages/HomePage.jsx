// HomePage.jsx — Teacher Dashboard overview page

import React, { useState, useEffect } from "react";
import { T } from "../theme";
import { api } from "../hooks/useApi";
import { PageHeader, Card, Btn, Spinner, Avatar } from "../components/ui";
import { 
  Users, 
  BookOpen, 
  Edit3, 
  Megaphone, 
  CheckCircle, 
  Clipboard, 
  BarChart, 
  UserCheck 
} from "lucide-react";

function StatCard({ label, value, color, icon: Icon, loading }) {
  return (
    <Card style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 14, marginBottom: 0 }}>
      <div
        style={{
          width: 42, height: 42, borderRadius: T.r,
          background: color + "18", border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color, flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.text1, lineHeight: 1.2, marginTop: 2 }}>
          {loading ? <Spinner /> : value}
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ label, color, icon: Icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color + "18" : T.card,
        border: `1px solid ${hov ? color + "66" : T.border}`,
        borderRadius: T.r2,
        padding: "20px 16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        flex: 1,
        minWidth: 120,
        transition: "all 0.2s",
        outline: "none",
        fontFamily: "inherit",
      }}
    >
      <Icon size={26} color={hov ? color : T.text2} style={{ transition: "color 0.2s" }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: hov ? color : T.text2, textAlign: "center" }}>
        {label}
      </span>
    </button>
  );
}

export default function HomePage({ teacher, onNavigate, sections, base, token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api(base, token, "GET", "/teacher/stats");
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [base, token]);

  const totalStudents = sections.reduce((s, c) => s + (c.studentCount || 0), 0);

  const cards = [
    { label: "My Sections",     value: sections.length,                   color: T.accent,  icon: BookOpen },
    { label: "Total Students",  value: stats?.totalStudents ?? totalStudents, color: T.green,   icon: Users },
    { label: "Pending Grades",  value: stats?.pendingGrades ?? 0,          color: T.amber,   icon: Edit3 },
    { label: "Notices Posted",  value: stats?.notices ?? 0,                color: T.purple,  icon: Megaphone },
  ];

  const quickActions = [
    { label: "Attendance",    color: T.green,  icon: CheckCircle, page: "attendance" },
    { label: "Assignments",   color: T.accent, icon: Clipboard,   page: "assignment" },
    { label: "Grades",        color: T.amber,  icon: BarChart,    page: "grades"     },
    { label: "Notices",       color: T.purple, icon: Megaphone,   page: "notice"     },
  ];

  return (
    <div>
      <PageHeader 
        icon={<UserCheck size={28} color={T.accent} />} 
        title={`Welcome back, ${teacher?.name?.split(" ")[0] || "Teacher"}`} 
        sub="Here's your teaching overview for today." 
      />

      <style>{`
        .stats-row { display: flex; gap: 16; flex-wrap: wrap; margin-bottom: 28px; }
        .actions-row { display: flex; gap: 12; flex-wrap: wrap; }
        .section-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
        
        @media (max-width: 600px) {
          .stats-row > div { flex: 1 1 100% !important; }
          .actions-row > button { flex: 1 1 calc(50% - 12px) !important; min-width: 100px !important; }
          .section-card { flex-direction: column; align-items: flex-start; gap: 12px !important; }
          .section-card > div:last-of-type { text-align: left !important; margin-right: 0 !important; }
          .section-card > button { width: 100%; margin-top: 4px; }
        }
      `}</style>
      
      {/* Stat cards */}
      <div className="stats-row">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* Quick actions */}
      <section style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Quick Actions
        </p>
        <div className="actions-row">
          {quickActions.map((a) => (
            <QuickAction key={a.page} {...a} onClick={() => onNavigate(a.page)} />
          ))}
        </div>
      </section>

      {/* My sections */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.text3, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.8 }}>
          My Sections
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.length === 0 && (
            <Card style={{ textAlign: "center", color: T.text3, fontSize: 13, padding: "32px" }}>
              No sections assigned yet.
            </Card>
          )}
          {sections.map((sec) => (
            <Card
              key={sec.id}
              className="section-card"
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar name={sec.name} size={40} color={T.accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{sec.name}</div>
                  <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
                    {sec.subject} · {sec.level}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right", marginRight: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.text1 }}>
                  {sec.studentCount ?? "—"}
                </div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 700, textTransform: "uppercase" }}>students</div>
              </div>
              <Btn onClick={() => onNavigate("attendance")} variant="success" style={{ padding: "7px 16px", fontSize: 12 }}>
                Attendance
              </Btn>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
