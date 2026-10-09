import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions'
const groqWriterModel = process.env.GROQ_WRITER_MODEL ?? 'openai/gpt-oss-120b'
const geminiImageModel = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image'
const textRequestTimeoutMs = 120_000
const imageRequestTimeoutMs = 90_000

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

const generateRequest = z.object({
  story: z.string().trim().min(1).max(2000),
  genre: z.string().trim().min(1).max(40),
  isVillainMode: z.boolean().default(false),
})

const mangaResponse = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  image_prompt: z.string().min(20),
  image_data_url: z.string().url().optional(),
})

type GenerateRequest = z.infer<typeof generateRequest>
type MangaResponse = z.infer<typeof mangaResponse>

function createSystemPrompt({ genre, isVillainMode }: GenerateRequest) {
  const mode = isVillainMode
    ? 'VILLAIN POV: tell the story from the perspective of the object, system, or bus trying to ruin the user’s life'
    : 'HERO POV'

  return `You are a dramatic manga scriptwriter and image-prompt director.
Transform the user's life story into one complete manga page containing exactly 6 panels.
Return ONLY valid JSON. The image_prompt must describe the whole page layout and all six panels:
panel 1 setup, panel 2 escalation, panel 3 complication, panel 4 turning point,
panel 5 climax, and panel 6 resolution. The image model must render the entire page as one image.
Use detailed black-and-white ink, screentone shading, gutters, speech bubbles, captions,
and dramatic sound effects. Keep the same protagonist, outfit, visual style, and setting
consistent across all panels. Include readable dialogue and captions in the generated image.
Schema:
{
  "title": "Dramatic Comic Title",
  "genre": "${genre}",
  "image_prompt": "Detailed prompt for one complete manga page with exactly 6 panels"
}`
}

async function generateMangaScript(input: GenerateRequest): Promise<MangaResponse> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required for manga script generation')
  }

  return generateScriptWithGroq(input, process.env.GROQ_API_KEY)
}

async function generateScriptWithGroq(input: GenerateRequest, apiKey: string): Promise<MangaResponse> {
  const response = await fetch(groqApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: groqWriterModel,
      messages: [
        { role: 'system', content: createSystemPrompt(input) },
        { role: 'user', content: input.story },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  })

  if (!response.ok) throw new Error(`Groq request failed (${response.status}): ${await response.text()}`)

  const data: unknown = await response.json()
  const content = z.object({
    choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
  }).parse(data).choices[0].message.content

  return mangaResponse.parse(JSON.parse(content))
}

async function generateMangaImage(imagePrompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiImageModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create one finished manga page with exactly six distinct comic panels. ${imagePrompt}. Use clear gutters, strong black ink lines, screentone shading, cinematic framing, expressive character poses, readable speech bubbles, captions, and dramatic sound effects. Render the entire six-panel page as one cohesive image. Do not include logos or watermarks.`,
          }],
        }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      signal: AbortSignal.timeout(imageRequestTimeoutMs),
    },
  )

  if (!response.ok) throw new Error(`Gemini image request failed (${response.status}): ${await response.text()}`)

  const data: unknown = await response.json()
  const parts = z.object({
    candidates: z.array(z.object({
      content: z.object({
        parts: z.array(z.object({
          inlineData: z.object({ mimeType: z.string(), data: z.string() }).optional(),
        })),
      }),
    })).min(1),
  }).parse(data).candidates[0].content.parts
  const image = parts.find((part) => part.inlineData)?.inlineData

  if (!image) throw new Error('Gemini image response did not contain image data')
  return `data:${image.mimeType};base64,${image.data}`
}

async function generateMangaImageOutput(manga: MangaResponse): Promise<MangaResponse> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required for image generation')
  return {
    ...manga,
    image_data_url: await generateMangaImage(manga.image_prompt, process.env.GEMINI_API_KEY),
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'manga-my-life-api' })
})

app.post('/api/generate', async (request, response) => {
  const result = generateRequest.safeParse(request.body)
  if (!result.success) {
    response.status(400).json({ error: 'story, genre, and an optional isVillainMode boolean are required', details: result.error.flatten() })
    return
  }

  try {
    const script = await generateMangaScript(result.data)
    const manga = await generateMangaImageOutput(script)
    response.json(manga)
  } catch (error) {
    console.error('Manga generation failed:', error)
    response.status(502).json({ error: error instanceof Error ? error.message : 'Manga generation failed' })
  }
})

app.listen(port, () => {
  console.log(`Manga My Life API listening on http://localhost:${port}`)
})
