// Average retention curve of the reels, split into hook / buildup / payoff / brand ending,
// and which part loses viewers fastest ("the weakest link").
//
// Instagram's API does not hand out the per-second retention graph (that only exists in the app).
// What it does give per reel: average watch time and, since late 2025, the skip rate
// (share of plays that left in the first 3 seconds). Each reel also has a known structure,
// saved from its episode when it is rendered (see content/engine/beats.py):
//
//   hook      0 s  -> 3 s              (Instagram's own skip window)
//   buildup   3 s  -> the payoff
//   payoff    the turn -> the brand ending (includes the comment / share / save prompt)
//   ending    endCard / wordmark -> end (expected to drop; shown, never judged)
//
// Model: inside each phase viewers leave at a steady rate (a constant share per second).
// Four rates, shared by all reels, are fitted so that every reel's predicted average watch time
// (the area under its curve) and predicted 3-second survival match what Instagram measured.
// Reels have different lengths and different phase lengths, which is what lets the fit
// tell the phases apart. It is an estimate: the dashboard says so and shows how well it fits.

export const HOOK_S = 3;
export const PHASES = ['hook', 'buildup', 'payoff', 'ending'];
export const MIN_REELS = 4; // fewer and the four rates are not pinned down
export const SOLID_REELS = 10;

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v) ? +v : null);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function median(values) {
  const v = values.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

// beats (as saved at render time, already stretched):
//   { dur, scenes: [[name, t0, t1]], endcard: t|null, wordmarks: [t], declared: { payoff?, outro? } | null }
// -> { dur, hook, payoff, outro } in seconds, or null when unusable.
export function phasesOf(beats) {
  let b = beats;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { return null; }
  }
  if (!b || typeof b !== 'object') return null;
  const dur = num(b.dur);
  if (!(dur > HOOK_S + 1)) return null;
  const declared = b.declared && typeof b.declared === 'object' ? b.declared : {};

  // Brand ending: declared, else the end card, else a wordmark in the last quarter.
  let outro = num(declared.outro) ?? num(b.endcard);
  if (outro === null) {
    const late = (b.wordmarks || []).map(num).filter((t) => t !== null && t >= 0.75 * dur);
    outro = late.length ? Math.min(...late) : dur;
  }
  outro = clamp(outro, HOOK_S, dur);

  // Payoff: declared, else the first scene change at 4 s or later (the turn), else 60% of the way.
  let payoff = num(declared.payoff);
  if (payoff === null) {
    const turns = (b.scenes || []).map((s) => num(Array.isArray(s) ? s[1] : null)).filter((t) => t !== null && t >= 4 && t < outro - 0.5).sort((x, y) => x - y);
    payoff = turns.length ? turns[0] : HOOK_S + 0.6 * (outro - HOOK_S);
  }
  payoff = clamp(payoff, HOOK_S, outro);
  return { dur, hook: HOOK_S, payoff, outro };
}

const segments = (ph) => [[0, ph.hook, 0], [ph.hook, ph.payoff, 1], [ph.payoff, ph.outro, 2], [ph.outro, ph.dur, 3]];

// Share of starting viewers still watching at t seconds. H = leave rate per second for each phase.
export function survivalAt(t, ph, H) {
  let s = 1;
  for (const [a, b, k] of segments(ph)) {
    if (t <= a) break;
    s *= Math.exp(-H[k] * (Math.min(t, b) - a));
  }
  return s;
}

// Average seconds watched in one pass = area under the curve.
export function expectedWatch(ph, H) {
  let s = 1;
  let total = 0;
  for (const [a, b, k] of segments(ph)) {
    const L = b - a;
    if (L <= 0) continue;
    const h = H[k];
    total += h > 1e-9 ? (s * (1 - Math.exp(-h * L))) / h : s * L;
    s *= Math.exp(-h * L);
  }
  return total;
}

// samples: [{ ph, watch, skip (0..1) | null, weight }]. Pattern search in log-space: no dependencies,
// a few thousand cheap evaluations, deterministic.
export function fitRates(samples, { maxIter = 300 } = {}) {
  const LO = Math.log(1e-4);
  const HI = Math.log(3);
  const loss = (x) => {
    const H = x.map(Math.exp);
    let L = 0;
    for (const s of samples) {
      const e = (expectedWatch(s.ph, H) - s.watch) / s.ph.dur;
      L += s.weight * e * e;
      if (s.skip !== null) {
        const d = survivalAt(s.ph.hook, s.ph, H) - (1 - s.skip);
        L += s.weight * 2 * d * d;
      }
    }
    // Tiny pull toward one shared rate, so phases the data cannot separate stay level instead of drifting apart.
    const m = x.reduce((a, b) => a + b, 0) / x.length;
    return L + 2e-3 * x.reduce((a, b) => a + (b - m) ** 2, 0);
  };
  let x = [Math.log(0.15), Math.log(0.07), Math.log(0.07), Math.log(0.2)];
  let f = loss(x);
  let step = 1;
  for (let it = 0; it < maxIter && step > 1e-3; it++) {
    let moved = false;
    for (let k = 0; k < x.length; k++) {
      for (const d of [step, -step]) {
        const y = x.slice();
        y[k] = clamp(y[k] + d, LO, HI);
        const fy = loss(y);
        if (fy < f - 1e-12) { x = y; f = fy; moved = true; break; }
      }
    }
    if (!moved) step /= 2;
  }
  return { H: x.map(Math.exp), loss: f };
}

const skipShare = (v) => {
  const n = num(v);
  if (n === null) return null;
  return clamp(n > 1 ? n / 100 : n, 0, 1); // Instagram reports a percentage
};

// One reel -> a sample for the fit, or null.
export function sampleOf(row) {
  const ph = phasesOf(row.beats);
  if (!ph || typeof row.avgWatchS !== 'number' || !(row.views > 0)) return null;
  return {
    id: row.id,
    label: row.label,
    group: row.group || null,
    ph,
    // Average watch time includes replays; anything past the reel's length is a replay, not retention.
    watch: Math.min(row.avgWatchS, ph.dur * 0.98),
    replayed: row.avgWatchS > ph.dur,
    skip: skipShare(row.skipRate),
    weight: Math.log10(10 + row.views),
  };
}

function describe(samples) {
  const { H } = fitRates(samples);
  const ph = {
    dur: median(samples.map((s) => s.ph.dur)),
    hook: HOOK_S,
    payoff: median(samples.map((s) => s.ph.payoff)),
    outro: median(samples.map((s) => s.ph.outro)),
  };
  ph.payoff = clamp(ph.payoff, ph.hook, ph.dur);
  ph.outro = clamp(ph.outro, ph.payoff, ph.dur);
  const bounds = [[0, ph.hook], [ph.hook, ph.payoff], [ph.payoff, ph.outro], [ph.outro, ph.dur]];
  const phases = PHASES.map((name, k) => {
    const [a, b] = bounds[k];
    const start = survivalAt(a, ph, H);
    const end = survivalAt(b, ph, H);
    return {
      name, from: a, to: b, seconds: b - a,
      start, end,
      lost: start - end,                      // share of ALL starting viewers lost in this phase
      lostOfPresent: start > 0 ? 1 - end / start : 0, // share of those who reached it
      perSecond: 1 - Math.exp(-H[k]),         // share of those still watching who leave each second
    };
  });
  const errs = samples.map((s) => Math.abs(expectedWatch(s.ph, H) - s.watch));
  const measuredSkips = samples.filter((s) => s.skip !== null);
  const wsum = measuredSkips.reduce((a, s) => a + s.weight, 0);
  return {
    H,
    ph,
    phases,
    curve: Array.from({ length: Math.ceil(ph.dur / 0.25) + 1 }, (_, i) => {
      const t = Math.min(ph.dur, i * 0.25);
      return { t, s: survivalAt(t, ph, H) };
    }),
    fitErrorS: median(errs),
    measuredSkip: wsum ? measuredSkips.reduce((a, s) => a + s.weight * s.skip, 0) / wsum : null,
    skipReels: measuredSkips.length,
    weakest: weakestLink(phases),
  };
}

// The judged phases are hook, buildup and payoff (the ending is supposed to lose people).
// Rule 1: a hook that loses half or more of the viewers is the weakest link, whatever comes after.
// Rule 2: otherwise, the phase that sheds the largest share of its remaining viewers per second
// (fair across phases of different lengths). Within 15% of each other = a tie.
export function weakestLink(phases) {
  const by = Object.fromEntries(phases.map((p) => [p.name, p]));
  const hook = by.hook;
  if (hook.lost >= 0.5) return { name: 'hook', reason: 'hook-half', tie: null };
  const judged = ['hook', 'buildup', 'payoff'].map((n) => by[n]).filter((p) => p.seconds >= 0.5);
  judged.sort((a, b) => b.perSecond - a.perSecond);
  const [first, second] = judged;
  if (!first) return null;
  // The hook almost always leaks fastest per second on short video; only call it out per-second
  // when it is clearly worse than the rest, otherwise compare buildup with payoff.
  if (first.name === 'hook' && second && first.perSecond < 2 * second.perSecond) {
    const rest = judged.filter((p) => p.name !== 'hook');
    const [a, b] = rest;
    if (!a) return { name: 'hook', reason: 'per-second', tie: null };
    const tie = b && a.perSecond - b.perSecond < 0.15 * a.perSecond ? b.name : null;
    return { name: a.name, reason: 'per-second', tie };
  }
  const tie = second && second.name !== 'hook' && first.perSecond - second.perSecond < 0.15 * first.perSecond ? second.name : null;
  return { name: first.name, reason: 'per-second', tie };
}

// rows: dashboard rows (need id, label, views, avgWatchS, skipRate, beats, group).
export function retention(rows, { minReels = MIN_REELS } = {}) {
  const samples = rows.map(sampleOf).filter(Boolean);
  const withWatch = rows.filter((r) => typeof r.avgWatchS === 'number' && r.views > 0);
  const base = {
    reels: samples.length,
    withWatch: withWatch.length,
    missingBeats: withWatch.filter((r) => !phasesOf(r.beats)).length,
    replayed: samples.filter((s) => s.replayed).length,
    minReels,
  };
  if (samples.length < minReels) return { ...base, ready: false };
  const all = describe(samples);
  // Per group (the pillar in the reel title) when a group has enough reels of its own.
  const groups = {};
  for (const s of samples) if (s.group) (groups[s.group] ||= []).push(s);
  const byGroup = Object.entries(groups)
    .filter(([, list]) => list.length >= minReels)
    .map(([group, list]) => {
      const d = describe(list);
      return { group, reels: list.length, phases: d.phases, weakest: d.weakest, avgWatchS: median(list.map((s) => s.watch)) };
    })
    .sort((a, b) => b.reels - a.reels);
  return { ...base, ready: true, solid: samples.length >= SOLID_REELS, ...all, byGroup };
}

// "ריל H14 · שוכרים חכם · מצלמים ביום הכניסה" -> "שוכרים חכם". Other titles: no group.
export function groupOf(title) {
  if (typeof title !== 'string') return null;
  const parts = title.split('·').map((s) => s.trim()).filter(Boolean);
  return /^ריל\s*H\d+/i.test(parts[0] || '') && parts.length >= 3 ? parts[1] : null;
}
