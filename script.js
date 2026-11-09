/* =========================================================
   Wedding Invitation — script.js (Fixed + Scroll Reveal)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var cover      = $('#cover');
  var invitation = $('#invitation');
  var openBtn    = $('#openBtn');
  var muteBtn    = $('#muteBtn');
  var audio      = $('#bgMusic');

  var opened = false;
  var fadeTimer = null;

  /* ---------- Music ---------- */
  function fadeAudioIn() {
    if (!audio) return;
    var target = 0.28;
    audio.volume = 0;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(function () {
      if (audio.volume >= target - 0.01) {
        audio.volume = target;
        clearInterval(fadeTimer);
        return;
      }
      audio.volume = Math.min(target, audio.volume + 0.02);
    }, 90);
  }

  function syncMuteIcon() {
    if (!muteBtn || !audio) return;
    var muted = audio.paused || audio.muted;
    muteBtn.classList.toggle('is-muted', muted);
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.setAttribute('aria-label', muted ? 'Play background music' : 'Mute background music');
  }

  function startMusic() {
    if (!audio) return;
    audio.muted = false;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        fadeAudioIn();
        if (muteBtn) muteBtn.hidden = false;
        syncMuteIcon();
      }).catch(function () {
        if (muteBtn) muteBtn.hidden = false;
        syncMuteIcon();
      });
    } else {
      fadeAudioIn();
      if (muteBtn) muteBtn.hidden = false;
      syncMuteIcon();
    }
  }

  /* ---------- Open invitation ---------- */
  function openInvitation() {
    if (opened) return;
    opened = true;

    try { startMusic(); } catch (e) { /* ignore */ }

    document.body.classList.remove('is-locked');

    if (cover) {
      cover.classList.add('is-open');
      cover.setAttribute('aria-hidden', 'true');
      if ('inert' in HTMLElement.prototype) cover.inert = true;
    }

    if (invitation) {
      invitation.classList.add('is-visible');
    }

    setTimeout(function () {
      if (cover) cover.hidden = true;
      if (invitation) {
        try { invitation.focus({ preventScroll: true }); }
        catch (e) { invitation.focus(); }
      }
      initReveals();
    }, 950);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openInvitation);
  }

  /* ---------- Mute ---------- */
  if (muteBtn && audio) {
    muteBtn.addEventListener('click', function () {
      if (audio.paused) {
        audio.muted = false;
        var p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(function () { fadeAudioIn(); syncMuteIcon(); })
           .catch(function () { syncMuteIcon(); });
        } else {
          fadeAudioIn();
          syncMuteIcon();
        }
      } else {
        audio.pause();
        syncMuteIcon();
      }
    });
    audio.addEventListener('play',  syncMuteIcon);
    audio.addEventListener('pause', syncMuteIcon);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Floating leaves ---------- */
  function buildLeaves() {
    var layer = $('#leafLayer');
    if (!layer) return;
    layer.innerHTML = '';
    if (reduceMotion.matches) return;

    var narrow = window.innerWidth < 720;
    var total  = narrow ? 10 : 18;
    var shapes = ['leaf-a', 'leaf-b', 'petal'];
    var colors = ['#b8935a', '#3d5a40', '#b4643f', '#d4a967', '#6b8a6f', '#d4a967'];
    var frag   = document.createDocumentFragment();

    for (var i = 0; i < total; i++) {
      var shape = shapes[Math.floor(Math.random() * shapes.length)];
      var size  = (narrow ? 12 : 16) + Math.random() * 22;
      var dur   = 14 + Math.random() * 16;
      var sway  = 3 + Math.random() * 4;
      var delay = -Math.random() * dur;
      var drift = (Math.random() * 2 - 1) * 22;
      var op    = 0.28 + Math.random() * 0.35;

      var el = document.createElement('span');
      el.className = 'leaf';
      el.style.cssText =
        '--x:'      + (Math.random() * 100).toFixed(1) + '%;' +
        '--size:'   + size.toFixed(1) + 'px;' +
        '--dur:'    + dur.toFixed(1) + 's;' +
        '--sway:'   + sway.toFixed(1) + 's;' +
        '--delay:'  + delay.toFixed(1) + 's;' +
        '--drift:'  + drift.toFixed(1) + 'vw;' +
        '--op:'     + op.toFixed(2) + ';' +
        '--leaf-color:' + colors[i % colors.length] + ';';
      el.innerHTML = '<svg viewBox="0 0 40 60" aria-hidden="true" focusable="false"><use href="#' + shape + '"/></svg>';
      frag.appendChild(el);
    }
    layer.appendChild(frag);
  }

  try { buildLeaves(); } catch (e) {}

  var leafRebuildTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(leafRebuildTimer);
    leafRebuildTimer = setTimeout(buildLeaves, 350);
  });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', buildLeaves);
  }

  /* ---------- Countdown ---------- */
  var WEDDING_TS = new Date('2026-02-07T11:11:00+05:30').getTime();
  var cdEls  = { d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMinutes'), s: $('#cdSeconds') };
  var cdPrev = { d: '', h: '', m: '', s: '' };

  function pad(n) { return String(n).padStart(2, '0'); }

  function setNum(k, v) {
    var el = cdEls[k];
    if (!el) return;
    var s = pad(v);
    if (cdPrev[k] === s) return;
    cdPrev[k] = s;
    el.textContent = s;
    if (!reduceMotion.matches) {
      el.classList.remove('is-tick');
      void el.offsetWidth;
      el.classList.add('is-tick');
    }
  }

  function tickCountdown() {
    var diff = WEDDING_TS - Date.now();
    if (diff <= 0) {
      setNum('d', 0); setNum('h', 0); setNum('m', 0); setNum('s', 0);
      var note = $('#cdNote');
      if (note) note.textContent = 'శుభం! The wedding day is here · 07 Feb 2026';
      return false;
    }
    var t = Math.floor(diff / 1000);
    setNum('d', Math.floor(t / 86400));
    setNum('h', Math.floor((t % 86400) / 3600));
    setNum('m', Math.floor((t % 3600) / 60));
    setNum('s', t % 60);
    return true;
  }

  tickCountdown();
  var cdTimer = setInterval(function () {
    if (!tickCountdown()) clearInterval(cdTimer);
  }, 1000);

  /* ---------- RSVP ---------- */
  var form     = $('#rsvpForm');
  var success  = $('#rsvpSuccess');
  var againBtn = $('#rsvpAgain');

  function clearErrors() {
    ['errName', 'errContact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  function validateForm() {
    var ok = true;
    clearErrors();
    var nameEl    = $('#rsvpName');
    var contactEl = $('#rsvpContact');
    if (!nameEl || !contactEl) return false;

    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      var e1 = $('#errName');
      if (e1) e1.textContent = 'Please enter your name · దయచేసి పేరు రాయండి';
      nameEl.setAttribute('aria-invalid', 'true');
      ok = false;
    } else {
      nameEl.removeAttribute('aria-invalid');
    }

    var c = contactEl.value.trim();
    var isPhone = c.replace(/\D/g, '').length >= 7;
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    if (!c || (!isPhone && !isEmail)) {
      var e2 = $('#errContact');
      if (e2) e2.textContent = 'Enter a valid phone or email';
      contactEl.setAttribute('aria-invalid', 'true');
      ok = false;
    } else {
      contactEl.removeAttribute('aria-invalid');
    }
    return ok;
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!validateForm()) return;

      var data = {};
      var fd = new FormData(form);
      fd.forEach(function (v, k) { data[k] = v; });
      data.ts = Date.now();

      try { localStorage.setItem('weddingRSVP', JSON.stringify(data)); } catch (e) {}
      try { console.log('[RSVP]', data); } catch (e) {}

      form.hidden = true;
      if (success) success.hidden = false;
    });
  }

  if (againBtn) {
    againBtn.addEventListener('click', function () {
      if (success) success.hidden = true;
      if (form) form.hidden = false;
      var nameEl = $('#rsvpName');
      if (nameEl) nameEl.focus();
    });
  }

  try {
    var saved = localStorage.getItem('weddingRSVP');
    if (saved) {
      var d = JSON.parse(saved);
      if (d.name)    { var n = $('#rsvpName');    if (n) n.value = d.name; }
      if (d.contact) { var c = $('#rsvpContact'); if (c) c.value = d.contact; }
      if (d.guests)  { var g = $('#rsvpGuests');  if (g) g.value = d.guests; }
      if (d.message) { var m = $('#rsvpMsg');     if (m) m.value = d.message; }
    }
  } catch (e) {}

})();
