# Authoring guide for "Leer Lean"

Read this before writing or regenerating any lesson. The reference lesson is
`lessons/m0-l1.html` with `questions/m0-l1.js`: copy its structure.

## Who the course is for

Spanish-speaking adults, designed for ADHD: short steps, one idea at a time,
immediate feedback, nothing to memorise. Secondary-school maths is enough;
logic, sets, functions and proofs are taught from the base. No programming
experience and no prior Lean familiarity are assumed: the typical learner
works with Lean that an AI wrote for them. Each learner's specifics live in
`tutor/profile.md` (private, git-ignored); adapt new lessons to it.

The goal is **reading and auditing** Lean that an AI wrote, not writing it.
Thesis, repeated in every module: *Lean checks the proof; you check (a) the
statement, (b) the definitions it uses, (c) the assumptions: axioms,
hypotheses hidden in structures or `variable` lines, and whether the model
matches the real code.*

## Files per lesson

| File | Purpose |
| --- | --- |
| `course/lessons/<id>.html` | the lesson (ids like `m1-l3`) |
| `course/questions/<id>.js` | its question bank (strict JSON inside the wrapper) |
| `practice/Practice/M<n>/L<k>.lean` | the lab file, if the catalog lists one |

The catalog (`course/catalog.js`) owns titles, goals, minutes, lab paths and
which lesson introduces each cheat-sheet symbol. Do not repeat that data in
the lesson. Shared files (`assets/*`, `catalog.js`) change only on purpose.

## Lesson skeleton

```html
<body data-page="lesson" data-lesson="m1-l3" data-base="../">
<main id="lesson">
  <section class="step" data-kind="cover">      <!-- h1 = catalog title -->
    <h1>...</h1>
    <p class="lede">En una frase: ...</p>
    <div class="why"><p><strong>Por qué te importa:</strong> ...</p></div>
  </section>
  <section class="step"> ... </section>          <!-- 3 to 5 concept steps -->
  <section class="step" data-kind="boss"> ... <div class="boss-view"></div> ... </section>
  <section class="step" data-kind="lab" data-file="Practice/M1/L3.lean"> ... </section>
  <section class="step" data-kind="wrap"><h2>Llévate esto</h2><ul class="takeaways">3 items</ul></section>
</main>
<script src="../catalog.js"></script>
<script src="../assets/boss.js"></script>         <!-- only if there is a boss step -->
<script src="../questions/m1-l3.js"></script>
<script src="../assets/engine.js"></script>
</body>
```

Rules: at most 9 steps in total; one idea per step; at most about three short
paragraphs per step; each concept step ends with one question (`<div class="q"
data-q="m1-l3.some-id"></div>`). The engine adds the goal box, timing, "Ya me
lo sé", navigation, finish panel and lab buttons.

## Building blocks

- Lean block: `<pre class="lean" data-check="ok">...</pre>`. Code goes flush
  left right after `<pre ...>`. Escape `<` as `&lt;` and `&` as `&amp;`.
- Magnifier (clickable pieces): wrap the `pre` in `<figure class="lupa">` and
  mark pieces as `⟪code|noteId⟫`, then add
  `<script type="application/json">{"noteId": "html explanation"}</script>`
  inside the figure. Mark the pieces that matter, not every token. A marker
  must never start after `-->` on an output line: wrap the whole
  `--> value` segment or nothing.
- Inline Lean: `<code class="l">x ∧ y</code>` (highlighted). Plain `<code>`
  for file names, commands and messages.
- Asides: `<div class="analogy">` (comparison), `<div class="note">` (extra
  info), `<div class="trap">` (audit warning, at least one per lesson).
- Truth tables: `<div class="table-scroll"><table class="truth">` with
  `<td class="T">V</td>` and `<td class="F">F</td>`.
- Expected output: end an `#eval`/`#check` line with `--> value`, exactly as
  Lean prints it. The checker verifies it and the page shows it as
  "Lean: value".

### `data-check` values (checked by `tools/check_course.py`)

| value | meaning |
| --- | --- |
| `ok` (default) | compiles, no errors, no sorry |
| `sorry` | compiles with a sorry warning |
| `error` | must fail; add `data-error="substring of the message"` |
| `skip` | fragment that is not valid on its own (use sparingly) |

Blocks with `error` or `sorry` get a red or yellow label automatically; a
block that triggers a warning on purpose (for example an unused hypothesis
the lesson is about) takes `data-allow-warn` (questions: `"allowWarn": true`,
lab files: a `-- check: allow-warn` line at the end).

A snippet that needs earlier definitions: give the earlier block
`data-id="defs"` and this one `data-uses="defs"`. Questions use
`"uses": ["defs"]`. Avoid extra warnings (unused variables etc.) unless the
lesson is about them.

## Questions (`questions/<id>.js`)

```js
window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  { "id": "m1-l3.vacuous", "type": "mcq", "concept": "vacuous-truth",
    "prompt": "html", "code": "optional Lean, string or array of lines",
    "check": "ok", "options": [
      { "t": "html", "ok": true, "why": "why it is right" },
      { "t": "html", "why": "why this tempting answer is wrong" } ],
    "explain": "optional html shown after answering" },
  { "id": "m1-l3.spot-trap", "type": "spot", "concept": "...",
    "prompt": "¿Qué línea...?", "code": ["line 1", "line 2"],
    "answer": [2], "why": "html", "check": "skip" }
]
);
```

- Ids are stable forever (`<lesson>.<slug>`): review history hangs on them.
  When regenerating a lesson, keep ids whose meaning did not change.
- Exactly one correct option; every option has a `why`; distractors are real
  misconceptions, not jokes. Options are shuffled, so never write "la de arriba".
- 5 to 8 questions per lesson. Mix: Lean to Spanish, Spanish to Lean,
  "¿qué responde Lean?", "¿dónde está la trampa?".
- Strict JSON: double quotes, no trailing commas, escape `"` inside html as `\"`.
- Variants the tutor adds after a lesson is live (for a repeated
  misconception) carry `"reviewOnly": true`: they are not placed in the lesson
  and reach the learner through review and test-out.

### Maths questions (see `MATH.md`)

```js
  { "id": "t1.divmod-a", "type": "num", "gen": "divmod", "concept": "division-remainder" },
  { "id": "t1.days-a", "type": "mcq", "gen": "daysLater", "concept": "days-mod-7" },
  { "id": "t1.lab-365", "type": "num", "concept": "nat-mod",
    "prompt": "html", "code": "#eval 365 % 7", "check": "ok",
    "parts": [{ "label": "Lean responde", "form": "integer", "answer": "1" }],
    "steps": ["html step", "html step"],
    "traps": [{ "part": 0, "value": "52", "code": "quotient-instead", "msg": "html" }] }
```

- `gen` names a generator in `assets/math.js`; the card gets new numbers every
  time it is shown (lesson, review). Prompt, options, steps and traps come from
  the generator. `"showLean": true` adds the generator's `#eval` lines to the
  worked solution (only `Nat` lines before m2-l1, where type ascriptions are
  taught).
- Fixed `num` questions: `form` is `integer`, `fraction`, `reduced` or
  `number` (see `MATH.md`); `answer` is written `12`, `-3` or `3/4`; always add
  worked `steps`; add `traps` for the wrong values a real misconception gives.
- A new generator needs: a `version` (bump it when the problem it makes for a
  seed changes), worked steps for every variant, traps with a `code` and a
  message, and `lean` lines built from the problem's numbers so the checker can
  compare them with Lean. `tools/math_selftest.js` runs every generator over
  400 seeds.
- Every lesson page loads `assets/math.js` before `assets/engine.js`.
- Figures: inline SVG inside `<figure class="fig">`, colours only through the
  CSS tokens (classes `fig-day`, `dots-full`, `dots-rest`, `fig-label`), an
  `aria-label` that says what the figure shows, and a short `figcaption`.

## Lab files

Lean files the learner opens in VS Code. Spanish instructions in comments
(they are lesson text for the learner, not code comments); identifiers in
English. Keep them short: 3 to 6 numbered tasks such as "pon el cursor en la
línea 12 y mira el panel Lean Infoview", "cambia el 4 por un 5 y mira qué pasa,
luego Ctrl+Z". The file must compile cleanly as committed (the checker runs it);
add `-- check: sorry-allowed` only if a sorry is the point of the lab. The
lab step in the HTML asks one or two questions about what the learner saw, so
it gets tracked. The lab is optional: never make later lessons depend on it.

## Language and tone

- Spanish from Spain, "tú", short sentences, plain words. Explain every new
  word the first time. Sentence case in headings.
- Gender-neutral when addressing the learner (no "listo/lista"; prefer
  "ya lo tienes", "te toca").
- Never use em dashes or the label "TL;DR". Use commas, colons or parentheses.
- Analogies from everyday life, money and contracts, and online games
  (servers validating moves, raid requirements, loot rules).
- Code identifiers and any code comment inside snippets in English; prefer no
  comments in snippets and explain through magnifier notes instead.
- Do not use a logical symbol (≠ ∧ ∨ ¬ → ↔ ∀ ∃ ⊢) before the lesson that
  introduces it (the checker warns). Boss steps are exempt.

### Glossary (use exactly these Spanish terms)

| English | Español |
| --- | --- |
| statement | enunciado |
| proof | demostración |
| proposition | proposición |
| hypothesis | hipótesis |
| conclusion | conclusión |
| goal | objetivo |
| tactic | táctica |
| definition | definición |
| type | tipo |
| function | función |
| argument | argumento |
| axiom | axioma |
| counterexample | contraejemplo |
| witness | testigo |
| model / spec / implementation | modelo / especificación / implementación |
| infoview | panel Lean Infoview (o "el panel de Lean") |
| error (red) / warning (yellow) / info (blue) | error en rojo / aviso en amarillo / respuesta en azul |
| true / false (logic) | verdadero / falso (V / F en tablas) |
| for all / exists | para todo / existe |
| if ... then / iff | si... entonces / si y solo si |

## Boss pieces

`assets/boss.js` tags each piece of the boss (the main soundness theorem of
a real WHIR verifier, written by AI) with the lesson
that teaches it. The boss step of a lesson explains today's pieces (they glow)
and asks one question about them. If a lesson clears nothing, its boss step
still connects the lesson to the real code.

## Rendering notes

- Code is shown without ligatures (`=>` stays `=>`, as in VS Code).
- `∧` and `∨` use a math font so `∨` cannot be mistaken for the letter v or
  the V of a truth table. Still, never put `∨` next to a lone V or v where
  the two could be confused.

## Before you finish

1. `python3 tools/check_course.py <lesson-id>`: 0 errors, and read the warnings.
2. Walk the lesson with `tools/walk_lessons.js` against a test server (see
   the header of that file) and look at every screenshot.
