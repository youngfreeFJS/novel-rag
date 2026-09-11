<div align="center">

# NovelRAG

**Deconstruct a full-length novel into a vector store, then rewrite it as a parallel novel from a *supporting character's* point of view.**

*把一部长篇小说拆解成向量库，再从一个「配角」的视角，续写一部与原著严丝合缝的平行长篇。*

[![License: MIT](https://img.shields.io/badge/License-MIT-e6b866.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](web)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-4fd6a8?logo=python&logoColor=white)](pipeline)
[![Live Demo](https://img.shields.io/badge/Live_Demo-youngfreefjs.github.io-2fae86?logo=github&logoColor=white)](https://youngfreefjs.github.io/novel-rag/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-4fd6a8.svg)](#roadmap)

**English** · [中文 README](README.zh.md) · [🌐 Live Demo](https://youngfreefjs.github.io/novel-rag/)

![NovelRAG — character appearance share and relationship topology](docs/hero.gif)

</div>

---

## What it is

`NovelRAG` is an open-source pipeline for **novel deconstruction + supporting-character retelling**, in two stages:

- **Stage A — Deconstruct & Vectorize.** Clean a whole novel, split it into chapters and overlapping chunks, extract characters / relations / timeline, and embed everything into a searchable vector store — the *world-truth constraint layer* for the retelling.
- **Stage B — Side-POV Generation.** Pick a supporting character, produce their **character bible** and an **information-boundary table**, then generate chapter by chapter — each chapter recalls the source vector store for consistency, filtered by what the character is allowed to know at that point.

The soul of a side-POV novel is the **information gap**: the reader follows the side character and sees the half of the story the protagonist's POV hides. Truths the original revealed long ago, the side character may piece together only late — or never.

## Showcases

The visualization ships with **two languages, two showcases** — toggle with the button in the top-right of the demo.

| Language | Source | Protagonist | Side POV | Why it's a great gap |
|---|---|---|---|---|
| 🇬🇧 English | *Harry Potter*, Books 1–7 | Harry Potter | **Severus Snape** | His true allegiance and his motive are hidden from nearly everyone for the entire series. |
| 🇨🇳 中文 | 《聚宝仙盆》(2,113 ch / 5M chars) | 贺平生 | **乔慧珠** | She never learns the secret behind the hero's impossible rise. |

<table>
<tr>
<td width="50%"><img src="docs/screenshot-characters.png"/><br><sub>Character ranking + co-occurrence network</sub></td>
<td width="50%"><img src="docs/screenshot-pov.png"/><br><sub>Side-character bible &amp; information boundary</sub></td>
</tr>
</table>

## Architecture

```
source novel (txt)
   │
   ├─[Stage A]─► clean ─► chapter/chunk split ─► character & relation & timeline extraction ─► vector store (world-truth layer)
   │                                                     │
   │                                                     └─► side-character bible + information-boundary table
   │
   └─[Stage B]─► side-POV outline ─► per-chapter generation (dual recall) ─► consistency QC ─► side-POV novel
                                            ▲              ▲
                                    character bible   source vector store
```

## Quick start

**Visualization (Next.js)**

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```
Seven sections: Overview / Chapters / Characters / Timeline / Side POV / Vector Search / Pipeline. All charts are hand-written SVG — zero third-party chart libraries. Language toggle top-right.

**Deconstruction pipeline (Python)**

```bash
cd pipeline
pip install -r requirements.txt
# put your source novel at ./source/raw.txt (UTF-8), then:
python 01_clean_split.py    # clean + chapter split
python 02_chunk.py          # two-level overlapping chunks
python 04_char_stats.py     # frequency / co-occurrence / timeline
python 05_embed.py          # vectorize (offline TF-IDF + SVD-256)
python 06_search.py         # interactive vector search
python 07_export.py         # export data for the visualization
```

> Vectorization defaults to an offline `TF-IDF + SVD (256-d)` stack — no external calls needed. Swap `05_embed.py` for a semantic model such as **BGE-M3** for stronger retrieval.

## 🌐 Live demo (GitHub Pages)

The visualization is configured for **static GitHub Pages deployment** — anyone can view the showcase in a browser with no Node install.

On every push to `main`, the bundled GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes it. **Enable Pages once first** — repo **Settings → Pages → Source → GitHub Actions** (the default token can't create the Pages site for you). Then the demo lives at:

```
https://youngfreefjs.github.io/novel-rag/
```
If you rename the repo, update `NEXT_PUBLIC_BASE_PATH: /novel-rag` in the workflow to match.

## Layout

| Dir | Contents |
|---|---|
| `web/` | Next.js 14 visualization (App Router, hand-written SVG charts, i18n) |
| `pipeline/` | Deconstruction scripts 01–07 (clean → chunk → extract → vectorize → search → export) |
| `showcase/` | Derived analysis for both showcases + side-character bibles / boundaries / sample chapters |
| `docs/` | Design doc, screenshots |

## ⚠️ Copyright

This repository ships **tooling** and **original, derived artifacts only** — never the source novels' full text or full chunk/vector files (they are `.gitignore`d). Published content is limited to: code, aggregate statistics (counts, character frequencies, co-occurrence, timeline), original analysis (character bibles, sample chapters written by this tool as transformative commentary), and — for the Chinese showcase only — short retrieval snippets (≤220 chars). The English showcase publishes **no source passages** at all. Use any source text within your own lawful rights; the novels remain the property of their authors.

## Roadmap

- [ ] Stage B generator: volume outline → chapter outline → prose, wired to an LLM
- [ ] Pluggable vector backends (Qdrant / Chroma / BGE-M3)
- [ ] Consistency-QC agent (leak detection + auto-revision)
- [ ] One-click side-character switching

## License

Code released under the [MIT License](LICENSE). Showcase novel texts are **not** included and remain the property of their original authors.
