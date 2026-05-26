import { useState } from 'react'
import {
  cleanStarName,
  getRandomStarName,
  updateStarProfile,
} from '../../lib/starProfile'

type StarNamePromptProps = {
  studentId: string
  onSaved: () => void
}

function StarNamePrompt({ studentId, onSaved }: StarNamePromptProps) {
  const [starName, setStarName] = useState(getRandomStarName())
  const cleanedName = cleanStarName(starName)
  const canSave = cleanedName.length > 0

  function saveName() {
    if (!canSave) return

    updateStarProfile(studentId, {
      starName: cleanedName,
    })

    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#073B5A]/55 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#F4D589] bg-[#FFFDF7] p-8 shadow-2xl">
        <div className="pointer-events-none absolute right-8 top-8 text-3xl text-[#F7B733]">
          ✦
        </div>

        <div className="grid gap-7 md:grid-cols-[1fr_190px] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#00AFB9]">
              Meet your learning star
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.03em] text-[#073B5A]">
              What should we call your star?
            </h2>

            <p className="mt-4 text-base font-bold leading-relaxed text-[#073B5A]/70">
              Your star will cheer you on, collect energy, and celebrate your
              math progress.
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                Star Name
              </span>

              <input
                value={starName}
                onChange={(event) => setStarName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveName()
                }}
                maxLength={16}
                className="w-full rounded-2xl border border-[#073B5A]/15 bg-white px-5 py-4 text-xl font-black text-[#073B5A] outline-none focus:border-[#00AFB9]"
                placeholder="Type a name"
                autoFocus
              />
            </label>

            <p className="mt-2 text-sm font-bold text-[#073B5A]/55">
              You can change this anytime in Settings.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStarName(getRandomStarName())}
                className="rounded-xl border border-[#00AFB9]/35 bg-white px-5 py-3 font-black text-[#0081A7]"
              >
                Random Name
              </button>

              <button
                type="button"
                onClick={saveName}
                disabled={!canSave}
                className={`rounded-xl px-5 py-3 font-black shadow-sm ${
                  canSave
                    ? 'bg-[#00AFB9] text-white'
                    : 'bg-[#DDEEEF] text-[#073B5A]/45'
                }`}
              >
                Save Star Name
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <div className="absolute inset-4 rounded-full bg-[#FEF3D9] blur-2xl" />

              <img
                src="/images/luma/luma_base.png"
                alt="Learning star mascot"
                className="relative h-full w-full object-contain drop-shadow-sm"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />

              <div className="absolute text-8xl">⭐</div>

              <div className="absolute -right-1 top-6 text-2xl text-[#F7B733]">
                ✦
              </div>

              <div className="absolute bottom-8 left-2 text-xl text-[#00AFB9]">
                ✦
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StarNamePrompt
