import React, { useState } from "react";
import { LifeBuoy, MessageSquare, Book, Mail, ChevronRight, Search, ExternalLink } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple50:  "#f5f3ff",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray500:   "#64748b",
  gray900:   "#111827",
  white:     "#ffffff",
};

export default function SupportSettings() {
  const { isDarkMode: isDark } = useTheme();
  const [search, setSearch] = useState("");

  const faqs = [
    { q: "How do I reset my password?", a: "Go to Account Settings and fill out the change password form." },
    { q: "Can I change my school assignment?", a: "No, school assignment is managed by the SuperAdmin." },
    { q: "Is there a mobile app?", a: "The platform is fully responsive and can be used on any mobile browser." }
  ];

  const s = {
    panel: {
      background: isDark ? "#111827" : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      padding: "2rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      marginBottom: "2rem"
    },
    title: { fontSize: 20, fontWeight: 700, color: isDark ? C.white : C.gray900, marginBottom: "0.5rem" },
    desc: { fontSize: 14, color: C.gray500, marginBottom: "2rem" },
    card: {
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      borderRadius: 12, padding: "1.25rem", 
      display: "flex", flexDirection: "column", gap: "1rem",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer", background: isDark ? "#111827" : C.white
    },
    input: {
      width: "100%", background: isDark ? "#1f2937" : "#fcfcfc",
      border: `1px solid ${isDark ? "#374151" : C.gray200}`,
      color: isDark ? C.white : C.gray900,
      padding: "12px 14px", paddingLeft: 40, borderRadius: 10, fontSize: 14, outline: "none"
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Help Center Header */}
      <div style={{ ...s.panel, textAlign: "center", background: `linear-gradient(135deg, ${isDark ? "#1e1b4b" : "#f5f3ff"} 0%, ${isDark ? "#111827" : "#ffffff"} 100%)` }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>How can we help?</h2>
        <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: C.gray500 }} />
          <input 
            style={s.input} 
            placeholder="Search help articles, guides, and more..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Support Channels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
        {[
          { label: "Documentation", desc: "Read our detailed guides", icon: Book, color: "#3b82f6" },
          { label: "Live Chat", desc: "Talk to our support team", icon: MessageSquare, color: "#7c3aed" },
          { label: "Email Support", desc: "Get help via email", icon: Mail, color: "#10b981" }
        ].map((item, idx) => (
          <div key={idx} style={s.card} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
              <item.icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: isDark ? C.white : C.gray900 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.gray500, marginTop: 4 }}>{item.desc}</div>
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4, color: item.color, fontSize: 13, fontWeight: 600 }}>
              Learn more <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div style={s.panel}>
        <h2 style={s.title}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((faq, idx) => (
            <details key={idx} style={{ 
              borderRadius: 12, border: `1px solid ${isDark ? "#1f2937" : C.gray200}`, 
              padding: "1rem", cursor: "pointer", background: isDark ? "#0f172a" : "#fafafa" 
            }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <ChevronRight size={16} color={C.gray500} />
              </summary>
              <p style={{ marginTop: "1rem", fontSize: 13, color: C.gray500, lineHeight: 1.6 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Feedback Link */}
      <div style={{ ...s.panel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: isDark ? C.white : C.gray900 }}>Still need help?</h3>
          <p style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>Our support team is available 24/7 to assist you.</p>
        </div>
        <button style={{ 
          background: C.purple600, color: C.white, border: "none", 
          padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, 
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8 
        }}>
          Contact Us <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
