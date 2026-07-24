# LumaMath Roadmap

## Completed

### Documentation Foundation

- `manifesto.md`, `vision.md`, `product_philosophy.md`, `learning_model.md`, `curriculum.md`
- `content_architecture.md`, `blueprint.md`, `design_system.md`, `project_rules.md`, `glossary.md`
- `docs/README.md` authority hierarchy and index
- `implementation_status.md` as the living current-state snapshot

### Grade 3 Vertical Slice

- JSON curriculum data for Grade 3 with Zod validation
- Canonical lesson contract enforcing Warm-Up, Learn, Try It, and Practice for `lesson_type: "lesson"`
- Student learning path with Warm-Up, Learn, Try It, Practice, and Evaluation
- Guided, Independent, and Challenge practice modes
- Flashcard sessions and categories
- Student progress tracking via `StudentProgressContext`
- `curriculum:check` validation workflow

## Active

- Documentation maintenance and stale-document resolution
- Alignment of the runtime with `blueprint.md` and `content_architecture.md`

## Planned

### Phase 1: Runtime Alignment

- Refactor runtime to consume Content Contracts directly
- Replace temporary adapters with contract-driven content loading
- Generalize content loading from Grade 3 to a K–6 grade abstraction

### Phase 2: Responsive Design

- Tablet-first student experience per `design_system.md`
- Phone-friendly parent controls and reports
- Cross-browser compatibility and progressive enhancement

### Phase 3: Parent and Multi-Student Features

- Multi-student profile support
- Parent reporting dashboard
- Persistent, multi-device progress storage

### Phase 4: Mastery and Assessment

- Skill assessments and placement
- Mastery tracking and gap analysis
- Expanded adaptive practice and recommendations

### Phase 5: Polish and Scale

- Performance optimization
- Accessibility improvements
- Testing and QA
- Offline support, sync, and optional AI tutoring

## Future Considerations

- Native app wrappers
- Advanced analytics
- Broader ecosystem integrations
