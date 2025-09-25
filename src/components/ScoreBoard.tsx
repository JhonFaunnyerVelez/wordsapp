export type ScoreBoardProps = {
  correctCount: number
  wrongCount: number
  total: number
  currentIndex: number
}

export function ScoreBoard({ correctCount, wrongCount, total, currentIndex }: ScoreBoardProps) {
  const answeredCount = correctCount + wrongCount
  const accuracy = total > 0 ? Math.round((correctCount / Math.max(answeredCount, 1)) * 100) : 0
  const progress = total > 0 ? Math.round(((currentIndex) / total) * 100) : 0

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm sm:text-base">
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-green-700 ring-1 ring-green-200">
            Aciertos: <strong>{correctCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-rose-700 ring-1 ring-rose-200">
            Errores: <strong>{wrongCount}</strong>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-indigo-200">
          Acierto: <strong>{accuracy}%</strong>
        </span>
      </div>

      <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">
        {currentIndex} / {total}
      </div>
    </div>
  )
}

export default ScoreBoard
