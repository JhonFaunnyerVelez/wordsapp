import { useState } from 'react'
import { MILESTONES } from '../App'

export type MilestonesProps = {
  learnedWords: number
  onResetCurrentMode?: () => void
  currentMode?: 'es-en' | 'en-es' | null
}

export function Milestones({ learnedWords, onResetCurrentMode, currentMode }: MilestonesProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const currentMilestone = MILESTONES.find(milestone => 
    learnedWords >= milestone.min && learnedWords <= milestone.max
  ) || MILESTONES[0]

  const nextMilestone = MILESTONES.find(milestone => learnedWords < milestone.min) || MILESTONES[MILESTONES.length - 1]

  const toggleTooltip = (tooltipId: string) => {
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId)
  }

  const closeTooltip = () => {
    setActiveTooltip(null)
  }

  return (
    <div className="w-full space-y-4" onClick={closeTooltip}>
      {/* Mensaje motivador actual */}
      <div 
        className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 relative cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation()
          toggleTooltip('progress')
        }}
      >
        <div className="text-lg font-semibold text-indigo-800 mb-2">
          {currentMilestone.level} {currentMilestone.levelMessage}
        </div>
        <div className="text-sm text-indigo-600">
          {currentMilestone.message}
        </div>
        <div className="text-xs text-indigo-500 mt-2">
          Palabras aprendidas: {learnedWords} / 1000
        </div>
        
        {/* Tooltip informativo */}
        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg transition-opacity duration-200 z-10 max-w-md ${
          activeTooltip === 'progress' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="font-semibold text-yellow-300 mb-2">
            📊 Tu progreso actual
          </div>
          <div className="text-gray-200 mb-2">
            Estás en el nivel <span className="font-semibold">{currentMilestone.level}</span>
          </div>
          <div className="text-gray-300 text-xs mb-2">
            Rango: {currentMilestone.min}-{currentMilestone.max} palabras ({currentMilestone.percentage}% del total)
          </div>
          <div className="text-gray-400 text-xs">
            {learnedWords < 1000 
              ? `Te faltan ${1000 - learnedWords} palabras para completar el reto`
              : '¡Has completado todas las 1000 palabras!'
            }
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Progreso visual */}
      <div className="space-y-2">
        <div className="text-center text-sm font-medium text-gray-700">
          Progreso: {Math.round((learnedWords / 1000) * 100)}%
        </div>
        <div 
          className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer select-none" 
          onClick={(e) => {
            e.stopPropagation()
            toggleTooltip('bar')
          }}
          title={`Has aprendido ${learnedWords} de 1000 palabras (${Math.round((learnedWords / 1000) * 100)}%)`}
        >
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min((learnedWords / 1000) * 100, 100)}%` }}
          />
          
          {/* Tooltip de la barra */}
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg transition-opacity duration-200 z-10 whitespace-nowrap ${
            activeTooltip === 'bar' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="font-semibold text-green-300">
              📈 Progreso: {Math.round((learnedWords / 1000) * 100)}%
            </div>
            <div className="text-gray-200">
              {learnedWords} de 1000 palabras aprendidas
            </div>
            <div className="text-gray-400 text-xs">
              {learnedWords < 1000 ? `${1000 - learnedWords} palabras restantes` : '¡Completado!'}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Metas visuales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {MILESTONES.map((milestone, index) => {
          const isUnlocked = learnedWords >= milestone.min
          const isCurrent = learnedWords >= milestone.min && learnedWords <= milestone.max
          
          return (
            <div
              key={index}
              className={`p-2 rounded-lg text-center text-xs transition-all duration-300 relative cursor-pointer select-none ${
                isCurrent 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg scale-105' 
                  : isUnlocked 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                toggleTooltip(`milestone-${index}`)
              }}
              title={`${milestone.message}\n\n${milestone.level}: ${milestone.levelMessage}`}
            >
              <div className="font-bold">{milestone.min}</div>
              <div className="text-xs opacity-80">{milestone.percentage}%</div>
              
              {/* Tooltip */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg transition-opacity duration-200 whitespace-nowrap z-10 max-w-xs ${
                activeTooltip === `milestone-${index}` ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <div className="font-semibold text-yellow-300 mb-1">
                  {milestone.level}: {milestone.levelMessage}
                </div>
                <div className="text-gray-200">
                  {milestone.message}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {milestone.min === milestone.max 
                    ? `Meta final: ${milestone.min} palabras`
                    : `${milestone.min}-${milestone.max} palabras`
                  }
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Próxima meta */}
      {learnedWords < 1000 && (
        <div className="text-center text-sm text-gray-600">
          Próxima meta: {nextMilestone.min} palabras ({nextMilestone.percentage}%)
        </div>
      )}

      {/* Botón de reinicio del modo actual */}
      {learnedWords > 0 && onResetCurrentMode && currentMode && (
        <div className="text-center pt-4">
          <button
            onClick={onResetCurrentMode}
            className="px-4 py-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors duration-200 border border-orange-200 hover:border-orange-300"
          >
            🔄 Reiniciar {currentMode === 'es-en' ? 'Español' : 'Inglés'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Milestones
