// Maths kit: exact answer parsing, seeded problem generators and grading.
// Pure logic with no DOM access, so tools/math_selftest.js can run it in
// node. engine.js renders the cards. Learner-facing strings are Spanish.
// Design and rules: course/MATH.md.
(function (root) {
  "use strict";

  /* ---------- Exact rationals as [numerator, denominator] ---------- */

  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const norm = ([n, d]) => {
    if (d < 0) [n, d] = [-n, -d];
    const g = gcd(n, d) || 1;
    return [n / g, d / g];
  };
  const eq = (a, b) => a[0] * b[1] === b[0] * a[1];
  const isReduced = ([n, d]) => d > 0 && gcd(n, d) === 1;
  const isInt = ([n, d]) => n % d === 0;

  // Canonical ASCII form, used in events and typed by the test walker.
  const canon = (r) => {
    const [n, d] = norm(r);
    return d === 1 ? String(n) : `${n}/${d}`;
  };

  // What `#eval` prints for this value in Lean 4.35.
  const leanOut = (r, type) => {
    const [n, d] = norm(r);
    if (type === "Rat" && d !== 1) return `(${n} : Rat)/${d}`;
    return String(n);
  };

  /* ---------- Display (HTML that also reads well as plain text) ---------- */

  const MINUS = "−";
  const num = (n) => (n < 0 ? MINUS + Math.abs(n) : String(n));
  // Negative numbers after an operator go in brackets: 3 − (−5).
  const pnum = (n) => (n < 0 ? `(${num(n)})` : String(n));
  const frac = (n, d) => {
    if (d === 1) return num(n);
    const sign = n < 0 ? MINUS : "";
    return `${sign}<span class="frac"><span class="fn">${Math.abs(n)}</span><span class="fs">/</span><span class="fd">${d}</span></span>`;
  };
  const fracR = (r) => frac(...norm(r));
  const pow = (base, e) => `${base}<sup><span class="sr">^</span>${e}</sup>`;
  // " + 5" or " − 5", for building expressions term by term.
  const signed = (n) => (n < 0 ? ` ${MINUS} ${Math.abs(n)}` : ` + ${n}`);
  const coefX = (a) => (a === 1 ? "x" : a === -1 ? `${MINUS}x` : `${num(a)}x`);
  const leanInt = (n) => (n < 0 ? `(${n})` : String(n));

  /* ---------- Seeded random numbers (mulberry32) ---------- */

  function rngFrom(seed) {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
    return {
      next,
      int,
      intNot0: (lo, hi) => {
        let v = 0;
        while (v === 0) v = int(lo, hi);
        return v;
      },
      pick: (list) => list[Math.floor(next() * list.length)],
      chance: (p) => next() < p,
    };
  }
  const newSeed = () => Math.floor(Math.random() * 2 ** 31);

  /* ---------- Parsing typed answers ---------- */

  const HINTS = {
    integer: "Escribe un número entero, por ejemplo 12 o -3.",
    fraction: "Escribe una fracción como 3/4 (o un entero).",
    reduced: "Escribe la fracción simplificada, como 3/4.",
    number: "Escribe un número: 12, -3, 3/4 o 0,75.",
  };

  // Unicode fraction characters a phone keyboard may produce.
  const VULGAR = { "\u00bd": "1/2", "\u2153": "1/3", "\u2154": "2/3", "\u00bc": "1/4", "\u00be": "3/4", "\u2155": "1/5", "\u215b": "1/8" };

  // Returns { status: "ok", value: [n, d], kind } or { status: "reprompt", msg }.
  // Exact integer arithmetic only.
  function parseAnswer(raw, form) {
    let s = String(raw == null ? "" : raw)
      .replace(/[\u2212\u2013\u2014\u2010]/g, "-")
      .replace(/\u2044/g, "/")
      .replace(/[\u00bd\u2153\u2154\u00bc\u00be\u2155\u215b]/g, (c) => ` ${VULGAR[c]}`)
      .replace(/\s+/g, " ")
      .trim();
    s = s.replace(/^[a-zA-Z]\s*=\s*/, "").replace(/\s*%$/, "");
    if (/^\(.*\)$/.test(s)) s = s.slice(1, -1).trim();
    if (!s) return { status: "reprompt", msg: "Escribe un número, o pulsa «No lo sé»." };
    s = s.replace(/\s*[/:]\s*/g, "/").replace(/^([+-])\s+/, "$1");
    if ((s.match(/\d/g) || []).length > 12) return { status: "reprompt", msg: "Ese número es demasiado largo. Revísalo." };
    if (/^[+-]?(?!0\.)\d{1,3}(\.\d{3})+$/.test(s)) {
      return { status: "reprompt", msg: "Escribe los números sin puntos de miles (1024, no 1.024). Para decimales usa la coma: 0,75." };
    }
    let m;
    let out = null;
    if ((m = s.match(/^([+-]?)(\d+)$/))) {
      out = { value: [(m[1] === "-" ? -1 : 1) * +m[2], 1], kind: "int" };
    } else if ((m = s.match(/^([+-]?)(\d+)\/([+-]?)(\d+)$/))) {
      if (+m[4] === 0) return { status: "reprompt", msg: "El denominador no puede ser 0." };
      const sign = (m[1] === "-" ? -1 : 1) * (m[3] === "-" ? -1 : 1);
      out = { value: [sign * +m[2], +m[4]], kind: "frac" };
    } else if ((m = s.match(/^([+-]?)(\d+) (\d+)\/(\d+)$/))) {
      const d = +m[4];
      if (d === 0) return { status: "reprompt", msg: "El denominador no puede ser 0." };
      if (+m[3] >= d) return { status: "reprompt", msg: "En un número mixto como 1 1/2, la fracción tiene que ser menor que 1. Si no, escribe solo la fracción, como 7/2." };
      out = { value: [(m[1] === "-" ? -1 : 1) * (+m[2] * d + +m[3]), d], kind: "mixed" };
    } else if ((m = s.match(/^([+-]?)(\d*)[.,](\d+)$/))) {
      const d = 10 ** m[3].length;
      out = { value: [(m[1] === "-" ? -1 : 1) * (+(m[2] || "0") * d + +m[3]), d], kind: "dec" };
    }
    if (!out) return { status: "reprompt", msg: "Escribe solo el número, por ejemplo 12, -3, 3/4 o 0,75." };
    if ((form === "fraction" || form === "reduced") && out.kind === "dec") {
      return { status: "reprompt", msg: "Escríbelo como fracción, por ejemplo 3/4." };
    }
    return Object.assign({ status: "ok" }, out);
  }

  // Grades one input against one part. Returns { status: "reprompt", msg }
  // or { status: "graded", ok, value, reduced, trap, note }. `reduced` is
  // null unless a fraction was typed.
  function gradePart(part, raw, traps) {
    const p = parseAnswer(raw, part.form);
    if (p.status !== "ok") return p;
    const answer = toRat(part.answer);
    const reduced = p.kind === "frac" || p.kind === "mixed" ? gcd(p.value[0], p.value[1]) === 1 : null;
    let ok = eq(p.value, answer);
    let note = null;
    if (ok && part.form === "reduced" && reduced === false) {
      ok = false;
      note = "Es correcto, pero se puede simplificar.";
    }
    let trap = null;
    if (!ok) {
      trap = (traps || []).find((t) => t.part === part.index && eq(toRat(t.value), p.value)) || null;
    }
    return { status: "graded", ok, value: p.value, reduced, trap, note };
  }

  // Answers can be written as [n, d], a number, or a string like "3/4".
  function toRat(a) {
    if (Array.isArray(a)) return a;
    if (typeof a === "number") return [a, 1];
    const p = parseAnswer(String(a), "number");
    if (p.status !== "ok") throw new Error(`bad answer literal ${a}`);
    return p.value;
  }

  /* ---------- Generators ---------- */

  const DAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const daysWord = (n) => (n === 1 ? "1 día" : `${n} días`);

  // Picks one of a generator's named variants; a bank question can restrict
  // them with "variants": [...]. With no restriction the draw is one
  // rng.int over all variants.
  function pickVariant(rng, names, opts) {
    const allowed = opts && opts.variants && opts.variants.length ? opts.variants : names;
    return allowed[rng.int(0, allowed.length - 1)];
  }

  const GEN = {};

  // Division with remainder: quotient and remainder of a ÷ b.
  GEN.divmod = {
    version: 1,
    make(rng) {
      const b = rng.int(3, 9);
      const q = rng.int(3, 14);
      const r = rng.chance(1 / 6) ? 0 : rng.int(1, b - 1);
      const a = b * q + r;
      const traps = [
        { part: 0, value: q - 1, code: "quotient-short", msg: `Con ${q - 1} todavía cabe otra vez: ${b} · ${q} = ${b * q}, que no se pasa de ${a}.` },
        { part: 1, value: r + b, code: "remainder-too-big", msg: `Ese resto es ${r + b}, y ${r + b} ya es ${b} o más: cabe otra vez. El resto siempre es menor que ${b}.` },
      ];
      if (r > 0) {
        traps.push({ part: 0, value: q + 1, code: "quotient-rounded-up", msg: `${b} · ${q + 1} = ${b * (q + 1)} se pasa de ${a}. El cociente es las veces que cabe entero, sin pasarse.` });
      }
      return {
        type: "num",
        prompt: `Divide ${a} entre ${b}. ¿Cuál es el cociente y cuál es el resto?`,
        parts: [
          { label: "Cociente", form: "integer", answer: [q, 1] },
          { label: "Resto", form: "integer", answer: [r, 1] },
        ],
        steps: [
          `¿Cuántas veces cabe ${b} en ${a}? ${b} · ${q} = ${b * q}, y ${b} · ${q + 1} = ${b * (q + 1)} ya se pasa.`,
          `Así que el cociente es ${q}.`,
          r === 0 ? `No sobra nada: ${a} ${MINUS} ${b * q} = 0, así que el resto es 0.` : `Lo que sobra es el resto: ${a} ${MINUS} ${b * q} = ${r}.`,
          `Comprobación: ${b} · ${q} + ${r} = ${a}, y el resto (${r}) es menor que ${b}.`,
        ],
        lean: [
          { expr: `${a} / ${b}`, out: String(q) },
          { expr: `${a} % ${b}`, out: String(r) },
        ],
        traps,
      };
    },
  };

  // Day of the week n days from now: n mod 7.
  GEN.daysLater = {
    version: 2,
    make(rng) {
      const s = rng.int(0, 6);
      const n = rng.chance(1 / 8) ? 7 * rng.int(2, 20) : rng.int(9, 400);
      const q = Math.floor(n / 7);
      const r = n % 7;
      const day = (k) => DAYS[((k % 7) + 7) % 7];
      const right = day(s + r);
      const why = r === 0
        ? `${n} = 7 · ${q}: son ${q} semanas justas, sin días de más, así que vuelve a ser ${right}.`
        : `${n} = 7 · ${q} + ${r}. Tras ${q} semanas completas vuelve a ser ${DAYS[s]}, y ${r === 1 ? "queda 1 día" : `quedan ${r} días`}: ${right}.`;
      const exact = `${n} son ${q} semanas justas (${n} = 7 · ${q}): no sobra ningún día, así que el día no se mueve.`;
      const seek = r === 0 ? exact : `Busca el resto de ${n} entre 7: es ${r}. Avanza ${daysWord(r)} desde ${DAYS[s]}.`;
      const candidates = [
        { t: day(s + r + 1), why: r === 0 ? exact : `Te has pasado un día. Si hoy es ${DAYS[s]}, dentro de 1 día es ${day(s + 1)}: cuenta desde mañana.` },
        { t: day(s + r - 1), why: r === 0 ? exact : `Te has quedado un día corto: hoy no cuenta, el primer día es mañana.` },
        { t: day(s + q), why: `Has movido el día ${q} veces, que es el cociente (las semanas completas). Lo que mueve el día es el resto: ${r}.` },
        { t: day(s + r + 3), why: seek },
        { t: day(s + r + 4), why: seek },
      ];
      const options = [{ t: right, ok: true, why }];
      for (const c of candidates) {
        if (options.length >= 4) break;
        if (!options.some((o) => o.t === c.t)) options.push(c);
      }
      return {
        type: "mcq",
        prompt: `Hoy es ${DAYS[s]}. ¿Qué día de la semana será dentro de ${n} días?`,
        options,
        steps: [
          `Cada 7 días vuelve a ser ${DAYS[s]}, así que solo importa el resto de dividir ${n} entre 7.`,
          r === 0 ? `${n} = 7 · ${q}: ${q} semanas justas, resto 0.` : `${n} = 7 · ${q} + ${r}: ${q} semanas completas y ${daysWord(r)} más.`,
          r === 0 ? `Así que vuelve a ser ${right}.` : `${daysWord(r)} después de ${DAYS[s]} es ${right}.`,
        ],
        lean: [{ expr: `${n} % 7`, out: String(r) }],
      };
    },
  };

  // Reading Lean's % on natural numbers.
  GEN.modEval = {
    version: 1,
    make(rng) {
      const b = rng.int(2, 9);
      const q = rng.int(2, 12);
      const r = rng.int(1, b - 1);
      const a = b * q + r;
      return {
        type: "num",
        prompt: `¿Qué responde Lean a <code class="l">#eval ${a} % ${b}</code>?`,
        parts: [{ label: "Lean responde", form: "integer", answer: [r, 1] }],
        steps: [
          `<code class="l">%</code> da el resto de la división.`,
          `${a} = ${b} · ${q} + ${r}, así que el resto es ${r}.`,
        ],
        lean: [{ expr: `${a} % ${b}`, out: String(r) }],
        traps: [{ part: 0, value: q, code: "quotient-instead", msg: `${q} es el cociente, lo que da <code class="l">${a} / ${b}</code>. <code class="l">%</code> da lo que sobra.` }].filter((t) => t.value !== r),
      };
    },
  };

  // a/b + c/d with unlike denominators.
  // Proper fraction in lowest terms with denominator d.
  const properReduced = (rng, d) => {
    let a;
    do a = rng.int(1, d - 1);
    while (gcd(a, d) !== 1);
    return a;
  };

  GEN.fracAddUnlike = {
    version: 2,
    make(rng) {
      let b;
      let d;
      do {
        b = rng.int(2, 9);
        d = rng.int(2, 9);
      } while (b === d);
      const a = properReduced(rng, b);
      const c = properReduced(rng, d);
      const L = lcm(b, d);
      const A = a * (L / b);
      const C = c * (L / d);
      const ans = norm([A + C, L]);
      // Only the fractions whose denominator changes need rewriting.
      const rewrites = [[a, b, A], [c, d, C]].filter(([, den]) => den !== L).map(([n, den, N]) => `${frac(n, den)} = ${frac(N, L)}`);
      const steps = [
        `Para sumar fracciones necesitas el mismo denominador. El mínimo común múltiplo de ${b} y ${d} es ${L}.`,
        `Lo pasas todo a ${L}: ${rewrites.join(" y ")}.`,
        `Sumas los numeradores y dejas el denominador: ${frac(A, L)} + ${frac(C, L)} = ${frac(A + C, L)}.`,
      ];
      if (A + C !== ans[0]) steps.push(`Simplificas dividiendo arriba y abajo entre ${gcd(A + C, L)}: ${fracR(ans)}.`);
      const [sn, sd, sN] = b !== L ? [a, b, A] : [c, d, C];
      const traps = [
        { part: 0, value: [a + c, b + d], code: "add-denominators", msg: "Has sumado también los denominadores. Primero se ponen las dos fracciones con el mismo denominador; luego se suman solo los numeradores." },
        { part: 0, value: [a + c, L], code: "numerators-not-scaled", msg: `Has puesto denominador común (${L}), pero no has cambiado los numeradores: ${frac(sn, sd)} es ${frac(sN, L)}, no ${frac(sn, L)}.` },
      ].filter((t) => !eq(t.value, ans));
      return {
        type: "num",
        prompt: `Calcula ${frac(a, b)} + ${frac(c, d)}`,
        parts: [{ label: "Resultado", form: "fraction", answer: ans }],
        steps,
        lean: [{ expr: `(${a}/${b} : Rat) + ${c}/${d}`, out: leanOut(ans, "Rat") }],
        traps,
      };
    },
  };

  // a/b · c/d.
  GEN.fracMul = {
    version: 2,
    make(rng) {
      const b = rng.int(2, 9);
      const d = rng.int(2, 9);
      const a = properReduced(rng, b);
      const c = properReduced(rng, d);
      const raw = [a * c, b * d];
      const ans = norm(raw);
      const steps = [
        `Para multiplicar fracciones: numerador por numerador y denominador por denominador.`,
        `${frac(a, b)} · ${frac(c, d)} = ${frac(a * c, b * d)}.`,
      ];
      if (raw[0] !== ans[0]) steps.push(`Simplificas dividiendo arriba y abajo entre ${gcd(...raw)}: ${fracR(ans)}.`);
      const traps = [
        { part: 0, value: [a * d, b * c], code: "divided-instead", msg: "Has multiplicado en cruz: eso es lo que se hace para dividir. Para multiplicar, numerador por numerador y denominador por denominador." },
        { part: 0, value: [a * c, b + d], code: "added-denominators", msg: "Los denominadores también se multiplican, no se suman." },
      ].filter((t) => !eq(t.value, ans));
      return {
        type: "num",
        prompt: `Calcula ${frac(a, b)} · ${frac(c, d)}`,
        parts: [{ label: "Resultado", form: "fraction", answer: ans }],
        steps,
        lean: [{ expr: `(${a}/${b} : Rat) * (${c}/${d})`, out: leanOut(ans, "Rat") }],
        traps,
      };
    },
  };

  // Integers: adding and subtracting negatives, or signs of products and quotients.
  GEN.intMix = {
    version: 1,
    variants: ["addSub", "negTimesNeg", "negDiv"],
    make(rng, opts) {
      const variant = pickVariant(rng, this.variants, opts);
      if (variant === "addSub") {
        const x = rng.intNot0(-12, 12);
        const y = rng.int(1, 12);
        const z = rng.int(-12, -1);
        const ans = x + y - z;
        return {
          type: "num",
          prompt: `Calcula ${num(x)} + ${y} ${MINUS} ${pnum(z)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [ans, 1] }],
          steps: [
            `Restar un negativo es sumar: ${MINUS} ${pnum(z)} es lo mismo que + ${-z}.`,
            `${num(x)} + ${y} = ${num(x + y)}.`,
            `${num(x + y)} + ${-z} = ${num(ans)}.`,
          ],
          lean: [{ expr: `(${x} : Int) + ${y} - ${leanInt(z)}`, out: String(ans) }],
          traps: [{ part: 0, value: x + y + z, code: "double-negative", msg: `Restar ${pnum(z)} es sumar ${-z}: los dos signos menos se convierten en un más.` }].filter((t) => t.value !== ans),
        };
      }
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      if (variant === "negTimesNeg") {
        return {
          type: "num",
          prompt: `Calcula ${pnum(-a)} · ${pnum(-b)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [a * b, 1] }],
          steps: [`${a} · ${b} = ${a * b}.`, `Negativo por negativo da positivo: ${num(a * b)}.`],
          lean: [{ expr: `(${-a} : Int) * (${-b})`, out: String(a * b) }],
          traps: [{ part: 0, value: -a * b, code: "sign-product", msg: "Negativo por negativo da positivo." }],
        };
      }
      return {
        type: "num",
        prompt: `Calcula ${pnum(-a * b)} ÷ ${b}`,
        parts: [{ label: "Resultado", form: "integer", answer: [-a, 1] }],
        steps: [`${a * b} ÷ ${b} = ${a}.`, `Negativo entre positivo da negativo: ${num(-a)}.`],
        lean: [{ expr: `(${-a * b} : Int) / ${b}`, out: String(-a) }],
        traps: [{ part: 0, value: a, code: "sign-quotient", msg: "Negativo entre positivo da negativo: los signos funcionan igual que al multiplicar." }],
      };
    },
  };

  // Order of operations, with and without powers.
  GEN.orderOps = {
    version: 2,
    variants: ["product", "power", "brackets"],
    make(rng, opts) {
      const variant = pickVariant(rng, this.variants, opts);
      if (variant === "product") {
        const a = rng.int(2, 20);
        const b = rng.int(2, 9);
        const c = rng.int(2, 9);
        return {
          type: "num",
          prompt: `Calcula ${a} + ${b} · ${c}`,
          parts: [{ label: "Resultado", form: "integer", answer: [a + b * c, 1] }],
          steps: [`Primero las multiplicaciones: ${b} · ${c} = ${b * c}.`, `Después la suma: ${a} + ${b * c} = ${a + b * c}.`],
          lean: [{ expr: `${a} + ${b} * ${c}`, out: String(a + b * c) }],
          traps: [{ part: 0, value: (a + b) * c, code: "left-to-right", msg: "Has hecho la suma antes que la multiplicación. Primero se multiplica, luego se suma." }],
        };
      }
      if (variant === "power") {
        const a = rng.int(2, 15);
        const b = rng.int(2, 6);
        let c;
        do c = rng.int(2, 4);
        while (c === b);
        const ans = a + b * c * c;
        return {
          type: "num",
          prompt: `Calcula ${a} + ${b} · ${pow(c, 2)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [ans, 1] }],
          steps: [
            `Primero las potencias: ${pow(c, 2)} = ${c * c}.`,
            `Luego la multiplicación: ${b} · ${c * c} = ${b * c * c}.`,
            `Al final la suma: ${a} + ${b * c * c} = ${ans}.`,
          ],
          lean: [{ expr: `${a} + ${b} * ${c} ^ 2`, out: String(ans) }],
          traps: [
            { part: 0, value: (a + b) * c * c, code: "left-to-right", msg: "Has sumado antes de multiplicar. El orden es: potencias, multiplicaciones, sumas." },
            { part: 0, value: a + b * c * b * c, code: "power-of-product", msg: `El cuadrado solo afecta al ${c}, no a ${b} · ${c}.` },
          ].filter((t) => t.value !== ans),
        };
      }
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const c = rng.int(2, 6);
      const d = rng.int(1, 9);
      const ans = (a + b) * c - d;
      return {
        type: "num",
        prompt: `Calcula (${a} + ${b}) · ${c} ${MINUS} ${d}`,
        parts: [{ label: "Resultado", form: "integer", answer: [ans, 1] }],
        steps: [
          `Primero el paréntesis: ${a} + ${b} = ${a + b}.`,
          `Luego la multiplicación: ${a + b} · ${c} = ${(a + b) * c}.`,
          `Al final la resta: ${(a + b) * c} ${MINUS} ${d} = ${ans}.`,
        ],
        lean: [{ expr: `(${a} + ${b}) * ${c} - ${d}`, out: String(ans) }],
        traps: [{ part: 0, value: a + b * c - d, code: "ignored-brackets", msg: "Lo que está entre paréntesis va primero." }].filter((t) => t.value !== ans),
      };
    },
  };

  // Powers: plain, negative base, minus sign outside, zero exponent.
  GEN.powers = {
    version: 1,
    variants: ["plain", "negBase", "negSquare", "zero"],
    make(rng, opts) {
      const variant = pickVariant(rng, this.variants, opts);
      if (variant === "plain") {
        const a = rng.int(2, 5);
        const e = rng.int(3, a <= 3 ? 6 : 4);
        const ans = a ** e;
        return {
          type: "num",
          prompt: `Calcula ${pow(a, e)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [ans, 1] }],
          steps: [`${pow(a, e)} es ${a} multiplicado por sí mismo ${e} veces: ${Array(e).fill(a).join(" · ")} = ${ans}.`],
          lean: [{ expr: `${a} ^ ${e}`, out: String(ans) }],
          traps: [{ part: 0, value: a * e, code: "power-as-product", msg: `${pow(a, e)} no es ${a} · ${e}: es ${a} multiplicado por sí mismo ${e} veces.` }].filter((t) => t.value !== ans),
        };
      }
      if (variant === "negBase") {
        const a = rng.int(2, 5);
        const e = rng.int(2, 4);
        const ans = (-a) ** e;
        return {
          type: "num",
          prompt: `Calcula ${pow(`(${num(-a)})`, e)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [ans, 1] }],
          steps: [
            `Multiplicas ${pnum(-a)} por sí mismo ${e} veces: ${Array(e).fill(pnum(-a)).join(" · ")}.`,
            `${e % 2 === 0 ? "Un número par de signos menos da positivo" : "Un número impar de signos menos da negativo"}: ${num(ans)}.`,
          ],
          lean: [{ expr: `(${-a} : Int) ^ ${e}`, out: String(ans) }],
          traps: [{ part: 0, value: -ans, code: "sign-power", msg: "Cuenta los signos: cada pareja de negativos da positivo." }],
        };
      }
      if (variant === "negSquare") {
        const a = rng.int(2, 9);
        return {
          type: "num",
          prompt: `Calcula ${MINUS}${pow(a, 2)}`,
          parts: [{ label: "Resultado", form: "integer", answer: [-a * a, 1] }],
          steps: [
            `El exponente solo afecta al ${a}, no al signo menos: ${MINUS}${pow(a, 2)} = ${MINUS}(${pow(a, 2)}).`,
            `${pow(a, 2)} = ${a * a}, así que el resultado es ${num(-a * a)}.`,
          ],
          lean: [{ expr: `-(${a} : Int) ^ 2`, out: String(-a * a) }],
          traps: [{ part: 0, value: a * a, code: "neg-square-precedence", msg: `Eso sería ${pow(`(${num(-a)})`, 2)}. Sin paréntesis, el cuadrado se hace antes que el signo menos.` }],
        };
      }
      const a = rng.int(2, 99);
      return {
        type: "num",
        prompt: `Calcula ${pow(a, 0)}`,
        parts: [{ label: "Resultado", form: "integer", answer: [1, 1] }],
        steps: [`Cualquier número (que no sea 0) elevado a 0 da 1.`, `Por qué: ${pow(a, 3)} ÷ ${pow(a, 3)} = 1, y por la regla de restar exponentes también es ${pow(a, 0)}.`],
        lean: [{ expr: `${a} ^ 0`, out: "1" }],
        traps: [
          { part: 0, value: 0, code: "zero-power", msg: "Elevar a 0 no da 0: da 1." },
          { part: 0, value: a, code: "zero-power-identity", msg: "Elevar a 0 no deja el número igual: da 1." },
        ],
      };
    },
  };

  // p % of w.
  GEN.percentOf = {
    version: 1,
    make(rng) {
      const p = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 75]);
      const step = 100 / gcd(p, 100);
      const w = step * rng.int(Math.ceil(20 / step), Math.floor(400 / step));
      const ans = (p * w) / 100;
      return {
        type: "num",
        prompt: `¿Cuánto es el ${p} % de ${w}?`,
        parts: [{ label: "Resultado", form: "number", answer: [ans, 1] }],
        steps: [
          `${p} % significa ${p} de cada 100, es decir, ${frac(p, 100)}.`,
          `${frac(p, 100)} · ${w} = ${frac(p * w, 100)} = ${ans}.`,
        ],
        lean: [{ expr: `(${p} : Rat) / 100 * ${w}`, out: leanOut([ans, 1], "Rat") }],
        traps: [
          { part: 0, value: [w, p], code: "divided-by-percent", msg: `Has dividido ${w} entre ${p}. El ${p} % es ${frac(p, 100)}: multiplicas por ${p} y divides entre 100.` },
          { part: 0, value: p * w, code: "forgot-100", msg: "Te ha faltado dividir entre 100." },
        ].filter((t) => !eq(toRat(t.value), [ans, 1])),
      };
    },
  };

  // ax + b = c.
  GEN.eqTwoStep = {
    version: 2,
    make(rng) {
      const a = rng.int(2, 9);
      const x = rng.intNot0(-9, 12);
      const b = rng.intNot0(-15, 15);
      const c = a * x + b;
      const moved = c - b;
      const traps = [];
      if ((c + b) % a === 0 && (c + b) / a !== x) {
        traps.push({ part: 0, value: (c + b) / a, code: "moved-wrong-sign", msg: `Para quitar el ${num(b)} hay que hacer lo contrario: ${b > 0 ? `restar ${b}` : `sumar ${-b}`} en los dos lados.` });
      }
      if (moved !== x) traps.push({ part: 0, value: moved, code: "forgot-divide", msg: `Eso es ${a}x. Falta dividir entre ${a} para que quede x sola.` });
      return {
        type: "num",
        prompt: `Resuelve ${coefX(a)}${signed(b)} = ${num(c)}`,
        parts: [{ label: "x =", form: "integer", answer: [x, 1] }],
        steps: [
          `${b > 0 ? `Restas ${b}` : `Sumas ${-b}`} en los dos lados: ${coefX(a)} = ${num(moved)}.`,
          `Divides los dos lados entre ${a}: x = ${num(x)}.`,
          `Comprobación: ${a} · ${pnum(x)}${signed(b)} = ${num(c)}.`,
        ],
        lean: [{ expr: `(${a} : Int) * ${leanInt(x)} + ${leanInt(b)} == ${leanInt(c)}`, out: "true" }],
        traps,
      };
    },
  };

  // ax + b = cx + d with a > c.
  GEN.eqBothSides = {
    version: 2,
    make(rng) {
      const c = rng.int(1, 7);
      const a = c + rng.int(1, 5);
      const x = rng.intNot0(-8, 10);
      let b;
      let d;
      do {
        b = rng.intNot0(-12, 12);
        d = a * x + b - c * x;
      } while (d === 0);
      const k = a - c;
      const traps = [];
      if ((d - b) % (a + c) === 0 && (d - b) / (a + c) !== x) {
        traps.push({ part: 0, value: (d - b) / (a + c), code: "added-x-terms", msg: `Para juntar las x hay que restar ${coefX(c)} en los dos lados: quedan ${coefX(k)}, no ${coefX(a + c)}.` });
      }
      return {
        type: "num",
        prompt: `Resuelve ${coefX(a)}${signed(b)} = ${coefX(c)}${signed(d)}`,
        parts: [{ label: "x =", form: "integer", answer: [x, 1] }],
        steps: [
          `Restas ${coefX(c)} en los dos lados para juntar las x: ${coefX(k)}${signed(b)} = ${num(d)}.`,
          `${b > 0 ? `Restas ${b}` : `Sumas ${-b}`} en los dos lados: ${coefX(k)} = ${num(d - b)}.`,
          ...(k === 1 ? [] : [`Divides entre ${k}: x = ${num(x)}.`]),
          `Comprobación: ${a} · ${pnum(x)}${signed(b)} = ${num(a * x + b)} y ${c} · ${pnum(x)}${signed(d)} = ${num(c * x + d)}.`,
        ],
        lean: [{ expr: `(${a} : Int) * ${leanInt(x)} + ${leanInt(b)} == ${c} * ${leanInt(x)} + ${leanInt(d)}`, out: "true" }],
        traps,
      };
    },
  };

  /* ---------- Instances ---------- */

  // A shown problem: generator output plus what is needed to log and replay it.
  function instance(q, seed) {
    const g = GEN[q.gen];
    if (!g) throw new Error(`unknown generator ${q.gen}`);
    const s = seed == null ? newSeed() : seed;
    const problem = g.make(rngFrom(s), { variants: q.variants });
    (problem.parts || []).forEach((p, i) => {
      p.index = i;
    });
    return { gen: q.gen, genVersion: g.version, seed: s, problem };
  }

  // A fixed (non generated) num question from a bank, in the same shape.
  function fixedProblem(q) {
    const parts = (q.parts || []).map((p, i) => ({ label: p.label || "", form: p.form || "integer", answer: toRat(p.answer), index: i }));
    const traps = (q.traps || []).map((t) => Object.assign({}, t, { value: toRat(t.value) }));
    return { type: "num", prompt: q.prompt, parts, steps: q.steps || [], lean: q.lean || [], traps };
  }

  root.MATHKIT = {
    gcd, lcm, norm, eq, isReduced, isInt, canon, leanOut, toRat,
    frac, num, rngFrom, newSeed, parseAnswer, gradePart, HINTS, GEN, instance, fixedProblem,
  };
})(typeof window !== "undefined" ? window : globalThis);
