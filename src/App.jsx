import { useState } from "react";
import SimpleViz from "./visualizers/SimpleViz.jsx";
import DeepViz from "./visualizers/DeepViz.jsx";

const VIEWS = [
  {
    id: "simple",
    label: "Quick Visual",
    icon: "⚡",
    tag: "BEGINNER",
    desc: "Step through the array with color-coded cells and hashmap",
    component: SimpleViz,
  },
  {
    id: "deep",
    label: "Deep Dive",
    icon: "🔬",
    tag: "ADVANCED",
    desc: "Python code + prefix sum graph + full algorithm breakdown",
    component: DeepViz,
  },
];

export default function App() {
  const [active, setActive] = useState("simple");
  const [showPicker, setShowPicker] = useState(true);

  const ActiveComponent = VIEWS.find(v => v.id === active).component;

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Persistent top strip */}
      <div style={{
        background: "#0a0d16",
        borderBottom: "1px solid #1a2035",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        height: 44,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Question label */}
        <div style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 12,
          fontWeight: 800,
          color: "#2d3f60",
          letterSpacing: 1,
          marginRight: 24,
          whiteSpace: "nowrap",
        }}>
          LC · LONGEST EQUAL SUBARRAY
        </div>

        {/* Tabs */}
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => { setActive(v.id); setShowPicker(false); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 600,
              color: active === v.id ? "#e2e8f0" : "#2d3f60",
              padding: "0 16px",
              height: "100%",
              borderBottom: active === v.id ? "2px solid #6366f1" : "2px solid transparent",
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            <span>{v.icon}</span>
            <span>{v.label}</span>
            <span style={{
              fontSize: 8,
              background: active === v.id ? "#6366f122" : "#0d1321",
              color: active === v.id ? "#818cf8" : "#1e2740",
              border: `1px solid ${active === v.id ? "#6366f144" : "#1a2035"}`,
              borderRadius: 3,
              padding: "1px 5px",
              letterSpacing: 1,
            }}>{v.tag}</span>
          </button>
        ))}
      </div>

      {/* Mode picker shown on first load */}
      {showPicker && (
        <div style={{
          position: "fixed", inset: 0, top: 44,
          background: "#080b14cc",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <div style={{ maxWidth: 520, width: "100%" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#e2e8f0", textAlign: "center", marginBottom: 8 }}>
              Choose Your View
            </div>
            <div style={{ fontSize: 12, color: "#2d3f60", textAlign: "center", marginBottom: 32, letterSpacing: 1 }}>
              LONGEST SUBARRAY · EQUAL 0s & 1s
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setActive(v.id); setShowPicker(false); }}
                  style={{
                    background: "#0d1321",
                    border: "1px solid #1a2740",
                    borderRadius: 12,
                    padding: "24px 20px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#0f1528"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2740"; e.currentTarget.style.background = "#0d1321"; }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{v.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontSize: 9, color: "#818cf8", letterSpacing: 2, marginBottom: 10 }}>{v.tag}</div>
                  <div style={{ fontSize: 11, color: "#4a5a70", lineHeight: 1.6 }}>{v.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "#1e2740" }}>
              You can switch anytime using the tabs above
            </div>
          </div>
        </div>
      )}

      {/* Active visualizer */}
      <ActiveComponent />
    </div>
  );
}
