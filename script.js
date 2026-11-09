/* =========================================================
    Wedding Invitation — script.js (FINAL)
    ========================================================= */
(function () {
  'use strict';

  /* =========================================================
      ⚠️ CONFIG — CHANGE THIS!
      ⚠️ Mee email ikkada pettu. Blessings ikkadiki vastayi.
      ========================================================= */
  var YOUR_EMAIL = 'pawankalyanfan110@gmail.com';
  /* ========================================================= */

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var cover      = $('#cover');
  var invitation = $('#invitation');
  var openBtn    = $('#openBtn');
  var muteBtn    = $('#muteBtn');
  var audio      = $('#bgMusic');

  var opened = false;
  var fadeTimer = null;

  /* =========================================================
      MUSIC
      ========================================================= */
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

  /* =========================================================
      OPEN INVITATION
      ========================================================= */
  function openInvitation() {
    if (opened) return;
    opened = true;

    try { startMusic(); } catch (e) {}

    document.body.classList.remove('is-locked');

    if (cover) {
      cover.classList.add('is-open');
      cover.setAttribute('aria-hidden', 'true');
      if ('inert' in HTMLElement.prototype) cover.inert = true;
    }
    if (invitation) invitation.classList.add('is-visible');

    setTimeout(function () {
      if (cover) cover.hidden = true;
      if (invitation) {
        try { invitation.focus({ preventScroll: true }); }
        catch (e) { invitation.focus(); }
      }
      initReveals();
      if (typeof window.__refreshCountdown === 'function') {
        window.__refreshCountdown();
      }
    }, 950);
  }

  if (openBtn) openBtn.addEventListener('click', openInvitation);

  /* =========================================================
      MUTE
      ========================================================= */
  if (muteBtn && audio) {
    muteBtn.addEventListener('click', function () {
      if (audio.paused) {
        audio.muted = false;
        var p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(function () { fadeAudioIn(); syncMuteIcon(); })
           .catch(function () { syncMuteIcon(); });
        } else { fadeAudioIn(); syncMuteIcon(); }
      } else { audio.pause(); syncMuteIcon(); }
    });
    audio.addEventListener('play', syncMuteIcon);
    audio.addEventListener('pause', syncMuteIcon);
  }

  /* =========================================================
      SCROLL REVEAL
      ========================================================= */
  function initReveals() {
    var els = $$('.reveal');
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
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
      LEAVES
      ========================================================= */
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

  /* =========================================================
      COUNTDOWN
      ========================================================= */
  (function setupCountdown() {
    var WEDDING_TS = Date.parse('2027-02-07T11:11:00+05:30');
    if (isNaN(WEDDING_TS)) {
      WEDDING_TS = new Date(2027, 1, 7, 11, 11, 0).getTime();
      console.warn('[Countdown] ISO parse failed, using fallback');
    }
    console.log('[Countdown] Target:', new Date(WEDDING_TS).toString());
    console.log('[Countdown] Diff (ms):', WEDDING_TS - Date.now());

    var els = {
      d: document.getElementById('cdDays'),
      h: document.getElementById('cdHours'),
      m: document.getElementById('cdMinutes'),
      s: document.getElementById('cdSeconds')
    };

    if (!els.d || !els.h || !els.m || !els.s) {
      console.error('[Countdown] ❌ Missing elements: cdDays / cdHours / cdMinutes / cdSeconds');
      return;
    }
    console.log('[Countdown] ✅ All 4 elements found');

    var prev = { d: '', h: '', m: '', s: '' };
    var timer = null;

    function pad(n) { return String(n).padStart(2, '0'); }

    function setNum(key, value) {
      var el = els[key];
      var str = pad(value);
      if (prev[key] === str) return;
      prev[key] = str;
      el.textContent = str;
      if (!reduceMotion.matches) {
        el.classList.remove('is-tick');
        void el.offsetWidth;
        el.classList.add('is-tick');
      }
    }

    function tick() {
      var diff = WEDDING_TS - Date.now();
      if (diff <= 0) {
        setNum('d', 0); setNum('h', 0); setNum('m', 0); setNum('s', 0);
        var note = document.getElementById('cdNote');
        if (note) note.textContent = 'శుభం! The wedding day is here · 07 Feb 2027';
        return false;
      }
      var total = Math.floor(diff / 1000);
      setNum('d', Math.floor(total / 86400));
      setNum('h', Math.floor((total % 86400) / 3600));
      setNum('m', Math.floor((total % 3600) / 60));
      setNum('s', total % 60);
      return true;
    }

    window.__refreshCountdown = tick;
    var alive = tick();
    console.log('[Countdown] ✅ First tick done, alive:', alive);

    if (alive) {
      timer = setInterval(function () {
        if (!tick()) clearInterval(timer);
      }, 1000);
      console.log('[Countdown] ⏱️  Interval running');
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) tick();
    });
    window.addEventListener('focus', tick);
  })();

  /* =========================================================
      WISHES / BLESSINGS — save + email
      ========================================================= */
  (function setupWishes() {
    var WISHES_KEY = 'weddingWishes';
    var form = $('#wishForm');
    var wall = $('#wishesWall');
    var nameEl = $('#wishName');
    var msgEl  = $('#wishMsg');
    var errN   = $('#errWishName');
    var errM   = $('#errWishMsg');
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    function load() {
      try {
        var raw = localStorage.getItem(WISHES_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function save(list) {
      try { localStorage.setItem(WISHES_KEY, JSON.stringify(list)); } catch (e) {}
    }

    function escapeHTML(str) {
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function timeAgo(ts) {
      var diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    }

    function render() {
      if (!wall) return;
      var list = load();
      if (!list.length) {
        wall.innerHTML = '<p class="wishes-empty">Be the first to leave a blessing for the couple ♥</p>';
        return;
      }
      list.sort(function (a, b) { return b.ts - a.ts; });
      wall.innerHTML = list.map(function (w) {
        return (
          '<figure class="wish-note">' +
            '<p class="wish-note-body">' + escapeHTML(w.message) + '</p>' +
            '<figcaption class="wish-note-author">' +
              '<span class="wish-note-name">— ' + escapeHTML(w.name) + '</span>' +
              '<span class="wish-note-time">' + timeAgo(w.ts) + '</span>' +
            '</figcaption>' +
          '</figure>'
        );
      }).join('');
    }

    function clearErrors() {
      if (errN) errN.textContent = '';
      if (errM) errM.textContent = '';
      if (nameEl) nameEl.removeAttribute('aria-invalid');
      if (msgEl) msgEl.removeAttribute('aria-invalid');
    }

    function validate() {
      var ok = true;
      clearErrors();
      if (!nameEl || !nameEl.value.trim()) {
        if (errN) errN.textContent = 'Please enter your name';
        if (nameEl) nameEl.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      if (!msgEl || !msgEl.value.trim() || msgEl.value.trim().length < 3) {
        if (errM) errM.textContent = 'Please write a blessing (at least 3 characters)';
        if (msgEl) msgEl.setAttribute('aria-invalid', 'true');
        ok = false;
      }
      return ok;
    }

    function saveLocal(name, message) {
      var list = load();
      list.push({ name: name, message: message, ts: Date.now() });
      save(list);
      render();
      if (nameEl) nameEl.value = '';
      if (msgEl) msgEl.value = '';
    }

    function sendToEmail(name, message) {
      var url = 'https://formsubmit.co/ajax/' + encodeURIComponent(YOUR_EMAIL);
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '💌 New Blessing from ' + name + ' — Wedding Invitation',
          Name: name,
          Blessing: message,
          'Received At': new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          _template: 'table',
          _captcha: 'false'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }

    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!validate()) return;

        var name = nameEl.value.trim().slice(0, 40);
        var message = msgEl.value.trim().slice(0, 220);
        var origText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
        }

        sendToEmail(name, message).then(function () {
          saveLocal(name, message);
          if (submitBtn) {
            submitBtn.textContent = '♥ Blessing Sent!';
            setTimeout(function () {
              submitBtn.textContent = origText;
              submitBtn.disabled = false;
            }, 2000);
          }
        }).catch(function (err) {
          console.warn('[Wishes] Email send failed:', err);
          saveLocal(name, message);
          if (submitBtn) {
            submitBtn.textContent = '✓ Saved locally';
            setTimeout(function () {
              submitBtn.textContent = origText;
              submitBtn.disabled = false;
            }, 2500);
          }
        });
      });
    }

    render();
    setInterval(render, 60000);
  })();

  /* =========================================================
      GIFT QR DIALOG — LOCAL IMAGE
      ========================================================= */
  (function setupGiftQr() {
    var btn      = $('#openGiftQr');
    var dialog   = $('#qrDialog');
    var img      = $('#qrImg');
    var closeBtn = $('#qrClose');
    if (!btn || !dialog || !img) return;

    var QR_IMAGE_PATH = 'images/upi-qr.png';

    if (!img.getAttribute('src') || img.getAttribute('src') === '') {
      img.src = QR_IMAGE_PATH;
    }

    img.addEventListener('error', function () {
      var wrap = img.parentElement;
      if (!wrap) return;
      wrap.innerHTML =
        '<p style="padding:24px 18px;font-family:var(--font-sans);font-size:.86rem;line-height:1.6;color:#6b1e2e;text-align:center">' +
        'QR image not found.<br>Please place your QR at <code>images/upi-qr.png</code>' +
        '</p>';
    });

    function openDialog() {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    function closeDialog() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }

    btn.addEventListener('click', openDialog);
    if (closeBtn) closeBtn.addEventListener('click', closeDialog);

    dialog.addEventListener('click', function (ev) {
      if (ev.target === dialog) closeDialog();
    });

    dialog.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeDialog();
    });
  })();

  /* =========================================================
      GALLERY LIGHTBOX
      ========================================================= */
  (function setupGallery() {
    var grid = $('#galleryGrid');
    if (!grid) return;
    var dialog = $('#lightbox');
    var img    = $('#lightboxImg');
    var closeBtn = $('#lightboxClose');
    var prevBtn  = $('#lightboxPrev');
    var nextBtn  = $('#lightboxNext');
    if (!dialog || !img || !closeBtn) return;

    var items = $$('.gallery-item', grid).filter(function (it) {
      return !it.classList.contains('is-empty');
    });
    var current = 0;

    function show(idx) {
      if (!items.length) return;
      current = (idx + items.length) % items.length;
      var src = items[current].querySelector('img');
      if (!src) return;
      img.src = src.currentSrc || src.src;
      img.alt = src.alt || 'Photo';
    }

    grid.addEventListener('click', function (ev) {
      var item = ev.target.closest('.gallery-item');
      if (!item || item.classList.contains('is-empty')) return;
      var idx = items.indexOf(item);
      if (idx === -1) return;
      show(idx);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });

    closeBtn.addEventListener('click', function () { dialog.close(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });

    dialog.addEventListener('click', function (ev) {
      if (ev.target === dialog) dialog.close();
    });
    dialog.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft')  show(current - 1);
      if (ev.key === 'ArrowRight') show(current + 1);
    });
  })();

  /* =========================================================
      SHARE + CALENDAR
      ========================================================= */
  (function setupShareAndCalendar() {
    var shareBtn = $('#shareBtn');
    var calendarBtn = $('#addCalendarBtn');
    var status = $('#shareStatus');
    var shareText = 'You are warmly invited to the wedding of Pudari Madhukar & Budde Thanasri on 07 February 2027 at 11:11 AM in Hajipur, Mancherial.';

    function setStatus(text) {
      if (status) status.textContent = text;
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var shareData = { title: 'Madhukar & Thanasri · Wedding Invitation', text: shareText, url: window.location.href };
        if (navigator.share) {
          navigator.share(shareData).then(function () { setStatus('Invitation shared with love ♥'); }).catch(function () {});
          return;
        }
        var waUrl = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + window.location.href);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setStatus('Opening WhatsApp…');
      });
    }

    if (calendarBtn) {
      calendarBtn.addEventListener('click', function () {
        var ics = [
          'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Madhukar and Thanasri//Wedding Invitation//EN',
          'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:madhukar-thanasri-2027@wedding-invitation',
          'DTSTAMP:20261110T000000Z', 'DTSTART:20270207T054100Z', 'DTEND:20270207T074100Z',
          'SUMMARY:Madhukar & Thanasri — Muhurtham', 'LOCATION:Hajipur, Mancherial, Telangana 504207, India',
          'DESCRIPTION:Wedding muhurtham at 11:11 AM IST.\nMadhukar & Thanasri.', 'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'madhukar-thanasri-wedding.ics';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        setStatus('Calendar invite downloaded ♥');
      });
    }
  })();

  /* =========================================================
      RSVP
      ========================================================= */
  (function setupRsvp() {
    var form = $('#rsvpForm');
    if (!form) return;
    var nameEl = $('#rsvpName');
    var guestsEl = $('#rsvpGuests');
    var responseEl = $('#rsvpResponse');
    var noteEl = $('#rsvpNote');
    var errorEl = $('#errRsvpName');
    var statusEl = $('#rsvpStatus');
    var submitBtn = form.querySelector('button[type="submit"]');

    function showStatus(text) { if (statusEl) statusEl.textContent = text; }
    function saveLocal(rsvp) {
      try {
        var list = JSON.parse(localStorage.getItem('weddingRsvps') || '[]');
        list.push(rsvp);
        localStorage.setItem('weddingRsvps', JSON.stringify(list));
      } catch (e) {}
    }
    function sendRsvp(rsvp) {
      return fetch('https://formsubmit.co/ajax/' + encodeURIComponent(YOUR_EMAIL), {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'RSVP — Madhukar & Thanasri Wedding',
          Name: rsvp.name, Attendance: rsvp.response, Guests: rsvp.guests, Message: rsvp.note || '—',
          'Event Date': '07 February 2027 · 11:11 AM IST', _template: 'table', _captcha: 'false'
        })
      }).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = nameEl.value.trim();
      if (!name) {
        if (errorEl) errorEl.textContent = 'Please enter your name';
        nameEl.setAttribute('aria-invalid', 'true');
        return;
      }
      if (errorEl) errorEl.textContent = '';
      nameEl.removeAttribute('aria-invalid');
      var rsvp = { name: name.slice(0, 40), guests: guestsEl.value, response: responseEl.value, note: noteEl.value.trim().slice(0, 180), ts: Date.now() };
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      sendRsvp(rsvp).then(function () {
        saveLocal(rsvp); form.reset(); showStatus('Thank you — your RSVP has been sent ♥');
      }).catch(function () {
        saveLocal(rsvp); form.reset(); showStatus('Your RSVP is saved on this device. Please contact the family if needed.');
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send RSVP ♥'; }
      });
    });
  })();

})();
