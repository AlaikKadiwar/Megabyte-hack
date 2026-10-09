# HACKATHON BLUEPRINT: MANGA MY LIFE
**2-Hour Implementation & Architecture Guide**

---

## 1. TECHNOLOGY STACK & DECISION RATIONALE

* **Frontend Core — React + Vite:** Instant setup, lightning-fast HMR, zero-config bundling. Crucial for rapid 2-hour iteration.
* **Styling & Manga FX — Tailwind CSS:** Utility-first styling for speedlines, halftone background patterns, speech bubble tails, and bold borders.
* **AI Logic Engine — OpenAI / Groq API:** Direct client-side SDK fetch using standard structured JSON mode (or system prompt format enforcer).
* **Export & Sharing — html2canvas + Print API:** Single-click DOM rendering to downloadable PNG image with standard `window.print()` CSS fallback.

> **Golden Hackathon Rule:** Do not block the pitch on real-time image generation models (DALL-E / Midjourney). They are slow (10s+) and unreliable. Use high-impact CSS assets, background templates, and dynamic typography for instant 2-second renders.

---

## 2. TACTICAL 2-HOUR EXECUTION PLAN

| Timeframe | Task Focus | Deliverable / Milestone |
| :--- | :--- | :--- |
| **00–15 min** | Scaffolding & UI Framework | Vite app live with text input, genre selector, and submit button. |
| **15–35 min** | Manga Panel Layout | 3-panel vertical CSS grid with speech bubbles, captions, and SFX layers. |
| **35–60 min** | AI Engine Integration | LLM prompt connection returning validated structured JSON response. |
| **60–80 min** | Visual Polish & Manga Styling | Halftone CSS textures, action lines, dramatic fonts, screen shakes. |
| **80–95 min** | Fallback & Example Prompts | Preset buttons + mock JSON fallback ensuring guaranteed demo success. |
| **95–110 min** | Export Functionality | `html2canvas` script integration for downloading final comic strip. |
| **110–120 min** | Demo Dry Run | Scripted run with "Villain Mode" reveal rehearsed for judges. |

---

## 3. STRUCTURED AI SCRIPTWRITER PROMPT

Use direct JSON response enforcement in your LLM call to get predictable data:

```javascript
const SYSTEM_PROMPT = `You are a dramatic manga scriptwriter. Transform the user's life story into a 3-panel manga comic. Genre: {{genre}} | Story: {{story}} Return ONLY valid JSON matching this schema: { "title": "Dramatic Comic Title", "genre": "Selected Genre", "panels": [ { "panel_num": 1, "scene": "Short action summary", "caption": "Narrator note or timestamp", "dialogue": "Character quote (max 12 words)", "sound_effect": "Japanese/English SFX (e.g. ドドドド, SHAAAA)", "expression": "shocked | happy | angry | determined", "background": "action_lines | classroom | dramatic_darkness" } ] }`;
```

---

## 4. COMPONENT VISUAL ARCHITECTURE

CSS-driven panel structure avoiding external visual dependencies during live demos:

| Panel 1: The Setup | Panel 2: Escalation | Panel 3: Twist |
| :---: | :---: | :---: |
| **Dialogue:** *"8:57 AM?! The exam is in 3 minutes!"* | **Dialogue:** *"FULL POWER DASH!"* | **Dialogue:** *"This wasn't in my training arc..."* |
| **SFX:** ドドドド | **SFX:** *SHAAAA!* | **SFX:** *N-NANI?!* |
| **Footer:** Panel 1: The Setup | **Footer:** Panel 2: Escalation | **Footer:** Panel 3: Twist |

---

## 5. THE WINNING DEMO PITCH SCRIPT

* **Hook (0–15s):** "Everyday life feels mundane, but in our minds, missing a bus is an apocalyptic disaster."
* **Live Action (15–45s):** Enter real scenario -> Pick Shonen Mode -> Hit Generate -> Show dramatic reveal with sound effects.
* **The Twist Feature (45–75s):** Click "Villain Mode" on the same story -> Watch the laptop point-of-view transform the story instantly.
* **Closing (75–90s):** "Every life has a story. We just give yours the manga treatment."
