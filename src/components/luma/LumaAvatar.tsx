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
  happy: '/images/luma/star_happy.png',
  thinking: '/images/luma/star_thinking.png',
  charging: '/images/luma/star_charging.png',
  charged: '/images/luma/star_charged.png',
  celebrate: '/images/luma/star_celebrate.png',
  proud: '/images/luma/star_proud.png',
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

  const animationClass =
    state === 'happy'
      ? 'animate-[lumaBounce_0.65s_ease-in-out]'
      : state === 'celebrate'
        ? 'animate-[lumaCelebrate_0.9s_ease-in-out]'
        : state === 'charging'
          ? 'animate-[lumaPulse_0.9s_ease-in-out_infinite]'
          : state === 'thinking'
            ? 'animate-[lumaThink_1.1s_ease-in-out_infinite]'
            : state === 'sleepy'
              ? 'opacity-85'
              : ''

  return (
    <div className="flex items-center gap-4">
      <style>
        {`
          @keyframes lumaBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            35% { transform: translateY(-10px) scale(1.04); }
            70% { transform: translateY(0) scale(0.98); }
          }

          @keyframes lumaCelebrate {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            25% { transform: translateY(-12px) rotate(-6deg) scale(1.06); }
            55% { transform: translateY(-4px) rotate(7deg) scale(1.08); }
            80% { transform: translateY(0) rotate(0deg) scale(1); }
          }

          @keyframes lumaPulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(247,183,51,0)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 18px rgba(247,183,51,0.65)); }
          }

          @keyframes lumaThink {
            0%, 100% { transform: rotate(0deg); }
            35% { transform: rotate(-4deg); }
            70% { transform: rotate(4deg); }
          }
        `}
      </style>

      <div
        className={`relative flex ${sizeClass} shrink-0 items-center justify-center`}
      >
        <div className="absolute inset-3 rounded-full bg-[#FEF3D9] blur-xl" />

        {(state === 'charged' || state === 'celebrate') && (
          <div className="absolute inset-0 rounded-full bg-[#FDFCDC] opacity-60 blur-2xl" />
        )}

        {imageFailed ? (
          <div
            className={`relative flex h-full w-full items-center justify-center rounded-full bg-[#FEF3D9] text-6xl shadow-sm ${animationClass}`}
          >
            ⭐
          </div>
        ) : (
          <img
            src={lumaImageByState[state]}
            alt={name ? `${name}, the learning star` : 'Learning star mascot'}
            onError={() => setImageFailed(true)}
            className={`relative h-full w-full object-contain drop-shadow-sm transition-transform duration-300 ${animationClass}`}
          />
        )}

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
                      ? 'border-[#F4C542] bg-[#F7B733] shadow-[0_0_8px_rgba(247,183,51,0.55)]'
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
