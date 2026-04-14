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
];

const TABS = [
  { id: "write", label: "AI 写作", icon: "✦" },
  { id: "search", label: "文献搜索", icon: "◎" },
];

// ─── API HELPERS ──────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage = "Please generate the content now.") {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
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
  const outputRef = useRef(null);

  const handleGenerate = async () => {
    const missing = tool.fields.filter(f => f.key !== "papers" && f.key !== "funding" && f.key !== "journal" && f.key !== "context" && !fields[f.key]);
    if (missing.length > 0) return;
    setLoading(true);
    setOutput("");
    const prompt = tool.systemPrompt(fields);
    const result = await callClaude(prompt);
    setOutput(result);
    setLoading(false);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>
        {tool.fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", color: "#aaa", fontSize: 13, marginBottom: 7, fontFamily: "monospace" }}>
              {f.label}
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
        {loading ? "✦ AI 生成中..." : `✦ 生成 ${tool.label}`}
      </button>

      {/* Output */}
      {(loading || output) && (
        <div ref={outputRef} style={{
          marginTop: 28, background: "rgba(255,255,255,0.02)",
          border: `1px solid ${tool.color}33`,
          borderRadius: 16, padding: "24px",
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: tool.color, fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em" }}>
              ✦ AI OUTPUT
            </span>
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
          {loading ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, border: `2px solid ${tool.color}44`, borderTopColor: tool.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#666", fontSize: 13 }}>Claude AI 正在生成，请稍候...</span>
            </div>
          ) : (
            <pre style={{
              color: "#d4d4d8", fontSize: 14, lineHeight: 1.8,
              whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
              fontFamily: "'Georgia', serif",
            }}>{output}</pre>
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
              <>AI 学术写作助手<br /><span style={{ fontSize: "0.55em", color: "#555", fontWeight: 400 }}>Outline · Proposal · Abstract · Literature Review</span></>
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
                  { name: "Semantic Scholar", desc: "200M+ 论文库", color: "#6ee7b7" },
                  { name: "OpenAlex", desc: "QS100 机构过滤", color: "#93c5fd" },
                  { name: "arXiv", desc: "最新预印本", color: "#fca5a5" },
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
