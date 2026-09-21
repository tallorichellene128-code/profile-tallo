// ─── THEME TOGGLE ───────────────────────────────────────────────
const toggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

const saved = localStorage.getItem('theme');
if (saved === 'light') {
  root.setAttribute('data-theme', 'light');
  toggleBtn.textContent = '🌙';
} else {
  toggleBtn.textContent = '☀️';
}

toggleBtn.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  if (isLight) {
    root.removeAttribute('data-theme');
    toggleBtn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
    toggleBtn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
});


// ─── SNAP SCROLL DECK ENGINE ────────────────────────────────────
(function () {
  const deck   = document.getElementById('deck');
  const pages  = Array.from(document.querySelectorAll('.page'));
  const dots   = Array.from(document.querySelectorAll('.dot'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link[data-target]'));
  const contactJump = document.querySelector('.contact-jump');
  const contactSection = document.getElementById('contact');
  const delayClasses = ['delay-0', 'delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5', 'delay-6', 'delay-7', 'delay-8', 'delay-9', 'delay-10'];
  let current  = 0;
  let isAnimating = false;

  // ── Animate content elements when a slide becomes active ──────
  function animatePageIn(page) {
    // Collect animatable children based on the slide type
    const targets = page.querySelectorAll(
      'h1, h2, .body-text p, .split .col, .split li, .slide-label'
    );

    targets.forEach((el, i) => {
      el.classList.add('anim');
      el.classList.remove(...delayClasses);
      el.classList.add(delayClasses[Math.min(i, delayClasses.length - 1)]);
      // Reset first (for re-entry if user scrolls back)
      el.classList.remove('in');
      // Force reflow so the reset takes effect before re-adding
      void el.offsetWidth;
      el.classList.add('in');
    });

    // Hero words are handled by the .is-active CSS class
    page.classList.add('is-active');
  }

  function animatePageOut(page) {
    page.classList.remove('is-active');
    page.querySelectorAll('.anim').forEach(el => el.classList.remove('in'));
  }

  // ── Update active dot indicator ───────────────────────────────
  function setActiveDot(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
    navLinks.forEach((link, i) => {
      link.classList.toggle('is-active', i === index);
    });
    contactJump.classList.remove('is-active');
  }

  // ── Scroll to a specific page index ──────────────────────────
  function goToPage(index) {
    if (index < 0 || index >= pages.length || index === current || isAnimating) return;
    isAnimating = true;

    animatePageOut(pages[current]);
    current = index;

    // Snap-scroll to the target page
    deck.scrollTo({
      top: pages[current].offsetTop,
      behavior: 'smooth'
    });

    setActiveDot(current);

    // Delay animation until scroll lands (~700ms)
    setTimeout(() => {
      animatePageIn(pages[current]);
      isAnimating = false;
    }, 500);
  }

  // ── Dot nav clicks ───────────────────────────────────────────
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToPage(parseInt(dot.dataset.target, 10));
    });
  });

  // ── Top nav clicks ───────────────────────────────────────────
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      goToPage(parseInt(link.dataset.target, 10));
    });
  });

  contactJump.addEventListener('click', () => {
    const isAlreadyOnSkills = current === 2;

    if (!isAlreadyOnSkills) {
      goToPage(2);
    }

    setTimeout(() => {
      navLinks.forEach(link => link.classList.remove('is-active'));
      contactJump.classList.add('is-active');
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }, isAlreadyOnSkills ? 0 : 550);
  });

  // ── Track scroll position via IntersectionObserver ───────────
  // This keeps the dot nav in sync if user scrolls manually
  const ioOptions = { root: deck, threshold: 0.55 };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index, 10);
        if (index !== current) {
          animatePageOut(pages[current]);
          current = index;
          setActiveDot(current);
          animatePageIn(pages[current]);
        }
      }
    });
  }, ioOptions);

  pages.forEach(page => io.observe(page));

  // ── Keyboard navigation ──────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goToPage(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToPage(current - 1);
    }
  });

  // ── Touch swipe support ──────────────────────────────────────
  let touchStartY = 0;
  deck.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  deck.addEventListener('touchend', e => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      goToPage(delta > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  // ── Initial state ────────────────────────────────────────────
  setActiveDot(0);
  // Small delay so fonts/images finish loading before animating
  setTimeout(() => animatePageIn(pages[0]), 200);

})();
