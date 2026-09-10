"use client";
import { useState } from "react";

export default function Retrieval({ demo, note, lang }) {
  const [i, setI] = useState(0);
  const cur = demo[i];
  const chLabel = (n) => (lang === "zh" ? `第 ${n} 章` : `Ch ${n}`);
  const scoreLabel = lang === "zh" ? "相似度" : "score";
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        {demo.map((d, k) => (
          <button key={k} className={"q" + (k === i ? " on" : "")} onClick={() => setI(k)}>
            {d.query}
          </button>
        ))}
      </div>
      <div>
        {cur.results.map((r, k) => (
          <div className="res" key={k}>
            <div className="head">
              <span>{chLabel(r.chapter)}{r.title ? ` · ${r.title}` : ""} · {(r.pos * 100).toFixed(0)}%</span>
              <span className="score">{scoreLabel} {r.score}</span>
            </div>
            <div className="txt">{r.text ? `${r.text}…` : r.topic}</div>
          </div>
        ))}
      </div>
      <div className="hint">{note}</div>
    </div>
  );
}
