import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getAllCurricula } from "../../data/curriculum";
import type { ResolvedTryItProblem } from "./types";

const DATA_GRAPH_TYPES = [
  "read_picture_graphs",
  "create_picture_graphs",
  "read_bar_graphs",
  "create_graphs_solve_problems",
  "line_plots",
];

function findLessonId(practiceType: string): string | undefined {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.practice_type === practiceType && lesson.lesson_type === "lesson") {
          return `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
        }
      }
    }
  }
  return undefined;
}

function resolve(practiceType: string, attemptKey = "semantic") {
  const lessonId = findLessonId(practiceType);
  if (!lessonId) throw new Error(`No lesson for ${practiceType}`);
  const experience = getResolvedTryItExperience(lessonId, { attemptKey });
  expect(experience).toBeDefined();
  return { lessonId, experience: experience! };
}

function getAnswerPart(problem: ResolvedTryItProblem) {
  return problem.parts[0];
}

function parseKey(prompt: string): { scale: number } | undefined {
  const match = prompt.match(/1 (\w+) = (\d+) (\w+)/);
  if (!match) return undefined;
  return { scale: Number(match[2]) };
}

function parseGraphEntries(prompt: string): Record<string, number> {
  const entries: Record<string, number> = {};
  for (const m of prompt.matchAll(/(\w+): (\d+) (\w+)/g)) {
    entries[m[1]] = Number(m[2]);
  }
  return entries;
}

function parseFractionToQuarters(value: string): number {
  const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) * 4 + (Number(mixed[2]) * 4) / Number(mixed[3]);
  }
  const simple = value.match(/^(\d+)\/(\d+)$/);
  if (simple) {
    return (Number(simple[1]) * 4) / Number(simple[2]);
  }
  return Number(value) * 4;
}

function getQuestion(prompt: string): string {
  const parts = prompt.split(". ");
  return parts[parts.length - 1].replace(/\?$/, "");
}

function computeCreateGraphsExpected(
  question: string,
  entries: Record<string, number>,
  scale: number,
): number {
  const counts: Record<string, number> = {};
  for (const [cat, h] of Object.entries(entries)) {
    counts[cat] = h * scale;
  }

  const more = question.match(/^How many more (\w+) does (\w+) have than (\w+)$/);
  if (more) return counts[more[2]] - counts[more[3]];

  const combinedMore = question.match(
    /^How many more (\w+) are (\w+) and (\w+) combined than (\w+)$/,
  );
  if (combinedMore)
    return counts[combinedMore[2]] + counts[combinedMore[3]] - counts[combinedMore[4]];

  const combined = question.match(/^How many (\w+) are (\w+) and (\w+) combined$/);
  if (combined) return counts[combined[2]] + counts[combined[3]];

  const total = question.match(/^How many (\w+) are there in all$/);
  if (total) return Object.values(counts).reduce((a, b) => a + b, 0);

  throw new Error(`Unknown create_graphs question: ${question}`);
}

function parseLinePlot(prompt: string): {
  data: Record<number, number>;
  distinct: number[];
  observations: number[];
} {
  const match = prompt.match(/as follows: ([^.]+)\./);
  expect(match).toBeTruthy();
  const data: Record<number, number> = {};
  const distinct: number[] = [];
  const observations: number[] = [];
  for (const m of match![1].matchAll(/((?:\d+\s)?\d+\/\d+|\d+):\s(X+)/g)) {
    const q = parseFractionToQuarters(m[1]);
    const count = m[2].length;
    data[q] = count;
    distinct.push(q);
    for (let i = 0; i < count; i += 1) {
      observations.push(q);
    }
  }
  distinct.sort((a, b) => a - b);
  observations.sort((a, b) => a - b);
  return { data, distinct, observations };
}

function computeLineExpected(
  question: string,
  data: Record<number, number>,
  distinct: number[],
  observations: number[],
): number {
  const atLeast = question.match(/^How many measurements are at least ([^?]+)$/);
  if (atLeast) {
    const q = parseFractionToQuarters(atLeast[1].trim());
    return distinct.reduce((sum, v) => (v >= q ? sum + data[v] : sum), 0);
  }

  const between = question.match(
    /^How many measurements are between ([^?]+) and ([^?]+) inclusive$/,
  );
  if (between) {
    const a = parseFractionToQuarters(between[1].trim());
    const b = parseFractionToQuarters(between[2].trim());
    return distinct.reduce((sum, v) => (v >= a && v <= b ? sum + data[v] : sum), 0);
  }

  const valueMatch = question.match(/^How many measurements are ([^?]+)$/);
  if (valueMatch) {
    const q = parseFractionToQuarters(valueMatch[1].trim());
    return data[q] ?? 0;
  }

  if (question.startsWith("What is the difference between the largest and smallest measurement")) {
    return observations[observations.length - 1] - observations[0];
  }
  if (question.startsWith("What is the total of the two smallest measurements")) {
    return observations[0] + observations[1];
  }
  if (question.startsWith("What is the total of the two largest measurements")) {
    return observations[observations.length - 1] + observations[observations.length - 2];
  }
  if (question === "Which measurement appears most often") {
    const maxCount = Math.max(...Object.values(data));
    const mode = distinct.find((q) => data[q] === maxCount);
    if (mode === undefined) throw new Error("No mode found");
    return mode;
  }

  throw new Error(`Unknown line plot question: ${question}`);
}

describe("data/graph Try It semantic correctness", () => {
  it("produces deterministic problems", () => {
    for (const practiceType of DATA_GRAPH_TYPES) {
      const a = resolve(practiceType, "det-a");
      const b = resolve(practiceType, "det-a");
      expect(a.experience.problems.map((p) => p.problemKey)).toEqual(
        b.experience.problems.map((p) => p.problemKey),
      );
      expect(a.experience.problems.map((p) => p.prompt)).toEqual(
        b.experience.problems.map((p) => p.prompt),
      );
      expect(a.experience.problems.map((p) => getAnswerPart(p).correctAnswer)).toEqual(
        b.experience.problems.map((p) => getAnswerPart(p).correctAnswer),
      );
    }
  });

  it("produces unique problem keys", () => {
    for (const practiceType of DATA_GRAPH_TYPES) {
      const { experience } = resolve(practiceType);
      const keys = experience.problems.map((p) => p.problemKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("read_picture_graphs requires using the symbol scale", () => {
    const { experience } = resolve("read_picture_graphs");
    for (const problem of experience.problems) {
      const key = parseKey(problem.prompt);
      expect(key).toBeDefined();
      const entries = parseGraphEntries(problem.prompt);
      expect(Object.keys(entries).length).toBeGreaterThan(0);

      const qMatch = getQuestion(problem.prompt).match(
        /^How many (\w+) are in the (\w+) category$/,
      );
      expect(qMatch).toBeTruthy();
      const target = qMatch![2];
      expect(entries[target]).toBeDefined();

      const expected = entries[target] * key!.scale;
      expect(Number(getAnswerPart(problem).correctAnswer)).toBe(expected);
      expect(getAnswerPart(problem).choices).toContain(String(expected));
    }
  });

  it("create_picture_graphs correct choice exactly represents the data under the scale", () => {
    const { experience } = resolve("create_picture_graphs");
    for (const problem of experience.problems) {
      const key = parseKey(problem.prompt);
      expect(key).toBeDefined();
      const data = parseGraphEntries(problem.prompt);
      expect(Object.keys(data).length).toBeGreaterThan(0);

      const correct = getAnswerPart(problem).correctAnswer;
      const correctEntries = parseGraphEntries(correct);
      for (const [cat, count] of Object.entries(data)) {
        expect(correctEntries[cat]).toBeDefined();
        expect(count / key!.scale).toBe(correctEntries[cat]);
      }

      const choices = getAnswerPart(problem).choices ?? [];
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices).toContain(correct);
    }
  });

  it("read_bar_graphs requires using the bar scale", () => {
    const { experience } = resolve("read_bar_graphs");
    for (const problem of experience.problems) {
      const key = parseKey(problem.prompt);
      expect(key).toBeDefined();
      const entries = parseGraphEntries(problem.prompt);
      expect(Object.keys(entries).length).toBeGreaterThan(0);

      const qMatch = getQuestion(problem.prompt).match(
        /^How many (\w+) are in the (\w+) category$/,
      );
      expect(qMatch).toBeTruthy();
      const target = qMatch![2];
      expect(entries[target]).toBeDefined();

      const expected = entries[target] * key!.scale;
      expect(Number(getAnswerPart(problem).correctAnswer)).toBe(expected);
      expect(getAnswerPart(problem).choices).toContain(String(expected));
    }
  });

  it("create_graphs_solve_problems includes a scaled graph and valid one/two-step arithmetic", () => {
    const { experience } = resolve("create_graphs_solve_problems");
    for (const problem of experience.problems) {
      const key = parseKey(problem.prompt);
      expect(key).toBeDefined();
      const entries = parseGraphEntries(problem.prompt);
      expect(Object.keys(entries).length).toBeGreaterThan(0);

      const question = getQuestion(problem.prompt);
      const expected = computeCreateGraphsExpected(question, entries, key!.scale);
      expect(Number(getAnswerPart(problem).correctAnswer)).toBe(expected);
      expect(getAnswerPart(problem).choices).toContain(String(expected));
    }
  });

  it("create_graphs_solve_problems varies problem form across seeds", () => {
    const questions = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const { experience } = resolve("create_graphs_solve_problems", `cg-form-${i}`);
      for (const problem of experience.problems) {
        questions.add(getQuestion(problem.prompt));
      }
    }
    expect(questions.size).toBeGreaterThan(1);
  });

  it("line_plots uses exact fractional data and meaningful questions", () => {
    const { experience } = resolve("line_plots");
    for (const problem of experience.problems) {
      const { data, distinct, observations } = parseLinePlot(problem.prompt);
      expect(distinct.length).toBeGreaterThanOrEqual(2);
      expect(distinct.some((q) => q % 4 !== 0)).toBe(true);
      expect(distinct.every((q) => q > 0 && q <= 12)).toBe(true);

      const question = getQuestion(problem.prompt);
      const expected = computeLineExpected(question, data, distinct, observations);
      const answer = getAnswerPart(problem).correctAnswer;

      if (question.startsWith("How many measurements")) {
        expect(Number(answer)).toBe(expected);
      } else {
        expect(parseFractionToQuarters(answer)).toBe(expected);
      }

      const choices = getAnswerPart(problem).choices ?? [];
      expect(new Set(choices).size).toBe(choices.length);
      expect(choices).toContain(answer);

      expect(problem.prompt).not.toMatch(/\d+\.\d+/);
      expect(answer).not.toMatch(/\d+\.\d+/);
      for (const c of choices) {
        expect(c).not.toMatch(/\d+\.\d+/);
      }
    }
  });

  it("line_plots uses frequency for the two largest measurements, not just distinct values", () => {
    let found = false;
    for (let i = 0; i < 20; i += 1) {
      const { experience } = resolve("line_plots", `two-largest-${i}`);
      for (const problem of experience.problems) {
        const question = getQuestion(problem.prompt);
        if (!question.startsWith("What is the total of the two largest measurements")) continue;

        const { data, distinct } = parseLinePlot(problem.prompt);
        const maxValue = distinct[distinct.length - 1];
        if (data[maxValue] < 2) continue;

        const expected = 2 * maxValue;
        const answer = getAnswerPart(problem).correctAnswer;
        expect(parseFractionToQuarters(answer)).toBe(expected);

        const choices = getAnswerPart(problem).choices ?? [];
        const correctCount = choices.filter(
          (choice) => parseFractionToQuarters(choice) === expected,
        ).length;
        expect(correctCount).toBe(1);

        found = true;
        break;
      }
      if (found) break;
    }
    expect(found).toBe(true);
  });
});
