import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

export type SparkleTrailId =
  | 'golden_sparkle'
  | 'teal_magic'
  | 'comet_blue'
  | 'rainbow_glow'

type SparkleTrailStyle = {
  id: SparkleTrailId
  name: string
  leadSymbol: string
  dustSymbol: string
  primaryColor: string
  secondaryColor: string
  glowColor: string
}

const sparkleTrailStyles: Record<SparkleTrailId, SparkleTrailStyle> = {
  golden_sparkle: {
    id: 'golden_sparkle',
    name: 'Golden Sparkle',
    leadSymbol: '★',
    dustSymbol: '✦',
    primaryColor: '#F7B733',
    secondaryColor: '#FDFCDC',
    glowColor: 'rgba(247, 183, 51, 0.95)',
  },
  teal_magic: {
    id: 'teal_magic',
    name: 'Teal Magic',
    leadSymbol: '✦',
    dustSymbol: '✧',
    primaryColor: '#00AFB9',
    secondaryColor: '#E9F7F8',
    glowColor: 'rgba(0, 175, 185, 0.85)',
  },
  comet_blue: {
    id: 'comet_blue',
    name: 'Comet Blue',
    leadSymbol: '★',
    dustSymbol: '•',
    primaryColor: '#0081A7',
    secondaryColor: '#E9F7F8',
    glowColor: 'rgba(0, 129, 167, 0.9)',
  },
  rainbow_glow: {
    id: 'rainbow_glow',
    name: 'Rainbow Glow',
    leadSymbol: '✦',
    dustSymbol: '✧',
    primaryColor: '#F07167',
    secondaryColor: '#FDFCDC',
    glowColor: 'rgba(240, 113, 103, 0.85)',
  },
}

type Sparkle = {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  delay: number
  size: 'lead' | 'dust'
  curveOffset: number
  endOffsetX: number
  endOffsetY: number
  trailId: SparkleTrailId
}

type SendSparkleOptions = {
  fromElement: HTMLElement | null
  trailId?: SparkleTrailId
}

type DelightAnimationContextValue = {
  registerStarTarget: (element: HTMLElement | null) => void
  sendSparkleToStar: (options: SendSparkleOptions) => void
}

const DelightAnimationContext =
  createContext<DelightAnimationContextValue | null>(null)

function getCenterPoint(element: HTMLElement) {
  const rect = element.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

type FlyingSparkleProps = {
  sparkle: Sparkle
  onDone: (id: string) => void
}

function FlyingSparkle({ sparkle, onDone }: FlyingSparkleProps) {
  const trailStyle = sparkleTrailStyles[sparkle.trailId]
  const midX = (sparkle.fromX + sparkle.toX) / 2 + sparkle.curveOffset
  const curveY = Math.min(sparkle.fromY, sparkle.toY) - 115

  const isLead = sparkle.size === 'lead'
  const visualSize = isLead ? 'h-10 w-10' : 'h-5 w-5'
  const symbolSize = isLead ? 'text-3xl' : 'text-lg'
  const offset = isLead ? 20 : 10
  const duration = isLead ? 1.05 : 0.95

  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={{
        x: sparkle.fromX - offset,
        y: sparkle.fromY - offset,
        scale: isLead ? 0.45 : 0.25,
        opacity: 0,
      }}
      animate={{
        x: [
          sparkle.fromX - offset,
          midX - offset,
          sparkle.toX + sparkle.endOffsetX - offset,
        ],
        y: [
          sparkle.fromY - offset,
          curveY - offset,
          sparkle.toY + sparkle.endOffsetY - offset,
        ],
        scale: isLead ? [0.45, 1.2, 0.75] : [0.2, 0.75, 0.35],
        opacity: isLead ? [0, 1, 1, 0] : [0, 0.9, 0.65, 0],
        rotate: isLead ? [0, 140, 280] : [0, -90, -180],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration,
        delay: sparkle.delay,
        ease: 'easeInOut',
      }}
      onAnimationComplete={() => onDone(sparkle.id)}
    >
      <div className={`relative flex ${visualSize} items-center justify-center`}>
        <div
          className="absolute inset-0 rounded-full opacity-60 blur-md"
          style={{ backgroundColor: trailStyle.primaryColor }}
        />

        <div
          className="absolute inset-1 rounded-full opacity-80 blur-sm"
          style={{ backgroundColor: trailStyle.secondaryColor }}
        />

        <div
          className={`relative ${symbolSize} drop-shadow-[0_0_10px_var(--sparkle-glow)]`}
          style={
            {
              color: trailStyle.primaryColor,
              '--sparkle-glow': trailStyle.glowColor,
            } as React.CSSProperties
          }
        >
          {isLead ? trailStyle.leadSymbol : trailStyle.dustSymbol}
        </div>
      </div>
    </motion.div>
  )
}

function SparkleLayer({
  sparkles,
  removeSparkle,
}: {
  sparkles: Sparkle[]
  removeSparkle: (id: string) => void
}) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-visible">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <FlyingSparkle
            key={sparkle.id}
            sparkle={sparkle}
            onDone={removeSparkle}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

type DelightAnimationProviderProps = {
  children: ReactNode
}

export function DelightAnimationProvider({
  children,
}: DelightAnimationProviderProps) {
  const starTargetRef = useRef<HTMLElement | null>(null)
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  const registerStarTarget = useCallback((element: HTMLElement | null) => {
    starTargetRef.current = element
  }, [])

  const removeSparkle = useCallback((id: string) => {
    setSparkles((current) => current.filter((sparkle) => sparkle.id !== id))
  }, [])

  const sendSparkleToStar = useCallback(
    ({ fromElement, trailId = 'golden_sparkle' }: SendSparkleOptions) => {
      const starTarget = starTargetRef.current

      if (!fromElement) {
        console.warn('No sparkle source element found.')
        return
      }

      if (!starTarget) {
        console.warn('No star target registered yet.')
        return
      }

      const fromPoint = getCenterPoint(fromElement)
      const toPoint = getCenterPoint(starTarget)

      const newSparkles: Sparkle[] = [
        {
          id: crypto.randomUUID(),
          fromX: fromPoint.x,
          fromY: fromPoint.y,
          toX: toPoint.x,
          toY: toPoint.y,
          delay: 0,
          size: 'lead',
          curveOffset: 0,
          endOffsetX: 0,
          endOffsetY: 0,
          trailId,
        },
        {
          id: crypto.randomUUID(),
          fromX: fromPoint.x - 8,
          fromY: fromPoint.y + 5,
          toX: toPoint.x,
          toY: toPoint.y,
          delay: 0.07,
          size: 'dust',
          curveOffset: -38,
          endOffsetX: -24,
          endOffsetY: 15,
          trailId,
        },
        {
          id: crypto.randomUUID(),
          fromX: fromPoint.x + 10,
          fromY: fromPoint.y + 2,
          toX: toPoint.x,
          toY: toPoint.y,
          delay: 0.12,
          size: 'dust',
          curveOffset: 34,
          endOffsetX: 22,
          endOffsetY: -12,
          trailId,
        },
        {
          id: crypto.randomUUID(),
          fromX: fromPoint.x - 4,
          fromY: fromPoint.y + 10,
          toX: toPoint.x,
          toY: toPoint.y,
          delay: 0.17,
          size: 'dust',
          curveOffset: -18,
          endOffsetX: -14,
          endOffsetY: -20,
          trailId,
        },
        {
          id: crypto.randomUUID(),
          fromX: fromPoint.x + 5,
          fromY: fromPoint.y + 8,
          toX: toPoint.x,
          toY: toPoint.y,
          delay: 0.22,
          size: 'dust',
          curveOffset: 20,
          endOffsetX: 16,
          endOffsetY: 18,
          trailId,
        },
      ]

      setSparkles((current) => [...current, ...newSparkles])
    },
    [],
  )

  return (
    <DelightAnimationContext.Provider
      value={{
        registerStarTarget,
        sendSparkleToStar,
      }}
    >
      {children}

      <SparkleLayer sparkles={sparkles} removeSparkle={removeSparkle} />
    </DelightAnimationContext.Provider>
  )
}

export function useDelightAnimation() {
  const context = useContext(DelightAnimationContext)

  if (!context) {
    throw new Error(
      'useDelightAnimation must be used inside DelightAnimationProvider',
    )
  }

  return context
}
