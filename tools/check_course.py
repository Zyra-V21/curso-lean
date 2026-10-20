#!/usr/bin/env python3
"""Check the Lean reading course.

Verifies that every Lean snippet in lessons, question banks and lab files
behaves as the course claims (compiles, fails with the expected message, or
uses sorry), that every `-->` output annotation matches what Lean prints,
and lints structure and style (question ids, one correct option, symbols used
before the lesson that introduces them, no em dashes). Also runs the maths
self-test (tools/math_selftest.js) and checks a sample of every generator's
answers against Lean (see course/MATH.md).

Usage: python3 tools/check_course.py [lesson-id ...]
Exit code 1 if any error was found.
"""

import json
import re
import subprocess
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSE = ROOT / "course"
PRACTICE = ROOT / "practice"
MARK_RE = re.compile(r"⟪([\s\S]+?)\|([\w.-]+)⟫")
OUTPUT_RE = re.compile(r"-->\s*(.*)$")
# Logical symbols whose first use must come after the lesson introducing them.
LINTED_SYMBOLS = ["≠", "∧", "∨", "¬", "→", "↔", "∀", "∃", "⊢"]
MAX_STEPS = 9
# A correct option this much longer than every distractor gives the answer away.
LENGTH_TELL_RATIO = 1.3
TAG_RE = re.compile(r"<[^>]+>")

errors = []
warnings = []


def err(where, msg):
    errors.append(f"ERROR   {where}: {msg}")


def warn(where, msg):
    warnings.append(f"warning {where}: {msg}")


# ---------- catalog ----------

def load_catalog():
    script = (
        "global.window = {};"
        f"require({json.dumps(str(COURSE / 'catalog.js'))});"
        "process.stdout.write(JSON.stringify(window.CATALOG));"
    )
    out = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True)
    catalog = json.loads(out.stdout)
    lessons = []
    for mod in catalog["modules"]:
        for i, lesson in enumerate(mod["lessons"]):
            code = lesson.get("code") if mod.get("track") == "math" else f"{mod['n']}.{i + 1}"
            lesson = dict(lesson, module=mod["id"], code=code, order=len(lessons))
            lessons.append(lesson)
    return catalog, lessons


# ---------- HTML extraction ----------

class LessonParser(HTMLParser):
    """Collects Lean snippets, question slots, steps and visible text."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.snippets = []
        self.slots = []
        self.steps = []
        self.text_parts = []
        self._pre = None
        self._script = None
        self._stack = []
        self._skip_text = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = (attrs.get("class") or "").split()
        self._stack.append((tag, classes, attrs))
        if tag == "section" and "step" in classes:
            self.steps.append({"kind": attrs.get("data-kind", "concept"), "file": attrs.get("data-file")})
        if tag == "pre" and "lean" in classes:
            self._pre = {"attrs": attrs, "text": "", "line": self.getpos()[0], "boss": self._in_boss()}
        if tag == "script":
            self._script = ""
        if tag == "div" and "q" in classes and attrs.get("data-q"):
            self.slots.append({"id": attrs["data-q"], "lab": self._in_kind("lab")})
        if tag in ("script", "style"):
            self._skip_text += 1

    def handle_endtag(self, tag):
        if tag == "pre" and self._pre is not None:
            self.snippets.append(self._pre)
            self._pre = None
        if tag == "script":
            self._script = None
        if tag in ("script", "style"):
            self._skip_text = max(0, self._skip_text - 1)
        while self._stack:
            open_tag = self._stack.pop()[0]
            if open_tag == tag:
                break

    def handle_data(self, data):
        if self._pre is not None:
            self._pre["text"] += data
        if not self._skip_text and not self._in_boss():
            self.text_parts.append(data)

    def _in_kind(self, kind):
        return any(t == "section" and a.get("data-kind") == kind for t, _, a in self._stack)

    def _in_boss(self):
        return self._in_kind("boss")


def normalize_code(src):
    lines = src.replace("\r", "").lstrip("\n").rstrip().split("\n")
    indents = [len(l) - len(l.lstrip(" ")) for l in lines if l.strip()]
    cut = min(indents) if indents else 0
    return "\n".join(l[cut:] for l in lines)


def strip_html(text):
    return TAG_RE.sub("", text).strip()


def strip_marks(text):
    return MARK_RE.sub(r"\1", text)


def load_questions(path):
    raw = path.read_text(encoding="utf-8")
    start = raw.find("concat(")
    end = raw.rfind(");")
    if start < 0 or end < 0:
        raise ValueError("expected window.QUESTIONS = (window.QUESTIONS || []).concat([...]);")
    return json.loads(raw[start + len("concat("):end])


# ---------- Lean runner ----------

def run_lean(code):
    with tempfile.TemporaryDirectory(prefix="leer-lean-") as tmp:
        f = Path(tmp) / "Snippet.lean"
        f.write_text(code + "\n", encoding="utf-8")
        proc = subprocess.run(
            ["lake", "env", "lean", "--json", str(f)],
            cwd=PRACTICE, capture_output=True, text=True, timeout=300,
        )
    messages = []
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith("{"):
            try:
                messages.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    if proc.returncode not in (0, 1) and not messages:
        messages.append({"severity": "error", "data": proc.stderr.strip() or "lean crashed", "pos": {"line": 0}})
    return messages


def squash(s):
    return re.sub(r"\s+", " ", s).strip()


def verify(where, code, mode, expected_error=None, prelude="", allow_warn=False):
    """Run one snippet and compare with what the course claims."""
    if mode == "skip":
        return
    full = (prelude + "\n" if prelude else "") + code
    offset = full.count("\n") - code.count("\n")
    messages = run_lean(full)
    errs = [m for m in messages if m.get("severity") == "error"]
    sorries = [m for m in messages if m.get("kind") == "hasSorry"]
    other_warn = [m for m in messages if m.get("severity") == "warning" and m.get("kind") != "hasSorry"]
    if mode == "ok":
        for m in errs:
            err(where, f"expected to compile, Lean says (line {m['pos']['line'] - offset}): {squash(m['data'])[:200]}")
        if sorries:
            err(where, "expected to compile without sorry, but it uses sorry")
    elif mode == "sorry":
        for m in errs:
            err(where, f"expected only a sorry warning, Lean says: {squash(m['data'])[:200]}")
        if not sorries:
            err(where, "expected a sorry warning, none found")
    elif mode == "error":
        if not errs:
            err(where, "expected a Lean error, but it compiled")
        elif expected_error and not any(expected_error in m["data"] for m in errs):
            got = " | ".join(squash(m["data"])[:120] for m in errs)
            err(where, f"expected an error containing {expected_error!r}, got: {got}")
        elif not expected_error:
            warn(where, "error snippet without data-error/expected substring")
    else:
        err(where, f"unknown check mode {mode!r}")
    for m in ([] if allow_warn else other_warn):
        warn(where, f"extra warning (line {m['pos']['line'] - offset}): {squash(m['data'])[:140]}")
    # `-->` annotations must match Lean's output on that line.
    infos = {}
    for m in messages:
        if m.get("severity") == "information":
            infos.setdefault(m["pos"]["line"], []).append(m["data"])
    for i, line in enumerate(code.split("\n"), start=1):
        if "--" not in line:
            continue
        mo = OUTPUT_RE.search(line)
        if not mo:
            continue
        expected = squash(mo.group(1))
        got = [squash(d) for d in infos.get(i + offset, [])]
        if expected not in got:
            err(where, f"line {i}: annotated output {expected!r} but Lean printed {got or 'nothing'}")


# ---------- maths ----------

ANSWER_RE = re.compile(r"^-?\d+(/\d+)?$")


def run_math_selftest():
    """Runs the node self-test and the Lean oracle. Returns the generator names."""
    proc = subprocess.run(["node", str(ROOT / "tools" / "math_selftest.js")], capture_output=True, text=True)
    if proc.returncode != 0:
        err("math.js", f"self-test crashed: {proc.stderr.strip()[:300]}")
        return {}
    report = json.loads(proc.stdout)
    for e in report["errors"]:
        err("math.js", e)
    oracle = report["oracle"]
    if oracle:
        code = "\n".join(f"#eval {o['expr']}" for o in oracle)
        infos = {}
        for m in run_lean(code):
            if m.get("severity") == "error":
                err("math.js oracle", f"Lean error on line {m['pos']['line']}: {squash(m['data'])[:160]}")
            elif m.get("severity") == "information":
                infos.setdefault(m["pos"]["line"], []).append(squash(m["data"]))
        for i, o in enumerate(oracle, start=1):
            if squash(o["out"]) not in infos.get(i, []):
                err("math.js oracle", f"{o['gen']} seed {o['seed']}: #eval {o['expr']} prints {infos.get(i) or 'nothing'}, generator says {o['out']!r}")
    return report["generators"]


def annotate_num_answer(q, code):
    """A fixed num question about one `#eval` line: Lean must print the answer."""
    parts = q.get("parts") or []
    if q.get("type") == "num" and not q.get("gen") and len(parts) == 1 and "\n" not in code \
            and code.startswith("#eval") and "-->" not in code and re.fullmatch(r"-?\d+", str(parts[0].get("answer", ""))):
        return f"{code}  --> {parts[0]['answer']}"
    return code


def check_math_question(where, q, generators):
    if q.get("gen"):
        if q["gen"] not in generators:
            err(where, f"{q['id']}: unknown generator {q['gen']}")
        else:
            unknown = [v for v in q.get("variants") or [] if v not in generators[q["gen"]]]
            if unknown:
                err(where, f"{q['id']}: generator {q['gen']} has no variants {unknown}")
        return
    if q.get("type") != "num":
        return
    parts = q.get("parts") or []
    if not parts:
        err(where, f"{q['id']}: num question needs parts or a gen")
    for part in parts:
        if not ANSWER_RE.match(str(part.get("answer", ""))):
            err(where, f"{q['id']}: answer {part.get('answer')!r} must look like 12, -3 or 3/4")
        if part.get("form", "integer") not in ("integer", "fraction", "reduced", "number"):
            err(where, f"{q['id']}: unknown form {part.get('form')}")
    if not q.get("prompt"):
        err(where, f"{q['id']}: num question without prompt")
    if not q.get("steps"):
        warn(where, f"{q['id']}: num question without worked steps")


# ---------- checks ----------

def check_text_style(where, text):
    if "—" in text:
        err(where, "contains an em dash (—); use commas, colons or parentheses")
    if "TL;DR" in text:
        err(where, "contains the label TL;DR")


def check_question(where, q, all_ids):
    qid = q.get("id")
    if not qid:
        err(where, "question without id")
        return
    if qid in all_ids:
        err(where, f"duplicate question id {qid}")
    all_ids.add(qid)
    qtype = q.get("type", "mcq")
    if q.get("gen") or qtype == "num":
        return  # checked by check_math_question
    if qtype == "mcq":
        opts = q.get("options") or []
        if len(opts) < 2:
            err(where, f"{qid}: needs at least 2 options")
        if sum(1 for o in opts if o.get("ok")) != 1:
            err(where, f"{qid}: needs exactly one correct option")
        for o in opts:
            if not o.get("why"):
                warn(where, f"{qid}: option without 'why' feedback: {o.get('t', '')[:40]}")
        # The right answer must not be guessable by being the longest option.
        lengths = [(len(strip_html(o.get("t", ""))), bool(o.get("ok"))) for o in opts]
        right = [n for n, ok in lengths if ok]
        others = sorted((n for n, ok in lengths if not ok), reverse=True)
        if right and others and right[0] > LENGTH_TELL_RATIO * others[0]:
            warn(where, f"{qid}: correct option is {right[0] / max(others[0], 1):.1f}x longer than any distractor (guessable)")
    elif qtype == "spot":
        lines = (q["code"] if isinstance(q.get("code"), list) else str(q.get("code", "")).split("\n"))
        ans = q.get("answer") or []
        if not ans or any(not (1 <= a <= len(lines)) for a in ans):
            err(where, f"{qid}: spot answer must list valid line numbers")
        if not q.get("why"):
            warn(where, f"{qid}: spot question without 'why'")
    else:
        err(where, f"{qid}: unknown type {qtype}")


def symbol_lint(where, text, lesson, intro_order):
    if lesson.get("preview"):
        return
    for sym in LINTED_SYMBOLS:
        intro = intro_order.get(sym)
        if intro is not None and intro > lesson["order"] and sym in text:
            warn(where, f"uses {sym} before the lesson that introduces it")


def main():
    only = set(sys.argv[1:])
    catalog, lessons = load_catalog()
    intro_order = {}
    by_id = {l["id"]: l for l in lessons}
    for s in catalog["symbols"]:
        lesson = by_id.get(s["lesson"])
        if not lesson:
            err("catalog", f"symbol {s['s']} points to unknown lesson {s['lesson']}")
            continue
        for sym in LINTED_SYMBOLS:
            if sym in s["s"]:
                intro_order[sym] = min(intro_order.get(sym, 10**9), lesson["order"])

    generators = run_math_selftest()
    check_text_style("assets/math.js", (COURSE / "assets" / "math.js").read_text(encoding="utf-8"))

    all_ids = set()
    placement = COURSE / "questions" / "placement.js"
    if placement.exists() and not only:
        for q in load_questions(placement):
            check_question("questions/placement.js", q, all_ids)
            check_text_style("questions/placement.js", json.dumps(q, ensure_ascii=False))
    chequeo = COURSE / "questions" / "chequeo.js"
    if chequeo.exists() and not only:
        bites = {c["bite"] for c in catalog.get("mathChecks", [])}
        for q in load_questions(chequeo):
            check_question("questions/chequeo.js", q, all_ids)
            check_math_question("questions/chequeo.js", q, generators)
            check_text_style("questions/chequeo.js", json.dumps(q, ensure_ascii=False))
            if not q["id"].startswith("chequeo.") or q.get("bite") not in bites or not q.get("areaLabel"):
                err("questions/chequeo.js", f"{q['id']}: needs a chequeo. id, a bite listed in catalog mathChecks and an areaLabel")

    for lesson in lessons:
        if lesson.get("status") != "ready" or (only and lesson["id"] not in only):
            continue
        lid = lesson["id"]
        html_path = COURSE / "lessons" / f"{lid}.html"
        q_path = COURSE / "questions" / f"{lid}.js"
        if not html_path.exists():
            err(lid, f"missing {html_path.relative_to(ROOT)}")
            continue
        html = html_path.read_text(encoding="utf-8")
        check_text_style(f"{lid}.html", html)
        parser = LessonParser()
        parser.feed(html)
        if f'data-lesson="{lid}"' not in html:
            err(lid, "body data-lesson does not match the file name")
        if f'questions/{lid}.js' not in html:
            err(lid, "lesson does not load its question bank")
        if 'data-kind="boss"' in html and "assets/boss.js" not in html:
            err(lid, "has a boss step but does not load assets/boss.js")
        if "assets/math.js" not in html:
            err(lid, "does not load assets/math.js (needed for typed and generated questions)")
        kinds = [s["kind"] for s in parser.steps]
        if not kinds or kinds[0] != "cover" or kinds[-1] != "wrap":
            err(lid, f"steps must start with cover and end with wrap, got {kinds}")
        if len(kinds) > MAX_STEPS:
            warn(lid, f"{len(kinds)} steps (keep it at {MAX_STEPS} or fewer)")
        if lesson.get("lab"):
            if "lab" not in kinds:
                err(lid, "catalog lists a lab but the lesson has no lab step")
            lab_file = PRACTICE / lesson["lab"]
            if not lab_file.exists():
                err(lid, f"missing lab file practice/{lesson['lab']}")
        symbol_lint(f"{lid}.html", "".join(parser.text_parts), lesson, intro_order)

        # Snippets in the lesson body.
        by_snippet_id = {}
        for i, snip in enumerate(parser.snippets, start=1):
            code = normalize_code(strip_marks(snip["text"]))
            sid = snip["attrs"].get("data-id")
            if sid:
                by_snippet_id[sid] = code
        for i, snip in enumerate(parser.snippets, start=1):
            if snip["boss"]:
                continue
            attrs = snip["attrs"]
            code = normalize_code(strip_marks(snip["text"]))
            uses = [u.strip() for u in (attrs.get("data-uses") or "").split(",") if u.strip()]
            missing = [u for u in uses if u not in by_snippet_id]
            if missing:
                err(f"{lid}.html:{snip['line']}", f"data-uses refers to unknown snippet ids {missing}")
                continue
            prelude = "\n".join(by_snippet_id[u] for u in uses)
            verify(f"{lid}.html:{snip['line']}", code, attrs.get("data-check", "ok"), attrs.get("data-error"), prelude,
                   allow_warn="data-allow-warn" in attrs)

        # Question bank.
        if not q_path.exists():
            err(lid, f"missing {q_path.relative_to(ROOT)}")
            continue
        try:
            questions = load_questions(q_path)
        except (ValueError, json.JSONDecodeError) as exc:
            err(f"{lid}.js", f"cannot parse question bank: {exc}")
            continue
        check_text_style(f"{lid}.js", q_path.read_text(encoding="utf-8"))
        bank_ids = set()
        for q in questions:
            check_question(f"{lid}.js", q, all_ids)
            check_math_question(f"{lid}.js", q, generators)
            bank_ids.add(q.get("id"))
            if not str(q.get("id", "")).startswith(lid + "."):
                err(f"{lid}.js", f"question id {q.get('id')} must start with '{lid}.'")
            if q.get("code") and (q.get("type", "mcq") in ("mcq", "num") or q.get("check")):
                code = normalize_code(strip_marks("\n".join(q["code"]) if isinstance(q.get("code"), list) else str(q.get("code", ""))))
                uses = q.get("uses") or []
                if q.get("check") == "skip":
                    uses = []
                missing = [u for u in uses if u not in by_snippet_id]
                if missing:
                    err(f"{lid}.js {q['id']}", f"uses unknown snippet ids {missing}")
                    continue
                prelude = "\n".join(by_snippet_id[u] for u in uses)
                code = annotate_num_answer(q, code)
                verify(f"{lid}.js {q['id']}", code, q.get("check", "ok"), q.get("error"), prelude,
                       allow_warn=bool(q.get("allowWarn")))
            symbol_lint(f"{lid}.js {q.get('id')}", json.dumps(q, ensure_ascii=False), lesson, intro_order)
        slot_ids = [s["id"] for s in parser.slots]
        for sid in slot_ids:
            if sid not in bank_ids:
                err(lid, f"lesson references missing question {sid}")
        review_only = {q.get("id") for q in questions if q.get("reviewOnly")}
        for qid in bank_ids - set(slot_ids) - review_only:
            warn(lid, f"question {qid} is in the bank but not placed in the lesson (it will only show in test-out/review)")
        for qid in review_only & set(slot_ids):
            err(lid, f"question {qid} is marked reviewOnly but placed in the lesson")
        if len(slot_ids) != len(set(slot_ids)):
            err(lid, "a question is placed twice in the lesson")

    # Lab files.
    for lean_file in sorted((PRACTICE / "Practice").rglob("*.lean")):
        rel = lean_file.relative_to(ROOT)
        if only and not any(str(rel).endswith(by_id[o].get("lab", "~")) for o in only if o in by_id):
            continue
        text = lean_file.read_text(encoding="utf-8")
        check_text_style(str(rel), text)
        mode = "sorry" if "check: sorry-allowed" in text else "ok"
        verify(str(rel), text, mode, allow_warn="check: allow-warn" in text)

    for line in warnings:
        print(line)
    for line in errors:
        print(line)
    print(f"\n{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
