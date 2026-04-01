// pages/AssignmentPage.jsx — Create and manage assignments

import React, { useState, useRef } from "react";
import { T } from "../theme";
import { api } from "../hooks/useApi";
import { Alert, Field, Select, Input, Textarea, Btn, Card, PageHeader } from "../components/ui";
import { BookOpen, Calendar, Trash2, Paperclip, FileText, CheckCircle } from "lucide-react";

const TYPES      = ["homework", "classwork", "project", "test", "quiz", "exam"];
const PRIORITIES = [
  { value: "low",    label: "Low",    color: T.green  },
  { value: "normal", label: "Normal", color: T.accent },
  { value: "high",   label: "High",   color: T.red    },
];

export default function AssignmentPage({ base, token, sections }) {
  const [form, setForm] = useState({
    title: "", subject: "", sectionId: sections[0]?.id || "",
    instructions: "", type: "homework", priority: "normal",
    totalMarks: "100", dueDate: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(null);
  const [error,       setError]       = useState(null);
  const fileRef = useRef();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFiles = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };
  const removeFile = (idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true); setError(null); setDone(null);
    try {
      await api(base, token, "POST", "/teacher/assignments", { ...form, files: attachments.map(f => f.name) });
      setDone(`Assignment "${form.title}" created successfully!`);
      setForm({ ...form, title: "", instructions: "", dueDate: "" });
      setAttachments([]);
    } catch (err) {
      setError("Failed to create assignment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        icon={<BookOpen size={26} color={T.accent} />} 
        title="Create Assignment" 
        sub="Set tasks, due dates, and publish to your sections." 
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22 }}>
        <div>
          <Card>
            <Field label="Assignment Title" required>
              <Input value={form.title} onChange={set("title")} placeholder="e.g. Mid-term Research Project" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Subject" required>
                <Input value={form.subject} onChange={set("subject")} placeholder="e.g. Mathematics" />
              </Field>
              <Field label="Target Section" required>
                <Select value={form.sectionId} onChange={set("sectionId")}>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name} — {s.level}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Instructions" required>
              <Textarea value={form.instructions} onChange={set("instructions")} placeholder="Detailed guidelines for students…" style={{ minHeight: 180 }} />
            </Field>

            <Field label="Attachments" hint="upload slides, templates, or instructions.">
              <div 
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${T.border}`, borderRadius: 12, padding: "24px",
                  textAlign: "center", cursor: "pointer", background: T.inputBg,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <input type="file" multiple ref={fileRef} onChange={pickFiles} style={{ display: "none" }} />
                <div style={{ color: T.accent, marginBottom: 8 }}><Paperclip size={24} /></div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text2, margin: 0 }}>Click or drag to upload files</p>
                <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>PDF, DOCX, ZIP up to 10MB</p>
              </div>
              {attachments.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {attachments.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                    }}>
                      <FileText size={16} color={T.text3} />
                      <span style={{ fontSize: 12, flex: 1, color: T.text2 }}>{f.name}</span>
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </Card>
        </div>

        <aside>
          <Card style={{ marginBottom: 18 }}>
            <Field label="Due Date" required>
              <Input type="date" value={form.dueDate} onChange={set("dueDate")} style={{ colorScheme: "dark" }} />
            </Field>
            <Field label="Total Marks" required>
              <Input type="number" value={form.totalMarks} onChange={set("totalMarks")} />
            </Field>
          </Card>
          <Card style={{ marginBottom: 18 }}>
            <Field label="Assign Type">
              <Select value={form.type} onChange={set("type")} style={{ textTransform: "capitalize" }}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Priority level">
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setForm(f => ({ ...f, priority: p.value }))} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 9,
                  marginBottom: 6, cursor: "pointer", border: `1px solid ${form.priority === p.value ? p.color : T.border}`,
                  background: form.priority === p.value ? p.color + "18" : "transparent", textAlign: "left", transition: "all .15s",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: form.priority === p.value ? p.color : T.text2 }}>{p.label}</span>
                </button>
              ))}
            </Field>
          </Card>
          <Btn variant="primary" loading={loading} onClick={submit} style={{ width: "100%", padding: "14px" }}>
            {loading ? "Publishing…" : "Publish Assignment"}
          </Btn>
          <Alert type="success" msg={done} onClose={() => setDone(null)} />
          <Alert type="error" msg={error} onClose={() => setError(null)} />
        </aside>
      </div>
    </div>
  );
}
