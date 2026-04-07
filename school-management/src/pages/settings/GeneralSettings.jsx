import React, { useState, useEffect } from "react";
import { Bell, Palette, Globe, Eye, Smartphone, Monitor, Layout } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray900:   "#111827",
  white:     "#ffffff",
};

export default function GeneralSettings() {
  const { 
    isDarkMode: isDark, 
    themeMode, setThemeMode, 
    fontSize, setFontSize, 
    density, setDensity 
  } = useTheme();
  
  // Local state for items not (yet) in backend
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("settings-notifs");
    return saved ? JSON.parse(saved) : { emailAlerts: true, browserNotifs: false, weeklyReport: true };
  });

  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem("settings-region");
    return saved ? JSON.parse(saved) : { language: "english", timezone: "UTC", dateFormat: "MM/DD/YYYY" };
  });

  const [access, setAccess] = useState(() => {
    const saved = localStorage.getItem("settings-access");
    return saved ? JSON.parse(saved) : { reduceMotion: false, highContrast: false, screenReader: false };
  });

  // Persistence effects
  useEffect(() => { localStorage.setItem("settings-notifs", JSON.stringify(notifs)); }, [notifs]);
  useEffect(() => { localStorage.setItem("settings-region", JSON.stringify(region)); }, [region]);
  useEffect(() => { 
    localStorage.setItem("settings-access", JSON.stringify(access)); 
    // Apply accessibility classes to body
    document.body.classList.toggle("high-contrast", access.highContrast);
    document.body.classList.toggle("reduce-motion", access.reduceMotion);
    document.body.classList.toggle("screen-reader", access.screenReader);
  }, [access]);

  const s = {
    panel: {
      background: isDark ? "#111827" : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      padding: "2rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      marginBottom: "2rem"
    },
    title: { fontSize: 18, fontWeight: 700, color: isDark ? C.white : C.gray900, marginBottom: "1.5rem" },
    label: { display: "block", fontSize: 13, fontWeight: 600, color: isDark ? "#9ca3af" : C.gray600, marginBottom: 8 },
    input: {
      width: "100%", background: isDark ? "#1f2937" : "#fcfcfc",
      border: `1px solid ${isDark ? "#374151" : C.gray200}`,
      color: isDark ? C.white : C.gray900,
      padding: "10px 14px", borderRadius: 8, fontSize: 14, outline: "none"
    },
    card: {
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      borderRadius: 12, padding: "1rem", marginBottom: "1rem",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    },
    switch: (enabled) => ({
      width: 40, height: 20, borderRadius: 10,
      background: enabled ? C.purple600 : (isDark ? "#374151" : C.gray200),
      position: "relative", cursor: "pointer", transition: "background 0.2s"
    }),
    switchThumb: (enabled) => ({
      width: 16, height: 16, borderRadius: "50%", background: C.white,
      position: "absolute", top: 2, left: enabled ? 22 : 2, transition: "left 0.2s"
    }),
    segmented: {
      display: "flex", background: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
      padding: 4, borderRadius: 12, border: `1px solid ${isDark ? "#374151" : C.gray200}`,
      width: "fit-content", position: "relative"
    },
    segmentBtn: (active) => ({
      padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
      border: "none", cursor: "pointer", position: "relative", zIndex: 1,
      background: "transparent", color: active ? C.white : (isDark ? C.gray400 : C.gray500),
      transition: "color 0.2s", fontFamily: "inherit"
    }),
    segmentBox: (index, total) => ({
      position: "absolute", top: 4, bottom: 4,
      left: `calc(${(index / total) * 100}% + 4px)`,
      width: `calc(${100 / total}% - 8px)`,
      background: C.purple600, borderRadius: 8,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 0, boxShadow: "0 4px 10px rgba(124, 58, 237, 0.3)"
    })
  };

  const SegmentedControl = ({ value, options, onChange }) => {
    const activeIndex = options.findIndex(o => o.value === value);
    return (
      <div style={s.segmented}>
        <div style={s.segmentBox(activeIndex, options.length)} />
        {options.map((opt) => (
          <button 
            key={opt.value} 
            style={s.segmentBtn(value === opt.value)}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  const SwitchRow = ({ id, label, desc, icon: Icon, enabled, onToggle }) => (
    <div style={s.card}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? "#1f2937" : C.purple50, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{label}</div>
          <div style={{ fontSize: 12, color: C.gray500 }}>{desc}</div>
        </div>
      </div>
      <div style={s.switch(enabled)} onClick={onToggle}>
        <div style={s.switchThumb(enabled)}></div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Appearance */}
      <div style={s.panel}>
        <h2 style={s.title}>Appearance Settings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <label style={s.label}>Theme Preference</label>
            <SegmentedControl 
              value={themeMode} 
              onChange={setThemeMode}
              options={[
                { value: "light",  label: "Light" },
                { value: "dark",   label: "Dark" },
                { value: "system", label: "System Default" }
              ]}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div>
              <label style={s.label}>Font Size</label>
              <SegmentedControl 
                value={fontSize} 
                onChange={setFontSize}
                options={[
                  { value: "small",  label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large",  label: "Large" }
                ]}
              />
            </div>
            <div>
              <label style={s.label}>Layout Density</label>
              <SegmentedControl 
                value={density} 
                onChange={setDensity}
                options={[
                  { value: "compact",     label: "Compact" },
                  { value: "comfortable", label: "Comfort" },
                  { value: "airy",        label: "Airy" }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={s.panel}>
        <h2 style={s.title}>Notification Preferences</h2>
        <SwitchRow 
          label="Email Alerts" desc="Receive notifications about account activity via email." icon={Bell}
          enabled={notifs.emailAlerts} onToggle={() => setNotifs({...notifs, emailAlerts: !notifs.emailAlerts})}
        />
        <SwitchRow 
          label="Browser Notifications" desc="Get real-time alerts on your desktop while using the app." icon={Monitor}
          enabled={notifs.browserNotifs} onToggle={() => setNotifs({...notifs, browserNotifs: !notifs.browserNotifs})}
        />
      </div>

      {/* Language */}
      <div style={s.panel}>
        <h2 style={s.title}>Language & Region</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={s.label}>Local Language</label>
            <SegmentedControl 
              value={region.language} 
              onChange={(v) => setRegion({...region, language: v})}
              options={[
                { value: "english", label: "English (US)" },
                { value: "french",  label: "Français" },
                { value: "spanish", label: "Español" }
              ]}
            />
          </div>
          <div>
            <label style={s.label}>Timezone</label>
            <SegmentedControl 
              value={region.timezone} 
              onChange={(v) => setRegion({...region, timezone: v})}
              options={[
                { value: "UTC",   label: "UTC" },
                { value: "EST",   label: "EST (Eastern)" },
                { value: "GMT+1", label: "GMT+1 (WAT)" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div style={s.panel}>
        <h2 style={s.title}>Accessibility</h2>
        <SwitchRow 
          label="Reduce Motion" desc="Minimize animations for a smoother, static experience." icon={Smartphone}
          enabled={access.reduceMotion} onToggle={() => setAccess({...access, reduceMotion: !access.reduceMotion})}
        />
        <SwitchRow 
          label="High Contrast" desc="Increase text readability with higher contrast colors." icon={Eye}
          enabled={access.highContrast} onToggle={() => setAccess({...access, highContrast: !access.highContrast})}
        />
      </div>
    </div>
  );
}
