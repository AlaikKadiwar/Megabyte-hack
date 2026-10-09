# Manga My Life

Manga My Life turns a short life story into one manga page containing six panels.

## Project structure

- `frontend/` - React + Vite + TypeScript + Tailwind UI
- `backend/` - Express + TypeScript API boundary for validation and future AI calls
- `Manga My Life - Implementation Guide & Tech Architecture.pdf` - product blueprint

## Why a backend?

The UI can be built entirely in React, but an AI provider key must not be shipped to
the browser. The backend keeps provider credentials private, validates requests, and
gives us one place to add rate limiting and structured JSON validation. The
`/api/generate` route asks Groq for one complete six-panel page prompt, asks
Gemini to generate one image, and returns that single manga page to React.

## Run locally

In one terminal:

```sh
cd backend
npm run dev
```

Before starting the backend, copy `backend/.env.example` to `backend/.env` and add
your Groq API key:

```sh
cp .env.example .env
```

Set both keys in `backend/.env` if you want fallback behavior:

```env
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

Groq creates the manga logic and the single six-panel image prompt. Gemini
is used only once to render that prompt as one image. Gemini does not create
the prompt.
The keys stay server-side and are never exposed to the React bundle.

The default model configuration is:

```env
GROQ_WRITER_MODEL=openai/gpt-oss-120b
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

In another terminal:

```sh
cd frontend
npm run dev
```
