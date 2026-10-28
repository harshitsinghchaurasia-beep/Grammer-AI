# GrammarGlow AI — Smart Grammar Correction Tool
> **Hacktoberfest Problem Statement #13:** *"Detect grammar, spelling, and sentence-structure errors and suggest corrections."*
> **Tagline:** *Write Better. Communicate Smarter.*

---

## 🌟 Project Overview

**GrammarGlow AI** is an intelligent writing assistant and grammar correction platform designed to elevate English writing across academic, business, and casual contexts. It combines a real-time linguistic engine (**LanguageTool**) for deterministic grammar, spelling, and punctuation detection with **Google Gemini 3.8 Flash** for contextual rewriting, stylistic tone transformation, and pedagogical explanations.

---

## 🎯 Problem & Proposed Solution

### The Problem
Traditional word processors often miss subtle grammatical agreement errors, faulty idioms, comma splices, and awkward sentence structures. Furthermore, many grammar tools either:
1. Silently rewrite user text without explaining why mistakes happened, preventing learning.
2. Rely solely on opaque LLM calls that can hallucinate errors or alter the author's original meaning.
3. Violate user privacy by retaining private drafts and correspondence on third-party databases.

### The GrammarGlow Solution
GrammarGlow AI bridges real-time deterministic grammar checking with state-of-the-art generative intelligence:
- **Dual-Engine Architecture:** Real-time linguistic analysis powered by the LanguageTool API handles rule-based validation, while Gemini 3.8 Flash provides deep stylistic enhancement and clear error explanations.
- **Explainable Feedback:** Users can inspect every suggestion with rule IDs, original context snippets, and on-demand AI pedagogical mini-lessons ("Why this is an error" + memory tips + contrast examples).
- **Safe Granular Control:** Apply suggestions individually, batch apply all safe non-overlapping fixes, or view visual diffs before committing changes.
- **Privacy by Design:** Zero database persistence. All text is analyzed strictly in volatile memory and discarded immediately upon response completion.

---

## 🚀 Key Features

### 1. Core Grammar & Spelling Analysis
- **Grammar Detection:** Subject-verb agreement, pronoun cases, verb tense inconsistencies, and preposition errors.
- **Spelling Detection:** Real-time typo detection and contextual replacement suggestions.
- **Punctuation & Typography:** Missing commas, apostrophe misuse, and erroneous capitalization.
- **Sentence Structure:** Sentence fragments, dangling modifiers, passive voice flags, and word order issues.
- **Multi-Dialect Support:** English (US), English (UK), English (Canada), English (Australia).

### 2. Interactive Editing Experience
- **Interactive Underlines:** Color-coded wavy underlines corresponding to error categories (Red = Spelling, Indigo = Grammar, Amber = Punctuation, Teal = Structure, Purple = Style).
- **Dual-Mode Editor:** Seamlessly toggle between direct text editing and interactive highlight review.
- **Safe Replacement Algorithm:** Non-overlapping text replacement guarantees index integrity during batch and single-item updates.
- **Visual Diff Viewer:** Token-level side-by-side diff highlighting deleted words in red strikethrough and added words in green.

### 3. Gemini AI Writing Studio
- **Stylistic Rewriting:** Transform drafts into *Formal*, *Professional*, *Academic*, *Concise*, or *Casual* tones.
- **Clarity Scoring:** Before vs. after readability and clarity ratings.
- **Transformation Breakdown:** Detailed breakdown of phrase transformations and linguistic rationale.
- **On-Demand Rule Lessons:** Single-click "Explain with AI" buttons for any flagged issue.

### 4. Readability & Metrics
- Live word count, character count (with & without spaces), sentence count, and paragraph count.
- **Flesch Reading Ease Formula** and equivalent educational grade level.
- Estimated reading time calculation.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | Component-driven UI and strict type safety |
| **Styling** | Tailwind CSS v4 | Clean, responsive design with purple/indigo palette |
| **Icons** | Lucide React | High-clarity iconography |
| **Animation & Delight** | Canvas-Confetti | Subtle celebration on error-free drafts |
| **Server Backend** | Express (Node.js + TSX) | Secure API proxy and in-memory request routing |
| **Grammar Engine** | LanguageTool API v2 | Real-time grammar, spelling, and punctuation analysis |
| **AI Neural Engine** | Google Gemini 3.8 Flash (`@google/genai`) | Stylistic rewriting and pedagogical explanations |
| **Build System** | Vite 8 + ESBuild | Rapid hot compilation and optimized production bundles |

---

## 🏛️ Application Architecture

```
[Browser / React Client]
       │
       ▼ (HTTP / JSON)
[Express Server Proxy (server.ts)]
       ├── /api/status          --> Health check & engine status
       ├── /api/grammar/check   ──> [LanguageTool API v2] (en-US / en-GB / etc.)
       ├── /api/ai/improve      ──> [Gemini 3.8 Flash] (@google/genai SDK)
       └── /api/ai/explain      ──> [Gemini 3.8 Flash] (Mini-lessons & tips)
```

### Security & Privacy Architecture
1. **Server-Side API Keys:** The `GEMINI_API_KEY` is accessed strictly in `server.ts` and never bundled or sent to the browser.
2. **User-Agent Telemetry:** As per `@google/genai` guidelines, the server sets `User-Agent: 'aistudio-build'`.
3. **Graceful Degradation:** If `GEMINI_API_KEY` is not present, the core LanguageTool Grammar Checker, single and batch fixes, diff viewer, copy, and readability statistics remain 100% operational.
4. **Data Discard:** No user input is saved to databases, disks, or local storage.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/GrammarGlow-AI.git
cd GrammarGlow-AI
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
# Optional: Required for Gemini AI Writing Studio and Explanations.
# Core LanguageTool grammar checking works without this key!
GEMINI_API_KEY="your-gemini-api-key"

PORT=3000
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Testing & Validation Guide

The project includes built-in test presets and scenarios covering all edge cases:

| Test Case | Scenario | Expected Behavior |
|---|---|---|
| **1. Correct Sentence** | "The quick brown fox jumps over the lazy dog." | Returns 0 issues, displays celebratory "Flawless Writing!" banner. |
| **2. Subject-Verb Agreement** | "The marketing team have finished their audit." | Flags agreement mismatch, suggests "has finished". |
| **3. Common Typos** | "Definately check you're work." | Flags "Definately" (Spelling -> "Definitely") and "you're" (Grammar -> "your"). |
| **4. Punctuation Missing** | "If anyone have questions please contact me." | Flags agreement and suggests comma separation. |
| **5. Sentence Structure** | Academic sample with passive construction | Detects awkward phrasing and suggests active alternatives. |
| **6. Empty Input** | Submitting empty text or whitespace | Client validates input and shows helpful toast warning. |
| **7. Long Text (>5,000 chars)** | Long articles or multi-paragraph essays | Backend streams and calculates readability accurately. |
| **8. Individual Fix Application** | Clicking single replacement chip | Replaces text slice, recalculates subsequent offsets cleanly without index corruption. |
| **9. Batch Fix Application** | Clicking "Apply All" | Applies suggestions right-to-left safely. |
| **10. AI Unavailable Fallback** | Running with empty `GEMINI_API_KEY` | Clear prompt appears in AI Studio with no crash; Grammar Checker works uninterrupted. |
| **11. Copy & Download** | Clicking "Copy" / "Export" | Places text in system clipboard / downloads `.txt` file. |

---

## 🔒 Privacy Considerations
- User text is transmitted exclusively for active analysis requests over encrypted HTTPS.
- No personal identifiable information (PII) is collected or required.
- The service does not store writing samples for model training or advertising.

---

## 🔮 Future Enhancements
- [ ] Real-time document importing (DOCX, PDF, Markdown).
- [ ] Custom personal dictionary for specialized technical terms and brand names.
- [ ] Browser extension for instant checking on web forms.
- [ ] Readability target presets (e.g. Hemingway style, Plain English 6th-grade standard).

---

## 🤝 Contribution Guidelines (Hacktoberfest)
We welcome contributions during Hacktoberfest and beyond!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-rule-detector`).
3. Commit your changes (`git commit -m 'Add support for custom dictionary'`).
4. Push to your branch (`git push origin feature/amazing-rule-detector`).
5. Open a Pull Request with a clear description and test verification.

---

## 📄 License
This project is open-source under the Apache-2.0 License.
