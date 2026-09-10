# 《聚宝仙盆》拆解与配角视角可视化 (Next.js)

对一部 500 万字级修仙长篇《聚宝仙盆》做整本拆解、向量化，并以配角**乔慧珠**视角切入的可视化工作台。

## 运行
```bash
npm install
npm run dev      # http://localhost:3000
# 或
npm run build && npm start
```

## 结构
- `app/` — Next.js 14 App Router 页面
- `components/` — 手写 SVG/Canvas 可视化（无第三方图表库，依赖仅 next/react）
- `public/data/` — 阶段A分析产物（章节/人物/共现网络/时间线/向量检索/配角圣经）

## 内容
- 总览：字数/章节/向量块/维度
- 章节结构：2113 章字数分布
- 人物图谱：出场排名 + 共现力导向网络
- 登场时间线：全书出场密度热力
- 配角视角：乔慧珠人物圣经 / 信息边界表 / 视角样章
- 向量检索：语义查询召回原著片段
- 工作流：端到端流水线

数据由拆解脚本离线生成（jieba 分词 + TF-IDF + SVD 256 维向量库）。生产环境可将 embedding 替换为 BGE-M3 等语义模型。
