# 🕷️ Algebra 1 Web-Slinger

A daily Spider-Man-themed **Algebra 1 mission** to get ready for the **NJSLA**. Each mission is a short animated lesson,
a few "web-shooter gadget" tricks, and 7 practice questions with fresh numbers every time, ending in a boss question.

Open `index.html` (or serve the folder; GitHub Pages works). No install, no account. Progress is saved in the browser.

## What's in it
- **Mission map** of the NJSLA Algebra 1 course (5 domains, 30 topics, each tagged with its NJ Student Learning Standard).
  Topics unlock as they're built.
- **Lesson**: predict-then-explain and step-by-step slides, same colour code every time (blue = given, orange = find, green = answer).
- **Quiz**: NJSLA-style items: multiple choice, type-in, **select all that apply**, and **Part A / Part B**.
  Wrong first try → one more try, then a worked solution. Each wrong choice is a classic mistake with a "what went wrong".
- **⚡ Spidey-sense hints** (−3 XP), **boss fights** (double XP), levels ★☆☆ → ★★★ per topic (3 right in a row up, 2 misses down).
- **XP, ranks** (Rookie Swinger → Web-Slinger Legend), **day streak**, badges, collectible gadgets, mixed **review missions**.
- **Parent page**: mastery per topic with standards, recent mistakes, NJSLA date, export/reset.

## Built so far
| Topic | Standards |
|---|---|
| Solving Linear Equations | A-REI.B.3 · A-CED.A.1 |

New topics are added daily. See `CLAUDE.md` for the recipe.

## Development
```
node tests/test.mjs
```
Runs every question generator ~1,500 times per level and checks the math, answer choices and grading, plus XP/streak/level logic.

*Independent family study project. Not affiliated with or endorsed by Marvel, Sony or the NJ Department of Education.*
