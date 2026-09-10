# 聚宝仙盆 拆解流水线

## 目录
- scripts/       拆解脚本（01清洗切章 → 07导出）
- source/        源小说（raw.txt，未随包，见你的 Downloads 原文）
- stage_a_analysis/  分析产物：章节、人物、共现网络、时间线、向量块、配角圣经、检索演示
- stage_b_writing/   配角视角样章

## 重建向量库（离线）
```bash
pip install jieba scikit-learn joblib numpy
python3 scripts/01_clean_split.py   # 需先把源小说放到 source/raw.txt
python3 scripts/02_chunk.py
python3 scripts/04_char_stats.py
python3 scripts/05_embed.py         # 生成 embeddings.npy + tfidf/svd（本包未含，体积大）
python3 scripts/06_search.py        # 交互检索
```
生产环境把 05_embed.py 的 TF-IDF+SVD 换成 BGE-M3 等语义模型即可。

## 运行目录约定
脚本使用相对路径。建议在 `pipeline/` 下建立工作目录：
```
pipeline/
├── source/raw.txt                 # 你的源小说（UTF-8，不入库）
└── stage_a_analysis/              # 脚本自动生成
    ├── 01_chunks/  02_entities/  03_vectorstore/  04_bible/
```
若源文件是 GBK/GB18030 编码，`01_clean_split.py` 会自动按 gb18030 解码转 UTF-8。
