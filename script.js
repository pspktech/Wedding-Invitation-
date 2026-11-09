/* ============ Floating leaves ============ */
(function () {
  const wrap = document.getElementById('leaves');
  if (!wrap) return;

  // fewer leaves on mobile for smooth performance
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const count = isMobile ? 10 : 14;

  for (let i = 0; i < count; i++) {
    const l = document.createElement('div');
    l.className = 'leaf';
    const size = 9 + Math.random() * 11;
    l.style.left = Math.random() * 100 + 'vw';
    l.style.top = '-20px';
    l.style.width = size + 'px';
    l.style.height = size + 'px';
    l.style.animationDuration = (11 + Math.random() * 13) + 's';
    l.style.animationDelay = (Math.random() * 14) + 's';
    l.style.opacity = 0.22 + Math.random() * 0.3;
    l.style.filter = 'blur(' + (Math.random() * 0.8).toFixed(1) + 'px)';
    wrap.appendChild(l);
  }
})();

/* ============ Open invitation ============ */
(function () {
  const cover   = document.getElementById('cover');
  const main    = document.getElementById('main');
  const openBtn = document.getElementById('openBtn');
  const music   = document.getElementById('bgMusic');
  const muteBtn = document.getElementById('muteBtn');

  if (!openBtn) return;

  let started = false;

  openBtn.addEventListener('click', function () {
    if (started) return;
    started = true;

    // --- Start music ---
    if (music) {
      music.volume = 0;
      const playPromise = music.play();

      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            muteBtn.classList.add('show');
            muteBtn.textContent = '🔊';
            // smooth fade-in to 0.28
            let v = 0;
            const fade = setInterval(function () {
              v += 0.02;
              if (v >= 0.28) { v = 0.28; clearInterval(fade); }
              music.volume = v;
            }, 90);
          })
          .catch(function () {
            // autoplay blocked or file missing
            muteBtn.classList.add('show');
            muteBtn.textContent = '🔇';
          });
      }
    }

    // --- Screen transition ---
    cover.classList.add('hide');
    main.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'auto' });

    // remove cover from DOM flow after transition
    setTimeout(function () {
      cover.style.display = 'none';
    }, 950);
  });

  // --- Mute toggle ---
  if (muteBtn && music) {
    muteBtn.addEventListener('click', function () {
      if (music.paused) {
        music.play().catch(function () {});
        muteBtn.textContent = '🔊';
      } else {
        music.pause();
        muteBtn.textContent = '🔇';
      }
    });
  }
})();

/* ============ Prevent double-tap zoom on iOS ============ */
(function () {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
})();