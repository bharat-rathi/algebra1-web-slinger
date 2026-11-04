// The NJSLA Algebra 1 course map. Topics are added to the app one at a time: a topic whose id
// appears in window.TOPICS (js/topics-*.js) is "ready"; the rest show as coming soon.
// Standards are the NJ Student Learning Standards for Mathematics (CCSS-aligned) that the NJSLA
// Algebra 1 test assesses.
(function (root) {
  const C = (root.COURSE = [
    { id: 'eq', name: 'Equations & Inequalities', emoji: '⚖️', topics: [
      { id: 'lin-eq', name: 'Solving Linear Equations', std: 'A-REI.B.3 · A-CED.A.1' },
      { id: 'lit-eq', name: 'Rearranging Formulas', std: 'A-CED.A.4' },
      { id: 'lin-ineq', name: 'Linear Inequalities', std: 'A-REI.B.3 · A-CED.A.1' },
      { id: 'sys-graph', name: 'Systems by Graphing', std: 'A-REI.C.6 · A-REI.D.11' },
      { id: 'sys-alg', name: 'Systems: Substitution & Elimination', std: 'A-REI.C.5 · A-REI.C.6' },
      { id: 'sys-ineq', name: 'Systems of Inequalities', std: 'A-REI.D.12' },
    ] },
    { id: 'fn', name: 'Linear Functions', emoji: '📈', topics: [
      { id: 'fn-basics', name: 'Function Notation & Evaluating', std: 'F-IF.A.1 · F-IF.A.2' },
      { id: 'domain-range', name: 'Domain & Range', std: 'F-IF.A.1 · F-IF.B.5' },
      { id: 'slope', name: 'Slope & Rate of Change', std: 'F-IF.B.6 · S-ID.C.7' },
      { id: 'slope-int', name: 'Slope-Intercept Form & Graphing', std: 'A-CED.A.2 · F-IF.C.7a' },
      { id: 'write-lines', name: 'Writing Equations of Lines', std: 'F-BF.A.1 · F-LE.A.2' },
      { id: 'seq', name: 'Arithmetic & Geometric Sequences', std: 'F-IF.A.3 · F-BF.A.2' },
      { id: 'fn-features', name: 'Key Features of Graphs', std: 'F-IF.B.4' },
      { id: 'fn-transform', name: 'Transformations of Graphs', std: 'F-BF.B.3' },
    ] },
    { id: 'exp', name: 'Exponents & Polynomials', emoji: '🚀', topics: [
      { id: 'exp-rules', name: 'Laws of Exponents', std: 'N-RN.A.1 · A-SSE.A.2' },
      { id: 'radicals', name: 'Radicals & Rational Numbers', std: 'N-RN.A.2 · N-RN.B.3' },
      { id: 'poly-ops', name: 'Adding, Subtracting & Multiplying Polynomials', std: 'A-APR.A.1' },
      { id: 'factor-gcf', name: 'Factoring: GCF & Grouping', std: 'A-SSE.A.2' },
      { id: 'factor-quad', name: 'Factoring Trinomials & Difference of Squares', std: 'A-SSE.A.2 · A-SSE.B.3a' },
      { id: 'exp-fn', name: 'Exponential Growth & Decay', std: 'F-LE.A.1 · A-SSE.B.3c' },
      { id: 'lin-vs-exp', name: 'Linear vs. Exponential', std: 'F-LE.A.1 · F-LE.A.3' },
    ] },
    { id: 'quad', name: 'Quadratics', emoji: '🌉', topics: [
      { id: 'quad-factor', name: 'Solving Quadratics by Factoring', std: 'A-REI.B.4b · A-APR.B.3' },
      { id: 'quad-sqrt', name: 'Solving by Square Roots & Completing the Square', std: 'A-REI.B.4a · A-SSE.B.3b' },
      { id: 'quad-formula', name: 'The Quadratic Formula', std: 'A-REI.B.4a · A-REI.B.4b' },
      { id: 'quad-graph', name: 'Graphing Parabolas', std: 'F-IF.C.7a · F-IF.B.4' },
      { id: 'quad-forms', name: 'Vertex, Standard & Factored Form', std: 'F-IF.C.8a · A-SSE.B.3' },
      { id: 'quad-apps', name: 'Quadratic Word Problems', std: 'A-CED.A.1 · F-IF.B.6' },
    ] },
    { id: 'stats', name: 'Data & Statistics', emoji: '📊', topics: [
      { id: 'one-var', name: 'Center, Spread & Box Plots', std: 'S-ID.A.1 · S-ID.A.2 · S-ID.A.3' },
      { id: 'two-way', name: 'Two-Way Tables', std: 'S-ID.B.5' },
      { id: 'scatter', name: 'Scatterplots & Lines of Best Fit', std: 'S-ID.B.6 · S-ID.C.7 · S-ID.C.8' },
    ] },
  ]);
  root.allCourseTopics = () => C.flatMap((d) => d.topics.map((t) => ({ ...t, domain: d.id, domainName: d.name })));
})(typeof window !== 'undefined' ? window : globalThis);
