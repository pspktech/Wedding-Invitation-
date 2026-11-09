/* =========================================================
    Wedding Invitation — script.js (FINAL)
    ========================================================= */
(function () {
  'use strict';

  var YOUR_EMAIL = 'pawankalyanfan110@gmail.com';

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
      PREMIUM APP START + MOTION
      ========================================================= */
  (function setupPremiumStart() {
    var loader = $('#appLoader');
    if (!loader) return;
    function finish() {
      loader.classList.add('is-done');
      setTimeout(function () { loader.hidden = true; }, 900);
    }
    if (document.readyState === 'complete') setTimeout(finish, 520);
    else window.addEventListener('load', function () { setTimeout(finish, 520); }, { once: true });
    setTimeout(finish, 2200);
  })();

  /* =========================================================
      PRIVATE INVITATION ACCESS
      ========================================================= */
  (function setupAccessGate() {
    var APP_PASSCODE = '8374625736';
    var gate = $('#accessGate');
    var form = $('#accessForm');
    var input = $('#accessCode');
    var error = $('#accessError');
    if (!gate || !form || !input) return;

    function unlock() {
      try { sessionStorage.setItem('madhupotti-unlocked', '1'); } catch (e) {}
      document.body.classList.add('app-unlocked');
      gate.classList.add('is-unlocked');
      setTimeout(openInvitation, 420);
    }

    var alreadyUnlocked = false;
    try { alreadyUnlocked = sessionStorage.getItem('madhupotti-unlocked') === '1'; } catch (e) {}
    if (alreadyUnlocked) unlock();

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var value = input.value.replace(/\D/g, '').slice(0, 10);
      input.value = value;
      if (value === APP_PASSCODE) {
        if (error) error.textContent = '';
        input.removeAttribute('aria-invalid');
        unlock();
      } else {
        if (error) error.textContent = 'That number did not match. Please try again.';
        input.setAttribute('aria-invalid', 'true');
        input.select();
      }
    });
  })();

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
      if (typeof window.__checkForAppUpdate === 'function') {
        setTimeout(window.__checkForAppUpdate, 1200);
      }
    }, 950);
  }

  if (openBtn) openBtn.addEventListener('click', openInvitation);

  (function setupPremiumMotion() {
    var heroImage = $('.section-hero .hero-media img');
    var ticking = false;
    function updateParallax() {
      ticking = false;
      if (!heroImage || reduceMotion.matches || document.hidden) return;
      var y = Math.min(window.scrollY || 0, 360);
      heroImage.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0) scale(1.04)';
    }
    if (heroImage && !reduceMotion.matches) {
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(updateParallax); }
      }, { passive: true });
    }
    document.addEventListener('pointerdown', function (ev) {
      if (reduceMotion.matches) return;
      var target = ev.target.closest('.btn, .screen-nav button, .gift-actions button, .theme-btn');
      if (!target || target.disabled) return;
      var rect = target.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (ev.clientX - rect.left) + 'px';
      ripple.style.top = (ev.clientY - rect.top) + 'px';
      target.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    }, { passive: true });
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', updateParallax);
  })();

  /* =========================================================
      COMPACT INVITATION CONTENT
      ========================================================= */
  (function setupCompactContent() {
    var toggle = $('#moreToggle');
    var panels = $$('.more-content');
    if (!toggle || !panels.length) return;
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      var next = !expanded;
      toggle.setAttribute('aria-expanded', String(next));
      panels.forEach(function (panel) { panel.hidden = !next; });
      if (next) {
        setTimeout(function () { initReveals(); }, 40);
      }
    });
  })();

  /* =========================================================
      SECTION RAIL
      ========================================================= */
  (function setupSectionRail() {
    var rail = $('.section-rail');
    if (!rail) return;
    var toggle = $('#moreToggle');
    var panels = $$('.more-content');
    rail.addEventListener('click', function (ev) {
      var button = ev.target.closest('[data-section-target]');
      if (!button) return;
      var target = document.getElementById(button.getAttribute('data-section-target'));
      if (!target) return;
      var needsExpand = panels.some(function (panel) { return panel.hidden; });
      if (needsExpand && toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        panels.forEach(function (panel) { panel.hidden = false; });
        initReveals();
      }
      var section = target.closest('section') || target;
      window.setTimeout(function () {
        section.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }, 50);
    });
  })();

  /* =========================================================
      MULTI-SCREEN APP NAVIGATION
      ========================================================= */
  (function setupScreens() {
    var nav = $('#screenNav');
    if (!nav || !invitation) return;
    var panels = $$('.more-content');
    var allSections = $$('section, footer', invitation);
    var groups = {
      home: ['.section-hero', '.section--blessing', '.section--families'],
      couple: ['.section--couple'],
      story: ['.section--story', '.section--journey'],
      events: ['.section--muhurtham', '.section--events', '.section--location'],
      gallery: ['.section--gallery'],
      gifts: ['.section--blessings', '.footer']
    };
    var current = 'home';

    function setScreen(name) {
      if (!groups[name]) name = 'home';
      current = name;
      panels.forEach(function (panel) { panel.hidden = false; });
      allSections.forEach(function (section) {
        var visible = groups[name].some(function (selector) { return section.matches(selector); });
        section.classList.toggle('screen-active', visible);
        section.classList.toggle('screen-hidden', !visible);
      });
      nav.querySelectorAll('[data-screen]').forEach(function (button) {
        var active = button.getAttribute('data-screen') === name;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      invitation.setAttribute('data-screen-mode', 'multiple');
      invitation.setAttribute('data-active-screen', name);
      initReveals();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    nav.querySelectorAll('[data-screen]').forEach(function (button) {
      button.addEventListener('click', function () { setScreen(button.getAttribute('data-screen')); });
    });
    nav.hidden = false;
    window.__setInvitationScreen = setScreen;
    setScreen(current);
  })();

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
      DYNAMIC MATERIAL-INSPIRED THEME
      ========================================================= */
  (function setupTheme() {
    var btn = $('#themeBtn');
    var meta = $('#themeColorMeta');
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var saved = null;
    try { saved = localStorage.getItem('madhupotti-theme'); } catch (e) {}

    function apply(theme) {
      var dark = theme === 'midnight';
      document.body.setAttribute('data-theme', dark ? 'midnight' : 'light');
      if (btn) {
        btn.classList.toggle('is-dark', dark);
        btn.setAttribute('aria-pressed', String(dark));
        btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      }
      if (meta) meta.setAttribute('content', dark ? '#14251f' : '#fbf5e9');
    }

    apply(saved || (media.matches ? 'midnight' : 'light'));
    if (btn) {
      btn.addEventListener('click', function () {
        var next = document.body.getAttribute('data-theme') === 'midnight' ? 'light' : 'midnight';
        apply(next);
        try { localStorage.setItem('madhupotti-theme', next); } catch (e) {}
      });
    }
    if (media.addEventListener && !saved) media.addEventListener('change', function (ev) { apply(ev.matches ? 'midnight' : 'light'); });
  })();

  /* =========================================================
      IN-APP APK UPDATE CHECKER
      ========================================================= */
  (function setupAppUpdater() {
    var dialog = $('#updateDialog');
    var versionEl = $('#updateVersion');
    var notesEl = $('#updateNotes');
    var statusEl = $('#updateStatus');
    var laterBtn = $('#updateLater');
    var nowBtn = $('#updateNow');
    var release = null;
    var downloadId = null;
    var statusTimer = null;
    var statusRetries = 0;
    var API = 'https://api.github.com/repos/pspktech/Wedding-Invitation-/releases/latest';

    function plugin() {
      return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AppUpdater;
    }
    function cleanVersion(value) {
      return String(value || '').replace(/^v/i, '').split('-')[0];
    }
    function parts(value) {
      return cleanVersion(value).split('.').map(function (n) { return parseInt(n, 10) || 0; });
    }
    function isNewer(remote, current) {
      var a = parts(remote); var b = parts(current);
      for (var i = 0; i < 3; i += 1) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); }
      return false;
    }
    function setStatus(text) { if (statusEl) statusEl.textContent = text || ''; }
    function fallbackNotes(data) {
      var body = String(data.body || '').replace(/\[?Full Changelog\]?/ig, '').replace(/https?:\/\/\S+/g, '').trim();
      return body ? 'What\'s new\n• ' + body.replace(/\s+/g, ' ') : 'What\'s new\n• Improved invitation experience and performance.';
    }
    function changelog(data, current) {
      var from = 'v' + cleanVersion(current);
      var to = data.tag_name;
      return fetch('https://api.github.com/repos/pspktech/Wedding-Invitation-/compare/' + from + '...' + encodeURIComponent(to), { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (res) { if (!res.ok) throw new Error('compare unavailable'); return res.json(); })
        .then(function (comparison) {
          var commits = (comparison.commits || []).map(function (commit) {
            return (commit.commit && commit.commit.message ? commit.commit.message.split('\n')[0] : '').replace(/\s+/g, ' ').trim();
          }).filter(Boolean).slice(-6);
          return commits.length ? 'What\'s new\n' + commits.map(function (message) { return '• ' + message; }).join('\n') : fallbackNotes(data);
        })
        .catch(function () { return fallbackNotes(data); });
    }
    function currentVersion() {
      var p = plugin();
      if (p && p.getAppVersion) return p.getAppVersion().then(function (result) { return result.version || '1.0.0'; });
      return Promise.resolve('1.0.0');
    }
    function showUpdate(remoteVersion, body) {
      if (!dialog) return;
      if (versionEl) versionEl.textContent = 'Version ' + remoteVersion;
      if (notesEl) notesEl.textContent = body || 'A refreshed version of your wedding invitation is ready.';
      setStatus('');
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    function checkForUpdate() {
      currentVersion().then(function (current) {
        return fetch(API, { headers: { Accept: 'application/vnd.github+json' } }).then(function (res) {
          if (!res.ok) throw new Error('release check failed');
          return res.json().then(function (data) { return { data: data, current: current }; });
        });
      }).then(function (result) {
        var data = result.data;
        if (!data || data.draft || data.prerelease || !isNewer(data.tag_name, result.current)) return;
        var asset = (data.assets || []).find(function (item) { return item.name && item.name.toLowerCase().endsWith('.apk'); });
        if (!asset) return;
        return changelog(data, result.current).then(function (notes) {
          release = { version: cleanVersion(data.tag_name), notes: notes, url: asset.browser_download_url, name: asset.name };
          showUpdate(release.version, release.notes);
        });
      }).catch(function () {});
    }
    function pollDownload() {
      var p = plugin();
      if (!p || !p.getDownloadStatus || downloadId === null) return;
      p.getDownloadStatus({ downloadId: downloadId }).then(function (result) {
        if (result.state === 'successful') {
          setStatus('Download complete. Opening Android installer…');
          return p.installApk({ downloadId: downloadId });
        }
        if (result.state === 'failed') {
          if (statusRetries < 8) {
            statusRetries += 1;
            setStatus('Starting secure download…');
            statusTimer = setTimeout(pollDownload, 900);
            return;
          }
          nowBtn.disabled = false;
          setStatus('Download status unavailable. Please tap Download & Install again.');
          return;
        }
        setStatus('Downloading update' + (result.progress ? ' · ' + result.progress + '%' : '…'));
        statusTimer = setTimeout(pollDownload, 800);
      }).catch(function () {
        if (statusRetries < 8) {
          statusRetries += 1;
          setStatus('Starting secure download…');
          statusTimer = setTimeout(pollDownload, 900);
          return;
        }
        nowBtn.disabled = false;
        setStatus('Download status unavailable. Please tap Download & Install again.');
      });
    }
    if (laterBtn) laterBtn.addEventListener('click', function () { if (dialog) dialog.close(); });
    if (nowBtn) nowBtn.addEventListener('click', function () {
      if (!release) return;
      var p = plugin();
      if (!p || !p.downloadApk) {
        window.open(release.url, '_blank', 'noopener');
        return;
      }
      nowBtn.disabled = true;
      setStatus('Preparing secure APK download…');
      p.downloadApk({ url: release.url, fileName: release.name || ('MadhuPotti-' + release.version + '.apk') }).then(function (result) {
        downloadId = result.downloadId;
        statusRetries = 0;
        setStatus('Download started…');
        statusTimer = setTimeout(pollDownload, 1000);
      }).catch(function (error) {
        nowBtn.disabled = false;
        setStatus(error && error.message ? error.message : 'Could not start the update download.');
      });
    });
    window.__checkForAppUpdate = checkForUpdate;
  })();

})();
