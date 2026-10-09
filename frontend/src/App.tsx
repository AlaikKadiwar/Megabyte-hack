import { useState } from 'react'
import './App.css'

type MangaResponse = {
  title: string
  genre: string
  image_data_url?: string
}

function App() {
  const [story, setStory] = useState('')
  const [genre, setGenre] = useState('shonen')
  const [isVillainMode, setIsVillainMode] = useState(false)
  const [manga, setManga] = useState<MangaResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')

  async function handleGenerate() {
    setError('')
    setIsLoading(true)
    setLoadingStage('Checking your story...')

    const stageTimer = window.setInterval(() => {
      setLoadingStage((currentStage) => {
        if (currentStage === 'Checking your story...') return 'Writing six page prompts...'
        if (currentStage === 'Writing six page prompts...') return 'Generating six manga pages...'
        return 'Generating six manga pages...'
      })
    }, 4000)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, genre, isVillainMode }),
      })
      const responseText = await response.text()
      let data: MangaResponse & { error?: string }

      try {
        data = JSON.parse(responseText) as MangaResponse & { error?: string }
      } catch {
        throw new Error(`The API returned an invalid response (HTTP ${response.status}).`)
      }

      if (!response.ok) {
        throw new Error(data.error ?? `The API request failed (HTTP ${response.status}).`)
      }

      setManga(data)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Generation failed')
    } finally {
      window.clearInterval(stageTimer)
      setLoadingStage('')
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="app-content">
        <header className="masthead">
          <p>MANGA MY LIFE / AI STORY STUDIO</p>
          <h1>One day.<br /><em>Six pages.</em></h1>
          <span>YOUR LIFE, INKED.</span>
        </header>

        <div className="story-form">
          <div className="form-kicker">
            <span className="status-dot" />
            <span>AI STORY PROMPT</span>
            <span className="form-hint">Groq scriptwriter → Gemini manga pages</span>
          </div>
          <textarea
            aria-label="Your daily activity or life story"
            placeholder="Type your daily activity here. Example: I missed the last bus to Calgary and ran through the snow..."
            value={story}
            onChange={(event) => setStory(event.target.value)}
          />
          <div className="form-controls">
            <select value={genre} onChange={(event) => setGenre(event.target.value)}>
              <option value="shonen">Shonen</option>
              <option value="comedy">Comedy</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
            </select>
            <button className={isVillainMode ? 'mode active' : 'mode'} onClick={() => setIsVillainMode((value) => !value)} type="button">
              {isVillainMode ? 'VILLAIN POV' : 'HERO POV'}
            </button>
            <button className="generate" disabled={!story.trim() || isLoading} onClick={handleGenerate} type="button">
              {isLoading ? 'AI IS WORKING...' : 'SEND STORY TO AI'}
            </button>
          </div>
          <p className="form-note">Your story becomes one complete manga page with six panels in a single AI-generated image.</p>
          {isLoading && <p className="loading-stage" role="status">{loadingStage}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        {manga && (
          <section className="manga-book" aria-label={`${manga.title} manga`}>
            <div className="book-title">
              <span>{manga.genre} / COMPLETE STORY</span>
              <h2>{manga.title}</h2>
              <span>VOL. 001</span>
            </div>
            <div className="page-grid">
              <article className="manga-page">
                {manga.image_data_url ? (
                  <img src={manga.image_data_url} alt={`${manga.title}, six-panel manga page`} />
                ) : (
                  <div className="missing-image">MANGA IMAGE UNAVAILABLE</div>
                )}
              </article>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default App
