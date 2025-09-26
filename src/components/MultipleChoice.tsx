export type MultipleChoiceProps = {
  promptLabel: string
  prompt: string
  options: string[]
  onSubmit: (answer: string) => void
}

export function MultipleChoice({ promptLabel, prompt, options, onSubmit }: MultipleChoiceProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {promptLabel}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {prompt}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Selecciona la respuesta correcta:
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSubmit(option)}
              className="w-full p-4 text-left rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MultipleChoice
