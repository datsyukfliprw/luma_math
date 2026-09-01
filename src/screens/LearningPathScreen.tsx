import { useEffect, useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import UnitCard from "../components/learning-path/UnitCard";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import { buildGrade3LearningPathModel } from "../services/progress/learningPathProgress";

function LearningPathScreen() {
  const { studentState } = useStudentProgress();
  const currentUnitRef = useRef<HTMLDivElement | null>(null);
  const pathModel = buildGrade3LearningPathModel(studentState);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      currentUnitRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pathModel.currentUnitNumber]);

  return (
    <PageLayout>
      {/* @SECTION LEARNING_PATH_STATIC_HEADER */}
      <div
        data-name="learning-path-static-header"
        className="sticky top-0 z-20 -mx-1 bg-[#FAF9F4] px-1 pb-6"
      >
        <div className="rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
            Your journey
          </p>

          <h1 className="mt-3 text-3xl font-black lg:text-4xl">Learning Path</h1>

          <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#073B5A]/70 lg:text-lg">
            Follow each pathway one concept at a time. Complete missions, practice new skills, and
            prove mastery with a review quiz.
          </p>
        </div>
      </div>

      {/* @SECTION LEARNING_PATH_UNIT_LIST */}
      <div data-name="learning-path-unit-list" className="space-y-5">
        {pathModel.units.map(({ unit, weeks, progress }) => {
          const isCurrent = unit.unit_number === pathModel.currentUnitNumber;

          return (
            <div
              key={unit.unit_number}
              ref={isCurrent ? currentUnitRef : undefined}
              className={isCurrent ? "scroll-mt-[260px] lg:scroll-mt-[230px]" : ""}
            >
              <UnitCard
                unitNumber={unit.unit_number}
                title={unit.unit_title}
                description={unit.unit_description ?? ""}
                progress={progress}
                isCurrent={isCurrent}
                weeks={weeks}
              />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}

export default LearningPathScreen;
