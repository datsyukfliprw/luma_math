import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export type LumaState =
  | 'idle'
  | 'sleepy'
  | 'happy'
  | 'thinking'
  | 'charging'
  | 'charged'
  | 'celebrate'
  | 'proud'

type LumaAvatarProps = {
  chargeCount?: number
  totalCharge?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  state?: LumaState
  showEnergy?: boolean
  name?: string
}

const lumaImageByState: Record<LumaState, string> = {
  idle: '/images/luma/star_idle.png',
  sleepy: '/images/luma/star_sleepy.png',
  happy: '/images/luma/star_proud.png',
  thinking: '/images/luma/star_thinking.png',
  charging: '/images/luma/star_charging.png',
  charged: '/images/luma/star_charged.png',
  celebrate: '/images/luma/star_celebrate.png',
  proud: '/images/luma/star_proud.png',
}

const motionByState: Record<
  LumaState,
  {
    animate: Record<string, unknown>
    transition: Record<string, unknown>
  }
> = {
  idle: {
    animate: {
      y: [0, -5, 0],
      scale: [1, 1.015, 1],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  sleepy: {
    animate: {
      y: [0, 3, 0],
      scale: [0.98, 1, 0.98],
      opacity: [0.82, 0.92, 0.82],
    },
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  happy: {
    animate: {
      y: [0, -12, 0],
      scale: [1, 1.08, 0.98, 1],
    },
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },

  thinking: {
    animate: {
      rotate: [0, -4, 4, 0],
      y: [0, -3, 0],
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  charging: {
    animate: {
      scale: [1, 1.12, 1.03],
      filter: [
        'drop-shadow(0 0 0px rgba(247,183,51,0))',
        'drop-shadow(0 0 24px rgba(247,183,51,0.95))',
        'drop-shadow(0 0 10px rgba(247,183,51,0.55))',
      ],
    },
    transition: {
      duration: 0.75,
      ease: 'easeOut',
    },
  },

  charged: {
    animate: {
      y: [0, -5, 0],
      scale: [1, 1.035, 1],
      filter: [
        'drop-shadow(0 0 8px rgba(247,183,51,0.35))',
        'drop-shadow(0 0 18px rgba(247,183,51,0.75))',
        'drop-shadow(0 0 8px rgba(247,183,51,0.35))',
      ],
    },
    transition: {
      duration: 2.4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  celebrate: {
    animate: {
      y: [0, -22, -8, 0],
      rotate: [0, -7, 7, 0],
      scale: [1, 1.15, 1.08, 1],
      filter: [
        'drop-shadow(0 0 8px rgba(247,183,51,0.35))',
        'drop-shadow(0 0 28px rgba(247,183,51,0.95))',
        'drop-shadow(0 0 14px rgba(247,183,51,0.65))',
      ],
    },
    transition: {
      duration: 0.95,
      ease: 'easeOut',
    },
  },

  proud: {
    animate: {
      y: [0, -4, 0],
      scale: [1, 1.02, 1],
    },
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

function LumaAvatar({
  chargeCount = 0,
  totalCharge = 4,
  size = 'md',
  state = 'idle',
  showEnergy = true,
  name,
}: LumaAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const sizeClass =
    size === 'sm'
      ? 'h-24 w-24'
      : size === 'lg'
        ? 'h-40 w-40'
        : size === 'xl'
          ? 'h-52 w-52'
          : 'h-32 w-32'

  const motionConfig = motionByState[state]

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex ${sizeClass} shrink-0 items-center justify-center`}
      >
        <div className="absolute inset-3 rounded-full bg-[#FEF3D9] blur-xl" />

        {(state === 'charged' ||
          state === 'celebrate' ||
          state === 'charging') && (
          <div className="absolute inset-0 rounded-full bg-[#FDFCDC] opacity-60 blur-2xl" />
        )}

        <AnimatePresence mode="wait">
          {imageFailed ? (
            <motion.div
              key={`fallback-${state}`}
              className="relative flex h-full w-full items-center justify-center rounded-full bg-[#FEF3D9] text-6xl shadow-sm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{
                opacity: 1,
                ...motionConfig.animate,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                opacity: { duration: 0.16 },
                scale: { duration: 0.16 },
                ...motionConfig.transition,
              }}
            >
              ⭐
            </motion.div>
          ) : (
            <motion.img
              key={state}
              src={lumaImageByState[state]}
              alt={name ? `${name}, the learning star` : 'Learning star mascot'}
              onError={() => setImageFailed(true)}
              className="relative h-full w-full object-contain drop-shadow-sm"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                ...motionConfig.animate,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                opacity: { duration: 0.16 },
                scale: { duration: 0.16 },
                ...motionConfig.transition,
              }}
            />
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute -right-1 top-3 text-lg text-[#F7B733]">
          ✦
        </div>

        <div className="pointer-events-none absolute bottom-4 left-2 text-sm text-[#00AFB9]">
          ✦
        </div>
      </div>

      {showEnergy && (
        <div className="hidden min-w-[95px] sm:block">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
            {name ? `${name} Energy` : 'Star Energy'}
          </p>

          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: totalCharge }).map((_, index) => {
              const isCharged = index < chargeCount

              return (
                <span
                  key={index}
                  className={`h-3 w-3 rounded-full border ${
                    isCharged
                      ? 'border-[#F4C542] bg-[#F7B733]'
                      : 'border-[#073B5A]/15 bg-white'
                  }`}
                />
              )
            })}
          </div>

          <p className="mt-2 text-xs font-bold text-[#073B5A]/65">
            {chargeCount}/{totalCharge} charged
          </p>
        </div>
      )}
    </div>
  )
}

export default LumaAvatar
