import { useEffect, useState } from 'react'
import ScoreBoard from './components/ScoreBoard'
import WordCard from './components/WordCard'
import GameOver from './components/GameOver'
import wordsData from './words/words_fixed.json'
import './App.css'

// Types for JSON items
export type WordItem = {
  number: number
  english: string
  spanish: string
}

export type GameMode = 'es-en' | 'en-es'

function shuffle<T>(array: T[]): T[] {
  const arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function cleanWord(word: string): string {
  return word
    .replace(/\s*\/\s*.*$/g, '') // Remove everything after /
    .replace(/\s*,\s*.*$/g, '') // Remove everything after ,
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed content
    .replace(/[.,;!?:]/g, '') // Remove punctuation
    .trim()
}

function normalize(text: string): string {
  return cleanWord(text)
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '') // Remove all accents/tildes
    .trim()
    .toLowerCase()
}

// Function to check if two words match (ignoring accents and case)
function wordsMatch(userAnswer: string, correctAnswer: string): boolean {
  // Normalize both answers (remove accents, trim, lowercase)
  const normalizedUser = normalize(userAnswer)
  const normalizedCorrect = normalize(correctAnswer)
  
  // Direct match after normalization
  return normalizedUser === normalizedCorrect
}

function App() {
  const [mode, setMode] = useState<GameMode | null>(null)
  const [ordered, setOrdered] = useState<WordItem[]>([])
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [lastFeedback, setLastFeedback] = useState<null | { wasCorrect: boolean; correctAnswer: string }>(null)

  const total = ordered.length
  const current = ordered[index]

  useEffect(() => {
    // wordsData is an array of { number, english, spanish }
    setOrdered(shuffle(wordsData as WordItem[]))
    setIndex(0)
    setCorrect(0)
    setWrong(0)
    setLastFeedback(null)
  }, [])

  function restart() {
    setOrdered(shuffle(ordered))
    setIndex(0)
    setCorrect(0)
    setWrong(0)
    setLastFeedback(null)
  }

  function submitAnswer(answer: string) {
    if (!current || !mode) return
    const expect = mode === 'es-en' ? current.english : current.spanish

    const ok = wordsMatch(answer, expect)
    if (ok) {
      setCorrect((v) => v + 1)
      setLastFeedback({ wasCorrect: true, correctAnswer: expect })
    } else {
      setWrong((v) => v + 1)
      setLastFeedback({ wasCorrect: false, correctAnswer: expect })
    }
    setIndex((v) => v + 1)
  }

  const finished = index >= total && total > 0

  return (
    <div className="min-h-screen w-full py-10 px-4 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">AppWords</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Práctica de 1000 palabras — Español ↔ Inglés</p>
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 shadow-xl ring-1 ring-black/5 backdrop-blur p-6 sm:p-8">
          {!mode && (
            <div className="space-y-6">
              <p className="text-center text-gray-600 dark:text-gray-300">Selecciona un modo de juego</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('es-en')}
                  className="rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-3 font-medium transition shadow-sm"
                >
                  Español → Inglés
                </button>
                <button
                  onClick={() => setMode('en-es')}
                  className="rounded-xl bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white px-4 py-3 font-medium transition shadow-sm"
                >
                  Inglés → Español
                </button>
              </div>
            </div>
          )}

          {mode && !finished && (
            <div className="space-y-6">
              <ScoreBoard
                correctCount={correct}
                wrongCount={wrong}
                total={total}
                currentIndex={Math.min(index, total)}
              />

              {current && (
                <WordCard
                  promptLabel={mode === 'es-en' ? 'Traduce al inglés' : 'Traduce al español'}
                  prompt={mode === 'es-en' ? cleanWord(current.spanish) : cleanWord(current.english)}
                  placeholder={mode === 'es-en' ? 'Respuesta en inglés' : 'Respuesta en español'}
                  submitLabel="Enviar"
                  onSubmit={submitAnswer}
                />
              )}

              {lastFeedback && (
                <div className="text-sm">
                  {lastFeedback.wasCorrect ? (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-green-700 ring-1 ring-green-200">
                      ¡Correcto!
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-200">
                      Incorrecto. Respuesta: <strong>{cleanWord(lastFeedback.correctAnswer)}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode && finished && (
            <GameOver correct={correct} wrong={wrong} total={total} onRestart={restart} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
