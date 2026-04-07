import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, CreditCard, FileText, ArrowUpRight } from "lucide-react";

const C = {
  purple900: "#1e0a3c",
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  blue500:   "#3b82f6",
  blue50:    "#eff6ff",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray800:   "#1f2937",
  gray900:   "#111827",
  white:     "#ffffff",
  green500:  "#10b981",
};

export default function BillingSettings() {
  const auth = useAuth();
  const isDark = document.body.getAttribute("data-theme") === "dark";
  
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    if (auth.user?.role !== "administration" && auth.user?.role !== "superadmin") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getMyBilling();
      setBillingData(data);
    } catch (err) {
      console.error("Failed to fetch billing:", err);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    panel: {
      background: isDark ? "#111827" : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      padding: "2rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    },
    title: { fontSize: 20, fontWeight: 700, color: isDark ? C.white : C.gray900, marginBottom: "0.5rem" },
    desc: { fontSize: 14, color: C.gray500, marginBottom: "2rem" },
    planCard: {
      background: isDark ? "#1e293b" : C.purple50,
      borderRadius: 12, padding: "1.5rem", marginBottom: "2rem",
      border: `1px solid ${isDark ? "#334155" : C.purple100}`
    },
    btnPrimary: {
      background: C.purple600, color: C.white, border: "none", padding: "10px 20px",
      borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer"
    }
  };

  if (loading && !billingData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} color={C.purple600} />
      </div>
    );
  }

  return (
    <div style={s.panel}>
      <h2 style={s.title}>Billing & Plans</h2>
      <p style={s.desc}>Manage your current subscription plan and billing cycle.</p>
      
      {billingData ? (
        <>
          <div style={s.planCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <span style={{ 
                  background: isDark ? C.purple600 : C.purple100, color: isDark ? C.white : C.purple600,
                  padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase"
                }}>Current Plan</span>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: isDark ? C.white : C.purple900, marginTop: 12 }}>{billingData.subscriptionPlan}</h3>
                <p style={{ fontSize: 13, color: C.gray600 }}>Includes up to 50 active users.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: isDark ? C.white : C.gray900 }}>${billingData.subscriptionAmount}<span style={{ fontSize: 14, color: C.gray500 }}>/mo</span></div>
                <p style={{ fontSize: 12, color: C.gray500 }}>Next charge: {new Date(billingData.nextChargeDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Payment Method</h3>
          <div style={{ 
            border: `1px solid ${isDark ? "#1f2937" : C.gray200}`, borderRadius: 10, padding: "1rem", 
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 44, height: 30, background: isDark ? "#1f2937" : "#f0f0f0", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                {billingData.paymentMethod?.split(" ")[0]?.toUpperCase() || "VISA"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{billingData.paymentMethod}</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>Expires 12/28</div>
              </div>
            </div>
            <button style={{ background: "none", border: "none", color: C.purple500, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Invoicing History</h3>
          <div style={{ borderRadius: 10, border: `1px solid ${isDark ? "#1f2937" : C.gray200}`, overflow: "hidden" }}>
            {(billingData.invoices || []).map((inv, idx) => (
              <div key={inv.id} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "12px 16px", borderBottom: idx !== (billingData.invoices.length - 1) ? `1px solid ${isDark ? "#1f2937" : C.gray200}` : "none",
                background: isDark ? "#111827" : C.white
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <FileText size={16} color={C.gray500} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{inv.id}</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>{inv.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{inv.amount}</div>
                  <div style={{ 
                    background: isDark ? "rgba(16, 185, 129, 0.1)" : "#d1fae5", color: isDark ? C.green500 : "#065f46",
                    padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600
                  }}>{inv.status}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem 1rem", border: `1px dashed ${isDark ? "#334155" : C.gray300}`, borderRadius: 12 }}>
          <CreditCard size={48} color={C.gray400} style={{ marginBottom: "1rem" }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.gray500 }}>No billing information available</h3>
          <p style={{ fontSize: 14, color: C.gray500, marginTop: 4 }}>This account does not have an active subscription managed here.</p>
        </div>
      )}
    </div>
  );
}
