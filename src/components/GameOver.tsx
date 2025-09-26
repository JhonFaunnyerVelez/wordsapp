
export type GameOverProps = {
  correct: number
  wrong: number
  skipped: number
  total: number
  onChangeMode?: () => void
}

export function GameOver({ correct, wrong, skipped, total, onChangeMode }: GameOverProps) {
  const answered = correct + wrong + skipped
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0

  let message = '¡Excelente trabajo!'
  if (accuracy < 70) {
    message = 'No te rindas, puedes mejorar.'
  } else if (accuracy < 90) {
    message = 'Muy bien, sigue practicando.'
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">¡Completado!</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Has practicado las {total} palabras.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm sm:text-base">
        <div className="rounded-xl bg-green-50 p-3 text-green-700 ring-1 ring-green-200">
          <div className="font-semibold text-lg">{correct}</div>
          <div>Aciertos</div>
        </div>
        <div className="rounded-xl bg-rose-50 p-3 text-rose-700 ring-1 ring-rose-200">
          <div className="font-semibold text-lg">{wrong}</div>
          <div>Errores</div>
        </div>
        <div className="rounded-xl bg-yellow-50 p-3 text-yellow-700 ring-1 ring-yellow-200">
          <div className="font-semibold text-lg">{skipped}</div>
          <div>Saltos</div>
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700 ring-1 ring-indigo-200">
          <div className="font-semibold text-lg">{accuracy}%</div>
          <div>Precisión</div>
        </div>
      </div>

      <p className="text-lg font-medium">{message}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onChangeMode && (
          <button
            onClick={onChangeMode}
            className="inline-flex items-center justify-center rounded-xl bg-gray-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            ← Cambiar modo
          </button>
        )}
      </div>
    </div>
  )
}

export default GameOver
