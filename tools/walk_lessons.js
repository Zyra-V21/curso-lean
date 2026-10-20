// End-to-end walker: opens lessons in headless Chromium, answers every
// question (correctly, or the first one of each step wrongly with --wrong),
// finishes the lesson and takes a screenshot of every step.
//
// Usage (against a TEST server with its own event log, never the real one):
//   python3 server/server.py --port 8650 --events <scratch>/test-events.jsonl
//   npm i --prefix <scratch>/pp puppeteer-core@23.11.1
//   NODE_PATH=<scratch>/pp/node_modules node tools/walk_lessons.js \
//     http://127.0.0.1:8650 <project>/shots/run m1-l3 [--wrong] [--dark]
// A page name instead of a lesson id walks a quiz page: chequeo, review.
// The shots dir must live under the home directory (not /tmp, not hidden):
// snap Chromium cannot see those paths.
const puppeteer = require("puppeteer-core");
const path = require("path");

const [base, shots, ...args] = process.argv.slice(2);
const wrongFirst = args.includes("--wrong");
const dark = args.includes("--dark");
const lessons = args.filter((a) => !a.startsWith("--"));
const QUIZ_PAGES = ["chequeo", "review"];

// Answers every unanswered card in `root` using the answer the engine keeps
// on each card (card.__answer). With `wrong`, the first card gets a wrong one.
function answerCards(rootSelector, wrong) {
  const root = document.querySelector(rootSelector);
  const cards = [...root.querySelectorAll(".qcard:not([data-answered])")];
  cards.forEach((card, i) => {
    const a = card.__answer;
    const bad = wrong && i === 0;
    if (!a) throw new Error(`card ${card.dataset.qid} has no __answer`);
    if (a.kind === "spot") {
      const n = bad ? (a.line === 1 ? 2 : 1) : a.line;
      card.querySelector(`.spot-line[data-line="${n}"]`).click();
    } else if (a.kind === "mcq") {
      const btns = [...card.querySelectorAll(".qopt")];
      const btn = btns.find((b) => (b.querySelector(".qtext").textContent.trim() === a.text) !== bad);
      btn.click();
    } else {
      [...card.querySelectorAll(".num-input")].forEach((input, j) => {
        input.value = bad ? "999" : a.values[j];
      });
      card.querySelector(".num-actions .btn-secondary").click();
    }
  });
  return cards.length;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/snap/bin/chromium",
    headless: true,
    userDataDir: path.join(shots, "profile"),
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
  });
  let failures = 0;
  for (const id of lessons) {
    const page = await browser.newPage();
    if (QUIZ_PAGES.includes(id)) {
      failures += await walkQuiz(page, id);
      await page.close();
      continue;
    }
    await page.setViewport({ width: 1100, height: 1300 });
    if (dark) await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    const problems = [];
    page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
    page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
    await page.goto(`${base}/lessons/${id}.html`, { waitUntil: "networkidle0" });
    await page.waitForSelector(".cover-actions");
    const missing = await page.$$eval(".missing", (els) => els.map((e) => e.textContent));
    problems.push(...missing);
    await page.screenshot({ path: path.join(shots, `${id}-0-cover.png`) });
    await page.click('[aria-controls="sheet"]');
    const sheet = await page.$eval("#sheet", (s) => s.innerText);
    if (/\[object/.test(sheet)) problems.push("cheat sheet renders [object ...] instead of entries");
    await page.click("#sheet .sheet-head button");
    await page.click(".cover-actions .btn-primary");
    let stepNo = 1;
    for (let guard = 0; guard < 20; guard++) {
      // Click the first magnifier token so the panel shows something.
      const tk = await page.$("section.step:not([hidden]) figure.lupa .tk");
      if (tk) await tk.click();
      const answered = await page.evaluate((fn, wrong) => {
        const answer = new Function(`return (${fn})`)();
        const step = document.querySelector("section.step:not([hidden])");
        step.dataset.walk = "1";
        const count = answer('section.step[data-walk="1"]', wrong);
        delete step.dataset.walk;
        return { count, kind: step.dataset.kind || "concept" };
      }, answerCards.toString(), wrongFirst);
      await new Promise((r) => setTimeout(r, 150));
      await page.screenshot({ path: path.join(shots, `${id}-${stepNo}-${answered.kind}.png`), fullPage: true });
      if (answered.kind === "wrap") break;
      const next = await page.$(".stepnav .btn-primary:not([disabled]):not([hidden])");
      if (!next) { problems.push(`step ${stepNo}: next button not available`); break; }
      await next.click();
      stepNo += 1;
    }
    // Finish.
    const chip = await page.$(".confidence .chip");
    if (chip) {
      await chip.click();
      await page.type("#tutor-note", "e2e test note");
      await page.click(".finish-actions .btn-primary");
      await page.waitForSelector(".outcome");
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(shots, `${id}-z-outcome.png`), fullPage: true });
    } else {
      problems.push("finish panel not found");
    }
    const outcome = await page.$eval(".outcome", (e) => e.textContent).catch(() => "no outcome");
    console.log(`${id}: steps=${stepNo} outcome="${outcome.slice(0, 80)}"`);
    if (problems.length) { failures += 1; console.log("  PROBLEMS:\n  " + problems.join("\n  ")); }
    await page.close();
  }
  await browser.close();
  process.exit(failures ? 1 : 0);

  // Quiz pages: start, answer each question, go on until the result shows.
  async function walkQuiz(page, name) {
    const problems = [];
    await page.setViewport({ width: 1100, height: 1300 });
    if (dark) await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
    page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
    await page.goto(`${base}/${name}.html`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(shots, `${name}-0-start.png`), fullPage: true });
    const start = await page.$("main .btn-primary");
    if (!start || (await start.evaluate((b) => b.tagName)) !== "BUTTON") {
      console.log(`${name}: nothing to do (${await page.$eval("main", (m) => m.innerText.slice(0, 80))})`);
      return 0;
    }
    await start.click();
    let n = 0;
    for (let guard = 0; guard < 40; guard++) {
      if (!(await page.$("main .qcard"))) break;
      n += 1;
      await page.evaluate((fn, wrong) => new Function(`return (${fn})`)()("main", wrong), answerCards.toString(), wrongFirst && n === 1);
      await new Promise((r) => setTimeout(r, 150));
      await page.screenshot({ path: path.join(shots, `${name}-${n}.png`), fullPage: true });
      const next = await page.$(".quiz-actions .btn-primary:not([disabled])");
      if (!next) { problems.push(`question ${n}: next button not available`); break; }
      await next.click();
    }
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(shots, `${name}-z-result.png`), fullPage: true });
    console.log(`${name}: ${n} questions, result "${await page.$eval("main", (m) => m.innerText.slice(0, 120).replace(/\s+/g, " "))}"`);
    if (problems.length) { console.log("  PROBLEMS:\n  " + problems.join("\n  ")); return 1; }
    return 0;
  }
})().catch((e) => { console.error(e); process.exit(2); });
