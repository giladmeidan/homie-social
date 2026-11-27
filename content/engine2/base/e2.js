// homie Engine 2 · shared motion helpers (GSAP).
// Rule for everything here: what is on screen is a function of timeline time only.
// No clocks, no timers, no unseeded random, so every render of a reel is identical.
(function () {
  const FPS = 30;
  const snap = (t) => Math.round(t * FPS) / FPS;

  // Beat grid. g = grid(100); g(5) is the time of beat 5, g.bar(2) the start of bar 2 (0-based),
  // each computed from its index and rounded to a frame (never by adding rounded beats).
  function grid(bpm, perBar = 4) {
    const g = (i) => snap((i * 60) / bpm);
    g.bar = (n) => snap((n * perBar * 60) / bpm);
    g.bpm = bpm;
    g.perBar = perBar;
    return g;
  }

  // Seeded random for anything that needs variation.
  function rng(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- titles: land, then stay dead still ---------- */
  // Words sharpen in one after another, no slide.
  function wordsIn(tl, el, t, o = {}) {
    const sp = SplitText.create(el, { type: "words" });
    tl.fromTo(
      sp.words,
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: o.dur || 0.14, stagger: o.stagger || 0.07, ease: "power2.out" },
      t
    );
    return sp;
  }
  // One hero line lands large and settles (use once per reel, on the payoff).
  function stampIn(tl, el, t, o = {}) {
    tl.fromTo(
      el,
      { opacity: 0, scale: o.from || 1.3, filter: "blur(6px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: o.dur || 0.32, ease: "expo.out" },
      t
    );
  }
  function blurOut(tl, el, t, d = 0.15) {
    tl.to(el, { opacity: 0, filter: "blur(8px)", duration: d, ease: "power2.in" }, t);
  }
  // A chip or pill arriving: grows from slightly small on a long tail.
  function chipIn(tl, el, t, o = {}) {
    tl.fromTo(
      el,
      { opacity: 0, scale: o.from || 0.8, y: o.y == null ? 18 : o.y },
      { opacity: 1, scale: 1, y: 0, duration: o.dur || 0.42, ease: "expo.out" },
      t
    );
  }

  /* ---------- acting: objects with weight ---------- */
  // Quick squash and springy recovery (a nod, a landing, a reaction).
  function squash(tl, el, t, amt = 0.1, d = 0.08) {
    tl.to(el, { scaleY: 1 - amt, scaleX: 1 + amt * 0.75, duration: d, ease: "power2.out" }, t).to(
      el,
      { scaleY: 1, scaleX: 1, duration: 0.34, ease: "elastic.out(1,0.5)" },
      t + d
    );
  }
  // A hop that LANDS exactly at o.land, so the landing can sit on a beat.
  // o: {x (target x), land, air (flight time), height, crouch}
  function hop(tl, el, o) {
    const air = o.air || 0.34;
    const ant = 0.12;
    const c = o.crouch || 0.12;
    const t0 = o.land - air;
    tl.to(el, { scaleY: 1 - c, scaleX: 1 + c * 0.7, duration: ant, ease: "power2.out" }, t0 - ant)
      .to(el, { scaleY: 1.07, scaleX: 0.95, duration: air * 0.35, ease: "power2.out" }, t0)
      .to(el, { x: o.x, duration: air, ease: "power1.inOut" }, t0)
      .to(el, { y: -(o.height || 70), duration: air / 2, ease: "power2.out" }, t0)
      .to(el, { y: 0, duration: air / 2, ease: "power2.in" }, t0 + air / 2)
      .to(el, { scaleY: 1 - c, scaleX: 1 + c * 0.7, duration: 0.07, ease: "power1.out" }, o.land)
      .to(el, { scaleY: 1, scaleX: 1, duration: 0.32, ease: "elastic.out(1,0.5)" }, o.land + 0.07);
  }

  /* ---------- camera with parallax ---------- */
  // layers: [[element, depth]] where depth 1 is the action plane, <1 is behind, >1 in front.
  // Returns move(tl, t, dur, {scale, x, y}, ease).
  function camera(layers, origin) {
    layers.forEach(([el]) => gsap.set(el, { transformOrigin: origin }));
    return (tl, t, d, to, ease) =>
      layers.forEach(([el, depth]) =>
        tl.to(
          el,
          {
            scale: 1 + ((to.scale || 1) - 1) * depth,
            x: (to.x || 0) * depth,
            y: (to.y || 0) * depth,
            duration: d,
            ease: ease || "power2.inOut",
          },
          t
        )
      );
  }

  /* ---------- sound cues and reel facts, declared next to the picture ---------- */
  // cue('thud', t, gain) goes on the same line as the move it belongs to, so picture and sound
  // have one source of truth. publish() writes cues + meta into the page as JSON; the build reads
  // them with a headless Chrome --dump-dom and hands them to the audio builder and the rule checks.
  const CUES = [];
  function cue(kind, t, gain = 1, extra) {
    CUES.push(Object.assign({ t: snap(t), k: kind, v: gain }, extra || {}));
  }
  function publish(meta) {
    const out = { meta, cues: CUES.slice().sort((a, b) => a.t - b.t) };
    const s = document.createElement("script");
    s.type = "application/json";
    s.id = "e2-export";
    s.textContent = JSON.stringify(out);
    document.body.appendChild(s);
    window.E2_EXPORT = out;
  }

  window.E2 = { FPS, snap, grid, rng, wordsIn, stampIn, blurOut, chipIn, squash, hop, camera, cue, publish };
})();
