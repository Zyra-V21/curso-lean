// Self-test for course/assets/math.js, run by tools/check_course.py.
// Prints JSON: { errors, generators, oracle } where `oracle` lists Lean
// expressions with the output the generator claims, for the checker to
// evaluate with Lean.
//
// Usage: node tools/math_selftest.js [seedsPerGenerator]
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "course", "assets", "math.js"));
const K = window.MATHKIT;

const SEEDS = Number(process.argv[2] || 400);
// Lean checks the first ORACLE_SEEDS seeds of every generator and variant.
const ORACLE_SEEDS = 40;
const MAX_ABS = 100000;
const errors = [];
const oracle = [];

const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const plain = (html) => String(html).replace(/<[^>]+>/g, "");

// Parser table: [input, form, expected value [n, d] or "reprompt"].
const PARSE_CASES = [
  ["12", "integer", [12, 1]],
  ["-3", "integer", [-3, 1]],
  ["−3", "integer", [-3, 1]],
  ["- 3", "integer", [-3, 1]],
  ["x = 4", "integer", [4, 1]],
  ["x=-4", "integer", [-4, 1]],
  ["3/4", "fraction", [3, 4]],
  ["3 / 4", "fraction", [3, 4]],
  ["−3/4", "fraction", [-3, 4]],
  ["3:4", "fraction", [3, 4]],
  ["1 1/2", "fraction", [3, 2]],
  ["-1 1/2", "fraction", [-3, 2]],
  ["0,75", "number", [75, 100]],
  ["0.75", "number", [75, 100]],
  [",5", "number", [5, 10]],
  ["-2,5", "number", [-25, 10]],
  ["0,75", "fraction", "reprompt"],
  ["1.024", "integer", "reprompt"],
  ["12.000", "number", "reprompt"],
  ["", "integer", "reprompt"],
  ["cinco", "integer", "reprompt"],
  ["2+3", "integer", "reprompt"],
  ["3/0", "fraction", "reprompt"],
  ["1234567890123", "integer", "reprompt"],
  ["0.750", "number", [750, 1000]],
  ["(-5)", "integer", [-5, 1]],
  ["3/-4", "fraction", [-3, 4]],
  ["12,5 %", "number", [125, 10]],
  ["30 %", "number", [30, 1]],
  ["1\u20442", "fraction", [1, 2]],
  ["\u00bd", "fraction", [1, 2]],
  ["1\u00bd", "fraction", [3, 2]],
  ["1 5/2", "fraction", "reprompt"],
  ["X = 3", "integer", [3, 1]],
  ["+5", "integer", [5, 1]],
];

for (const [input, form, want] of PARSE_CASES) {
  const got = K.parseAnswer(input, form);
  if (want === "reprompt") {
    if (got.status !== "reprompt") fail("parser", `${JSON.stringify(input)} (${form}) should re-prompt, got ${JSON.stringify(got.value)}`);
  } else if (got.status !== "ok" || got.value[0] !== want[0] || got.value[1] !== want[1]) {
    fail("parser", `${JSON.stringify(input)} (${form}) should be ${want.join("/")}, got ${JSON.stringify(got)}`);
  }
}

// Grading: equivalent fractions, reduced form, traps.
{
  const part = { form: "reduced", answer: [3, 4], index: 0 };
  const g1 = K.gradePart(part, "6/8", []);
  if (g1.ok || !g1.note) fail("grade", "6/8 against reduced 3/4 must be a miss with a note");
  const g2 = K.gradePart({ form: "fraction", answer: [3, 4], index: 0 }, "6/8", []);
  if (!g2.ok || g2.reduced) fail("grade", "6/8 against fraction 3/4 must be correct and not reduced");
  const g3 = K.gradePart({ form: "integer", answer: [5, 1], index: 0 }, "10/2", []);
  if (!g3.ok) fail("grade", "10/2 must equal 5");
  const g4 = K.gradePart({ form: "integer", answer: [5, 1], index: 0 }, "6", [{ part: 0, value: 6, code: "t" }]);
  if (g4.ok || !g4.trap || g4.trap.code !== "t") fail("grade", "trap value 6 must be detected");
}

const plainLen = (s) => plain(s).length;

// Every generator with all its variants, then each variant pinned alone.
const runs = [];
for (const [name, g] of Object.entries(K.GEN)) {
  if (!Number.isInteger(g.version)) fail(name, "version must be an integer");
  runs.push({ name, variants: undefined, seeds: SEEDS });
  for (const v of g.variants || []) runs.push({ name, variants: [v], seeds: Math.ceil(SEEDS / 4) });
}
const seenOracle = new Set();
for (const { name, variants, seeds } of runs) {
  for (let seed = 1; seed <= seeds; seed++) {
    const where = `${name}${variants ? `[${variants}]` : ""} seed ${seed}`;
    const q = { gen: name, variants };
    let p;
    try {
      p = K.instance(q, seed).problem;
    } catch (e) {
      fail(where, `throws: ${e.message}`);
      continue;
    }
    // Determinism: the same seed gives the same problem.
    const again = K.instance(q, seed).problem;
    if (JSON.stringify(again) !== JSON.stringify(p)) fail(where, "not deterministic for a fixed seed");
    if (!p.prompt || plainLen(p.prompt) < 5) fail(where, "missing prompt");
    if (/NaN|undefined|Infinity/.test(JSON.stringify(p))) fail(where, "NaN/undefined/Infinity in output");
    if (/\u2014/.test(JSON.stringify(p))) fail(where, "contains an em dash");
    // "+ 0" is fine in a worked check (52 = 4 · 13 + 0), not in a prompt.
    if (/\b[01] d\u00edas\b/.test(plain(JSON.stringify(p))) || /[+\u2212] 0\b|\b1x\b/.test(plain(p.prompt))) {
      fail(where, `awkward text: ${plain(p.prompt)} / ${p.steps.map(plain).join(" / ")}`);
    }
    if (!Array.isArray(p.steps) || !p.steps.length) fail(where, "no worked steps");
    if (p.type === "num") {
      if (!p.parts || !p.parts.length) fail(where, "num problem without parts");
      for (const part of p.parts || []) {
        const a = K.norm(K.toRat(part.answer));
        if (!Number.isSafeInteger(a[0]) || !Number.isSafeInteger(a[1]) || a[1] <= 0) fail(where, `bad answer ${part.answer}`);
        if (Math.abs(a[0]) > MAX_ABS || a[1] > MAX_ABS) fail(where, `answer too big ${a}`);
        if (!K.HINTS[part.form]) fail(where, `unknown form ${part.form}`);
        // The canonical answer typed back must be graded correct.
        const typed = K.gradePart(part, K.canon(a), p.traps);
        if (typed.status !== "graded" || !typed.ok) fail(where, `canonical answer ${K.canon(a)} is not accepted (${JSON.stringify(typed)})`);
      }
      for (const t of p.traps || []) {
        const part = p.parts[t.part];
        if (!part) fail(where, `trap ${t.code} points to a missing part`);
        else if (K.eq(K.toRat(t.value), K.toRat(part.answer))) fail(where, `trap ${t.code} equals the answer`);
        if (!t.code || !t.msg) fail(where, "trap without code or msg");
      }
    } else if (p.type === "mcq") {
      const texts = p.options.map((o) => plain(o.t));
      if (new Set(texts).size !== texts.length) fail(where, `duplicate options ${texts}`);
      if (p.options.filter((o) => o.ok).length !== 1) fail(where, "mcq needs exactly one correct option");
      if (p.options.length < 3) fail(where, "mcq needs at least 3 options");
      if (p.options.some((o) => !o.why)) fail(where, "mcq option without why");
    } else {
      fail(where, `unknown type ${p.type}`);
    }
    for (const l of p.lean || []) {
      if (!l.expr || l.out == null) fail(where, "lean line without expr/out");
      else if (seed <= ORACLE_SEEDS && !seenOracle.has(l.expr)) {
        seenOracle.add(l.expr);
        oracle.push({ gen: name, seed, expr: l.expr, out: l.out });
      }
    }
  }
}

const generators = Object.fromEntries(Object.entries(K.GEN).map(([n, g]) => [n, g.variants || []]));
process.stdout.write(JSON.stringify({ errors, generators, oracle }));
