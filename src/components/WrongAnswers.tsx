export type WrongAnswer = {
  word: string
  translation: string
  userAnswer: string
}

export type WrongAnswersProps = {
  wrongAnswers: WrongAnswer[]
  onClearAnswers?: () => void
  onDownloadPDF?: () => void
}

export function WrongAnswers({ wrongAnswers, onClearAnswers, onDownloadPDF }: WrongAnswersProps) {
  if (wrongAnswers.length === 0) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-lg">📚</span>
          <h3 className="text-lg font-semibold text-red-800">
            Palabras para estudiar ({wrongAnswers.length})
          </h3>
        </div>
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 border border-blue-200 hover:border-blue-300"
          >
            📄 Descargar PDF
          </button>
        )}
      </div>
      
      <p className="text-sm text-red-600 mb-4">
        Estas son las palabras que respondiste incorrectamente. ¡Estúdialas para mejorar!
      </p>

      <div className="space-y-3">
        {wrongAnswers.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white border border-red-100 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                {item.word}
              </div>
              <div className="text-sm text-gray-600">
                Traducción correcta: <span className="font-medium text-green-600">{item.translation}</span>
              </div>
              {item.userAnswer && (
                <div className="text-sm text-gray-500">
                  Tu respuesta: <span className="font-medium text-red-500 line-through">{item.userAnswer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-red-500 mb-3">
          💡 Tip: Repasa estas palabras y vuelve a intentar para mejorar tu precisión
        </p>
        {onClearAnswers && (
          <button
            onClick={onClearAnswers}
            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 border border-red-200 hover:border-red-300"
          >
            🗑️ Limpiar lista
          </button>
        )}
      </div>
    </div>
  )
}

export default WrongAnswers
