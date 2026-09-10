"use client";
import { useEffect, useRef, useState } from "react";

export default function Network({ data }) {
  const ref = useRef(null);
  const [sel, setSel] = useState(null);
  const stateRef = useRef({ nodes: [], edges: [] });

  useEffect(() => {
    const W = 720, H = 520;
    const maxF = Math.max(...data.nodes.map((n) => n.freq));
    const nodes = data.nodes.map((n, i) => {
      const a = (i / data.nodes.length) * Math.PI * 2;
      return {
        ...n,
        r: 8 + 26 * Math.sqrt(n.freq / maxF),
        x: W / 2 + Math.cos(a) * 180 + (Math.random() - 0.5) * 40,
        y: H / 2 + Math.sin(a) * 180 + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
      };
    });
    const idx = Object.fromEntries(nodes.map((n) => [n.name, n]));
    const edges = data.edges.map((e) => ({ ...e, s: idx[e.source], t: idx[e.target] }));
    const maxW = Math.max(...edges.map((e) => e.weight));
    let raf, iter = 0;
    const step = () => {
      iter++;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          let d2 = dx * dx + dy * dy || 1;
          const f = 2600 / d2;
          const d = Math.sqrt(d2);
          a.vx += (dx / d) * f; a.vy += (dy / d) * f;
          b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
        }
      }
      edges.forEach((e) => {
        let dx = e.t.x - e.s.x, dy = e.t.y - e.s.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = 90 + 120 * (1 - e.weight / maxW);
        const f = (d - target) * 0.008;
        e.s.vx += (dx / d) * f; e.s.vy += (dy / d) * f;
        e.t.vx -= (dx / d) * f; e.t.vy -= (dy / d) * f;
      });
      nodes.forEach((n) => {
        n.vx += (W / 2 - n.x) * 0.002;
        n.vy += (H / 2 - n.y) * 0.002;
        n.x += n.vx * 0.85; n.y += n.vy * 0.85;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x));
        n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y));
      });
      stateRef.current = { nodes: [...nodes], edges: [...edges], W, H, maxW };
      if (ref.current) ref.current.dispatchEvent(new Event("tick"));
      if (iter < 320) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [data]);

  const [, force] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = () => force((x) => x + 1);
    el.addEventListener("tick", h);
    return () => el.removeEventListener("tick", h);
  }, []);

  const { nodes = [], edges = [], W = 720, H = 520 } = stateRef.current;
  const color = (name) =>
    name === "贺平生" ? "#e6b866" : name === "乔慧珠" ? "#e57ba0" : "#4fd6a8";

  return (
    <div style={{ overflowX: "auto" }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480 }}>
        {edges.map((e, i) => {
          const hot = sel && (e.source === sel || e.target === sel);
          return (
            <line key={i} x1={e.s?.x} y1={e.s?.y} x2={e.t?.x} y2={e.t?.y}
              stroke={hot ? "#e6b866" : "#2f3a4c"}
              strokeWidth={hot ? 1.8 : 0.4 + (e.weight / (stateRef.current.maxW || 1)) * 2}
              strokeOpacity={sel ? (hot ? 0.9 : 0.12) : 0.5} />
          );
        })}
        {nodes.map((n, i) => {
          const dim = sel && sel !== n.name &&
            !edges.some((e) => (e.source === sel && e.target === n.name) || (e.target === sel && e.source === n.name));
          return (
            <g key={i} style={{ cursor: "pointer", opacity: dim ? 0.25 : 1 }}
              onMouseEnter={() => setSel(n.name)} onMouseLeave={() => setSel(null)}>
              <circle cx={n.x} cy={n.y} r={n.r} fill={color(n.name)} fillOpacity="0.85"
                stroke="#0d0f14" strokeWidth="1.5" />
              <text x={n.x} y={n.y + n.r + 12} textAnchor="middle" fill="#e8ebf0"
                fontSize={n.name === "贺平生" ? 14 : 12}
                fontWeight={n.name === "贺平生" || n.name === "乔慧珠" ? 700 : 400}>
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="legend">
        <span><i style={{ background: "#e6b866" }} />主角 贺平生</span>
        <span><i style={{ background: "#e57ba0" }} />配角视角 乔慧珠</span>
        <span><i style={{ background: "#4fd6a8" }} />其他角色</span>
        <span>连线=同章共现（越粗越常同框）· 悬停高亮关系</span>
      </div>
    </div>
  );
}
