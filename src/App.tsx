import { useEffect, useState } from 'react'
import ScoreBoard from './components/ScoreBoard'
import WordCard from './components/WordCard'
import GameOver from './components/GameOver'
import Milestones from './components/Milestones'
import WrongAnswers from './components/WrongAnswers'
import MultipleChoice from './components/MultipleChoice'
import { GifHint } from './components/GifHint'
import { getGifsByQuery } from './services/giphy'
import type { Gif } from './services/giphy'
import { generatePDF } from './services/pdfGenerator'
import wordsData from './words/words_fixed.json'
import './App.css'

// Types for JSON items
export type WordItem = {
  number: number
  english: string
  spanish: string
}

export type GameMode = 'es-en' | 'en-es'

// Sistema de metas y niveles
export const MILESTONES = [
  { min: 0, max: 50, percentage: 5, message: '🚀 ¡Apenas empiezas, gran trabajo! Lo importante es la constancia.', level: '🌱 Seed', levelMessage: 'Estás sembrando la base.' },
  { min: 51, max: 100, percentage: 10, message: '📚 Ya dominas las primeras 100 palabras. ¡Excelente base!', level: '🌿 Grow', levelMessage: 'Tu inglés está creciendo con fuerza.' },
  { min: 101, max: 250, percentage: 25, message: '🔥 Vas tomando ritmo, ya puedes comunicar ideas básicas.', level: '🌿 Grow', levelMessage: 'Tu inglés está creciendo con fuerza.' },
  { min: 251, max: 500, percentage: 50, message: '🌎 Mitad del camino: ya entiendes muchas conversaciones sencillas.', level: '🌳 Tree', levelMessage: 'Ya tienes un árbol sólido de vocabulario.' },
  { min: 501, max: 750, percentage: 75, message: '⚡ Tu vocabulario es fuerte, puedes leer textos con buena comprensión.', level: '🌳 Tree', levelMessage: 'Ya tienes un árbol sólido de vocabulario.' },
  { min: 751, max: 900, percentage: 90, message: '🏆 Estás en nivel avanzado, casi un experto en inglés cotidiano.', level: '🌄 Summit', levelMessage: 'Escalando hacia la cima.' },
  { min: 901, max: 999, percentage: 99, message: '👑 ¡Impresionante! Te falta muy poco para dominar el reto.', level: '🌄 Summit', levelMessage: 'Escalando hacia la cima.' },
  { min: 1000, max: 1000, percentage: 100, message: '🎉 ¡Felicidades! Has completado las 1000 palabras. ¡Nivel legendario!', level: '🌟 Master', levelMessage: 'Has alcanzado el dominio.' }
]

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


// Generate multiple choice options (1 correct + 2 incorrect)
function generateMultipleChoiceOptions(correctAnswer: string, allWords: WordItem[], mode: GameMode): string[] {
  const correct = normalize(correctAnswer)
  const options: string[] = [correct]
  
  // Get all possible wrong answers
  const wrongOptions = allWords
    .map(word => mode === 'es-en' ? normalize(word.english) : normalize(word.spanish))
    .filter(word => word !== correct)
    .filter(word => word.length > 0)
  
  // Shuffle and take 2 random wrong options
  const shuffled = shuffle(wrongOptions)
  options.push(...shuffled.slice(0, 2))
  
  // Shuffle all options (correct + 2 wrong)
  const finalOptions = shuffle(options)
  
  
  return finalOptions
}

// Function to load GIF for current word
async function loadGifForWord(word: string): Promise<Gif | null> {
  try {
    const gifs = await getGifsByQuery(word)
    if (gifs.length > 0) {
      // Return a random GIF from the results
      const randomIndex = Math.floor(Math.random() * gifs.length)
      return gifs[randomIndex]
    }
    return null
  } catch (error) {
    console.error('Error loading GIF:', error)
    return null
  }
}

// Function to load initial state from localStorage with independent progress per mode
function loadInitialState() {
  const savedProgress = localStorage.getItem('appWords_progress')
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress)
      
      // Get progress for both modes
      const esEnProgress = progress['es-en'] || {}
      const enEsProgress = progress['en-es'] || {}
      
      // Determine which mode was last played
      const lastMode = progress.lastMode || null
      const currentModeProgress = lastMode === 'es-en' ? esEnProgress : enEsProgress
      
      return {
        // Current game state (from the last played mode)
        learnedWords: currentModeProgress.learnedWords || 0,
        savedMode: lastMode,
        mode: lastMode,
        ordered: currentModeProgress.ordered || [],
        index: currentModeProgress.index || 0,
        correct: currentModeProgress.correct || 0,
        wrong: currentModeProgress.wrong || 0,
        skipped: currentModeProgress.skipped || 0,
        wrongAnswers: currentModeProgress.wrongAnswers || [],
        
        // Store both modes' progress for milestones display
        allProgress: {
          'es-en': esEnProgress,
          'en-es': enEsProgress
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }
  
  // Default values if no saved progress
  return {
    learnedWords: 0,
    savedMode: null,
    mode: null,
    ordered: [],
    index: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    wrongAnswers: [],
    allProgress: {
      'es-en': {},
      'en-es': {}
    }
  }
}

function App() {
  // Load initial state from localStorage
  const initialState = loadInitialState()
  
  const [mode, setMode] = useState<GameMode | null>(initialState.mode)
  const [ordered, setOrdered] = useState<WordItem[]>(initialState.ordered)
  const [index, setIndex] = useState(initialState.index)
  const [correct, setCorrect] = useState(initialState.correct)
  const [wrong, setWrong] = useState(initialState.wrong)
  const [skipped, setSkipped] = useState(initialState.skipped)
  const [lastFeedback, setLastFeedback] = useState<null | { wasCorrect: boolean; correctAnswer: string }>(null)
  const [learnedWords, setLearnedWords] = useState(initialState.learnedWords)
  const [savedMode, setSavedMode] = useState<GameMode | null>(initialState.savedMode)
  const [wrongAnswers, setWrongAnswers] = useState<Array<{word: string, translation: string, userAnswer: string}>>(initialState.wrongAnswers)
  const [isMultipleChoice, setIsMultipleChoice] = useState(false) // Alternar entre escritura y selección múltiple
  const [showGif, setShowGif] = useState(false) // Mostrar GIF aleatoriamente
  const [currentGif, setCurrentGif] = useState<Gif | null>(null)
  const [isLoadingGif, setIsLoadingGif] = useState(false)
  const [allProgress, setAllProgress] = useState<{[key in GameMode]: any}>(initialState.allProgress)

  // Save complete progress to localStorage whenever game state changes (separate per mode)
  useEffect(() => {
    if (mode && ordered.length > 0) {
      // Update progress for current mode
      const newAllProgress = {
        ...allProgress,
        [mode]: {
          learnedWords,
          ordered,
          index,
          correct,
          wrong,
          skipped,
          wrongAnswers,
          lastUpdated: new Date().toISOString()
        }
      }
      
      // Save to localStorage with mode separation
      localStorage.setItem('appWords_progress', JSON.stringify({
        ...newAllProgress,
        lastMode: mode // Track which mode was last played
      }))
      
      setAllProgress(newAllProgress)
    }
  }, [learnedWords, mode, ordered, index, correct, wrong, skipped, wrongAnswers, allProgress])

  const total = ordered.length
  const current = ordered[index]
  
  // State for multiple choice options
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([])

  // Initialize game only if no saved progress exists
  useEffect(() => {
    if (ordered.length === 0 && !mode) {
      // wordsData is an array of { number, english, spanish }
      setOrdered(shuffle(wordsData as WordItem[]))
    }
  }, [])

  // Generate options, set mode, and load GIF when word changes
  useEffect(() => {
    if (current && mode) {
      // 33% chance for multiple choice, 33% for writing, 33% for writing with GIF
      const random = Math.random()
      const isMultiple = random < 0.33
      const showGifHint = random >= 0.33 && random < 0.66
      
      setIsMultipleChoice(isMultiple)
      setShowGif(showGifHint)
      
      // Only generate options if it's multiple choice
      if (isMultiple) {
        const options = generateMultipleChoiceOptions(
          mode === 'es-en' ? current.english : current.spanish,
          wordsData,
          mode
        )
        setMultipleChoiceOptions(options)
        setCurrentGif(null) // Clear GIF for multiple choice
      } else {
        setMultipleChoiceOptions([])
        
        // Load GIF if it should be shown
        if (showGifHint) {
          setIsLoadingGif(true)
          const wordToSearch = mode === 'es-en' ? current.spanish : current.english
          loadGifForWord(wordToSearch).then(gif => {
            setCurrentGif(gif)
            setIsLoadingGif(false)
          })
        } else {
          setCurrentGif(null)
          setIsLoadingGif(false)
        }
      }
    }
  }, [current, mode])


  function backToModeSelection() {
    setMode(null)
    setSavedMode(null)
    setIndex(0)
    setCorrect(0)
    setWrong(0)
    setSkipped(0)
    setLastFeedback(null)
    // Note: learnedWords and wrongAnswers persist - only current game stats reset
  }


  function resetCurrentModeProgress() {
    if (!mode) return
    
    if (confirm(`¿Estás seguro de que quieres reiniciar el progreso de ${mode === 'es-en' ? 'Español' : 'Inglés'}? Esta acción no se puede deshacer.`)) {
      // Reset current mode progress
      const newAllProgress = {
        ...allProgress,
        [mode]: {
          learnedWords: 0,
          ordered: [],
          index: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          wrongAnswers: [],
          lastUpdated: new Date().toISOString()
        }
      }
      
      // Save updated progress
      localStorage.setItem('appWords_progress', JSON.stringify({
        ...newAllProgress,
        lastMode: mode
      }))
      
      setAllProgress(newAllProgress)
      
      // Reset current game state if we're in the mode being reset
      if (savedMode === mode) {
        setLearnedWords(0)
        setOrdered([])
        setIndex(0)
        setCorrect(0)
        setWrong(0)
        setSkipped(0)
        setLastFeedback(null)
        setWrongAnswers([])
      }
    }
  }

  function continueGame() {
    // Game state is already loaded from localStorage, just clear feedback
    setLastFeedback(null)
  }

  function startMode(selectedMode: GameMode) {
    // Load progress for the selected mode
    const modeProgress = allProgress[selectedMode] || {}
    
    // Set mode and load its progress
    setMode(selectedMode)
    setSavedMode(selectedMode)
    setLearnedWords(modeProgress.learnedWords || 0)
    setOrdered(modeProgress.ordered || [])
    setIndex(modeProgress.index || 0)
    setCorrect(modeProgress.correct || 0)
    setWrong(modeProgress.wrong || 0)
    setSkipped(modeProgress.skipped || 0)
    setWrongAnswers(modeProgress.wrongAnswers || [])
    setLastFeedback(null)
    
    // If no progress exists, shuffle new words
    if (!modeProgress.ordered || modeProgress.ordered.length === 0) {
      setOrdered(shuffle(wordsData as WordItem[]))
      setIndex(0)
      setCorrect(0)
      setWrong(0)
      setSkipped(0)
      setWrongAnswers([])
    }
  }

  function clearWrongAnswers() {
    if (confirm('¿Estás seguro de que quieres limpiar todas las palabras para estudiar?')) {
      setWrongAnswers([])
    }
  }

  function downloadWrongAnswersPDF() {
    if (wrongAnswers.length === 0) {
      alert('No hay palabras para estudiar. Juega primero para generar palabras incorrectas.')
      return
    }
    generatePDF(wrongAnswers, mode)
  }

  // Check if there's a game in progress (only when mode is null)
  const hasGameInProgress = !mode && savedMode && ordered.length > 0 && index < total

  function submitAnswer(answer: string) {
    if (!current || !mode) return
    
    const expect = mode === 'es-en' ? current.english : current.spanish
    const word = mode === 'es-en' ? current.spanish : current.english

    // Compare normalized versions
    const normalizedAnswer = normalize(answer)
    const normalizedExpect = normalize(expect)
    const ok = normalizedAnswer === normalizedExpect
    
    
    // Update counters
    if (ok) {
      setCorrect((v: number) => v + 1)
    } else {
      setWrong((v: number) => v + 1)
      
      // Guardar respuesta incorrecta para estudio
      setWrongAnswers(prev => [...prev, {
        word: word,
        translation: expect,
        userAnswer: answer
      }])
    }
    
    // Show feedback briefly then move to next word
    setLastFeedback({ wasCorrect: ok, correctAnswer: expect })
    
    // Move to next word after a short delay
    setTimeout(() => {
      setIndex((v: number) => v + 1)
      setLastFeedback(null)
    }, 800)
  }

  function skipWord() {
    if (!current || !mode) return
    const expect = mode === 'es-en' ? current.english : current.spanish
    
    setSkipped((v: number) => v + 1)
    setLastFeedback({ wasCorrect: false, correctAnswer: expect })
    setIndex((v: number) => v + 1)
  }

  const finished = index >= total && total > 0

  // Calculate total learned words (historical + current game)
  const totalLearnedWords = learnedWords + correct

  // Save learned words when game finishes
  useEffect(() => {
    if (finished && correct > 0) {
      setLearnedWords((prev: number) => prev + correct)
    }
  }, [finished, correct])

  return (
    <div className="min-h-screen w-full py-10 px-4 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">AppWords</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Práctica de 1000 palabras — Español ↔ Inglés</p>
        </div>

        <div className="mb-6">
          <Milestones 
            learnedWords={totalLearnedWords} 
            onResetCurrentMode={resetCurrentModeProgress}
            currentMode={mode}
          />
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 shadow-xl ring-1 ring-black/5 backdrop-blur p-6 sm:p-8">
          {!mode && (
            <div className="space-y-6">
              {hasGameInProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <p className="text-blue-800 font-medium mb-2">🎮 ¡Tienes un juego en progreso!</p>
                    <p className="text-blue-600 text-sm mb-3">
                      Palabra {index + 1} de {total} - {savedMode === 'es-en' ? 'Español → Inglés' : 'Inglés → Español'}
                    </p>
                    <button
                      onClick={continueGame}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      ▶️ Continuar Juego
                    </button>
                  </div>
                </div>
              )}
              <p className="text-center text-gray-600 dark:text-gray-300">Selecciona un modo de juego</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => startMode('es-en')}
                  className="rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-3 font-medium transition shadow-sm"
                >
                  Español → Inglés
                </button>
                <button
                  onClick={() => startMode('en-es')}
                  className="rounded-xl bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white px-4 py-3 font-medium transition shadow-sm"
                >
                  Inglés → Español
                </button>
              </div>
            </div>
          )}

          {mode && !finished && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={backToModeSelection}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition"
                >
                  ← Cambiar modo
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={skipWord}
                    disabled={skipped >= 20}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-100 disabled:text-gray-400 px-3 py-2 text-sm font-medium text-yellow-700 transition"
                  >
                    ⏭️ Saltar ({20 - skipped})
                  </button>
                </div>
              </div>

              <ScoreBoard
                correctCount={correct}
                wrongCount={wrong}
                skippedCount={skipped}
                total={total}
                currentIndex={Math.min(index, total)}
              />

              {current && (
                <>
                  {/* Show GIF hint if available */}
                  {showGif && !isMultipleChoice && (
                    <GifHint 
                      gif={currentGif} 
                      word={mode === 'es-en' ? cleanWord(current.spanish) : cleanWord(current.english)}
                      isLoading={isLoadingGif}
                    />
                  )}
                  
                  {isMultipleChoice ? (
                    <MultipleChoice
                      promptLabel={mode === 'es-en' ? 'Traduce al inglés' : 'Traduce al español'}
                      prompt={mode === 'es-en' ? cleanWord(current.spanish) : cleanWord(current.english)}
                      options={multipleChoiceOptions}
                      onSubmit={submitAnswer}
                    />
                  ) : (
                    <WordCard
                      promptLabel={mode === 'es-en' ? 'Traduce al inglés' : 'Traduce al español'}
                      prompt={mode === 'es-en' ? cleanWord(current.spanish) : cleanWord(current.english)}
                      placeholder={mode === 'es-en' ? 'Respuesta en inglés' : 'Respuesta en español'}
                      submitLabel="Enviar"
                      onSubmit={submitAnswer}
                    />
                  )}
                </>
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
            <GameOver 
              correct={correct} 
              wrong={wrong} 
              skipped={skipped}
              total={total} 
              onChangeMode={backToModeSelection}
            />
          )}
        </div>

        {/* Sección de palabras para estudiar - fuera del juego principal */}
        {mode && wrongAnswers.length > 0 && (
          <div className="mt-6">
            <WrongAnswers 
              wrongAnswers={wrongAnswers} 
              onClearAnswers={clearWrongAnswers}
              onDownloadPDF={downloadWrongAnswersPDF}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
