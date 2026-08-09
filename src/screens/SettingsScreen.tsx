import { useState } from "react";
import { CheckCircle2, UserRound, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useStudentProgress } from "../contexts/StudentProgressContext";

function SettingsScreen() {
  const { studentId, studentState, updateStarProfile } = useStudentProgress();
  const [studentNameInput, setStudentNameInput] = useState(
    studentState.starProfile.studentName ?? "",
  );
  const [saved, setSaved] = useState(false);

  const cleanedStudentName = studentNameInput.trim().slice(0, 32);
  const canSaveProfile = cleanedStudentName.length > 0;

  function saveProfile() {
    if (!canSaveProfile) return;

    updateStarProfile({
      studentName: cleanedStudentName,
      grade: 3,
    });

    setStudentNameInput(cleanedStudentName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <PageLayout>
      <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#00AFB9]">
          App Settings
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
          Settings
        </h1>

        <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-[#073B5A]/65 lg:text-lg">
          Manage the student profile used for this local LumaMath installation.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#0081A7]">
              <UserRound size={25} strokeWidth={2.6} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
                Student Profile
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#073B5A]">Who is learning?</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl bg-[#F5FBFC] p-4">
              <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Student Name
              </span>
              <input
                value={studentNameInput}
                onChange={(event) => {
                  setStudentNameInput(event.target.value);
                  setSaved(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveProfile();
                }}
                maxLength={32}
                placeholder="Student name"
                className="mt-2 w-full rounded-xl border border-[#073B5A]/10 bg-white px-4 py-3 text-base font-black text-[#073B5A] outline-none transition focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
              />
            </label>

            <div className="rounded-2xl bg-[#F5FBFC] p-4">
              <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Curriculum
              </span>
              <div className="mt-2 rounded-xl border border-[#073B5A]/10 bg-white px-4 py-3">
                <p className="text-base font-black text-[#073B5A]">3rd Grade</p>
                <p className="mt-1 text-xs font-bold text-[#073B5A]/60">
                  Grade 3 is the active curriculum in this build.
                </p>
              </div>
            </div>
          </div>


          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveProfile}
              disabled={!canSaveProfile}
              className={`rounded-2xl px-6 py-3 text-sm font-black shadow-sm transition ${
                canSaveProfile
                  ? "bg-[#00AFB9] text-white hover:bg-[#0081A7]"
                  : "cursor-not-allowed bg-[#DDEEEF] text-[#073B5A]/45"
              }`}
            >
              Save Student Profile
            </button>

            <Link
              to="/students"
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-5 text-sm font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              <UsersRound size={18} strokeWidth={2.7} />
              Switch or Add Student
            </Link>

            {saved && (
              <div className="flex items-center gap-2 text-sm font-black text-[#2F7D32]">
                <CheckCircle2 size={18} strokeWidth={2.8} />
                Saved locally
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Local Progress
          </p>
          <h2 className="mt-2 text-xl font-black text-[#073B5A]">This device remembers progress.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#073B5A]/70">
            Lesson progress, practice results, evaluations, and flashcards are saved in this browser.
          </p>
          <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold leading-6 text-[#073B5A]/70">
            Each local student profile keeps its own progress. Cloud sync is planned later.
          </p>
          <p className="mt-3 text-xs font-bold text-[#073B5A]/45">
            Local profile ID: {studentId}
          </p>
        </aside>
      </section>
    </PageLayout>
  );
}

export default SettingsScreen;
