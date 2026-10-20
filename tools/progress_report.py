#!/usr/bin/env python3
"""Summarise the learner's progress from tutor/events.jsonl for the tutor.

Usage: python3 tools/progress_report.py [--events PATH]
"""

import argparse
import json
import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60]


def load_catalog():
    script = (
        "global.window = {};"
        f"require({json.dumps(str(ROOT / 'course' / 'catalog.js'))});"
        "process.stdout.write(JSON.stringify(window.CATALOG));"
    )
    out = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True)
    catalog = json.loads(out.stdout)
    lessons = []
    for mod in catalog["modules"]:
        for i, lesson in enumerate(mod["lessons"]):
            code = lesson.get("code") if mod.get("track") == "math" else f"{mod['n']}.{i + 1}"
            lessons.append(dict(lesson, code=code))
    return lessons


def parse_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--events", type=Path, default=ROOT / "tutor" / "events.jsonl")
    args = parser.parse_args()
    lessons = load_catalog()
    events = []
    if args.events.exists():
        for line in args.events.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                try:
                    events.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    events.sort(key=lambda e: e.get("at", ""))
    if not events:
        print("No events yet: the learner has not used the course.")
        return

    now = datetime.now(timezone.utc)
    print(f"Events: {len(events)}  first: {events[0].get('at')}  last: {events[-1].get('at')}")
    days = sorted({e.get("at", "")[:10] for e in events})
    print(f"Active days ({len(days)}): {', '.join(days[-14:])}")

    placement = [e for e in events if e["type"] == "placement_finish"]
    if placement:
        p = placement[-1]
        print("\nPlacement:", f"{p.get('correct')}/{p.get('total')}")
        for area, a in (p.get("areas") or {}).items():
            print(f"  {a.get('label', area)}: {a.get('correct')}/{a.get('total')}")

    finishes = defaultdict(list)
    starts = Counter()
    for e in events:
        if e["type"] == "lesson_finish":
            finishes[e["lesson"]].append(e)
        elif e["type"] == "lesson_start":
            starts[e["lesson"]] += 1

    print("\nLessons:")
    mastered_at = {}
    for lesson in lessons:
        lid = lesson["id"]
        if lid not in finishes and lid not in starts:
            continue
        fs = finishes.get(lid, [])
        mastered = [f for f in fs if f.get("mastered")]
        if mastered:
            mastered_at[lid] = mastered[0]["at"]
        best = max((f.get("score") or 0 for f in fs), default=0)
        status = "MASTERED" if mastered else ("finished, not mastered" if fs else "started only")
        print(f"  {lesson['code']} {lesson['title']}: {status}, best {best:.0%}, starts {starts[lid]}, finishes {len(fs)}")
        for f in fs:
            extras = []
            if f.get("confidence"):
                extras.append(f"confidence={f['confidence']}")
            if f.get("labSkipped"):
                extras.append("lab skipped")
            if f.get("durationSec"):
                extras.append(f"{round(f['durationSec'] / 60)} min")
            if f.get("failed"):
                extras.append(f"failed={','.join(q.split('.', 1)[1] for q in f['failed'])}")
            print(f"     {f['at'][:16]} {f.get('mode')}: {f.get('correct')}/{f.get('total')} {' '.join(extras)}")
            if f.get("note"):
                print(f"     NOTE: {f['note']}")

    answers = [e for e in events if e["type"] == "answer"]
    by_q = defaultdict(list)
    for a in answers:
        by_q[a["qid"]].append(a)
    # Maths answers to generated questions differ every time: listed below.
    weak = [(qid, hist) for qid, hist in by_q.items()
            if any(not h.get("ok") for h in hist) and not any(h.get("track") == "math" for h in hist)]
    if weak:
        print("\nQuestions answered wrong at least once (wrong/total, last result, chosen answers when wrong):")
        weak.sort(key=lambda x: -sum(1 for h in x[1] if not h.get("ok")))
        for qid, hist in weak:
            wrong = [h for h in hist if not h.get("ok")]
            picks = "; ".join(sorted({str(h.get("choice"))[:60] for h in wrong}))
            print(f"  {qid}: {len(wrong)}/{len(hist)}, last {'ok' if hist[-1].get('ok') else 'WRONG'} | picked: {picks}")

    print_maths(events, answers)

    concepts = defaultdict(lambda: [0, 0])
    for a in answers:
        c = a.get("concept") or "?"
        concepts[c][1] += 1
        if not a.get("ok"):
            concepts[c][0] += 1
    shaky = sorted(((c, w, t) for c, (w, t) in concepts.items() if w), key=lambda x: -x[1] / x[2])
    if shaky:
        print("\nConcepts with errors (wrong/total):")
        for c, w, t in shaky:
            print(f"  {c}: {w}/{t}")

    # Spaced review status, same rules as course/assets/engine.js.
    due, upcoming = [], []
    for qid, hist in by_q.items():
        lid = qid.split(".")[0]
        if lid not in mastered_at:
            continue
        step = 0
        due_at = parse_time(mastered_at[lid]) + timedelta(days=REVIEW_INTERVALS_DAYS[0])
        for h in hist:
            if h.get("mode") != "review":
                continue
            step = min(step + 1, len(REVIEW_INTERVALS_DAYS) - 1) if h.get("ok") else 0
            due_at = parse_time(h["at"]) + timedelta(days=REVIEW_INTERVALS_DAYS[step])
        (due if due_at <= now else upcoming).append(due_at)
    reviews = [e for e in events if e["type"] == "answer" and e.get("mode") == "review"]
    print(f"\nReview: {len(due)} due now, {len(upcoming)} scheduled; {len(reviews)} review answers so far"
          f" ({sum(1 for r in reviews if r.get('ok'))} correct)")


def print_maths(events, answers):
    """Maths check bites, typed answers and the misconceptions they reveal."""
    checks = [e for e in events if e["type"] == "math_check_finish"]
    maths = [a for a in answers if a.get("track") == "math"]
    if not checks and not maths:
        return
    print("\nMaths:")
    for c in checks:
        areas = c.get("areas") or {}
        good = [a["label"] for a in areas.values() if a.get("ok")]
        bad = [a["label"] for a in areas.values() if not a.get("ok")]
        print(f"  Check bite {c.get('bite')} ({c['at'][:16]}): {c.get('correct')}/{c.get('total')}")
        print(f"    ok: {', '.join(good) or '-'}")
        print(f"    to work on: {', '.join(bad) or '-'}")
    wrong = [a for a in maths if not a.get("ok")]
    if wrong:
        print("  Wrong maths answers (multi-part answers use ' ; '):")
        for a in wrong:
            given = "NO LO SE" if a.get("skipped") else a.get("given")
            codes = ",".join(a.get("traps") or ([a["trap"]] if a.get("trap") else [])) or "-"
            print(f"    {a['at'][:10]} {a['qid']} [{a.get('mode')}] {a.get('prompt', '')[:70]}")
            print(f"        given: {given}   expected: {a.get('expected')}   traps: {codes}")
    traps = Counter(code for a in maths for code in (a.get("traps") or ([a["trap"]] if a.get("trap") else [])))
    if traps:
        print("  Misconceptions (trap codes): " + ", ".join(f"{k} x{v}" for k, v in traps.most_common()))
    unreduced = [a for a in maths if a.get("ok") and a.get("reduced") is False]
    if unreduced:
        print(f"  Correct but not simplified: {len(unreduced)}")
    by_concept = defaultdict(lambda: [0, 0])
    for a in maths:
        by_concept[a.get("concept") or "?"][1] += 1
        if a.get("ok"):
            by_concept[a.get("concept") or "?"][0] += 1
    print("  By concept (right/total): " + ", ".join(f"{c} {r}/{t}" for c, (r, t) in sorted(by_concept.items())))


if __name__ == "__main__":
    main()
