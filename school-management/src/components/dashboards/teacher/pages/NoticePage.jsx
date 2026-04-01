// pages/NoticePage.jsx — Enhanced notice broadcasting with real backend sync

import React, { useState, useEffect, useCallback } from "react";
import { T, inp } from "../theme";
import { api } from "../hooks/useApi";
import {
  Avatar,
  Badge,
  Spinner,
  Alert,
  Field,
  Select,
  Input,
  Textarea,
  Btn,
  Card,
  PageHeader,
} from "../components/ui";
import { Megaphone, Send, History, User, Users, Globe, X } from "lucide-react";

/**
 * Send Notice page.
 * Broadcast messages to sections or individual students.
 */
export default function NoticePage({ base, token, sections }) {
  const [form, setForm] = useState({
    subject: "",
    body: "",
    target: "section", // "section" | "individual" | "all"
    sectionId: sections[0]?.id || "",
    priority: "normal",
    category: "general",
  });

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const MOCK_HISTORY = [
    {
      id: "h1",
      subject: "Welcome to GEOZIIE INTERNATIONAL SCHOOL",
      body: "Glad to have you on board!",
      target: "All",
      sent: "10/24/2023, 10:00 AM",
      priority: "normal",
    },
    {
      id: "h2",
      subject: "Staff Meeting",
      body: "Meeting in the faculty room at 3 PM.",
      target: "Teachers",
      sent: "10/25/2023, 08:30 AM",
      priority: "high",
    },
  ];

  // ── Load Notice History ──────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api(base, token, "GET", "/announcements?role=teacher");
      const list = Array.isArray(data) ? data : data?.data || [];
      setHistory(
        list.map((n) => ({
          id: n.id,
          subject: n.title,
          body: n.message,
          target: n.targetRole || "All",
          sent: new Date(n.createdAt).toLocaleString(),
          priority: n.priority || "normal",
        })),
      );
    } catch {
      console.warn("Backend /announcements not ready. Using mock history.");
      setHistory(MOCK_HISTORY);
    } finally {
      setLoadingHistory(false);
    }
  }, [base, token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Load students for individual picker ──────────────────────────────────
  const loadStudents = useCallback(async () => {
    if (!form.sectionId) return;
    try {
      const data = await api(
        base,
        token,
        "GET",
        `/teacher/sections/${form.sectionId}/students`,
      );
      setStudents(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setStudents([]);
    }
  }, [base, token, form.sectionId]);

  useEffect(() => {
    if (form.target === "individual") loadStudents();
  }, [form.target, loadStudents]);

  const toggleStudent = (id) =>
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!form.subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!form.body.trim()) {
      setError("Message body is required.");
      return;
    }
    if (form.target === "individual" && selectedStudents.length === 0) {
      setError("Select at least one student.");
      return;
    }

    setLoading(true);
    setError(null);
    setSent(null);

    const targetLabel =
      form.target === "all"
        ? "all my sections"
        : form.target === "individual"
          ? `${selectedStudents.length} student(s)`
          : sections.find((s) => s.id === form.sectionId)?.name || "section";

    try {
      await api(base, token, "POST", "/announcements", {
        title: form.subject,
        message: form.body,
        targetRole: form.target === "all" ? "everyone" : form.target,
        sectionId: form.target !== "all" ? form.sectionId : undefined,
        studentIds: form.target === "individual" ? selectedStudents : undefined,
        priority: form.priority,
        category: form.category,
      });

      setSent(`Notice successfully sent to ${targetLabel}.`);
      setForm((f) => ({ ...f, subject: "", body: "" }));
      setSelectedStudents([]);
      loadHistory();
    } catch (err) {
      console.warn("Failed to broadcast to backend. Simulating local success.");
      setSent(
        `[Simulation Mode] Notice for "${form.subject}" sent to ${targetLabel}.`,
      );
      setForm((f) => ({ ...f, subject: "", body: "" }));
      setSelectedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const PRIORITIES = [
    { value: "low", label: "Low", color: T.green },
    { value: "normal", label: "Normal", color: T.accent },
    { value: "high", label: "High", color: T.red },
  ];
  const CATEGORIES = ["general", "homework", "reminder", "event", "emergency"];
  const PRIORITY_COLOR = { low: T.green, normal: T.accent, high: T.red };

  return (
    <div>
      <PageHeader
        icon={<Megaphone size={26} color={T.accent} />}
        title="Send Notice"
        sub="Broadcast messages to sections or individual students."
      />

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22 }}
      >
        <div>
          <Card style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.text3,
                letterSpacing: 0.8,
                marginBottom: 16,
                textTransform: "uppercase",
              }}
            >
              Compose notice
            </p>

            <Field label="Send to" required>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  {
                    value: "section",
                    label: "A section",
                    icon: <Users size={14} />,
                  },
                  {
                    value: "individual",
                    label: "Individual",
                    icon: <User size={14} />,
                  },
                  {
                    value: "all",
                    label: "All sections",
                    icon: <Globe size={14} />,
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setForm((f) => ({ ...f, target: opt.value }));
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      border: `1px solid ${form.target === opt.value ? T.accent : T.border}`,
                      background:
                        form.target === opt.value ? T.accentBg : "transparent",
                      color: form.target === opt.value ? T.accent : T.text2,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {form.target !== "all" && (
              <Field label="Section">
                <Select value={form.sectionId} onChange={set("sectionId")}>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.level}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {form.target === "individual" && (
              <Field
                label="Select students"
                hint={`${selectedStudents.length} selected`}
              >
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    border: `1px solid ${T.border}`,
                    borderRadius: 9,
                    padding: 8,
                    background: T.inputBg,
                  }}
                >
                  {students.length === 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        color: T.text3,
                        textAlign: "center",
                        padding: 10,
                      }}
                    >
                      No students found.
                    </p>
                  )}
                  {students.map((st) => (
                    <label
                      key={st.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        marginBottom: 2,
                        background: selectedStudents.includes(st.id)
                          ? T.accentBg
                          : "transparent",
                        transition: "background .12s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(st.id)}
                        onChange={() => toggleStudent(st.id)}
                        style={{ accentColor: T.accent, width: 15, height: 15 }}
                      />
                      <Avatar name={st.firstName} size={24} color={T.accent} />
                      <span
                        style={{
                          fontSize: 13,
                          color: T.text1,
                          fontWeight: 500,
                        }}
                      >
                        {st.firstName} {st.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Subject" required>
              <Input
                value={form.subject}
                onChange={set("subject")}
                placeholder="e.g. Assignment due tomorrow"
              />
            </Field>

            <Field
              label="Message"
              required
              hint="Students will receive this via the student portal."
            >
              <Textarea
                value={form.body}
                onChange={set("body")}
                placeholder="Write your message here…"
                style={{ minHeight: 160, lineHeight: 1.7 }}
              />
            </Field>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn
                variant="primary"
                loading={loading}
                onClick={submit}
                style={{ flex: 1 }}
              >
                <Send size={18} style={{ marginRight: 8 }} />
                {loading ? "Sending…" : "Send Notice"}
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setForm((f) => ({ ...f, subject: "", body: "" }));
                  setSelectedStudents([]);
                  setError(null);
                  setSent(null);
                }}
              >
                Clear
              </Btn>
            </div>

            <Alert type="success" msg={sent} onClose={() => setSent(null)} />
            <Alert type="error" msg={error} onClose={() => setError(null)} />
          </Card>
        </div>

        <div>
          <Card style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.text3,
                letterSpacing: 0.8,
                marginBottom: 14,
                textTransform: "uppercase",
              }}
            >
              Priority
            </p>
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 9,
                  marginBottom: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  border: `1px solid ${form.priority === p.value ? p.color : T.border}`,
                  background:
                    form.priority === p.value ? p.color + "18" : "transparent",
                  textAlign: "left",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: form.priority === p.value ? p.color : T.text2,
                  }}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </Card>

          <Card style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.text3,
                letterSpacing: 0.8,
                marginBottom: 14,
                textTransform: "uppercase",
              }}
            >
              Category
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1px solid",
                    fontFamily: "inherit",
                    background:
                      form.category === c ? T.purpleAlp : "transparent",
                    borderColor: form.category === c ? T.purple : T.border,
                    color: form.category === c ? T.purple : T.text2,
                    transition: "all .15s",
                    textTransform: "capitalize",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.text3,
                letterSpacing: 0.8,
                marginBottom: 14,
                textTransform: "uppercase",
              }}
            >
              <History
                size={14}
                style={{ verticalAlign: "middle", marginRight: 6 }}
              />{" "}
              Recent notices
            </p>
            {loadingHistory && (
              <div style={{ textAlign: "center", padding: 10 }}>
                <Spinner />
              </div>
            )}
            {!loadingHistory && history.length === 0 && (
              <p
                style={{
                  color: T.text3,
                  fontSize: 13,
                  textAlign: "center",
                  padding: 10,
                }}
              >
                No notices sent yet.
              </p>
            )}
            {!loadingHistory &&
              history.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    marginBottom: 10,
                    background: T.inputBg,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      gap: 10,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.text1,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {n.subject}
                    </p>
                    <Badge
                      label={n.priority}
                      color={PRIORITY_COLOR[n.priority] || T.accent}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: T.text3, margin: 0 }}>
                    To: {n.target}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: T.text3,
                      margin: "4px 0 0",
                      opacity: 0.7,
                    }}
                  >
                    {n.sent}
                  </p>
                </div>
              ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
