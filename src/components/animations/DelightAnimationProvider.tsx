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

export type DelightStarReaction = 'charging' | 'celebrate' | null

type ColorRole = 'primary' | 'secondary' | 'accent'

type SparkleTrailStyle = {
  id: SparkleTrailId
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  glowColor: string
}

const sparkleTrailStyles: Record<SparkleTrailId, SparkleTrailStyle> = {
  golden_sparkle: {
    id: 'golden_sparkle',
    name: 'Golden Sparkle',
    primaryColor: '#F7B733',
    secondaryColor: '#FDFCDC',
    accentColor: '#00AFB9',
    glowColor: 'rgba(247, 183, 51, 0.95)',
  },
  teal_magic: {
    id: 'teal_magic',
    name: 'Teal Magic',
    primaryColor: '#00AFB9',
    secondaryColor: '#E9F7F8',
    accentColor: '#F7B733',
    glowColor: 'rgba(0, 175, 185, 0.85)',
  },
  comet_blue: {
    id: 'comet_blue',
    name: 'Comet Blue',
    primaryColor: '#0081A7',
    secondaryColor: '#E9F7F8',
    accentColor: '#FDFCDC',
    glowColor: 'rgba(0, 129, 167, 0.9)',
  },
  rainbow_glow: {
    id: 'rainbow_glow',
    name: 'Rainbow Glow',
    primaryColor: '#F07167',
    secondaryColor: '#FDFCDC',
    accentColor: '#00AFB9',
    glowColor: 'rgba(240, 113, 103, 0.85)',
  },
}

type FlyingLead = {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  trailId: SparkleTrailId
}

type DustParticle = {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  delay: number
  curveOffsetX: number
  curveOffsetY: number
  endOffsetX: number
  endOffsetY: number
  size: number
  colorRole: ColorRole
  trailId: SparkleTrailId
}

type DustParticleSeed = Omit<
  DustParticle,
  'id' | 'toX' | 'toY' | 'trailId'
>

type BurstParticle = {
  id: string
  x: number
  y: number
  angle: number
  distance: number
  delay: number
  size: number
  colorRole: ColorRole
  trailId: SparkleTrailId
}

type BurstParticleSeed = Omit<BurstParticle, 'id' | 'x' | 'y' | 'trailId'>

type SendSparkleOptions = {
  fromElement: HTMLElement | null
  trailId?: SparkleTrailId
}

type DelightAnimationContextValue = {
  registerStarTarget: (element: HTMLElement | null) => void
  sendSparkleToStar: (options: SendSparkleOptions) => void
  starReaction: DelightStarReaction
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

function getColor(style: SparkleTrailStyle, colorRole: ColorRole) {
  if (colorRole === 'accent') return style.accentColor
  if (colorRole === 'secondary') return style.secondaryColor
  return style.primaryColor
}

type FlyingLeadParticleProps = {
  particle: FlyingLead
  onDone: (id: string) => void
}

function FlyingLeadParticle({ particle, onDone }: FlyingLeadParticleProps) {
  const style = sparkleTrailStyles[particle.trailId]
  const midX = (particle.fromX + particle.toX) / 2
  const midY = Math.min(particle.fromY, particle.toY) - 130

  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={{
        x: particle.fromX - 22,
        y: particle.fromY - 22,
        scale: 0.25,
        opacity: 0,
      }}
      animate={{
        x: [particle.fromX - 22, midX - 22, particle.toX - 22],
        y: [particle.fromY - 22, midY - 22, particle.toY - 22],
        scale: [0.25, 1.12, 0.8],
        opacity: [0, 1, 1, 0],
        rotate: [0, 160, 320],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.05,
        ease: [0.25, 0.9, 0.35, 1],
      }}
      onAnimationComplete={() => onDone(particle.id)}
    >
      <div className="relative flex h-11 w-11 items-center justify-center">
        <motion.div
          className="absolute left-[-34px] top-1/2 h-5 w-20 -translate-y-1/2 rounded-full blur-md"
          style={{
            background: `linear-gradient(90deg, transparent, ${style.primaryColor}, ${style.secondaryColor})`,
            opacity: 0.55,
          }}
          animate={{
            scaleX: [0.3, 1, 0.55],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1.05,
            ease: 'easeOut',
          }}
        />

        <div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            backgroundColor: style.primaryColor,
            opacity: 0.72,
          }}
        />

        <div
          className="absolute inset-2 rounded-full blur-sm"
          style={{
            backgroundColor: style.secondaryColor,
            opacity: 0.9,
          }}
        />

        <div
          className="relative text-4xl font-black"
          style={{
            color: style.primaryColor,
            filter: `drop-shadow(0 0 12px ${style.glowColor})`,
          }}
        >
          ★
        </div>
      </div>
    </motion.div>
  )
}

type DustParticleProps = {
  particle: DustParticle
  onDone: (id: string) => void
}

function FlyingDustParticle({ particle, onDone }: DustParticleProps) {
  const style = sparkleTrailStyles[particle.trailId]
  const color = getColor(style, particle.colorRole)

  const midX = (particle.fromX + particle.toX) / 2 + particle.curveOffsetX
  const midY =
    Math.min(particle.fromY, particle.toY) - 95 + particle.curveOffsetY

  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={{
        x: particle.fromX - particle.size / 2,
        y: particle.fromY - particle.size / 2,
        scale: 0.1,
        opacity: 0,
      }}
      animate={{
        x: [
          particle.fromX - particle.size / 2,
          midX - particle.size / 2,
          particle.toX + particle.endOffsetX - particle.size / 2,
        ],
        y: [
          particle.fromY - particle.size / 2,
          midY - particle.size / 2,
          particle.toY + particle.endOffsetY - particle.size / 2,
        ],
        scale: [0.1, 1, 0.15],
        opacity: [0, 0.9, 0.55, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.92,
        delay: particle.delay,
        ease: [0.25, 0.9, 0.35, 1],
      }}
      onAnimationComplete={() => onDone(particle.id)}
    >
      <div
        className="rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          boxShadow: `0 0 ${particle.size * 1.5}px ${color}`,
        }}
      />
    </motion.div>
  )
}

type ArrivalBurstProps = {
  particle: BurstParticle
  onDone: (id: string) => void
}

function ArrivalBurstParticle({ particle, onDone }: ArrivalBurstProps) {
  const style = sparkleTrailStyles[particle.trailId]
  const color = getColor(style, particle.colorRole)

  const radians = (particle.angle * Math.PI) / 180
  const endX = Math.cos(radians) * particle.distance
  const endY = Math.sin(radians) * particle.distance

  return (
    <motion.div
      className="pointer-events-none absolute"
      initial={{
        x: particle.x - particle.size / 2,
        y: particle.y - particle.size / 2,
        scale: 0.1,
        opacity: 0,
      }}
      animate={{
        x: particle.x + endX - particle.size / 2,
        y: particle.y + endY - particle.size / 2,
        scale: [0.1, 1.05, 0.15],
        opacity: [0, 1, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        delay: particle.delay,
        ease: 'easeOut',
      }}
      onAnimationComplete={() => onDone(particle.id)}
    >
      <div
        className="rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          boxShadow: `0 0 ${particle.size * 1.8}px ${color}`,
        }}
      />
    </motion.div>
  )
}

function SparkleLayer({
  leadParticles,
  dustParticles,
  burstParticles,
  removeLeadParticle,
  removeDustParticle,
  removeBurstParticle,
}: {
  leadParticles: FlyingLead[]
  dustParticles: DustParticle[]
  burstParticles: BurstParticle[]
  removeLeadParticle: (id: string) => void
  removeDustParticle: (id: string) => void
  removeBurstParticle: (id: string) => void
}) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-visible">
      <AnimatePresence>
        {leadParticles.map((particle) => (
          <FlyingLeadParticle
            key={particle.id}
            particle={particle}
            onDone={removeLeadParticle}
          />
        ))}

        {dustParticles.map((particle) => (
          <FlyingDustParticle
            key={particle.id}
            particle={particle}
            onDone={removeDustParticle}
          />
        ))}

        {burstParticles.map((particle) => (
          <ArrivalBurstParticle
            key={particle.id}
            particle={particle}
            onDone={removeBurstParticle}
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
  const reactionTimeoutRef = useRef<number | null>(null)
  const reactionClearTimeoutRef = useRef<number | null>(null)
  const burstTimeoutRef = useRef<number | null>(null)

  const [leadParticles, setLeadParticles] = useState<FlyingLead[]>([])
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([])
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([])
  const [starReaction, setStarReaction] = useState<DelightStarReaction>(null)

  const registerStarTarget = useCallback((element: HTMLElement | null) => {
    starTargetRef.current = element
  }, [])

  const removeLeadParticle = useCallback((id: string) => {
    setLeadParticles((current) =>
      current.filter((particle) => particle.id !== id),
    )
  }, [])

  const removeDustParticle = useCallback((id: string) => {
    setDustParticles((current) =>
      current.filter((particle) => particle.id !== id),
    )
  }, [])

  const removeBurstParticle = useCallback((id: string) => {
    setBurstParticles((current) =>
      current.filter((particle) => particle.id !== id),
    )
  }, [])

  const triggerStarReaction = useCallback((reaction: DelightStarReaction) => {
    if (reactionTimeoutRef.current) {
      window.clearTimeout(reactionTimeoutRef.current)
    }

    if (reactionClearTimeoutRef.current) {
      window.clearTimeout(reactionClearTimeoutRef.current)
    }

    reactionTimeoutRef.current = window.setTimeout(() => {
      setStarReaction(reaction)

      reactionClearTimeoutRef.current = window.setTimeout(() => {
        setStarReaction(null)
      }, 1500)
    }, 650)
  }, [])

  const triggerArrivalBurst = useCallback(
    (x: number, y: number, trailId: SparkleTrailId) => {
      if (burstTimeoutRef.current) {
        window.clearTimeout(burstTimeoutRef.current)
      }

      burstTimeoutRef.current = window.setTimeout(() => {
        const burstSeeds: BurstParticleSeed[] = [
          {
            angle: -15,
            distance: 48,
            size: 8,
            colorRole: 'primary',
            delay: 0,
          },
          {
            angle: 35,
            distance: 35,
            size: 6,
            colorRole: 'secondary',
            delay: 0.03,
          },
          {
            angle: 80,
            distance: 52,
            size: 7,
            colorRole: 'accent',
            delay: 0.02,
          },
          {
            angle: 130,
            distance: 38,
            size: 5,
            colorRole: 'primary',
            delay: 0.05,
          },
          {
            angle: 190,
            distance: 44,
            size: 6,
            colorRole: 'secondary',
            delay: 0.04,
          },
          {
            angle: 245,
            distance: 32,
            size: 5,
            colorRole: 'accent',
            delay: 0.06,
          },
          {
            angle: 300,
            distance: 50,
            size: 7,
            colorRole: 'primary',
            delay: 0.01,
          },
        ]

        const burst: BurstParticle[] = burstSeeds.map((particle) => ({
          ...particle,
          id: crypto.randomUUID(),
          x,
          y,
          trailId,
        }))

        setBurstParticles((current) => [...current, ...burst])
      }, 780)
    },
    [],
  )

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

      const lead: FlyingLead = {
        id: crypto.randomUUID(),
        fromX: fromPoint.x,
        fromY: fromPoint.y,
        toX: toPoint.x,
        toY: toPoint.y,
        trailId,
      }

      const dustSeeds: DustParticleSeed[] = [
        {
          fromX: fromPoint.x - 10,
          fromY: fromPoint.y + 7,
          delay: 0.04,
          curveOffsetX: -44,
          curveOffsetY: 4,
          endOffsetX: -24,
          endOffsetY: 18,
          size: 7,
          colorRole: 'primary',
        },
        {
          fromX: fromPoint.x + 11,
          fromY: fromPoint.y + 3,
          delay: 0.08,
          curveOffsetX: 38,
          curveOffsetY: -12,
          endOffsetX: 24,
          endOffsetY: -14,
          size: 5,
          colorRole: 'secondary',
        },
        {
          fromX: fromPoint.x - 3,
          fromY: fromPoint.y + 14,
          delay: 0.12,
          curveOffsetX: -18,
          curveOffsetY: 18,
          endOffsetX: -16,
          endOffsetY: -22,
          size: 5,
          colorRole: 'accent',
        },
        {
          fromX: fromPoint.x + 7,
          fromY: fromPoint.y + 12,
          delay: 0.16,
          curveOffsetX: 24,
          curveOffsetY: 10,
          endOffsetX: 18,
          endOffsetY: 20,
          size: 6,
          colorRole: 'primary',
        },
        {
          fromX: fromPoint.x,
          fromY: fromPoint.y + 17,
          delay: 0.2,
          curveOffsetX: 8,
          curveOffsetY: -20,
          endOffsetX: 5,
          endOffsetY: 28,
          size: 4,
          colorRole: 'secondary',
        },
        {
          fromX: fromPoint.x - 14,
          fromY: fromPoint.y + 10,
          delay: 0.24,
          curveOffsetX: -58,
          curveOffsetY: -6,
          endOffsetX: -32,
          endOffsetY: 2,
          size: 4,
          colorRole: 'accent',
        },
      ]

      const dust: DustParticle[] = dustSeeds.map((particle) => ({
        ...particle,
        id: crypto.randomUUID(),
        toX: toPoint.x,
        toY: toPoint.y,
        trailId,
      }))

      setLeadParticles((current) => [...current, lead])
      setDustParticles((current) => [...current, ...dust])

      triggerStarReaction('charging')
      triggerArrivalBurst(toPoint.x, toPoint.y, trailId)
    },
    [triggerArrivalBurst, triggerStarReaction],
  )

  return (
    <DelightAnimationContext.Provider
      value={{
        registerStarTarget,
        sendSparkleToStar,
        starReaction,
      }}
    >
      {children}

      <SparkleLayer
        leadParticles={leadParticles}
        dustParticles={dustParticles}
        burstParticles={burstParticles}
        removeLeadParticle={removeLeadParticle}
        removeDustParticle={removeDustParticle}
        removeBurstParticle={removeBurstParticle}
      />
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
