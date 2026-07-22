# LumaMath UX & Educational Audit

## Initial findings

### 1. Critical: place-value target formatting is stored as plain Markdown-like text

**Location**
- `src/data/curriculum/grade_3/unit_01_place_value_foundations.json`, lines 45–58

**Current content**
- `In 45__6__, what is the value of the underlined digit?`
- `In __3__72, what is the value of the underlined digit?`

**Why this fails**
The React screen renders the prompt as ordinary text. Double underscores are not interpreted as an underline, so they appear as two underscore runs. In the first question, they surround the digit `6`, but the answer and hint refer to the digit `4`. The display, wording, correct answer, and hint therefore disagree.

**Recommended standard**
Store structured data instead of formatting inside a string:

```ts
{
  number: "456",
  targetDigitIndex: 0,
  prompt: "What is the value of the bold digit?",
  correctAnswer: "400"
}
```

Render exactly one target digit using bold weight plus a non-color-only visual treatment, such as a rounded outline or background.

### 2. Critical: singular wording conflicts with the visual cue

The prompt says `the underlined digit`, singular, while the UI displays two underscore groups. Even if those underscores were intended as markup delimiters, the child sees two marked areas.

**Recommended wording**
- `What is the value of the bold digit?`

Use the same phrase throughout the app.

### 3. High: answer validation is exact-string-only

**Location**
- `src/screens/WarmUpScreen.tsx`, lines 15–16 and 143–144

The normalizer removes spaces and lowercases text, but does not handle commas or equivalent numerical forms. For example, `3,000` will be marked wrong when the stored answer is `3000`.

**Recommendation**
For numeric questions, normalize commas and parse the input as a number. Keep text normalization separate for vocabulary questions.

### 4. High: the same outdated “underlined digit” convention appears in practice instructions

**Location**
- `src/data/curriculum/grade_3/unit_01_place_value_foundations.json`, line 101
- `src/data/curriculum/grade_3/unit_02_numbers_through_100000.json`, place-value warm-up and practice content

This is not a one-question typo. It is a curriculum-wide content convention that needs a structured rendering rule.

### 5. High: Unit 2 contains an additional ambiguous plural target

**Location**
- `src/data/curriculum/grade_3/unit_02_numbers_through_100000.json`

Current prompt:
- `In 23__,456__, what is the value of the underlined digits?`

This appears to mark `456` as a group rather than one digit, but place-value questions normally require one target digit. The content needs human review, not just a renderer fix.

### 6. High: instructional screens still contain extensive mascot/reward language

Examples found in the uploaded archive:
- `WarmUpScreen.tsx`: `Luma Charge`, `Power up your star`, `Star Power`, `sparkle energy`
- `QuickCheckPage.tsx`: `Luma Boost`, `Boost charge`, `fully boosted`, mascot tip panel
- Learn subpages: mascot imports and named mascot-tip cards

This conflicts with the newly agreed direction: mascot on Home, celebrations, and rewards, but not competing with instruction.

### 7. Medium: place-value wording is inconsistent

Within Unit 1, the app asks:
- `What is the value of...`
- `What does the digit 3 stand for?`
- `What does the 7 represent?`
- `Name the value...`

**Recommended standard**
For digit-value tasks, use:
- `What is the value of the bold digit?`

For place-name tasks, use:
- `What place is the bold digit in?`

Do not mix `stand for`, `represent`, `place value`, and `value` unless the lesson explicitly teaches those distinctions.

### 8. Medium: blank notation and emphasis notation share the same characters

The curriculum uses `__` both for blanks, such as `30, 40, 50, __`, and as attempted emphasis markup, such as `45__6__`. This makes automated validation unreliable and invites future rendering errors.

**Recommendation**
Represent blanks and target digits as separate question types with structured fields.

## Immediate implementation priorities

1. Add a structured `target_digit` question format.
2. Replace Unit 1 and Unit 2 place-value prompts with structured data.
3. Render one bold target digit with an additional shape/outline cue.
4. Standardize the prompt to `What is the value of the bold digit?`
5. Separate numeric and text answer normalization.
6. Add curriculum validation that rejects `__digit__` formatting in prompts.

