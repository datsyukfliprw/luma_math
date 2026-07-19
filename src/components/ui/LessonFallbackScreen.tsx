import { Link } from "react-router-dom";

type LessonFallbackScreenProps = {
  lessonId?: string;
  contentType?: "experience" | "curriculum";
};

export function LessonFallbackScreen({ lessonId, contentType = "experience" }: LessonFallbackScreenProps) {
  const isExperience = contentType === "experience";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#faf9f4] p-8">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* LumaMath mascot branding */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#F4D589] bg-[#FEF3D9] text-4xl">
            ⭐
          </div>
        </div>

        <h1 className="mb-3 text-center text-2xl font-black text-[#073B5A]">
          {isExperience ? "Lesson Content Unavailable" : "Lesson Not Found"}
        </h1>
        
        <p className="mb-6 text-center text-base font-semibold text-[#073B5A]/75">
          {isExperience
            ? "The lesson content for this activity is currently unavailable. Your progress is safe."
            : "We couldn't find the lesson you're looking for. It may have been moved or doesn't exist yet."}
        </p>

        {lessonId && (
          <div className="mb-6 rounded-xl bg-[#F5FBFC] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
              Lesson ID
            </p>
            <p className="mt-1 text-sm font-mono text-[#073B5A]/70">{lessonId}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/learning-path"
            className="rounded-xl bg-[#00AFB9] px-6 py-3 text-center text-base font-black text-white transition-colors hover:bg-[#0081A7]"
          >
            Go to Learning Path
          </Link>
          
          <Link
            to="/"
            className="rounded-xl border-2 border-[#073B5A] px-6 py-3 text-center text-base font-black text-[#073B5A] transition-colors hover:bg-[#073B5A]/5"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
