# Manga My Life

Manga My Life turns a short life story into a dramatic three-panel manga strip.

## Project structure

- `frontend/` - React + Vite + TypeScript + Tailwind UI
- `backend/` - Express + TypeScript API boundary for validation and future AI calls
- `Manga My Life - Implementation Guide & Tech Architecture.pdf` - product blueprint

## Why a backend?

The UI can be built entirely in React, but an AI provider key must not be shipped to
the browser. The backend keeps provider credentials private, validates requests, and
gives us one place to add rate limiting and structured JSON validation. The current
`/api/generate` route is intentionally a mock so the demo works before an AI provider
is configured.

## Run locally

In one terminal:

```sh
cd backend
npm run dev
```

In another terminal:

```sh
cd frontend
npm run dev
```
