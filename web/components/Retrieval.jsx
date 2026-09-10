"use client";
import { useState } from "react";

export default function Retrieval({ demo }) {
  const [i, setI] = useState(0);
  const cur = demo[i];
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
              <span>第 {r.chapter} 章《{r.title}》 · 进度 {(r.pos * 100).toFixed(0)}%</span>
              <span className="score">相似度 {r.score}</span>
            </div>
            <div className="txt">{r.text}…</div>
          </div>
        ))}
      </div>
      <div className="hint">
        以上为向量库离线检索结果（jieba+TF-IDF+SVD 256 维，余弦相似度 Top-5）。生成配角视角时，同样以此召回原著「世界真相」做一致性约束——并按信息边界表过滤掉乔慧珠此刻不该知道的内容。
      </div>
    </div>
  );
}
