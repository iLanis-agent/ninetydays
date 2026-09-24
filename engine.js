// NinetyDays engine - Schengen 90/180 rolling-window math (no DOM)
(function (root) {
  'use strict';

  var DAY = 86400000, LIMIT = 90, WINDOW = 180;

  function iso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parse(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDays(d, n) {
    var x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
  }

  // Expand stays into a Set of used day-epochs (entry and exit days both count).
  function usedSet(stays) {
    var set = new Set();
    stays.forEach(function (s) {
      var d = parse(s.start), end = parse(s.end);
      while (d <= end) { set.add(d.getTime()); d = addDays(d, 1); }
    });
    return set;
  }

  function validate(stays) {
    var errs = [];
    var sorted = stays.slice().sort(function (a, b) { return a.start < b.start ? -1 : 1; });
    sorted.forEach(function (s, i) {
      if (parse(s.end) < parse(s.start)) errs.push('Stay ' + (i + 1) + ' ends before it starts');
      if (i > 0 && parse(s.start) <= parse(sorted[i - 1].end)) errs.push('Stays overlap: ' + s.start);
    });
    return errs;
  }

  // Days used in the rolling window ending at date D (inclusive), from a used-set.
  function usedInWindow(set, D) {
    var from = addDays(D, -(WINDOW - 1)).getTime();
    var to = D.getTime(), n = 0;
    set.forEach(function (t) { if (t >= from && t <= to) n++; });
    return n;
  }

  // Max days one may stay starting on enterDate (must be in the future or today).
  // Simulates day-by-day: each new day d is allowed only if every day in [d-179, d] stays <= 90 used.
  // Because adding days only affects windows covering those days, the binding check is the count at each day.
  function maxStay(stays, enterDate, cap) {
    var set = usedSet(stays);
    var d = parse(enterDate);
    var allowed = 0;
    cap = cap || 90;
    while (allowed < cap) {
      var count = usedInWindow(set, d) + (set.has(d.getTime()) ? 0 : 1);
      // count includes past days + this new day
      if (count > LIMIT) break;
      set.add(d.getTime());
      allowed++;
      d = addDays(d, 1);
    }
    return { days: allowed, lastDay: allowed > 0 ? iso(addDays(d, -1)) : null, set: set };
  }

  // Status today: used, remaining, and the date the window frees more days.
  function status(stays, today) {
    var set = usedSet(stays);
    var t = parse(today);
    var used = usedInWindow(set, t);
    var remaining = Math.max(0, LIMIT - used);
    // Find the next day after today on which remaining increases (oldest in-window day expires)
    var nextFree = null;
    if (remaining === 0) {
      for (var i = 1; i <= WINDOW; i++) {
        var fut = addDays(t, i);
        if (LIMIT - usedInWindow(set, fut) > 0) { nextFree = iso(fut); break; }
      }
    }
    return { used: used, remaining: remaining, nextFree: nextFree, onTrack: used <= LIMIT };
  }

  // Days freed per upcoming day: schedule of when days roll off.
  function rollOff(stays, today, horizonDays) {
    var set = usedSet(stays);
    var t = parse(today);
    var out = [];
    for (var i = 0; i < (horizonDays || 30); i++) {
      var d = addDays(t, i);
      out.push({ date: iso(d), remaining: Math.max(0, LIMIT - usedInWindow(set, d)) });
    }
    return out;
  }

  var api = {
    LIMIT: LIMIT, WINDOW: WINDOW,
    iso: iso, parse: parse, addDays: addDays,
    usedSet: usedSet, validate: validate,
    usedInWindow: usedInWindow, maxStay: maxStay,
    status: status, rollOff: rollOff
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SchengenEngine = api;
})(typeof self !== 'undefined' ? self : this);
