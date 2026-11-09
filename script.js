/* =========================================================
   Wedding Invitation — script.js
   Leaves · Cover transition · Music · Countdown · RSVP
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =========================================================
     1. FLOATING BOTANICALS
     ========================================================= */
  const LEAF_SHAPES = ['leaf-a', 'leaf-b', 'petal'];
  const LEAF_COLORS = ['#c9a227', '#8fa183', '#b4643f', '#d8b23c', '#a3b394', '#e0b264'];

  let leafRebuildTimer = null;

  function buildLeaves() {
    const layer = $('#leafLayer');
    if (!layer) return;

    layer.innerHTML = '';
    if (reduceMotion.matches) return;         // no motion → no leaves

    const narrow = window.innerWidth < 720;
    const total  = narrow ? 12 : 22;
    const frag   = document.createDocumentFragment();

    for (let i = 0; i < total; i++) {
      const shape = LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)];
      const size  = (narrow ? 12 : 16) + Math.random() * 22;   // px
      const dur   = 14 + Math.random() * 16;                  // 14–30s fall
      const sway  = 3 + Math.random() * 4;                    // 3–7s sway
      const delay = -Math.random() * dur;                     // negative = mid-flight
      const drift = (Math.random() * 2 - 1) * 22;             // ±22vw
      const op    = 0.3 + Math.random() * 0.4;

      const el = document.createElement('span');
      el.className = 'leaf';
      el.style.cssText =
        `--x:${(Math.random() * 100).toFixed(1)}%;` +
        `--size:${size.toFixed(1)}px;` +
        `--dur:${dur.toFixed(1)}s;` +
        `--sway:${sway.toFixed(1)}s;` +
        `--delay:${delay.toFixed(1)}s;` +
        `--drift:${drift.toFixed(1)}vw;` +
        `--op:${op.toFixed(2)};` +
        `--leaf-color:${LEAF_COLORS[i % LEAF_COLORS.length]};`;

      el.innerHTML =
        `<svg viewBox="0 0 40 60" aria-hidden="true" focusable="false">` +
        `<use href="#${shape}"/></svg>`;

      frag.appendChild(el);
    }
    layer.appendChild(frag);
  }

  buildLeaves();

  window.addEventListener('resize', () => {
    clearTimeout(leafRebuildTimer);
    leafRebuildTimer = setTimeout(buildLeaves, 350);
  });

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', buildLeaves);
  }

  /* =========================================================
     2. COVER → INVITATION TRANSITION
     ========================================================= */
  const cover      = $('#cover');
  const invitation = $('#invitation');
  const openBtn    = $('#openBtn');
  const muteBtn    = $('#muteBtn');
  const audio      = $('#bgMusic');

  let opened     = false;
  let fadeTimer  = null;

  function fadeAudioIn() {
    if (!audio) return;
    const target = 0.28;
    audio.volume = 0;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      if (audio.volume >= target - 0.01) {
        audio.volume = target;
        clearInterval(fadeTimer);
        return;
      }
      audio.volume = Math.min(target, audio.volume + 0.02);
    }, 90);
  }

  function startMusic() {
    if (!audio) return;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        fadeAudioIn();
        if (muteBtn) { muteBtn.hidden = false; }
        syncMuteIcon();
      }).catch(() => {
        /* Autoplay blocked → show the mute/play button so user can start manually */
        if (muteBtn) { muteBtn.hidden = false; }
        syncMuteIcon();
      });
    } else if (muteBtn) {
      muteBtn.hidden = false;
      syncMuteIcon();
    }
  }

  function openInvitation() {
    if (opened) return;
    opened = true;

    document.body.classList.remove('is-locked');
    cover.classList.add('is-open');
    cover.setAttribute('aria-hidden', 'true');

    if ('inert' in HTMLElement.prototype) cover.inert = true;

    invitation.classList.add('is-visible');
    invitation.setAttribute('tabindex', '-1');

    startMusic();

    window.setTimeout(() => {
      cover.hidden = true;
      invitation.focus({ preventScroll: true });
    }, 950);
  }

  if (openBtn) openBtn.addEventListener('click', openInvitation);

  /* =========================================================
     3. MUTE / UNMUTE
     ========================================================= */
  function syncMuteIcon() {
    if (!muteBtn || !audio) return;
    const muted = audio.paused || audio.muted;
    muteBtn.classList.toggle('is-muted', muted);
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.setAttribute('aria-label', muted ? 'Play background music' : 'Mute background music');
  }

  if (muteBtn && audio) {
    muteBtn.addEventListener('click', async () => {
      if (audio.paused) {
        audio.muted = false;
        try {
          await audio.play();
          fadeAudioIn();
        } catch (e) { /* ignore */ }
      } else {
        audio.pause();
      }
      syncMuteIcon();
    });

    audio.addEventListener('play',  syncMuteIcon);
    audio.addEventListener('pause', syncMuteIcon);
  }

  /* =========================================================
     4. COUNTDOWN TIMER
     ========================================================= */
  const WEDDING_TS = new Date('2026-02-07T11:11:00+05:30').getTime();

  const cdEls = {
    d: $('#cdDays'),
    h: $('#cdHours'),
    m: $('#cdMinutes'),
    s: $('#cdSeconds')
  };
  const cdPrev = { d: '', h: '', m: '', s: '' };

  const pad = (n) => String(n).padStart(2, '0');

  function setNum(key, value) {
    const el = cdEls[key];
    if (!el) return;

    const v = pad(value);
    if (cdPrev[key] === v) return;

    cdPrev[key] = v;
    el.textContent = v;

    if (!reduceMotion.matches) {
      el.classList.remove('is-tick');
      void el.offsetWidth;          // restart animation
      el.classList.add('is-tick');
    }
  }

  function tickCountdown() {
    const diff = WEDDING_TS - Date.now();

    if (diff <= 0) {
      setNum('d', 0); setNum('h', 0); setNum('m', 0); setNum('s', 0);
      const note = $('#cdNote');
      if (note) note.textContent = 'శుభం! The wedding day is here · 07 Feb 2026';
      return false;
    }

    const total = Math.floor(diff / 1000);
    setNum('d', Math.floor(total / 86400));
    setNum('h', Math.floor((total % 86400) / 3600));
    setNum('m', Math.floor((total % 3600) / 60));
    setNum('s', total % 60);
    return true;
  }

  tickCountdown();
  const cdTimer = setInterval(() => {
    if (!tickCountdown()) clearInterval(cdTimer);
  }, 1000);

  /* =========================================================
     5. RSVP FORM
     ========================================================= */
  const form    = $('#rsvpForm');
  const success = $('#rsvpSuccess');
  const againBtn = $('#rsvpAgain');

  function clearErrors() {
    ['errName', 'errContact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  function validate() {
    let ok = true;
    clearErrors();

    const nameEl    = $('#rsvpName');
    const contactEl = $('#rsvpContact');

    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      const err = $('#errName');
      if (err) err.textContent = 'Please enter your name · దయచేసి పేరు రాయండి';
      nameEl.setAttribute('aria-invalid', 'true');
      ok = false;
    } else {
      nameEl.removeAttribute('aria-invalid');
    }

    const contact = contactEl.value.trim();
    const isPhone = (contact.replace(/\D/g, '').length >= 7);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

    if (!contact || (!isPhone && !isEmail)) {
      const err = $('#errContact');
      if (err) err.textContent = 'Enter a valid phone or email';
      contactEl.setAttribute('aria-invalid', 'true');
      ok = false;
    } else {
