import { useEffect, useMemo, useState } from 'react'
import './App.css'

type MangaResponse = {
  title: string
  genre: string
  image_data_url?: string
}

type JournalEntry = {
  id: string
  title: string
  story: string
  date: string
  mood: string
  genre: string
  isVillainMode: boolean
  manga?: MangaResponse
}

const STORAGE_KEY = 'manga-my-life-journal'
const moods = ['steady', 'bright', 'messy', 'tender', 'electric']
const genres = [
  { value: 'shonen', label: 'Shonen / momentum' },
  { value: 'comedy', label: 'Comedy / chaos' },
  { value: 'romance', label: 'Romance / soft focus' },
  { value: 'horror', label: 'Horror / uncanny' },
]

function makeEntry(): JournalEntry {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled day',
    story: '',
    date: new Date().toISOString(),
    mood: 'steady',
    genre: 'shonen',
    isVillainMode: false,
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function App() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as JournalEntry[]) : [makeEntry()]
    } catch {
      return [makeEntry()]
    }
  })
  const [activeId, setActiveId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState<'journal' | 'reader'>('journal')
  const [isLandingPage, setIsLandingPage] = useState(true)

  const activeEntry = entries.find((entry) => entry.id === activeId) ?? entries[0]

  useEffect(() => {
    if (!activeId && entries[0]) setActiveId(entries[0].id)
  }, [activeId, entries])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // A generated image can be larger than localStorage; the current session remains usable.
    }
  }, [entries])

  const mangaCount = useMemo(() => entries.filter((entry) => entry.manga).length, [entries])

  function updateActive(changes: Partial<JournalEntry>) {
    if (!activeEntry) return
    setEntries((current) => current.map((entry) => entry.id === activeEntry.id ? { ...entry, ...changes } : entry))
  }

  function createEntry() {
    const entry = makeEntry()
    setEntries((current) => [entry, ...current])
    setActiveId(entry.id)
    setIsLandingPage(false)
    setView('journal')
    setError('')
  }

  function removeActive() {
    if (!activeEntry || entries.length === 1) return
    const next = entries.filter((entry) => entry.id !== activeEntry.id)
    setEntries(next)
    setActiveId(next[0].id)
  }

  async function handleGenerate() {
    if (!activeEntry?.story.trim()) return
    setError('')
    setIsLoading(true)
    setLoadingStage('Reading your day...')
    const stageTimer = window.setInterval(() => {
      setLoadingStage((stage) => stage === 'Reading your day...' ? 'Drawing the turning point...' : 'Ink is still drying...')
    }, 3500)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: activeEntry.story,
          genre: activeEntry.genre,
          isVillainMode: activeEntry.isVillainMode,
        }),
      })
      const responseText = await response.text()
      let data: MangaResponse & { error?: string }
      try {
        data = JSON.parse(responseText) as MangaResponse & { error?: string }
      } catch {
        throw new Error(`The manga API returned an invalid response (HTTP ${response.status}).`)
      }
      if (!response.ok) throw new Error(data.error ?? `The manga API request failed (HTTP ${response.status}).`)
      updateActive({ manga: data })
      setIsLandingPage(false)
      setView('reader')
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Manga generation failed')
    } finally {
      window.clearInterval(stageTimer)
      setLoadingStage('')
      setIsLoading(false)
    }
  }

  if (!activeEntry) return null

  return (
    <main className="app-shell">
      <aside className="entry-rail">
        <div className="brand-mark">
          <span className="brand-symbol">M</span>
          <span>Manga<br />my life</span>
        </div>
        <div className="rail-label">YOUR ARCHIVE <span>{String(entries.length).padStart(2, '0')}</span></div>
        <div className="entry-list">
          {entries.map((entry, index) => (
            <button
              className={`entry-card ${entry.id === activeEntry.id ? 'selected' : ''}`}
              key={entry.id}
              onClick={() => { setActiveId(entry.id); setIsLandingPage(false); setView(entry.manga ? 'reader' : 'journal') }}
              type="button"
            >
              <span className="entry-index">{String(entries.length - index).padStart(2, '0')}</span>
              <span className="entry-card-copy">
                <strong>{entry.title || 'Untitled day'}</strong>
                <small>{formatDate(entry.date)}</small>
              </span>
              {entry.manga && <span className="entry-status">INKED</span>}
            </button>
          ))}
        </div>
        <button className="new-entry" onClick={createEntry} type="button"><span>+</span> New entry</button>
        <div className="rail-footer">
          <span className="live-dot" /> Stored locally in this browser
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span>ARCHIVE</span><b>/</b><span>{view === 'reader' ? 'MANGA READER' : 'NEW PAGE'}</span></div>
          <div className="topbar-actions">
            <span className="save-state"><span className="save-dot" /> Autosaved</span>
            <button className="icon-button" onClick={removeActive} disabled={entries.length === 1} aria-label="Delete entry" type="button">×</button>
          </div>
        </header>

        <div className="workspace-inner">
          {isLandingPage && view === 'journal' && (
            <div className="page-intro">
              <div>
                <span className="eyebrow">FIELD NOTES / {'{TODAY}'}</span>
                <h1>Make a page<br /><i>of today.</i></h1>
              </div>
              <div className="counter"><strong>{String(mangaCount).padStart(2, '0')}</strong><span>stories<br />inked</span></div>
            </div>
          )}

          {view === 'journal' ? (
            <section className="journal-editor">
              <div className="editor-meta">
                <span>{formatDate(activeEntry.date)}</span>
                <label>MOOD
                  <select value={activeEntry.mood} onChange={(event) => updateActive({ mood: event.target.value })}>
                    {moods.map((mood) => <option key={mood}>{mood}</option>)}
                  </select>
                </label>
              </div>
              <input
                className="title-input"
                aria-label="Entry title"
                value={activeEntry.title}
                onChange={(event) => updateActive({ title: event.target.value })}
                placeholder="Name this chapter"
              />
              <textarea
                className="story-input"
                aria-label="Journal entry"
                placeholder="What happened today? Start anywhere — a detail, a feeling, the thing you can't stop replaying..."
                value={activeEntry.story}
                onChange={(event) => updateActive({ story: event.target.value })}
              />
              <div className="editor-footer">
                <span className="character-count">{activeEntry.story.length} / 2,000</span>
                <span className="privacy-note">Private by default. Never leaves your browser except when you choose to ink it.</span>
              </div>
              <div className="ink-options">
                <div className="option-block">
                  <span className="option-label">VISUAL LANGUAGE</span>
                  <div className="genre-pills">
                    {genres.map((genre) => (
                      <button className={activeEntry.genre === genre.value ? 'active' : ''} key={genre.value} onClick={() => updateActive({ genre: genre.value })} type="button">{genre.label}</button>
                    ))}
                  </div>
                </div>
                <button className={`villain-toggle ${activeEntry.isVillainMode ? 'active' : ''}`} onClick={() => updateActive({ isVillainMode: !activeEntry.isVillainMode })} type="button">
                  <span className="toggle-orb" />
                  <span><b>{activeEntry.isVillainMode ? 'Villain lens on' : 'Add a twist'}</b><small>{activeEntry.isVillainMode ? 'See the day from the other side' : 'Let the antagonist narrate'}</small></span>
                </button>
              </div>
              <div className="generate-row">
                <div className="generate-hint"><span className="spark">✦</span> Six panels, one honest little universe.</div>
                <button className="ink-button" disabled={!activeEntry.story.trim() || isLoading} onClick={handleGenerate} type="button">
                  <span>{isLoading ? loadingStage : activeEntry.manga ? 'Re-ink this entry' : 'Turn into manga'}</span><b>↗</b>
                </button>
              </div>
              {error && <p className="error" role="alert">{error}</p>}
            </section>
          ) : (
            <section className="reader">
              <div className="reader-heading">
                <div><span className="eyebrow">{activeEntry.manga?.genre ?? activeEntry.genre} / COMPLETE STORY</span><h2>{activeEntry.manga?.title ?? activeEntry.title}</h2></div>
                <button className="back-button" onClick={() => setView('journal')} type="button">← Edit entry</button>
              </div>
              <div className="reader-grid">
                <div className="reader-main">
                  <article className="manga-frame">
                    {activeEntry.manga?.image_data_url ? <img src={activeEntry.manga.image_data_url} alt={`${activeEntry.manga.title}, six-panel manga page`} /> : <div className="missing-image">MANGA IMAGE UNAVAILABLE</div>}
                  </article>
                  <div className="reader-summary">
                    <span className="eyebrow">THE ORIGINAL NOTE</span>
                    <p>“{activeEntry.story}”</p>
                    <div className="reader-note-meta"><span>{formatDate(activeEntry.date)}</span><span>{activeEntry.mood}</span></div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
