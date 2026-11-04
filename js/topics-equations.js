// Topic: Solving Linear Equations (A-REI.B.3, A-CED.A.1).
// Each generator returns a fresh question every time. `chk` re-verifies the math (used by the tests).
// Item types: mc (pick one), input (type it), multi (select all that apply), two (Part A / Part B).
(function (root) {
  const { R, pick, shuffle, neg, frac, lin, W } = root.U;
  const T = (root.TOPICS = root.TOPICS || []);
  const sgn = (n) => (n < 0 ? '−' : '+');
  const nz = (lo, hi) => { let v = 0; while (v === 0) v = R(lo, hi); return v; };

  // A tiny animated balance scale: left and right pans with labels.
  const scale = (l, r, note) =>
    `<svg viewBox="0 0 320 180" class="viz" role="img" aria-label="balance scale">
      <polygon points="160,95 140,160 180,160" class="fill-d"/>
      <line x1="40" y1="95" x2="280" y2="95" class="stroke-t pop" style="--d:0s"/>
      <rect x="30" y="50" width="90" height="42" rx="8" class="fill-a pop" style="--d:.3s"/>
      <rect x="200" y="50" width="90" height="42" rx="8" class="fill-b pop" style="--d:.6s"/>
      <text x="75" y="78" class="vt big" text-anchor="middle" style="--d:.3s">${l}</text>
      <text x="245" y="78" class="vt big" text-anchor="middle" style="--d:.6s">${r}</text>
      <text x="160" y="25" class="vt small" text-anchor="middle" style="--d:1s">${note}</text>
    </svg>`;

  // --- shared builders ----------------------------------------------------------------------
  // a·x + b = c  (two-step)
  function twoStep(type) {
    const x = nz(-9, 12), a = R(2, 9), b = nz(-15, 15), c = a * x + b;
    const wrong = [
      W(frac(c, a), `You divided by ${a} first but never undid the ${b < 0 ? '−' : '+'} ${Math.abs(b)}.`),
      W(frac(c + b, a), `You moved the ${neg(b)} the wrong way: to undo ${sgn(b)} ${Math.abs(b)} you ${b < 0 ? 'subtract' : 'add'} ${neg(-b)}.`),
      W(neg(c - b), `You undid the ${neg(b)} but forgot to divide by ${a}.`),
      W(neg(-x), 'Check the sign: plug your answer back in.'),
    ];
    return {
      type, q: `Solve for x: ${lin(a, b)} = ${neg(c)}`, a: neg(x), wrong,
      hint: 'Undo the adding/subtracting first, then undo the multiplying.',
      steps: [`Undo ${sgn(b)} ${Math.abs(b)}: ${a}x = ${neg(c - b)}.`, `Divide both sides by ${a}: x = ${neg(x)}.`, `Check: ${a}(${neg(x)}) ${sgn(b)} ${Math.abs(b)} = ${neg(c)} ✓`],
      chk: () => a * x + b === c,
    };
  }

  // ax + b = cx + d  (variables on both sides)
  function bothSides(type) {
    const x = nz(-8, 10), a = R(3, 9), c = R(1, a - 1), b = nz(-12, 12), d = (a - c) * x + b;
    const wrong = [
      W(frac(d - b, a + c), `You added ${c}x instead of subtracting it from both sides.`),
      W(frac(b - d, a - c), 'The constants got flipped: subtract b from the right, not the left.'),
      W(frac(d + b, a - c), `You added ${neg(b)} to the right instead of subtracting it.`),
      W(neg(-x), 'Sign slip at the end. Plug your answer back in to check.'),
    ];
    return {
      type, q: `Solve for x: ${lin(a, b)} = ${lin(c, d)}`, a: neg(x), wrong,
      hint: `Get all the x's on one side: subtract ${c}x from both sides first.`,
      steps: [`Subtract ${c}x from both sides: ${lin(a - c, b)} = ${neg(d)}.`, `Subtract ${neg(b)} from both sides: ${a - c}x = ${neg(d - b)}.`, `Divide by ${a - c}: x = ${neg(x)}.`],
      chk: () => a * x + b === c * x + d,
    };
  }

  // a(x + b) = c  (distributive property)
  function distribute(type) {
    const x = nz(-8, 10), a = R(2, 7), b = nz(-9, 9), c = a * (x + b);
    const wrong = [
      W(neg(c / a + b), `After dividing by ${a} you have x ${sgn(b)} ${Math.abs(b)} = ${neg(c / a)}, but then you moved ${neg(b)} the wrong way.`),
      W(frac(c - b, a), `You multiplied ${a} by x but not by ${neg(b)}: the ${a} multiplies both terms.`),
      W(neg(c - a * b), `You distributed correctly but forgot to divide by ${a} at the end.`),
      W(neg(-x), 'Sign slip. Plug your answer back in to check.'),
    ];
    return {
      type, q: `Solve for x: ${a}(x ${sgn(b)} ${Math.abs(b)}) = ${neg(c)}`, a: neg(x), wrong,
      hint: `Either distribute the ${a}, or divide both sides by ${a} first.`,
      steps: [`Divide both sides by ${a}: x ${sgn(b)} ${Math.abs(b)} = ${neg(c / a)}.`, `Undo the ${sgn(b)} ${Math.abs(b)}: x = ${neg(x)}.`, `(Or distribute first: ${lin(a, a * b)} = ${neg(c)}.)`],
      chk: () => a * (x + b) === c && Number.isInteger(c / a),
    };
  }

  // x/a + b = c
  function fraction(type) {
    const a = R(2, 6), b = nz(-8, 10); let c = nz(-6, 9); if (c === b) c += 1;
    const x = a * (c - b);
    const wrong = [
      W(neg(c - b), `You undid the ${neg(b)} but forgot to multiply by ${a} to undo the division.`),
      W(neg(a * (c + b)), `You moved the ${neg(b)} the wrong way.`),
      W(frac(c - b, a), `x is being divided by ${a}, so you multiply by ${a}, not divide.`),
      W(neg(-x), 'Sign slip. Plug your answer back in to check.'),
    ];
    return {
      type, q: `Solve for x: x/${a} ${sgn(b)} ${Math.abs(b)} = ${neg(c)}`, a: neg(x), wrong,
      hint: 'Undo the adding/subtracting first, then multiply to undo the dividing.',
      steps: [`Undo ${sgn(b)} ${Math.abs(b)}: x/${a} = ${neg(c - b)}.`, `Multiply both sides by ${a}: x = ${neg(x)}.`],
      chk: () => x / a + b === c,
    };
  }

  const stories = [
    { who: 'Peter', thing: 'web-fluid cartridges', unit: 'cartridge', fixed: 'a web-shooter', fixedWord: 'shooter' },
    { who: 'Miles', thing: 'subway rides', unit: 'ride', fixed: 'a city pass', fixedWord: 'pass' },
    { who: 'Gwen', thing: 'drum lessons', unit: 'lesson', fixed: 'a practice kit', fixedWord: 'kit' },
    { who: 'Ned', thing: 'LEGO sets', unit: 'set', fixed: 'a display shelf', fixedWord: 'shelf' },
  ];

  // --- the topic ----------------------------------------------------------------------------
  T.push({
    id: 'lin-eq', name: 'Solving Linear Equations', emoji: '⚖️', color: '#e11d2e',
    std: 'A-REI.B.3 · A-CED.A.1',
    intro: 'An equation is a balance. Whatever you do to one side, you do to the other. Your job: get x alone.',
    slides: [
      { type: 'predict', h: 'Keep the scale balanced',
        ask: 'To solve {g:3x + 4 = 19}, what is the {f:first} move?',
        options: ['Subtract 4 from both sides', 'Divide both sides by 3', 'Add 4 to both sides', 'Subtract 3 from both sides'], answer: 'Subtract 4 from both sides',
        svg: scale('3x + 4', '19', 'Both sides must stay equal'),
        text: 'Undo the adding/subtracting first. Taking 4 off both sides keeps the scale level: 3x = 15.' },
      { type: 'steps', h: 'Undo in reverse order', problem: 'Solve {g:3x + 4 = 19}.',
        svg: scale('3x + 4', '19', 'Peel off the + 4, then the × 3'),
        steps: [{ say: 'Subtract 4 from both sides: {g:3x = 15}.' }, { say: 'Divide both sides by 3: {a:x = 5}.' }, { say: 'Check: 3(5) + 4 = 19 ✓' }] },
      { type: 'steps', h: 'x on both sides? Collect it', problem: 'Solve {g:5x − 3 = 2x + 12}.',
        svg: scale('5x − 3', '2x + 12', 'Move the x\'s to one side'),
        steps: [{ say: 'Subtract 2x from both sides: {g:3x − 3 = 12}.' }, { say: 'Add 3 to both sides: {g:3x = 15}.' }, { say: 'Divide by 3: {a:x = 5}.' }] },
      { type: 'predict', h: 'Sometimes there is no answer',
        ask: 'How many solutions does {g:2x + 3 = 2x + 7} have?',
        options: ['One solution', 'No solution', 'Infinitely many solutions', 'Two solutions'], answer: 'No solution',
        svg: scale('2x + 3', '2x + 7', 'Take away 2x from both…'),
        text: 'Subtract 2x and you get 3 = 7, which is never true. No value of x works: no solution. If you got 7 = 7 (always true) it would be infinitely many.' },
    ],
    tips: [
      { name: 'Reverse the order of operations', how: 'x was multiplied, then had a number added. Undo it backwards: undo the + or − first, then the × or ÷.', ex: '3x + 4 = 19 → −4, then ÷3' },
      { name: 'Check by plugging back in', how: 'Put your answer in the ORIGINAL equation. If both sides match, you are right. It takes 10 seconds and catches sign slips.', ex: 'x = 5: 3(5) + 4 = 19 ✓' },
      { name: 'Collect x on the bigger side', how: 'Subtract the smaller x-term from both sides so your x coefficient stays positive.', ex: '5x − 3 = 2x + 12 → subtract 2x' },
    ],
    gens: [
      { id: 'two-step', lv: 1, make: () => twoStep('mc') },
      { id: 'two-step-in', lv: 1, make: () => twoStep('input') },
      { id: 'which-solves', lv: 1, make: () => {
        const k = nz(-6, 9);
        const mk = (ok) => {
          const a = R(2, 7), b = nz(-9, 9);
          const c = a * k + b + (ok ? 0 : pick([-3, -2, -1, 1, 2, 3]));
          return { t: `${lin(a, b)} = ${neg(c)}`, ok, lhs: a * k + b, c };
        };
        const nOk = R(2, 3);
        const opts = [];
        const seen = new Set();
        for (let i = 0; i < 5; i++) {
          let o;
          do { o = mk(i < nOk); } while (seen.has(o.t));
          seen.add(o.t); opts.push(o);
        }
        const options = shuffle(opts);
        return {
          type: 'multi', q: `Select ALL the equations that have x = ${neg(k)} as a solution.`, options,
          hint: `Plug x = ${neg(k)} into each equation and see if both sides match.`,
          steps: options.map((o) => `${o.t}: left side = ${neg(o.lhs)} ${o.ok ? '=' : '≠'} ${neg(o.c)} → ${o.ok ? 'yes ✓' : 'no ✗'}`),
          chk: () => options.every((o) => (o.lhs === o.c) === o.ok),
        };
      } },
      { id: 'both-sides', lv: 2, make: () => bothSides(pick(['mc', 'input'])) },
      { id: 'distribute', lv: 2, make: () => distribute(pick(['mc', 'input'])) },
      { id: 'fraction-eq', lv: 2, make: () => fraction(pick(['mc', 'input'])) },
      { id: 'write-model', lv: 2, make: () => {
        const s = pick(stories), fee = R(8, 40), r = R(3, 9), n = R(3, 12), tot = fee + r * n;
        return {
          type: 'mc', q: `${s.who} buys ${s.fixed} for $${fee} and then pays $${r} for each ${s.unit}. The total cost is $${tot}. Which equation can be used to find n, the number of ${s.thing}?`,
          a: `${r}n + ${fee} = ${tot}`,
          wrong: [
            W(`${fee}n + ${r} = ${tot}`, `The $${fee} is a one-time cost and the $${r} is per ${s.unit}. You swapped them.`),
            W(`${r + fee}n = ${tot}`, 'The one-time cost is not charged every time. Only the per-item price multiplies n.'),
            W(`${r}n − ${fee} = ${tot}`, 'The one-time cost is added to the total, not taken away.'),
          ],
          hint: 'The one-time cost is added once. Only the per-item price gets multiplied by n.',
          steps: [`Cost per ${s.unit} × number of ${s.thing} = ${r}n.`, `Add the one-time $${fee}: ${r}n + ${fee}.`, `Set equal to the total: ${r}n + ${fee} = ${tot}.`],
          chk: () => r * n + fee === tot,
        };
      } },
      { id: 'word-solve', lv: 2, make: () => {
        const s = pick(stories), fee = R(8, 40), r = R(3, 9), n = R(3, 12), tot = fee + r * n;
        return {
          type: 'input', q: `${s.who} buys ${s.fixed} for $${fee}, then pays $${r} for each ${s.unit}. The total cost is $${tot}. How many ${s.thing} did ${s.who} buy?`,
          a: String(n),
          wrong: [W(String(tot - fee), `That is the money spent on ${s.thing}. Divide by $${r} to get how many.`), W(frac(tot, r), `You forgot to take out the $${fee} one-time cost first.`)],
          hint: `Subtract the one-time $${fee}, then divide by the price of each ${s.unit}.`,
          steps: [`${r}n + ${fee} = ${tot}`, `${r}n = ${tot - fee}`, `n = ${n}`],
          chk: () => r * n + fee === tot,
        };
      } },
      { id: 'two-part', lv: 2, make: () => {
        const x = nz(-7, 9), a = R(2, 8), b = nz(-12, 12), c = a * x + b, p = R(2, 6), q = nz(-9, 9), val = p * x + q;
        return {
          type: 'two', q: `Part A and Part B use the equation ${lin(a, b)} = ${neg(c)}.`,
          parts: [
            { type: 'input', q: 'Part A: Solve for x.', a: neg(x), hint: 'Undo the +/− first, then the ×.' },
            { type: 'input', q: `Part B: Use your answer from Part A. What is the value of ${lin(p, q)}?`, a: neg(val), hint: 'Substitute the value of x and calculate.' },
          ],
          steps: [`Part A: ${a}x = ${neg(c - b)}, so x = ${neg(x)}.`, `Part B: ${p}(${neg(x)}) ${sgn(q)} ${Math.abs(q)} = ${neg(val)}.`],
          chk: () => a * x + b === c && p * x + q === val,
        };
      } },
      { id: 'solutions-count', lv: 3, make: () => {
        const kind = pick(['one', 'none', 'inf']);
        const a = R(2, 6), k = nz(-6, 6);
        let q, ans, steps;
        if (kind === 'none') {
          const d = a * k + pick([-3, -2, -1, 1, 2, 3]);
          q = `${a}(x ${sgn(k)} ${Math.abs(k)}) = ${lin(a, d)}`; ans = 'No solution';
          steps = [`Distribute: ${lin(a, a * k)} = ${lin(a, d)}.`, `Subtract ${a}x from both sides: ${neg(a * k)} = ${neg(d)}.`, 'That is never true, so there is no solution.'];
        } else if (kind === 'inf') {
          q = `${a}(x ${sgn(k)} ${Math.abs(k)}) = ${lin(a, a * k)}`; ans = 'Infinitely many solutions';
          steps = [`Distribute: ${lin(a, a * k)} = ${lin(a, a * k)}.`, 'Both sides are identical, so it is true for every x: infinitely many solutions.'];
        } else {
          const c = pick([1, 2, 3, 4, 5].filter((v) => v !== a)), d = nz(-9, 9);
          q = `${lin(a, k)} = ${lin(c, d)}`; ans = 'Exactly one solution';
          steps = [`The x-coefficients are different (${a} and ${c}), so subtracting leaves ${a - c}x = ${neg(d - k)}.`, 'That gives exactly one value of x.'];
        }
        return {
          type: 'mc', q: `How many solutions does ${q} have?`,
          choices: ['Exactly one solution', 'No solution', 'Infinitely many solutions', 'Exactly two solutions'], a: ans,
          why: { 'Exactly two solutions': 'A linear equation never has exactly two solutions.' },
          hint: 'Simplify both sides, then subtract the x-terms. What is left: a true statement, a false one, or a number for x?',
          steps, chk: () => true,
        };
      } },
      { id: 'fraction-answer', lv: 3, make: () => {
        let a, b, c;
        do { a = pick([2, 3, 4, 5, 6, 8]); b = nz(-12, 12); c = nz(-20, 20); } while ((c - b) % a === 0);
        return {
          type: 'input', q: `Solve for x: ${lin(a, b)} = ${neg(c)}. Enter your answer as a fraction in lowest terms (like 3/2) or a decimal.`,
          a: frac(c - b, a),
          wrong: [W(frac(c + b, a), `You moved the ${neg(b)} the wrong way.`), W(neg(c - b), 'You forgot to divide by ' + a + '.')],
          hint: 'It is okay if x is not a whole number. Divide and simplify the fraction.',
          steps: [`${a}x = ${neg(c - b)}`, `x = ${neg(c - b)}/${a} = ${frac(c - b, a)}`],
          chk: () => (c - b) % a !== 0,
        };
      } },
      { id: 'find-error', lv: 3, make: () => {
        const x = nz(-6, 9), a = R(2, 7), b = R(2, 15), c = a * x + b;
        return {
          type: 'mc', q: `A student solves ${lin(a, b)} = ${c}. Step 1: "${a}x = ${c + b}". What is the error in Step 1?`,
          choices: [`The student added ${b} to the right side instead of subtracting ${b}.`, `The student should have divided by ${a} before subtracting.`, `The student subtracted ${b} from the left side only.`, 'There is no error.'],
          a: `The student added ${b} to the right side instead of subtracting ${b}.`,
          why: { 'There is no error.': `Look at the right side: ${c} + ${b} = ${c + b}, but undoing + ${b} means subtracting.` },
          hint: `The left side lost its + ${b}. What should happen to the right side to keep the balance?`,
          steps: [`To undo + ${b}, subtract ${b} from both sides.`, `Correct Step 1: ${a}x = ${c - b}.`, `Then x = ${x}.`],
          chk: () => a * x + b === c,
        };
      } },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
