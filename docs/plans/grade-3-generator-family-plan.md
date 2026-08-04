# Grade 3 Generator-Family Plan

A research and architecture plan for transforming the 144 regular Grade 3 lessons from a mostly static, fallback-driven practice system into a small set of reusable, curriculum-driven, randomized generator families.

## 1. Executive Summary

- The Grade 3 curriculum contains **36 units**, **144 regular lessons**, and **36 evaluations**.
- There are **143 unique `practice_type` values** used by regular lessons.
- Only **4 practice types** currently use a specialized generator (`equal_groups`, `repeated_addition_to_multiplication`, `factor_product_identification`, `equal_groups_with_objects`); the other **139** rely on `generateDefaultPracticeProblems`.
- The default generator cycles a lesson’s authored Warm-Up and Try It prompts. Most lessons therefore produce **repetitive questions with identical text but different `problemKey` suffixes**.
- This plan proposes **15 mathematically coherent generator families** that map all 144 regular lessons to about 15 reusable domain generators.
- Configuration is recommended as a **centralized TypeScript family-config registry** keyed by `practice_type`, with optional curriculum-JSON overrides for future content authors.
- The first implementation wave targets the four operations and multiplication/division foundations, covering **68 lessons**.

## 2. Exact Inventory Totals

| metric                          | value |
| ------------------------------- | ----- |
| Grade 3 units                   | 36    |
| Regular lessons                 | 144   |
| Evaluation lessons              | 36    |
| Unique practice_type values     | 143   |
| Specialized practice types      | 4     |
| Alias-resolved types (regular)  | 0     |
| Default-generator types         | 139   |
| Weak/unsafe fallbacks (E, F, G) | 139   |

## 3. Current Coverage Matrix

### 3.1 Class definitions

- **A** — Specialized and sufficiently varied: a dedicated generator with a bank or algorithm producing many distinct, mathematically varied questions.
- **B** — Specialized but narrow: a dedicated generator, but its mathematical range is intentionally small (e.g., only ×0 and ×1 cases).
- **C** — Alias to a suitable specialized generator: resolved through a semantic alias map.
- **D** — Default-generated but mathematically trustworthy: authored Warm-Up/Try It prompts map well to the skill and are numerous enough to avoid repetition.
- **E** — Default-generated but repetitive: the same prompt text is reused across the session; only the key index changes.
- **F** — Default-generated with weak lesson alignment: authored prompts do not clearly match the `practice_type`.
- **G** — Unsupported or unsafe: generator returns empty or throws.

### 3.2 Class counts

| class | count | meaning                          |
| ----- | ----- | -------------------------------- |
| A     | 3     | specialized, sufficiently varied |
| B     | 1     | specialized, narrow              |
| C     | 0     | alias-resolved                   |
| D     | 0     | default, trustworthy             |
| E     | 139   | default, repetitive              |
| F     | 0     | default, weak alignment          |
| G     | 0     | unsupported/unsafe               |

### 3.3 Current weaknesses

- The default generator **repeats the same prompt text** (class E for the vast majority of types).
- It **depends only on authored Warm-Up and Try It prompts** and does not vary numbers, contexts, or visual arrangements.
- It **lacks mode-specific difficulty**: all modes currently return the same authored prompts, so Guided/Independent/Challenge differ only in the surrounding UI, not in problem generation.
- It **produces fragile answer choices** for `multiple_choice`: the current `buildAnswerChoices` helper creates distractors from `{0, 1, correct}`, which is easily gameable.
- It **cannot produce large enough evaluation pools**: with at most 4–5 unique prompt texts, an evaluation with 8–10 questions must either repeat or fail.

## 4. Proposed Generator Families (Overview)

The 144 regular lessons map to **15 families**. Families are grouped by mathematical operation or representation, not by curriculum unit.

| family                                 | lessons | practice types | units              |
| -------------------------------------- | ------- | -------------- | ------------------ |
| Place Value, Number Sense, & Rounding  | 12      | 12             | 2, 3, 11           |
| Addition                               | 8       | 8              | 4, 5               |
| Subtraction                            | 8       | 8              | 6, 7               |
| Add/Subtract Word Problems & Reasoning | 5       | 5              | 8, 36              |
| Multiplication Foundations             | 12      | 11             | 1, 9, 10           |
| Multiplication Facts & Properties      | 15      | 15             | 12, 15, 16, 17, 19 |
| Division Foundations                   | 13      | 13             | 13, 14, 15, 16, 17 |
| Mult/Div Word Problems & Equations     | 4       | 4              | 18                 |
| Fractions Foundations                  | 8       | 8              | 26, 27             |
| Fractions Equivalence & Number Line    | 12      | 12             | 28, 29, 30         |
| Comparing Fractions                    | 8       | 8              | 31, 32             |
| Geometry & Attributes                  | 4       | 4              | 33                 |
| Area & Perimeter                       | 20      | 20             | 20, 21, 22, 23, 24 |
| Data & Graphs                          | 5       | 5              | 25, 34             |
| Measurement & Time                     | 10      | 10             | 34, 35, 36         |

## 5. Family Specifications

### Place Value, Number Sense, & Rounding

**Mathematical scope:** Reading, writing, expanding, comparing, and rounding whole numbers through 100,000 using base-ten language.

**Included practice types (12):** large_digit_value, reading_large_numbers, expanded_form_large, place_value_puzzles, round_ten, round_hundred, round_place_value, estimate_reasonable, place_value_digits, base_ten_models, expanded_form, number_words

**Excluded nearby practice types:** Multiplication place-value patterns

**Supported practice modes:** Guided/Independent: identify, write, expand, round. Challenge: place-value puzzles and error analysis.

**Expected question templates:**

- What is the value of the {place} digit in {number}?
- Write {number} in expanded form.
- Round {number} to the nearest {ten/hundred/thousand}.
- Which number matches {word form}?

**Required answer contract:** Numeric or short text (digit value, expanded form, rounded number).

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** place_value_chart (optional, for guided)

**Randomizable dimensions:** digit count, target digit position, number magnitude, rounding target

**Difficulty parameters:** digitCount, includeNumbersTo100000, roundingTarget

**Uniqueness strategy:** problemKey = `${family}-{number}-{targetDigit|roundingTarget}-{mode}`

**Validation rules:**

- target digit index is in range
- rounded result is correct
- expanded form sum matches

**Coverage matrix for this family:**

| practice_type         | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| --------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| large_digit_value     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| reading_large_numbers | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| expanded_form_large   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| place_value_puzzles   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| round_ten             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| round_hundred         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| round_place_value     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| estimate_reasonable   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| place_value_digits    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| base_ten_models       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| expanded_form         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| number_words          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Addition

**Mathematical scope:** Two- and three-digit addition with and without regrouping, expanded-form, compensation, and three-addend addition.

**Included practice types (8):** addition_number_line, addition_expanded_form, addition_compensation, addition_no_regroup, addition_regroup_ones, addition_regroup_tens, addition_three_numbers, missing_digits_properties

**Excluded nearby practice types:** Addition word problems

**Supported practice modes:** Guided: with number-line or expanded-form scaffold. Independent: bare equations. Challenge: missing digits and property reasoning.

**Expected question templates:**

- {a} + {b} = ?
- Add using expanded form: {a} + {b}.
- Add with compensation: {a} + {b} = {a}+{} + {b}-{}
- Find the missing digit: {a_} + {b} = {c}

**Required answer contract:** Numeric sum; missing-digit answers are single digits or sums.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** stacked_vertical_input (optional)

**Randomizable dimensions:** operand range, regrouping flag, compensation offset, missing digit position

**Difficulty parameters:** operandRange, regrouping, addendCount, includeCompensation, includeMissingDigits

**Uniqueness strategy:** problemKey = `${family}-{a}-{b}-{template}`

**Validation rules:**

- sum is exact
- regrouping flag matches
- missing digit makes equation true

**Coverage matrix for this family:**

| practice_type             | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| addition_number_line      | 1            | 1          | addition           | multiple_choice | A     | randomized, mode-aware, no regrouping  |
| addition_expanded_form    | 1            | 1          | addition           | multiple_choice | A     | randomized, mode-aware, no regrouping  |
| addition_compensation     | 1            | 1          | addition           | multiple_choice | A     | randomized compensation addends        |
| addition_no_regroup       | 1            | 1          | addition           | multiple_choice | A     | randomized, includes word problems     |
| addition_regroup_ones     | 1            | 1          | addition           | multiple_choice | A     | randomized, requires ones regrouping   |
| addition_regroup_tens     | 1            | 1          | addition           | multiple_choice | A     | randomized, requires tens regrouping   |
| addition_three_numbers    | 1            | 1          | addition           | multiple_choice | A     | randomized three-addend addition       |
| missing_digits_properties | 1            | 1          | addition           | multiple_choice | A     | missing digits / properties / error id |

**Implementation status:** Implemented in `src/practiceTypes/addition.ts` and registered in `src/practiceTypes/registry.ts`. All eight Addition practice types now route through `generateAdditionProblems`. Coverage moved from 5 family-backed / 139 default-backed Grade 3 regular lessons to **13 family-backed / 131 default-backed**.

**Session-seed contract:** The generator accepts `options.seed` and is fully deterministic for a provided seed. `createPracticeSessionSeed` in `src/practiceTypes/random.ts` is the integration contract for `PracticeScreen` (owned by ChatGPT): create one seed per mounted lesson/mode session, retain it in component state or a ref, and pass it as `options.seed` on every render. If `options.seed` is omitted, `generateAdditionProblems` falls back to a deterministic key derived from `lessonId`, `practiceType`, and `mode` with no timestamps, `Math.random`, or global mutable state; repeated sessions with an omitted seed are therefore identical. To vary a newly started session, the UI must provide a fresh `sessionId` to `createPracticeSessionSeed`.

Next family to implement: **Subtraction**.

### Subtraction

**Mathematical scope:** Two- and three-digit subtraction with and without regrouping, including across zeros.

**Included practice types (8):** subtraction_number_line, subtraction_expanded_form, subtraction_compensation, subtraction_no_regroup, subtraction_regroup_ones, subtraction_regroup_tens, subtract_across_zeros, subtraction_missing_digits

**Excluded nearby practice types:** Subtraction word problems

**Supported practice modes:** Guided: number-line scaffold. Independent: bare equations. Challenge: missing-digit balanced equations.

**Expected question templates:**

- {a} - {b} = ?
- Subtract with expanded form.
- Subtract across zeros: {a} - {b}.
- Find the missing digit.

**Required answer contract:** Numeric difference; missing-digit answers are single digits.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** stacked_vertical_input (optional)

**Randomizable dimensions:** operand range, regrouping flag, acrossZeros

**Difficulty parameters:** operandRange, regrouping, includeAcrossZeros, includeMissingDigits

**Uniqueness strategy:** problemKey = `${family}-{a}-{b}-{template}`

**Validation rules:**

- difference is exact
- minuend >= subtrahend
- missing digit makes equation true

**Coverage matrix for this family:**

| practice_type              | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| -------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| subtraction_number_line    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_expanded_form  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_compensation   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_no_regroup     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_regroup_ones   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_regroup_tens   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtract_across_zeros      | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| subtraction_missing_digits | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Add/Subtract Word Problems & Reasoning

**Mathematical scope:** One- and two-step additive word problems, operation choice, estimate-then-solve, and equations with unknowns.

**Included practice types (5):** choose_operation, estimate_then_solve, one_step_word_problems, two_step_unknowns, two_step_measurement_equations

**Excluded nearby practice types:** Bare addition/subtraction computation

**Supported practice modes:** Guided: operation clue highlighted. Independent: bare word problem. Challenge: two-step with hidden information or reasonableness check.

**Expected question templates:**

- {context}: {a} + {b} = ?
- {context}: {a} - {b} = ?
- Should you add or subtract?
- Estimate first, then solve: ...

**Required answer contract:** Numeric answer; some questions ask for the operation or an estimate.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** word_problem_card

**Randomizable dimensions:** context names, numbers, operation, unknown position

**Difficulty parameters:** maxValue, stepCount, includeEstimate, unknownPosition

**Uniqueness strategy:** problemKey = `${family}-{contextHash}-{a}-{b}-{operation}`

**Validation rules:**

- word-problem answer matches model equation
- reasonableness bounds are not violated

**Coverage matrix for this family:**

| practice_type                  | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------ | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| choose_operation               | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| estimate_then_solve            | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| one_step_word_problems         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| two_step_unknowns              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| two_step_measurement_equations | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Multiplication Foundations

**Mathematical scope:** Equal groups, repeated addition, factors/products, arrays, and the commutative property.

**Included practice types (11):** equal_groups, repeated_addition_to_multiplication, factor_product_identification, equal_groups_with_objects, count_equal_groups, factors_and_products, draw_multiplication, build_arrays, two_equations_for_array, multiplication_number_line, connect_models_equations_stories

**Excluded nearby practice types:** Fact fluency

**Supported practice modes:** Guided: visual equal-groups or arrays. Independent: equation or repeated-addition prompt. Challenge: mistake check on ×0/×1 or array commutativity.

**Expected question templates:**

- {groups} groups of {items}: total?
- Repeated addition: {a}+{a}+... = ? as {groups}×{a}
- In {a} × {b} = {product}, name factors and product.
- Write two equations for the array {rows}×{columns}.

**Required answer contract:** Numeric total, factor product tuple, or equation string.

**Supported existing visual types:** equal_groups, repeated_addition, factor_product, array_rows_columns, multiple_choice

**New UI needs (ChatGPT):** interactive_array_grid (optional)

**Randomizable dimensions:** group count, items per group, object name, factor order

**Difficulty parameters:** maxFactor, includeZeroOne, includeCommutative, includeArrays

**Uniqueness strategy:** problemKey includes (groups, items, template) and ignores object name.

**Validation rules:**

- product is exact
- factor/product labels are correct
- equations are commutative pairs

**Coverage matrix for this family:**

| practice_type                       | lesson_count | unit_count | current_resolution | visual_type       | class | notes                                  |
| ----------------------------------- | ------------ | ---------- | ------------------ | ----------------- | ----- | -------------------------------------- |
| equal_groups                        | 1            | 1          | specialized        | equal_groups      | B     | specialized but narrow (×0 and ×1)     |
| repeated_addition_to_multiplication | 2            | 2          | specialized        | repeated_addition | A     | specialized with varied bank           |
| factor_product_identification       | 1            | 1          | specialized        | factor_product    | A     | specialized with varied bank           |
| equal_groups_with_objects           | 1            | 1          | specialized        | equal_groups      | A     | specialized with varied bank           |
| count_equal_groups                  | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| factors_and_products                | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| draw_multiplication                 | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| build_arrays                        | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| two_equations_for_array             | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiplication_number_line          | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| connect_models_equations_stories    | 1            | 1          | default            | multiple_choice   | E     | cycles a small set of authored prompts |

### Multiplication Facts & Properties

**Mathematical scope:** Specific ×3–×9 facts, mixed practice, missing factors, properties, and multiples of ten.

**Included practice types (15):** multiply_by_3, multiply_by_4, commutative_multiplication, associative_multiplication, multiply_by_6, multiply_by_7, multiply_by_8, multiply_by_9, mixed_multiplication_facts, missing_factors, choose_strategy, multiples_of_ten_basic_facts, one_digit_by_multiples_of_ten, multiples_of_ten_word_problems, place_value_patterns

**Excluded nearby practice types:** Division facts

**Supported practice modes:** Guided: fact family or pattern. Independent: bare equation. Challenge: missing-factor or multi-step pattern.

**Expected question templates:**

- {a} × {b} = ?
- {a} × ? = {product}
- Use the commutative/associative property.
- {a} × {multiple of ten} = ?

**Required answer contract:** Numeric product or missing factor.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** fact_family_triangle (optional)

**Randomizable dimensions:** factor, factor order, missing position, multiple-of-ten power

**Difficulty parameters:** factRange, includeMissingFactor, includeProperties, includeMultiplesOfTen

**Uniqueness strategy:** problemKey = `${family}-{a}-{b}-{missingPosition}`

**Validation rules:**

- product exact
- missing factor is integer factor of product

**Coverage matrix for this family:**

| practice_type                  | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------ | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| multiply_by_3                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiply_by_4                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| commutative_multiplication     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| associative_multiplication     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiply_by_6                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiply_by_7                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiply_by_8                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiply_by_9                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| mixed_multiplication_facts     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| missing_factors                | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| choose_strategy                | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiples_of_ten_basic_facts   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| one_digit_by_multiples_of_ten  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiples_of_ten_word_problems | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| place_value_patterns           | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Division Foundations

**Mathematical scope:** Fair sharing, counting groups, arrays, number-line jumps, fact families, and ÷6–÷9 facts.

**Included practice types (13):** division_sharing, division_counting_groups, write_division_equations, division_with_1_and_0, division_arrays, division_number_line, fact_families, multiplication_for_division, divide_by_6, divide_by_7, divide_by_8, divide_by_9, missing_numbers_division

**Excluded nearby practice types:** Multiplication

**Supported practice modes:** Guided: fair-sharing visual. Independent: bare division. Challenge: missing-number or fact-family reasoning.

**Expected question templates:**

- Share {items} equally among {groups}.
- How many groups of {size} are in {total}?
- {a} ÷ {b} = ?
- Find the missing number: {a} ÷ ? = {c}

**Required answer contract:** Numeric quotient; missing divisor/dividend.

**Supported existing visual types:** fair_sharing, multiple_choice

**New UI needs (ChatGPT):** number_line_jumps (for division on a number line)

**Randomizable dimensions:** total, groups, group size, fact family triplet

**Difficulty parameters:** divisorRange, includeRemainders, includeFactFamilies, includeMissingNumbers

**Uniqueness strategy:** problemKey = `${family}-{total}-{groups}-{template}`

**Validation rules:**

- quotient exact
- dividend = divisor × quotient
- no remainder unless allowed

**Coverage matrix for this family:**

| practice_type               | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| --------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| division_sharing            | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| division_counting_groups    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| write_division_equations    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| division_with_1_and_0       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| division_arrays             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| division_number_line        | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| fact_families               | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| multiplication_for_division | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| divide_by_6                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| divide_by_7                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| divide_by_8                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| divide_by_9                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| missing_numbers_division    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Mult/Div Word Problems & Equations

**Mathematical scope:** Equal-group/array word problems, strip diagrams, equations with unknowns, and two-step patterns.

**Included practice types (4):** equal_group_array_problems, strip_models, equations_with_unknowns, two_step_mult_div_patterns

**Excluded nearby practice types:** Pure computation

**Supported practice modes:** Guided: labeled strip model. Independent: bare problem. Challenge: two-step with hidden unknown.

**Expected question templates:**

- {context}: {groups} groups of {size}.
- Strip model: total = ?
- {a} × {b} + {c} = ?
- Solve for the unknown: ...

**Required answer contract:** Numeric answer or equation value.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** strip_model_renderer (ChatGPT)

**Randomizable dimensions:** context, group size, groups, operation order, unknown position

**Difficulty parameters:** stepCount, includeTwoStep, unknownPosition

**Uniqueness strategy:** problemKey = `${family}-{contextHash}-{a}-{b}-{c}-{template}`

**Validation rules:**

- model equation matches word problem
- answer is exact integer

**Coverage matrix for this family:**

| practice_type              | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| -------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| equal_group_array_problems | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| strip_models               | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| equations_with_unknowns    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| two_step_mult_div_patterns | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Fractions Foundations

**Mathematical scope:** Equal/unequal parts, unit fractions, numerators, denominators, halves through eighths.

**Included practice types (8):** equal_unequal_parts, halves_thirds_fourths, sixths_eighths, name_unit_fractions, numerator_meaning, denominator_meaning, fraction_bars, area_models_and_stories

**Excluded nearby practice types:** Equivalence, comparison, number line

**Supported practice modes:** Guided: shaded shape prompt. Independent: name/identify. Challenge: explain why a partition is or is not a fraction.

**Expected question templates:**

- What fraction is shaded?
- Name the unit fraction for {shape}.
- How many {parts} make a whole?
- What does the numerator/denominator mean?

**Required answer contract:** Fraction string or numeric denominator/numerator.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** fraction_shape_shading (ChatGPT), fraction_bar_renderer (ChatGPT)

**Randomizable dimensions:** shape type, total parts, shaded parts, denominator set

**Difficulty parameters:** denominators, includeUnequal, includeNumeratorMeaning

**Uniqueness strategy:** problemKey = `${family}-{denominator}-{shaded}-{shape}-{template}`

**Validation rules:**

- fraction is proper
- shaded <= total
- denominator in allowed set

**Coverage matrix for this family:**

| practice_type           | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ----------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| equal_unequal_parts     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| halves_thirds_fourths   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| sixths_eighths          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| name_unit_fractions     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| numerator_meaning       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| denominator_meaning     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| fraction_bars           | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| area_models_and_stories | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Fractions Equivalence & Number Line

**Mathematical scope:** Equivalent fractions using models, number lines, and equations; locating fractions.

**Included practice types (12):** zero_to_one_interval, partition_number_lines, locate_unit_fractions_number_line, locate_non_unit_fractions_number_line, equivalence_same_amount, fraction_strips_equivalence, area_models_equivalence, generate_explain_equivalent, same_location_number_line, find_equivalents_number_line, graph_equivalent_fractions, connect_models_number_lines_equations

**Excluded nearby practice types:** Comparing fractions

**Supported practice modes:** Guided: matching models. Independent: generate equivalent fraction. Challenge: find all equivalents in a range.

**Expected question templates:**

- Find an equivalent fraction for {a}/{b}.
- Locate {a}/{b} on the number line.
- Shade the same amount with {denominator} parts.

**Required answer contract:** Equivalent fraction string or number-line point.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** number_line_fractions (ChatGPT), fraction_strip_visual (ChatGPT)

**Randomizable dimensions:** fraction, equivalent denominator, number line ticks

**Difficulty parameters:** denominators, includeNumberLine, includeGenerate

**Uniqueness strategy:** problemKey = `${family}-{a}-{b}-{targetDenominator}-{template}`

**Validation rules:**

- equivalent fractions have equal value
- locate is within [0,1]

**Coverage matrix for this family:**

| practice_type                         | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| zero_to_one_interval                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| partition_number_lines                | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| locate_unit_fractions_number_line     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| locate_non_unit_fractions_number_line | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| equivalence_same_amount               | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| fraction_strips_equivalence           | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| area_models_equivalence               | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| generate_explain_equivalent           | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| same_location_number_line             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| find_equivalents_number_line          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| graph_equivalent_fractions            | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| connect_models_number_lines_equations | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Comparing Fractions

**Mathematical scope:** Compare fractions with like denominators, like numerators, and same whole.

**Included practice types (8):** compare_like_denominators_models, compare_like_denominators_number_line, use_comparison_symbols, comparison_word_problems_like_denominators, compare_like_numerators_models, compare_like_numerators_number_line, same_whole_fractions, compare_explain_fractions

**Excluded nearby practice types:** Equivalence generation

**Supported practice modes:** Guided: visual model comparison. Independent: symbol choice. Challenge: justify with same-whole reasoning.

**Expected question templates:**

- Compare {a}/{b} and {c}/{b}.
- Use <, =, or >.
- Which is greater: {a}/{b} or {a}/{d}?
- Explain: why must the wholes be the same?

**Required answer contract:** Comparison symbol or explanation choice.

**Supported existing visual types:** multiple_choice, mistake_check

**New UI needs (ChatGPT):** fraction_comparison_model (optional)

**Randomizable dimensions:** fractions, denominator/numerator relationship, same-whole flag

**Difficulty parameters:** denominators, compareLikeDenominators, compareLikeNumerators, includeExplain

**Uniqueness strategy:** problemKey = `${family}-{a}-{b}-{c}-{d}-{template}`

**Validation rules:**

- comparison matches cross-multiplication/value
- same-whole reasoning is valid

**Coverage matrix for this family:**

| practice_type                              | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------------------ | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| compare_like_denominators_models           | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| compare_like_denominators_number_line      | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| use_comparison_symbols                     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| comparison_word_problems_like_denominators | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| compare_like_numerators_models             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| compare_like_numerators_number_line        | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| same_whole_fractions                       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| compare_explain_fractions                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Geometry & Attributes

**Mathematical scope:** Sides, vertices, parallel sides, quadrilaterals, squares, rectangles, rhombuses, parallelograms, trapezoids.

**Included practice types (4):** sides_and_vertices, parallel_sides_quadrilaterals, classify_squares_rectangles_rhombuses, parallelograms_trapezoids

**Excluded nearby practice types:** Area/perimeter

**Supported practice modes:** Guided: attribute checklist. Independent: classify. Challenge: non-example reasoning.

**Expected question templates:**

- How many sides/vertices?
- Does this shape have parallel sides?
- Classify the quadrilateral.
- Which shape is not a {category}?

**Required answer contract:** Text category or count.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** shape_diagram_renderer (ChatGPT)

**Randomizable dimensions:** shape type, attribute queried, distractor set

**Difficulty parameters:** shapeSet, includeParallelSides, includeHierarchy

**Uniqueness strategy:** problemKey = `${family}-{shape}-{attribute}`

**Validation rules:**

- answer matches shape definition

**Coverage matrix for this family:**

| practice_type                         | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| sides_and_vertices                    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| parallel_sides_quadrilaterals         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| classify_squares_rectangles_rhombuses | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| parallelograms_trapezoids             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Area & Perimeter

**Mathematical scope:** Counting unit squares, rectangle area, distributive decomposition, perimeter, missing side, same-area/perimeter comparisons.

**Included practice types (20):** area_introduction, cover_with_unit_squares, count_and_label_area, hidden_squares_area, tile_rectangles, rows_columns_multiplication, area_rectangles_squares, area_word_problems, create_rectangles_area, different_arrangements_same_area, missing_side_length, distributive_property_area, perimeter_introduction, perimeter_on_grids, perimeter_rectangles_quadrilaterals, missing_side_perimeter, same_perimeter_different_area, same_area_different_perimeter, find_area_perimeter_missing_side, area_perimeter_word_problems

**Excluded nearby practice types:** Volume

**Supported practice modes:** Guided: grid with unit squares. Independent: formula. Challenge: find different arrangements or missing side.

**Expected question templates:**

- Find the area of the rectangle ({l} × {w}).
- Cover the figure with unit squares.
- Find the perimeter.
- Find the missing side: area {a}, side {s}.

**Required answer contract:** Numeric area or perimeter.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** grid_rectangle (ChatGPT), decomposed_rectangle (ChatGPT)

**Randomizable dimensions:** length, width, side set, decomposition split

**Difficulty parameters:** maxSide, includeMissingSide, includeDistributive, includeComparison

**Uniqueness strategy:** problemKey = `${family}-{l}-{w}-{template}`

**Validation rules:**

- area = l × w
- perimeter = 2(l+w)
- missing side is positive integer

**Coverage matrix for this family:**

| practice_type                       | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ----------------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| area_introduction                   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| cover_with_unit_squares             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| count_and_label_area                | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| hidden_squares_area                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| tile_rectangles                     | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| rows_columns_multiplication         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| area_rectangles_squares             | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| area_word_problems                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| create_rectangles_area              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| different_arrangements_same_area    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| missing_side_length                 | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| distributive_property_area          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| perimeter_introduction              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| perimeter_on_grids                  | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| perimeter_rectangles_quadrilaterals | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| missing_side_perimeter              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| same_perimeter_different_area       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| same_area_different_perimeter       | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| find_area_perimeter_missing_side    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| area_perimeter_word_problems        | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Data & Graphs

**Mathematical scope:** Picture graphs, bar graphs, scaled keys, one- and two-step questions, line plots.

**Included practice types (5):** read_picture_graphs, create_picture_graphs, read_bar_graphs, create_graphs_solve_problems, line_plots

**Excluded nearby practice types:** Measurement

**Supported practice modes:** Guided: read graph with hint. Independent: read and compute. Challenge: two-step question or create a graph.

**Expected question templates:**

- How many in category {c}?
- How many more {a} than {b}?
- What does the scaled key mean?
- Create a graph from the table.

**Required answer contract:** Numeric count or comparison.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** bar_graph_renderer (ChatGPT), picture_graph_renderer (ChatGPT), line_plot_renderer (ChatGPT)

**Randomizable dimensions:** data set, scale factor, categories, two-step operation

**Difficulty parameters:** scaleFactor, categoryCount, includeTwoStep, includeCreate

**Uniqueness strategy:** problemKey = `${family}-{dataHash}-{questionTemplate}`

**Validation rules:**

- computed value matches data set
- scale applied correctly

**Coverage matrix for this family:**

| practice_type                | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ---------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| read_picture_graphs          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| create_picture_graphs        | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| read_bar_graphs              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| create_graphs_solve_problems | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| line_plots                   | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

### Measurement & Time

**Mathematical scope:** Length, weight, mass, volume unit choice, quarter-inch measurement, elapsed time, time formats, measurement word problems.

**Included practice types (10):** customary_length_units, quarter_inch_measurement, choose_weight_mass_volume_units, read_analog_clocks, match_time_formats, estimate_time_intervals, elapsed_time, measurement_problems, mixed_measurement_problems, estimate_reasonableness

**Excluded nearby practice types:** Data graphs

**Supported practice modes:** Guided: unit choice with hint. Independent: measure/convert. Challenge: two-step measurement equation.

**Expected question templates:**

- Choose the unit: length of a {object}.
- Measure to the nearest quarter inch.
- What time is shown on the analog clock?
- Elapsed time from {start} to {end}.

**Required answer contract:** Text unit, numeric measurement, or time string.

**Supported existing visual types:** multiple_choice

**New UI needs (ChatGPT):** analog_clock (ChatGPT), ruler (ChatGPT), unit_selector (ChatGPT)

**Randomizable dimensions:** object, measurement value, start/end time, operation

**Difficulty parameters:** unitSet, includeElapsedTime, includeTwoStep

**Uniqueness strategy:** problemKey = `${family}-{measurement}-{template}`

**Validation rules:**

- unit is dimensionally correct
- elapsed time difference is exact

**Coverage matrix for this family:**

| practice_type                   | lesson_count | unit_count | current_resolution | visual_type     | class | notes                                  |
| ------------------------------- | ------------ | ---------- | ------------------ | --------------- | ----- | -------------------------------------- |
| customary_length_units          | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| quarter_inch_measurement        | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| choose_weight_mass_volume_units | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| read_analog_clocks              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| match_time_formats              | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| estimate_time_intervals         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| elapsed_time                    | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| measurement_problems            | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| mixed_measurement_problems      | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |
| estimate_reasonableness         | 1            | 1          | default            | multiple_choice | E     | cycles a small set of authored prompts |

## 6. Configuration Contract

### 6.1 Ownership

A **centralized family-configuration registry** is recommended over placing generator parameters inside every curriculum JSON file. Rationale:

- Most configuration is a software concern (number ranges, regrouping, template choices, difficulty scaling).
- A typed registry is version-controlled, testable, and refactorable.
- Curriculum authors should only declare the skill they are teaching, not the algorithm that generates questions.
- Curriculum JSON may still carry an optional `generator_config` override field for experimental or exceptional lessons, but the canonical mapping lives in code.

### 6.2 Proposed TypeScript contract

```ts
export type GeneratorFamilyConfig = {
  family: string;
  operandRange?: { min: number; max: number };
  digitCount?: number;
  regrouping?: "none" | "required" | "mixed";
  denominators?: number[];
  factRange?: { min: number; max: number };
  missingValuePositions?: ("start" | "middle" | "end")[];
  representations?: ("equation" | "number_line" | "array" | "area_model" | "strip_model")[];
  includeWordProblems?: boolean;
  includeVisualModels?: boolean;
  includeTwoStep?: boolean;
  includeExplanation?: boolean;
  difficulty: {
    guided: DifficultyProfile;
    independent: DifficultyProfile;
    challenge: DifficultyProfile;
  };
};

export type DifficultyProfile = {
  operandRange?: { min: number; max: number };
  maxSteps?: number;
  includeScaffold?: boolean;
};
```

### 6.3 Binding `practice_type` to config

A single exported map in `src/practiceTypes/familyConfigs.ts` binds every `practice_type` to its `GeneratorFamilyConfig`. Example:

```ts
export const familyConfigByPracticeType: Record<string, GeneratorFamilyConfig> = {
  addition_regroup_ones: additionFamily({ regrouping: "required", regroupPlace: "ones" }),
  addition_regroup_tens: additionFamily({ regrouping: "required", regroupPlace: "tens" }),
  // ...
};
```

## 7. Mode-Specific Behavior

### Generic mode rules

- **Guided**: smaller or friendlier numbers, an optional visual scaffold, hints, and direct wording.
- **Independent**: broader numeric range, no answer-revealing visual, more concise wording.
- **Challenge**: missing values, error analysis, multi-step or comparison, explanation choices.

### Per-family mode notes

See Section 5 family specifications. In general:

- Place-value and operations families use smaller ranges in Guided and larger, less scaffolded values in Independent.
- Fraction and geometry families use visual models in Guided and symbolic/numeric forms in Independent.
- Challenge for operations focuses on missing digits, balanced equations, and reasonableness; for geometry/fractions it focuses on explanation and non-examples.

## 8. Randomization and Determinism Strategy

### 8.1 PRNG

Use a small, deterministic seeded PRNG (e.g., mulberry32). The generator is seeded per **session** using a value supplied by the caller. This allows:

- Different questions across sessions.
- Repeatable tests and debugging when a fixed seed is supplied.
- Stable problem keys that do not depend on `Date.now()`.

### 8.2 Seed input

```
seed = hash(sessionSeed, lessonId, mode, templateId, attemptNumber?)
```

- `sessionSeed`: a stable value for the current practice session (e.g., from the UI or a daily seed).
- `lessonId`: ensures the same session seed produces different lessons.
- `mode`: ensures different modes produce different problems.
- `templateId`: ensures different templates within the same problem draw different random parameters.

### 8.3 Problem-key construction

```
problemKey = `${family}:${lessonId}:${mode}:${templateId}:${paramHash}`
```

- `paramHash` is a stable hash of the mathematical parameters (e.g., `{a, b, missingPosition}`).
- Object names, pronouns, and other non-mathematical wording do **not** affect the key.
- For `multiple_choice`, the key does **not** include answer-choice order.

### 8.4 Duplicate prevention

- The generator keeps a session-local set of generated `problemKey` values.
- If a candidate collides, it draws the next random value for the same template.
- If a template is exhausted, the generator advances to the next template.
- Identical math with different contexts must produce the same key (and therefore count as a duplicate), preventing shallow uniqueness.

## 9. Question-Volume Requirements

### 9.1 Recommended minimums per session

| mode        | questions | unique text minimum | unique key minimum |
| ----------- | --------- | ------------------- | ------------------ |
| Guided      | 6–8       | 6                   | 6                  |
| Independent | 8–10      | 8                   | 8                  |
| Challenge   | 5–8       | 5                   | 5                  |

### 9.2 Evaluation pool depth

- Each review type needs a pool **at least 2× the requested count**.
- The 36 evaluations currently require 8–10 questions. Pool sizes should be **≥ 20** per review type per family.

### 9.3 Family-wide capacity

- Each family must support at least **3 distinct templates** and **50 numeric/parameter combinations** per template.
- This yields a safe pool of **≥ 150 distinct problems** per family, sufficient for regular practice and evaluation review.

## 10. Answer and Problem Contract

The existing `PracticeProblem` contract is sufficient for the first wave, with the following clarifications:

```ts
export type PracticeProblem = {
  id: string;
  questionText: string;
  correctAnswer: string;
  visualType: VisualType;
  problemKey: string;
  visualData?: { ... };
  answerData?: { ... };
  challengeData?: { ... };
};
```

- `correctAnswer` should remain a string; numeric answers are stringified.
- `answerData` is used for multi-part inputs (factor_product, array_rows_columns).
- `challengeData` is used for mistake-check problems.
- New visual types should be added only after ChatGPT implements the corresponding UI renderer.

### Per-family answer types

| family                                 | answer type                       |
| -------------------------------------- | --------------------------------- |
| Place Value, Number Sense, & Rounding  | numeric / short text              |
| Addition / Subtraction / Word Problems | numeric                           |
| Multiplication Foundations             | numeric / equation tuple          |
| Multiplication Facts & Properties      | numeric                           |
| Division Foundations                   | numeric                           |
| Fractions                              | fraction string / numeric         |
| Geometry & Attributes                  | text category / count             |
| Area & Perimeter                       | numeric                           |
| Data & Graphs                          | numeric                           |
| Measurement & Time                     | numeric / text unit / time string |

## 11. UI Dependency Matrix

| family                                 | current visualType                                                  | renderable today? | answer UI required         | new UI needed (ChatGPT)                                               | priority |
| -------------------------------------- | ------------------------------------------------------------------- | ----------------- | -------------------------- | --------------------------------------------------------------------- | -------- |
| Place Value, Number Sense, & Rounding  | multiple_choice                                                     | yes               | single choice / text       | place_value_chart (low)                                               | P1       |
| Addition                               | multiple_choice                                                     | yes               | single choice / text       | stacked_vertical_input (low)                                          | P1       |
| Subtraction                            | multiple_choice                                                     | yes               | single choice / text       | stacked_vertical_input (low)                                          | P1       |
| Add/Subtract Word Problems & Reasoning | multiple_choice                                                     | yes               | single choice / text       | word_problem_card (medium)                                            | P1       |
| Multiplication Foundations             | equal_groups, repeated_addition, factor_product, array_rows_columns | yes               | choice / multi-part / text | interactive_array_grid (low)                                          | P1       |
| Multiplication Facts & Properties      | multiple_choice                                                     | yes               | single choice / text       | fact_family_triangle (low)                                            | P1       |
| Division Foundations                   | fair_sharing, multiple_choice                                       | yes               | choice / text              | number_line_jumps (medium)                                            | P1       |
| Mult/Div Word Problems & Equations     | multiple_choice                                                     | partial           | text / choice              | strip_model_renderer (high)                                           | P2       |
| Fractions Foundations                  | multiple_choice                                                     | yes               | single choice / text       | fraction_shape_shading, fraction_bar_renderer (high)                  | P2       |
| Fractions Equivalence & Number Line    | multiple_choice                                                     | partial           | text / choice              | number_line_fractions, fraction_strip_visual (high)                   | P2       |
| Comparing Fractions                    | multiple_choice, mistake_check                                      | yes               | choice / judgment+reason   | fraction_comparison_model (medium)                                    | P2       |
| Geometry & Attributes                  | multiple_choice                                                     | yes               | single choice              | shape_diagram_renderer (medium)                                       | P3       |
| Area & Perimeter                       | multiple_choice                                                     | yes               | text / choice              | grid_rectangle, decomposed_rectangle (medium)                         | P2       |
| Data & Graphs                          | multiple_choice                                                     | no                | numeric                    | bar_graph_renderer, picture_graph_renderer, line_plot_renderer (high) | P3       |
| Measurement & Time                     | multiple_choice                                                     | no                | text / numeric             | analog_clock, ruler, unit_selector (high)                             | P3       |

## 12. Implementation Waves

### Wave 1 — Core operations and number sense (highest coverage, lowest UI risk)

1. **Place Value, Number Sense, & Rounding** — 12 lessons, no new UI.
2. **Addition** — 8 lessons, no new UI.
3. **Subtraction** — 8 lessons, no new UI.
4. **Multiplication Foundations** — 12 lessons, reuses existing visual types.
5. **Multiplication Facts & Properties** — 15 lessons, no new UI.
6. **Division Foundations** — 13 lessons, reuses fair_sharing.

Total: **68 lessons**, 6 families.

### Wave 2 — Word problems and fractions (moderate UI)

1. **Add/Subtract Word Problems & Reasoning** — 5 lessons.
2. **Mult/Div Word Problems & Equations** — 4 lessons (new strip model UI).
3. **Fractions Foundations** — 8 lessons (new fraction shape/bar UI).
4. **Fractions Equivalence & Number Line** — 12 lessons (new number-line UI).
5. **Comparing Fractions** — 8 lessons.

Total: **37 lessons**, 5 families.

### Wave 3 — Geometry, area/perimeter, data, measurement (highest UI risk)

1. **Geometry & Attributes** — 4 lessons.
2. **Area & Perimeter** — 20 lessons.
3. **Data & Graphs** — 5 lessons.
4. **Measurement & Time** — 10 lessons.

Total: **39 lessons**, 4 families.

## 13. Code-Task Boundaries

| #   | task title                          | families                               | types | lessons | expected files                                                                  | test requirements      | UI dependencies                                | risk   |
| --- | ----------------------------------- | -------------------------------------- | ----- | ------- | ------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- | ------ |
| 1   | Place value and rounding family     | Place Value, Number Sense, & Rounding  | 12    | 12      | `src/practiceTypes/placeValue.ts`, `familyConfigs.ts`                           | unit tests, 12 lessons | none                                           | low    |
| 2   | Addition family                     | Addition                               | 8     | 8       | `src/practiceTypes/addition.ts`                                                 | unit tests, 8 lessons  | none                                           | low    |
| 3   | Subtraction family                  | Subtraction                            | 8     | 8       | `src/practiceTypes/subtraction.ts`                                              | unit tests, 8 lessons  | none                                           | low    |
| 4   | Multiplication foundations family   | Multiplication Foundations             | 11    | 12      | `src/practiceTypes/multiplicationFoundations.ts`, extend existing `equalGroups` | unit tests, 12 lessons | reuse existing                                 | low    |
| 5   | Multiplication facts family         | Multiplication Facts & Properties      | 15    | 15      | `src/practiceTypes/multiplicationFacts.ts`                                      | unit tests, 15 lessons | none                                           | low    |
| 6   | Division foundations family         | Division Foundations                   | 13    | 13      | `src/practiceTypes/divisionFoundations.ts`, `fairSharingDivision.ts`            | unit tests, 13 lessons | reuse `fair_sharing`                           | low    |
| 7   | Add/subtract word problems          | Add/Subtract Word Problems & Reasoning | 5     | 5       | `src/practiceTypes/addSubWordProblems.ts`                                       | unit tests, 5 lessons  | word_problem_card (ChatGPT)                    | medium |
| 8   | Mult/div word problems              | Mult/Div Word Problems & Equations     | 4     | 4       | `src/practiceTypes/multDivWordProblems.ts`                                      | unit tests, 4 lessons  | strip_model_renderer (ChatGPT)                 | medium |
| 9   | Fractions foundations               | Fractions Foundations                  | 8     | 8       | `src/practiceTypes/fractionsFoundations.ts`                                     | unit tests, 8 lessons  | fraction_shape_shading, fraction_bar (ChatGPT) | medium |
| 10  | Fractions equivalence & number line | Fractions Equivalence & Number Line    | 12    | 12      | `src/practiceTypes/fractionsEquivalence.ts`                                     | unit tests, 12 lessons | number_line_fractions (ChatGPT)                | medium |
| 11  | Comparing fractions                 | Comparing Fractions                    | 8     | 8       | `src/practiceTypes/compareFractions.ts`                                         | unit tests, 8 lessons  | fraction_comparison_model (optional)           | medium |
| 12  | Geometry & attributes               | Geometry & Attributes                  | 4     | 4       | `src/practiceTypes/geometryAttributes.ts`                                       | unit tests, 4 lessons  | shape_diagram_renderer (ChatGPT)               | medium |
| 13  | Area & perimeter                    | Area & Perimeter                       | 20    | 20      | `src/practiceTypes/areaPerimeter.ts`                                            | unit tests, 20 lessons | grid_rectangle, decomposed_rectangle (ChatGPT) | medium |
| 14  | Data & graphs                       | Data & Graphs                          | 5     | 5       | `src/practiceTypes/dataGraphs.ts`                                               | unit tests, 5 lessons  | bar/picture/line plot renderers (ChatGPT)      | high   |
| 15  | Measurement & time                  | Measurement & Time                     | 10    | 10      | `src/practiceTypes/measurementTime.ts`                                          | unit tests, 10 lessons | clock, ruler, unit selector (ChatGPT)          | high   |

## 14. Whole-Grade Validation Strategy

A new test file `src/practiceTypes/grade3PracticeCoverage.test.ts` should run after every wave and verify:

### Generic assertions (all families)

1. Every regular lesson resolves a generator (no errors, no empty pools).
2. Every mode returns the configured question count (Guided 6–8, Independent 8–10, Challenge 5–8, or configured override).
3. Every problem has a stable, non-empty `problemKey`.
4. No duplicate `problemKey` within a session.
5. No duplicate mathematical question (same text, same correct answer) within a session.
6. `questionText` is non-empty.
7. `correctAnswer` is non-empty and valid.
8. `visualType` is supported by `PracticeScreen` or is explicitly flagged as new UI.
9. Generated values stay within configured bounds.
10. Problems are tagged with the lesson’s `skills`.

### Family-specific assertions

- Addition/subtraction: sum/difference exact, no negative results unless allowed, regrouping flag matches.
- Multiplication/division: product/quotient exact, factors/divisors in configured range.
- Fractions: denominator in allowed set, proper fractions unless specified.
- Area/perimeter: area = l × w, perimeter = 2(l+w), positive sides.
- Data: computed value matches generated data set.
- Measurement/time: unit choice sensible, elapsed time positive.

### Evaluation pool validation

- For each evaluation review type, the family generator must yield at least 2× the requested question count without duplicates.

## 15. Curriculum Data Gaps

The curriculum JSON currently lacks generator-specific parameters. Each regular lesson only has:

- `practice_type`: string
- `skills`: string[]
- `practice_block`: { question_count: number, instructions: string }
- authored `warmup` and `try_it` (used by the default generator)

There is no machine-readable field for:

- operand ranges
- regrouping requirements
- allowed denominators
- fact ranges
- whether word problems or visuals are required

### Recommended curriculum field

Add an optional `generator_config` key to the `LessonSchema` (`src/data/curriculum/curriculumSchema.ts`) for per-lesson overrides, while keeping the canonical mapping in `src/practiceTypes/familyConfigs.ts`. Example:

```ts
generator_config: z.object({
  operandRange: z.object({ min: z.number(), max: z.number() }).optional(),
  regrouping: z.enum(["none", "required", "mixed"]).optional(),
  denominators: z.array(z.number()).optional(),
}).optional(),
```

### Safe temporary fallback

Until each family is implemented, the default generator remains in place. It is pedagogically aligned (it uses authored prompts) but not randomized. No gap blocks the August 20 release, but gaps become blockers if a family cannot be configured without the field.

## 16. Release Risks

| risk                                                    | impact | mitigation                                                                                                   |
| ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Wave 1 scope too large for one sprint                   | medium | Split Wave 1 into two tasks: number/operations, then multiplication/division.                                |
| New UI for fractions/geometry/measurement not ready     | high   | Start Wave 3 early, provide visual mocks to ChatGPT, and keep fallback `multiple_choice` for these families. |
| Randomization produces duplicate or off-skill questions | high   | Strict problemKey and validation tests; seed-based tests.                                                    |
| Curriculum config not added                             | low    | Use centralized registry first; add JSON override later.                                                     |
| Existing specialized generators regress                 | medium | Unit tests for each existing generator before and after migration.                                           |

## 17. Recommended First Code Task

**Task: Implement the Addition generator family and wire it into the registry.**

Why first:

- Addition is mathematically simple and has no new UI dependencies.
- It covers 8 lessons in Units 4–5 and proves the family-config pattern.
- It naturally produces clear validation rules (exact sum, regrouping flag, missing-digit logic).
- It lets the team validate the randomization and problem-key strategy before tackling richer families.

Deliverables for Task 1:

- New `src/practiceTypes/addition.ts` generator family.
- New `src/practiceTypes/familyConfigs.ts` mapping `practice_type` → config.
- Updates to `src/practiceTypes/registry.ts` to resolve `addition_*` practice types through the family generator.
- Unit tests in `src/practiceTypes/addition.test.ts` covering Guided, Independent, Challenge, and all 8 addition practice types.
- Integration test asserting all 8 lessons produce the required count and unique keys.

## 18. Adaptive Daily Plan

### Remainder of August 4

- Review and approve this plan.
- Create the family-configuration skeleton and helper utilities (seeded PRNG, `problemKey` builder).
- Begin Task 1 (Addition family) implementation.

### Next workday

- Complete Task 1 and run tests.
- If Task 1 finishes early, immediately begin Task 2 (Subtraction family) or Task 5 (Multiplication Facts).
- At the end of the day, re-assess actual coverage and rewrite the next-day milestones.

### Milestone order

1. Wave 1 families (Place Value, Addition, Subtraction, Multiplication Foundations, Facts, Division).
2. Wave 2 families (word problems, fractions).
3. Wave 3 families (geometry, area/perimeter, data, measurement).
4. Whole-grade validation and evaluation-pool stress tests.

If a task finishes early, start the next task in the same wave. Do not wait for a scheduled day.

## 19. Complete Practice-Type-to-Family Mapping

| practice_type                              | lesson_count | units | current_resolution | visual_type       | class | notes                                  |
| ------------------------------------------ | ------------ | ----- | ------------------ | ----------------- | ----- | -------------------------------------- |
| addition_compensation                      | 1            | 4     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_expanded_form                     | 1            | 4     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_no_regroup                        | 1            | 4     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_number_line                       | 1            | 4     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_regroup_ones                      | 1            | 5     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_regroup_tens                      | 1            | 5     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| addition_three_numbers                     | 1            | 5     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_introduction                          | 1            | 20    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_models_and_stories                    | 1            | 27    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_models_equivalence                    | 1            | 29    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_perimeter_word_problems               | 1            | 24    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_rectangles_squares                    | 1            | 21    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| area_word_problems                         | 1            | 21    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| associative_multiplication                 | 1            | 12    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| base_ten_models                            | 1            | 11    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| build_arrays                               | 1            | 10    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| choose_operation                           | 1            | 8     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| choose_strategy                            | 1            | 17    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| choose_weight_mass_volume_units            | 1            | 34    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| classify_squares_rectangles_rhombuses      | 1            | 33    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| commutative_multiplication                 | 1            | 12    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| compare_explain_fractions                  | 1            | 32    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| compare_like_denominators_models           | 1            | 31    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| compare_like_denominators_number_line      | 1            | 31    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| compare_like_numerators_models             | 1            | 32    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| compare_like_numerators_number_line        | 1            | 32    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| comparison_word_problems_like_denominators | 1            | 31    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| connect_models_equations_stories           | 1            | 10    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| connect_models_number_lines_equations      | 1            | 30    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| count_and_label_area                       | 1            | 20    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| count_equal_groups                         | 1            | 9     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| cover_with_unit_squares                    | 1            | 20    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| create_graphs_solve_problems               | 1            | 25    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| create_picture_graphs                      | 1            | 25    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| create_rectangles_area                     | 1            | 22    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| customary_length_units                     | 1            | 34    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| denominator_meaning                        | 1            | 27    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| different_arrangements_same_area           | 1            | 22    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| distributive_property_area                 | 1            | 22    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| divide_by_6                                | 1            | 15    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| divide_by_7                                | 1            | 15    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| divide_by_8                                | 1            | 16    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| divide_by_9                                | 1            | 16    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| division_arrays                            | 1            | 14    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| division_counting_groups                   | 1            | 13    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| division_number_line                       | 1            | 14    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| division_sharing                           | 1            | 13    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| division_with_1_and_0                      | 1            | 13    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| draw_multiplication                        | 1            | 9     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| elapsed_time                               | 1            | 35    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| equal_group_array_problems                 | 1            | 18    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| equal_groups                               | 1            | 1     | specialized        | equal_groups      | B     | specialized but narrow (×0 and ×1)     |
| equal_groups_with_objects                  | 1            | 1     | specialized        | equal_groups      | A     | specialized with varied bank           |
| equal_unequal_parts                        | 1            | 26    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| equations_with_unknowns                    | 1            | 18    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| equivalence_same_amount                    | 1            | 29    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| estimate_reasonable                        | 1            | 3     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| estimate_reasonableness                    | 1            | 36    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| estimate_then_solve                        | 1            | 8     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| estimate_time_intervals                    | 1            | 35    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| expanded_form                              | 1            | 11    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| expanded_form_large                        | 1            | 2     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| fact_families                              | 1            | 14    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| factor_product_identification              | 1            | 1     | specialized        | factor_product    | A     | specialized with varied bank           |
| factors_and_products                       | 1            | 9     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| find_area_perimeter_missing_side           | 1            | 24    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| find_equivalents_number_line               | 1            | 30    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| fraction_bars                              | 1            | 27    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| fraction_strips_equivalence                | 1            | 29    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| generate_explain_equivalent                | 1            | 29    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| graph_equivalent_fractions                 | 1            | 30    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| halves_thirds_fourths                      | 1            | 26    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| hidden_squares_area                        | 1            | 20    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| large_digit_value                          | 1            | 2     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| line_plots                                 | 1            | 34    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| locate_non_unit_fractions_number_line      | 1            | 28    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| locate_unit_fractions_number_line          | 1            | 28    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| match_time_formats                         | 1            | 35    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| measurement_problems                       | 1            | 36    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| missing_digits_properties                  | 1            | 5     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| missing_factors                            | 1            | 17    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| missing_numbers_division                   | 1            | 17    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| missing_side_length                        | 1            | 22    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| missing_side_perimeter                     | 1            | 23    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| mixed_measurement_problems                 | 1            | 36    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| mixed_multiplication_facts                 | 1            | 17    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiples_of_ten_basic_facts               | 1            | 19    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiples_of_ten_word_problems             | 1            | 19    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiplication_for_division                | 1            | 14    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiplication_number_line                 | 1            | 10    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_3                              | 1            | 12    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_4                              | 1            | 12    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_6                              | 1            | 15    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_7                              | 1            | 15    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_8                              | 1            | 16    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| multiply_by_9                              | 1            | 16    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| name_unit_fractions                        | 1            | 26    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| number_words                               | 1            | 11    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| numerator_meaning                          | 1            | 27    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| one_digit_by_multiples_of_ten              | 1            | 19    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| one_step_word_problems                     | 1            | 8     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| parallel_sides_quadrilaterals              | 1            | 33    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| parallelograms_trapezoids                  | 1            | 33    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| partition_number_lines                     | 1            | 28    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| perimeter_introduction                     | 1            | 23    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| perimeter_on_grids                         | 1            | 23    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| perimeter_rectangles_quadrilaterals        | 1            | 23    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| place_value_digits                         | 1            | 11    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| place_value_patterns                       | 1            | 19    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| place_value_puzzles                        | 1            | 2     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| quarter_inch_measurement                   | 1            | 34    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| read_analog_clocks                         | 1            | 35    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| read_bar_graphs                            | 1            | 25    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| read_picture_graphs                        | 1            | 25    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| reading_large_numbers                      | 1            | 2     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| repeated_addition_to_multiplication        | 2            | 1, 9  | specialized        | repeated_addition | A     | specialized with varied bank           |
| round_hundred                              | 1            | 3     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| round_place_value                          | 1            | 3     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| round_ten                                  | 1            | 3     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| rows_columns_multiplication                | 1            | 21    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| same_area_different_perimeter              | 1            | 24    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| same_location_number_line                  | 1            | 30    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| same_perimeter_different_area              | 1            | 24    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| same_whole_fractions                       | 1            | 32    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| sides_and_vertices                         | 1            | 33    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| sixths_eighths                             | 1            | 26    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| strip_models                               | 1            | 18    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtract_across_zeros                      | 1            | 7     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_compensation                   | 1            | 6     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_expanded_form                  | 1            | 6     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_missing_digits                 | 1            | 7     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_no_regroup                     | 1            | 6     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_number_line                    | 1            | 6     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_regroup_ones                   | 1            | 7     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| subtraction_regroup_tens                   | 1            | 7     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| tile_rectangles                            | 1            | 21    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| two_equations_for_array                    | 1            | 10    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| two_step_measurement_equations             | 1            | 36    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| two_step_mult_div_patterns                 | 1            | 18    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| two_step_unknowns                          | 1            | 8     | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| use_comparison_symbols                     | 1            | 31    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| write_division_equations                   | 1            | 13    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
| zero_to_one_interval                       | 1            | 28    | default            | multiple_choice   | E     | cycles a small set of authored prompts |
