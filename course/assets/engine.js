// Engine for the "Leer Lean" course: lesson steps, Lean syntax highlighting,
// clickable "magnifier" code, questions, mastery, spaced review, the fogged
// boss view and the append-only event log kept by server/server.py.
(() => {
  "use strict";

  const CATALOG = window.CATALOG;
  const QUEUE_KEY = "leanCourse.queue.v1";
  const THEME_KEY = "leanCourse.theme";
  const SERVED = location.protocol === "http:" || location.protocol === "https:";
  const DAY_MS = 86400000;
  const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];
  // Sized for a 10 to 15 minute day: the review plus one lesson.
  const REVIEW_BATCH = 8;
  const THRESHOLD = CATALOG.masteryThreshold || 0.8;
  const BASE = document.body.dataset.base || "";

  /* ---------- DOM helpers ---------- */

  function h(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === "html") node.innerHTML = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : String(value));
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (s) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const plainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent.trim();
  };
  const shuffle = (list) => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const isShown = (node) => !!(node && node.offsetParent !== null);
  const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";
  const subscript = (n) => String(n).split("").map((d) => SUBSCRIPT_DIGITS[+d]).join("");
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatDate = (ms) =>
    new Date(ms).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  /* ---------- Catalog ---------- */

  // Lean modules number their lessons 0.1, 0.2...; maths modules sit between
  // them (track "math") and carry their own codes (T1, T2...).
  const LESSONS = [];
  for (const mod of CATALOG.modules) {
    mod.lessons.forEach((lesson, i) => {
      const code = mod.track === "math" ? lesson.code : `${mod.n}.${i + 1}`;
      LESSONS.push(Object.assign({}, lesson, { module: mod, track: mod.track || "lean", code, order: LESSONS.length }));
    });
  }
  const LESSON = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
  const lessonUrl = (id) => `${BASE}lessons/${id}.html`;
  const lessonOfQuestion = (qid) => qid.split(".")[0];

  /* ---------- Event store (server is the source of truth) ---------- */

  const Store = {
    events: [],
    online: false,
    readQueue() {
      try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      } catch {
        return [];
      }
    },
    writeQueue(list) {
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
      } catch {
        /* storage unavailable: nothing else to do */
      }
    },
    async post(list) {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    async load() {
      if (!SERVED) {
        this.events = this.readQueue();
        return;
      }
      try {
        const queued = this.readQueue();
        if (queued.length) {
          await this.post(queued);
          this.writeQueue([]);
        }
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.events = await res.json();
        this.online = true;
      } catch {
        this.events = this.readQueue();
        this.online = false;
      }
    },
    async push(event) {
      const full = Object.assign({ at: new Date().toISOString(), page: location.pathname.split("/").pop() }, event);
      this.events.push(full);
      if (SERVED) {
        try {
          await this.post([full]);
          this.setOnline(true);
          return;
        } catch {
          this.setOnline(false);
        }
      }
      const queue = this.readQueue();
      queue.push(full);
      this.writeQueue(queue);
    },
    setOnline(value) {
      if (this.online === value) return;
      this.online = value;
      renderBanner();
    },
  };

  let infoPromise = null;
  const fetchInfo = () => {
    if (!infoPromise) {
      infoPromise = SERVED
        ? fetch("/api/info").then((r) => (r.ok ? r.json() : null)).catch(() => null)
        : Promise.resolve(null);
    }
    return infoPromise;
  };

  function deriveState(events) {
    const lessons = {};
    const questions = {};
    let placement = null;
    const blank = () => ({ started: false, mastered: false, masteredAt: null, finishes: 0, bestScore: 0, last: null });
    const sorted = events.slice().sort((a, b) => String(a.at).localeCompare(String(b.at)));
    for (const e of sorted) {
      if (e.type === "lesson_start") {
        (lessons[e.lesson] ||= blank()).started = true;
      } else if (e.type === "lesson_finish") {
        const L = (lessons[e.lesson] ||= blank());
        L.started = true;
        L.finishes += 1;
        L.bestScore = Math.max(L.bestScore, e.score || 0);
        L.last = e;
        if (e.mastered && !L.mastered) {
          L.mastered = true;
          L.masteredAt = e.at;
        }
      } else if (e.type === "answer") {
        (questions[e.qid] ||= { qid: e.qid, history: [] }).history.push(e);
      } else if (e.type === "placement_finish") {
        placement = e;
      }
    }
    return { lessons, questions, placement };
  }

  // Fixed-interval spaced repetition. A question enters the pool one day
  // after its lesson is mastered; a correct review moves it one interval up,
  // a wrong one sends it back to one day.
  function schedule(qid, state) {
    const L = state.lessons[lessonOfQuestion(qid)];
    if (!L || !L.mastered) return null;
    let step = 0;
    let due = Date.parse(L.masteredAt) + REVIEW_INTERVALS_DAYS[0] * DAY_MS;
    const reviews = (state.questions[qid]?.history || []).filter((e) => e.mode === "review");
    for (const e of reviews) {
      const t = Date.parse(e.at);
      step = e.ok ? Math.min(step + 1, REVIEW_INTERVALS_DAYS.length - 1) : 0;
      due = t + REVIEW_INTERVALS_DAYS[step] * DAY_MS;
    }
    return { step, due };
  }

  function loadScripts(srcs) {
    return srcs.reduce(
      (chain, src) =>
        chain.then(
          () =>
            new Promise((resolve) => {
              const s = document.createElement("script");
              s.src = src;
              s.onload = resolve;
              s.onerror = resolve;
              document.head.append(s);
            }),
        ),
      Promise.resolve(),
    );
  }

  function questionBank() {
    const bank = {};
    for (const q of window.QUESTIONS || []) bank[q.id] = q;
    return bank;
  }

  async function reviewPool(state) {
    const mastered = LESSONS.filter((l) => state.lessons[l.id]?.mastered);
    await loadScripts(mastered.map((l) => `${BASE}questions/${l.id}.js`));
    const bank = questionBank();
    const now = Date.now();
    const pool = Object.values(bank)
      .filter((q) => state.lessons[lessonOfQuestion(q.id)]?.mastered)
      .map((q) => ({ q, sched: schedule(q.id, state) }))
      .filter((x) => x.sched);
    const due = pool.filter((x) => x.sched.due <= now).sort((a, b) => a.sched.due - b.sched.due);
    const upcoming = pool.filter((x) => x.sched.due > now).map((x) => x.sched.due);
    return { pool, due: due.map((x) => x.q), nextDue: upcoming.length ? Math.min(...upcoming) : null };
  }

  // Round-robin across lessons so a review session mixes topics.
  function interleave(questions) {
    const groups = new Map();
    for (const q of questions) {
      const key = lessonOfQuestion(q.id);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    }
    const lists = [...groups.values()].map(shuffle);
    const out = [];
    while (lists.some((l) => l.length)) for (const l of lists) if (l.length) out.push(l.shift());
    return out;
  }

  /* ---------- Banner and theme ---------- */

  function renderBanner() {
    let bar = $("#status-banner");
    let msg = "";
    if (!SERVED) {
      msg = "Has abierto el archivo directamente. Para que tu tutor vea tu progreso, abre el curso con ./start-course.sh";
    } else if (!Store.online) {
      msg = "Sin conexión con el servidor del curso. Tu progreso se guarda en este navegador y se enviará cuando vuelva (./start-course.sh).";
    }
    if (!msg) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = h("div", { id: "status-banner", role: "status" });
      document.body.prepend(bar);
    }
    bar.textContent = msg;
  }

  const THEMES = ["auto", "light", "dark"];
  const THEME_LABEL = { auto: "Tema: automático", light: "Tema: claro", dark: "Tema: oscuro" };
  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "auto";
    } catch {
      return "auto";
    }
  }
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }

  /* ---------- Lean highlighting ---------- */

  const DANGER = "sorry|admit|axiom|native_decide";
  const TACTICS =
    "intro|intros|exact|apply|refine|rfl|rw|simp|simp_all|omega|decide|cases|rcases|obtain|induction|constructor|use|exists|unfold|norm_num|ring|linarith|nlinarith|positivity|contradiction|exfalso|trivial|assumption|specialize|by_contra|by_cases|left|right|aesop|field_simp|linear_combination|subst|ext|funext|calc|show|have|suffices|generalizing";
  const KEYWORDS =
    "theorem|lemma|def|example|abbrev|by|fun|match|with|structure|inductive|class|instance|where|namespace|section|end|open|variable|universe|import|if|then|else|let|from|at|in|do|return|deriving|partial|opaque|noncomputable|private|protected|termination_by|decreasing_by|mutual|set_option|attribute|notation|include|omit";
  const TYPES = "Nat|Int|Bool|Prop|Type|Sort|String|List|Array|Option|UInt8|UInt16|UInt32|UInt64|BitVec|Fin|True|False|Char|Unit|Float";
  const TOKEN_RE = new RegExp(
    [
      "(-->[^\\n]*)",
      "(--[^\\n]*)",
      "(/-[\\s\\S]*?-/)",
      '("(?:[^"\\\\\\n]|\\\\.)*")',
      "(#[A-Za-z_]+)",
      `\\b(${DANGER})\\b`,
      `\\b(${TACTICS})\\b`,
      `\\b(${KEYWORDS})\\b`,
      `\\b(${TYPES})\\b`,
      "([ℕℤℝℚ])",
      "\\b(true|false|\\d+)\\b",
      "(:=|=>|<->|->|[∀∃→↔∧∨¬⊢≠≤≥⟨⟩←×∈∉λ↦∘·∣])",
    ].join("|"),
    "gu",
  );
  const TOKEN_CLASS = [null, "out", "com", "com", "str", "cmd", "danger", "tac", "kw", "ty", "ty", "lit", "sym"];

  function highlight(text) {
    let out = "";
    let last = 0;
    for (const m of text.matchAll(TOKEN_RE)) {
      out += escapeHtml(text.slice(last, m.index));
      const group = m.findIndex((v, i) => i > 0 && v !== undefined);
      const cls = TOKEN_CLASS[group];
      if (cls === "out") {
        out += `<span class="out" title="Lo que responde Lean">${escapeHtml(m[0].slice(3).trim())}</span>`;
      } else {
        out += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
      }
      last = m.index + m[0].length;
    }
    return out + escapeHtml(text.slice(last));
  }

  function highlightInline(root) {
    $$("code.l:not([data-hl])", root).forEach((c) => {
      c.innerHTML = highlight(c.textContent);
      c.dataset.hl = "1";
    });
  }

  const MARK_RE = /⟪([\s\S]+?)\|([\w.-]+)⟫/gu;
  function segments(text) {
    const segs = [];
    let last = 0;
    for (const m of text.matchAll(MARK_RE)) {
      if (m.index > last) segs.push({ text: text.slice(last, m.index) });
      segs.push({ text: m[1], id: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) segs.push({ text: text.slice(last) });
    return segs;
  }

  function normalizeCode(src) {
    const lines = String(src).replace(/\r/g, "").replace(/^\n+/, "").replace(/\s+$/, "").split("\n");
    const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
    const cut = indents.length ? Math.min(...indents) : 0;
    return lines.map((l) => l.slice(cut)).join("\n");
  }
  const codeText = (code) => (Array.isArray(code) ? code.join("\n") : String(code || ""));

  function codeBlock(src, { tokens = false, gutter = true } = {}) {
    const text = normalizeCode(src);
    const ids = [];
    let html = "";
    for (const seg of segments(text)) {
      if (seg.id && tokens) {
        ids.push(seg.id);
        html += `<span class="tk" role="button" tabindex="0" data-note="${escapeHtml(seg.id)}">${highlight(seg.text)}</span>`;
      } else {
        html += highlight(seg.text);
      }
    }
    const lineCount = text.replace(MARK_RE, "$1").split("\n").length;
    const node = h("div", { class: "code" });
    if (gutter && lineCount > 2) {
      node.append(
        h("pre", { class: "gutter", "aria-hidden": "true", text: Array.from({ length: lineCount }, (_, i) => i + 1).join("\n") }),
      );
    }
    node.append(h("pre", { class: "src", html }));
    return { node, ids };
  }

  // A clickable code block plus the explanation panel underneath it.
  function tokenExplorer(codeNode, ids, notesFor, hint) {
    const order = [...new Set(ids)];
    const panel = h("div", { class: "lupa-panel", "aria-live": "polite" }, h("p", { class: "lupa-hint", text: hint }));
    const walk = h("button", { type: "button", class: "btn-ghost lupa-walk" }, `Recorrer pieza a pieza (${order.length})`);
    let index = -1;
    const show = (id) => {
      const pieces = $$(`.tk[data-note="${CSS.escape(id)}"]`, codeNode);
      $$(".tk", codeNode).forEach((t) => t.classList.toggle("is-active", t.dataset.note === id));
      pieces.forEach((t) => t.classList.add("is-seen"));
      const label = (pieces.length ? pieces[0].textContent : id).trim();
      const note = notesFor(id) || "";
      const named = plainText(note).includes(label.slice(0, 24));
      panel.replaceChildren(
        named ? "" : h("p", { class: "lupa-token" }, h("code", { class: "l", text: label.length > 80 ? label.slice(0, 77) + "..." : label })),
        h("div", { class: "lupa-note", html: note }),
      );
      highlightInline(panel);
      index = order.indexOf(id);
      walk.textContent = index < order.length - 1 ? `Siguiente pieza (${index + 2} de ${order.length})` : "Volver a la primera";
    };
    codeNode.addEventListener("click", (e) => {
      const t = e.target.closest(".tk");
      if (t) show(t.dataset.note);
    });
    codeNode.addEventListener("keydown", (e) => {
      const t = e.target.closest(".tk");
      if (t && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        e.stopPropagation();
        show(t.dataset.note);
      }
    });
    walk.addEventListener("click", () => show(order[(index + 1) % order.length]));
    return { panel, walk: order.length ? walk : null };
  }

  function badgeFor(pre) {
    const check = pre.dataset.check;
    if (check === "error") return h("div", { class: "code-badge is-error", text: "Lean lo rechaza: error en rojo" });
    if (check === "sorry") return h("div", { class: "code-badge is-sorry", text: "Lean avisa en amarillo: usa sorry" });
    return null;
  }

  function initLupa(fig) {
    const pre = $("pre.lean", fig);
    const notesEl = $('script[type="application/json"]', fig);
    let notes = {};
    try {
      notes = JSON.parse(notesEl ? notesEl.textContent : "{}");
    } catch (err) {
      console.error("Invalid magnifier notes", err);
    }
    const { node, ids } = codeBlock(pre.textContent, { tokens: true });
    const { panel, walk } = tokenExplorer(node, ids, (id) => notes[id], "Toca una pieza subrayada del código para ver qué significa.");
    const badge = badgeFor(pre);
    pre.replaceWith(node);
    if (badge) node.before(badge);
    if (notesEl) notesEl.remove();
    fig.append(panel);
    if (walk) fig.append(walk);
  }

  /* ---------- Boss ---------- */

  function renderBoss(container, { upTo, today }) {
    const boss = window.BOSS;
    if (!boss) return;
    let html = "";
    let cleared = 0;
    let total = 0;
    let fresh = 0;
    for (const seg of segments(normalizeCode(boss.code))) {
      if (!seg.id) {
        html += `<span class="fog">${escapeHtml(seg.text)}</span>`;
        continue;
      }
      total += 1;
      const note = boss.notes[seg.id];
      const lesson = note && LESSON[note.lesson];
      if (lesson && lesson.order <= upTo) {
        cleared += 1;
        const isNew = today && note.lesson === today;
        if (isNew) fresh += 1;
        html += `<span class="tk${isNew ? " is-new" : ""}" role="button" tabindex="0" data-note="${seg.id}">${highlight(seg.text)}</span>`;
      } else {
        html += `<span class="fog" aria-hidden="true">${escapeHtml(seg.text)}</span>`;
      }
    }
    const pct = total ? Math.round((cleared / total) * 100) : 0;
    const code = h("div", { class: "code boss-code" }, h("pre", { class: "src", html }));
    const { panel, walk } = tokenExplorer(
      code,
      $$(".tk", code).map((t) => t.dataset.note),
      (id) => boss.notes[id]?.note,
      fresh
        ? "Las piezas marcadas son las que despejas hoy. Tócalas."
        : cleared
          ? "Toca una pieza despejada para recordar qué significa."
          : "Todavía es todo niebla. Es normal: cada lección despeja un trozo.",
    );
    container.replaceChildren(
      h(
        "div",
        { class: "boss-meter-row" },
        h("span", { class: "boss-meter", role: "img", "aria-label": `${pct} % despejado` }, h("span", { style: `width:${pct}%` })),
        h("span", { class: "boss-count", text: `${cleared} de ${total} piezas despejadas` }),
      ),
      code,
      panel,
    );
    if (walk && cleared) container.append(walk);
  }

  /* ---------- Questions ---------- */

  // Maths questions (course/MATH.md): a generator makes a fresh problem each
  // time the card is shown; fixed "num" questions are typed answers.
  function mathInstance(q) {
    const K = window.MATHKIT;
    if (!K || !(q.gen || q.type === "num")) return null;
    if (q.gen) return K.instance(q);
    return { gen: null, genVersion: null, seed: null, problem: K.fixedProblem(q) };
  }

  function solutionNodes(problem, showLean) {
    const nodes = [];
    if (problem.steps && problem.steps.length) {
      nodes.push(
        h("div", { class: "qsteps" }, h("p", { class: "qsteps-title", text: "Paso a paso" }), h("ol", {}, problem.steps.map((st) => h("li", { html: st })))),
      );
    }
    if (showLean && problem.lean && problem.lean.length) {
      const src = problem.lean.map((l) => `#eval ${l.expr}  --> ${l.out}`).join("\n");
      nodes.push(h("p", { class: "qsteps-title", text: "Así lo calcula Lean" }), codeBlock(src, { gutter: false }).node);
    }
    return nodes;
  }

  function questionCard(q, onAnswered) {
    const inst = mathInstance(q);
    if (inst) q = Object.assign({}, q, { prompt: inst.problem.prompt }, inst.problem.type === "mcq" ? { type: "mcq", options: inst.problem.options } : {});
    const card = h("div", { class: "qcard", "data-qid": q.id });
    card.append(h("div", { class: "qprompt", html: q.prompt }));
    const feedback = h("div", { class: "qfeedback", "aria-live": "polite" });
    let done = false;
    const finish = (ok, choice, nodes, extra) => {
      done = true;
      card.dataset.answered = ok ? "ok" : "ko";
      feedback.replaceChildren(...nodes);
      if (q.explain) feedback.append(h("div", { class: "qexplain", html: q.explain }));
      if (inst) feedback.append(...solutionNodes(inst.problem, !!q.showLean));
      highlightInline(feedback);
      onAnswered({ ok, choice, extra: extra || {} });
      if (!reducedMotion()) feedback.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };
    const mathExtra = (fields) =>
      inst ? Object.assign({ track: "math", gen: inst.gen, genVersion: inst.genVersion, seed: inst.seed, prompt: plainText(q.prompt) }, fields) : {};
    const verdict = (ok, wrongText) =>
      h("p", { class: ok ? "verdict ok" : "verdict ko", text: ok ? "Correcto." : wrongText || "No es esa." });

    if (inst && inst.problem.type === "num") {
      card.append(...numInput(q, inst, card, finish, mathExtra, () => done));
    } else if (q.type === "spot") {
      card.__answer = { kind: "spot", line: q.answer[0] };
      const lines = codeText(q.code).split("\n");
      const box = h("div", { class: "code spot", role: "group", "aria-label": "Líneas de código: elige una" });
      lines.forEach((line, i) => {
        const btn = h(
          "button",
          { type: "button", class: "spot-line", "data-line": i + 1, "data-key": i + 1 },
          h("span", { class: "spot-n", text: String(i + 1) }),
          h("span", { class: "spot-src", html: highlight(line) || " " }),
        );
        btn.addEventListener("click", () => {
          if (done) return;
          const ok = q.answer.includes(i + 1);
          $$(".spot-line", box).forEach((b) => {
            b.disabled = true;
            if (q.answer.includes(+b.dataset.line)) b.classList.add("is-correct");
          });
          btn.classList.add(ok ? "is-chosen-ok" : "is-chosen-ko");
          const nodes = [verdict(ok, `No es esa. Era la línea ${q.answer.join(" o la ")}.`)];
          if (q.why) nodes.push(h("p", { html: q.why }));
          finish(ok, `line ${i + 1}`, nodes);
        });
        box.append(btn);
      });
      card.append(box);
    } else {
      if (q.code) card.append(codeBlock(codeText(q.code)).node);
      const options = q.noShuffle ? q.options.slice() : shuffle(q.options);
      card.__answer = { kind: "mcq", text: plainText(options.find((o) => o.ok).t) };
      const list = h("div", { class: "qopts", role: "group" });
      options.forEach((opt, i) => {
        const btn = h(
          "button",
          { type: "button", class: "qopt", "data-key": i + 1 },
          h("span", { class: "qkey", "aria-hidden": "true", text: String(i + 1) }),
          h("span", { class: "qtext", html: opt.t }),
        );
        btn.addEventListener("click", () => {
          if (done) return;
          const ok = !!opt.ok;
          $$(".qopt", list).forEach((b, j) => {
            b.disabled = true;
            if (options[j].ok) b.classList.add("is-correct");
          });
          btn.classList.add(ok ? "is-chosen-ok" : "is-chosen-ko");
          $$(".qdunno", card).forEach((b) => (b.disabled = true));
          const right = options.find((o) => o.ok);
          const nodes = [verdict(ok)];
          if (opt.why) nodes.push(h("p", { html: opt.why }));
          if (!ok && right && right.why) nodes.push(h("p", { class: "right-why", html: `<strong>La buena:</strong> ${right.why}` }));
          finish(ok, plainText(opt.t), nodes, mathExtra({ given: plainText(opt.t), expected: plainText(right.t) }));
        });
        list.append(btn);
      });
      card.append(list);
      if (inst) {
        // Maths cards never force a guess (course/MATH.md).
        const dunno = h("button", { type: "button", class: "btn-ghost qdunno" }, "No lo sé");
        dunno.addEventListener("click", () => {
          if (done) return;
          $$(".qopt", list).forEach((b, j) => {
            b.disabled = true;
            if (options[j].ok) b.classList.add("is-correct");
          });
          dunno.disabled = true;
          const right = options.find((o) => o.ok);
          finish(false, "(no lo sé)", [h("p", { class: "verdict ko", text: "Sin problema: mira cómo se hace." }), h("p", { class: "right-why", html: `<strong>La buena:</strong> ${right.why}` })],
            mathExtra({ given: "", expected: plainText(right.t), skipped: true }));
        });
        card.append(h("div", { class: "num-actions" }, dunno));
      }
    }
    card.append(feedback);
    highlightInline(card);
    return card;
  }

  // Typed answer inputs for a num problem. Format slips (thousands dots,
  // words, a decimal where a fraction is wanted) re-prompt without a miss.
  function numInput(q, inst, card, finish, mathExtra, isDone) {
    const K = window.MATHKIT;
    const P = inst.problem;
    const nodes = [];
    if (q.code) nodes.push(codeBlock(codeText(q.code)).node);
    const forms = [...new Set(P.parts.map((p) => p.form))];
    const box = h("div", { class: "qnum" });
    const uid = Math.random().toString(36).slice(2, 8);
    const hintId = `hint-${uid}`;
    const msgId = `msg-${uid}`;
    const inputs = P.parts.map((part, i) => {
      const id = `num-${uid}-${i}`;
      const input = h("input", {
        type: "text", id, class: "num-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false",
        "aria-describedby": `${hintId} ${msgId}`,
      });
      // Enter moves to the next empty box first, then submits.
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const empty = inputs.find((other, j) => j > i && !other.value.trim());
        if (input.value.trim() && empty) empty.focus();
        else submit(false);
      });
      input.addEventListener("input", () => input.removeAttribute("aria-invalid"));
      box.append(h("div", { class: "num-part" }, h("label", { for: id, class: "num-label", text: part.label || "Respuesta" }), input));
      return input;
    });
    const hint = h("p", { id: hintId, class: "num-hint", text: forms.map((f) => K.HINTS[f]).join(" ") });
    const msg = h("p", { id: msgId, class: "num-msg", role: "status" });
    const check = h("button", { type: "button", class: "btn-secondary" }, "Comprobar");
    const dunno = h("button", { type: "button", class: "btn-ghost" }, "No lo sé");
    check.addEventListener("click", () => submit(false));
    dunno.addEventListener("click", () => submit(true));
    const expected = P.parts.map((p) => K.canon(K.toRat(p.answer)));
    card.__answer = { kind: "num", values: expected };

    function submit(skipped) {
      if (isDone()) return;
      const results = [];
      if (!skipped) {
        for (const [i, part] of P.parts.entries()) {
          const r = K.gradePart(part, inputs[i].value, P.traps);
          if (r.status === "reprompt") {
            msg.textContent = r.msg;
            inputs[i].setAttribute("aria-invalid", "true");
            inputs[i].focus();
            return;
          }
          results.push(r);
        }
      }
      msg.textContent = "";
      const ok = !skipped && results.every((r) => r.ok);
      inputs.forEach((input, i) => {
        input.disabled = true;
        if (!skipped) input.classList.add(results[i].ok ? "is-ok" : "is-ko");
      });
      check.disabled = true;
      dunno.disabled = true;
      const shown = P.parts.map((p) => {
        const value = K.frac(...K.norm(K.toRat(p.answer)));
        if (P.parts.length === 1) return value;
        return p.label.endsWith("=") ? `${p.label} ${value}` : `${p.label}: ${value}`;
      });
      const out = [h("p", { class: ok ? "verdict ok" : "verdict ko", text: ok ? "Correcto." : skipped ? "Sin problema: mira cómo se hace." : "No es eso." })];
      if (!ok) out.push(h("p", { class: "num-answer", html: `La respuesta: ${shown.join(", ")}` }));
      for (const r of results) {
        if (r.note) out.push(h("p", { text: r.note }));
        if (r.trap) out.push(h("p", { class: "qtrap", html: r.trap.msg }));
      }
      // Parts are joined with " ; " because a part can contain a comma (0,75).
      const given = skipped ? "" : inputs.map((input) => input.value.trim()).join(" ; ");
      const traps = results.filter((r) => r.trap).map((r) => r.trap.code);
      const typedFractions = results.filter((r) => r.reduced !== null);
      finish(ok, skipped ? "(no lo sé)" : given, out, mathExtra({
        given,
        expected: expected.join(" ; "),
        trap: traps[0] || null,
        traps,
        reduced: typedFractions.length ? typedFractions.every((r) => r.reduced) : null,
        skipped: !!skipped,
      }));
    }

    nodes.push(box, hint, msg, h("div", { class: "num-actions" }, check, dunno));
    return nodes;
  }

  function runQuiz(container, items, { mode, title, onDone }) {
    let i = 0;
    const results = [];
    const step = () => {
      container.replaceChildren();
      if (i >= items.length) {
        onDone(results);
        return;
      }
      const q = items[i];
      const next = h(
        "button",
        { type: "button", class: "btn-primary", "data-primary": "", disabled: true },
        i + 1 < items.length ? "Siguiente pregunta" : "Ver resultado",
      );
      const card = questionCard(q, ({ ok, choice, extra }) => {
        results.push({ q, ok });
        Store.push(Object.assign({ type: "answer", mode, qid: q.id, lesson: lessonOfQuestion(q.id), ok, choice, concept: q.concept || null }, extra));
        next.disabled = false;
        next.focus({ preventScroll: true });
      });
      next.addEventListener("click", () => {
        i += 1;
        step();
        window.scrollTo({ top: 0 });
      });
      container.append(
        h("p", { class: "quiz-counter", text: `${title}: pregunta ${i + 1} de ${items.length}` }),
        card,
        h("div", { class: "quiz-actions" }, next),
      );
      const firstInput = $(".num-input", card);
      if (firstInput) firstInput.focus({ preventScroll: true });
    };
    step();
  }

  /* ---------- Shared chrome ---------- */

  function buildTopbar(lesson) {
    const bar = h("header", { class: "topbar" });
    bar.append(h("a", { class: "brand", href: `${BASE}index.html` }, "Mapa del curso"));
    if (lesson) {
      bar.append(h("span", { class: "crumb" }, h("span", { class: "crumb-code", text: lesson.code }), h("span", { class: "crumb-title", text: lesson.title })));
    }
    bar.append(h("span", { class: "grow" }));
    const sheetBtn = h("button", { type: "button", class: "btn-ghost btn-small", "aria-expanded": "false", "aria-controls": "sheet" }, "Chuleta");
    const themeBtn = h("button", { type: "button", class: "btn-ghost btn-small", title: THEME_LABEL[getTheme()] }, "Tema");
    themeBtn.addEventListener("click", () => {
      const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* per-viewer convenience only */
      }
      applyTheme(next);
      themeBtn.title = THEME_LABEL[next];
      themeBtn.setAttribute("aria-label", THEME_LABEL[next]);
    });
    sheetBtn.addEventListener("click", () => toggleSheet());
    bar.append(sheetBtn, themeBtn);
    document.body.prepend(bar);
    return bar;
  }

  function buildSheet(upToOrder) {
    const items = CATALOG.symbols.filter((s) => LESSON[s.lesson] && LESSON[s.lesson].order <= upToOrder);
    const close = h("button", { type: "button", class: "btn-ghost btn-small" }, "Cerrar");
    close.addEventListener("click", () => toggleSheet(false));
    const sheet = h("aside", { id: "sheet", class: "sheet", hidden: true, "aria-label": "Chuleta de símbolos" });
    sheet.append(h("div", { class: "sheet-head" }, h("h2", { text: "Chuleta" }), close));
    if (!items.length) {
      sheet.append(h("p", { class: "muted", text: "Aún no has visto símbolos. Irán apareciendo aquí según avances." }));
    } else {
      sheet.append(
        h(
          "dl",
          { class: "sheet-list" },
          items.map((s) => [h("dt", {}, h("code", { class: "l", text: s.s })), h("dd", { text: s.read })]),
        ),
      );
    }
    document.body.append(sheet);
    highlightInline(sheet);
  }

  function toggleSheet(force) {
    const sheet = $("#sheet");
    if (!sheet) return;
    const open = force === undefined ? sheet.hidden : force;
    sheet.hidden = !open;
    $$('[aria-controls="sheet"]').forEach((b) => b.setAttribute("aria-expanded", String(open)));
  }

  function goalBox(lesson) {
    return h(
      "div",
      { class: "goalbox", role: "note" },
      h("div", { class: "goal-head", text: `Lección ${lesson.code}: 1 objetivo` }),
      h("div", { class: "goal-line" }, h("span", { class: "turnstile", text: "⊢" }), h("span", { class: "goal-text", text: lesson.goal })),
    );
  }

  function closeGoal(box) {
    box.classList.add("is-done");
    box.replaceChildren(
      h("div", { class: "goal-head", text: "Objetivo cumplido" }),
      h("div", { class: "goal-line" }, h("span", { class: "turnstile", text: "✓" }), h("span", { class: "goal-text", text: "No goals" })),
    );
    box.append(h("p", { class: "goal-foot", text: "Así lo dice Lean cuando no queda nada por demostrar." }));
  }

  function nextReadyLesson(fromOrder) {
    return LESSONS.find((l) => l.order > fromOrder && l.status === "ready") || null;
  }

  /* ---------- Lesson page ---------- */

  async function initLesson() {
    const id = document.body.dataset.lesson;
    const lesson = LESSON[id];
    const main = $("#lesson");
    const steps = $$("section.step", main);
    await Store.load();
    renderBanner();
    const state = deriveState(Store.events);
    const bank = questionBank();
    const session = { startedAt: null, results: {}, labSkipped: false, confidence: null };

    buildTopbar(lesson);
    buildSheet(lesson.order);

    $$("figure.lupa", main).forEach(initLupa);
    $$("pre.lean", main).forEach((pre) => {
      const badge = badgeFor(pre);
      const { node } = codeBlock(pre.textContent);
      pre.replaceWith(node);
      if (badge) node.before(badge);
    });
    $$(".boss-view", main).forEach((v) => renderBoss(v, { upTo: lesson.order, today: id }));
    $$("h1, h2", main).forEach((t) => t.setAttribute("tabindex", "-1"));
    highlightInline(main);

    const slots = [];
    $$(".q[data-q]", main).forEach((slot) => {
      const q = bank[slot.dataset.q];
      if (!q) {
        slot.replaceWith(h("p", { class: "missing", text: `Falta la pregunta ${slot.dataset.q}` }));
        return;
      }
      const inLab = !!slot.closest('[data-kind="lab"]');
      slots.push({ q, inLab });
      const card = questionCard(q, ({ ok, choice, extra }) => {
        session.results[q.id] = { ok, inLab };
        Store.push(Object.assign({ type: "answer", mode: "lesson", qid: q.id, lesson: id, ok, choice, concept: q.concept || null }, extra));
        updateNav();
      });
      slot.replaceWith(card);
    });

    // Progress segments and bottom navigation.
    const progress = h("ol", { class: "progress", "aria-label": "Pasos de la lección" }, steps.map(() => h("li", {})));
    $(".topbar").after(progress);
    const back = h("button", { type: "button", class: "btn-ghost", "data-back": "" }, "Atrás");
    const skipLab = h("button", { type: "button", class: "btn-ghost" }, "Saltar el laboratorio por hoy");
    const next = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, "Siguiente");
    const nav = h("nav", { class: "stepnav", "aria-label": "Navegación de la lección" }, h("div", { class: "stepnav-inner" }, back, h("span", { class: "grow" }), skipLab, next));
    document.body.append(nav);

    // Cover: goal, time and the two ways in.
    const cover = steps[0];
    cover.prepend(goalBox(lesson));
    cover.append(h("p", { class: "meta", text: `Unos ${lesson.minutes} minutos, ${steps.length} pasos.` }));
    if (state.lessons[id]?.mastered) {
      cover.append(h("p", { class: "meta ok-text", text: "Ya dominaste esta lección. Repetirla no te quita nada." }));
    }
    const start = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, "Empezar");
    start.addEventListener("click", () => {
      if (!session.startedAt) {
        session.startedAt = Date.now();
        Store.push({ type: "lesson_start", lesson: id, mode: "lesson" });
      }
      go(1);
    });
    const actions = h("div", { class: "cover-actions" }, start);
    if (slots.length >= 4) {
      const testOut = h("button", { type: "button", class: "btn-ghost" }, "Ya me lo sé: solo las preguntas");
      testOut.addEventListener("click", startTestOut);
      actions.append(testOut);
    }
    cover.append(actions);

    // Lab steps: how to open the file.
    $$('section.step[data-kind="lab"]', main).forEach((lab) => {
      const file = lab.dataset.file || lesson.lab;
      if (!file) return;
      const open = h("a", { class: "btn-secondary", href: "#", target: "_self" }, "Abrir en VS Code");
      const box = h(
        "div",
        { class: "lab-open" },
        h("p", {}, "Archivo: ", h("code", { text: `practice/${file}` })),
        open,
        h("p", { class: "lab-alt", html: "Si el botón no abre nada: en una terminal, <code>./start-course.sh lab</code> y busca el archivo en la barra lateral de VS Code." }),
      );
      fetchInfo().then((info) => {
        if (info && info.root) open.href = encodeURI(`vscode://file${info.root}/practice/${file}`);
        else open.remove();
      });
      const heading = $("h2", lab);
      if (heading) heading.after(box);
      else lab.prepend(box);
    });

    const wrap = steps[steps.length - 1];
    let current = 0;

    function updateNav() {
      const step = steps[current];
      const kind = step.dataset.kind || "concept";
      const pending = $$(".qcard", step).filter((c) => !c.dataset.answered).length;
      back.hidden = current === 0;
      next.hidden = kind === "cover" || kind === "wrap";
      next.disabled = pending > 0;
      next.textContent = pending === 0 ? "Siguiente" : pending === 1 ? "Responde para seguir" : `Responde las ${pending} preguntas`;
      skipLab.hidden = kind !== "lab";
      $$("li", progress).forEach((li, i) => {
        li.className = i < current ? "done" : i === current ? "current" : "";
      });
    }

    function go(i) {
      current = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, j) => {
        s.hidden = j !== current;
      });
      if (steps[current] === wrap) renderFinish();
      updateNav();
      window.scrollTo({ top: 0 });
      const heading = $("h1, h2", steps[current]);
      if (heading && current > 0) heading.focus({ preventScroll: true });
    }
    back.addEventListener("click", () => go(current - 1));
    next.addEventListener("click", () => go(current + 1));
    skipLab.addEventListener("click", () => {
      session.labSkipped = true;
      go(current + 1);
    });

    function score() {
      const counted = slots.filter(({ q, inLab }) => !(inLab && session.labSkipped) && session.results[q.id]);
      const failed = counted.filter(({ q }) => !session.results[q.id].ok).map(({ q }) => q);
      return { correct: counted.length - failed.length, total: counted.length, failed };
    }

    function renderFinish() {
      const { correct, total } = score();
      const existing = $(".finish", wrap);
      if (existing) {
        const line = $(".finish-score", existing);
        if (line) line.textContent = total ? `Has acertado ${correct} de ${total} a la primera.` : "";
        return;
      }
      const panel = h("div", { class: "finish" });
      panel.append(h("p", { class: "finish-score", text: total ? `Has acertado ${correct} de ${total} a la primera.` : "" }));
      const confidence = h("div", { class: "confidence", role: "group", "aria-label": "Cómo te ha ido" });
      [
        ["low", "Me ha costado"],
        ["mid", "Bien, con alguna duda"],
        ["high", "Lo tengo claro"],
      ].forEach(([value, label]) => {
        const b = h("button", { type: "button", class: "chip", "aria-pressed": "false" }, label);
        b.addEventListener("click", () => {
          session.confidence = value;
          $$(".chip", confidence).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
        });
        confidence.append(b);
      });
      const note = h("textarea", { id: "tutor-note", rows: 3, placeholder: "Por ejemplo: no entiendo por qué... / esto me ha encantado / me he perdido en el paso 3" });
      const done = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, "Terminar lección");
      done.addEventListener("click", () => finishLesson(note.value.trim(), panel));
      panel.append(
        h("p", { class: "finish-ask", text: "¿Cómo te ha ido?" }),
        confidence,
        h("label", { for: "tutor-note", class: "finish-ask", text: "Nota para tu tutor (opcional)" }),
        note,
        h("div", { class: "finish-actions" }, done),
      );
      wrap.append(panel);
    }

    let finished = false;
    async function finishLesson(noteText, panel) {
      if (finished) return;
      finished = true;
      const { correct, total, failed } = score();
      const value = total ? correct / total : 1;
      const mastered = value >= THRESHOLD;
      await Store.push({
        type: "lesson_finish",
        lesson: id,
        mode: "lesson",
        score: Number(value.toFixed(3)),
        correct,
        total,
        mastered,
        confidence: session.confidence,
        note: noteText || null,
        labSkipped: session.labSkipped,
        durationSec: session.startedAt ? Math.round((Date.now() - session.startedAt) / 1000) : null,
        failed: failed.map((q) => q.id),
      });
      next.hidden = true;
      back.hidden = true;
      showOutcome(panel, { mastered, correct, total, failed, firstScore: value });
    }

    function showOutcome(panel, { mastered, correct, total, failed, firstScore }) {
      const box = goalBox(lesson);
      panel.replaceChildren(box);
      if (mastered) {
        closeGoal(box);
        panel.append(h("p", { class: "outcome", text: "Lección dominada. Sus preguntas volverán en tu repaso a partir de mañana, espaciadas para que no se te olviden." }));
      } else {
        panel.append(
          h("p", {
            class: "outcome",
            text: `Te quedas en ${correct} de ${total}. Para dominarla hace falta un 80 %. Puedes repetir ahora las que fallaste, o volver mañana con la cabeza fresca.`,
          }),
        );
      }
      const actions = h("div", { class: "finish-actions" });
      if (!mastered && failed.length) {
        const retry = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, "Repetir las que fallé");
        retry.addEventListener("click", () => startRetry(failed, firstScore));
        actions.append(retry);
      }
      const following = nextReadyLesson(lesson.order);
      if (following) {
        actions.append(
          h("a", { class: mastered ? "btn-primary" : "btn-ghost", href: lessonUrl(following.id), "data-primary": mastered ? "" : null }, `Siguiente: ${following.code} ${following.title}`),
        );
      }
      actions.append(h("a", { class: "btn-ghost", href: `${BASE}index.html` }, "Volver al mapa"));
      panel.append(actions, h("p", { class: "muted", text: "Si te apetece, sigue. Si no, déjalo aquí: el repaso hará el resto." }));
      if (mastered && !reducedMotion()) box.classList.add("is-arriving");
    }

    function enterQuizMode() {
      steps.forEach((s) => {
        s.hidden = true;
      });
      nav.hidden = true;
      progress.hidden = true;
      const section = h("section", { class: "step quizmode" });
      main.append(section);
      window.scrollTo({ top: 0 });
      return section;
    }

    function startTestOut() {
      Store.push({ type: "lesson_start", lesson: id, mode: "testout" });
      const section = enterQuizMode();
      const box = h("div");
      section.append(h("h2", { text: "Prueba rápida" }), h("p", { text: "Todas las preguntas de la lección, sin explicaciones antes. Si aciertas el 80 %, la das por dominada." }), box);
      runQuiz(box, shuffle(slots.map((s) => s.q)), {
        mode: "testout",
        title: "Prueba rápida",
        onDone: (results) => {
          const correct = results.filter((r) => r.ok).length;
          const value = results.length ? correct / results.length : 0;
          const mastered = value >= THRESHOLD;
          Store.push({
            type: "lesson_finish",
            lesson: id,
            mode: "testout",
            score: Number(value.toFixed(3)),
            correct,
            total: results.length,
            mastered,
            failed: results.filter((r) => !r.ok).map((r) => r.q.id),
          });
          const goal = goalBox(lesson);
          section.replaceChildren(goal);
          const actions = h("div", { class: "finish-actions" });
          if (mastered) {
            closeGoal(goal);
            section.append(h("p", { class: "outcome", text: `${correct} de ${results.length}. Dominada sin hacer la lección. Sus preguntas pasan a tu repaso.` }));
            const following = nextReadyLesson(lesson.order);
            if (following) actions.append(h("a", { class: "btn-primary", href: lessonUrl(following.id), "data-primary": "" }, `Siguiente: ${following.code} ${following.title}`));
          } else {
            section.append(h("p", { class: "outcome", text: `${correct} de ${results.length}. Mejor haz la lección: son unos ${lesson.minutes} minutos y lo que has fallado ya lo has visto.` }));
            const redo = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, "Hacer la lección");
            redo.addEventListener("click", () => location.reload());
            actions.append(redo);
          }
          actions.append(h("a", { class: "btn-ghost", href: `${BASE}index.html` }, "Volver al mapa"));
          section.append(actions);
        },
      });
    }

    function startRetry(failed, firstScore) {
      const section = enterQuizMode();
      const box = h("div");
      section.append(h("h2", { text: "Segunda oportunidad" }), box);
      runQuiz(box, shuffle(failed), {
        mode: "retry",
        title: "Segunda oportunidad",
        onDone: (results) => {
          const correct = results.filter((r) => r.ok).length;
          const mastered = correct === results.length;
          Store.push({
            type: "lesson_finish",
            lesson: id,
            mode: "retry",
            score: Number(firstScore.toFixed(3)),
            correct,
            total: results.length,
            mastered,
            failed: results.filter((r) => !r.ok).map((r) => r.q.id),
          });
          const goal = goalBox(lesson);
          section.replaceChildren(goal);
          const actions = h("div", { class: "finish-actions" });
          if (mastered) {
            closeGoal(goal);
            section.append(h("p", { class: "outcome", text: "Ahora sí: lección dominada." }));
            const following = nextReadyLesson(lesson.order);
            if (following) actions.append(h("a", { class: "btn-primary", href: lessonUrl(following.id), "data-primary": "" }, `Siguiente: ${following.code} ${following.title}`));
          } else {
            section.append(
              h("p", { class: "outcome", text: "Todavía se resiste alguna. No pasa nada: tu tutor verá cuáles son y te las explicará de otra forma. Vuelve mañana." }),
            );
          }
          actions.append(h("a", { class: "btn-ghost", href: `${BASE}index.html` }, "Volver al mapa"));
          section.append(actions);
        },
      });
    }

    go(0);
  }

  /* ---------- Map page ---------- */

  function courseGoal(container, masteredLessons) {
    const view = h("div", { class: "infoview", role: "img", "aria-label": `Has dominado ${masteredLessons.length} lecciones` });
    const allDone = LESSONS.every((l) => masteredLessons.includes(l));
    view.append(h("div", { class: "iv-count", text: allDone ? "No goals" : "1 objetivo" }));
    view.append(h("div", { class: "iv-hyp" }, h("span", { class: "hn", text: "tú" }), " : ", h("span", { class: "ht", text: "Aprendiz" })));
    masteredLessons.forEach((l, i) => {
      view.append(h("div", { class: "iv-hyp" }, h("span", { class: "hn", text: `h${subscript(i + 1)}` }), " : ", h("span", { class: "ht", text: l.hyp })));
    });
    if (!allDone) view.append(h("div", { class: "iv-goal" }, h("span", { class: "turnstile", text: "⊢ " }), CATALOG.goal));
    container.replaceChildren(view);
  }

  async function initIndex() {
    buildTopbar(null);
    await Store.load();
    renderBanner();
    const state = deriveState(Store.events);
    const mastered = LESSONS.filter((l) => state.lessons[l.id]?.mastered);
    const touched = LESSONS.filter((l) => state.lessons[l.id]?.started);
    const reach = touched.length ? Math.max(...touched.map((l) => l.order)) : -1;
    buildSheet(reach);
    courseGoal($("#course-goal"), mastered);

    const nextLesson = LESSONS.find((l) => l.status === "ready" && !state.lessons[l.id]?.mastered);
    const nextBox = $("#next-step");
    if (nextLesson) {
      const started = state.lessons[nextLesson.id]?.started;
      nextBox.replaceChildren(
        h("p", { class: "next-kicker", text: started ? "Te quedaste aquí" : mastered.length ? "Lo siguiente" : "Empieza aquí" }),
        h("a", { class: "next-card", href: lessonUrl(nextLesson.id), "data-primary": "" }, h("span", { class: "next-code", text: nextLesson.code }), h("span", { class: "next-title", text: nextLesson.title }), h("span", { class: "next-meta", text: `${nextLesson.minutes} min` })),
      );
    } else {
      nextBox.replaceChildren(h("p", { class: "next-kicker", text: "Has dominado todo lo que hay construido. Abre a tu tutor: preparará el siguiente módulo con lo que has aprendido." }));
    }

    const extras = $("#extras");
    extras.replaceChildren();
    const { pool, due, nextDue } = await reviewPool(state);
    if (due.length) {
      extras.append(h("a", { class: "extra-card is-due", href: `${BASE}review.html` }, h("strong", { text: `Repaso: ${due.length} pendientes` }), h("span", { text: "Cinco minutos. Es lo que hace que no se te olvide." })));
    } else if (pool.length && nextDue) {
      extras.append(h("div", { class: "extra-card" }, h("strong", { text: "Repaso al día" }), h("span", { text: `El próximo toca el ${formatDate(nextDue)}.` })));
    }
    const check = nextMathCheck(Store.events);
    if (check) {
      extras.append(
        h("a", { class: "extra-card", href: `${BASE}chequeo.html` }, h("strong", { text: `Chequeo de mates ${check.bite} (${check.minutes} min)` }), h("span", { text: "Ejercicios cortos para que tu tutor sepa por dónde empezar con las mates." })),
      );
    }
    if (!state.placement) {
      extras.append(h("a", { class: "extra-card", href: `${BASE}placement.html` }, h("strong", { text: "Prueba de nivel de Lean (5 min)" }), h("span", { text: "Para saber qué lecciones de Lean puedes ir más rápido." })));
    }

    const maxMastered = mastered.length ? Math.max(...mastered.map((l) => l.order)) : -1;
    renderBoss($("#boss"), { upTo: maxMastered, today: null });

    const modules = $("#modules");
    modules.replaceChildren();
    for (const mod of CATALOG.modules) {
      const list = h("ol", { class: "lesson-list" });
      for (const raw of mod.lessons) {
        const l = LESSON[raw.id];
        const st = state.lessons[l.id];
        const status = l.status !== "ready" ? "planned" : st?.mastered ? "mastered" : st?.started ? "started" : "open";
        const label = { planned: "La prepara tu tutor", mastered: "Dominada", started: "Empezada", open: "Disponible" }[status];
        const inner = [
          h("span", { class: `dot dot-${status}`, "aria-hidden": "true" }),
          h("span", { class: "lesson-code", text: l.code }),
          h("span", { class: "lesson-title", text: l.title }),
          h("span", { class: "lesson-status", text: label }),
        ];
        list.append(h("li", { class: `lesson-row is-${status}` }, status === "planned" ? h("div", { class: "lesson-link" }, inner) : h("a", { class: "lesson-link", href: lessonUrl(l.id) }, inner)));
      }
      const heading = mod.track === "math" ? `Mates. ${mod.title}` : `Módulo ${mod.n}. ${mod.title}`;
      modules.append(h("section", { class: `module is-${mod.track || "lean"}` }, h("h3", { text: heading }), h("p", { class: "module-blurb", text: mod.blurb }), list));
    }
  }

  /* ---------- Review page ---------- */

  async function initReview() {
    buildTopbar(null);
    await Store.load();
    renderBanner();
    const state = deriveState(Store.events);
    const touched = LESSONS.filter((l) => state.lessons[l.id]?.started);
    buildSheet(touched.length ? Math.max(...touched.map((l) => l.order)) : -1);
    const box = $("#review");
    const { pool, due, nextDue } = await reviewPool(state);
    if (!pool.length) {
      box.replaceChildren(
        h("p", { text: "Cuando domines tu primera lección, sus preguntas aparecerán aquí al día siguiente, y luego cada vez más espaciadas." }),
        h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Ir al mapa"),
      );
      return;
    }
    if (!due.length) {
      box.replaceChildren(
        h("p", { text: `Nada pendiente hoy. ${nextDue ? `El próximo repaso toca el ${formatDate(nextDue)}.` : ""}` }),
        h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Ir al mapa"),
      );
      return;
    }
    const batch = interleave(due).slice(0, REVIEW_BATCH);
    const start = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, `Empezar (${batch.length} preguntas)`);
    box.replaceChildren(h("p", { text: "Preguntas de lecciones que ya dominaste, mezcladas. Las que aciertes volverán más tarde; las que falles, mañana." }), start);
    start.addEventListener("click", () =>
      runQuiz(box, batch, {
        mode: "review",
        title: "Repaso",
        onDone: (results) => {
          const correct = results.filter((r) => r.ok).length;
          box.replaceChildren(
            h("p", { class: "outcome", text: `Has acertado ${correct} de ${results.length}. Las que fallaste vuelven mañana; las demás, más adelante.` }),
            h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Volver al mapa"),
          );
        },
      }),
    );
  }

  /* ---------- Placement page ---------- */

  async function initPlacement() {
    buildTopbar(null);
    await Store.load();
    renderBanner();
    buildSheet(-1);
    const box = $("#placement");
    const items = (window.QUESTIONS || []).filter((q) => q.id.startsWith("placement."));
    const start = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, `Empezar (${items.length} preguntas)`);
    box.replaceChildren(
      h("p", { text: "Unas preguntas rápidas para ver qué te suena ya. Fallar aquí es útil: le dice a tu tutor por dónde empezar. Si no sabes una, elige la que te parezca y sigue." }),
      start,
    );
    start.addEventListener("click", () =>
      runQuiz(box, items, {
        mode: "placement",
        title: "Prueba de nivel",
        onDone: (results) => {
          const areas = {};
          for (const { q, ok } of results) {
            const a = (areas[q.area] ||= { label: q.areaLabel || q.area, lessons: q.lessons || [], correct: 0, total: 0 });
            a.total += 1;
            if (ok) a.correct += 1;
          }
          Store.push({ type: "placement_finish", areas, correct: results.filter((r) => r.ok).length, total: results.length });
          const rows = Object.values(areas).map((a) => {
            const strong = a.correct === a.total;
            const lessons = a.lessons.map((lid) => LESSON[lid]?.code).filter(Boolean).join(", ");
            return h(
              "li",
              { class: strong ? "pl-strong" : "pl-weak" },
              h("strong", { text: `${a.label}: ${a.correct} de ${a.total}. ` }),
              strong && lessons
                ? `En ${lessons} puedes probar «Ya me lo sé».`
                : lessons
                  ? `Haz ${lessons} con calma.`
                  : strong
                    ? ""
                    : "Tu tutor lo repasará contigo.",
            );
          });
          box.replaceChildren(
            h("h2", { text: "Resultado" }),
            h("ul", { class: "placement-result" }, rows),
            h("p", { text: "Tu tutor también lo ha visto y lo tendrá en cuenta." }),
            h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Ir al mapa"),
          );
        },
      }),
    );
  }

  /* ---------- Maths check page ---------- */

  // The first check bite (CATALOG.mathChecks) without a finish event.
  function nextMathCheck(events) {
    const done = new Set(events.filter((e) => e.type === "math_check_finish").map((e) => e.bite));
    return (CATALOG.mathChecks || []).find((c) => !done.has(c.bite)) || null;
  }

  async function initMathCheck() {
    buildTopbar(null);
    await Store.load();
    renderBanner();
    buildSheet(-1);
    const box = $("#mathcheck");
    const check = nextMathCheck(Store.events);
    if (!check) {
      box.replaceChildren(
        h("p", { text: "Has hecho todos los chequeos que hay por ahora. Tu tutor preparará el siguiente cuando toque." }),
        h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Ir al mapa"),
      );
      return;
    }
    const items = (window.QUESTIONS || []).filter((q) => q.id.startsWith("chequeo.") && q.bite === check.bite);
    const start = h("button", { type: "button", class: "btn-primary", "data-primary": "" }, `Empezar (${items.length} ejercicios)`);
    box.replaceChildren(
      h("p", { text: `Son ${items.length} ejercicios cortos, unos ${check.minutes} minutos. Escribe el resultado; si no te sale, pulsa «No lo sé» y verás cómo se hace.` }),
      h("p", { class: "muted", text: "No es un examen: sirve para que tu tutor sepa qué dominas y qué conviene repasar. Ten papel a mano." }),
      start,
    );
    start.addEventListener("click", () =>
      runQuiz(box, items, {
        mode: "check",
        title: `Chequeo de mates ${check.bite}`,
        onDone: (results) => {
          const areas = {};
          for (const { q, ok } of results) areas[q.area] = { label: q.areaLabel || q.area, ok };
          const correct = results.filter((r) => r.ok).length;
          Store.push({ type: "math_check_finish", bite: check.bite, correct, total: results.length, areas });
          box.replaceChildren(
            h("h2", { text: `Resultado: ${correct} de ${results.length}` }),
            h(
              "ul",
              { class: "placement-result" },
              Object.values(areas).map((a) => h("li", { class: a.ok ? "pl-strong" : "pl-weak" }, h("strong", { text: a.ok ? "Bien: " : "A repasar: " }), a.label)),
            ),
            h("p", { text: "Tu tutor ya lo ve. Con esto prepara tus lecciones de mates, empezando por lo que hay que reforzar." }),
            h("a", { class: "btn-primary", href: `${BASE}index.html`, "data-primary": "" }, "Ir al mapa"),
          );
        },
      }),
    );
  }

  /* ---------- Keyboard ---------- */

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target;
    if (target.closest && target.closest("textarea, input, select, [contenteditable]")) return;
    if (e.key === "Escape") {
      toggleSheet(false);
      return;
    }
    const onControl = target.closest && target.closest("button, a, .tk");
    if ((e.key === "Enter" && !onControl) || e.key === "ArrowRight") {
      const primary = $$("[data-primary]").filter((b) => isShown(b) && !b.disabled).pop();
      if (primary) {
        e.preventDefault();
        primary.click();
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      const back = $$("[data-back]").find((b) => isShown(b));
      if (back) {
        e.preventDefault();
        back.click();
      }
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      const card = $$(".qcard").find((c) => isShown(c) && !c.dataset.answered);
      const option = card && $(`[data-key="${e.key}"]`, card);
      if (option) {
        e.preventDefault();
        option.click();
      }
    }
  });

  /* ---------- Boot ---------- */

  applyTheme(getTheme());
  const page = document.body.dataset.page;
  const init = { lesson: initLesson, index: initIndex, review: initReview, placement: initPlacement, mathcheck: initMathCheck }[page];
  if (init) {
    init().catch((err) => {
      console.error(err);
      document.body.append(h("p", { class: "fatal", text: `Algo ha fallado al cargar la página: ${err.message}` }));
    });
  }
})();
