import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'manga-my-life-api' })
})

const generateRequest = z.object({
  story: z.string().trim().min(1).max(2000),
  genre: z.string().trim().min(1).max(40),
})

app.post('/api/generate', (request, response) => {
  const result = generateRequest.safeParse(request.body)

  if (!result.success) {
    response.status(400).json({ error: 'story and genre are required' })
    return
  }

  response.json({
    title: 'Your Manga Origin Story',
    genre: result.data.genre,
    panels: [],
    status: 'mock-ready',
  })
})

app.listen(port, () => {
  console.log(`Manga My Life API listening on http://localhost:${port}`)
})
