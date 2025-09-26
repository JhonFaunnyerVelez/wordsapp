import { useEffect, useRef, useState } from 'react'

export type WordCardProps = {
  promptLabel: string
  prompt: string
  placeholder?: string
  onSubmit: (answer: string) => void
  submitLabel?: string
}

export function WordCard({ promptLabel, prompt, placeholder, onSubmit, submitLabel = 'Responder' }: WordCardProps) {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 10)
    setValue('')
    inputRef.current?.focus()
    return () => clearTimeout(t)
  }, [prompt])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-sm text-gray-500 mb-2">{promptLabel}</div>
      <div className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">{prompt}</div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300 dark:border-slate-600 dark:bg-slate-900/60 dark:focus:border-indigo-500 dark:focus:ring-indigo-600/40"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  )
}

export default WordCard
