"use client";
import { useEffect, useState, Fragment } from "react";
import ChapterChart from "@/components/ChapterChart";
import Network from "@/components/Network";
import Timeline from "@/components/Timeline";
import Retrieval from "@/components/Retrieval";
import Pov from "@/components/Pov";

const T = {
  en: {
    nav: { overview: "Overview", chapters: "Chapters", characters: "Characters", timeline: "Timeline", pov: "Side POV", retrieval: "Vector Search", pipeline: "Pipeline" },
    heroTitle: (o) => `${o.title} · NovelRAG Workbench`,
    heroSub: (o) => `Novel → vector store → a new book from ${o.side_pov}'s point of view · full pipeline, visualized`,
    stageA: "Stage A · Deconstruct",
    stageB: "Stage B · Generate",
    overviewDesc: "Read a whole long novel in, clean it, split into chapters and chunks, extract characters and relations, and embed it into a searchable vector store — the world-truth constraint layer for the side-POV retelling.",
    cards: { chapters: "Chapters", chunks: "Vector chunks", dim: "Vector dim", chars: "Characters" },
    embedPrefix: "Vectorization:",
    chaptersTag: "chapter length",
    chaptersDesc: "Chapter length across the story. Move your mouse to inspect any chapter.",
    charsTag: "frequency + co-occurrence",
    charsDesc: (o) => `Core characters ranked by mentions and their same-chapter co-occurrence network. Protagonist ${o.protagonist} (gold) sits at the center; the side-POV pick ${o.side_pov} is highlighted.`,
    topN: "Top 16 by mentions",
    tlTag: "presence heatmap",
    tlDesc: "How densely each character appears across the story — used to pick a character present throughout for a full side-POV.",
    povTag: "Stage B · Generate",
    povDesc: (o) => `Pick ${o.side_pov} as the point of view; produce their character bible, information-boundary table, and a sample rewritten chapter. The core is the information gap.`,
    retrTag: "world-truth layer",
    retrDesc: "The vector store recalls relevant source passages for any query — used to keep every generated chapter consistent with the original.",
    pipeTag: "end to end",
    pipeDesc: "The full pipeline from source novel to a side-POV book. This workbench covers all of Stage A plus Stage B's design layer and sample.",
    povTabs: { bible: "Character Bible", info: "Info Boundary", sample: "Sample Chapter" },
    infoCols: { fact: "Key fact", when: "When known", state: "State", use: "Dramatic use" },
    badges: { own: "hers/his", blind: "blind spot", known: "known" },
    topNote: "the female / hidden character is present throughout — an ideal full-length side POV.",
    legend: { protagonist: "Protagonist", side: "Side POV", other: "Other characters", edge: "edge = same-chapter co-occurrence · hover to highlight" },
    retrNote: "Offline vector search (TF-IDF + SVD 256-d, cosine top-5). Generation recalls the same source truth and filters it by the information-boundary table.",
    chapHint: "mentions per chapter — full-book distribution",
    steps: [
      { k: "01", t: "Clean", d: "encode, strip watermarks" },
      { k: "02", t: "Chunk", d: "chapters → overlapping chunks" },
      { k: "03", t: "Extract", d: "NER + co-occurrence + timeline" },
      { k: "04", t: "Vectorize", d: "256-d dense, searchable" },
      { k: "05", t: "Bible", d: "profile · relations · blind spots" },
      { k: "06", t: "Boundary", d: "what they know, when" },
      { k: "07", t: "Generate", d: "dual recall: bible + source" },
      { k: "08", t: "QC", d: "no leaks · no contradictions" },
    ],
    footer: (o) => `${o.title} · NovelRAG side-POV workbench · Stage A complete / Stage B design + sample`,
    switch: "中文",
    loading: "Loading analysis…",
  },
  zh: {
    nav: { overview: "总览", chapters: "章节结构", characters: "人物图谱", timeline: "登场时间线", pov: "配角视角", retrieval: "向量检索", pipeline: "工作流" },
    heroTitle: (o) => `《${o.title}》拆解与配角视角工作台`,
    heroSub: (o) => `百万字小说向量化拆解 → 配角「${o.side_pov}」视角新书 · 全流程可视化`,
    stageA: "Stage A · 拆解",
    stageB: "Stage B · 生成",
    overviewDesc: "把整本长篇读入、清洗、切章切块，抽取人物与关系，并 embedding 成可检索的向量库，作为配角视角续写的「世界真相约束层」。",
    cards: { chapters: "章节", chunks: "向量块 chunks", dim: "向量维度", chars: "追踪人物" },
    embedPrefix: "向量化方式：",
    chaptersTag: "章字数分布",
    chaptersDesc: "每章字数随剧情推进的变化。移动鼠标查看每一章。",
    charsTag: "词频 + 共现网络",
    charsDesc: (o) => `按出场频次排名的核心人物，及其「同章共现」关系网。主角${o.protagonist}（金）居中，配角视角人选${o.side_pov}高亮。`,
    topN: "出场频次 Top 16",
    tlTag: "全书密度热力",
    tlDesc: "每个角色在故事进度中的出场密度——用来判断哪个配角适合做「全程视角」。",
    povTag: "Stage B · 生成",
    povDesc: (o) => `选定配角${o.side_pov}，产出人物圣经、信息边界表，并示范一章她视角的改写。核心是信息差。`,
    retrTag: "世界真相约束层",
    retrDesc: "向量库对任意语义查询召回原著相关片段，生成新书每一章时用它回查原著、保证不矛盾。",
    pipeTag: "端到端",
    pipeDesc: "从源小说到配角视角新书的完整流水线。本工作台覆盖阶段 A 全部与阶段 B 的设定层与样章。",
    povTabs: { bible: "人物圣经", info: "信息边界表", sample: "视角样章" },
    infoCols: { fact: "关键情报", when: "何时知道", state: "状态", use: "戏剧作用" },
    badges: { own: "她独有", blind: "盲区", known: "已知" },
    topNote: "配角自登场后贯穿全书——理想的全程配角视角。",
    legend: { protagonist: "主角", side: "配角视角", other: "其他角色", edge: "连线=同章共现 · 悬停高亮关系" },
    retrNote: "向量库离线检索（TF-IDF+SVD 256 维，余弦 Top-5）。生成配角视角时同样以此召回原著真相，并按信息边界表过滤。",
    chapHint: "每章字数 · 全书分布",
    steps: [
      { k: "01", t: "转码清洗", d: "编码转换，去水印" },
      { k: "02", t: "切章切块", d: "章 → 带重叠 chunk" },
      { k: "03", t: "人物抽取", d: "NER + 共现 + 时间线" },
      { k: "04", t: "向量库", d: "256 维稠密，可检索" },
      { k: "05", t: "配角圣经", d: "档案·关系·盲区" },
      { k: "06", t: "信息边界", d: "她何时知道什么" },
      { k: "07", t: "逐章生成", d: "双路召回：圣经+原著" },
      { k: "08", t: "一致性质检", d: "不越界·不矛盾" },
    ],
    footer: (o) => `《${o.title}》配角视角工作台 · Stage A 完成 / Stage B 设定层与样章`,
    switch: "EN",
    loading: "加载分析数据…",
  },
};

const NAV_KEYS = ["overview", "chapters", "characters", "timeline", "pov", "retrieval", "pipeline"];

export default function Page() {
  const [lang, setLang] = useState("en");
  const [d, setD] = useState(null);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    try { const s = localStorage.getItem("nr_lang"); if (s === "zh" || s === "en") setLang(s); } catch {}
  }, []);

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const files = ["overview", "chapters", "characters", "network", "timeline", "info_boundary", "retrieval_demo", "texts"];
    setD(null);
    Promise.all(files.map((f) => fetch(`${BASE}/data/${lang}/${f}.json`).then((r) => r.json()))).then((arr) => {
      const o = {}; files.forEach((f, i) => (o[f] = arr[i])); setD(o);
    });
  }, [lang]);

  useEffect(() => {
    if (!d) return;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_KEYS.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [d]);

  const t = T[lang];
  const toggle = () => { const nl = lang === "en" ? "zh" : "en"; setLang(nl); try { localStorage.setItem("nr_lang", nl); } catch {} };

  if (!d) return (
    <div style={{ padding: 60, textAlign: "center", color: "#6b7686" }}>
      <button className="langbtn" onClick={toggle}>{t.switch}</button>
      <div style={{ marginTop: 20 }}>{t.loading}</div>
    </div>
  );

  const o = d.overview;
  const pKey = o.protagonist_key || o.protagonist;
  const sKey = o.side_key || o.side_pov;
  const fmt = (n) => n.toLocaleString(lang === "zh" ? "zh-CN" : "en-US");
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const maxFreq = Math.max(...d.characters.map((c) => c.freq));

  return (
    <>
      <button className="langbtn floating" onClick={toggle} title="Language">{t.switch}</button>

      <div className="hero">
        <h1>{t.heroTitle(o)}</h1>
        <div className="sub">{t.heroSub(o)}</div>
        <div className="meta">{o.meta}</div>
      </div>

      <div className="nav">
        <div className="inner">
          {NAV_KEYS.map((id) => (
            <button key={id} className={active === id ? "on" : ""} onClick={() => go(id)}>{t.nav[id]}</button>
          ))}
        </div>
      </div>

      <div className="wrap">
        <section id="overview">
          <div className="h2">{t.nav.overview} <span className="tag">{t.stageA}</span></div>
          <p className="desc">{t.overviewDesc}</p>
          <div className="cards">
            <div className="card"><div className="n">{fmt(o.primary)}</div><div className="l">{o.primary_label}</div></div>
            <div className="card"><div className="n">{fmt(o.chapters)}</div><div className="l">{t.cards.chapters}</div></div>
            <div className="card"><div className="n">{fmt(o.chunks)}</div><div className="l">{t.cards.chunks}</div></div>
            <div className="card"><div className="n">{o.vector_dim}</div><div className="l">{t.cards.dim}</div></div>
            <div className="card"><div className="n">{o.characters_tracked}</div><div className="l">{t.cards.chars}</div></div>
          </div>
          <p className="hint">{t.embedPrefix} {o.embed_method}</p>
        </section>

        <section id="chapters">
          <div className="h2">{t.nav.chapters} <span className="tag">{t.chaptersTag}</span></div>
          <p className="desc">{t.chaptersDesc}</p>
          <div className="panel"><ChapterChart chapters={d.chapters} hint={t.chapHint} /></div>
        </section>

        <section id="characters">
          <div className="h2">{t.nav.characters} <span className="tag">{t.charsTag}</span></div>
          <p className="desc">{t.charsDesc(o)}</p>
          <div className="grid2">
            <div className="panel">
              <div style={{ fontSize: 13, color: "#9aa6b8", marginBottom: 10 }}>{t.topN}</div>
              {d.characters.slice(0, 16).map((c) => (
                <div className="bar-row" key={c.name}>
                  <div className="name" style={{ color: c.name === sKey ? "#e57ba0" : c.name === pKey ? "#e6b866" : undefined }}>{c.name}</div>
                  <div className="track"><div className="fill" style={{ width: `${(c.freq / maxFreq) * 100}%`,
                    background: c.name === sKey ? "linear-gradient(90deg,#b34e73,#e57ba0)" : c.name === pKey ? "linear-gradient(90deg,#b8933f,#e6b866)" : undefined }} /></div>
                  <div className="val">{fmt(c.freq)}</div>
                </div>
              ))}
            </div>
            <div className="panel"><Network data={d.network} pKey={pKey} sKey={sKey} pName={o.protagonist} sName={o.side_pov} legend={t.legend} /></div>
          </div>
        </section>

        <section id="timeline">
          <div className="h2">{t.nav.timeline} <span className="tag">{t.tlTag}</span></div>
          <p className="desc">{t.tlDesc}</p>
          <div className="panel"><Timeline timeline={d.timeline} characters={d.characters} protagonist={pKey} side={sKey} note={t.topNote} /></div>
        </section>

        <section id="pov">
          <div className="h2">{t.nav.pov} · {o.side_pov} <span className="tag">{t.povTag}</span></div>
          <p className="desc">{t.povDesc(o)}</p>
          <Pov info={d.info_boundary} texts={d.texts} tabs={t.povTabs} cols={t.infoCols} badges={t.badges} lang={lang} />
        </section>

        <section id="retrieval">
          <div className="h2">{t.nav.retrieval} <span className="tag">{t.retrTag}</span></div>
          <p className="desc">{t.retrDesc}</p>
          <div className="panel"><Retrieval demo={d.retrieval_demo} note={t.retrNote} lang={lang} /></div>
        </section>

        <section id="pipeline">
          <div className="h2">{t.nav.pipeline} <span className="tag">{t.pipeTag}</span></div>
          <p className="desc">{t.pipeDesc}</p>
          <div className="panel">
            <div style={{ fontSize: 13, color: "#4fd6a8", marginBottom: 10 }}>{t.stageA}</div>
            <div className="flowbox">
              {t.steps.slice(0, 4).map((s, i) => (
                <Fragment key={s.k}>
                  <div className="step"><div className="k">{s.k}</div><div className="t">{s.t}</div><div className="d">{s.d}</div></div>
                  {i < 3 && <div className="arrow">→</div>}
                </Fragment>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#e57ba0", margin: "20px 0 10px" }}>{t.stageB}</div>
            <div className="flowbox">
              {t.steps.slice(4).map((s, i) => (
                <Fragment key={s.k}>
                  <div className="step"><div className="k">{s.k}</div><div className="t">{s.t}</div><div className="d">{s.d}</div></div>
                  {i < 3 && <div className="arrow">→</div>}
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="footer">{t.footer(o)}</div>
    </>
  );
}
