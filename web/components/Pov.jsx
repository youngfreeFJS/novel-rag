"use client";
import { useState } from "react";

function md(text) {
  // minimal markdown -> react-ish HTML string (safe: our own content)
  const lines = text.split("\n");
  const out = [];
  let list = [];
  const flush = () => {
    if (list.length) { out.push(`<ul>${list.map((l) => `<li>${l}</li>`).join("")}</ul>`); list = []; }
  };
  const inline = (s) =>
    s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
     .replace(/【(.+?)】/g, '<span style="color:#e6b866">【$1】</span>');
  for (let ln of lines) {
    if (/^#\s/.test(ln)) { flush(); out.push(`<h2>${inline(ln.slice(2))}</h2>`); }
    else if (/^##\s/.test(ln)) { flush(); out.push(`<h3 style="color:#4fd6a8">${inline(ln.slice(3))}</h3>`); }
    else if (/^###\s/.test(ln)) { flush(); out.push(`<h4>${inline(ln.slice(4))}</h4>`); }
    else if (/^>/.test(ln)) { flush(); out.push(`<blockquote style="border-left:2px solid #2fae86;padding-left:12px;color:#9aa6b8;margin:8px 0">${inline(ln.replace(/^>\s?/, ""))}</blockquote>`); }
    else if (/^[-*]\s/.test(ln)) { list.push(inline(ln.slice(2))); }
    else if (/^\d+\.\s/.test(ln)) { list.push(inline(ln.replace(/^\d+\.\s/, ""))); }
    else if (/^---/.test(ln)) { flush(); out.push("<hr style='border:0;border-top:1px solid #2a3342;margin:14px 0'/>"); }
    else if (ln.trim() === "") { flush(); }
    else { flush(); out.push(`<p style="margin:6px 0">${inline(ln)}</p>`); }
  }
  flush();
  return out.join("");
}

export default function Pov({ info, texts, tabs, cols, badges, lang }) {
  const [tab, setTab] = useState("bible");
  const badge = (f) => {
    const tier = f.tier || "known";
    if (tier === "own") return <span className="badge own">{badges.own}</span>;
    if (tier === "blind") return <span className="badge never">{badges.blind}</span>;
    return <span className="badge known">{badges.known}</span>;
  };
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className={"q" + (tab === "bible" ? " on" : "")} onClick={() => setTab("bible")}>{tabs.bible}</button>
        <button className={"q" + (tab === "info" ? " on" : "")} onClick={() => setTab("info")}>{tabs.info}</button>
        <button className={"q" + (tab === "sample" ? " on" : "")} onClick={() => setTab("sample")}>{tabs.sample}</button>
      </div>

      {tab === "bible" && (
        <div className="panel prose" dangerouslySetInnerHTML={{ __html: md(texts.bible) }} />
      )}

      {tab === "info" && (
        <div className="panel">
          <p className="desc">{info.notes}</p>
          <table>
            <thead><tr><th>{cols.fact}</th><th>{cols.when}</th><th>{cols.state}</th><th>{cols.use}</th></tr></thead>
            <tbody>
              {info.facts.map((f, i) => (
                <tr key={i}>
                  <td style={{ color: "#e8ebf0" }}>{f.fact}</td>
                  <td style={{ color: "#9aa6b8", whiteSpace: "nowrap" }}>
                    {f.known_at_chapter === null || f.known_at_chapter === undefined
                      ? "—" : (lang === "zh" ? `第 ${f.known_at_chapter} 章` : `Ch ${f.known_at_chapter}`)}
                  </td>
                  <td>{badge(f)}<div style={{ fontSize: 11, color: "#6b7686", marginTop: 3 }}>{f.state}</div></td>
                  <td style={{ color: "#9aa6b8" }}>{f.dramatic_use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "sample" && (
        <div className="panel prose" dangerouslySetInnerHTML={{ __html: md(texts.sample) }} />
      )}
    </div>
  );
}
