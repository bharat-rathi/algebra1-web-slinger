# Algebra 1 Web-Slinger: how to work in this repo

A Spider-Man-themed daily Algebra 1 app (NJSLA prep). Static site: plain HTML/JS, no build step, progress in
localStorage. Modelled on the AMC 8 app in `bharat-rathi/Mathcount/amc8-class`.

## Daily workflow: "add today's topic"
The parent names a topic (and often what the class is covering). To add it:
1. Find the topic in `js/course.js` (id, name, NJSLS standard). Add it there if it is missing.
2. Create/extend `js/topics-<area>.js` with a `TOPICS.push({...})` entry, copying `js/topics-equations.js`:
   - `slides`: 3-4 (`predict` = guess then explain; `steps` = worked example revealed one tap at a time). Colour code
     `{g:given}` `{f:finding}` `{a:answer}`. Keep it one idea per slide.
   - `tips`: 2-3 "gadgets" (test-taking tricks).
   - `gens`: 8-12 generators `{id, lv: 1|2|3, make}` returning fresh numbers each call. Include a mix of NJSLA item types:
     `mc`, `input`, `multi` (select all), `two` (Part A / Part B). Give each a `hint`, `steps`, a `chk` that re-verifies the math,
     and for wrong answers `W(value, 'why a student would pick this')` (the classic mistakes, not random numbers).
3. Add `<script src="js/topics-<area>.js">` to `index.html` (before `engine.js`).
4. `node tests/test.mjs` must pass (it runs every generator 1500x per level, checks choices, grading and math).
5. Check it in a browser (Playwright is available) at phone width, then commit and push.

## Rules of the house
- Answers must be exact: integers or fractions in lowest terms. Input answers accept `3/2`, `1.5`, `−4`, `x = 4`.
- Wrong choices must be real misconceptions with a one-line "why".
- Style matches NJSLA: multi-part items, select-all, reasoning (find the error), word-problem modelling.
- Theme: original Spider-Man-flavoured art only (webs, masks, city). No Marvel logos or official artwork; this is a private
  family study tool.
- Color code everywhere: blue = given, orange = what we find, green = answer.
- Course map in `js/course.js` mirrors the NJSLA Algebra 1 standards; a topic is "ready" once it exists in `TOPICS`.
