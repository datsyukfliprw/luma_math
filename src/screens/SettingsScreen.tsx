import { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { getRandomStarName } from "../lib/starProfile";
import { useStudentProgress } from "../contexts/StudentProgressContext";

function SettingsScreen() {
  const { studentState, updateStarProfile } = useStudentProgress();

  const [starNameInput, setStarNameInput] = useState(studentState.starProfile.starName);
  const cleanedName = starNameInput.trim().slice(0, 16);
  const canSave = cleanedName.length > 0;

  function saveStarName() {
    if (!canSave) return;

    updateStarProfile({
      starName: cleanedName,
    });

    setStarNameInput(cleanedName);
  }

  return (
    <PageLayout>
      <div className="mb-6 rounded-[2rem] bg-white p-6 lg:p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#00AFB9]">
          App Settings
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
          Settings
        </h1>

        <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-[#073B5A]/65 lg:text-lg">
          Manage student settings, star companion details, and learning preferences.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Student Profile
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F5FBFC] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/55">
                  Student
                </p>
                <p className="mt-1 text-xl font-black text-[#073B5A]">Ava Johnson</p>
              </div>

              <div className="rounded-2xl bg-[#F5FBFC] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/55">
                  Grade
                </p>
                <p className="mt-1 text-xl font-black text-[#073B5A]">3rd Grade</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#F4D589] bg-[#FFFDF7] p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Star Companion
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#073B5A]">Rename your star</h2>

            <p className="mt-2 max-w-2xl font-bold leading-relaxed text-[#073B5A]/65">
              This name will be used throughout the app when your star cheers you on and celebrates
              your progress.
            </p>

            <label className="mt-5 block max-w-xl">
              <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                Star Name
              </span>

              <input
                value={starNameInput}
                onChange={(event) => setStarNameInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveStarName();
                }}
                maxLength={16}
                className="w-full rounded-2xl border border-[#073B5A]/15 bg-white px-5 py-4 text-xl font-black text-[#073B5A] outline-none focus:border-[#00AFB9] lg:py-5 lg:text-2xl"
                placeholder="Name your star"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStarNameInput(getRandomStarName())}
                className="rounded-xl border border-[#00AFB9]/35 bg-white px-5 py-3 font-black text-[#0081A7] lg:px-7 lg:py-4 lg:text-base"
              >
                Random Name
              </button>

              <button
                type="button"
                onClick={saveStarName}
                disabled={!canSave}
                className={`rounded-xl px-5 py-3 font-black shadow-sm lg:px-7 lg:py-4 lg:text-base ${
                  canSave ? "bg-[#00AFB9] text-white" : "bg-[#DDEEEF] text-[#073B5A]/45"
                }`}
              >
                Save Name
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#E9F7F8] p-4">
              <p className="text-sm font-bold text-[#073B5A]/70">Current star name</p>
              <p className="mt-1 text-2xl font-black text-[#073B5A]">
                {studentState.starProfile.starName || "Not named yet"}
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
            Star Preview
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center lg:h-56 lg:w-56">
              <div className="absolute inset-5 rounded-full bg-[#FEF3D9] blur-2xl" />

              <img
                src="/images/luma/star_idle.png"
                alt="Learning star mascot"
                className="relative h-full w-full object-contain drop-shadow-sm"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute text-7xl lg:text-9xl">⭐</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#FEF3D9] p-4 text-center">
            <p className="text-sm font-bold text-[#073B5A]/70">Your star is named</p>
            <p className="mt-1 text-3xl font-black text-[#073B5A]">
              {studentState.starProfile.starName || "???"}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#073B5A]/10 bg-[#F5FBFC] p-4">
            <p className="font-black text-[#073B5A]">Coming soon</p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-[#073B5A]/65">
              Earn accessories and more by completing lessons.
            </p>
          </div>
        </aside>
      </section>
    </PageLayout>
  );
}

export default SettingsScreen;
