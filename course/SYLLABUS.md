# Syllabus and lesson briefs

Briefs for every lesson. "Ready" lessons are built; "planned" ones are built
by the tutor when the learner gets there, adapted to `tutor/events.jsonl` and
`tutor/notes.md`. Facts marked (verified) were checked against Lean 4.35.0.

## M0 Arranque

### m0-l1 Qué es Lean y qué te toca a ti (ready, reference lesson)
Lean as a tireless checker (game server analogy); "Lean no lee mentes"
(`fee_ok : 100 ≤ 100`); the three audit questions (statement, definitions,
assumptions) with `def fee := 0`; `sorry` as "trust me" (message is
``declaration uses `sorry` `` with backticks, verified). Boss: clears `:= by`.

### m0-l2 Tu taller: VS Code y el panel de Lean
Open the practice project (`./start-course.sh lab`); first start of the Lean
server; editor left, Lean Infoview right (verify the real command name and
shortcut in the installed extension `leanprover.lean4` package.json before
writing them). `#eval` (compute), `#check` (what is it), `--` comments.
Colours: red squiggle = error (Lean rejects), yellow = warning (sorry is the
one that matters), blue = information (an `#eval` answer). Break things on
purpose and undo with Ctrl+Z. Audit point: comments are not checked and can
lie (`-- returns 5` above something that returns 4). sorry was introduced
conceptually in m0-l1; here the learner sees it for real. Boss: clears `doc`
(comments). Lab: Practice/M0/L2.lean.

## Maths interludes (track "math", see MATH.md)

Placed between Lean modules in `catalog.js`. Each is a fun theorem: a hook,
a visual reason, generated practice, the theorem in Lean to read. Keep the
Lean lines inside what the learner has seen (Nat only before m2-l1; no `→`
or `∀` before M1).

### t1 Qué día será dentro de 100 días (ready, after M0)
Division with remainder: quotient, remainder, `a = b · q + r` with `r < b`,
the theorem and why the remainder is unique; days of the week as the hook;
Lean `/` and `%` on Nat (`7 / 2` is 3); `Nat.div_add_mod` read as an audit
exercise (it does not state `r < n`; that is `Nat.mod_lt`, which needs
`n > 0`). Lab: 365 % 7 = 1 (birthdays move one weekday a year).

### t2 Par e impar (planned, after M1)
Even and odd as `n % 2`; pairs of dots; even + even, odd + odd, odd · odd.
Lean: `decide` on bounded `∀` (`∀ n < 50, ...`), `omega` proves
`(2 * a + 2 * b) % 2 = 0` (verified). Reuses `%` from t1.

### t3 El truco del 9 (planned, after M1)
A number and the sum of its digits leave the same remainder when divided by
9 (and by 3). Magic trick hook. Practice: divisibility rules for 2, 3, 5, 9,
10. Lean: `#eval` both remainders, `decide` on closed cases.

### t4 La suma de Gauss (planned, after M2)
1 + 2 + ... + n = n(n+1)/2: the story, the pairing picture, a recursive
`sumTo` read with m2-l3 skills, `#eval` checks. Note `omega` cannot prove
`n * (n + 1) % 2 = 0` (nonlinear); `decide` proves it for bounded n.

### t5 Los impares suman cuadrados (planned, after M2)
1 + 3 + ... + (2n - 1) = n²: L-shaped picture; `#eval` checks.

### t6 El principio del palomar (planned, after M3)
More pigeons than holes means a shared hole; birthdays; why hash collisions
must exist. Reading a statement with a hypothesis (`h : m < n`).

### t7 Inducción: el efecto dominó (planned, with M4)
Base case and step; Gauss's sum by induction, read in Lean.

Later, with M6 (Mathlib): infinitely many primes, √2 is not a fraction.

## M1 Lógica: el idioma de los enunciados

### m1-l1 Proposiciones
A proposition is a sentence that is true or false; Lean's type `Prop`.
`#check 2 + 2 = 4` prints `2 + 2 = 4 : Prop` (verified) and `2 + 2 = 5` is
also a `Prop`: writing a proposition is not proving it. Not propositions:
orders, questions, or a number (`#check 2 + 2` gives a `Nat`). `True`,
`False`, `=`, `≠`, `≤`, `<`. `decide` as "compute whether it is true" for
simple concrete cases (`#eval decide (2 + 2 = 4)`), kept light. Audit: a
true proposition can be irrelevant (callback to `fee_ok`). Boss: clears `=`
pieces (`eq`, `eqprop`).

### m1-l2 Y, o, no
`∧` both; `∨` at least one (inclusive, unlike everyday "¿café o té?"); `¬`.
Truth tables. De Morgan in words and with `decide` (no `↔` yet):
"negar un y da un o de negaciones". Precedence: `¬ A ∧ B` is `(¬ A) ∧ B`;
parentheses change meaning. Audit: an AI weakening `∧` to `∨` makes a
statement promise much less. Boss: clears `∧` (`and`).

### m1-l3 Si... entonces (y si y solo si)
`A → B`: only false when A is true and B false. Vacuous truth: false
hypothesis makes the implication true (`decide (2 + 2 = 5 → 1 = 2)` is
`true`). Explosion: with an impossible hypothesis anything is provable, e.g.
`theorem t (h : 5 < 3) : 1 = 2 := by omega` compiles (verify). Converse is a
different claim (rain and wet floor). Chains `A → B → C` read "si A y B,
entonces C". `↔` as both directions. Boss: clears `→` (`imp`).

### m1-l4 Para todo y existe
`∀`, `∃`, domain matters (`∀ n : Nat, 0 ≤ n` true, false for `Int`).
Counterexample kills a `∀`; one example (testigo) proves an `∃`. `decide`
works on bounded statements (`decide (∀ n, n < 5 → n * n < 25)` is `true`,
verified) but not on infinite ones. Order matters: `∀ x, ∃ y, x < y` vs
`∃ y, ∀ x, x < y`. Negation: "no todos" = "alguno no". Audit: `∃` promises
less than `∀`; check the domain. Boss: clears `∀ w',` and `∃ witness`.

## M2 Leer código: tipos, funciones y datos

### m2-l1 Tipos
`#check` on values: Nat, Int, String, Bool, Prop. Nat gotchas (verified):
`3 - 5 = 0`, `7 / 2 = 3`, `7 / 0 = 0`. Int: `(-7 : Int) / 2 = -4` in Lean,
while Solidity and Rust give -3; `%` differs too (Lean 1, Rust/Solidity -1).
`(255 : UInt8) + 1 = 0` wraps (verified), like unchecked uint256 overflow;
Nat never overflows (`2 ^ 256` is a huge number). Audit: "un modelo escrito
con Nat no puede ver errores de desbordamiento: mira qué tipo usa el modelo
y compáralo con el código real (uint256, u64)". Boss: clears field types.

### m2-l2 Funciones
`def double (n : Nat) : Nat := 2 * n`: name, inputs with types, output type,
body. Application without parentheses (`double 3`), nesting needs them.
Several arguments. Arrow types `Nat → Nat` (same arrow as implication: a
hint, explained later). `fun x => x + 1`. Audit: the name says nothing, read
the body (`def isSafe (amount : Nat) : Bool := true`). Boss: clears function
applications (`apply`).

### m2-l3 Decidir y repetir: if, match y recursión
`if ... then ... else`; Bool (`true`, to compute) vs Prop (`True`, to
claim), light. `match` with patterns `| 0 => | n + 1 =>`. Recursion,
unfolded by hand (`sumTo 3 = 3 + sumTo 2 = ...`). Lists `[1, 2, 3]`,
`x :: xs`. Lean demands termination; `partial def` opts out: not unsound,
but Lean then cannot prove much about it (a black box). Audit: base cases
and off-by-one. Boss: no new pieces; show the real `RoundsConsistent`
definition (`| [] => True | (c0, cInf, r) :: rs => ... ∧ RoundsConsistent ...`).

### m2-l4 Estructuras: datos con campos (y con promesas)
`structure Account where owner : String  balance : Nat`; building one,
`acc.balance`, `{ acc with balance := 5 }`, anonymous constructor `⟨..⟩`.
Prop fields: `structure PositiveAmount where value : Nat  pos : 0 < value`:
having one means someone proved the promise. `WhirAccept` hides the
theorem's hypotheses (`hlen`, `opens`, `identity`) this way. Audit question:
who guarantees that the real verifier produces such a value? `inductive`
enumerations briefly. Boss: clears `structure`, names and promise fields.

### m2-l5 Firmas avanzadas: llaves, corchetes y namespaces
Explicit `(x : T)`, implicit `{x : T}` (Lean deduces it), instance
`[Add α]` (requirement: the type has that operation); `Type*` as "any type".
`[CommRing R]` shown as text (Mathlib), explained as "suma y producto con
las reglas de siempre". `variable {R : Type*} [CommRing R]` at the top of a
file silently adds arguments to every theorem below: audit the `variable`
lines. `namespace`/`end`/`open` and full names; named arguments `(R := EF8)`.
Boss: clears `(R : Type*) [CommRing R]`.

## M3 Leer enunciados

### m3-l1 Anatomía de un teorema
`theorem name (args) (hyps) : conclusion := proof`; `example` (anonymous),
`lemma` (Mathlib). Hypotheses are arguments whose type is a proposition
(`h`, `hlen`). Reading recipe: arguments become "para todo", hypotheses
"si", conclusion "entonces". In the infoview, with the cursor after `by`,
hypotheses appear above and `⊢ conclusion` below (the lab shows it; reading
only). Boss: clears `theorem`, name, `(acc : WhirAccept R)`, the colon.

### m3-l2 Hipótesis y conclusión: dónde se esconden las trampas
Impossible hypotheses (`h : n < 0` for Nat), contradictory ones, circular
ones (assume what you prove), unused hypotheses, conclusions true anyway
(`x = x`, `True`), weakened conclusions (`∃` for `∀`, `∨` for `∧`, `≤` for
`<`). Three-question checklist: can all hypotheses hold at once? does the
conclusion depend on them? does it say what we want? Boss: clears
`RoundsConsistent ...` and `rounds_preserve_invariant`: part (1) holds for
any input, so it adds nothing about acceptance (not a bug, but not
evidence either); the substance is part (2).

### m3-l3 Traducir enunciados ida y vuelta (planned)
### m3-l4 Lo que el enunciado no dice: las definiciones (planned)
Unfold the definitions a statement depends on; `#print`; a spec is only as
good as its definitions.

## M4 Leer demostraciones (planned)
m4-l1 first: Curry-Howard ("demostrar es programar"). A proposition is a type, a proof is a value
of that type, and Lean checks a proof the way it checks that `5 : Nat`.
`p → q` is a function that turns a proof of p into a proof of q (verified:
`theorem and_swap (p q : Prop) : p ∧ q → q ∧ p := fun ⟨hp, hq⟩ => ⟨hq, hp⟩`);
T1 already used `Nat.div_add_mod m n` as a proof, which is a function call.
`Prop` is `Sort 0` and lives one floor below `Type` (`#check Prop` gives
`Prop : Type`, `Type : Type 1`; `Prop = Sort 0 := rfl` checks): introduce
universes here only as "the floors of a building" and why `Type : Type`
would be contradictory; details with Mathlib in M6. Why it matters for an
auditor: `sorry` is a fake value that fits any type.
Then: goal state and hypotheses in the infoview; intro, exact, apply, rfl; rw
and simp; cases and induction (explain induction from zero with dominoes:
induction proves a `∀ n`; with a `∃` inside, as in `∀ n, ∃ m, ...`, each step
must build a new witness, which may depend on n); automation (omega, decide,
simp): what trusting a black-box tactic means; existentials and witnesses (a
proof of `∃` carries its witness). Boss: the proof lines.

## M5 Auditar: de qué fiarse (planned)
sorry/admit/axiom; `#print axioms` with a whitelist rule: only `propext`,
`Classical.choice`, `Quot.sound` are standard, `sorryAx` means sorry, and
anything else must be justified. Axiom of choice:
in ZFC it is a statement about sets (every family of non-empty sets has a
choice function); Lean's core logic (the calculus of inductive
constructions) is constructive and adds `Classical.choice : Nonempty α → α`
as an axiom, which is stronger in form (it produces a value of a type from a
mere proof that one exists) and makes the logic classical: excluded middle
`Classical.em` is derived from it (verified: `#print axioms Classical.em`
lists `propext, Classical.choice, Quot.sound`). For the auditor: these are
the standard three, accepted everywhere in Mathlib (in 4.35 `native_decide` shows up as an
auxiliary axiom with a generated name, not as `Lean.ofReduceBool`, verified by
review). `partial` is not unsound (opaque to proofs); `opaque` is legitimate
(meaning comes only from axioms about it). Trust base, including Lean
versus SMT solvers: Z3 and similar tools (behind
Certora, Halmos, solc's SMTChecker, Dafny) decide formulas automatically and
answer sat, unsat or unknown, trusting a large solver; Lean checks proof
terms with a small kernel, and its automation either builds a proof term
(`omega`, `decide`) or checks a certificate (`bv_decide` runs a SAT solver
and the kernel checks its proof; verified in 4.35 with
`import Std.Tactic.BVDecide`), while `native_decide` trusts the compiler.
Modelling gaps
(Nat model vs uint256 code; `OpensTo` is opaque, so nothing in Lean ties it
to real Merkle verification). Auditor checklist. Prompting the AI and
freezing specs so it cannot weaken statements. Boss: `commitment_binding`.

## M6 Matemáticas para verificar (planned)
Modular arithmetic (clock), fields and `[Field F]`, polynomials and roots
(Schwartz-Zippel idea), reading Mathlib names (they summarise the statement:
`Nat.div_add_mod`, `Nat.mod_lt`, `add_comm`; started in T1 and the cheat
sheet). Universes in full when reading Mathlib signatures: `Sort u`,
`Type u`, `Type*`. Mathlib gets added to the practice project here.

## M7 Verificar programas: el jefe final (planned)
Spec vs implementation; invariants (total supply conservation in a mini
token); equivalence of two implementations (two versions of a function that
disagree on one edge case); soundness and completeness; the full audit of
`whir_subverifier_soundness`; final project: audit an AI-written mini
project with planted traps and write an audit report.
