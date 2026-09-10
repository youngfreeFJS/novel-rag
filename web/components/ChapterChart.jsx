"use client";
import { useMemo, useState } from "react";

export default function ChapterChart({ chapters, hint }) {
  const [hover, setHover] = useState(null);
  const W = 1100, H = 240, padL = 46, padB = 26, padT = 14;
  const { path, area, maxV, ticks } = useMemo(() => {
    const data = chapters.map((c) => c.chars);
    const n = data.length;
    // clamp to the 96th percentile so a single very long chapter doesn't flatten the chart
    const sorted = [...data].sort((a, b) => a - b);
    const maxV = sorted[Math.min(n - 1, Math.floor(n * 0.96))] || Math.max(...data);
    const x = (i) => padL + (i / (n - 1)) * (W - padL - 12);
    const y = (v) => H - padB - (Math.min(v, maxV) / maxV) * (H - padB - padT);
    let path = "";
    data.forEach((v, i) => { path += `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)} `; });
    const area = path + `L${x(n - 1).toFixed(1)},${H - padB} L${x(0).toFixed(1)},${H - padB} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ x: padL + f * (W - padL - 12), label: Math.round(f * (n - 1)) + 1 }));
    return { path, area, maxV, ticks };
  }, [chapters]);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 680 }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - padL) / (W - padL - 12)) * (chapters.length - 1));
          if (i >= 0 && i < chapters.length) setHover(chapters[i]);
        }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4fd6a8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4fd6a8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padL} x2={W - 12} y1={H - padB - f * (H - padB - padT)} y2={H - padB - f * (H - padB - padT)} stroke="#2a3342" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#areaG)" />
        <path d={path} fill="none" stroke="#4fd6a8" strokeWidth="1" opacity="0.9" />
        {ticks.map((t, i) => (
          <text key={i} x={t.x} y={H - 8} fill="#6b7686" fontSize="11" textAnchor="middle">{t.label}</text>
        ))}
        <text x={8} y={padT + 6} fill="#6b7686" fontSize="11">{maxV}</text>
        <text x={8} y={H - padB} fill="#6b7686" fontSize="11">0</text>
      </svg>
      <div className="hint">
        {hover ? `${hover.title} · ${hover.chars}` : hint}
      </div>
    </div>
  );
}
