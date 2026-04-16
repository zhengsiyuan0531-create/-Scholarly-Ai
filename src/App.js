import { useState, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────
const WRITING_TOOLS = [
  {
    id: "outline",
    icon: "◈",
    label: "论文大纲",
    labelEn: "Outline",
    desc: "生成结构化章节大纲",
    color: "#6ee7b7",
    fields: [
      { key: "topic", label: "论文题目 / Topic", placeholder: "e.g. The Impact of Climate Change on Marine Biodiversity", type: "text" },
      { key: "level", label: "学术级别", type: "select", options: ["Undergraduate", "Master's", "PhD", "Journal Article"] },
      { key: "pages", label: "目标字数 / Word Count", placeholder: "e.g. 5000", type: "text" },
      { key: "style", label: "引用格式", type: "select", options: ["APA 7th", "MLA 9th", "Chicago 17th", "Harvard", "Vancouver"] },
    ],
    systemPrompt: (f) => `You are an expert academic writing consultant. Generate a detailed, professional paper outline. 
Topic: "${f.topic}". Level: ${f.level}. Target: ~${f.pages} words. Citation: ${f.style}.
Produce a structured outline with: Title, Abstract note, 5-7 main sections each with 3-4 subsections, and a References section.
Format clearly with Roman numerals for sections, letters for subsections. Include brief descriptions (1 sentence) of what each section covers.`,
  },
  {
    id: "proposal",
    icon: "◉",
    label: "研究提案",
    labelEn: "Research Proposal",
    desc: "完整研究计划书",
    color: "#93c5fd",
    fields: [
      { key: "topic", label: "研究题目 / Research Title", placeholder: "e.g. Machine Learning in Drug Discovery", type: "text" },
      { key: "field", label: "研究领域 / Field", placeholder: "e.g. Computational Biology, Computer Science", type: "text" },
      { key: "university", label: "目标院校 / Target University", placeholder: "e.g. MIT, Oxford, Harvard", type: "text" },
      { key: "funding", label: "申请经费 / Funding Body", placeholder: "e.g. NSF, NIHR, ERC (optional)", type: "text" },
    ],
    systemPrompt: (f) => `You are a senior academic writing expert helping craft a research proposal for ${f.university}.
Research Title: "${f.topic}". Field: ${f.field}. Funding body: ${f.funding || "N/A"}.
Write a complete, compelling research proposal with these sections:
1. Title & Abstract (200 words)
2. Introduction & Background (300 words) 
3. Research Questions & Objectives
4. Literature Gap & Significance
5. Methodology (research design, data collection, analysis plan)
6. Timeline (12-36 month Gantt-style breakdown)
7. Expected Outcomes & Impact
8. Budget Justification (brief)
9. References (list 5-8 key real papers in the field)
Use formal academic English. Be specific, not generic.`,
  },
  {
    id: "abstract",
    icon: "◎",
    label: "摘要生成",
    labelEn: "Abstract",
    desc: "专业学术摘要",
    color: "#fca5a5",
    fields: [
      { key: "title", label: "论文标题 / Title", placeholder: "Your paper title", type: "text" },
      { key: "content", label: "论文主要内容 / Key Content", placeholder: "Describe your paper's main findings, methods, and conclusions...", type: "textarea" },
      { key: "words", label: "摘要字数 / Abstract Length", type: "select", options: ["150 words", "200 words", "250 words", "300 words"] },
      { key: "journal", label: "目标期刊 / Target Journal", placeholder: "e.g. Nature, The Lancet, IEEE (optional)", type: "text" },
    ],
    systemPrompt: (f) => `You are an expert academic editor. Write a polished, professional abstract.
Paper title: "${f.title}". Target journal: ${f.journal || "general academic"}.
Key content provided: ${f.content}
Write exactly ~${f.words} covering: Background/Purpose, Methods, Key Results, Conclusions, and Significance.
Use precise, journal-quality academic language. No first person. No vague claims. Be specific.`,
  },
  {
    id: "literature",
    icon: "◆",
    label: "文献综述",
    labelEn: "Literature Review",
    desc: "系统性文献综述",
    color: "#c4b5fd",
    fields: [
      { key: "topic", label: "综述主题 / Review Topic", placeholder: "e.g. Deep Learning for Natural Language Processing", type: "text" },
      { key: "years", label: "文献年份范围", type: "select", options: ["Last 5 years (2020-2025)", "Last 10 years (2015-2025)", "Last 20 years (2005-2025)", "All time"] },
      { key: "papers", label: "关键论文 / Key Papers (optional)", placeholder: "List any specific papers you want included...", type: "textarea" },
      { key: "length", label: "综述长度", type: "select", options: ["Short (~800 words)", "Medium (~1500 words)", "Long (~2500 words)"] },
    ],
    systemPrompt: (f) => `You are an expert academic researcher. Write a comprehensive literature review.
Topic: "${f.topic}". Time scope: ${f.years}. Length: ${f.length}.
${f.papers ? `Key papers to include: ${f.papers}` : ""}
Structure the review with:
1. Introduction to the topic and review scope
2. Thematic synthesis organized by subtopics (not chronologically)
3. Critical analysis of methodologies and findings
4. Identification of research gaps and contradictions
5. Synthesis and future directions
Cite real, plausible papers with author names and years in APA format. Be analytical, not just descriptive.`,
  },
  {
    id: "introduction",
    icon: "◐",
    label: "引言撰写",
    labelEn: "Introduction",
    desc: "学术论文引言",
    color: "#fde68a",
    fields: [
      { key: "topic", label: "论文题目 / Topic", placeholder: "Your paper title or topic", type: "text" },
      { key: "thesis", label: "核心论点 / Thesis Statement", placeholder: "What is your main argument or research question?", type: "textarea" },
      { key: "context", label: "研究背景 / Context", placeholder: "Any specific context, field, or angle to emphasize?", type: "text" },
      { key: "length", label: "引言长度", type: "select", options: ["Short (300 words)", "Medium (500 words)", "Long (800 words)"] },
    ],
    systemPrompt: (f) => `You are an expert academic writer. Write a compelling introduction for an academic paper.
Topic: "${f.topic}". Thesis: ${f.thesis}. Context: ${f.context || "general academic"}.
Length: ~${f.length}.
Structure: Hook (surprising fact/statistic), Background context, Literature gap, Research questions/objectives, Paper roadmap.
Use formal academic English. End with a clear statement of paper structure. Cite 3-5 plausible real references.`,
  },
  {
    id: "thesis",
    icon: "◑",
    label: "论点强化",
    labelEn: "Thesis Statement",
    desc: "优化核心论点",
    color: "#6ee7f7",
    fields: [
      { key: "topic", label: "研究课题 / Research Topic", placeholder: "Your research topic or question", type: "text" },
      { key: "position", label: "你的立场 / Your Position", placeholder: "What argument are you trying to make?", type: "textarea" },
      { key: "level", label: "学术级别", type: "select", options: ["Undergraduate Essay", "Master's Thesis", "PhD Dissertation", "Journal Article"] },
    ],
    systemPrompt: (f) => `You are an expert academic writing coach. Help craft and strengthen a thesis statement.
Topic: "${f.topic}". Position: ${f.position}. Level: ${f.level}.
Provide:
1. Three alternative thesis statement versions (weak → strong progression)
2. Analysis of what makes each stronger
3. The recommended best version with explanation
4. Tips to further sharpen the argument
Keep statements precise, arguable, and scope-appropriate for ${f.level} level.`,
  },
  {
    id: "paraphrase",
    icon: "↺",
    label: "论文仿写",
    labelEn: "Paper Paraphrasing",
    desc: "仿写改写，保留核心观点",
    color: "#a78bfa",
    maxTokens: 3000,
    fields: [
      { key: "original", label: "原文内容 / Original Text", placeholder: "粘贴需要仿写的论文段落或全文...", type: "textarea" },
      { key: "style", label: "仿写风格", type: "select", options: ["学术化加强 (More Academic)", "通俗易懂 (More Accessible)", "换个角度 (Different Perspective)", "精简版 (Condensed)", "扩展版 (Expanded)"] },
      { key: "field", label: "学科领域 / Field", placeholder: "e.g. 经济学、计算机科学、教育学（可选）", type: "text", optional: true },
      { key: "level", label: "写作级别", type: "select", options: ["本科论文", "硕士论文", "博士论文", "期刊投稿"] },
    ],
    systemPrompt: (f) => `你是一位专业的学术写作专家，擅长论文仿写和改写。请对以下文本进行仿写改写，保留核心观点和论据，但使用完全不同的表达方式、句式结构和词汇选择。

仿写风格：${f.style}
学科领域：${f.field || "通用学术"}
写作级别：${f.level}

要求：
1. 保持学术严谨性，逻辑结构清晰
2. 显著改变句式结构和词汇，避免与原文高度相似
3. 保留所有关键数据、引用和核心观点
4. 用${f.level}水平的学术语言重新表达
5. 适当调整段落顺序使文章更流畅自然
6. 改变过渡词、连接语，体现个人写作风格

原文：
${f.original}

请直接输出改写后的内容，不要添加任何说明。`,
  },
  {
    id: "ai-reduce",
    icon: "⬡",
    label: "降低AI重合率",
    labelEn: "Reduce AI Detection",
    desc: "降低AI检测率，增加人工痕迹",
    color: "#fb923c",
    maxTokens: 3000,
    fields: [
      { key: "text", label: "AI生成文本 / AI-Generated Text", placeholder: "粘贴需要处理的AI生成内容...", type: "textarea" },
      { key: "degree", label: "处理强度", type: "select", options: ["轻度处理 (保留80%原意)", "中度处理 (保留60%原意)", "深度处理 (完全重构)"] },
      { key: "style", label: "目标风格", type: "select", options: ["学生口吻", "专业人士", "研究学者", "商务写作"] },
      { key: "lang", label: "语言", type: "select", options: ["中文", "English", "中英混合"] },
    ],
    systemPrompt: (f) => `你是一位专业的文本人性化专家。将以下AI生成文本改写成更自然、更有人情味的文字，显著降低AI检测工具的检出率。

处理强度：${f.degree}
目标风格：${f.style}
语言：${f.lang}

改写策略（必须全部执行）：
1. 【句式多样化】打破AI惯用的规则长句，混合使用长短句、设问句、转折句
2. 【词汇口语化】适当引入口语词汇、成语、惯用语，避免千篇一律的"此外/然而/综上"
3. 【视角转换】从第一人称角度加入个人观察、联想或类比，体现独立思考
4. 【不完美感】保留轻微口语化表达，使用"这里需要注意的是"、"值得一提的是"等自然衔接
5. 【情感植入】适当加入作者倾向性，让行文有温度，不像机器输出
6. 【段落重构】重新切分段落，改变信息呈现节奏
7. 【结构变化】将部分并列结构改为递进/转折结构，避免AI式列举

原文：
${f.text}

请直接输出处理后的内容，不要解释你做了什么改变。`,
  },
  {
    id: "report-proposal",
    icon: "◈",
    label: "开题报告",
    labelEn: "Research Opening Report",
    desc: "中文学术开题报告全文",
    color: "#34d399",
    maxTokens: 4000,
    fields: [
      { key: "title", label: "论文 / 报告题目", placeholder: "请输入完整题目", type: "text" },
      { key: "type", label: "报告类型", type: "select", options: ["本科毕业论文开题报告", "硕士学位论文开题报告", "博士学位论文开题报告", "项目调研报告开题", "课题研究开题报告"] },
      { key: "school", label: "学校 / 机构", placeholder: "e.g. 北京大学、清华大学（可选）", type: "text", optional: true },
      { key: "major", label: "专业 / 领域", placeholder: "e.g. 工商管理、计算机科学、教育学", type: "text" },
      { key: "background", label: "研究背景与意义（可选）", placeholder: "简述你的研究背景和选题意义...", type: "textarea", optional: true },
    ],
    systemPrompt: (f) => `你是一位资深的中国高校学术导师，专业撰写学术开题报告。请为以下论文撰写一份完整、规范的开题报告。

论文题目：${f.title}
报告类型：${f.type}
学校/机构：${f.school || "高等院校"}
专业领域：${f.major}
${f.background ? `研究背景补充：${f.background}` : ""}

请按照国内高校标准格式撰写完整开题报告，包含以下全部章节：

一、选题背景与研究意义（600-800字）
  1.1 研究背景
  1.2 研究意义（理论意义与实践意义）

二、国内外研究现状综述（800-1000字）
  2.1 国外研究现状
  2.2 国内研究现状
  2.3 研究述评与现有不足

三、研究内容与论文框架（400-600字）
  3.1 主要研究内容
  3.2 论文结构框架（分章节列出）

四、研究思路与方法（300-500字）
  4.1 研究思路
  4.2 具体研究方法

五、主要创新点（200-300字）

六、研究进度安排（以表格形式列出时间节点）

七、参考文献（列出15-20篇相关文献，格式规范）

请确保内容专业、严谨，符合${f.type}的学术规范，总字数不少于3500字。`,
  },
  {
    id: "speech-ppt",
    icon: "▦",
    label: "PPT + 演讲稿",
    labelEn: "PPT + Speech Script",
    desc: "PPT大纲 + 两千字演讲稿",
    color: "#60a5fa",
    maxTokens: 4000,
    gensparkLink: true,
    fields: [
      { key: "topic", label: "演讲 / 汇报主题", placeholder: "e.g. 2024年度工作总结、人工智能在教育中的应用", type: "text" },
      { key: "slides", label: "PPT 页数", type: "select", options: ["10页", "15页", "20页", "25页", "30页"] },
      { key: "audience", label: "受众群体", type: "select", options: ["公司领导/董事会", "同事/团队", "客户/投资人", "学术委员会", "学生/教育场合", "政府/政策机构"] },
      { key: "duration", label: "演讲时长", type: "select", options: ["10分钟", "15分钟", "20分钟", "30分钟", "45分钟"] },
      { key: "context", label: "背景信息（可选）", placeholder: "部门、行业、具体要求等补充信息...", type: "text", optional: true },
    ],
    systemPrompt: (f) => `你是一位专业的演讲策划和PPT设计专家。请为以下主题生成完整的PPT大纲和演讲全文。

主题：${f.topic}
PPT页数：${f.slides}
受众：${f.audience}
演讲时长：${f.duration}
背景：${f.context || "通用场合"}

请严格按照以下格式输出：

══════════════════════════════════════
【PPT 大纲结构】（共${f.slides}）
══════════════════════════════════════

第1页 | 封面
· 主标题：[主标题]
· 副标题：[副标题]
· 单位/演讲者：[...]

第2页 | 目录
· [列出所有板块]

[继续列出每一页，格式为：页码 | 页面类型 · 要点1 · 要点2 · 建议图表]

══════════════════════════════════════
【演讲稿全文】（约2000字）
══════════════════════════════════════

▌开场白（约200字）
[演讲稿开场内容]

▌正文（约1400字，分段对应PPT各板块）
[演讲稿正文内容]

▌总结与结语（约200字）
[演讲稿结语内容]

▌常见Q&A预备（3-5个问题及简要回答）
Q：...
A：...

请确保PPT大纲与演讲稿高度吻合，演讲语言自然流畅，适合${f.audience}受众，演讲时间控制在${f.duration}以内。`,
  },
  {
    id: "work-report",
    icon: "▣",
    label: "工作报告",
    labelEn: "Work Report",
    desc: "一万至三万字完整工作报告",
    color: "#f472b6",
    longForm: true,
    maxTokens: 4096,
    fields: [
      { key: "title", label: "报告标题", placeholder: "e.g. 2024年度工作总结报告、市场调研分析报告", type: "text" },
      { key: "type", label: "报告类型", type: "select", options: ["年度工作总结报告", "半年度工作总结报告", "季度工作总结", "项目总结报告", "调研分析报告", "可行性研究报告", "市场分析报告", "党建工作报告", "政府工作报告"] },
      { key: "wordCount", label: "目标字数", type: "select", options: ["一万字 (10,000)", "一万五千字 (15,000)", "两万字 (20,000)", "三万字 (30,000)"] },
      { key: "dept", label: "单位 / 部门", placeholder: "e.g. 市场营销部、技术研发中心、XX市政府", type: "text" },
      { key: "period", label: "报告时间段", placeholder: "e.g. 2024年1月—12月", type: "text" },
      { key: "highlights", label: "重点内容 / 亮点（可选）", placeholder: "列出需要重点描述的工作内容、成就或数据...", type: "textarea", optional: true },
    ],
  },
];

const TABS = [
  { id: "write", label: "AI 写作", icon: "✦" },
  { id: "search", label: "文献搜索", icon: "◎" },
];

// ─── API HELPERS ──────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage = "Please generate the content now.", maxTokens = 2000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Error generating content.";
}

async function searchSemanticScholar(query, limit = 8) {
  try {
    const fields = "title,authors,year,abstract,url,citationCount,openAccessPdf,externalIds,publicationVenue";
    const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`);
    const data = await res.json();
    return (data.data || []).map(p => ({
      id: p.paperId, title: p.title,
      authors: (p.authors || []).map(a => a.name).join(", "),
      year: p.year, abstract: p.abstract,
      url: p.url || (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : null),
      pdfUrl: p.openAccessPdf?.url, citations: p.citationCount,
      venue: p.publicationVenue?.name, source: "Semantic Scholar", sourceColor: "#6ee7b7",
    }));
  } catch { return []; }
}

async function searchOpenAlex(query, limit = 6) {
  try {
    const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=id,title,authorships,publication_year,abstract_inverted_index,primary_location,cited_by_count,open_access,doi`);
    const data = await res.json();
    return (data.results || []).map(p => {
      let abstract = "";
      if (p.abstract_inverted_index) {
        const words = {};
        Object.entries(p.abstract_inverted_index).forEach(([word, positions]) => positions.forEach(pos => { words[pos] = word; }));
        abstract = Object.keys(words).sort((a, b) => a - b).map(k => words[k]).join(" ").slice(0, 400);
      }
      return {
        id: p.id, title: p.title,
        authors: (p.authorships || []).slice(0, 3).map(a => a.author?.display_name).filter(Boolean).join(", "),
        year: p.publication_year, abstract,
        url: p.doi ? `https://doi.org/${p.doi.replace("https://doi.org/", "")}` : p.primary_location?.landing_page_url,
        pdfUrl: p.open_access?.oa_url, citations: p.cited_by_count,
        venue: p.primary_location?.source?.display_name,
        source: "OpenAlex", sourceColor: "#93c5fd",
      };
    });
  } catch { return []; }
}

async function searchArxiv(query, limit = 5) {
  try {
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}&sortBy=relevance`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");
    return Array.from(xml.querySelectorAll("entry")).map(e => ({
      id: e.querySelector("id")?.textContent,
      title: e.querySelector("title")?.textContent?.replace(/\n/g, " ").trim(),
      authors: Array.from(e.querySelectorAll("author name")).slice(0, 3).map(a => a.textContent).join(", "),
      year: e.querySelector("published")?.textContent?.slice(0, 4),
      abstract: e.querySelector("summary")?.textContent?.slice(0, 400),
      url: e.querySelector("id")?.textContent,
      pdfUrl: e.querySelector("id")?.textContent?.replace("abs", "pdf"),
      citations: null, venue: "arXiv", source: "arXiv", sourceColor: "#fca5a5",
    }));
  } catch { return []; }
}

// ─── LONG-FORM REPORT GENERATOR ──────────────────────────────
async function generateWorkReport(fields, onProgress, onPartial) {
  const totalWords = parseInt(fields.wordCount.replace(/[^0-9]/g, "")) || 10000;
  const base = `报告标题：${fields.title}\n报告类型：${fields.type}\n单位/部门：${fields.dept || "相关单位"}\n报告时间段：${fields.period || "本报告期"}${fields.highlights ? `\n重点内容：${fields.highlights}` : ""}`;
  const parts = [
    {
      title: "一、总体概况",
      words: Math.round(totalWords * 0.10),
      desc: "全面概述本报告期工作总体情况，包括：工作背景与整体部署、主要目标完成情况综述、核心指标数据汇总。语言简洁有力，开门见山。",
    },
    {
      title: "二、主要工作完成情况",
      words: Math.round(totalWords * 0.45),
      desc: "重点工作逐项详细展开，每项工作需包含：实施背景、具体措施、工作过程、完成成效（附数据）。分3-5个子标题展开，每个子标题内容详实具体。",
    },
    {
      title: "三、工作亮点与创新举措",
      words: Math.round(totalWords * 0.15),
      desc: "聚焦本期特色做法、创新机制、典型案例，结合具体场景和数据，体现工作的独创性和示范意义。",
    },
    {
      title: "四、存在的问题与不足",
      words: Math.round(totalWords * 0.10),
      desc: "客观分析本期工作中存在的主要困难、短板和不足，深入分析原因，语言实事求是，不回避矛盾。",
    },
    {
      title: "五、下一步工作计划与措施",
      words: Math.round(totalWords * 0.20),
      desc: "明确下一报告期重点工作方向、具体举措、责任分工和时间节点。分项列出，具有可操作性和可考核性。",
    },
  ];

  let fullContent = `${fields.title}\n${"─".repeat(50)}\n\n`;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    onProgress(`正在生成第 ${i + 1}/${parts.length} 部分：${part.title}...`);
    const sectionPrompt = `你是一位资深公文写作专家，正在撰写《${fields.title}》的一个章节。

${base}

请撰写以下章节，字数严格达到约${part.words}字（中文字符数），内容详实、有数据支撑：

${part.title}

写作要求：${part.desc}

格式要求：
- 使用正式公文语言，语言庄重、表达准确
- 大量使用具体数据、百分比、案例支撑论述
- 分层分点，用"（一）（二）"或"1. 2."标注
- 内容充实，不得泛泛而谈，字数必须达到约${part.words}字`;
    const content = await callClaude(sectionPrompt, "请生成此章节的完整内容，字数必须达到要求，内容充实详尽。", 4096);
    fullContent += content + "\n\n";
    onPartial(fullContent);
  }
  onProgress("");
  return fullContent;
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────
function ToolCard({ tool, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "22px 20px", cursor: "pointer", textAlign: "left",
      transition: "all 0.2s", width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${tool.color}0f`; e.currentTarget.style.borderColor = `${tool.color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
    >
      <div style={{ fontSize: 22, color: tool.color, marginBottom: 10 }}>{tool.icon}</div>
      <div style={{ color: "#f0f0f0", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{tool.label}</div>
      <div style={{ color: "#666", fontSize: 12, fontFamily: "monospace", marginBottom: 6 }}>{tool.labelEn}</div>
      <div style={{ color: "#888", fontSize: 13 }}>{tool.desc}</div>
    </button>
  );
}

function WritingPanel({ tool, onBack }) {
  const [fields, setFields] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState("");
  const outputRef = useRef(null);

  const handleGenerate = async () => {
    const missing = tool.fields.filter(f => !f.optional && f.type !== "select" && !fields[f.key]);
    if (missing.length > 0) return;
    setLoading(true);
    setOutput("");
    setProgress("");

    if (tool.longForm) {
      // Multi-part generation for work reports
      await generateWorkReport(
        { ...fields, wordCount: fields.wordCount || tool.fields.find(f => f.key === "wordCount")?.options?.[0] || "一万字 (10,000)" },
        setProgress,
        (partial) => { setOutput(partial); setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }
      );
    } else {
      const prompt = tool.systemPrompt(fields);
      const result = await callClaude(prompt, "Please generate the content now.", tool.maxTokens || 2000);
      setOutput(result);
    }

    setLoading(false);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output ? output.replace(/\s/g, "").length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#aaa", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13,
        }}>← 返回</button>
        <span style={{ fontSize: 20, color: tool.color }}>{tool.icon}</span>
        <div>
          <div style={{ color: "#f0f0f0", fontWeight: 600, fontSize: 17 }}>{tool.label}</div>
          <div style={{ color: "#666", fontSize: 12, fontFamily: "monospace" }}>{tool.labelEn}</div>
        </div>
      </div>

      {/* Work report notice */}
      {tool.longForm && (
        <div style={{
          background: `${tool.color}11`, border: `1px solid ${tool.color}33`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: tool.color, fontSize: 16 }}>▣</span>
          <div>
            <div style={{ color: tool.color, fontSize: 13, fontWeight: 600 }}>长文分段生成模式</div>
            <div style={{ color: "#777", fontSize: 12 }}>报告将分5个章节依次生成，完整生成可能需要 2-5 分钟，请耐心等待</div>
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
        {tool.fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", color: f.optional ? "#666" : "#aaa", fontSize: 13, marginBottom: 7, fontFamily: "monospace" }}>
              {f.label}{f.optional && <span style={{ color: "#444", fontSize: 11, marginLeft: 6 }}>(可选)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={fields[f.key] || ""}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={4}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  padding: "12px 14px", color: "#e8e8e8", fontSize: 14,
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            ) : f.type === "select" ? (
              <select
                value={fields[f.key] || f.options[0]}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  width: "100%", background: "#1a1a22",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  padding: "12px 14px", color: "#e8e8e8", fontSize: 14,
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={fields[f.key] || ""}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                  padding: "12px 14px", color: "#e8e8e8", fontSize: 14,
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{
        background: loading ? "rgba(255,255,255,0.05)" : tool.color,
        color: loading ? "#666" : "#0a0a0f",
        border: "none", borderRadius: 12, padding: "14px 32px",
        fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        width: "100%", fontFamily: "monospace", letterSpacing: "0.05em", transition: "all 0.2s",
      }}>
        {loading ? (progress || "✦ AI 生成中...") : `✦ 生成 ${tool.label}`}
      </button>

      {/* Output */}
      {(loading || output) && (
        <div ref={outputRef} style={{
          marginTop: 28, background: "rgba(255,255,255,0.02)",
          border: `1px solid ${tool.color}33`,
          borderRadius: 16, padding: "24px",
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: tool.color, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                ✦ AI OUTPUT
              </span>
              {output && (
                <span style={{ color: "#444", fontSize: 11, fontFamily: "monospace" }}>
                  {wordCount.toLocaleString()} 字
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {tool.gensparkLink && output && (
                <button
                  onClick={() => window.open("https://www.genspark.ai/", "_blank")}
                  style={{
                    background: "#60a5fa22", color: "#60a5fa",
                    border: "1px solid #60a5fa44", borderRadius: 8,
                    padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}
                >
                  ▦ 在 Genspark 创建 PPT →
                </button>
              )}
              {output && (
                <button onClick={handleCopy} style={{
                  background: copied ? "#22d3a022" : "rgba(255,255,255,0.05)",
                  color: copied ? "#22d3a0" : "#aaa",
                  border: `1px solid ${copied ? "#22d3a044" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12,
                }}>
                  {copied ? "✓ 已复制" : "复制"}
                </button>
              )}
            </div>
          </div>

          {/* Genspark guide */}
          {tool.gensparkLink && output && (
            <div style={{
              background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              fontSize: 12, color: "#93c5fd", lineHeight: 1.7,
            }}>
              <strong>使用 Genspark 生成 PPT：</strong>点击上方按钮进入 Genspark → 选择「AI Slides」→ 粘贴上方 PPT 大纲内容 → 一键生成精美 PPT
            </div>
          )}

          {/* Long report progress */}
          {tool.longForm && loading && progress && (
            <div style={{
              background: `${tool.color}0a`, borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 14, height: 14, border: `2px solid ${tool.color}44`, borderTopColor: tool.color, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              <span style={{ color: tool.color, fontSize: 12, fontFamily: "monospace" }}>{progress}</span>
            </div>
          )}

          {!output && loading && !tool.longForm ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${tool.color}44`, borderTopColor: tool.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#666", fontSize: 13 }}>Claude AI 正在生成，请稍候...</span>
            </div>
          ) : (
            <pre style={{
              color: "#d4d4d8", fontSize: 14, lineHeight: 1.8,
              whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
              fontFamily: "'Georgia', serif",
            }}>{output}{loading && tool.longForm ? "▌" : ""}</pre>
          )}
        </div>
      )}
    </div>
  );
}

function PaperCard({ paper, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "18px 20px", marginBottom: 10, cursor: "pointer",
      transition: "all 0.15s", animation: `fadeIn 0.3s ease ${index * 0.04}s both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
    >
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{
              background: paper.sourceColor + "22", color: paper.sourceColor,
              border: `1px solid ${paper.sourceColor}44`,
              borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
            }}>{paper.source}</span>
            {paper.year && <span style={{ color: "#666", fontSize: 12 }}>{paper.year}</span>}
            {paper.citations != null && <span style={{ color: "#666", fontSize: 12 }}>◈ {paper.citations} cited</span>}
          </div>
          <div style={{ color: "#e8e8e8", fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 5 }}>
            {paper.title}
          </div>
          <div style={{ color: "#777", fontSize: 12 }}>
            {paper.authors}
            {paper.venue && <span style={{ color: "#555" }}> · {paper.venue}</span>}
          </div>
          {expanded && paper.abstract && (
            <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
              {paper.abstract}...
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {paper.url && (
            <a href={paper.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ background: "rgba(255,255,255,0.07)", color: "#ccc", borderRadius: 8, padding: "5px 12px", fontSize: 12, textDecoration: "none" }}>
              View →
            </a>
          )}
          {paper.pdfUrl && (
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ background: "#fca5a522", color: "#fca5a5", border: "1px solid #fca5a544", borderRadius: 8, padding: "5px 12px", fontSize: 12, textDecoration: "none" }}>
              PDF ↓
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiNote, setAiNote] = useState(null);

  const doSearch = async (q) => {
    const sq = q || query;
    if (!sq.trim()) return;
    setLoading(true);
    setResults([]);
    setAiNote(null);
    const [s, o, a] = await Promise.all([
      searchSemanticScholar(sq, 7),
      searchOpenAlex(sq, 6),
      searchArxiv(sq, 5),
    ]);
    const all = [...s, ...o, ...a];
    const seen = new Set();
    const deduped = all.filter(p => {
      const k = (p.title || "").toLowerCase().slice(0, 40);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    setResults(deduped);
    setLoading(false);
    if (deduped.length > 0) {
      const summaries = deduped.slice(0, 5).map((p, i) => `[${i+1}] "${p.title}" (${p.year}) — ${p.abstract?.slice(0, 150) || ""}`).join("\n");
      const note = await callClaude(
        `You are an academic assistant. Given papers about "${sq}", respond ONLY with JSON: {"synthesis":"2 sentence summary","followUp":["query1","query2","query3"]}. No markdown.`,
        summaries
      );
      try { setAiNote(JSON.parse(note.replace(/```json|```/g, "").trim())); } catch { setAiNote(null); }
    }
  };

  const suggestions = ["transformer self-attention", "climate policy economics", "CRISPR off-target effects", "quantum error correction", "mRNA vaccine immunology"];

  return (
    <div>
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="Search 200M+ academic papers..."
          style={{
            flex: 1, background: "transparent", border: "none",
            padding: "14px 18px", color: "#e8e8e8", fontSize: 15, fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button onClick={() => doSearch()} style={{
          background: "#6ee7b7", color: "#0a0a0f", border: "none",
          padding: "0 24px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em",
        }}>SEARCH</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => { setQuery(s); doSearch(s); }} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
            color: "#777", borderRadius: 20, padding: "4px 12px", fontSize: 12,
            cursor: "pointer", fontFamily: "monospace",
          }}>{s}</button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ width: 28, height: 28, border: "2px solid rgba(110,231,183,0.3)", borderTopColor: "#6ee7b7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ color: "#555", fontSize: 13, fontFamily: "monospace" }}>Searching Semantic Scholar · OpenAlex · arXiv...</div>
        </div>
      )}

      {aiNote && !loading && (
        <div style={{ background: "rgba(110,231,183,0.05)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, animation: "fadeIn 0.4s ease" }}>
          <div style={{ color: "#6ee7b7", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>✦ AI SYNTHESIS</div>
          <p style={{ color: "#c0c8d0", fontSize: 13, lineHeight: 1.7, margin: "0 0 12px 0" }}>{aiNote.synthesis}</p>
          {aiNote.followUp?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {aiNote.followUp.map(f => (
                <button key={f} onClick={() => { setQuery(f); doSearch(f); }} style={{
                  background: "transparent", border: "1px solid rgba(110,231,183,0.3)",
                  color: "#6ee7b7", borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>+ {f}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div style={{ color: "#555", fontSize: 12, fontFamily: "monospace", marginBottom: 14 }}>
          {results.length} papers · click to expand abstracts
        </div>
      )}
      {results.map((p, i) => <PaperCard key={p.id || i} paper={p} index={i} />)}

      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: 14 }}>Search across Semantic Scholar, OpenAlex & arXiv</div>
          <div style={{ fontSize: 12, marginTop: 8, color: "#333" }}>200M+ papers · Harvard · MIT · Stanford · Oxford</div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("write");
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8e8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        input, textarea, select { outline: none; }
        input::placeholder, textarea::placeholder { color: #444; }
      `}</style>

      {/* Top Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        height: 56,
        background: "rgba(10,10,15,0.95)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.02em" }}>
            Scholarly<span style={{ color: "#6ee7b7" }}>AI</span>
          </span>
          <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace", letterSpacing: "0.1em" }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveTool(null); }} style={{
              background: tab === t.id ? "rgba(255,255,255,0.07)" : "transparent",
              border: tab === t.id ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
              color: tab === t.id ? "#f0f0f0" : "#666",
              borderRadius: 8, padding: "6px 16px", cursor: "pointer",
              fontSize: 13, fontFamily: "monospace", letterSpacing: "0.03em",
              transition: "all 0.15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      {!activeTool && (
        <div style={{
          textAlign: "center",
          padding: "48px 20px 36px",
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(110,231,183,0.06) 0%, transparent 70%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#6ee7b7", fontFamily: "monospace", marginBottom: 14, textTransform: "uppercase" }}>
            Academic AI Platform
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#f5f5f5", lineHeight: 1.15, marginBottom: 12 }}>
            {tab === "write" ? (
              <>AI 智能写作平台<br /><span style={{ fontSize: "0.55em", color: "#555", fontWeight: 400 }}>论文仿写 · 降低AI率 · 开题报告 · PPT演讲稿 · 万字报告</span></>
            ) : (
              <>Search 200M+ Papers<br /><span style={{ fontSize: "0.55em", color: "#555", fontWeight: 400 }}>Harvard · MIT · Stanford · Oxford · QS100</span></>
            )}
          </h1>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* WRITE TAB */}
        {tab === "write" && !activeTool && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ color: "#555", fontSize: 12, fontFamily: "monospace", marginBottom: 20, letterSpacing: "0.05em" }}>
              选择写作任务 · SELECT A WRITING TASK
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {WRITING_TOOLS.map(tool => (
                <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />
              ))}
            </div>
            <div style={{
              marginTop: 36,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px 24px",
            }}>
              <div style={{ color: "#555", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12 }}>✦ POWERED BY</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { name: "Claude Sonnet 4", desc: "AI 写作引擎", color: "#f97316" },
                  { name: "论文仿写 & 降AI率", desc: "11种写作模式", color: "#a78bfa" },
                  { name: "Genspark PPT", desc: "演讲稿联动", color: "#60a5fa" },
                  { name: "万字报告", desc: "分段智能生成", color: "#f472b6" },
                ].map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                    <span style={{ color: "#777", fontSize: 12 }}>{p.name}</span>
                    <span style={{ color: "#444", fontSize: 11 }}>· {p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "write" && activeTool && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <WritingPanel tool={activeTool} onBack={() => setActiveTool(null)} />
          </div>
        )}

        {/* SEARCH TAB */}
        {tab === "search" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <SearchPanel />
          </div>
        )}
      </div>
    </div>
  );
}
