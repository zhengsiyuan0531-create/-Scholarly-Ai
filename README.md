# ScholaraAI — 智能学术写作平台

<div align="center">

**🌐 Live at [zscholara-ai.org](https://zscholara-ai.org)**

An AI-powered academic writing platform supporting Chinese & English, with intelligent multi-model routing, real-time streaming generation, and simultaneous multi-database literature search.

*智能学术写作平台 · 多模型自动优选 · 实时流式生成 · 六大文献数据库*

</div>

---

## ✨ Features

### AI Writing Tools — 11 Modules

| Module | Description | Output Language |
|--------|-------------|-----------------|
| 论文大纲 | Structured paper outline with chapter breakdown | 中文 / English / 双语 |
| 研究提案 | Full research proposal with timeline & budget | 中文 / English / 双语 |
| 摘要生成 | Journal-quality abstract (150–300 words) | 中文 / English / 双语 |
| 文献综述 | Systematic literature review with gap analysis | 中文 / English / 双语 |
| 引言撰写 | Academic introduction with hook and paper roadmap | 中文 / English / 双语 |
| 论点强化 | Thesis statement refinement (3 progressive versions) | 中文 / English / 双语 |
| 论文仿写 | Paraphrase & rewrite preserving core arguments | 中文 |
| 降低AI重合率 | Humanise AI-generated text to reduce AI detection | 中文 / English |
| 开题报告 | Full Chinese-standard research opening report | 中文 |
| PPT + 演讲稿 | Slide outline + 2,000-word speech script → Genspark | 中文 |
| 工作报告 | Long-form work report, 10,000–30,000 words | 中文 |

### Literature Search
- **6 databases queried simultaneously:** Semantic Scholar · OpenAlex · arXiv · CrossRef · Europe PMC · DOAJ
- AI-synthesised research summary for each query
- Cross-source deduplication with direct PDF links where available

### Platform Highlights
- **Real-time streaming** — content appears token-by-token; no waiting for a blank screen to fill
- **Multi-version management** — generate Chinese, English, and bilingual editions of the same document without overwriting previous outputs; edit any version inline
- **Export** — download results as PDF, Word (.docx), or plain text
- **Smart model routing** — the backend automatically selects the fastest, most capable model for each task type and language; model details are never exposed to end users
- **45-second timeout + auto-fallback** — if the primary model is slow or unavailable, the system silently retries with the next configured model

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Create React App), inline CSS |
| Streaming | `ReadableStream` + Server-Sent Events for real-time rendering |
| AI Routing | Multi-model intelligent routing (internal, not user-facing) |
| Literature APIs | Semantic Scholar, OpenAlex, arXiv, CrossRef, Europe PMC, DOAJ |
| Hosting | Vercel — auto-deploys on every push to `main` |
| Domain | `zscholara-ai.org` |

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/zhengsiyuan0531-create/-Scholarly-Ai.git
cd -Scholarly-Ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Open .env.local and add your API keys (see table below)

# 4. Start the dev server
npm start
# → http://localhost:3000
```

### Environment Variables

```env
# .env.local  (never commit this file)

# Required — at least one of the following must be set
REACT_APP_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — additional providers improve quality and add redundancy
REACT_APP_DOUBAO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_DOUBAO_MODEL=ep-20250429-xxxxxxxx        # Doubao endpoint ID
REACT_APP_GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> API keys are embedded at build time via `REACT_APP_*` prefixes and consumed client-side. Never commit `.env.local`.

### Where to Obtain API Keys

| Provider | Console | Notes |
|----------|---------|-------|
| DeepSeek | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) | Pay-as-you-go, very low cost |
| Doubao / 火山引擎 | [console.volcengine.com/ark](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey) | Free credits for new users; requires a separate endpoint ID |
| Google Gemini | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Free tier available (VPN required outside mainland China) |
| Grok / xAI | [console.x.ai](https://console.x.ai) | $25/month free credits (VPN required outside mainland China) |

---

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Push to trigger automatic Vercel deploy
git push origin main
```

### Vercel Setup

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Add all `REACT_APP_*` keys under **Settings → Environment Variables**
3. Add your custom domain under **Settings → Domains** and set it as primary
4. Disable **Deployment Protection** (Settings → Deployment Protection → Off) so public visitors can access the site without a Vercel account

---

## 🤖 AI Model Routing (Internal)

The platform silently selects the best available model based on task type and output language. End users see no model names or branding.

| Task | Primary | Fallback |
|------|---------|---------|
| General Chinese writing | DeepSeek | Doubao |
| Long-form Chinese reports (工作报告 / 开题报告) | Doubao | DeepSeek |
| English academic writing | Gemini Flash | DeepSeek |
| Bilingual output | DeepSeek | Doubao |

If the primary model fails or exceeds the 45-second timeout, the system automatically retries with the next available model.

---

## 📁 Project Structure

```
.
├── public/
│   └── index.html
├── src/
│   └── App.js          # Entire application — ~1,400 lines
├── .env.local.example  # Environment variable template
├── package.json
└── README.md
```

**`src/App.js` section map:**

| Lines | Contents |
|-------|----------|
| 1 – 390 | Writing tool definitions (fields, prompts, token limits) |
| 390 – 450 | AI provider config & `pickProvider()` routing logic |
| 450 – 560 | Streaming API functions (`streamOpenAI`, `streamGemini`, `streamGenerate`) |
| 560 – 660 | Long-form report generator (`generateWorkReport`) |
| 660 – 900 | `WritingPanel` — form, generation, multi-version management, export |
| 900 – 1,100 | `LiteraturePanel` — search, deduplication, AI synthesis |
| 1,100 – end | `App` root, navigation, homepage |

---

## 📄 License

MIT © 2025 ScholaraAI
