// The Web-Slinger app: home / course map → lesson → quiz → results, plus the parent page.
// Progress lives in this browser's localStorage. (Cloud accounts can be added later, like the AMC 8 app.)
(function () {
  const { TOPICS, COURSE, E } = window;
  const app = document.getElementById('app');
  const KEY = 'ws-algebra1-v1';
  let S = load();
  let view = { name: 'home' };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return { ...E.newState(), ...s }; } catch (e) { /* private mode etc. */ }
    return E.newState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  // {g:given} {f:finding} {a:answer} colour code
  const fmt = (s) => String(s).replace(/\{([gfa]):([^}]*)\}/g, '<span class="$1">$2</span>');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const topicOf = (id) => TOPICS.find((t) => t.id === id);
  const go = (v) => { view = v; render(); window.scrollTo(0, 0); };
  const stars = (id) => '★'.repeat(E.levelOf(S, id)) + '☆'.repeat(3 - E.levelOf(S, id));
  function confetti() {
    const fx = document.getElementById('fx');
    ['🕸️', '⭐', '🕷️', '💥'].forEach((c, k) => { for (let i = 0; i < 6; i++) { const s = document.createElement('span'); s.textContent = c; s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = (k * 0.1 + Math.random() * 0.6) + 's'; fx.appendChild(s); setTimeout(() => s.remove(), 3200); } });
  }

  // ---- home ------------------------------------------------------------------------------
  function home() {
    const r = E.rankFor(S.xp), live = E.liveStreak(S);
    const ready = TOPICS.map((t) => t.id);
    const next = TOPICS.find((t) => !S.done[t.id]);
    const reviewable = TOPICS.filter((t) => S.done[t.id]);
    const days = S.testDate ? Math.ceil((new Date(S.testDate + 'T12:00:00') - new Date()) / 86400000) : null;
    app.innerHTML = `
      <div class="top"><div class="avatar">${r.emoji}</div>
        <div class="grow"><h1>${S.name ? esc(S.name) + "'s Web Lab" : 'Algebra 1 Web-Slinger'}</h1>
          <div class="small dim">${r.name} · ${S.xp} XP${r.next ? ` · ${r.next.min - S.xp} to ${r.next.name}` : ''}</div>
          <div class="bar"><i style="width:${r.pct}%"></i></div></div>
        <div class="streak" title="day streak">🔥 ${live}</div></div>
      ${S.name ? '' : `<div class="card"><h3>Who's swinging today?</h3><div class="row"><input id="nm" type="text" placeholder="Your hero name" maxlength="20" aria-label="Your name" class="grow"><button id="setname">Go</button></div></div>`}
      ${days !== null && days >= 0 ? `<div class="card small">🎯 NJSLA in <b>${days}</b> day${days === 1 ? '' : 's'}</div>` : ''}
      ${next ? `<div class="card hero"><span class="chip">Today's mission</span><h2>${next.emoji} ${next.name}</h2><p class="dim">${esc(next.intro)}</p>
        <div class="row"><button data-mission="${next.id}">Start mission ▶</button><span class="chip">${next.std}</span></div></div>`
        : `<div class="card hero"><h2>All current missions cleared! 🕸️</h2><p class="dim">New missions drop as the next topics are added. Replay or review below.</p></div>`}
      ${reviewable.length ? `<div class="card"><div class="row between"><div><h3>🔄 Review mission</h3><div class="small dim">8 mixed questions from topics you've done, weakest first</div></div><button class="blue" id="review">Review</button></div></div>` : ''}
      <h2 style="margin-top:22px">Mission map</h2>
      ${COURSE.map((d) => `<div class="domain"><h3>${d.emoji} ${d.name}</h3><div class="topics">${d.topics.map((t) => {
        const rd = ready.includes(t.id);
        return `<button class="tcard ${rd ? 'ready' : 'locked'}" ${rd ? `data-open="${t.id}"` : 'disabled'}>${rd ? topicOf(t.id).emoji : '🔒'} ${t.name}
          <small>${rd ? `<span class="stars">${stars(t.id)}</span> · ${S.done[t.id] ? E.masteryPct(S, t.id) + '% mastery' : 'new'}` : 'coming soon'} · ${t.std}</small></button>`;
      }).join('')}</div></div>`).join('')}
      <div class="card" style="margin-top:22px"><h3>🏅 Badges</h3>${E.BADGES.map((b) => `<span class="badge ${S.badges.includes(b.id) ? '' : 'off'}" title="${b.desc}">${b.emoji} ${b.name}</span>`).join('')}</div>
      <div class="card"><h3>🧰 Web-shooter gadgets</h3>${S.cards.length ? S.cards.map((c) => { const [tid, i] = c.split(':'); const tip = topicOf(tid).tips[+i]; return `<div class="gadget"><div class="em">🕸️</div><div><b>${tip.name}</b><div class="small dim">${tip.how}</div></div></div>`; }).join('<hr style="border-color:var(--line)">') : '<span class="dim">Finish a mission to unlock its gadgets.</span>'}</div>
      <p class="center"><button class="ghost" id="parent">Parent page</button></p>`;
    const nm = document.getElementById('setname');
    if (nm) nm.onclick = () => { S.name = document.getElementById('nm').value.trim(); save(); render(); };
    app.querySelectorAll('[data-mission]').forEach((b) => (b.onclick = () => go({ name: 'lesson', id: b.dataset.mission, i: 0, mission: true })));
    app.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => go({ name: 'topic', id: b.dataset.open })));
    const rv = document.getElementById('review');
    if (rv) rv.onclick = () => startQuiz(null, E.buildReview(S, TOPICS, 8));
    document.getElementById('parent').onclick = () => go({ name: 'parent' });
  }

  function topicPage(id) {
    const t = topicOf(id);
    app.innerHTML = `<p><button class="ghost" id="back">← Map</button></p><div class="card hero"><h1>${t.emoji} ${t.name}</h1><p class="dim">${esc(t.intro)}</p>
      <div class="row"><span class="chip">${t.std}</span><span class="stars">${stars(id)}</span><span class="chip">${S.done[id] || 0} missions</span></div></div>
      <div class="card"><div class="row"><button id="les">📖 ${S.done[id] ? 'Replay lesson' : 'Start mission'}</button><button class="blue" id="qz">✏️ Practice only</button></div></div>
      <div class="card"><h3>Gadgets in this topic</h3>${t.tips.map((x) => `<p><b>🕸️ ${x.name}</b><br><span class="dim">${x.how}</span><br><code>${esc(x.ex)}</code></p>`).join('')}</div>`;
    document.getElementById('back').onclick = () => go({ name: 'home' });
    document.getElementById('les').onclick = () => go({ name: 'lesson', id, i: 0, mission: true });
    document.getElementById('qz').onclick = () => startQuiz(id, E.buildQuiz(t, E.levelOf(S, id), 7), false);
  }

  // ---- lesson ------------------------------------------------------------------------------
  function lesson() {
    const t = topicOf(view.id), total = t.slides.length + 1;
    const nav = (back, label, enabled) => `<div class="sticky">${back ? '<button class="ghost" id="prev" style="margin-right:10px">←</button>' : ''}<button id="next" ${enabled ? '' : 'disabled'}>${label}</button></div>`;
    if (view.i >= t.slides.length) {
      app.innerHTML = `<div class="dots">${Array.from({ length: total }, (_, k) => `<i class="${k <= view.i ? 'on' : ''}"></i>`).join('')}</div>
        <h2>🕸️ Your gadgets</h2><p class="dim">Tricks that save time on the test.</p>
        ${t.tips.map((x) => `<div class="card"><div class="gadget"><div class="em">🕸️</div><div><b>${x.name}</b><p>${x.how}</p><code>${esc(x.ex)}</code></div></div></div>`).join('')}
        ${nav(true, 'Start the quiz ▶', true)}`;
      document.getElementById('prev').onclick = () => go({ ...view, i: view.i - 1 });
      document.getElementById('next').onclick = () => startQuiz(t.id, E.buildQuiz(t, E.levelOf(S, t.id), 7), view.mission);
      return;
    }
    const sl = t.slides[view.i];
    let revealed = 0, picked = null;
    const draw = () => {
      let body = '';
      if (sl.type === 'predict') {
        body = `<p class="q">${fmt(sl.ask)}</p>${sl.svg}<div class="opts">${sl.options.map((o, k) => `<label class="opt ${picked === o ? (o === sl.answer ? 'right' : 'wrong') : picked && o === sl.answer ? 'right' : ''}"><input type="radio" name="p" ${picked ? 'disabled' : ''} value="${esc(o)}"><span class="L">${'ABCD'[k]}</span>${esc(o)}</label>`).join('')}</div>
          ${picked ? `<div class="fb ${picked === sl.answer ? 'ok' : 'try'}"><b>${picked === sl.answer ? 'Nice prediction! ✅' : 'Good guess, not quite.'}</b><br>${fmt(sl.text)}</div>` : '<p class="dim small">Predict first, then the picture explains.</p>'}`;
      } else {
        body = `<p class="q">${fmt(sl.problem)}</p>${sl.svg}${sl.steps.slice(0, revealed).map((st, k) => `<div class="fb ${k === revealed - 1 ? 'ok' : ''}">${k + 1}. ${fmt(st.say)}</div>`).join('')}
          ${revealed < sl.steps.length ? `<button class="blue" id="more">Show step ${revealed + 1}</button>` : ''}`;
      }
      app.innerHTML = `<div class="dots">${Array.from({ length: total }, (_, k) => `<i class="${k <= view.i ? 'on' : ''}"></i>`).join('')}</div><h2>${sl.h}</h2>${body}
        ${nav(view.i > 0, 'Next ▶', sl.type === 'predict' ? !!picked : revealed >= sl.steps.length)}`;
      app.querySelectorAll('input[name=p]').forEach((el) => (el.onchange = () => { picked = el.value; draw(); }));
      const more = document.getElementById('more'); if (more) more.onclick = () => { revealed++; draw(); };
      document.getElementById('next').onclick = () => go({ ...view, i: view.i + 1 });
      const pv = document.getElementById('prev'); if (pv) pv.onclick = () => go({ ...view, i: view.i - 1 });
    };
    draw();
  }

  // ---- quiz --------------------------------------------------------------------------------
  function startQuiz(topicId, items, mission) {
    go({ name: 'quiz', topicId, items, mission: mission ? topicId : null, i: 0, results: [], states: [] });
  }
  function quiz() {
    const v = view, item = v.items[v.i];
    const st = (v.cur = v.cur && v.cur.i === v.i ? v.cur : { i: v.i, attempts: 0, hint: false, done: false, resps: [], grade: null, first: null });
    const locked = st.done;
    const partHtml = (p, k) => {
      const lab = item.parts.length > 1 ? `<b>${'AB'[k]}</b> ` : '';
      const g = st.grade && st.grade.parts[k];
      let input = '';
      if (p.type === 'input') input = `<input type="text" id="in${k}" autocomplete="off" inputmode="text" aria-label="Your answer" value="${esc(st.resps[k] || '')}" ${locked ? 'disabled' : ''}>`;
      else input = `<div class="opts">${(p.type === 'mc' ? p.choices : p.options.map((o) => o.t)).map((c, j) => {
        const sel = p.type === 'mc' ? st.resps[k] === c : (st.resps[k] || []).includes(j);
        const cls = locked ? (p.type === 'mc' ? (c === p.a ? 'right' : sel ? 'wrong' : '') : (p.options[j].ok ? 'right' : sel ? 'wrong' : '')) : sel ? 'pick' : '';
        return `<label class="opt ${cls}"><input type="${p.type === 'mc' ? 'radio' : 'checkbox'}" name="c${k}" value="${p.type === 'mc' ? esc(c) : j}" ${sel ? 'checked' : ''} ${locked ? 'disabled' : ''}>${p.type === 'mc' ? `<span class="L">${'ABCD'[j]}</span>` : ''}${esc(c)}</label>`;
      }).join('')}</div>${p.type === 'multi' && !locked ? '<div class="small dim">Select all that apply.</div>' : ''}`;
      return `<div class="${item.parts.length > 1 ? 'part' : ''}"><div class="q">${lab}${esc(p.q)}</div>${input}${g === false && st.attempts === 1 && !locked ? '<div class="small" style="color:var(--red2)">Part ' + 'AB'[k] + ' needs another look.</div>' : ''}</div>`;
    };
    let fb = '';
    if (st.grade && st.grade.correct) fb = `<div class="fb ok"><b>${st.first ? '💥 Thwip! Right on the first try!' : '✅ Got it on the second try.'}</b><ol>${item.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
    else if (st.grade && st.attempts === 1) {
      const why = item.parts.map((p, k) => (st.grade.parts[k] ? '' : E.whyFor(p, st.resps[k]))).filter(Boolean)[0];
      fb = `<div class="fb try"><b>Not quite. Try once more! 🕷️</b>${why ? `<br>🤔 ${esc(why)}` : ''}</div>`;
    } else if (st.grade) {
      const whys = item.parts.map((p, k) => (st.grade.parts[k] ? '' : E.whyFor(p, st.resps[k]))).filter(Boolean);
      fb = `<div class="fb no"><b>Here's how it works:</b> ${item.parts.map((p, k) => `<div>${item.parts.length > 1 ? 'Part ' + 'AB'[k] + ': ' : 'Answer: '}<b>${esc(E.answerText(p))}</b></div>`).join('')}${whys.length ? `<div>🤔 ${esc(whys[0])}</div>` : ''}<ol>${item.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
    }
    app.innerHTML = `<div class="row between"><button class="ghost" id="quit">✕</button><span class="chip">${v.topicId ? topicOf(v.topicId).name : 'Review'}</span><span class="chip">${v.i + 1} / ${v.items.length}</span></div>
      <div class="dots">${v.items.map((_, k) => `<i class="${k < v.results.length ? (v.results[k].firstTry ? 'good' : 'bad') : k === v.i ? 'on' : ''}"></i>`).join('')}</div>
      ${item.boss ? '<p><span class="boss">🦹 BOSS FIGHT · double XP</span></p>' : ''}
      ${item.stem ? `<p class="stem">${esc(item.stem)}</p>` : ''}
      ${item.parts.map(partHtml).join('')}
      ${st.hint && !locked ? `<div class="fb try">⚡ <b>Spidey-sense:</b> ${esc(item.hint)}</div>` : ''}
      ${fb}
      <div class="sticky">${locked ? `<button id="next">${v.i + 1 === v.items.length ? 'See results ▶' : 'Next ▶'}</button>` : `<button class="ghost" id="hint" style="margin-right:10px" ${st.hint ? 'disabled' : ''}>⚡ Hint (−3 XP)</button><button id="check">Check</button>`}</div>`;
    document.getElementById('quit').onclick = () => { if (confirm('Leave this mission? Progress on it will be lost.')) go({ name: 'home' }); };
    const read = () => item.parts.map((p, k) => {
      if (p.type === 'input') return document.getElementById('in' + k).value;
      const els = [...app.querySelectorAll(`input[name=c${k}]:checked`)];
      return p.type === 'mc' ? (els[0] ? els[0].value : undefined) : els.map((e) => +e.value);
    });
    if (!locked) {
      app.querySelectorAll('.opt input').forEach((el) => (el.onchange = () => { st.resps = read(); app.querySelectorAll('.opt').forEach((o) => o.classList.toggle('pick', o.querySelector('input').checked)); }));
      document.getElementById('hint').onclick = () => { st.resps = read(); st.hint = true; quiz(); };
      const check = () => {
        const resps = read();
        if (resps.some((r, k) => item.parts[k].type !== 'multi' && (r === undefined || r === ''))) { alert('Answer every part first.'); return; }
        st.resps = resps; st.attempts++;
        st.grade = E.gradeItem(item, resps);
        if (st.attempts === 1) st.first = st.grade.correct;
        if (st.grade.correct || st.attempts >= 2) {
          st.done = true;
          const miss = st.first ? null : { q: (item.stem ? item.stem + ' ' : '') + item.parts.map((p) => p.q).join(' '), yours: item.parts.map((p, k) => E.respText(p, st.resps[k])).join(' ; '), answer: item.parts.map(E.answerText).join(' ; '), why: item.parts.map((p, k) => E.whyFor(p, st.resps[k])).filter(Boolean)[0] || '' };
          v.results.push({ topicId: item.topicId, firstTry: !!st.first, correct: st.grade.correct, hint: st.hint, boss: !!item.boss, miss });
          if (st.first) confetti();
        }
        quiz();
      };
      document.getElementById('check').onclick = check;
      app.querySelectorAll('input[type=text]').forEach((el) => (el.onkeydown = (e) => { if (e.key === 'Enter') check(); }));
      const f = document.getElementById('in0'); if (f && !st.grade) f.focus();
    } else {
      document.getElementById('next').onclick = () => {
        if (v.i + 1 < v.items.length) { v.i++; v.cur = null; quiz(); return; }
        const before = E.rankFor(S.xp).idx;
        const sum = E.applyResults(S, v.results, { mission: v.mission });
        save(); sum.rankUp = E.rankFor(S.xp).idx > before ? E.rankFor(S.xp) : null;
        go({ name: 'results', sum, topicId: v.topicId, results: v.results });
        confetti();
      };
    }
  }

  function results() {
    const { sum, results: rs } = view, misses = rs.filter((r) => r.miss);
    app.innerHTML = `<div class="card hero center"><h1>${sum.perfect ? '🏆 Perfect mission!' : sum.firsts / sum.total >= 0.7 ? '💥 Mission complete!' : '🕸️ Mission done: keep swinging!'}</h1>
      <h2>${sum.firsts} / ${sum.total} on the first try</h2><p class="streak">+${sum.gained} XP · 🔥 ${S.streak}-day streak</p>
      ${sum.rankUp ? `<p><b>New rank: ${sum.rankUp.emoji} ${sum.rankUp.name}!</b></p>` : ''}
      ${Object.keys(sum.levelUps).map((id) => `<p>⬆️ ${topicOf(id).name} is now level ${'★'.repeat(sum.levelUps[id])}</p>`).join('')}
      ${sum.newBadges.map((b) => `<span class="badge">${b.emoji} ${b.name} unlocked!</span>`).join('')}</div>
      ${misses.length ? `<h2>Let's learn from these</h2>${misses.map((r) => `<div class="card"><div class="q">${esc(r.miss.q)}</div><div class="small">You: <b>${esc(r.miss.yours)}</b> · Answer: <b style="color:var(--green)">${esc(r.miss.answer)}</b></div>${r.miss.why ? `<div class="small dim">🤔 ${esc(r.miss.why)}</div>` : ''}</div>`).join('')}` : '<p class="center dim">No misses. Spider-sense is tingling! 🕷️</p>'}
      <div class="sticky"><button id="home">Back to the Web Lab</button></div>`;
    document.getElementById('home').onclick = () => go({ name: 'home' });
  }

  // ---- parent page -------------------------------------------------------------------------
  function parent() {
    const done = TOPICS.filter((t) => S.done[t.id]);
    app.innerHTML = `<p><button class="ghost" id="back">← Back</button></p><h1>Parent page</h1>
      <div class="card"><h3>At a glance</h3><p>${S.xp} XP · ${E.rankFor(S.xp).name} · 🔥 ${E.liveStreak(S)} day streak (best ${S.bestStreak}) · ${S.log.length} sessions · ${COURSE.flatMap((d) => d.topics).filter((t) => TOPICS.some((x) => x.id === t.id)).length} of ${COURSE.flatMap((d) => d.topics).length} topics built</p></div>
      <div class="card"><h3>Mastery by topic</h3>${done.length ? `<table><tr><th>Topic</th><th>NJSLS</th><th>Level</th><th>Last 20</th></tr>${done.map((t) => `<tr><td>${t.emoji} ${t.name}</td><td class="small dim">${t.std}</td><td class="stars">${stars(t.id)}</td><td><b style="color:${E.masteryPct(S, t.id) >= 80 ? 'var(--green)' : E.masteryPct(S, t.id) >= 50 ? 'var(--gold)' : 'var(--red2)'}">${E.masteryPct(S, t.id)}%</b></td></tr>`).join('')}</table>` : '<span class="dim">No missions finished yet.</span>'}</div>
      <div class="card"><h3>Recent mistakes</h3>${S.misses.length ? S.misses.slice(0, 12).map((m) => `<p class="small"><b>${esc(m.q)}</b><br>Answered: ${esc(m.yours)} · Correct: <b>${esc(m.answer)}</b>${m.why ? `<br><span class="dim">🤔 ${esc(m.why)}</span>` : ''}</p>`).join('') : '<span class="dim">None yet.</span>'}</div>
      <div class="card"><h3>Settings</h3><div class="row"><label>Name <input id="n" type="text" value="${esc(S.name)}" maxlength="20"></label><label>NJSLA date <input id="d" type="text" placeholder="YYYY-MM-DD" value="${esc(S.testDate)}" maxlength="10"></label></div>
        <p class="row"><button id="savebtn">Save</button><button class="ghost" id="exp">Export progress</button><button class="ghost" id="reset">Reset all progress</button></p></div>`;
    document.getElementById('back').onclick = () => go({ name: 'home' });
    document.getElementById('savebtn').onclick = () => { S.name = document.getElementById('n').value.trim(); const d = document.getElementById('d').value.trim(); S.testDate = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ''; save(); go({ name: 'home' }); };
    document.getElementById('exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = 'web-slinger-progress.json'; a.click(); };
    document.getElementById('reset').onclick = () => { if (confirm('Erase ALL progress on this device?')) { S = E.newState(); save(); go({ name: 'home' }); } };
  }

  function render() {
    ({ home, parent, results, quiz, lesson, topic: () => topicPage(view.id) })[view.name]();
  }
  render();
})();
