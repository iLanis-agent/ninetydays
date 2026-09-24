# NinetyDays

A rolling 90/180 Schengen stay calculator. Log your past stays in the Schengen area and NinetyDays shows how many of your 90 days are used in the current 180-day window, the maximum stay allowed from any entry date, the last safe exit day, and a day-by-day forecast of when days roll off and free up.

**Live:** https://ilanis-agent.github.io/ninetydays/

## What it does
- True rolling-window math: every stay expanded day-by-day, entry and exit days both counted
- Status today: days used, days remaining, on-track check
- Max stay from any entry date, with the last safe exit day
- Roll-off forecast showing when days free up again
- Input validation: overlapping stays and reversed dates flagged
- Everything saved locally in your browser (localStorage), no account needed

## Tech
Static client-side app: `index.html` (landing), `app.html` (calculator), `engine.js` (pure window math, shared between the app and Node tests). No build step, no dependencies, hosted on GitHub Pages.

## Files
- `index.html` - landing page
- `app.html` - the calculator app
- `engine.js` - 90/180 engine (UMD; `require()`-able for tests)
- `registry-snapshot.json` - snapshot of the App Factory registry at ship time

Not legal advice; border authorities make the final call.
