/* ==========================================================================
   Resignation Rejected.exe — behaviour
   You don't need to edit this file. All text, names, photos and the letter
   live in config.js.
   ========================================================================== */
(() => {
  'use strict';

  const CFG = window.FAREWELL_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CAN_HOVER = window.matchMedia('(hover: hover)').matches;
  const SPEED = REDUCED ? 0.35 : 1;
  const CANCEL = Symbol('cancel');
  const isNarrow = () => window.innerWidth <= 860;

  const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), CFG);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const restartAnim = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
  const centerOf = (node, e) => {
    if (e && e.clientX) return { x: e.clientX, y: e.clientY };
    const r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const scrollTop = () => {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (_) { window.scrollTo(0, 0); }
  };
  const scrollToEl = (node, block = 'start') => {
    node.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block });
  };

  /* ------------------------------------------------------------------------
     Sequences: timed animation chains that can be skipped or cancelled
     ------------------------------------------------------------------------ */
  let currentSeq = null;
  function newSeq() {
    if (currentSeq) currentSeq.cancel();
    let skipped = false, cancelled = false;
    const timers = new Set();
    const seq = {
      get skipped() { return skipped; },
      wait(ms) {
        if (cancelled) return Promise.reject(CANCEL);
        if (skipped) return Promise.resolve();
        return new Promise((res, rej) => {
          const t = { res, rej };
          t.id = setTimeout(() => { timers.delete(t); cancelled ? rej(CANCEL) : res(); }, ms * SPEED);
          timers.add(t);
        });
      },
      tween(from, to, ms, cb) {
        if (cancelled) return Promise.reject(CANCEL);
        if (skipped || REDUCED) { cb(to); return Promise.resolve(); }
        return new Promise((res, rej) => {
          const t0 = performance.now();
          const tick = (now) => {
            if (cancelled) return rej(CANCEL);
            if (skipped) { cb(to); return res(); }
            const p = Math.min(1, (now - t0) / ms);
            const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            cb(from + (to - from) * e);
            p < 1 ? requestAnimationFrame(tick) : res();
          };
          requestAnimationFrame(tick);
        });
      },
      skip() { skipped = true; timers.forEach((t) => { clearTimeout(t.id); t.res(); }); timers.clear(); },
      cancel() { cancelled = true; timers.forEach((t) => { clearTimeout(t.id); t.rej(CANCEL); }); timers.clear(); }
    };
    currentSeq = seq;
    return seq;
  }
  const run = (fn) => fn().catch((e) => { if (e !== CANCEL) console.error(e); });

  /* ------------------------------------------------------------------------
     Sound — tiny synthesized effects (no audio files needed)
     ------------------------------------------------------------------------ */
  const SND = {
    ctx: null, master: null, noiseBuf: null, sfxOn: true,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.55;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }
  };

  function tone({ freq = 440, to = 0, type = 'sine', dur = 0.2, vol = 0.2, delay = 0, attack = 0.008 }) {
    if (!SND.sfxOn) return;
    const ctx = SND.ensure(); if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(SND.master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function noise({ dur = 0.3, vol = 0.2, delay = 0, freq = 1200, to = 0, type = 'lowpass', q = 1 }) {
    if (!SND.sfxOn) return;
    const ctx = SND.ensure(); if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource(); src.buffer = SND.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.05, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(SND.master);
    src.start(t); src.stop(t + dur + 0.05);
  }
  const sfx = {
    pop: () => tone({ freq: 480, to: 900, dur: 0.13, vol: 0.16 }),
    tick: () => tone({ freq: 1400, dur: 0.05, vol: 0.04, type: 'triangle' }),
    ding: () => { tone({ freq: 1046, dur: 0.6, vol: 0.1 }); tone({ freq: 1568, dur: 0.6, vol: 0.06, delay: 0.09 }); },
    whoosh: () => noise({ dur: 0.7, vol: 0.09, freq: 300, to: 2600, type: 'bandpass', q: 0.8 }),
    paper: () => noise({ dur: 0.45, vol: 0.08, freq: 2400, to: 5000, type: 'highpass' }),
    stamp: () => { tone({ freq: 150, to: 42, dur: 0.38, vol: 0.55 }); noise({ dur: 0.14, vol: 0.32, freq: 900, type: 'lowpass' }); },
    warn: () => { tone({ freq: 700, to: 560, dur: 0.15, vol: 0.06, type: 'square' }); tone({ freq: 700, to: 560, dur: 0.15, vol: 0.06, type: 'square', delay: 0.2 }); },
    chime: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, dur: 1.1, vol: 0.09, delay: i * 0.09 })),
    sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone({ freq: f, dur: 0.4, vol: 0.04, delay: i * 0.06 })),
    sob: () => [523, 494, 466].forEach((f, i) => tone({ freq: f, to: f * 0.94, dur: 0.28, vol: 0.06, type: 'triangle', delay: i * 0.2 }))
  };

  /* Background music: an MP3 from config, or a soft built-in music box */
  const Music = {
    on: false, audio: null, gain: null, timer: null, next: 0, step: 0, userOff: false,
    BEAT: 0.32,
    CHORDS: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]],
    PATTERN: [0, 1, 2, 3, 2, 1, 2, 3],
    start() {
      if (this.on) return;
      this.on = true; syncMusicBtn();
      if (CFG.music) {
        if (!this.audio) {
          this.audio = new window.Audio(CFG.music);
          this.audio.loop = true; this.audio.volume = 0.45;
        }
        this.audio.play().catch(() => { this.audio = null; if (this.on) this.startBox(); });
        return;
      }
      this.startBox();
    },
    startBox() {
      const ctx = SND.ensure(); if (!ctx) return;
      if (!this.gain) {
        this.gain = ctx.createGain(); this.gain.gain.value = 0;
        const delay = ctx.createDelay(); delay.delayTime.value = this.BEAT * 1.5;
        const fb = ctx.createGain(); fb.gain.value = 0.3;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
        const wet = ctx.createGain(); wet.gain.value = 0.35;
        this.gain.connect(ctx.destination);
        this.gain.connect(delay); delay.connect(lp).connect(fb).connect(delay); lp.connect(wet).connect(ctx.destination);
      }
      const t = ctx.currentTime;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(this.gain.gain.value, t);
      this.gain.gain.linearRampToValueAtTime(0.5, t + 2.5);
      this.next = t + 0.1;
      clearInterval(this.timer);
      this.timer = setInterval(() => this.schedule(), 60);
    },
    schedule() {
      const ctx = SND.ctx;
      while (this.next < ctx.currentTime + 0.3) {
        const chord = this.CHORDS[Math.floor(this.step / 8) % this.CHORDS.length];
        const pos = this.step % 8;
        this.note(chord[this.PATTERN[pos]] + 12, this.next, 0.07, 1.8);
        if (pos === 0) this.note(chord[0] - 12, this.next, 0.07, 2.6);
        if (pos === 4 && this.step % 32 >= 16) this.note(chord[3] + 24, this.next, 0.025, 1.2);
        this.next += this.BEAT; this.step++;
      }
    },
    note(midi, t, vol, dur) {
      const ctx = SND.ctx, f = 440 * Math.pow(2, (midi - 69) / 12);
      [[f, vol, 'sine'], [f * 2, vol * 0.25, 'sine'], [f * 4, vol * 0.06, 'triangle']].forEach(([fr, v, type]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = fr;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(this.gain); o.start(t); o.stop(t + dur + 0.05);
      });
    },
    stop() {
      if (!this.on) return;
      this.on = false; syncMusicBtn();
      if (this.audio) this.audio.pause();
      if (this.gain && SND.ctx) {
        const t = SND.ctx.currentTime;
        this.gain.gain.cancelScheduledValues(t);
        this.gain.gain.setValueAtTime(this.gain.gain.value, t);
        this.gain.gain.linearRampToValueAtTime(0, t + 1);
        const timer = this.timer;
        setTimeout(() => { if (!this.on) clearInterval(timer); }, 1100);
      }
    }
  };

  const soundBtn = $('#soundBtn'), musicBtn = $('#musicBtn');
  function syncMusicBtn() {
    musicBtn.setAttribute('aria-pressed', String(Music.on));
    musicBtn.title = Music.on ? 'Pause music' : 'Play music';
  }
  soundBtn.addEventListener('click', () => {
    SND.sfxOn = !SND.sfxOn;
    soundBtn.setAttribute('aria-pressed', String(SND.sfxOn));
    soundBtn.title = SND.sfxOn ? 'Mute sound effects' : 'Turn sound effects on';
    toast(SND.sfxOn ? '🔊' : '🔇', 'Sound', SND.sfxOn ? 'Sound effects on' : 'Sound effects muted', 1800);
    sfx.pop();
  });
  musicBtn.addEventListener('click', () => {
    if (Music.on) { Music.stop(); Music.userOff = true; toast('🎵', 'Music', 'Music paused', 1600); }
    else { Music.userOff = false; Music.start(); toast('🎵', 'Music', 'Soft music on', 1600); }
  });

  /* ------------------------------------------------------------------------
     Fill text from config.js
     ------------------------------------------------------------------------ */
  function fillText() {
    $$('[data-cfg]').forEach((n) => {
      const v = get(n.dataset.cfg);
      if (typeof v !== 'string') return;
      n.textContent = v;
      if (n.tagName === 'P' && !v.trim()) n.hidden = true;
    });
    $$('[data-name]').forEach((n) => { const v = CFG[n.dataset.name]; if (v) n.textContent = v; });
    $('#docDate').textContent = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function splitChars(node) {
    const text = node.textContent;
    const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
    const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));
    node.textContent = '';
    node.appendChild(el('span', 'sr-only', text));
    let i = 0;
    text.split(' ').forEach((w, wi, arr) => {
      const word = el('span', 'word'); word.setAttribute('aria-hidden', 'true');
      graphemes(w).forEach((g) => { const c = el('span', 'ch', g); c.style.setProperty('--i', i++); word.appendChild(c); });
      node.appendChild(word);
      if (wi < arr.length - 1) node.appendChild(document.createTextNode(' '));
    });
  }

  /* ------------------------------------------------------------------------
     Toasts, emoji bursts, background particles
     ------------------------------------------------------------------------ */
  const toastHost = $('#toasts');
  function toast(icon, title, text, ms = 3000) {
    const t = el('div', 'toast');
    t.appendChild(el('span', 'toast-icon', icon)).setAttribute('aria-hidden', 'true');
    const body = el('div'); body.appendChild(el('b', null, title)); body.appendChild(document.createTextNode(text));
    t.appendChild(body);
    toastHost.appendChild(t);
    while (toastHost.children.length > 3) toastHost.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
  }

  function burst(x, y, emojis, count = 12) {
    if (REDUCED) return;
    for (let i = 0; i < count; i++) {
      const b = el('span', 'burst', emojis[i % emojis.length]);
      const ang = rand(-Math.PI * 0.95, -Math.PI * 0.05), dist = rand(80, 200);
      b.style.setProperty('--x0', (x - 14) + 'px');
      b.style.setProperty('--y0', (y - 14) + 'px');
      b.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      b.style.setProperty('--rot', rand(-60, 60) + 'deg');
      b.style.fontSize = rand(1.1, 2) + 'rem';
      b.setAttribute('aria-hidden', 'true');
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1200);
    }
  }

  function makeParticles() {
    if (REDUCED) return;
    const host = $('#particles');
    const n = window.innerWidth < 600 ? 14 : 26;
    const glyphs = ['♥', '✦', '♡', '✧', '•', '♥', '✦'];
    const colors = ['rose', 'plum', 'gold', 'white'];
    for (let i = 0; i < n; i++) {
      const p = el('span', 'particle p-' + colors[i % colors.length], glyphs[i % glyphs.length]);
      p.style.setProperty('--x', rand(0, 98) + '%');
      p.style.setProperty('--s', rand(10, 24) + 'px');
      p.style.setProperty('--d', rand(16, 30) + 's');
      p.style.setProperty('--delay', -rand(0, 30) + 's');
      p.style.setProperty('--sway', rand(-70, 70) + 'px');
      p.style.setProperty('--o', rand(0.45, 0.95).toFixed(2));
      host.appendChild(p);
    }
  }

  function shakeApp() {
    if (REDUCED) return;
    const app = $('#app');
    restartAnim(app, 'shake');
    setTimeout(() => app.classList.remove('shake'), 500);
  }

  /* ------------------------------------------------------------------------
     Photos: Polaroids + lightbox
     ------------------------------------------------------------------------ */
  const PHOTOS = Array.isArray(CFG.photos) ? CFG.photos : [];
  const photoById = (id) => PHOTOS.find((p) => p.id === id) || PHOTOS[0] || { label: 'Photo', caption: '' };
  const ROTS = [-4, 3, 2.5, -3, 4, -2];

  function placeholder(photo) {
    const ph = el('span', 'photo-ph');
    const inner = el('span');
    inner.appendChild(el('b', null, '📷'));
    inner.appendChild(document.createTextNode('Add a photo here'));
    inner.appendChild(el('br'));
    inner.appendChild(el('code', null, photo.src || `assets/photos/${photo.id || 'photo'}.jpg`));
    ph.appendChild(inner);
    return ph;
  }

  function makePolaroid(photo, { rot = 0, develop = false, showCaption = false } = {}) {
    const fig = el('figure', 'polaroid' + (develop ? ' develop' : '') + (showCaption ? ' revealed' : ''));
    fig.style.setProperty('--rot', rot + 'deg');

    const btn = el('button', 'polaroid-btn'); btn.type = 'button';
    btn.setAttribute('aria-label', 'Open photo: ' + (photo.caption || photo.alt || photo.label || 'memory'));
    const frame = el('span', 'polaroid-img');
    const usePh = () => { frame.replaceChildren(placeholder(photo)); fig.dataset.ph = '1'; };
    if (photo.src) {
      const img = new Image();
      img.alt = photo.alt || ''; img.decoding = 'async';
      img.onerror = usePh;
      img.src = photo.src;
      frame.appendChild(img);
    } else usePh();
    btn.appendChild(frame);

    const strip = el('figcaption', 'polaroid-strip');
    strip.appendChild(el('span', 'polaroid-label', photo.label || ''));
    strip.appendChild(el('span', 'polaroid-cap', photo.caption || ''));
    const hint = el('span', 'polaroid-hint', '⤢'); hint.setAttribute('aria-hidden', 'true');
    const tape = el('span', 'tape'); tape.setAttribute('aria-hidden', 'true');
    fig.append(tape, btn, strip, hint);

    btn.addEventListener('click', () => {
      if (!CAN_HOVER && !fig.classList.contains('revealed')) { fig.classList.add('revealed'); sfx.pop(); return; }
      if (fig.dataset.ph) { toast('📷', 'Empty photo slot', 'Add this photo in config.js (see README).'); return; }
      openLightbox(photo, btn);
    });
    return fig;
  }

  const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbCap = $('#lightboxCap'), lbClose = $('#lightboxClose');
  let lbReturn = null;
  function openLightbox(photo, from) {
    lbImg.src = photo.src; lbImg.alt = photo.alt || '';
    lbCap.textContent = photo.caption || '';
    lb.hidden = false; lbReturn = from;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
    sfx.pop();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true; document.body.style.overflow = '';
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  }
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
  });

  /* ------------------------------------------------------------------------
     Confetti & hearts (canvas)
     ------------------------------------------------------------------------ */
  const Confetti = (() => {
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    let parts = [], raf = 0, until = 0;
    const COLORS = ['#D9789A', '#B4507A', '#D8B77A', '#E9DDFB', '#F8DCE6', '#F2C66D', '#C9A7EB'];
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.045; p.vx *= 0.995; p.vy *= 0.995;
        p.x += p.vx + Math.sin((now / 600) + p.phase) * 0.6; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        if (p.heart) { ctx.font = `${p.s * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♥', 0, 0); }
        else { ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        ctx.restore();
      });
      parts = parts.filter((p) => p.y < innerHeight + 40);
      if (now < until && parts.length < 30) spawn(6, true);
      if (parts.length) raf = requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, innerWidth, innerHeight); raf = 0; }
    }
    function spawn(n, fromTop) {
      for (let i = 0; i < n; i++) {
        const heart = Math.random() < 0.45;
        parts.push({
          x: fromTop ? rand(0, innerWidth) : innerWidth / 2 + rand(-60, 60),
          y: fromTop ? rand(-60, -10) : innerHeight * 0.55,
          vx: fromTop ? rand(-1, 1) : rand(-7, 7), vy: fromTop ? rand(1, 3) : rand(-13, -6),
          r: rand(0, 6), vr: rand(-0.08, 0.08), s: heart ? rand(6, 11) : rand(7, 12),
          c: COLORS[(Math.random() * COLORS.length) | 0], a: rand(0.75, 1), heart, phase: rand(0, 6)
        });
      }
    }
    function fire({ burstCount = 90, rain = 3500 } = {}) {
      if (REDUCED) return;
      size();
      spawn(window.innerWidth < 600 ? Math.round(burstCount * 0.6) : burstCount, false);
      until = performance.now() + rain;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function stop() { parts = []; until = 0; }
    window.addEventListener('resize', () => { if (raf) size(); });
    return { fire, stop };
  })();

  /* ------------------------------------------------------------------------
     Screen navigation
     ------------------------------------------------------------------------ */
  const screens = $$('.screen');
  const veil = $('#veil'), veilIcon = $('#veilIcon'), veilText = $('#veilText');
  const VEILS = [
    { icon: '✨', text: '' },
    { icon: '🔍', text: 'Opening friendship records…' },
    { icon: '⚖️', text: 'The committee has decided…' },
    { icon: '💌', text: 'One last thing…', warm: true, hold: 700 }
  ];
  let navigating = false;

  function updateSteps(i) {
    $$('#steps li').forEach((li, j) => {
      li.classList.toggle('is-done', j < i);
      li.classList.toggle('is-current', j === i);
    });
  }

  function showScreen(i) {
    screens.forEach((s, j) => {
      const on = j === i;
      s.hidden = !on; s.inert = !on;
      s.classList.toggle('is-active', on);
      s.classList.remove('fast');
    });
    scrollTop();
    updateSteps(i);
  }

  async function goTo(i, v = VEILS[i]) {
    if (navigating) return;
    navigating = true;
    if (currentSeq) currentSeq.cancel();
    veilIcon.textContent = v.icon; veilText.textContent = v.text || '';
    veil.className = 'veil' + (v.warm ? ' warm-veil' : '');
    void veil.offsetWidth;
    veil.classList.add('is-in');
    sfx.whoosh();
    await sleep(REDUCED ? 120 : 780);
    showScreen(i);
    ENTER[i]();
    await sleep(REDUCED ? 80 : (v.hold || 420));
    veil.classList.add('is-out');
    const h = screens[i].querySelector('[tabindex="-1"]');
    if (h) h.focus({ preventScroll: true });
    await sleep(720);
    veil.className = 'veil';
    navigating = false;
  }

  function skipCurrent(screen) {
    if (currentSeq) currentSeq.skip();
    screen.classList.add('fast');
    setTimeout(() => screen.classList.remove('fast'), 1600);
  }

  /* ------------------------------------------------------------------------
     SLIDE 1
     ------------------------------------------------------------------------ */
  const s1 = {
    title: $('#s1-title [data-split]'),
    steps: $$('#s1 .step-in'), slot: $('#s1reaction'), next: $('#s1next'),
    b1: $('#s1b1'), b2: $('#s1b2')
  };

  function enterS1() {
    document.body.classList.remove('warm');
    const seq = newSeq();
    s1.title.classList.remove('split-go');
    s1.steps.forEach((n) => n.classList.remove('in'));
    s1.slot.replaceChildren();
    s1.next.hidden = true; s1.next.classList.remove('btn-pop');
    s1.b1.classList.remove('is-picked'); s1.b2.classList.remove('is-picked');

    run(async () => {
      await seq.wait(500); restartAnim(s1.title, 'split-go'); sfx.pop();
      await seq.wait(1100); s1.steps[0].classList.add('in');
      await seq.wait(800); s1.steps[1].classList.add('in');
      await seq.wait(700); s1.steps[2].classList.add('in');
    });
  }

  function s1React(which, e) {
    const btn = which === 1 ? s1.b1 : s1.b2;
    s1.b1.classList.toggle('is-picked', which === 1);
    s1.b2.classList.toggle('is-picked', which === 2);
    const box = el('div', 'reaction glass' + (which === 2 ? ' is-drama' : ''));
    box.appendChild(el('span', 'reaction-emoji', which === 1 ? '🔔' : '😭')).setAttribute('aria-hidden', 'true');
    const txt = el('div');
    txt.appendChild(el('span', 'reaction-kicker', which === 1 ? 'System notification' : 'Excuse me??'));
    txt.appendChild(el('p', 'reaction-text', which === 1 ? CFG.slide1.button1Reply : CFG.slide1.button2Reply));
    if (which === 1) {
      const st = el('span', 'reaction-status');
      const dots = el('span', 'dots-load'); dots.innerHTML = '<i></i><i></i><i></i>';
      st.append(dots, document.createTextNode('Friendship approval: pending… indefinitely'));
      txt.appendChild(st);
    }
    box.appendChild(txt);
    s1.slot.replaceChildren(box);

    const { x, y } = centerOf(btn, e);
    if (which === 1) { sfx.ding(); burst(x, y, ['📄', '😎', '✨', '💼'], 12); }
    else { sfx.sob(); burst(x, y, ['😭', '😤', '💔', '😂'], 14); shakeApp(); }

    if (s1.next.hidden) {
      setTimeout(() => {
        s1.next.hidden = false; restartAnim(s1.next, 'btn-pop'); sfx.sparkle();
        if (isNarrow()) scrollToEl(s1.next, 'center');
      }, REDUCED ? 0 : 1000);
    }
  }
  s1.b1.addEventListener('click', (e) => s1React(1, e));
  s1.b2.addEventListener('click', (e) => s1React(2, e));
  s1.next.addEventListener('click', () => goTo(1));

  /* ------------------------------------------------------------------------
     SLIDE 2
     ------------------------------------------------------------------------ */
  const s2 = {
    screen: $('#s2'), fill: $('#progFill'), pct: $('#progPct'), bar: $('#progBar'), label: $('#progLabel'),
    log: $('#scanLog'), result: $('#scanResult'), next: $('#s2next'), skip: $('#s2skip'),
    board: $('#polaroids'), empty: $('#evidenceEmpty'), scanner: $('#s2 .scanner')
  };
  const setPct = (v) => {
    s2.fill.style.width = v + '%';
    s2.pct.textContent = Math.round(v) + '%';
    s2.bar.setAttribute('aria-valuenow', String(Math.round(v)));
  };

  function logItem(pct, text) {
    const li = el('li', 'log-item');
    li.appendChild(el('span', 'log-pct', pct + '%'));
    li.appendChild(el('span', 'log-text', text));
    const r = el('span', 'log-result wait', 'scanning…');
    li.appendChild(r);
    s2.log.appendChild(li);
    return r;
  }
  function setResult(r, text, tone) {
    r.className = 'log-result tone-' + (tone || 'funny');
    r.textContent = text;
    void r.offsetWidth; r.classList.add('in');
  }

  function enterS2() {
    document.body.classList.remove('warm');
    const seq = newSeq();
    setPct(0);
    s2.label.textContent = 'Initializing scanner…';
    s2.log.replaceChildren();
    s2.result.hidden = true;
    s2.next.hidden = true; s2.next.classList.remove('btn-pop');
    s2.skip.hidden = false;
    s2.scanner.classList.remove('is-done'); s2.fill.classList.remove('is-done');
    s2.board.replaceChildren(s2.empty); s2.empty.hidden = false;

    const cards = PHOTOS.map((p, i) => makePolaroid(p, { rot: ROTS[i % ROTS.length] }));
    const steps = (CFG.slide2 && CFG.slide2.steps) || [];
    let shown = 0;
    const reveal = (n) => {
      while (shown < Math.min(n, cards.length)) {
        s2.empty.hidden = true;
        const c = cards[shown++];
        c.classList.add('drop-in');
        s2.board.appendChild(c);
        sfx.paper();
      }
    };

    run(async () => {
      await seq.wait(700);
      let pct = 0;
      for (let k = 0; k < steps.length; k++) {
        const st = steps[k];
        s2.label.textContent = st.text;
        const r = logItem(st.at, st.text);
        sfx.tick();
        await seq.tween(pct, st.at, 1300, setPct); pct = st.at;
        await seq.wait(350);
        setResult(r, st.result, st.tone);
        if (st.tone === 'critical') { sfx.warn(); shakeApp(); }
        else if (st.tone === 'denied') sfx.stamp();
        else sfx.pop();
        reveal(Math.ceil(cards.length * (k + 1) / (steps.length + 1)));
        await seq.wait(1250);
      }
      s2.label.textContent = 'Compiling verdict…';
      await seq.tween(pct, 100, 1000, setPct);
      s2.label.textContent = 'Scan complete';
      s2.scanner.classList.add('is-done'); s2.fill.classList.add('is-done');
      const r = logItem(100, CFG.slide2.completeText);
      setResult(r, 'Done ✅', 'done');
      reveal(cards.length);
      sfx.chime();
      await seq.wait(800);
      s2.skip.hidden = true;
      s2.result.hidden = false; sfx.warn();
      if (isNarrow()) scrollToEl(s2.result, 'center');
      await seq.wait(1000);
      s2.next.hidden = false; restartAnim(s2.next, 'btn-pop');
    });
  }
  s2.skip.addEventListener('click', () => skipCurrent(s2.screen));
  s2.next.addEventListener('click', () => goTo(2));

  /* ------------------------------------------------------------------------
     SLIDE 3
     ------------------------------------------------------------------------ */
  const s3 = {
    screen: $('#s3'), stageA: $('#stageA'), stageB: $('#stageB'), doc: $('#doc'),
    row1: $('#row1'), row2: $('#row2'), stamp1: $('#stamp1'), stamp2: $('#stamp2'),
    v1: $('#s3-title'), v2: $('#verdict2'), msg: $('#verdictMsg'), accept: $('#acceptBtn'), skip: $('#s3skip'),
    fav: $('#favPhoto'), line1: $('#s3 .card-line1'), line2: $('#s3 .card-line2'), next: $('#s3next')
  };

  function buildVerdict2() {
    const text = (CFG.slide3 && CFG.slide3.heading2) || '';
    s3.v2.replaceChildren();
    text.split(/(DENIED\.?)/).forEach((part) => {
      if (!part) return;
      s3.v2.appendChild(/^DENIED/.test(part) ? el('span', 'denied', part) : document.createTextNode(part));
    });
  }

  function enterS3() {
    document.body.classList.remove('warm');
    const seq = newSeq();
    s3.stageA.hidden = false; s3.stageA.classList.remove('leaving');
    s3.stageB.hidden = true;
    s3.doc.classList.remove('fold');
    s3.doc.style.animation = 'none'; void s3.doc.offsetWidth; s3.doc.style.animation = '';
    [s3.row1, s3.row2, s3.v1, s3.v2, s3.line1, s3.line2].forEach((n) => n.classList.remove('in'));
    [s3.stamp1, s3.stamp2].forEach((n) => n.classList.remove('slam'));
    s3.msg.replaceChildren();
    s3.accept.hidden = true; s3.accept.classList.remove('btn-pop');
    s3.next.hidden = true; s3.next.classList.remove('btn-pop');
    s3.skip.hidden = false;
    buildVerdict2();

    run(async () => {
      await seq.wait(1000);
      s3.row1.classList.add('in');
      await seq.wait(600);
      s3.stamp1.classList.add('slam'); sfx.stamp();
      await seq.wait(1200);
      s3.row2.classList.add('in');
      await seq.wait(800);
      s3.stamp2.classList.add('slam'); sfx.stamp(); shakeApp();
      if (!seq.skipped) { const { x, y } = centerOf(s3.stamp2); burst(x, y, ['❤️', '🚫', '💕', '🙅'], 10); }
      await seq.wait(1200);
      if (isNarrow() && !seq.skipped) scrollToEl(s3.v1, 'start');
      s3.v1.classList.add('in'); sfx.pop();
      await seq.wait(1000);
      s3.v2.classList.add('in');
      await seq.wait(1500);
      const lines = (CFG.slide3 && CFG.slide3.messageLines) || [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cls = i === lines.length - 1 ? 'big' : /\.\.\.$|…$/.test(line) ? 'pause' : '';
        s3.msg.appendChild(el('p', cls, line));
        sfx.tick();
        await seq.wait(cls === 'pause' ? 1300 : 750);
      }
      if (lines.length) sfx.sparkle();
      await seq.wait(500);
      s3.skip.hidden = true;
      s3.accept.hidden = false; restartAnim(s3.accept, 'btn-pop');
    });
  }

  function acceptFate(e) {
    const seq = newSeq();
    s3.screen.classList.remove('fast');
    const { x, y } = centerOf(s3.accept, e);
    sfx.chime(); burst(x, y, ['❤️', '💕', '✨', '🥹'], 14);
    run(async () => {
      s3.accept.hidden = true;
      s3.stageA.classList.add('leaving');
      s3.doc.classList.add('fold');
      document.body.classList.add('warm');
      await seq.wait(1150);
      s3.stageA.hidden = true;
      s3.fav.replaceChildren(makePolaroid(photoById(CFG.favoritePhoto), { rot: -2.5, develop: true, showCaption: true }));
      s3.stageB.hidden = false;
      scrollTop();
      sfx.paper();
      await seq.wait(1700);
      s3.line1.classList.add('in');
      await seq.wait(2300);
      s3.line2.classList.add('in'); sfx.sparkle();
      await seq.wait(1600);
      s3.next.hidden = false; restartAnim(s3.next, 'btn-pop');
      const r = s3.next.getBoundingClientRect();
      if (r.bottom > window.innerHeight) scrollToEl(s3.next, 'center');
    });
  }
  s3.skip.addEventListener('click', () => skipCurrent(s3.screen));
  s3.accept.addEventListener('click', acceptFate);
  s3.next.addEventListener('click', () => goTo(3));

  /* ------------------------------------------------------------------------
     FINAL — envelope & letter
     ------------------------------------------------------------------------ */
  const s4 = {
    stage: $('#envStage'), w1: $('#whisper1'), w2: $('#whisper2'), env: $('#envelope'), open: $('#openLetterBtn'),
    letter: $('#letter'), body: $('#letterBody'), photo: $('#letterPhoto'), finale: $('#finale'),
    title: $('#s4-title'), restart: $('#restartBtn')
  };
  let letterOpened = false, letterIO = null;

  function buildLetter() {
    s4.body.replaceChildren();
    const paras = String(CFG.letter || '').replace(/\r/g, '').trim().split(/\n\s*\n/);
    paras.forEach((t, i) => {
      const txt = t.trim(); if (!txt) return;
      const p = el('p', null, txt);
      if (i === 0 && txt.length < 40 && /,$/.test(txt)) p.className = 'salutation';
      s4.body.appendChild(p);
    });
  }

  function revealLetter() {
    if (letterIO) letterIO.disconnect();
    const items = [...$$('p', s4.body), s4.finale];
    items.forEach((n) => n.classList.remove('in'));
    const onShow = (n) => {
      n.classList.add('in');
      if (n === s4.finale) { Confetti.fire(); sfx.chime(); }
    };
    if (REDUCED || !('IntersectionObserver' in window)) { items.forEach(onShow); return; }
    letterIO = new IntersectionObserver((entries) => {
      entries.filter((en) => en.isIntersecting).forEach((en, k) => {
        letterIO.unobserve(en.target);
        setTimeout(() => onShow(en.target), k * 260);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    items.forEach((n) => letterIO.observe(n));
  }

  function enterS4() {
    document.body.classList.add('warm');
    const seq = newSeq();
    letterOpened = false;
    s4.stage.hidden = false; s4.stage.classList.remove('leaving', 'opening');
    s4.w1.classList.remove('in'); s4.w2.classList.remove('in');
    s4.env.className = 'envelope';
    s4.open.hidden = true; s4.open.classList.remove('btn-pop');
    s4.letter.hidden = true;
    s4.photo.replaceChildren(makePolaroid(photoById(CFG.letterPhoto), { rot: 2, showCaption: true }));
    buildLetter();

    run(async () => {
      await seq.wait(600); s4.w1.classList.add('in');
      await seq.wait(2000); s4.w2.classList.add('in');
      await seq.wait(1600); s4.env.classList.add('in'); sfx.paper();
      await seq.wait(1500); s4.open.hidden = false; restartAnim(s4.open, 'btn-pop');
    });
  }

  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;
    const seq = newSeq();
    s4.open.hidden = true;
    if (!Music.userOff) Music.start();
    sfx.paper(); sfx.sparkle();
    run(async () => {
      s4.env.classList.add('open');
      s4.stage.classList.add('opening');
      await seq.wait(1600);
      s4.stage.classList.add('leaving');
      await seq.wait(850);
      s4.stage.hidden = true;
      s4.letter.hidden = false;
      scrollTop();
      s4.title.focus({ preventScroll: true });
      revealLetter();
    });
  }
  s4.env.addEventListener('click', openLetter);
  s4.open.addEventListener('click', openLetter);
  s4.restart.addEventListener('click', () => {
    Music.stop(); Confetti.stop();
    goTo(0, { icon: '✨', text: 'Rewinding our little journey…', hold: 500 });
  });

  const ENTER = [enterS1, enterS2, enterS3, enterS4];

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    fillText();
    splitChars(s1.title);
    PHOTOS.forEach((p) => { if (p.src) { const i = new Image(); i.src = p.src; } });
    $$('[data-photo-thumb]').forEach((n) => {
      const key = n.dataset.photoThumb;
      const p = PHOTOS.find((x) => x.id === key) || PHOTOS[Number(key)];
      if (p && p.src) n.style.backgroundImage = `url("${p.src}")`;
    });
    makeParticles();
    showScreen(0);
    enterS1();
  }
  boot();
})();
