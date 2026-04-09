// pages/AttendancePage.jsx — Enhanced attendance tracking with real backend sync

import React, { useState, useEffect, useCallback } from "react";
import { T } from "../theme";
import { api } from "../hooks/useApi";
import { Avatar, Spinner, Alert, Field, Select, Input, Btn, Card, PageHeader } from "../components/ui";
import { CheckCircle, XCircle, Clock, UserCheck, Circle } from "lucide-react";

const STATUS = [
  { key: "present", label: "Present", color: T.green, icon: <CheckCircle size={14} /> },
  { key: "absent",  label: "Absent",  color: T.red,   icon: <XCircle size={14} /> },
  { key: "late",    label: "Late",    color: T.amber, icon: <Clock size={14} /> },
];

export default function AttendancePage({ base, token, sections }) {
  const [sectionId,  setSectionId]  = useState(sections[0]?.id || "");
  const [date,       setDate]       = useState(new Date().toISOString().split("T")[0]);

  // Sync sectionId if it's empty but sections have arrived
  useEffect(() => {
    if (!sectionId && sections.length > 0) {
      setSectionId(sections[0].id);
    }
  }, [sections, sectionId]);
  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState(null);

  const loadStudents = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(base, token, "GET", `/teacher/sections/${sectionId}/students`);
      const list = Array.isArray(data) ? data : data?.data || [];
      initStudents(list);
    } catch (err) {
      setError("Failed to load students: " + err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [base, token, sectionId]);

  function initStudents(list) {
    setStudents(list);
    const init = {};
    list.forEach((s) => { init[s.id] = "present"; });
    setAttendance(init);
    setSaved(false);
  }

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const toggle = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
    setSaved(false);
  };

  const setAll = (status) => {
    const next = {};
    students.forEach((s) => { next[s.id] = status; });
    setAttendance(next);
    setSaved(false);
  };

  const submit = async () => {
    if (!sectionId) { setError("No section selected."); return; }
    setSaving(true); setError(null); setSaved(false);
    try {
      const currentSection = sections.find(s => s.id === sectionId);
      const termId = currentSection?.termId || currentSection?.term?.id || "current";
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || "present",
      }));
      await api(base, token, "POST", "/attendance/bulk", { sectionId, termId, date, attendance: records });
      setSaved(true);
    } catch (err) {
      setError("Failed to save attendance: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    present: Object.values(attendance).filter((v) => v === "present").length,
    absent:  Object.values(attendance).filter((v) => v === "absent").length,
    late:    Object.values(attendance).filter((v) => v === "late").length,
  };

  return (
    <div>
      <PageHeader 
        icon={<UserCheck size={26} color={T.accent} />} 
        title="Mark Attendance" 
        sub="Record daily attendance for your sections." 
      />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Section" required>
            <Select value={sectionId} onChange={(e) => { setSectionId(e.target.value); setSaved(false); }}>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.subject}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date" required>
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSaved(false); }} style={{ colorScheme: "dark" }} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          {STATUS.map((s) => (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99,
              fontSize: 12, fontWeight: 700, background: s.color + "18", color: s.color, border: `1px solid ${s.color}33`,
            }}>
              {s.icon} {s.label}: {counts[s.key]}
            </div>
          ))}
          <div style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: T.inputBg, color: T.text2, border: `1px solid ${T.border}`, marginLeft: "auto",
          }}>
            Total: {students.length}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: T.text3, alignSelf: "center", marginRight: 4, fontWeight: 600 }}>Mark all as:</span>
        {STATUS.map((s) => (
          <Btn key={s.key} variant="ghost" style={{ fontSize: 11, padding: "5px 12px", color: s.color, borderColor: s.color + "44" }} onClick={() => setAll(s.key)}>
            {s.label}
          </Btn>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr repeat(3,1fr)", gap: 8,
          padding: "12px 20px", borderBottom: `1px solid ${T.border}`,
          fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: 0.8, textTransform: "uppercase",
        }}>
          <span>Student</span>
          {STATUS.map((s) => (
            <span key={s.key} style={{ textAlign: "center" }}>{s.label}</span>
          ))}
        </div>

        {loading && <div style={{ textAlign: "center", padding: 48, color: T.text3 }}><Spinner /> Loading students…</div>}

        {!loading && students.map((st, i) => {
          const current = attendance[st.id] || "present";
          return (
            <div key={st.id} style={{
              display: "grid", gridTemplateColumns: "2fr repeat(3,1fr)", gap: 8, padding: "14px 20px",
              background: i % 2 === 0 ? T.inputBg : "transparent",
              borderBottom: i < students.length - 1 ? `1px solid ${T.border}` : "none",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={st.firstName + " " + st.lastName} size={34} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text1, margin: 0 }}>{st.firstName} {st.lastName}</p>
                  <p style={{ fontSize: 11, color: T.text3, margin: 0, opacity: 0.7 }}>{st.email}</p>
                </div>
              </div>
              {STATUS.map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={() => toggle(st.id, s.key)} style={{
                    width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
                    border: `2px solid ${current === s.key ? s.color : T.border}`,
                    background: current === s.key ? s.color + "22" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s", fontSize: 13, outline: "none",
                  }}>
                    {current === s.key ? (
                      <span style={{ color: s.color, fontWeight: 800, fontSize: 14 }}>{s.icon}</span>
                    ) : (
                      <span style={{ color: T.text3, opacity: 0.3 }}><Circle size={12} /></span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          );
        })}

        {!loading && students.length === 0 && <div style={{ textAlign: "center", padding: 48, color: T.text3, fontSize: 13 }}>No students found in this section.</div>}
      </Card>

      <div style={{ display: "flex", gap: 14, marginTop: 22, alignItems: "center" }}>
        <Btn variant="success" loading={saving} onClick={submit} style={{ padding: "10px 28px" }}>
          {saving ? "Saving…" : "Submit Attendance"}
        </Btn>
        {saved && <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>Attendance saved successfully!</span>}
      </div>
      <Alert type="error" msg={error} onClose={() => setError(null)} />
    </div>
  );
}
