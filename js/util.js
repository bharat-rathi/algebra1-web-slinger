// Small math + randomness + formatting helpers shared by every topic.
// Plain scripts (no modules) so the app also works when index.html is opened from disk.
(function (root) {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

  // A number with a real minus sign: -5 -> "−5".
  const neg = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
  // "n/d" in lowest terms (whole numbers print plainly, sign on the top).
  const frac = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    return d === 1 ? neg(n) : `${neg(n)}/${d}`;
  };
  // "ax + b" as text: lin(3,-5) -> "3x − 5", lin(1,0) -> "x", lin(-1,4) -> "−x + 4".
  const lin = (a, b, v = 'x') => {
    let s = '';
    if (a !== 0) s = a === 1 ? v : a === -1 ? '−' + v : `${neg(a)}${v}`;
    if (b !== 0 || a === 0) s += a === 0 ? neg(b) : ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}`;
    return s;
  };
  // A wrong answer with the reason a student might have chosen it.
  const W = (v, why) => ({ v, why });

  root.U = { R, pick, shuffle, gcd, neg, frac, lin, W };
})(typeof window !== 'undefined' ? window : globalThis);
