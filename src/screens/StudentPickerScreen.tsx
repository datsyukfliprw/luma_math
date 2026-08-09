import { useState } from "react";
import { Check, Plus, UserRound, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createLocalStudent,
  getLocalStudentProfiles,
  setActiveStudentId,
} from "../lib/studentProfiles";

type StudentPickerScreenProps = {
  activeStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  standalone?: boolean;
};

function StudentPickerScreen({
  activeStudentId,
  onSelectStudent,
  standalone = false,
}: StudentPickerScreenProps) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(() => getLocalStudentProfiles());
  const [studentName, setStudentName] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(profiles.length === 0);
  const cleanedName = studentName.trim().slice(0, 32);

  function chooseStudent(studentId: string) {
    setActiveStudentId(studentId);
    onSelectStudent(studentId);
    navigate("/");
  }

  function addStudent() {
    if (!cleanedName) return;

    const profile = createLocalStudent(cleanedName);
    setProfiles(getLocalStudentProfiles());
    setStudentName("");
    setShowAddStudent(false);
    onSelectStudent(profile.id);
    navigate("/");
  }

  const content = (
    <div className="w-full max-w-4xl rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-[0_24px_70px_rgba(7,59,90,0.14)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#0081A7]">
            <UsersRound size={29} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Student Profiles
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.03em] text-[#073B5A]">
              Who is learning today?
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#073B5A]/65 sm:text-base">
              Each student keeps separate lesson progress, practice results, evaluations, and flashcards on this device.
            </p>
          </div>
        </div>

        {profiles.length > 0 && !showAddStudent && (
          <button
            type="button"
            onClick={() => setShowAddStudent(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#00AFB9]/25 bg-[#E9F7F8] px-4 text-sm font-black text-[#0081A7] transition hover:bg-[#DDF3F5]"
          >
            <Plus size={18} strokeWidth={2.8} />
            Add Student
          </button>
        )}
      </div>

      {profiles.length > 0 && (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {profiles.map((profile) => {
            const isActive = profile.id === activeStudentId;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => chooseStudent(profile.id)}
                className={`flex min-h-24 items-center gap-4 rounded-[1.5rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-[#00AFB9] bg-[#E9F7F8] ring-2 ring-[#00AFB9]/15"
                    : "border-[#073B5A]/10 bg-[#F8FBFB] hover:border-[#00AFB9]/30"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FED9B7] text-[#073B5A] shadow-sm">
                  <UserRound size={27} strokeWidth={2.6} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-black text-[#073B5A]">{profile.studentName}</p>
                  <p className="mt-1 text-sm font-bold text-[#073B5A]/60">3rd Grade</p>
                </div>

                {isActive ? (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-white">
                    <Check size={19} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-sm font-black text-[#0081A7]">Choose</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showAddStudent && (
        <section className="mt-7 rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#F5FBFC] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
            {profiles.length === 0 ? "First Student" : "New Student"}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#073B5A]">Add a local student profile</h2>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              autoFocus
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addStudent();
              }}
              maxLength={32}
              placeholder="Student name"
              className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[#073B5A]/10 bg-white px-4 text-base font-black text-[#073B5A] outline-none transition focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
            />

            <button
              type="button"
              onClick={addStudent}
              disabled={!cleanedName}
              className={`min-h-12 rounded-2xl px-6 text-sm font-black shadow-sm transition ${
                cleanedName
                  ? "bg-[#00AFB9] text-white hover:bg-[#0081A7]"
                  : "cursor-not-allowed bg-[#DDEEEF] text-[#073B5A]/45"
              }`}
            >
              Create & Start
            </button>

            {profiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStudentName("");
                  setShowAddStudent(false);
                }}
                className="min-h-12 rounded-2xl border border-[#073B5A]/10 bg-white px-5 text-sm font-black text-[#073B5A]"
              >
                Cancel
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );

  if (standalone) {
    return (
      <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#F0EEE7] p-4 sm:p-8">
        {content}
      </main>
    );
  }

  return <div className="flex min-h-full items-start justify-center p-1 pb-8">{content}</div>;
}

export default StudentPickerScreen;
