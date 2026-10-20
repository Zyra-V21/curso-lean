# Leer Lean

An interactive course, in Spanish, for learning to **read and audit Lean 4
proofs written by AI**, from zero, with a maths track interleaved. It is
designed for adults with ADHD: short steps, one idea at a time, immediate
feedback, spaced review. Lean checks the proof; the reader checks the
statement, the definitions and the assumptions.

**En español:** un curso interactivo para aprender a leer y auditar
demostraciones de Lean 4 escritas por una IA, desde cero, con mates
intercaladas (estilo Math Academy). Pensado para personas con TDAH. Tu
progreso se queda en tu ordenador, y una IA (por ejemplo Claude Code) hace de
tutor leyendo ese progreso.

## What is inside

- 13 Lean lessons (modules 0 to 3.2): what Lean is, VS Code, logic, types,
  functions, structures, reading theorems and spotting traps. Later modules
  are planned in `course/SYLLABUS.md` and built by the tutor as the learner
  gets close to them.
- A maths track (`course/MATH.md`): fun theorems between Lean modules (the
  first one is division with remainder), typed answers with generated
  problems, worked solutions, and short maths check bites.
- A "boss": the main soundness theorem of a real WHIR verifier, written by
  AI, shown in fog; each lesson clears the pieces it teaches you to read.
- Mastery at 80%, "Ya me lo sé" test-outs, spaced review with fresh numbers,
  a placement test and a cheat sheet.

## Start

Requirements: Python 3, Lean 4 via [elan](https://github.com/leanprover/elan)
(the practice project pins 4.35.0), VS Code with the `leanprover.lean4`
extension (the workspace also recommends `usernamehw.errorlens`, which shows
Lean's answers at the end of each line). Node.js is only needed for the
course checker.

```bash
git clone https://github.com/Zyra-V21/curso-lean.git
cd curso-lean
(cd practice && lake build)   # first time only: fetches the Lean toolchain
./start-course.sh             # starts the local server and opens the course map
./start-course.sh lab         # opens the Lean practice project in VS Code
./start-course.sh stop        # stops the server
```

Optional shortcut: `ln -s "$PWD/start-course.sh" ~/.local/bin/curso-lean`.

## The tutor

Every answer is appended to `tutor/events.jsonl` by the local server. Open an
AI coding agent in this folder (for example Claude Code, which reads
`CLAUDE.md`; other agents read `AGENTS.md`, the same file) and say "tutor".
The first time, it interviews you and writes `tutor/profile.md`. After that
it runs `tools/progress_report.py`, answers the notes you leave at the end of
each lesson, explains again what you got wrong, adds review questions and
builds the next lessons adapted to you.

Privacy: everything about you (`tutor/events.jsonl`, `tutor/notes.md`,
`tutor/profile.md`) is git-ignored and never leaves your machine unless you
send it somewhere.

## What is where

- `course/`: lessons (`lessons/`), question banks (`questions/`), the
  catalog and the engine (`assets/`; `assets/math.js` holds the maths answer
  parser and problem generators). See `course/AUTHORING.md`,
  `course/SYLLABUS.md` and `course/MATH.md`.
- `practice/`: Lake project with one lab file per lesson.
- `server/server.py`: local server on 127.0.0.1:8642; records answers.
- `tools/check_course.py`: verifies every Lean snippet and output claim
  against Lean, and checks the maths generators (`tools/math_selftest.js`).
- `tools/progress_report.py`: progress summary for the tutor.
- `tools/walk_lessons.js`: headless end-to-end walk of the pages.

## License

MIT, see `LICENSE`. Fonts: Atkinson Hyperlegible Next, JuliaMono (subset)
and Noto Sans Math (subset), under the SIL Open Font License, vendored with
their licenses in `course/assets/fonts/`.
