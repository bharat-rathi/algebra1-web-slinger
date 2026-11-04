// Run with: node tests/test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const dir = new URL('../js/', import.meta.url).pathname;
const load = (f) => vm.runInThisContext(fs.readFileSync(dir + f, 'utf8'), { filename: f });
['util.js', 'course.js'].forEach(load);
fs.readdirSync(dir).filter((f) => f.startsWith('topics-')).sort().forEach(load);
load('engine.js');
const { E, TOPICS, COURSE } = globalThis;

let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };

// -- course map ----------------------------------------------------------------------------
const courseIds = COURSE.flatMap((d) => d.topics.map((t) => t.id));
ok(new Set(courseIds).size === courseIds.length, 'duplicate course ids');
for (const t of TOPICS) ok(courseIds.includes(t.id), `topic ${t.id} is not in the course map`);

// -- every generator, many times, at every level -------------------------------------------
const bad = /NaN|undefined|null|\[object|Infinity/;
for (const t of TOPICS) {
  ok(t.slides.length >= 3 && t.tips.length >= 1 && t.gens.length >= 6, `${t.id} is too thin`);
  for (const s of t.slides) {
    if (s.type === 'predict') ok(s.options.includes(s.answer), `${t.id} slide answer not in options`);
    ok(!bad.test(JSON.stringify(s)), `${t.id} slide has broken text`);
  }
  for (const g of t.gens) for (const lv of [1, 2, 3]) for (let i = 0; i < 1500; i++) {
    const item = E.makeItem(t, g, lv);
    const where = `${t.id}/${g.id} lv${lv}`;
    ok(item.chk === undefined || item.chk(), `${where}: math check failed`);
    ok(!bad.test(JSON.stringify(item.parts) + item.steps.join('')), `${where}: broken text ${JSON.stringify(item.parts)}`);
    ok(item.steps.length >= 1 && item.hint, `${where}: missing steps or hint`);
    for (const p of item.parts) {
      ok(p.q && p.q.length > 5, `${where}: no question`);
      if (p.type === 'mc') {
        ok(p.choices.length === 4 && new Set(p.choices).size === 4, `${where}: need 4 distinct choices ${p.choices}`);
        ok(p.choices.includes(p.a), `${where}: answer missing from choices`);
        ok(E.gradePart(p, p.a) && !E.gradePart(p, p.choices.find((c) => c !== p.a)), `${where}: grading`);
      } else if (p.type === 'input') {
        ok(Number.isFinite(E.parseNum(p.a)), `${where}: input answer not numeric ${p.a}`);
        ok(E.gradePart(p, p.a), `${where}: own answer rejected`);
        ok(!p.wrongs.some((w) => E.sameAnswer(w.v, p.a) && false), 'noop');
      } else {
        const right = p.options.map((o, k) => (o.ok ? k : -1)).filter((k) => k >= 0);
        ok(right.length >= 1 && right.length < p.options.length, `${where}: multi needs some right and some wrong`);
        ok(E.gradePart(p, right) && !E.gradePart(p, [...right, p.options.findIndex((o) => !o.ok)]), `${where}: multi grading`);
        ok(new Set(p.options.map((o) => o.t)).size === p.options.length, `${where}: duplicate options`);
      }
    }
  }
  for (const lv of [1, 2, 3]) for (let i = 0; i < 100; i++) {
    const q = E.buildQuiz(t, lv, 7);
    ok(q.length === 8 && q[7].boss, 'quiz is 7 + boss');
    ok(q.slice(0, 7).every((it, k, a) => k === 0 || a[k - 1].lv <= it.lv), 'quiz ordered easy to hard');
    ok(q.every((it) => it.lv <= lv), 'quiz stays at or below level');
  }
}

// -- answer parsing ---------------------------------------------------------------------------
ok(E.sameAnswer('−3/2', '-1.5') && E.sameAnswer('x = 4', '4') && E.sameAnswer(' 7 ', '7'), 'parse');
ok(!E.sameAnswer('3/2', '2/3') && !E.sameAnswer('', '0') && !E.sameAnswer('abc', '0'), 'parse negatives');

// -- progress: levels, XP, streaks, ranks -------------------------------------------------------
const s = E.newState();
const res = (firstTry, extra = {}) => ({ topicId: 'lin-eq', firstTry, correct: firstTry, ...extra });
let out = E.applyResults(s, [res(true), res(true), res(true)], { now: new Date('2027-01-04T10:00:00') });
ok(s.mastery['lin-eq'].level === 2 && out.levelUps['lin-eq'] === 2, '3 right in a row levels up');
ok(s.xp === 30 && s.streak === 1, 'xp and first streak day');
E.applyResults(s, [res(false), res(false)], { now: new Date('2027-01-05T10:00:00') });
ok(s.mastery['lin-eq'].level === 1 && s.streak === 2, '2 misses level down; consecutive day streak');
E.applyResults(s, [res(true)], { now: new Date('2027-01-05T18:00:00') });
ok(s.streak === 2, 'same day does not double count');
E.applyResults(s, [res(true)], { now: new Date('2027-01-08T10:00:00') });
ok(s.streak === 1 && s.bestStreak === 2, 'gap resets streak');
ok(E.liveStreak(s, new Date('2027-01-12T10:00:00')) === 0 && E.liveStreak(s, new Date('2027-01-09T10:00:00')) === 1, 'liveStreak');
out = E.applyResults(s, [res(true, { hint: true }), res(true, { boss: true })], { mission: 'lin-eq', now: new Date('2027-01-09T10:00:00') });
ok(out.gained === 7 + 20 + 20 + 10 && s.done['lin-eq'] === 1 && s.bossWins === 1, `xp rules (got ${out.gained})`);
ok(s.cards.length === TOPICS[0].tips.length && s.badges.includes('boss') && s.badges.includes('first'), 'cards and badges');
ok(E.rankFor(0).name === 'Rookie Swinger' && E.rankFor(250).name === 'Web-Head' && E.rankFor(99999).pct === 100, 'ranks');
ok(E.buildReview(E.newState(), TOPICS).length === 0 && E.buildReview(s, TOPICS, 8).length === 8, 'review');

console.log(`All ${n} checks passed.`);
