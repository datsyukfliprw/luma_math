# LumaMath Design System

## Purpose

This document defines the visual and interaction design language of LumaMath. It explains how design supports learning, communicates feedback, builds confidence, and remains consistent across the platform. It is the canonical reference for designers, engineers, illustrators, and AI systems who contribute to the look and feel of LumaMath.

This document is not a catalog of components, a style guide for a specific technology, or a specification for individual screens. It describes the principles that govern every visual and interactive decision. The implementation of these principles lives in the code, but the principles themselves are independent of any framework.

## Design Principles

The LumaMath Design System is built on the belief that visual design is part of the educational experience. How something looks and feels shapes how a child understands it, how confident they feel, and how willing they are to persist.

Clarity comes first. Every screen should make its purpose obvious. A child should never have to guess what to do, where to look, or what will happen next. Clarity reduces cognitive load and frees the child to focus on the mathematics.

Calm supports learning. Learning requires concentration. The design should feel peaceful, predictable, and safe. Harsh contrasts, aggressive animations, and cluttered layouts create anxiety. The design should reduce anxiety rather than add to it.

Confidence is built through small successes. Every interaction should feel achievable. Feedback should make progress visible. Transitions should feel smooth. A child should always know they are moving forward.

Beauty communicates respect. Children deserve software that is crafted with care. Thoughtful spacing, readable type, and intentional color choices tell the child that their learning matters.

Delight must serve learning. Animation, color, sound, and character can support motivation, but they should never distract from the task at hand. Decorative flourishes that do not improve understanding are not appropriate.

## Visual Identity

The visual identity of LumaMath is warm, trustworthy, and inviting. It should feel like a calm learning environment rather than a game or a testing platform.

The identity is expressed through a consistent visual vocabulary: friendly but not childish, structured but not rigid, colorful but not chaotic. The visual language should feel familiar across every Lesson and every surface, so children can focus on learning instead of relearning the interface.

The mascot and illustrations are part of this vocabulary. They appear in moments of celebration, guidance, and encouragement. They are not used to decorate instructional content or to compete with the mathematics for attention.

## Color Philosophy

Color in LumaMath is functional before it is decorative. Color should guide attention, signal state, and support meaning. It should never be the only way information is conveyed.

Primary colors establish the brand and the learning environment. Accent colors highlight action, progress, and feedback. Neutral colors provide structure and rest. Warning and success colors communicate the result of an interaction.

Color should support emotional tone. Calm backgrounds reduce anxiety. Subtle highlights direct focus. Strong color reserved for feedback. The palette should remain consistent enough that children learn to associate specific colors with specific meanings.

Color alone should never be the sole indicator of correctness, importance, or state. Visual cues such as shape, text, position, and iconography should always accompany color to support accessibility.

## Typography

Typography should make reading effortless for children. Text should be large enough, spaced enough, and weighted enough to be read comfortably on a tablet held at a natural distance.

Type hierarchy should be obvious. Headlines, teaching points, questions, hints, and body text each have a distinct role. A child should be able to tell the importance of a piece of text by its size, weight, and position.

Line length and line height should support young readers. Lines that are too long are hard to follow. Lines that are too short feel choppy. Generous line height and spacing between paragraphs improve comprehension.

Numeric and symbolic notation should be treated with the same care as words. Digits, operators, and mathematical symbols should be clear, well-spaced, and large enough to be read accurately. A child misreading a number because of poor typography is a design failure.

## Spacing and Layout

Spacing should create order and breathing room. White space is not empty space. It is a tool for grouping related elements, separating distinct sections, and directing attention.

Layouts should be predictable. A child should be able to move from one Lesson to the next and immediately recognize where the question, input, feedback, and navigation live. Predictability reduces cognitive load and builds confidence.

Touch targets and interactive areas should be generous. Children use fingers, not precision cursors. Buttons, inputs, and cards should be large enough to interact with comfortably. Spacing around interactive elements prevents accidental taps.

The layout should support the instructional flow. The Warm-Up, Learn, Try It, and Practice sections each have a different purpose, and the layout should make that purpose clear. The most important content should be the most visually prominent. Secondary content should recede until it is needed.

## Component Philosophy

A component is a reusable visual and interactive pattern, not a piece of code. The Design System defines the behavior and purpose of components, not their implementation.

Components should be purposeful. Every button, card, input, badge, and progress indicator exists to support learning. If a component does not serve an educational purpose, it should not exist.

Components should be consistent. The same type of interaction should look and behave the same way across the platform. A child should not have to learn a new interaction pattern for every Lesson.

Components should be flexible. A question card may contain a number line, an equation, or an image, but its structure, spacing, and feedback behavior should remain predictable. Consistency of behavior matters more than consistency of exact appearance.

## Feedback and Reinforcement

Feedback is a teaching tool. It tells the child what happened, what to do next, and how to improve. Feedback should be immediate, specific, and encouraging.

Correct answers should be acknowledged clearly. The acknowledgment should feel satisfying without being overstimulating. A simple, calm confirmation is often more effective than elaborate celebration.

Incorrect answers should be treated as information. The design should communicate that a mistake is a step toward understanding. Hints, visual cues, and gentle redirection should guide the child toward the correct idea. Red marks, harsh sounds, and negative imagery should never be used.

Progress should be visible. A child should always know where they are in a Lesson and how much they have accomplished. Progress indicators should be motivating without creating pressure. They should celebrate growth, not compare performance.

## Motion and Animation

Motion should feel natural and purposeful. Animation can guide attention, signal state changes, and celebrate progress. It should never be gratuitous.

Transitions between questions, sections, and screens should be smooth. Abrupt changes can disorient a child. Well-paced motion helps the child follow the flow of the Lesson.

Celebratory animations should be brief. A short, positive animation after a significant achievement can reinforce motivation. Long or repetitive animations waste time and can become annoying.

Motion should respect the user. Animations should not prevent interaction, hide content, or create a sense of urgency. They should be subtle enough that they support focus rather than competing with it.

## Accessibility

Accessibility is not a feature. It is a fundamental requirement of the design system. LumaMath should be usable by children with a wide range of abilities, devices, and contexts.

Contrast should be sufficient for readability. Text should be readable against its background. Interactive elements should be distinguishable from static content. Visual cues should not rely solely on color.

Touch targets should be large. Interactive elements should be easy to tap without precision. Spacing should prevent accidental activation. The interface should work well for children who may have less fine motor control.

Content should be structured for assistive technologies. Headings, labels, and descriptions should be meaningful. Alternative text should describe illustrations and visual models. The order of information should make sense when read aloud.

Cognitive accessibility matters as much as visual or motor accessibility. Instructions should be simple. Navigation should be predictable. Choices should be limited at any given moment. Overwhelming a child with too much information or too many options is a design failure.

## Responsive Design

LumaMath is tablet-first. The primary learning experience is designed for a tablet held in both hands or resting on a surface. Touch, layout, and spacing are optimized for that context.

The design should adapt gracefully to other screen sizes. Smaller screens should simplify layouts and prioritize the most important content. Larger screens should not simply stretch elements; they should use the additional space to improve readability and reduce scrolling.

The parent experience may be used on phones. Parent controls, reports, and settings should be compact and scannable. The student experience should remain calm and spacious even when the same device is used by both parent and child.

## Student Experience

The student experience is the heart of LumaMath. It should feel like a calm, encouraging learning environment. The child should feel that the software is on their side.

The interface should make the mathematics the hero. Visual elements should support the problem, not compete with it. The question should be easy to read. The input method should match the problem type. Feedback should be immediate and helpful.

Emotional design matters. The child should feel capable, respected, and safe to make mistakes. The visual language should reinforce these feelings through color, spacing, typography, and motion. Nothing in the student experience should make the child feel rushed, judged, or bored.

## Parent Experience

The parent experience is supportive and transparent. It should give parents the information they need without requiring them to become educators. It should make progress, strengths, and next steps easy to understand.

Parent surfaces should be compact and efficient. Reports should use plain language. Controls should be clear. The design should build parent confidence by being honest and helpful rather than overwhelming.

The parent experience should not mimic the student experience. The goals are different. Parents need overview, insight, and control. Children need focus, interaction, and encouragement. The design should respect both audiences.

## Consistency

Consistency is the glue that holds the design system together. It allows children to focus on learning because they do not have to re-learn the interface with every new Lesson.

Consistency applies at every level. Color meaning should be consistent. Typography roles should be consistent. Spacing patterns should be consistent. Component behavior should be consistent. The way feedback is delivered should be consistent.

Consistency does not mean uniformity. Different problem types, grade levels, and content types may require different visual treatments. But the underlying grammar of the design system should remain the same. A new interaction should feel like it belongs to LumaMath.

## Future Evolution

The Design System will evolve as the platform grows. New problem types, new content formats, new surfaces, and new capabilities may require new patterns. Each addition should be evaluated against the existing system before it is introduced.

New patterns should extend the grammar, not replace it. If a new component or interaction cannot be expressed in terms of the existing principles, the principles may need to be clarified rather than ignored. The design system should become richer over time, but it should never become inconsistent.

Future considerations include adaptive layouts for new devices, richer feedback patterns for AI tutoring, and new visual treatments for parent insights. All of these should reinforce the same calm, clear, confidence-building experience that defines LumaMath.
