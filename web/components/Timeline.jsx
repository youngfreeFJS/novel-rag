"use client";
import { useMemo } from "react";

export default function Timeline({ timeline, characters }) {
  const rows = useMemo(() => {
    const order = characters.slice(0, 16).map((c) => c.name);
    return order.map((name) => {
      const arr = timeline.timeline[name] || [];
      const max = Math.max(1, ...arr);
      return { name, cells: arr.map((v) => v / max) };
    });
  }, [timeline, characters]);
  const bins = timeline.bins;
  const maxch = timeline.maxch;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, paddingLeft: 86 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <div key={f} style={{ flex: 1, fontSize: 11, color: "#6b7686", textAlign: f === 0 ? "left" : f === 1 ? "right" : "center" }}>
            第{Math.round(f * maxch) || 1}章
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", margin: "3px 0" }}>
          <div style={{ width: 80, textAlign: "right", paddingRight: 6, fontSize: 12,
            color: r.name === "乔慧珠" ? "#e57ba0" : r.name === "贺平生" ? "#e6b866" : "#c8d0dc",
            fontWeight: r.name === "乔慧珠" || r.name === "贺平生" ? 700 : 400 }}>
            {r.name}
          </div>
          <div style={{ flex: 1, display: "flex", gap: 1, height: 16 }}>
            {r.cells.map((v, i) => (
              <div key={i} title={`第${Math.round((i / bins) * maxch)}章附近`}
                style={{ flex: 1, borderRadius: 2,
                  background: r.name === "乔慧珠"
                    ? `rgba(229,123,160,${0.08 + v * 0.92})`
                    : r.name === "贺平生"
                    ? `rgba(230,184,102,${0.08 + v * 0.92})`
                    : `rgba(79,214,168,${0.06 + v * 0.9})` }} />
            ))}
          </div>
        </div>
      ))}
      <div className="hint">颜色越亮=该角色在此进度出现越密集。可见乔慧珠自第 83 章登场后贯穿全书，是理想的全程配角视角。</div>
    </div>
  );
}
