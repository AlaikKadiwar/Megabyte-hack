import './App.css'

function App() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-12">
      <section className="mx-auto max-w-5xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-red-700">
          Manga My Life
        </p>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">
          Turn everyday moments into a dramatic manga.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-700">
          The React and Tailwind foundation is ready. The next step is connecting
          the story form to the protected generation endpoint.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {['Story input', 'Genre selector', '3-panel reveal'].map((item) => (
            <div key={item} className="border-4 border-stone-900 bg-white p-5 shadow-[6px_6px_0_#201b1b]">
              <span className="font-bold">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
