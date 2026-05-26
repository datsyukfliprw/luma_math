import { useState } from 'react'

type LumaAvatarProps = {
  chargeCount: number
  totalCharge: number
  size?: 'sm' | 'md' | 'lg'
}

function LumaAvatar({
  chargeCount,
  totalCharge,
  size = 'md',
}: LumaAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const sizeClass =
    size === 'sm'
      ? 'h-24 w-24'
      : size === 'lg'
        ? 'h-40 w-40'
        : 'h-32 w-32'

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex ${sizeClass} shrink-0 items-center justify-center`}
      >
        <div className="absolute inset-3 rounded-full bg-[#FEF3D9] blur-xl" />

        {imageFailed ? (
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#FEF3D9] text-6xl shadow-sm">
            ⭐
          </div>
        ) : (
          <img
            src="/images/luma/luma_base.png"
            alt="Luma the star mascot"
            onError={() => setImageFailed(true)}
            className="relative h-full w-full object-contain drop-shadow-sm transition-transform duration-300 hover:-translate-y-1"
          />
        )}

        <div className="pointer-events-none absolute -right-1 top-3 text-lg text-[#F7B733]">
          ✦
        </div>

        <div className="pointer-events-none absolute bottom-4 left-2 text-sm text-[#00AFB9]">
          ✦
        </div>
      </div>

      <div className="hidden min-w-[95px] sm:block">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
          Luma Energy
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
    </div>
  )
}

export default LumaAvatar
