import { useState } from 'react'

type LearnCardProps = {
  concept: string
}

function LearnCard({ concept: _concept }: LearnCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const videoUrl = 'https://www.youtube.com/embed/gLcD7otUHxw'

  return (
    <>
      <div className="h-full rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#073B5A]">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-sm text-white">
              2
            </span>
            Learn
          </h3>

          <p className="text-sm font-bold text-[#073B5A]/70">10 min</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#FEF3D9] text-center">
          <div className="px-4 pb-3 pt-4">
            <p className="mx-auto max-w-[250px] text-sm font-black leading-snug text-[#073B5A]">
              Turning Repeated Addition into Multiplication
            </p>

            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="relative mt-4 h-[185px] w-full overflow-hidden rounded-t-2xl bg-[#FFF7E3] text-[#073B5A]"
            >
              <div className="absolute left-0 right-0 top-5 flex justify-center gap-3">
                {[1, 2, 3, 4].map((group) => (
                  <div
                    key={group}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0081A7] bg-[#FDFDFC]"
                  >
                    <div className="flex gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F07167]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F07167]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F07167]" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute left-1/2 top-[78px] flex h-13 w-13 -translate-x-1/2 items-center justify-center rounded-full bg-[#073B5A] text-lg text-white shadow-lg">
                ▶
              </div>

              <div className="absolute bottom-11 left-0 right-0 space-y-1 text-center">
                <p className="text-xl font-black">3 + 3 + 3 + 3 = 12</p>
                <p className="text-xl font-black">4 × 3 = 12</p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#073B5A] px-3 py-2.5 text-white">
                <span className="text-sm">▶</span>
                <span className="text-xs font-bold">0:00 / 2:45</span>

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/35">
                  <div className="h-full w-[35%] rounded-full bg-white" />
                </div>

                <span className="text-sm">⚙</span>
                <span className="text-sm">⛶</span>
              </div>
            </button>
          </div>
        </div>

        <button className="mt-3 rounded-lg bg-[#E9F7F8] px-3 py-2 text-sm font-black text-[#0081A7]">
          📄 View Lesson Slides
        </button>
      </div>

      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#073B5A]/70 p-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#073B5A]">
                Lesson Video
              </h2>

              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="rounded-full bg-[#F07167] px-4 py-2 font-black text-white"
              >
                Close
              </button>
            </div>

            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                className="h-full w-full"
                src={`${videoUrl}?autoplay=1`}
                title="Repeated Addition to Multiplication"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LearnCard
