# August 11 Multiplication Generator Audit

- **Audit date:** August 11, 2026
- **Scope:** Grade 3 regular lessons in Multiplication Foundations and Multiplication Facts & Properties
- **Mode:** Architecture and semantic audit only; no generator, application, or curriculum implementation

## 1. Authoritative starting state

- Branch: `main`
- Repository checkpoint inspected: `49a8070 chore: add Aug 20 release project sync`
- Regular Grade 3 lessons: **144**
- Current family-backed Practice lessons: **33**
- Current fallback-backed Practice lessons: **111**
- Verified remaining multiplication target: **22 lessons**
  - Multiplication Foundations: **7**
  - Multiplication Facts & Properties: **15**

The supplied 7 + 15 estimate is correct. All 22 target lessons are regular Grade 3 lessons, all 22 have distinct `practice_type` values, and none of the 22 types is registered in `src/practiceTypes/registry.ts`.

Two planning documents contain older embedded checkpoints and must not be used for current coverage arithmetic:

- `docs/plans/aug-20-release-checklist.md` still names `a0c3b2f` as its internal current checkpoint even though repository HEAD is `49a8070`.
- `docs/plans/generator-first-release-plan-2026-08-20.md` records the earlier 22/122 family/fallback split; current tests and current registry state prove 33/111.

No checklist state was changed by this audit.

### Scope boundary

The multiplication-related target for this sprint is the curriculum grouping already used by the release plan:

- Unit 9 and Unit 10 remaining Multiplication Foundations lessons;
- multiplication-only lessons in Units 12, 15, 16, and 17;
- all four Unit 19 multiplying-by-multiples-of-ten lessons.

This intentionally excludes:

- Unit 15/16/17 division lessons, which belong to the division sprint;
- Unit 18 multiplication/division word problems, which the release checklist schedules with division on August 12;
- Unit 20–24 area/perimeter multiplication applications, which belong to the area/perimeter sprint;
- already family-backed Unit 1 lessons and the already family-backed Unit 9 repeated-addition lesson from the **remaining** count, while still considering their implementations for reuse.

## 2. Current flow behavior and terminology used below

`D4` in the inventory tables means the current default Practice fallback:

- it reads the three authored warm-up questions plus the one authored legacy `try_it` question;
- it therefore returns at most **four** unique questions even though every target `practice_block` requests **six**;
- it only shuffles those finite authored sources and generates generic nearby-value/categorical distractors;
- its key is `default:<normalized prompt>::<normalized answer>`, so identity is based on presentation text rather than canonical mathematics.

All 22 lessons already route Try It to a generated multiplication family. That is useful infrastructure, but the existing Try It families generate their own mathematics instead of consuming a shared canonical multiplication module.

`Evaluation: alias` means the current resolver substitutes a different registered generator. `Evaluation: default` means it uses the same authored fallback as Practice. Every target can use Evaluation's normal Practice-registry delegation after its exact `practice_type` is registered; no multiplication-specific Evaluation generator is needed.

## 3. Exact remaining inventory

### 3.1 Multiplication Foundations — 7 lessons

| Curriculum lesson     | Title / `practice_type`                                                      | Mathematical objective                                                                         | Current Practice behavior                                                                                                                      | Current Try It behavior                                                                                                                                  | Evaluation reuse                                                                                                                                                    | Proposed canonical family     | Canonical state and key                                                                                                                                                              | Curriculum constraint                                                                                                                                      | Likely misconceptions                                                                                            | Risk   | Current semantic defect                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U9/W1 `g3-u9-w1-l1`   | Count Equal Groups<br>`count_equal_groups`                                   | Count equal groups by skip counting and find the product.                                      | D4: two skip-count sequences, one 3-cars/4-wheels problem, and one 4-groups-of-4 problem; only 4 of requested 6.                               | Generated 2–7 groups of 2–6; explicitly shows repeated addition and asks for total.                                                                      | **Yes after exact registration.** Current alias to `equal_groups` is semantically wrong because that Practice generator only exercises ×0 and ×1.                   | A — Multiplication Models     | `EqualGroupsState { groupCount, groupSize, product }`<br>`multiplication:model:equal-groups:g=<g>:n=<n>:task=count-total`                                                            | Positive equal groups; current authored/generated domain uses group counts about 2–7 and sizes 2–6.                                                        | Add factors; omit/add one group; use only group count or group size; count by ones incorrectly.                  | Low    | Current Evaluation substitutes zero/identity problems. Practice is static and under-count.                                                                          |
| U9/W1 `g3-u9-w1-l3`   | Identify Factors and Products<br>`factors_and_products`                      | Identify both displayed factors and the product.                                               | D4: authored product, factor-pair, invalid “which is bigger” generalization, and one factor-pair Try It; only 4 of 6.                          | Generated ordered factors 2–9, forced unequal; asks first factor, second factor, and product.                                                            | **Yes after exact registration.** Current alias to `factor_product_identification` is mathematically close but static.                                              | B — Factor/Product Terms      | `TermState { factorA, factorB, product, requestedTerms }`<br>`multiplication:terms:a=<a>:b=<b>:ask=both`                                                                             | Factor pair is unordered; commuted facts share canonical identity; squares are valid and must not be excluded.                                             | Label product as factor; label a factor as product; compute sum; reverse answers when order matters.             | Low    | “The product is bigger than the factors” is false for zero/identity cases. Try It avoids squares only to simplify choices.                                          |
| U9/W1 `g3-u9-w1-l4`   | Draw and Describe Multiplication Situations<br>`draw_multiplication`         | Create and describe an equal-groups/model representation for an equation or story.             | D4: authored description, equation, numeric “draw” answer, and one numeric Try It; it never records an actual drawing and returns only 4 of 6. | Generated equal-group story with 2–8 groups of 2–6; asks which equation matches.                                                                         | **Yes after exact registration.** Current alias to `draw_arrays` narrows the objective to an array rows/columns answer.                                             | A — Multiplication Models     | `EqualGroupsState` plus assessed representation `equal-groups`<br>`multiplication:model:equal-groups:g=<g>:n=<n>:task=construct`                                                     | First factor is number of groups and second is group size in Units 1/9.                                                                                    | Reverse group roles; unequal groups; addition equation; missing/extra group.                                     | High   | Neither flow currently assesses drawing or description; Evaluation changes the model to arrays. A genuine construct/draw interaction needs an approved UI contract. |
| U10/W1 `g3-u10-w1-l1` | Build Arrays to Represent Multiplication<br>`build_arrays`                   | Build a rectangular array with exact rows, columns, and product.                               | D4: three authored row/column/product questions plus one 4×3 total; only 4 of 6.                                                               | Generated 2–8 rows and 2–6 columns; asks rows, columns, total. The shared Try It screen renders separated equal-group clusters, not a rectangular array. | **Yes after exact registration.** Current alias to `array_rows_columns` is mathematically close but static.                                                         | A — Multiplication Models     | `ArrayState { rows, columns, product }`<br>`multiplication:model:array:r=<r>:c=<c>:task=build`                                                                                       | Every row has exactly `columns`; every column has exactly `rows`; no ragged/malformed arrays.                                                              | Swap row/column labels; omit/add a row or column; add dimensions; ragged array.                                  | High   | Learner-facing Try It claims “array” but displays equal groups. Practice is finite and does not construct a runtime array.                                          |
| U10/W1 `g3-u10-w1-l2` | Write Two Multiplication Equations for an Array<br>`two_equations_for_array` | Derive both commutative equations, with the same product, from one array.                      | D4: one authored equation pair, one bare product, one yes/no property item, one authored pair; only 4 of 6.                                    | Generated 2–7 rows and 2–6 columns; asks for a pair `r × c = p` and `c × r = p`, but displays equal-group clusters.                                      | **Yes after exact registration.** Current alias to `commutative_property_matching` asks only for the reversed expression and does not supply two product equations. | E — Multiplication Properties | `CommutativeState { factorA: rows, factorB: columns, product, representation: array }`<br>`multiplication:property:commutative:a=<r>:b=<c>:representation=array:task=two-equations`  | Both equations must preserve factors and product; square arrays still need a deliberate response contract because the two written equations are identical. | Change one factor; change product after reversing; provide only one equation; add instead of multiply.           | Medium | Current Evaluation alias does not meet the two-equation contract. Square-array handling is undefined in current Try It.                                             |
| U10/W1 `g3-u10-w1-l3` | Represent Multiplication on a Number Line<br>`multiplication_number_line`    | Model multiplication as an exact count of equal jumps and endpoint.                            | D4: authored endpoint, unknown jump count, equation, and numeric Try It; only 4 of 6.                                                          | Generated 2–8 jumps of size 2–6 and a matching equation. Prompt says jumps “are shown,” but no number line is rendered.                                  | **Yes after exact registration.** Currently default-backed in Evaluation.                                                                                           | A — Multiplication Models     | `NumberLineState { jumpCount, jumpSize, endpoint, start: 0 }`<br>`multiplication:model:number-line:j=<j>:s=<s>:start=0:task=represent`                                               | Exactly `jumpCount` equal positive jumps from 0; endpoint = count × size.                                                                                  | Use jump count as endpoint; omit/add a jump; unequal jumps; swap count/size labels when labels are assessed.     | High   | Practice has no number-line visual type; Try It falsely claims the model is shown. UI representation is an implementation prerequisite.                             |
| U10/W1 `g3-u10-w1-l4` | Connect Models, Equations, and Stories<br>`connect_models_equations_stories` | Prove that a selected model, ordered equation, and story encode the same multiplicative roles. | D4: one array→equation, one expression→story, one number-line→product, and one story→equation; only 4 of 6.                                    | Generated equation→equal-groups-story matching for 2–7 by 2–6 only. It does not vary arrays or number lines.                                             | **Yes after exact registration.** Currently default-backed in Evaluation.                                                                                           | A — Multiplication Models     | `ConnectionState { factorA, factorB, product, sourceRepresentation, targetRepresentation, orderedRoles }`<br>`multiplication:model-connection:a=<a>:b=<b>:from=<source>:to=<target>` | Source and target must expose the same ordered group/row/jump roles and product.                                                                           | Commuted but role-reversed story; correct product with wrong model; one extra group/jump/column; addition model. | High   | Current Try It teaches only equation→story, not the stated cross-model objective; available renderers cannot display all required representations.                  |

### 3.2 Multiplication Facts & Properties — 15 lessons

| Curriculum lesson     | Title / `practice_type`                                                             | Mathematical objective                                                             | Current Practice behavior                                                                                            | Current Try It behavior                                                                                                                   | Evaluation reuse                                                                                                      | Proposed canonical family     | Canonical state and key                                                                                                                                                                 | Curriculum constraint                                                                                                                           | Likely misconceptions                                                                                                      | Risk   | Current semantic defect                                                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U12/W1 `g3-u12-w1-l1` | Multiply by 3<br>`multiply_by_3`                                                    | Solve ×3 facts using skip counting or double-plus-one.                             | D4: authored skip count, two facts, one fact; only 4 of 6.                                                           | Bare `3 × n`, `n` 2–9; no strategy state.                                                                                                 | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState { factorA: 3, factorB: n, product }` with optional derived `2n+n` evidence.<br>`multiplication:fact:a=3:b=<n>`                                                               | Conservative generated range 2–9 from current Try It/examples; strategy identity `3n = 2n + n`.                                                 | Add 3+n; adjacent ×2/×4 fact; omit/add one group.                                                                          | Low    | Practice is static. Curriculum prose also writes `4 × 3` as `4+4+4`, conflicting with the project’s first-factor-as-groups convention; use neutral fact state and fixed-factor-first strategy wording. |
| U12/W1 `g3-u12-w1-l2` | Multiply by 4 Using Doubles<br>`multiply_by_4`                                      | Solve ×4 by doubling the other factor twice.                                       | D4: authored double-twice and two facts plus one fact; only 4 of 6.                                                  | Bare `4 × n`, `n` 2–9; no doubled intermediates.                                                                                          | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState` plus derived `double1=2n`, `double2=4n`.<br>`multiplication:fact:a=4:b=<n>`                                                                                                 | `4n = 2(2n)`; current generated range 2–9.                                                                                                      | Stop after one double; add four; adjacent fact.                                                                            | Low    | The product is correct, but current flows do not prove or practice the stated double-twice strategy.                                                                                                   |
| U12/W1 `g3-u12-w1-l3` | Use the Commutative Property<br>`commutative_multiplication`                        | Reverse the two factors while preserving product.                                  | D4: authored reverse fact, subjective “which is easier” with answer `same`, a product, and one product; only 4 of 6. | Bare `a × b = ?`, factors 2–9; does not ask for the reversed equation.                                                                    | Yes. Current alias to `commutative_property_matching` is closer, but static and returns only the reversed expression. | E — Multiplication Properties | `CommutativeState { factorA, factorB, product, reversedA, reversedB }`<br>`multiplication:property:commutative:a=<a>:b=<b>:representation=equation:task=equivalent-equation`            | Preserve both factors and product; define square-fact behavior explicitly.                                                                      | Change a factor; change product; confuse with associative property; reverse only one side.                                 | Medium | Current Try It is ordinary fact recall, not a property task. “Which is easier?” does not have an objective unique answer.                                                                              |
| U12/W1 `g3-u12-w1-l4` | Grouping and the Associative Property<br>`associative_multiplication`               | Regroup the same three factors and verify equal final products.                    | D4: two authored three-factor products, one subjective grouping item, one product; only 4 of 6.                      | Generated `(a × b) × c`, `a,b` 2–9 and `c` 2–5; asks only for product and can reach 405.                                                  | Yes; currently default.                                                                                               | E — Multiplication Properties | `AssociativeState { a, b, c, leftIntermediate, rightIntermediate, product, requestedGrouping }`<br>`multiplication:property:associative:a=<a>:b=<b>:c=<c>:task=<equivalence-or-target>` | Same ordered factors on both sides; grouping changes, order does not; constrain final product to the lesson’s demonstrated Grade 3 domain.      | Change factor/order; equate wrong intermediates; add one factor; stop at intermediate.                                     | High   | Current Try It does not test regrouping and exceeds the apparent authored domain; its key records `a×b` as the “total” rather than the three-factor product.                                           |
| U15/W1 `g3-u15-w1-l1` | Build ×6 from Known Facts<br>`multiply_by_6`                                        | Use ×5 plus one more group.                                                        | D4: one ×5 fact, two ×6 facts, one ×6 fact; only 4 of 6.                                                             | Bare `6 × n`, `n` 2–9; no decomposition.                                                                                                  | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState` plus `known=5n`, `extra=n`.<br>`multiplication:fact:a=6:b=<n>`                                                                                                              | `6n = 5n+n`; current examples/generated range 2–9.                                                                                              | Return 5n; add 1 rather than n; adjacent fact.                                                                             | Low    | Correct products, but the stated known-fact strategy is absent from generated interaction.                                                                                                             |
| U15/W1 `g3-u15-w1-l3` | Build ×7 Facts Using Strategies<br>`multiply_by_7`                                  | Use a valid decomposition such as ×5 + ×2.                                         | D4: three authored ×7 facts and one fact; only 4 of 6.                                                               | Bare `7 × n`, `n` 2–9.                                                                                                                    | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState` plus strategy evidence such as `5n`, `2n`, and sum.<br>`multiplication:fact:a=7:b=<n>`                                                                                      | At least one exact decomposition; current primary lesson identity is `7n=5n+2n`.                                                                | Omit ×2 part; add 2 rather than 2n; adjacent fact.                                                                         | Low    | Current generated flow measures product recall, not strategy use. Some authored strategy wording switches orientation, so the core must remain role-neutral.                                           |
| U16/W1 `g3-u16-w1-l1` | Multiply by 8 Using Doubles<br>`multiply_by_8`                                      | Double the other factor three times.                                               | D4: authored triple-double and two facts plus one fact; only 4 of 6.                                                 | Bare `8 × n`, `n` 2–9.                                                                                                                    | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState` plus `[2n,4n,8n]`.<br>`multiplication:fact:a=8:b=<n>`                                                                                                                       | Three exact doublings; current generated range 2–9.                                                                                             | Stop after one/two doubles; add 8; adjacent fact.                                                                          | Low    | Current generated flow omits the defining strategy.                                                                                                                                                    |
| U16/W1 `g3-u16-w1-l3` | Multiply by 9 Using Patterns<br>`multiply_by_9`                                     | Use `10n−n` and valid 9s patterns.                                                 | D4: two authored products, one digit-sum item, one fact; only 4 of 6.                                                | Bare `9 × n`, `n` 2–9.                                                                                                                    | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState` plus `tenProduct=10n`, `subtract=n`, optional digit-pattern evidence.<br>`multiplication:fact:a=9:b=<n>`                                                                    | `9n=10n−n`; do not overstate “digits add to 9” beyond the constrained one/two-digit products.                                                   | Return 10n; subtract 1; digit-sum confusion; adjacent fact.                                                                | Medium | Current generated flow omits both strategy and pattern. Curriculum prose correctly softens the digit-sum rule in teaching points, but the concept sentence states it too broadly.                      |
| U17/W1 `g3-u17-w1-l1` | Practice Mixed Multiplication Facts<br>`mixed_multiplication_facts`                 | Fluently solve mixed facts from 0 through 9.                                       | D4: only authored 7×8, 9×6, 8×4, and 7×9; only 4 of 6 and no 0/1 factors.                                            | Random factors 2–9 only.                                                                                                                  | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `FactState { factorA, factorB, product }`<br>`multiplication:fact:a=<a>:b=<b>`                                                                                                          | Curriculum explicitly says factors **0 through 9**; generated distribution must include 0 and 1 deliberately, not merely permit them.           | Add factors; identity/zero confusion; adjacent fact; reverse role only when a model is shown.                              | Medium | Both current flows omit ×0 and ×1 despite the explicit objective domain.                                                                                                                               |
| U17/W1 `g3-u17-w1-l2` | Find Missing Factors<br>`missing_factors`                                           | Solve a multiplication equation with exactly one unknown factor.                   | D4: three authored missing-factor equations plus one authored equation; only 4 of 6.                                 | Generated factors 2–9, randomly missing left or right factor.                                                                             | Yes; currently default.                                                                                               | D — Unknown Factor            | `UnknownFactorState { factorA, factorB, product, unknownPosition }`<br>`multiplication:unknown:a=<a>:b=<b>:p=<p>:position=<left-or-right>`                                              | Exactly one blank; substitute answer to recover `a×b=p`; products within 81 in current domain.                                                  | Use product as factor; divide in wrong order; return visible factor; adjacent factor.                                      | Low    | Mathematics is currently sound, but it is duplicated in Try It and absent from Practice generation.                                                                                                    |
| U17/W1 `g3-u17-w1-l4` | Choose Efficient Fact Strategies<br>`choose_strategy`                               | Select a valid efficient strategy for a multiplication/division fact and solve it. | D4: two authored strategy/product items, one division fact, one product; only 4 of 6.                                | For any `a×b`, the answer is always the text “Use a fact you know”; distractors are “Count by ones” and “Guess.” Product is not answered. | Yes; currently default.                                                                                               | C — Fact Fluency & Strategies | `StrategyState { fact, strategyId, intermediateEquations, product, operation }`<br>`multiplication:strategy:a=<a>:b=<b>:strategy=<id>:task=validate-and-solve`                          | Wording must ask which **shown strategy is valid**, not assert a subjective unique “best”; each accepted strategy must reconstruct the product. | Valid strategy for a different factor; one incorrect intermediate; inefficient counting; correct method with wrong result. | High   | Current Try It has a constant non-mathematical answer and does not solve the fact. Authored “best” wording permits multiple defensible answers.                                                        |
| U19/W1 `g3-u19-w1-l1` | Connect Basic Facts to Multiples of Ten<br>`multiples_of_ten_basic_facts`           | Relate `a×d` to `a×(10d)` and scale the product by 10.                             | D4: three authored paired facts plus one scaled fact; only 4 of 6.                                                   | Bare `a × multipleOfTen`, with `a` 2–9 and multiple 10–90; no basic-fact connection.                                                      | Yes; currently default.                                                                                               | F — Multiples of Ten          | `ScaledFactState { oneDigit:a, tensDigit:d, basicProduct, multipleOfTen:10d, scaledProduct }`<br>`multiplication:scaled-ten:a=<a>:d=<d>:task=connect`                                   | One-digit factor and 10–90; assert `scaledProduct=10×basicProduct`.                                                                             | Omit/append wrong zero; return basic product; add 10; scale one factor but not product.                                    | Medium | Current Try It teaches only computation. Its key uses hidden unused `a,b`, omits the displayed factor, and includes presentation-generated state.                                                      |
| U19/W1 `g3-u19-w1-l2` | Multiply One-Digit Numbers by Multiples of Ten<br>`one_digit_by_multiples_of_ten`   | Compute one-digit × 10–90 from the basic fact.                                     | D4: three authored facts plus one fact; only 4 of 6.                                                                 | Bare product with displayed factor 2–9 and multiple 10–90.                                                                                | Yes; currently default.                                                                                               | F — Multiples of Ten          | `ScaledFactState`<br>`multiplication:scaled-ten:a=<a>:d=<d>:task=product`                                                                                                               | Conservative nonzero one-digit factor 1–9 and 10–90; maximum 810.                                                                               | Basic product only; extra zero; add operands; place-value shift error.                                                     | Low    | Arithmetic is sound, but current key omits the actual displayed factor and depends on hidden random factors.                                                                                           |
| U19/W1 `g3-u19-w1-l3` | Solve Real-World Problems with Multiples of Ten<br>`multiples_of_ten_word_problems` | Map a groups-of-multiple-of-ten story to a product.                                | D4: three authored contexts plus one cookie context; only 4 of 6.                                                    | Bare equation; no generated story.                                                                                                        | Yes; currently default.                                                                                               | F — Multiples of Ten          | `ScaledFactState` with presentation-only context omitted from key.<br>`multiplication:scaled-ten:a=<a>:d=<d>:task=product`                                                              | Context must encode exactly `a` groups with `10d` in each; nouns do not change identity.                                                        | Add groups and size; use basic product; swap units; omit/extra zero.                                                       | Medium | Current Try It does not teach word-problem modeling, and its key omits the displayed factor.                                                                                                           |
| U19/W1 `g3-u19-w1-l4` | Explain Place-Value and Multiplication Patterns<br>`place_value_patterns`           | Reconstruct a constant-step sequence and explain ten-times place-value scaling.    | D4: one authored sequence, one static “shift left” wording item, one product, one product; only 4 of 6.              | Bare product `n×10` or `n×20` only; no sequence or explanation.                                                                           | Yes; currently default.                                                                                               | F — Multiples of Ten          | `TenPatternState { oneDigit, startTensDigit, length, missingIndex, multipliers, products, constantDifference }`<br>`multiplication:ten-pattern:a=<a>:start=<d>:length=<k>:missing=<i>`  | Sequence products increase by `10a` when the tens digit increases by 1; all shown terms must be in key state.                                   | Add 10 instead of 10a; use basic products; wrong missing term; incorrect digit-shift explanation.                          | High   | Current Try It supports only 10 or 20 because of a range bug, does not expose a pattern, and keys hidden random values instead of the displayed `n`.                                                   |

### Verified remaining `practice_type` list

In curriculum order:

1. `count_equal_groups`
2. `factors_and_products`
3. `draw_multiplication`
4. `build_arrays`
5. `two_equations_for_array`
6. `multiplication_number_line`
7. `connect_models_equations_stories`
8. `multiply_by_3`
9. `multiply_by_4`
10. `commutative_multiplication`
11. `associative_multiplication`
12. `multiply_by_6`
13. `multiply_by_7`
14. `multiply_by_8`
15. `multiply_by_9`
16. `mixed_multiplication_facts`
17. `missing_factors`
18. `choose_strategy`
19. `multiples_of_ten_basic_facts`
20. `one_digit_by_multiples_of_ten`
21. `multiples_of_ten_word_problems`
22. `place_value_patterns`

## 4. Proposed canonical generator families

### Family A — Multiplication Models

**Remaining practice types (5):** `count_equal_groups`, `draw_multiplication`, `build_arrays`, `multiplication_number_line`, `connect_models_equations_stories`

**Existing types to reuse/migrate, not counted as remaining:** `equal_groups`, `repeated_addition_to_multiplication`, `equal_groups_with_objects`, plus the currently alias-only `array_rows_columns` and `draw_arrays` adapters.

The family should share a small multiplication-fact primitive but use representation-specific canonical state:

- equal groups/repeated addition: ordered group count, group size, product;
- array: ordered rows, columns, product;
- number line: start, jump count, jump size, endpoint;
- cross-representation: ordered fact plus source/target representation pair.

Equal groups, repeated addition, and arrays can share factors/product generation. They must not collapse their canonical state when row/group/jump roles are assessed. A commuted equation has the same product but is not the same ordered model.

### Family B — Factor/Product Terms

**Remaining practice types (1):** `factors_and_products`

**Existing type to reuse/migrate:** `factor_product_identification`.

This is a thin semantic view of the shared ordered fact state. It should not generate its own operand bank. The state must include the requested term(s), because asking for the product and asking for the factors are different student-facing mathematical tasks.

### Family C — Fact Fluency & Strategy Decomposition

**Remaining practice types (8):** `multiply_by_3`, `multiply_by_4`, `multiply_by_6`, `multiply_by_7`, `multiply_by_8`, `multiply_by_9`, `mixed_multiplication_facts`, `choose_strategy`

The six fixed-factor types and mixed facts safely share `FactState`. Fixed-factor configuration supplies range and strategy metadata. The correct product and key come from the same canonical fact. Strategy intermediates are exact derived state, not hand-authored strings.

`choose_strategy` needs the distinct `StrategyState` variant because the chosen decomposition and its intermediate equations are learner-facing mathematics. It belongs in the same module for reuse, but it must not be implemented as a bare fact adapter or a constant textual answer.

### Family D — Unknown Factor

**Remaining practice types (1):** `missing_factors`

Unknown position is canonical. The equations `?×b=p` and `a×?=p` must not collapse to one key merely because they use the same fact. This family may consume a generated `FactState`, then add `unknownPosition` before the adapter performs any presentation shuffle.

### Family E — Multiplication Properties

**Remaining practice types (3):** `two_equations_for_array`, `commutative_multiplication`, `associative_multiplication`

**Existing adapter to reuse/migrate:** `commutative_property_matching`.

This family has two genuinely different canonical variants:

- `CommutativeState` owns two factors, product, reversed equation, and representation (`array` or equation);
- `AssociativeState` owns all three factors, both groupings, both intermediates, and final product.

Do not force associative state into a two-factor record merely to reduce file count. Conversely, array commutative pairs and equation commutative matching should share the same two-factor property generator.

### Family F — Multiples of Ten

**Remaining practice types (4):** `multiples_of_ten_basic_facts`, `one_digit_by_multiples_of_ten`, `multiples_of_ten_word_problems`, `place_value_patterns`

The first three safely share `ScaledFactState`; word-problem nouns belong to the adapter and do not enter the key. `place_value_patterns` needs `TenPatternState`, because a sequence, missing position, and constant difference contain more mathematics than one scaled fact.

## 5. Existing implementation reuse and duplication findings

### Practice

Current multiplication Practice registration includes:

- `equal_groups` — one regular lesson;
- `repeated_addition_to_multiplication` — two regular lessons;
- `factor_product_identification` — one regular lesson;
- `equal_groups_with_objects` — one regular lesson.

The registry also exposes `array_rows_columns`, `commutative_property_matching`, `draw_arrays`, and `valid_invalid_arrays`, but no regular Grade 3 lesson currently uses those exact types; Evaluation aliases call the first three.

These implementations are reusable adapter contracts and renderers, not reusable canonical mathematics. They use finite authored arrays, mostly ignore `seed`, and have no cross-seed mathematical variation. `equal_groups_with_objects` also includes the object noun in its key, making presentation change canonical identity.

### Try It

`src/lib/tryIt/families/multiplicationFoundations.ts` and `multiplicationFacts.ts` already provide deterministic runtime generation for all 22 target types. They should be thinned into adapters over the new shared modules rather than copied into a parallel Practice implementation.

Important duplication/legacy behavior:

- foundations and facts independently select operands, derive answers, and build keys;
- the foundation family checks a stale initial key while rerolling a duplicate candidate, then consumes presentation RNG during unsuccessful math attempts;
- the facts family builds choices before duplicate-key rejection;
- `mathProblemKey` starts with `practiceType`, so equivalent canonical state is flow/type-namespaced rather than owned by a domain core;
- the multiples-of-ten branches key hidden initial `a,b` values, omit the displayed factor, and include an unrelated hidden product;
- associative keys encode the two-factor intermediate as the helper’s “total,” not the actual three-factor result.

### Evaluation

Evaluation already delegates through `generateProblemsForPracticeType`, so exact registry entries are the correct integration seam. The legacy alias table currently hides missing support and, in several cases, changes the lesson semantics.

There is also cross-flow architecture debt: `generateEvaluationProblems` rewrites the canonical key as `evaluation-<lesson>-<reviewType>-<coreKey>`. The approved architecture says adapters own IDs while the shared core owns `problemKey`. Correcting this globally can affect all 36 Grade 3 evaluations, so it should be handled in the serialized integration/cross-flow work with full Evaluation invariants, not casually inside an isolated multiplication core slice.

## 6. Canonical `problemKey` strategy

Rules for every family:

1. Generate canonical mathematical state first.
2. Compute `problemKey` only from learner-visible mathematical state and assessed form/representation.
3. Reject duplicate keys before selecting nouns, wording, distractors, choice order, IDs, hints, or feedback.
4. Derive the correct answer in the core.
5. Let adapters add presentation and flow contracts without rewriting the key.

Ordered roles belong in model keys. Context nouns do not. Strategy ID belongs in a key only when the strategy is shown or assessed. Every operand belongs in multi-step/property keys.

Recommended formats are specified in the inventory and intentionally use named fields. They are easier to audit than positional keys and prevent the current hidden-RNG problem.

## 7. Misconception strategy

Shared candidate helpers should return domain candidates, not final choices. Adapters choose the required count and shuffle.

- **Equal groups:** addition of factors; one missing/extra group; returning one factor; unequal-group interpretation.
- **Repeated addition:** wrong repetition count; wrong addend; addition total off by one group. A commuted equation is only a distractor when ordered group roles are explicit.
- **Arrays:** swapped row/column labels; missing/extra row or column; adding dimensions; ragged/unequal rows. Swapping dimensions is not a wrong product.
- **Number lines:** wrong jump count, wrong jump size, missing/extra jump, using count/size as endpoint.
- **Terms:** factor/product label swaps, sum instead of product, partial tuple.
- **Facts:** addition, adjacent-fact products, missing/extra known-fact group, zero/identity confusion.
- **Unknown factors:** visible factor, product, wrong quotient orientation, adjacent factor.
- **Commutative property:** changed factor, changed product, one unreversed factor, addition equation.
- **Associative property:** changed factor/order, wrong intermediate, stopping at intermediate, adding a factor.
- **Strategies:** a valid strategy for another fact, one invalid intermediate, correct structure with wrong result. Do not mark a mathematically valid alternative strategy wrong merely because it was not preferred.
- **Multiples of ten:** unscaled basic product, extra/missing zero, addition, wrong constant difference, digit shift without value scaling.

Every multiple-choice adapter must prove unique choices and exactly one semantically correct choice after normalization.

## 8. Semantic test strategy

### Family A — Multiplication Models

- Independently parse/displayed values and verify `groupCount × groupSize = product`.
- Reconstruct repeated addition with exactly `groupCount` copies of `groupSize` and sum independently.
- Reconstruct an array as exactly `rows × columns` cells; reject ragged or dimension-mismatched models.
- Reconstruct a number line from 0 with exactly `jumpCount` equal jumps and verify endpoint.
- For model connections, independently parse source and target roles and verify the same ordered factors and product.
- Verify role-reversed stories are not accepted when the prompt defines groups/items.
- Verify same seed determinism, cross-seed variation, unique keys, and duplicate rejection before presentation RNG.

### Family B — Factor/Product Terms

- Parse the displayed equation without calling the production generator.
- Assert both factors match the displayed operands as an unordered pair and product equals their multiplication.
- Include square facts and identity cases in direct core tests.
- Verify factor/product distractors are unique and exactly one tuple/choice is correct.

### Family C — Fact Fluency & Strategies

- Independently multiply displayed factors.
- Assert fixed-factor types always include the configured factor.
- Assert mixed facts cover and remain within 0–9, including deliberate 0/1 evidence across a seed sample.
- Verify exact identities: `3n=2n+n`, `4n=2(2n)`, `6n=5n+n`, `7n=5n+2n`, `8n=2(2(2n))`, `9n=10n−n`.
- For strategy choice, independently evaluate every displayed intermediate equation and prove exactly one offered strategy is valid for the shown fact.
- Verify deterministic/variation/key/choice invariants.

### Family D — Unknown Factor

- Parse each equation and assert exactly one unknown.
- Substitute the answer and independently verify the multiplication equality.
- Assert `unknownPosition` is represented in the key and both positions vary across seeds.
- Enforce factor/product domains and unique choices.

### Family E — Multiplication Properties

- For commutative state, assert the same two factors occur in reverse order and both products are equal.
- For array pairs, verify rows/columns match the actual represented array.
- For associative state, independently compute both parenthesized sides, assert all three factors are unchanged and in the same order, and assert both equal the final product.
- Assert all three factors and property/representation state are in the key.
- Include square commutative and repeated-factor associative cases.

### Family F — Multiples of Ten

- Independently verify `multipleOfTen = 10 × tensDigit`.
- Verify `basicProduct = oneDigit × tensDigit` and `scaledProduct = 10 × basicProduct`.
- Parse word-problem groups/size and verify the same scaled fact.
- Reconstruct every pattern term and constant difference; ensure all shown operands/positions are represented by the key.
- Enforce one-digit and 10–90 domains and maximum product.
- Verify keys contain actual displayed operands and no hidden RNG values.

### Cross-family/flow tests

- Same canonical state yields the same key in direct core, Practice, and Try It adapters.
- Evaluation resolves each exact target type through the registered generator, not an alias/default path.
- Requested Practice counts are fulfilled in guided/independent/challenge modes.
- No duplicate key/fingerprint within a session or Evaluation.
- Presentation RNG changes nouns/choice order without changing the canonical key.
- Whole-grade coverage becomes 55/89 and remains balanced at 144.

## 9. Recommended implementation slices

Shared-routing files are deliberately deferred to Slice 8. This creates real parallelization seams: family slices can add/test modules without competing over `registry.ts`, the two existing Try It monoliths, or Evaluation tests.

### Slice 1 — Canonical fact primitive, equal groups, and terms

- **Exact remaining types:** `count_equal_groups`, `factors_and_products`
- **Also migrate to the shared core without changing coverage count:** `equal_groups`, `repeated_addition_to_multiplication`, `factor_product_identification`, `equal_groups_with_objects`
- **Proposed new shared files:**
  - `src/lib/multiplication/types.ts`
  - `src/lib/multiplication/facts.ts`
  - `src/lib/multiplication/equalGroups.ts`
  - `src/lib/multiplication/misconceptions.ts`
  - matching focused tests
- **Practice adapters:** `src/practiceTypes/multiplicationEqualGroups.ts`, `src/practiceTypes/multiplicationTerms.ts`; preserve old exported generator entry points as thin compatibility adapters.
- **Existing files likely touched:** the four current Unit 1 Practice generator files; no registry/routing file yet.
- **Dependencies:** none.
- **Parallel:** No; this freezes the shared primitive/interface used by later slices.
- **Focused tests:** arithmetic reconstruction, role direction, term labels, squares, zero/identity, domain misconceptions, pre-presentation duplicate rejection, determinism/variation.
- **Integration afterward:** Slice 8 registers the two new exact types and connects Try It/Evaluation.

### Slice 2 — Constructed models: draw and arrays

- **Exact types:** `draw_multiplication`, `build_arrays`
- **Proposed files:** `src/lib/multiplication/arrays.ts`, `src/practiceTypes/multiplicationArrays.ts`, focused tests.
- **Existing files likely touched:** `src/practiceTypes/drawArrays.ts` and `arrayRowsColumns.ts` become compatibility adapters after core validation; UI files only after an approved construct/array contract.
- **Dependencies:** Slice 1 fact primitive; UI contract for genuine draw/array behavior.
- **Parallel:** Yes with Slices 3–6 after Slice 1, provided it does not touch shared routing or the Try It monolith.
- **Focused tests:** exact cell reconstruction, row/column orientation, non-ragged arrays, construct-task answer contract, keys and uniqueness.
- **Integration afterward:** Slice 8; UI/flow adapter validation is serialized.

### Slice 3 — Number-line and cross-model connections

- **Exact types:** `multiplication_number_line`, `connect_models_equations_stories`
- **Proposed files:** `src/lib/multiplication/numberLines.ts`, `src/lib/multiplication/modelConnections.ts`, `src/practiceTypes/multiplicationModelConnections.ts`, focused tests.
- **Existing files likely touched:** `PracticeProblem`/Try It visual contracts and renderers only after ChatGPT approves the representation design.
- **Dependencies:** Slice 1; approved array/number-line presentation contracts.
- **Parallel:** Yes with Slices 2, 4, 5, and 6 under independent file scope.
- **Focused tests:** jump reconstruction, endpoint, source/target semantic equivalence, ordered roles, unique semantic choices.
- **Integration afterward:** Slice 8.

### Slice 4 — Fixed and mixed fact fluency

- **Exact types:** `multiply_by_3`, `multiply_by_4`, `multiply_by_6`, `multiply_by_7`, `multiply_by_8`, `multiply_by_9`, `mixed_multiplication_facts`
- **Proposed files:** `src/lib/multiplication/factStrategies.ts`, `src/practiceTypes/multiplicationFacts.ts`, focused tests.
- **Existing files likely touched:** none before integration.
- **Dependencies:** Slice 1 fact primitive.
- **Parallel:** Yes with Slices 2, 3, 5, and 6.
- **Focused tests:** fixed-factor/range enforcement, mixed 0–9 coverage, all six independent strategy identities, correct products, domain distractors, deterministic variation.
- **Integration afterward:** Slice 7 consumes strategy state; Slice 8 routes flows.

### Slice 5 — Unknowns and properties

- **Exact types:** `missing_factors`, `two_equations_for_array`, `commutative_multiplication`, `associative_multiplication`
- **Proposed files:** `src/lib/multiplication/unknownFactors.ts`, `src/lib/multiplication/properties.ts`, `src/practiceTypes/multiplicationProperties.ts`, focused tests.
- **Existing files likely touched:** `src/practiceTypes/commutativeProperty.ts` becomes a compatibility adapter after the core passes.
- **Dependencies:** Slice 1.
- **Parallel:** Yes with Slices 2, 3, 4, and 6; do not integrate array presentation concurrently with Slice 2.
- **Focused tests:** one-unknown substitution, both positions, commutative reversal, associative equivalence/intermediates, three-factor keys, square/repeated-factor cases.
- **Integration afterward:** Slice 8 serializes array/property and Try It routing.

### Slice 6 — Multiples of ten and patterns

- **Exact types:** `multiples_of_ten_basic_facts`, `one_digit_by_multiples_of_ten`, `multiples_of_ten_word_problems`, `place_value_patterns`
- **Proposed files:** `src/lib/multiplication/multiplesOfTen.ts`, `src/practiceTypes/multiplesOfTen.ts`, focused tests.
- **Existing files likely touched:** none before integration.
- **Dependencies:** Slice 1.
- **Parallel:** Yes with Slices 2–5.
- **Focused tests:** basic/scaled reconstruction, 10–90 domain, word-state agreement, sequence reconstruction/constant difference, actual operands in keys, no hidden RNG.
- **Integration afterward:** Slice 8.

### Slice 7 — Strategy reasoning

- **Exact type:** `choose_strategy`
- **Proposed files:** extend `src/lib/multiplication/factStrategies.ts`; add `src/practiceTypes/multiplicationStrategy.ts` and focused semantic tests.
- **Existing files likely touched:** none before integration.
- **Dependencies:** Slice 4 strategy identities.
- **Parallel:** May run alongside unfinished Slices 2, 3, 5, or 6, but not alongside Slice 4.
- **Focused tests:** evaluate every shown intermediate independently, exactly one valid offered strategy, correct product, no subjective “best” contract.
- **Integration afterward:** Slice 8.

### Slice 8 — Serialized Practice / Try It / Evaluation integration

- **Exact types:** all 22, routing only; no new mathematics.
- **Proposed Try It adapter files:** family-scoped adapters under `src/lib/tryIt/families/multiplication/`; retain `multiplicationFoundations.ts` and `multiplicationFacts.ts` as thin dispatch/compatibility modules.
- **Existing shared files likely touched:**
  - `src/practiceTypes/registry.ts`
  - `src/lib/tryIt/families/index.ts`
  - `src/lib/tryIt/families/multiplicationFoundations.ts`
  - `src/lib/tryIt/families/multiplicationFacts.ts`
  - `src/practiceTypes/evaluationReviewResolver.ts` and aliases only where exact registrations make aliases obsolete
  - focused Practice, Try It, Evaluation, usability, and coverage tests
- **Dependencies:** Slices 1–7 and required UI contracts.
- **Parallel:** No. This is the deliberate serialization point for shared high-contention files.
- **Focused tests:** all family semantic suites, exact registry support for all 22, exact Evaluation resolution, requested counts, 55/89 coverage, Try It whole-grade invariants, and canonical key preservation checks.
- **Integration afterward:** run TypeScript, targeted ESLint, multiplication/Evaluation/whole-grade coverage suites; do not widen to Warm-Up/Quick Check migration.

**Total recommended implementation slices: 8.**

## 10. Parallelization boundaries

Safe schedule:

1. Complete Slice 1 and freeze its interfaces.
2. Run Slices 2, 3, 4, 5, and 6 in parallel only with disjoint family files and direct tests.
3. Run Slice 7 after Slice 4; it may overlap Slices 2, 3, 5, or 6.
4. Run Slice 8 alone.

Unsafe parallel work:

- any two sessions editing `src/practiceTypes/registry.ts`;
- any two sessions editing the current `multiplicationFoundations.ts` or `multiplicationFacts.ts` Try It family;
- concurrent alias/Evaluation resolver changes;
- concurrent UI contract changes for arrays/number lines;
- independent reinvention of factor/range/key rules after Slice 1.

## 11. Projected coverage after completion

| State                           | Family-backed | Fallback-backed |   Total |
| ------------------------------- | ------------: | --------------: | ------: |
| Current verified state          |            33 |             111 |     144 |
| Multiplication lessons migrated |           +22 |             −22 |   0 net |
| Projected after full sprint     |        **55** |          **89** | **144** |

The arithmetic balances: `33 + 22 = 55`, `111 − 22 = 89`, and `55 + 89 = 144`.

The projected count describes Practice registry coverage. Refactoring already registered multiplication adapters onto the canonical core improves Generator-First correctness but does not add to the 22-lesson migration count.

## 12. Unresolved questions and blockers

1. **Array/draw/number-line presentation contract:** Practice has no number-line visual type, and Try It renders only equal-group clusters. Genuine adherence to `draw_multiplication`, `build_arrays`, `multiplication_number_line`, and full model connections requires an intentional UI contract owned/approved by ChatGPT. Do not pretend an equal-group cluster is a number line or array.
2. **Evaluation key namespacing:** the current Evaluation adapter rewrites core keys, contrary to the approved ownership rule. This should be corrected in serialized cross-flow work with all 36 Evaluation paths covered; it must not be slipped into a parallel family slice.
3. **Operand-language inconsistency:** Unit 1/9 define first factor = number of groups, while some fact-strategy prose describes the second factor as the number of groups. Use role-neutral `FactState`; only model adapters assign group roles. This avoids a curriculum edit and prevents reversed repeated-addition explanations.
4. **Strategy-choice uniqueness:** “best/easiest strategy” is subjective. The safe generated contract is “Which shown strategy correctly finds this product?” with exactly one mathematically valid offered strategy, followed by the product. A different interaction requires product/UI approval.

None of these blocks Slice 1. Items 1 and 2 block final full-flow completion for the affected types unless explicitly resolved.

## 13. Verification performed for this audit

Focused tests run:

```text
npx vitest run \
  src/practiceTypes/generatorFamilyCoverage.test.ts \
  src/practiceTypes/grade3PracticeUsability.test.ts \
  src/practiceTypes/evaluationReviewResolver.test.ts \
  src/practiceTypes/evaluation.test.ts \
  src/lib/tryIt/tryItSemantic.test.ts \
  src/lib/tryIt/wholeGradeInvariants.test.ts
```

Result: **6 test files passed, 73 tests passed, 0 failed**.

The suites confirm current 144/33/111 coverage, usable current fallback output, Evaluation routing, deterministic Try It behavior, unique current keys within attempts, and current choice invariants. They do **not** invalidate the semantic findings above: current tests do not assert requested count fulfillment for fallback lessons, real array/number-line rendering, property-specific objectives, strategy validity, or actual operands in multiples-of-ten keys.
