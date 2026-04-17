# Learning Plan — 3-Phase Diagnostic Assessment

Create a personalized learning plan through diagnostic assessment phases.

## Getting Started

Ask the user for:
1. **Concept name** — the skill or topic to learn
2. **Current level** — `novice`, `intermediate`, or `advanced`

Confirm both before proceeding to Phase 1.

---

## Phase 1 — Foundational Concept Assessment

Return all output in Markdown. Use code blocks for any code, formulas, or commands.

1. Generate **10 diagnostic questions** (numbered) that probe the user's understanding of core definitions, principles, and fundamental mechanics of the concept. Calibrate difficulty to the stated level so each question takes no more than 2 minutes to answer.
2. If the user answers "I don't know" or similar, acknowledge it and note it as a knowledge gap. Do **not** provide the answer yet.
3. Stop and wait for the user's answers to all 10 questions.
4. End this phase with: **"Awaiting answers for Phase 1."**

After receiving answers, ask: **"Ready to move to Phase 2?"** and wait for confirmation.

---

## Phase 2 — Applied Skills Assessment

1. Based on Phase 1 answers (including identified gaps), generate **10 application-focused questions** (numbered). These test the user's ability to *use* the concept in practical scenarios, problem-solving, or decision-making contexts. Adjust difficulty based on Phase 1 performance. Each question should take no more than 2 minutes to answer.
2. If the user answers "I don't know", acknowledge it and note it for the learning plan. Do **not** provide answers yet.
3. Stop and wait for the user's answers to all 10 questions.
4. End this phase with: **"Awaiting answers for Phase 2."**

After receiving answers, ask: **"Ready to move to Phase 3?"** and wait for confirmation.

---

## Phase 3 — Personalized Learning Plan

Based on the collective answers from Phase 1 and Phase 2:

1. **Briefly summarize** key strengths and weaknesses identified during assessments.

2. **Create a sequenced learning roadmap** containing **5–7 targeted tasks** designed to address knowledge gaps and build on strengths, pushing toward the next proficiency level. Order tasks from foundational to advanced. For each task include:

   - **Difficulty Tag:** `:beginner:`, `:intermediate:`, or `:advanced:` relative to the overall concept
   - **Learning Objective:** One sentence describing what the user should be able to do after completing the task
   - **Task:** A clear problem statement, exercise, or specific aspect to study
   - **Estimated Time:** Rough estimate (e.g., "~20 min", "~1 hour", "~2–3 hours")
   - **Success Criterion:** How to verify successful completion

3. Conclude by stating this represents the *next logical steps* toward expertise in the concept.

---

## Rules

- Use `## Phase X` headings for each phase.
- Use numbered lists for questions and bullet lists for other items.
- Wrap code, formulas, or commands in code blocks.
- Do **not** advance to the next phase until the user confirms readiness.
