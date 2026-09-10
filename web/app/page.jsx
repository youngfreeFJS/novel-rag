"use client";
import { useEffect, useState } from "react";
import ChapterChart from "@/components/ChapterChart";
import Network from "@/components/Network";
import Timeline from "@/components/Timeline";
import Retrieval from "@/components/Retrieval";
import Pov from "@/components/Pov";

const NAV = [
  ["overview", "总览"],
  ["chapters", "章节结构"],
  ["characters", "人物图谱"],
  ["timeline", "登场时间线"],
  ["pov", "配角视角 · 乔慧珠"],
  ["retrieval", "向量检索"],
  ["pipeline", "工作流"],
];

export default function Page() {
  const [d, setD] = useState(null);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const files = ["overview", "chapters", "characters", "network", "timeline", "info_boundary", "retrieval_demo", "texts"];
    Promise.all(files.map((f) => fetch(`${BASE}/data/${f}.json`).then((r) => r.json()))).then((arr) => {
      const o = {};
      files.forEach((f, i) => (o[f] = arr[i]));
      setD(o);
    });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [d]);

  if (!d) return <div style={{ padding: 60, textAlign: "center", color: "#6b7686" }}>加载分析数据…</div>;

  const o = d.overview;
  const fmt = (n) => n.toLocaleString("zh-CN");
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const maxFreq = Math.max(...d.characters.map((c) => c.freq));

  return (
    <>
      <div className="hero">
        <h1>《{o.title}》拆解与配角视角工作台</h1>
        <div className="sub">百万字小说向量化拆解 → 配角「{o.side_pov}」视角新书 · 全流程可视化</div>
        <div className="meta">原著作者：{o.author} · {fmt(o.chapters)} 章 · {fmt(o.total_chars)} 字符 · 主角 {o.protagonist}</div>
      </div>

      <div className="nav">
        <div className="inner">
          {NAV.map(([id, label]) => (
            <button key={id} className={active === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="wrap">
        <section id="overview">
          <div className="h2">总览 <span className="tag">Stage A · 拆解</span></div>
          <p className="desc">把一部 500 万字级的修仙长篇整本读入、清洗、切章切块，抽取人物与关系，并 embedding 成可检索的向量库，作为配角视角续写的「世界真相约束层」。</p>
          <div className="cards">
            <div className="card"><div className="n">{fmt(o.total_chars)}</div><div className="l">总字符数</div></div>
            <div className="card"><div className="n">{fmt(o.chapters)}</div><div className="l">章节</div></div>
            <div className="card"><div className="n">{fmt(o.chunks)}</div><div className="l">向量块 chunks</div></div>
            <div className="card"><div className="n">{o.vector_dim}</div><div className="l">向量维度</div></div>
            <div className="card"><div className="n">{o.characters_tracked}</div><div className="l">追踪人物</div></div>
          </div>
          <p className="hint">向量化方式：{o.embed_method}（离线可跑；生产环境可替换为 BGE-M3 等语义模型）。</p>
        </section>

        <section id="chapters">
          <div className="h2">章节结构 <span className="tag">2113 章字数分布</span></div>
          <p className="desc">每章字数随剧情推进的变化。前中期章节较短、后期长篇化，是典型的连载网文节奏。</p>
          <div className="panel"><ChapterChart chapters={d.chapters} /></div>
        </section>

        <section id="characters">
          <div className="h2">人物图谱 <span className="tag">词频 + 共现网络</span></div>
          <p className="desc">按出场频次排名的核心人物，及其「同章共现」关系网。主角贺平生（金）居中，配角视角人选乔慧珠（粉）是全书出场最多的女性角色。</p>
          <div className="grid2">
            <div className="panel">
              <div style={{ fontSize: 13, color: "#9aa6b8", marginBottom: 10 }}>出场频次 Top 16</div>
              {d.characters.slice(0, 16).map((c) => (
                <div className="bar-row" key={c.name}>
                  <div className="name" style={{ color: c.name === "乔慧珠" ? "#e57ba0" : c.name === "贺平生" ? "#e6b866" : undefined }}>{c.name}</div>
                  <div className="track"><div className="fill" style={{ width: `${(c.freq / maxFreq) * 100}%`,
                    background: c.name === "乔慧珠" ? "linear-gradient(90deg,#b34e73,#e57ba0)" : c.name === "贺平生" ? "linear-gradient(90deg,#b8933f,#e6b866)" : undefined }} /></div>
                  <div className="val">{fmt(c.freq)}</div>
                </div>
              ))}
            </div>
            <div className="panel"><Network data={d.network} /></div>
          </div>
        </section>

        <section id="timeline">
          <div className="h2">登场时间线 <span className="tag">全书密度热力</span></div>
          <p className="desc">每个角色在故事进度中的出场密度。用来判断哪个配角适合做「全程视角」——乔慧珠自第 83 章登场后一路陪跑到结局。</p>
          <div className="panel"><Timeline timeline={d.timeline} characters={d.characters} /></div>
        </section>

        <section id="pov">
          <div className="h2">配角视角 · 乔慧珠 <span className="tag">Stage B · 生成</span></div>
          <p className="desc">选定配角乔慧珠，产出她的「人物圣经」「信息边界表」，并示范一章她视角的改写。核心是<b> 信息差</b>：聚宝盆的秘密她永不知晓，而秘境私情主角却不知情。</p>
          <Pov info={d.info_boundary} texts={d.texts} />
        </section>

        <section id="retrieval">
          <div className="h2">向量检索 <span className="tag">世界真相约束层</span></div>
          <p className="desc">向量库对任意语义查询召回原著相关片段。生成新书每一章时用它回查原著、保证不与设定矛盾。</p>
          <div className="panel"><Retrieval demo={d.retrieval_demo} /></div>
        </section>

        <section id="pipeline">
          <div className="h2">工作流 <span className="tag">端到端</span></div>
          <p className="desc">从源小说到配角视角百万字新书的完整流水线。本工作台覆盖阶段 A 全部与阶段 B 的设定层与样章。</p>
          <div className="panel">
            <div style={{ fontSize: 13, color: "#4fd6a8", marginBottom: 10 }}>阶段 A · 拆解与向量化</div>
            <div className="flowbox">
              <div className="step"><div className="k">01</div><div className="t">转码清洗</div><div className="d">GB18030→UTF-8，去水印广告</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">02</div><div className="t">切章切块</div><div className="d">2113 章 → 7874 块（带重叠）</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">03</div><div className="t">人物抽取</div><div className="d">NER + 共现 + 时间线</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">04</div><div className="t">向量库</div><div className="d">256 维稠密向量，可检索</div></div>
            </div>
            <div style={{ fontSize: 13, color: "#e57ba0", margin: "20px 0 10px" }}>阶段 B · 配角视角生成</div>
            <div className="flowbox">
              <div className="step"><div className="k">05</div><div className="t">配角圣经</div><div className="d">乔慧珠档案·关系·盲区</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">06</div><div className="t">信息边界表</div><div className="d">她何时知道什么</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">07</div><div className="t">逐章生成</div><div className="d">双路召回：圣经 + 原著向量</div></div>
              <div className="arrow">→</div>
              <div className="step"><div className="k">08</div><div className="t">一致性质检</div><div className="d">不越界·不矛盾·返工</div></div>
            </div>
          </div>
        </section>
      </div>

      <div className="footer">
        《{o.title}》配角视角工作台 · 由 Claude 拆解生成 · Stage A 完成 / Stage B 设定层与样章完成
      </div>
    </>
  );
}
