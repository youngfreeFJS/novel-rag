import "./globals.css";

export const metadata = {
  title: "NovelRAG · 小说RAG引擎 · 聚宝仙盆 showcase",
  description: "百万字小说向量化拆解 + 乔慧珠配角视角工作台",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
