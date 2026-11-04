// Quiz building, grading, mastery, XP, streaks and badges. No DOM in here, so Node can test it.
(function (root) {
  const { R, pick, shuffle, gcd, neg } = root.U;

  // ---- ranks & badges ---------------------------------------------------------------------
  const RANKS = [
    { min: 0, name: 'Rookie Swinger', emoji: '🕸️' }, { min: 100, name: 'Neighborhood Hero', emoji: '🏙️' },
    { min: 250, name: 'Web-Head', emoji: '🕷️' }, { min: 500, name: 'Wall-Crawler', emoji: '🧗' },
    { min: 900, name: 'Street Defender', emoji: '🛡️' }, { min: 1500, name: 'Spider-Sense Pro', emoji: '⚡' },
    { min: 2400, name: 'Web Master', emoji: '🌐' }, { min: 3600, name: 'Web-Slinger Legend', emoji: '👑' },
  ];
  function rankFor(xp) {
    let i = 0;
    RANKS.forEach((r, k) => { if (xp >= r.min) i = k; });
    const next = RANKS[i + 1] || null;
    return { ...RANKS[i], idx: i, next, pct: next ? Math.round(((xp - RANKS[i].min) / (next.min - RANKS[i].min)) * 100) : 100 };
  }
  const BADGES = [
    { id: 'first', emoji: '🎬', name: 'First Mission', desc: 'Finish your first mission', test: (s) => s.log.length >= 1 },
    { id: 'streak3', emoji: '🔥', name: '3-Day Streak', desc: 'Swing in 3 days in a row', test: (s) => s.bestStreak >= 3 },
    { id: 'streak7', emoji: '🌟', name: '7-Day Streak', desc: 'A whole week of missions', test: (s) => s.bestStreak >= 7 },
    { id: 'streak14', emoji: '💥', name: '14-Day Streak', desc: 'Two weeks without missing', test: (s) => s.bestStreak >= 14 },
    { id: 'perfect', emoji: '🎯', name: 'Perfect Mission', desc: 'Every question right on the first try', test: (s) => s.log.some((l) => l.perfect) },
    { id: 'boss', emoji: '🦹', name: 'Boss Beaten', desc: 'Win a boss question on the first try', test: (s) => s.bossWins >= 1 },
    { id: 'allround', emoji: '🧰', name: 'All-Rounder', desc: 'Finish missions in 3 different topics', test: (s) => Object.values(s.done).filter((n) => n > 0).length >= 3 },
    { id: 'master', emoji: '🏆', name: 'Topic Master', desc: 'Reach level 3 in any topic', test: (s) => Object.values(s.mastery).some((m) => m.level >= 3) },
  ];

  // ---- answers ----------------------------------------------------------------------------
  // "−3/4", "x = 2.5", "$12" -> number. Anything else -> NaN.
  function parseNum(raw) {
    let s = String(raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^\$/, '').replace(/^[a-z]=/i, '');
    let m = s.match(/^(-?\d+)\/(\d+)$/);
    if (m) return +m[2] === 0 ? NaN : +m[1] / +m[2];
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
    return NaN;
  }
  const normStr = (s) => String(s).trim().toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, ' ');
  const sameAnswer = (a, b) => {
    const x = parseNum(a), y = parseNum(b);
    return Number.isFinite(x) && Number.isFinite(y) ? Math.abs(x - y) < 1e-9 : normStr(a) === normStr(b);
  };

  // ---- turning a generator's raw output into a playable item ---------------------------------
  function topUp(answer, pool, seen) {
    const num = parseNum(answer);
    const fr = String(answer).match(/^(−?)(\d+)\/(\d+)$/);
    const tryAdd = (s) => { s = String(s); if (!seen.has(s) && !s.includes('NaN')) { seen.add(s); pool.push({ v: s }); } };
    for (const d of [1, -1, 2, -2, 3, -3, 4, -4, 5]) {
      if (pool.length >= 3) return;
      if (fr) {
        const n = +fr[2] * (fr[1] ? -1 : 1);
        tryAdd(root.U.frac(n + d, +fr[3]));
      } else if (Number.isFinite(num) && Number.isInteger(num)) tryAdd(neg(num + d));
    }
    let k = 1;
    while (pool.length < 3) tryAdd(`${answer} (${k++})`);
  }

  function finalizePart(p) {
    const part = { type: p.type, q: p.q, hint: p.hint || '' };
    if (p.type === 'mc') {
      part.a = String(p.a);
      const whys = { ...(p.why || {}) };
      if (p.choices) {
        part.choices = shuffle(p.choices.map(String));
      } else {
        const seen = new Set([part.a]);
        const pool = [];
        for (const w of p.wrong || []) {
          const v = String(w && w.v !== undefined ? w.v : w);
          if (seen.has(v) || v.includes('NaN') || v === 'undefined') continue;
          seen.add(v); pool.push({ v });
          if (w && w.why) whys[v] = w.why;
        }
        topUp(part.a, pool, seen);
        part.choices = shuffle([part.a, ...pool.slice(0, 3).map((x) => x.v)]);
      }
      part.whys = whys;
    } else if (p.type === 'input') {
      part.a = String(p.a);
      part.wrongs = (p.wrong || []).map((w) => ({ v: String(w.v), why: w.why }));
    } else if (p.type === 'multi') {
      part.options = p.options.map((o) => ({ t: o.t, ok: !!o.ok }));
    } else throw new Error('unknown part type ' + p.type);
    return part;
  }

  function finalize(raw, meta = {}) {
    const parts = raw.type === 'two' ? raw.parts.map(finalizePart) : [finalizePart(raw)];
    const hints = parts.map((p, i) => (p.hint ? (parts.length > 1 ? `${'AB'[i]}: ${p.hint}` : p.hint) : '')).filter(Boolean);
    return { stem: raw.type === 'two' ? raw.q : '', parts, hint: raw.hint || hints.join('  '), steps: raw.steps || [], chk: raw.chk, ...meta };
  }

  // response shapes: mc -> the chosen text; input -> typed text; multi -> array of selected indexes
  function gradePart(part, resp) {
    if (part.type === 'mc') return resp === part.a;
    if (part.type === 'input') return resp !== undefined && resp !== '' && sameAnswer(resp, part.a);
    const want = part.options.map((o, i) => (o.ok ? i : -1)).filter((i) => i >= 0).join(',');
    return (resp || []).slice().sort((a, b) => a - b).join(',') === want;
  }
  function gradeItem(item, resps) {
    const parts = item.parts.map((p, i) => gradePart(p, resps[i]));
    return { parts, correct: parts.every(Boolean) };
  }
  function whyFor(part, resp) {
    if (part.type === 'mc') return part.whys[resp] || '';
    if (part.type === 'input') { const w = part.wrongs.find((x) => sameAnswer(resp, x.v)); return w ? w.why || '' : ''; }
    return 'Check each equation by plugging the value in.';
  }
  const answerText = (part) => (part.type === 'multi' ? part.options.filter((o) => o.ok).map((o) => o.t).join('  |  ') : part.a);
  const respText = (part, r) => (part.type === 'multi' ? (r || []).map((i) => part.options[i].t).join('  |  ') || '(none)' : r || '(blank)');

  // ---- building quizzes ---------------------------------------------------------------------
  function makeItem(topic, gen, level, extra = {}) {
    return finalize(gen.make(level), { topicId: topic.id, genId: gen.id, lv: gen.lv, ...extra });
  }
  // `n` questions easy -> hard, covering every question style at the student's level, then a boss.
  function buildQuiz(topic, level, n = 7) {
    const pool = topic.gens.filter((g) => g.lv <= level);
    const weighted = shuffle([...pool, ...pool.filter((g) => g.lv === level)]);
    const picked = [];
    for (const g of weighted) if (!picked.includes(g)) picked.push(g);
    const order = [];
    while (order.length < n) order.push(...shuffle(picked));
    const gens = order.slice(0, n).sort((a, b) => a.lv - b.lv);
    const items = gens.map((g) => makeItem(topic, g, level));
    const top = Math.max(...pool.map((g) => g.lv));
    const bossGen = pick(pool.filter((g) => g.lv === top));
    items.push(makeItem(topic, bossGen, level, { boss: true }));
    return items;
  }
  // Mixed review of topics already finished, weakest first.
  function buildReview(state, topics, n = 8) {
    const seen = topics.filter((t) => (state.done[t.id] || 0) > 0);
    if (!seen.length) return [];
    const ranked = seen.slice().sort((a, b) => masteryPct(state, a.id) - masteryPct(state, b.id));
    const items = [];
    for (let i = 0; items.length < n; i++) {
      const t = ranked[i % ranked.length], lv = levelOf(state, t.id);
      const pool = t.gens.filter((g) => g.lv <= lv);
      items.push(makeItem(t, pick(pool), lv));
    }
    return shuffle(items);
  }

  // ---- progress state -----------------------------------------------------------------------
  const newState = () => ({ v: 1, name: '', testDate: '', xp: 0, streak: 0, bestStreak: 0, lastDay: null, mastery: {}, done: {}, cards: [], badges: [], log: [], misses: [], bossWins: 0 });
  const levelOf = (s, id) => (s.mastery[id] ? s.mastery[id].level : 1);
  const masteryPct = (s, id) => {
    const h = (s.mastery[id] || {}).hist || [];
    return h.length ? Math.round((100 * h.slice(-20).reduce((a, b) => a + b, 0)) / Math.min(20, h.length)) : 0;
  };
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  function touchStreak(s, now = new Date()) {
    const today = dayKey(now);
    if (s.lastDay === today) return;
    s.streak = s.lastDay && dayDiff(s.lastDay, today) === 1 ? s.streak + 1 : 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    s.lastDay = today;
  }
  // The streak shown on the home screen is only alive if he swung yesterday or today.
  const liveStreak = (s, now = new Date()) => (s.lastDay && dayDiff(s.lastDay, dayKey(now)) <= 1 ? s.streak : 0);

  // results: [{topicId, firstTry, correct, hint, boss, miss?}]
  function applyResults(s, results, opts = {}) {
    const now = opts.now || new Date();
    let gained = 0;
    const levelUps = {};
    results.forEach((r) => {
      const m = (s.mastery[r.topicId] = s.mastery[r.topicId] || { hist: [], level: 1, run: 0, miss: 0 });
      m.hist.push(r.firstTry ? 1 : 0);
      if (m.hist.length > 40) m.hist.shift();
      if (r.firstTry) {
        m.run++; m.miss = 0;
        if (m.run >= 3 && m.level < 3) { m.level++; m.run = 0; levelUps[r.topicId] = m.level; }
      } else {
        m.run = 0; m.miss++;
        if (m.miss >= 2 && m.level > 1) { m.level--; m.miss = 0; }
      }
      let xp = r.firstTry ? 10 : r.correct ? 5 : 0;
      if (r.boss) xp *= 2;
      if (r.hint) xp = Math.max(0, xp - 3);
      gained += xp;
      if (r.boss && r.firstTry) s.bossWins++;
      if (r.miss) { s.misses.unshift({ ...r.miss, topicId: r.topicId, day: dayKey(now) }); s.misses.length = Math.min(s.misses.length, 40); }
    });
    const total = results.length, firsts = results.filter((r) => r.firstTry).length;
    const perfect = total > 0 && firsts === total;
    if (opts.mission) {
      gained += 20 + (perfect ? 10 : 0);
      s.done[opts.mission] = (s.done[opts.mission] || 0) + 1;
      const tp = root.TOPICS.find((t) => t.id === opts.mission);
      (tp ? tp.tips : []).forEach((_, i) => { const id = `${opts.mission}:${i}`; if (!s.cards.includes(id)) s.cards.push(id); });
    }
    s.xp += gained;
    touchStreak(s, now);
    s.log.unshift({ day: dayKey(now), topicId: opts.mission || 'review', score: firsts, total, perfect });
    if (s.log.length > 200) s.log.length = 200;
    const newBadges = [];
    BADGES.forEach((b) => { if (!s.badges.includes(b.id) && b.test(s)) { s.badges.push(b.id); newBadges.push(b); } });
    return { gained, firsts, total, perfect, levelUps, newBadges };
  }

  root.E = { RANKS, BADGES, rankFor, parseNum, sameAnswer, finalize, gradePart, gradeItem, whyFor, answerText, respText, buildQuiz, buildReview, makeItem,
    newState, levelOf, masteryPct, dayKey, touchStreak, liveStreak, applyResults };
})(typeof window !== 'undefined' ? window : globalThis);
