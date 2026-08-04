export type TryItCompletionResult =
  | {
      ok: true;
      alreadyCompleted: boolean;
    }
  | {
      ok: false;
      reason: "lesson_not_found" | "progress_update_failed";
    };
