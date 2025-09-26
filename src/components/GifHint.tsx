import type { Gif } from '../services/giphy'

export type GifHintProps = {
  gif: Gif | null
  word: string
  isLoading?: boolean
}

export function GifHint({ gif, word, isLoading = false }: GifHintProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando ayuda visual...</span>
      </div>
    )
  }

  if (!gif) {
    return null
  }

  return (
    <div className="mb-4 text-center">
      <div className="inline-block relative">
        <img
          src={gif.url}
          alt={`GIF relacionado con ${word}`}
          title={gif.title}
          className="max-w-md max-h-48 rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-400 transition-colors duration-200"
          style={{
            maxWidth: Math.min(gif.width, 400),
            maxHeight: Math.min(gif.height, 300)
          }}
        />
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
          💡 Ayuda visual
        </div>
      </div>
    </div>
  )
}
