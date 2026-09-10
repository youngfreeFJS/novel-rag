# 配角视角百万字小说 · 完整实施方案

> 目标：读入一部约百万字的中文源小说 → 把它拆解并 embedding 成向量库 → 抽取某个**配角**的视角与信息边界 → 在此基础上生成一部约百万字、且与原著严丝合缝的**配角视角新小说**。
>
> 核心判断：没有任何现成项目能一键做完全程。这是一条「**拆解/向量化**（阶段 A）+ **长篇生成**（阶段 B）」拼装的工作流。本文档给出可直接落地的两段设计。

---

## 0. 一句话架构

```
源小说(百万字 txt)
   │
   ├─[阶段A 拆解]──► 章节/场景切块 ─► 人物·关系·时间线抽取 ─► 向量库(世界真相层)
   │                                            │
   │                                            └─► 配角"人物圣经" + 信息边界表
   │
   └─[阶段B 生成]──► 配角视角大纲 ─► 逐章生成(双路召回) ─► 一致性质检 ─► 百万字新书
                                        ▲          ▲
                                  配角圣经     源小说向量库
```

阶段 A 产出的向量库在阶段 B 里当**「世界真相约束层」**：新书写到任何情节，都能回查原著，保证不与原著矛盾；同时靠「配角信息边界表」制造只有配角小说才有的**信息差张力**。

---

## 1. 推荐目录结构

```
side-pov-novel/
├── source/                     # 源小说
│   └── raw.txt
├── stage_a_analysis/           # 阶段A：拆解与向量化
│   ├── 01_chunks/              # 切块结果 (jsonl)
│   ├── 02_entities/            # 人物/关系/时间线抽取
│   │   ├── characters.json
│   │   ├── relations.json
│   │   └── timeline.json
│   ├── 03_vectorstore/         # 向量库持久化 (Qdrant/Chroma)
│   └── 04_bible/               # 配角产出
│       ├── side_char_bible.md  # 配角人物圣经
│       └── info_boundary.json  # 配角信息边界表(他何时知道什么)
├── stage_b_writing/            # 阶段B：生成
│   ├── outline/                # 分卷/分章大纲
│   ├── chapters/               # 逐章正文
│   └── memory/                 # 新书自身的长程记忆(状态/伏笔)
├── scripts/                    # 处理脚本
└── config.yaml                 # 模型/embedding/路径配置
```

---

## 2. 阶段 A：源小说拆解与向量化

### A1. 文本预处理与切块（chunking）

中文长篇的切块策略直接决定后续召回质量。建议**两级切块**：

- **一级：按「章」分割** —— 用正则匹配「第X章 / 第X回 / Chapter」标题，保留章号与章标题作为 metadata。
- **二级：章内按「场景/自然段边界」再切** —— 每块约 **500–800 字**，块间 **重叠 80–120 字**（overlap），避免语义在边界处断裂。对话密集处可按「场景切换」（时间/地点/人物变化）切。

每个 chunk 存成一条记录，携带 metadata：
```json
{"id":"ch012_003","chapter":12,"title":"雪夜","scene":3,
 "chars":["主角","你的配角","反派甲"],"pos":0.31,"text":"..."}
```
`pos`（0–1 的全书进度）和 `chapter` 在阶段 B 做**信息差过滤**时是关键——只召回「配角在当前进度前已能知道」的内容。

工具：纯 Python + 正则即可；复杂排版可用 `langchain` 的 `RecursiveCharacterTextSplitter`（中文按标点分隔符定制）。

### A2. 人物 / 关系 / 时间线抽取

目的：把源小说结构化，锁定你的配角，理清他的登场脉络。两条路线：

**路线①（推荐，快而准）用 LLM 抽取**
逐章喂给 LLM，产出结构化 JSON：本章出现人物、人物做了什么、人物间关系变化、关键事件+发生时间/地点、伏笔。百万字≈几百章，可并行批处理。产出汇总成 `characters.json` / `relations.json` / `timeline.json`。

**路线②（离线/省钱）用 NLP 工具**
- [lingjiameng/NER4Novel](https://github.com/lingjiameng/NER4Novel)：基于 HanLP 的小说人名统计 + 关系提取，专门针对小说，轻量。
- [liuhuanyong/PersonRelationKnowledgeGraph](https://github.com/liuhuanyong/PersonRelationKnowledgeGraph)：中文人物关系知识图谱，把角色网络结构化。
- 兜底词库/工具集：[fighting41love/funNLP](https://github.com/fighting41love/funnlp)。

实践上：先用路线②快速跑出人物清单锁定配角，再用路线①对**该配角相关章节**做精抽取，成本可控。

### A3. 向量库构建（世界真相层）

- **Embedding 模型（中文）**：首选 **BGE-M3** 或 `bge-large-zh-v1.5`（开源、可本地、中文强）；要省事用云端 `text-embedding-3-large`。
- **向量库**：`Qdrant`（生产级、支持 metadata 过滤，强烈推荐，因为信息差过滤要靠 metadata）或 `Chroma`（本地起步最简单）。
- **入库**：A1 的每个 chunk → embedding → 连同 metadata 写入。百万字约几千个 chunk，量级很小，本地即可。
- 参考全栈教程：[datawhalechina/all-in-rag](https://github.com/datawhalechina/all-in-rag)。

### A4. 生成配角「人物圣经」+ 信息边界表

这是阶段 A 的最终交付，也是整个项目的灵魂。

**`side_char_bible.md`（配角人物圣经）**，至少包含：
- 基本档案：姓名、身份、外貌、口头禅/语言风格。
- 性格与动机：他真正想要什么？恐惧什么？
- 完整行动轨迹：他在原著里每次登场做了什么（从 timeline 里过滤出他相关的事件）。
- 关系网：他和主角/其他角色的关系、恩怨、未说出口的情绪。
- **视角盲区**：原著里主角视角看到、但这个配角**不可能知道**的信息（这些是你新书的悬念来源）。

**`info_boundary.json`（信息边界表）**——每条关键情报，标注「配角在第几章/进度多少时才知道」：
```json
[{"fact":"主角其实是卧底","known_to_side_char_at_chapter":47,"before_that":"hidden"},
 {"fact":"雪夜刺杀是反派甲策划","known_to_side_char_at_chapter":null,"before_that":"永远不知道"}]
```
阶段 B 生成每一章时，用它过滤向量召回：**只让配角知道他此刻该知道的事**。

---

## 3. 阶段 B：配角视角百万字生成

### B1. 三个候选生成框架（按契合度）

| 框架 | Star | 长程一致性 | 能否装进当前环境 | 许可 | 备注 |
|---|---|---|---|---|---|
| [MaoXiaoYuZ/Long-Novel-GPT](https://github.com/MaoXiaoYuZ/Long-Novel-GPT) | ~1.2k | RAG 召回原文 | Docker | — | **唯一原生支持「导入已有小说改写」**，最贴合"基于原著续写"这一步 |
| [leenbj/novel-creator-skill](https://github.com/leenbj/novel-creator-skill) | 632 | 文件级记忆+知识图谱+五层质检 | ✅ Claude Code 技能，可直接跑 | MIT | 号称支持 300 万字；`/一键开书` `/继续写` `/修复本章` |
| [YILING0013/AI_NovelGenerator](https://github.com/YILING0013/AI_NovelGenerator) | 6k+ | 向量语义检索+状态追踪+自动校对 | 独立 GUI | AGPL-3.0 | 最成熟，但只从零生成、不导入 |
| [Xiaoyangy/novel-studio](https://github.com/Xiaoyangy/novel-studio) | 少 | 多智能体+Qdrant/BM25 RAG+断点恢复 | Docker | Apache-2.0 | 有 `protagonist_projection` 视角投影机制，正好参考做信息差 |

**建议组合**：用 **Long-Novel-GPT** 承接「基于原著改写」的能力，或用 **novel-creator-skill** 在本环境直接跑长篇质检流程；两者都接上阶段 A 的向量库和配角圣经。不用完全依赖单一框架——你完全可以只借它的「大纲→章节→正文逐级扩写 + 逐章质检」骨架，召回层换成你自己的双路召回。

### B2. 生成主循环（每章都这样跑）

```
for 每一章:
  1. 读 outline[本章目标] + 配角圣经 + 新书memory(前情/伏笔/状态)
  2. 双路召回:
       ① 配角圣经 & 信息边界表 → 他此刻的认知边界
       ② 源小说向量库(带 metadata 过滤: pos ≤ 当前进度 且 配角已知) → 原著真相
  3. LLM 生成本章正文(严格限定在配角视角与信息边界内)
  4. 一致性质检: 与原著硬事实是否冲突? 配角是否"知道了不该知道的"? 人设/伏笔是否漂移?
  5. 不过关 → 自动返工重写; 过关 → 落盘 + 更新新书memory
```

### B3. 关键设计 —— 信息差（配角小说的命脉）

配角视角小说好看的根本，是**信息差**：读者跟着配角，看到的是被主角视角遮蔽的另一面。三条铁律：

1. **只写配角当时能感知的**——他不在场的情节不能直接叙述，只能通过传闻、猜测、事后得知。
2. **主角视角的"答案"要延迟或永久隐藏**——用 `info_boundary.json` 卡住。原著第 3 章就揭示的真相，配角可能到第 200 章才拼凑出来，甚至一辈子被蒙在鼓里。
3. **制造"原著同一事件的另一种解读"**——同一场雪夜，主角视角是英雄救美，配角视角可能是他误会、嫉妒、或看到了主角没注意的破绽。这是配角小说的最大爽点。

novel-studio 的 `protagonist_projection`（只暴露主视角可见事实、hidden/delayed 信息不提前进正文）就是这套机制的现成实现，值得直接借鉴。

---

## 4. 里程碑与字数节奏

百万字不是一次生成，是**长跑**。建议：

- **M0 打通闭环**：先只处理源小说的**前 5 万字**，跑通「拆解→向量库→配角圣经→生成 3 章」，验证整条链路和信息差效果。
- **M1 全量拆解**：源小说全量入库，配角圣经与信息边界表定稿。
- **M2 分卷大纲**：把新书拆成 4–6 卷、每卷 15–25 万字，先写卷纲再写章纲。
- **M3 量产**：逐卷生成，每卷完成后做一次跨章一致性大质检 + 人工抽样审阅。
- 节奏参考：每章 2500–4000 字，百万字≈ 250–400 章。**每卷收尾必须人工过一遍**，否则漂移会累积。

---

## 5. 成本与模型建议

- **抽取/质检**（吞吐大、要求中等）：可用较便宜的模型批处理。
- **正文生成**（要文笔）：用你能用到的最强中文长文本模型。
- **Embedding**：本地 BGE-M3 基本零成本；配角相关精抽取才用云端大模型。
- 省钱关键：阶段 A 的 LLM 抽取**只对配角相关章节精抽**，其余用 NLP 工具粗筛。

---

## 6. 立即可执行的第一步

你把中文源小说全文（txt）给我 / 放进连接的文件夹后，我可以直接：

1. 写好切块脚本，跑出 `01_chunks/`（并告诉你切了多少块）。
2. 快速人物统计，把候选配角清单列给你，你圈定主角。
3. 对该配角相关章节做精抽取，产出 `side_char_bible.md` 初稿 + `info_boundary.json`。
4. 建好本地向量库，做一次「配角视角改写」样章，让你先看效果。

需要的话，我也能把 novel-creator-skill 装进当前环境，或按 Long-Novel-GPT 的导入改写模式来搭 —— 等你确认源小说和想主打的配角就开工。

---

### 附：本方案引用的开源项目

- 拆解/抽取：[NER4Novel](https://github.com/lingjiameng/NER4Novel) · [PersonRelationKnowledgeGraph](https://github.com/liuhuanyong/PersonRelationKnowledgeGraph) · [funNLP](https://github.com/fighting41love/funnlp)
- RAG 教程：[all-in-rag](https://github.com/datawhalechina/all-in-rag)
- 生成框架：[Long-Novel-GPT](https://github.com/MaoXiaoYuZ/Long-Novel-GPT) · [novel-creator-skill](https://github.com/leenbj/novel-creator-skill) · [AI_NovelGenerator](https://github.com/YILING0013/AI_NovelGenerator) · [novel-studio](https://github.com/Xiaoyangy/novel-studio) · [AI-Novel-Writing-Assistant](https://github.com/ExplosiveCoderflome/AI-Novel-Writing-Assistant)
