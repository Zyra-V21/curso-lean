# Math track ("Mates con árbitro")

Read with `AUTHORING.md` (the Lean track rules also apply here).

## Why and for whom

The maths track interleaves with the Lean modules: fun theorems that build
real maths skill, plus practice and assessment in small bites, in the style
of Math Academy. Scope: the
base (numbers, fractions, negatives, powers, equations, inequalities) plus
the maths Lean uses (division with remainder, divisibility, parity, logic,
sets, functions, induction), growing from there. No geometry for now. Time
budget: designed for 10 to 15 minutes a day for Lean and maths together, so
one lesson a day plus a short review. The learner's own level and budget are
in `tutor/profile.md`.

Level calibration: Math Academy's Mathematical Foundations I. MF I has 357 topics in 13 units (1 Fractions, 2 Ratios &
Percentages, 3 The Number System, 4 Exponents & Radicals, 5 Equations &
Inequalities, 6 Two-Variable Equations, 7 Radical & Rational Expressions,
8 Functions, 9 Absolute Value, 10 Exponential Functions, 11 Polynomials,
12 Geometry, 13 Polygons); its midpoint is unit 5, "Linear Equations With No
Solutions". The first check bite probes units 1 to 5, where adults returning
to maths usually have rust and gaps. MF II and MF III
continue to quadratics, logs, trigonometry, calculus and linear algebra.

## Principles

1. Free response. Maths answers are typed (`3/4`, `-2`, `0,75`), so guessing
   does not inflate the level. Every typed or generated card has "No lo sé",
   which shows the solution and counts as a miss without a random guess.
2. Generated problems. A bank question can name a generator (`"gen"`)
   instead of fixed numbers. Each time it is shown (lesson, review) it gets a
   fresh seed, so reviews never repeat numbers. The event logs the generator,
   its version, the seed, the prompt and the expected answer, so the tutor
   can see exactly what was asked even after a generator changes.
3. Worked solution on every miss: the steps of that same problem, then the
   next problem.
4. Assess in small bites. "Chequeo de mates" bites of about 8 problems
   (about 8 minutes). The tutor reads the result and builds lessons at the
   real frontier; no long up-front test and no automatic binary search
   (knowledge with gaps is not downward closed).
5. Lean as calculator and referee. Lean 4.35 core computes exact fractions
   (`Rat`), integers, `%`, `Nat.gcd`, `Nat.lcm` and powers; `decide` proves
   small closed facts on `Nat` (`100 % 7 = 2`), but not `Rat` equalities.
   Worked solutions may end with the `#eval` that checks them. Lean lines with
   `Rat` or `Int` need a type ascription, taught in m2-l1, so before m2-l1 only
   `Nat` lines appear. Lean prints fractions as `(11 : Rat)/12`. Equations are
   checked by substitution (`#eval 3 * 5 + 5 == 20  --> true`): Lean checks,
   it does not solve. Lean/maths mismatches (`7 - 10 = 0` on `Nat`,
   `5 / 0 = 0`) are audit material, shown only after the topic is mastered,
   never inside a worked solution.
6. Fun theorems. Hand-written lessons with a hook (a story, a magic trick, a
   puzzle), a visual reason why the theorem holds, generated practice, and
   the theorem in Lean to read. They live in `catalog.js` as math modules
   placed between Lean modules (`track: "math"`, codes `T1`, `T2`...), so the
   "next lesson" logic interleaves them for free.
7. Spaced review is shared: generated questions of mastered lessons join the
   normal review with new numbers each time. Review batches are capped at 8
   questions to fit the daily budget.

## Answer input (`course/assets/math.js`, `parseAnswer`)

Accepted: integers; a leading `-` or `−`; fractions `a/b` (also `a:b`, the
Spanish school sign); mixed numbers `1 1/2` (the sign applies to the whole
number: `-1 1/2` is `-3/2`); decimals with comma or dot; an optional leading
`x =`. All arithmetic is exact on integers (no `parseFloat`).
Re-prompted without penalty: empty input, words, and anything that looks like
a thousands separator (`1.024`, `12.000`): "Escribe los números sin puntos de
miles". Each part has a `form`:
- `integer`: any exact value equal to the answer (`10/2` for 5 is fine);
- `fraction`: fractions or integers; a decimal is re-prompted ("escríbelo
  como fracción"); equivalent fractions are correct and the event records
  `reduced: false`;
- `reduced`: as `fraction`, but a correct value not in lowest terms counts as
  a miss with "Es correcto, pero se puede simplificar";
- `number`: any exact form, decimals included.
The card shows a format hint under each input.

## Generators (`window.MATHKIT.GEN`)

`GEN[name] = { version, variants?, make(rng, opts) }`. Generators with
several kinds of problem name them in `variants`; a bank question can pin a
subset (`"variants": ["power", "brackets"]`) so a check measures the hard
cases. `make` returns
`{ type: "num", prompt, parts: [{ label, form, answer: [n, d] }], steps,
lean: [{ expr, out }], traps: [{ part, value: [n, d], code, msg }] }`, or
`{ type: "mcq", prompt, options: [{ t, ok, why }], steps, lean }`.
`lean.expr` is built from the problem's own numbers, not from the answer, and
`lean.out` is what the answer says Lean must print: the checker evaluates
every `expr` with Lean and compares, so a generator whose arithmetic is wrong
fails the build. A bank question can set `"showLean": true` to show those
lines in the worked solution.

## Events

`answer` keeps `qid`, `lesson`, `mode`, `ok`, `concept` and `choice` (for a
typed answer, the raw text), and adds for maths: `track: "math"`, `given`,
`expected`, `gen`, `genVersion`, `seed`, `prompt` (plain text), `trap` (first
code or null) and `traps` (all codes), `reduced` (null unless a fraction was
typed), `skipped` ("No lo sé"). Multi-part answers are joined with " ; "
(a part can contain a decimal comma). The check page writes
`math_check_finish` `{ bite, correct, total, areas: { area: { label, ok } } }`.

## Roadmap

Built first: typed answers, generators, the T1 lesson ("Qué día
será dentro de 100 días": division with remainder) after module 0, Chequeo
bite 1 (fractions, negatives, order of operations, powers, percentages,
equations), checker and report support.

Next, after reading bite 1:
- topic graph and short topic lessons (`mates.html?t=<id>`: idea, worked
  example step by step, then practice until the last 3 are right, covering
  the hard variant; stuck after 8 sends the learner to its prerequisites)
  for the frontier the check reveals, plus per-unit entry ladders (one
  problem per topic, stop after 2 misses) for later units;
- the map's "Hoy": one primary next step that alternates Lean and maths day
  by day, after the review;
- more bites (divisibility and primes, fraction division, decimals, mixed
  numbers, distributive law, inequalities).

Fun theorems planned: T1 división con resto (after M0); T2 par e impar
(after M1); T3 el truco del 9; T4 la suma de Gauss (after M2, uses
recursion); T5 los impares suman cuadrados; T6 el palomar; T7 inducción (with
M4). Infinitely many primes and √2 irrational need Mathlib (`Nat.Prime` is
not in core): with M6.

## Checking

`tools/check_course.py` also runs `tools/math_selftest.js` (node):
- parser table (`0,75`, `−3/4`, `1 1/2`, `-1 1/2`, `3:4`, `x = 4`, `1.024`
  re-prompt, `6/8` with `reduced`);
- every generator over many seeds: well formed, finite, small numbers, steps
  present, canonical answer parses back to itself, no trap equals the answer,
  mcq options distinct with exactly one correct;
- the `lean` lines of the first 40 seeds of every generator and pinned
  variant (about 600 lines), batched into one Lean file and compared with
  `out`; and the answer of every fixed `num` question about one `#eval` line;
- bank questions of type `num`: `gen` exists or fixed `parts` are valid.
