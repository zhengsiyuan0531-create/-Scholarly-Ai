import { useState, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────
const WRITING_TOOLS = [
  {
    id: "outline",
    icon: "◈",
    label: "论文大纲",
    labelEn: "Outline",
    desc: "生成结构化章节大纲",
    color: "#2563eb",
    fields: [
      { key: "topic", label: "论文题目 / Topic", placeholder: "e.g. AI对就业环境的影响 / The Impact of AI on Employment", type: "text" },
      { key: "level", label: "学术级别", type: "select", options: ["本科 / Undergraduate", "硕士 / Master's", "博士 / PhD", "期刊论文 / Journal Article"] },
      { key: "pages", label: "目标字数 / Word Count", placeholder: "e.g. 5000", type: "text" },
      { key: "style", label: "引用格式", type: "select", options: ["APA 7th", "MLA 9th", "Chicago 17th", "Harvard", "Vancouver", "GB/T 7714（国标）"] },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      if (isCN || isBi) return `你是一位专业的学术写作顾问。请生成一份详细、规范的论文大纲。
论文题目："${f.topic}"。学术级别：${f.level}。目标字数：约${f.pages}字。引用格式：${f.style}。
请生成包含以下内容的完整大纲：标题、摘要说明、5-7个主要章节（每章含3-4个子节）、参考文献。
用中文数字标注章节（一、二、三…），用括号标注子节（（一）（二）…），每节附一句简要说明。${isBi ? "\n\n然后提供完整的英文版本。" : ""}`;
      return `You are an expert academic writing consultant. Generate a detailed, professional paper outline.
Topic: "${f.topic}". Level: ${f.level}. Target: ~${f.pages} words. Citation: ${f.style}.
Produce a structured outline with: Title, Abstract note, 5-7 main sections each with 3-4 subsections, and a References section.
Format with Roman numerals for sections, letters for subsections. Include brief descriptions (1 sentence) per section.`;
    },
  },
  {
    id: "proposal",
    icon: "◉",
    label: "研究提案",
    labelEn: "Research Proposal",
    desc: "完整研究计划书",
    color: "#3b82f6",
    fields: [
      { key: "topic", label: "研究题目 / Research Title", placeholder: "e.g. 机器学习在药物发现中的应用", type: "text" },
      { key: "field", label: "研究领域 / Field", placeholder: "e.g. 计算生物学、计算机科学", type: "text" },
      { key: "university", label: "目标院校 / Target University", placeholder: "e.g. 清华大学、MIT、Oxford", type: "text" },
      { key: "funding", label: "申请经费 / Funding Body", placeholder: "e.g. 国家自然科学基金、NSF（可选）", type: "text", optional: true },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      if (isCN || isBi) return `你是一位资深学术写作专家，正在为${f.university}撰写研究提案。
研究题目："${f.topic}"。研究领域：${f.field}。经费来源：${f.funding || "未指定"}。
请用中文撰写完整研究提案，包含：
1. 题目与摘要（约200字）
2. 研究背景与意义（约300字）
3. 研究问题与目标
4. 文献缺口与研究价值
5. 研究方法（设计、数据收集、分析方案）
6. 研究时间表（12-36个月甘特式安排）
7. 预期成果与影响
8. 经费预算说明
9. 参考文献（5-8篇相关领域真实文献）
内容具体，避免空泛。${isBi ? "\n\n然后提供完整的英文版本。" : ""}`;
      return `You are a senior academic writing expert helping craft a research proposal for ${f.university}.
Research Title: "${f.topic}". Field: ${f.field}. Funding body: ${f.funding || "N/A"}.
Write a complete, compelling research proposal with these sections:
1. Title & Abstract (200 words) 2. Introduction & Background (300 words) 3. Research Questions & Objectives
4. Literature Gap & Significance 5. Methodology 6. Timeline (12-36 month Gantt-style)
7. Expected Outcomes & Impact 8. Budget Justification 9. References (5-8 key papers)
Use formal academic English. Be specific, not generic.`;
    },
  },
  {
    id: "abstract",
    icon: "◎",
    label: "摘要生成",
    labelEn: "Abstract",
    desc: "专业学术摘要",
    color: "#ef4444",
    fields: [
      { key: "title", label: "论文标题 / Title", placeholder: "你的论文标题", type: "text" },
      { key: "content", label: "论文主要内容 / Key Content", placeholder: "描述论文的主要发现、方法和结论...", type: "textarea" },
      { key: "words", label: "摘要字数", type: "select", options: ["150字/words", "200字/words", "250字/words", "300字/words"] },
      { key: "journal", label: "目标期刊 / Target Journal", placeholder: "e.g. Nature、中国科学、IEEE（可选）", type: "text", optional: true },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      const words = f.words || "200字/words";
      if (isCN || isBi) return `你是一位专业学术编辑。请撰写一篇规范的中文学术摘要。
论文标题："${f.title}"。目标期刊：${f.journal || "通用学术期刊"}。
主要内容：${f.content}
请撰写约${words}的摘要，涵盖：研究背景/目的、研究方法、主要结果、结论与意义。
语言精准严谨，不用第一人称，避免模糊表述，紧扣数据和具体发现。${isBi ? "\n\n然后提供完整的英文摘要版本。" : ""}`;
      return `You are an expert academic editor. Write a polished, professional abstract.
Paper title: "${f.title}". Target journal: ${f.journal || "general academic"}.
Key content: ${f.content}
Write exactly ~${words} covering: Background/Purpose, Methods, Key Results, Conclusions, Significance.
Use precise journal-quality language. No first person. No vague claims. Be specific.`;
    },
  },
  {
    id: "literature",
    icon: "◆",
    label: "文献综述",
    labelEn: "Literature Review",
    desc: "系统性文献综述",
    color: "#7c3aed",
    fields: [
      { key: "topic", label: "综述主题 / Review Topic", placeholder: "e.g. 深度学习在自然语言处理中的应用", type: "text" },
      { key: "years", label: "文献年份范围", type: "select", options: ["近5年 (2020-2025)", "近10年 (2015-2025)", "近20年 (2005-2025)", "不限年份"] },
      { key: "papers", label: "关键论文（可选）", placeholder: "列出需要包含的具体文献...", type: "textarea", optional: true },
      { key: "length", label: "综述长度", type: "select", options: ["简短（约800字）", "中等（约1500字）", "详细（约2500字）"] },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      if (isCN || isBi) return `你是一位专业学术研究员，擅长撰写系统性文献综述。
综述主题："${f.topic}"。文献范围：${f.years}。综述长度：${f.length}。
${f.papers ? `需包含的文献：${f.papers}` : ""}
请用中文撰写完整文献综述，结构包括：
1. 研究主题介绍与综述范围说明
2. 按主题分类的文献综合分析（非时间顺序）
3. 研究方法与主要发现的批判性分析
4. 研究空白与矛盾之处的识别
5. 综合评述与未来研究方向
引用真实文献，格式规范，重在分析而非描述。${isBi ? "\n\n然后提供完整的英文版本。" : ""}`;
      return `You are an expert academic researcher. Write a comprehensive literature review.
Topic: "${f.topic}". Time scope: ${f.years}. Length: ${f.length}.
${f.papers ? `Key papers: ${f.papers}` : ""}
Structure: 1) Introduction & scope 2) Thematic synthesis (not chronological) 3) Critical analysis
4) Research gaps & contradictions 5) Synthesis & future directions.
Cite real papers in APA format. Be analytical, not descriptive.`;
    },
  },
  {
    id: "introduction",
    icon: "◐",
    label: "引言撰写",
    labelEn: "Introduction",
    desc: "学术论文引言",
    color: "#f59e0b",
    fields: [
      { key: "topic", label: "论文题目 / Topic", placeholder: "你的论文题目或研究方向", type: "text" },
      { key: "thesis", label: "核心论点 / Thesis Statement", placeholder: "你的主要论点或研究问题是什么？", type: "textarea" },
      { key: "context", label: "研究背景（可选）", placeholder: "需要强调的特定背景、领域或角度...", type: "text", optional: true },
      { key: "length", label: "引言长度", type: "select", options: ["简短（300字）", "中等（500字）", "详细（800字）"] },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      if (isCN || isBi) return `你是一位专业的学术论文写作专家。请为以下论文撰写一段有吸引力的引言。
论文题目："${f.topic}"。核心论点：${f.thesis}。背景：${f.context || "通用学术"}。
引言长度：约${f.length}。
结构要求：开篇引语（数据/现象），研究背景，文献空白，研究问题/目标，论文结构说明。
用规范学术中文，结尾明确说明论文结构安排，引用3-5篇真实参考文献。${isBi ? "\n\n然后提供完整的英文版本。" : ""}`;
      return `You are an expert academic writer. Write a compelling introduction for an academic paper.
Topic: "${f.topic}". Thesis: ${f.thesis}. Context: ${f.context || "general academic"}. Length: ~${f.length}.
Structure: Hook (fact/statistic), Background, Literature gap, Research questions, Paper roadmap.
Use formal academic English. Cite 3-5 plausible real references.`;
    },
  },
  {
    id: "thesis",
    icon: "◑",
    label: "论点强化",
    labelEn: "Thesis Statement",
    desc: "优化核心论点",
    color: "#0ea5e9",
    fields: [
      { key: "topic", label: "研究课题 / Research Topic", placeholder: "你的研究主题或研究问题", type: "text" },
      { key: "position", label: "你的立场 / Your Position", placeholder: "你想表达的核心主张是什么？", type: "textarea" },
      { key: "level", label: "学术级别", type: "select", options: ["本科论文", "硕士学位论文", "博士学位论文", "期刊论文"] },
      { key: "lang", label: "输出语言", type: "select", options: ["中文", "English", "中英双语"] },
    ],
    systemPrompt: (f) => {
      const isCN = f.lang === "中文", isBi = f.lang === "中英双语";
      if (isCN || isBi) return `你是一位专业的学术写作指导专家，帮助学生打磨论点表述。
研究课题："${f.topic}"。立场：${f.position}。学术级别：${f.level}。
请提供：
1. 三个不同版本的论点表述（从弱到强递进）
2. 分析每个版本的优劣所在
3. 推荐最佳版本并说明理由
4. 进一步打磨的建议
论点要精准、有可争辩性，与${f.level}的学术要求相符。${isBi ? "\n\n然后提供完整的英文版本。" : ""}`;
      return `You are an expert academic writing coach. Help craft and strengthen a thesis statement.
Topic: "${f.topic}". Position: ${f.position}. Level: ${f.level}.
Provide: 1) Three thesis versions (weak→strong) 2) Analysis of each 3) Recommended best version 4) Tips to sharpen.
Keep statements precise, arguable, scope-appropriate for ${f.level}.`;
    },
  },
  {
    id: "paraphrase",
    icon: "↺",
    label: "论文仿写",
    labelEn: "Paper Paraphrasing",
    desc: "仿写改写，保留核心观点",
    color: "#8b5cf6",
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
    color: "#ea580c",
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
    color: "#059669",
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
    color: "#2563eb",
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
    color: "#db2777",
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
// DeepSeek uses OpenAI-compatible API — cheap, supports Chinese, no CORS issues
const DS_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY || "";
const DS_BASE = "https://api.deepseek.com/chat/completions";
const DS_MODEL = "deepseek-chat"; // deepseek-chat = DeepSeek V3

function dsHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${DS_KEY}`,
  };
}

async function streamClaude(systemPrompt, userMessage = "Please generate the content now.", maxTokens = 2000, onChunk) {
  if (!DS_KEY) throw new Error("未配置 DeepSeek API Key（REACT_APP_DEEPSEEK_API_KEY），请在 Vercel 环境变量中添加。");
  const res = await fetch(DS_BASE, {
    method: "POST",
    headers: dsHeaders(),
    body: JSON.stringify({
      model: DS_MODEL,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误 ${res.status}：${err}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") break;
      try {
        const evt = JSON.parse(raw);
        const chunk = evt.choices?.[0]?.delta?.content;
        if (chunk) { full += chunk; onChunk?.(full); }
      } catch { /* skip malformed */ }
    }
  }
  return full || "生成内容为空，请重试。";
}

async function callClaude(systemPrompt, userMessage = "Please generate the content now.", maxTokens = 2000) {
  if (!DS_KEY) return "";
  try {
    const res = await fetch(DS_BASE, {
      method: "POST",
      headers: dsHeaders(),
      body: JSON.stringify({
        model: DS_MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch { return ""; }
}

// ─── SEARCH API HELPERS ─────────────────────────────────────
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
      venue: p.publicationVenue?.name, source: "Semantic Scholar", sourceColor: "#2563eb",
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
        source: "OpenAlex", sourceColor: "#3b82f6",
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
      citations: null, venue: "arXiv", source: "arXiv", sourceColor: "#ef4444",
    }));
  } catch { return []; }
}

async function searchCrossRef(query, limit = 5) {
  try {
    const res = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,published-print,abstract,is-referenced-by-count,container-title&mailto=scholarly@example.com`);
    const data = await res.json();
    return (data.message?.items || []).map(p => ({
      id: p.DOI,
      title: (p.title || [])[0] || "Untitled",
      authors: (p.author || []).slice(0, 3).map(a => `${a.given || ""} ${a.family || ""}`).join(", "),
      year: p["published-print"]?.["date-parts"]?.[0]?.[0],
      abstract: p.abstract ? p.abstract.replace(/<[^>]*>/g, "").slice(0, 400) : "",
      url: `https://doi.org/${p.DOI}`,
      pdfUrl: null, citations: p["is-referenced-by-count"],
      venue: (p["container-title"] || [])[0],
      source: "CrossRef", sourceColor: "#059669",
    }));
  } catch { return []; }
}

// CORE API removed — requires a real API key and its Authorization header
// triggers CORS preflight failures in browser environments.

async function searchEuropePMC(query, limit = 5) {
  try {
    const res = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&resultType=core`);
    const data = await res.json();
    return (data.resultList?.result || []).map(p => ({
      id: p.pmid || p.id,
      title: p.title || "Untitled",
      authors: p.authorString || "",
      year: p.pubYear,
      abstract: (p.abstractText || "").slice(0, 400),
      url: p.doi ? `https://doi.org/${p.doi}` : (p.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}` : null),
      pdfUrl: p.isOpenAccess === "Y" ? `https://europepmc.org/articles/${p.pmcid || p.id}?pdf=render` : null,
      citations: p.citedByCount,
      venue: p.journalTitle,
      source: "Europe PMC", sourceColor: "#0ea5e9",
    }));
  } catch { return []; }
}

async function searchDOAJ(query, limit = 5) {
  try {
    const res = await fetch(`https://doaj.org/api/search/articles/${encodeURIComponent(query)}?page=1&pageSize=${limit}`);
    const data = await res.json();
    return (data.results || []).map(p => {
      const bib = p.bibjson || {};
      return {
        id: bib.identifier?.find(i => i.type === "doi")?.id || p.id,
        title: bib.title || "Untitled",
        authors: (bib.author || []).slice(0, 3).map(a => a.name || "").join(", "),
        year: bib.year,
        abstract: (bib.abstract || "").slice(0, 400),
        url: bib.identifier?.find(i => i.type === "doi")?.id ? `https://doi.org/${bib.identifier.find(i => i.type === "doi").id}` : (bib.link || [])[0]?.url,
        pdfUrl: (bib.link || []).find(l => l.type === "fulltext")?.url,
        citations: null,
        venue: bib.journal?.title,
        source: "DOAJ", sourceColor: "#f59e0b",
      };
    });
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
    const accumulated = fullContent; // capture for closure
    const content = await streamClaude(sectionPrompt, "请生成此章节的完整内容，字数必须达到要求，内容充实详尽。", 4096, (partial) => {
      onPartial(accumulated + partial);
    });
    fullContent += content + "\n\n";
    onPartial(fullContent);
  }
  onProgress("");
  return fullContent;
}

// ─── THEME ───────────────────────────────────────────────────
const T = {
  bg: "#f5f7fb",
  card: "#ffffff",
  cardBorder: "#e2e8f0",
  cardHover: "#f0f4ff",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  navBg: "rgba(255,255,255,0.92)",
  navBorder: "#e2e8f0",
  inputBg: "#f8fafc",
  inputBorder: "#cbd5e1",
  outputBg: "#f0f4ff",
};

// ─── SUBCOMPONENTS ────────────────────────────────────────────
function ToolCard({ tool, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 16, padding: "22px 20px", cursor: "pointer", textAlign: "left",
      transition: "all 0.2s", width: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = T.cardHover; e.currentTarget.style.borderColor = tool.color + "66"; e.currentTarget.style.boxShadow = `0 4px 12px ${tool.color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.card; e.currentTarget.style.borderColor = T.cardBorder; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ fontSize: 22, color: tool.color, marginBottom: 10 }}>{tool.icon}</div>
      <div style={{ color: T.text, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{tool.label}</div>
      <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "monospace", marginBottom: 6 }}>{tool.labelEn}</div>
      <div style={{ color: T.textSecondary, fontSize: 13 }}>{tool.desc}</div>
    </button>
  );
}

function WritingPanel({ tool, onBack }) {
  const [fields, setFields] = useState(() => {
    const defaults = {};
    tool.fields.forEach(f => { if (f.type === "select") defaults[f.key] = f.options[0]; });
    return defaults;
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState("");
  const [genError, setGenError] = useState("");
  const outputRef = useRef(null);

  const handleGenerate = useCallback(async () => {
    const missing = tool.fields.filter(f => !f.optional && f.type !== "select" && !fields[f.key]);
    if (missing.length > 0) return;
    setLoading(true);
    setOutput("");
    setProgress("");
    setGenError("");

    try {
      if (tool.longForm) {
        await generateWorkReport(
          { ...fields, wordCount: fields.wordCount || tool.fields.find(f => f.key === "wordCount")?.options?.[0] || "一万字 (10,000)" },
          setProgress,
          (partial) => { setOutput(partial); setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }
        );
      } else {
        const prompt = tool.systemPrompt(fields);
        await streamClaude(prompt, "Please generate the content now.", tool.maxTokens || 2000, (partial) => {
          setOutput(partial);
        });
      }
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setGenError(`生成失败：${err?.message || "未知错误，请检查网络或 API 配置后重试。"}`);
    } finally {
      setLoading(false);
    }
  }, [tool, fields]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = output ? output.replace(/\s/g, "").length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <button onClick={onBack} style={{
          background: T.card, border: `1px solid ${T.cardBorder}`,
          color: T.textSecondary, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13,
        }}>← 返回</button>
        <span style={{ fontSize: 20, color: tool.color }}>{tool.icon}</span>
        <div>
          <div style={{ color: T.text, fontWeight: 600, fontSize: 17 }}>{tool.label}</div>
          <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "monospace" }}>{tool.labelEn}</div>
        </div>
      </div>

      {/* Work report notice */}
      {tool.longForm && (
        <div style={{
          background: "#fef2f2", border: `1px solid ${tool.color}33`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: tool.color, fontSize: 16 }}>▣</span>
          <div>
            <div style={{ color: tool.color, fontSize: 13, fontWeight: 600 }}>长文分段生成模式</div>
            <div style={{ color: T.textSecondary, fontSize: 12 }}>报告将分5个章节依次生成，完整生成可能需要 2-5 分钟，请耐心等待</div>
          </div>
        </div>
      )}

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
        {tool.fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", color: f.optional ? T.textMuted : T.textSecondary, fontSize: 13, marginBottom: 7, fontFamily: "monospace" }}>
              {f.label}{f.optional && <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 6 }}>(可选)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                value={fields[f.key] || ""}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                rows={4}
                style={{
                  width: "100%", background: T.inputBg,
                  border: `1px solid ${T.inputBorder}`, borderRadius: 10,
                  padding: "12px 14px", color: T.text, fontSize: 14,
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            ) : f.type === "select" ? (
              <select
                value={fields[f.key] || f.options[0]}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  width: "100%", background: T.card,
                  border: `1px solid ${T.inputBorder}`, borderRadius: 10,
                  padding: "12px 14px", color: T.text, fontSize: 14,
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
                  width: "100%", background: T.inputBg,
                  border: `1px solid ${T.inputBorder}`, borderRadius: 10,
                  padding: "12px 14px", color: T.text, fontSize: 14,
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{
        background: loading ? T.cardBorder : tool.color,
        color: loading ? T.textMuted : "#fff",
        border: "none", borderRadius: 12, padding: "14px 32px",
        fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        width: "100%", fontFamily: "monospace", letterSpacing: "0.05em", transition: "all 0.2s",
        boxShadow: loading ? "none" : `0 4px 14px ${tool.color}33`,
      }}>
        {loading ? (progress || "✦ AI 生成中...") : `✦ 生成 ${tool.label}`}
      </button>

      {genError && (
        <div style={{
          marginTop: 16, background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontSize: 13, lineHeight: 1.6,
        }}>
          ⚠️ {genError}
        </div>
      )}

      {/* Output */}
      {(loading || output) && (
        <div ref={outputRef} style={{
          marginTop: 28, background: T.outputBg,
          border: `1px solid ${tool.color}33`,
          borderRadius: 16, padding: "24px",
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: tool.color, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700 }}>
                ✦ AI OUTPUT
              </span>
              {output && (
                <span style={{ color: T.textMuted, fontSize: 11, fontFamily: "monospace" }}>
                  {charCount.toLocaleString()} 字
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {tool.gensparkLink && output && !loading && (
                <button
                  onClick={() => window.open("https://www.genspark.ai/", "_blank")}
                  style={{
                    background: "#dbeafe", color: "#2563eb",
                    border: "1px solid #93c5fd", borderRadius: 8,
                    padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}
                >
                  ▦ 在 Genspark 创建 PPT →
                </button>
              )}
              {output && (
                <button onClick={handleCopy} style={{
                  background: copied ? "#d1fae5" : T.card,
                  color: copied ? "#059669" : T.textSecondary,
                  border: `1px solid ${copied ? "#6ee7b7" : T.cardBorder}`,
                  borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12,
                }}>
                  {copied ? "✓ 已复制" : "复制"}
                </button>
              )}
            </div>
          </div>

          {/* Genspark guide */}
          {tool.gensparkLink && output && !loading && (
            <div style={{
              background: "#dbeafe", border: "1px solid #93c5fd",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              fontSize: 12, color: "#1d4ed8", lineHeight: 1.7,
            }}>
              <strong>使用 Genspark 生成 PPT：</strong>点击上方按钮进入 Genspark → 选择「AI Slides」→ 粘贴上方 PPT 大纲内容 → 一键生成精美 PPT
            </div>
          )}

          {/* Long report progress */}
          {tool.longForm && loading && progress && (
            <div style={{
              background: "#fce7f3", borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 14, height: 14, border: `2px solid ${tool.color}44`, borderTopColor: tool.color, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
              <span style={{ color: tool.color, fontSize: 12, fontFamily: "monospace" }}>{progress}</span>
            </div>
          )}

          {!output && loading && !tool.longForm ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${tool.color}44`, borderTopColor: tool.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: T.textSecondary, fontSize: 13 }}>Claude AI 正在生成...</span>
            </div>
          ) : (
            <pre style={{
              color: T.text, fontSize: 14, lineHeight: 1.8,
              whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
              fontFamily: "'Georgia', serif",
            }}>{output}{loading ? "▌" : ""}</pre>
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
      background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 10, cursor: "pointer",
      transition: "all 0.15s", animation: `fadeIn 0.3s ease ${index * 0.04}s both`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = T.cardHover; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.card; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{
              background: paper.sourceColor + "18", color: paper.sourceColor,
              border: `1px solid ${paper.sourceColor}33`,
              borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
            }}>{paper.source}</span>
            {paper.year && <span style={{ color: T.textMuted, fontSize: 12 }}>{paper.year}</span>}
            {paper.citations != null && <span style={{ color: T.textMuted, fontSize: 12 }}>◈ {paper.citations} cited</span>}
          </div>
          <div style={{ color: T.text, fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 5 }}>
            {paper.title}
          </div>
          <div style={{ color: T.textSecondary, fontSize: 12 }}>
            {paper.authors}
            {paper.venue && <span style={{ color: T.textMuted }}> · {paper.venue}</span>}
          </div>
          {expanded && paper.abstract && (
            <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.6, marginTop: 10, background: T.inputBg, padding: "10px 12px", borderRadius: 8 }}>
              {paper.abstract}...
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {paper.url && (
            <a href={paper.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ background: T.inputBg, color: T.textSecondary, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, textDecoration: "none" }}>
              View →
            </a>
          )}
          {paper.pdfUrl && (
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px", fontSize: 12, textDecoration: "none" }}>
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
  const [searchError, setSearchError] = useState("");

  const doSearch = async (q) => {
    const sq = q || query;
    if (!sq.trim()) return;
    setLoading(true);
    setResults([]);
    setAiNote(null);
    setSearchError("");
    try {
      const [s, o, a, cr, ep, dj] = await Promise.all([
        searchSemanticScholar(sq, 7),
        searchOpenAlex(sq, 6),
        searchArxiv(sq, 5),
        searchCrossRef(sq, 5),
        searchEuropePMC(sq, 5),
        searchDOAJ(sq, 4),
      ]);
      const all = [...s, ...o, ...a, ...cr, ...ep, ...dj];
      const seen = new Set();
      const deduped = all.filter(p => {
        const k = (p.title || "").toLowerCase().slice(0, 40);
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
      setResults(deduped);
      setLoading(false);
      if (deduped.length > 0) {
        try {
          const summaries = deduped.slice(0, 5).map((p, i) => `[${i+1}] "${p.title}" (${p.year}) — ${p.abstract?.slice(0, 150) || ""}`).join("\n");
          const note = await callClaude(
            `You are an academic assistant. Given papers about "${sq}", respond ONLY with JSON: {"synthesis":"2 sentence summary","followUp":["query1","query2","query3"]}. No markdown.`,
            summaries
          );
          try { setAiNote(JSON.parse(note.replace(/```json|```/g, "").trim())); } catch { setAiNote(null); }
        } catch { setAiNote(null); }
      }
    } catch (err) {
      setLoading(false);
      setSearchError("搜索时出现错误，请稍后重试。");
    }
  };

  const suggestions = ["transformer self-attention", "climate policy economics", "CRISPR off-target effects", "quantum error correction", "mRNA vaccine immunology"];

  return (
    <div>
      <div style={{ display: "flex", gap: 0, background: T.card, border: `1px solid ${T.inputBorder}`, borderRadius: 14, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="Search 200M+ academic papers across 6 databases..."
          style={{
            flex: 1, background: "transparent", border: "none",
            padding: "14px 18px", color: T.text, fontSize: 15, fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button onClick={() => doSearch()} style={{
          background: T.accent, color: "#fff", border: "none",
          padding: "0 24px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em",
        }}>SEARCH</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => { setQuery(s); doSearch(s); }} style={{
            background: T.card, border: `1px solid ${T.cardBorder}`,
            color: T.textSecondary, borderRadius: 20, padding: "4px 12px", fontSize: 12,
            cursor: "pointer", fontFamily: "monospace",
          }}>{s}</button>
        ))}
      </div>

      {searchError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
          ⚠️ {searchError}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${T.accent}44`, borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ color: T.textSecondary, fontSize: 13, fontFamily: "monospace" }}>Searching 6 databases: Semantic Scholar · OpenAlex · arXiv · CrossRef · Europe PMC · DOAJ...</div>
        </div>
      )}

      {aiNote && !loading && (
        <div style={{ background: T.accentLight, border: `1px solid ${T.accent}33`, borderRadius: 14, padding: "18px 20px", marginBottom: 20, animation: "fadeIn 0.4s ease" }}>
          <div style={{ color: T.accent, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 700 }}>✦ AI SYNTHESIS</div>
          <p style={{ color: T.text, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px 0" }}>{aiNote.synthesis}</p>
          {aiNote.followUp?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {aiNote.followUp.map(f => (
                <button key={f} onClick={() => { setQuery(f); doSearch(f); }} style={{
                  background: "transparent", border: `1px solid ${T.accent}44`,
                  color: T.accent, borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>+ {f}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "monospace", marginBottom: 14 }}>
          {results.length} papers from 6 databases · click to expand abstracts
        </div>
      )}
      {results.map((p, i) => <PaperCard key={p.id || i} paper={p} index={i} />)}

      {!loading && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: 14, color: T.textSecondary }}>Search across 6 academic databases</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
            {[
              { name: "Semantic Scholar", color: "#2563eb" },
              { name: "OpenAlex", color: "#3b82f6" },
              { name: "arXiv", color: "#ef4444" },
              { name: "CrossRef", color: "#059669" },
              { name: "Europe PMC", color: "#0ea5e9" },
              { name: "DOAJ", color: "#f59e0b" },
            ].map(db => (
              <span key={db.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textSecondary }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: db.color, display: "inline-block" }} />
                {db.name}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, marginTop: 12, color: T.textMuted }}>200M+ papers · Harvard · MIT · Stanford · Oxford</div>
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
      background: T.bg,
      color: T.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        input, textarea, select { outline: none; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
      `}</style>

      {/* Top Nav */}
      <nav style={{
        borderBottom: `1px solid ${T.navBorder}`,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        height: 56,
        background: T.navBg,
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
            Scholara<span style={{ color: T.accent }}>AI</span>
          </span>
          <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace", letterSpacing: "0.1em" }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveTool(null); }} style={{
              background: tab === t.id ? T.accentLight : "transparent",
              border: tab === t.id ? `1px solid ${T.accent}33` : "1px solid transparent",
              color: tab === t.id ? T.accent : T.textSecondary,
              borderRadius: 8, padding: "6px 16px", cursor: "pointer",
              fontSize: 13, fontFamily: "monospace", letterSpacing: "0.03em",
              transition: "all 0.15s", fontWeight: tab === t.id ? 600 : 400,
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
          background: "linear-gradient(180deg, #dbeafe 0%, #f5f7fb 100%)",
          borderBottom: `1px solid ${T.navBorder}`,
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: T.accent, fontFamily: "monospace", marginBottom: 14, textTransform: "uppercase", fontWeight: 700 }}>
            Academic AI Platform
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 700, letterSpacing: "-0.02em", color: T.text, lineHeight: 1.15, marginBottom: 12 }}>
            {tab === "write" ? (
              <>AI 智能写作平台<br /><span style={{ fontSize: "0.55em", color: T.textSecondary, fontWeight: 400 }}>论文仿写 · 降低AI率 · 开题报告 · PPT演讲稿 · 万字报告</span></>
            ) : (
              <>Search 200M+ Papers<br /><span style={{ fontSize: "0.55em", color: T.textSecondary, fontWeight: 400 }}>6 Databases · Harvard · MIT · Stanford · Oxford</span></>
            )}
          </h1>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* WRITE TAB */}
        {tab === "write" && !activeTool && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ color: T.textMuted, fontSize: 12, fontFamily: "monospace", marginBottom: 20, letterSpacing: "0.05em" }}>
              选择写作任务 · SELECT A WRITING TASK
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {WRITING_TOOLS.map(tool => (
                <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />
              ))}
            </div>
            <div style={{
              marginTop: 36,
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 16, padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ color: T.textMuted, fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700 }}>✦ POWERED BY</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { name: "Claude Sonnet 4", desc: "AI 写作引擎", color: "#f97316" },
                  { name: "论文仿写 & 降AI率", desc: "11种写作模式", color: "#8b5cf6" },
                  { name: "Genspark PPT", desc: "演讲稿联动", color: "#2563eb" },
                  { name: "万字报告", desc: "分段智能生成", color: "#db2777" },
                ].map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                    <span style={{ color: T.textSecondary, fontSize: 12 }}>{p.name}</span>
                    <span style={{ color: T.textMuted, fontSize: 11 }}>· {p.desc}</span>
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
