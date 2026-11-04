// Smooth page scrolling (Lenis) + in-page links + hero שבת / בית toggle → collection filter.
(() => {
  const gsap = window.gsap;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    window.azileaLenis = lenis;
    if (gsap) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function goTo(target) {
    if (target == null) return;
    if (lenis) { lenis.scrollTo(target, { duration: 1.6 }); return; }
    const behavior = reduce ? 'auto' : 'smooth';
    if (typeof target === 'number') window.scrollTo({ top: target, behavior });
    else target.scrollIntoView({ behavior });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-demo')) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    goTo(id === 'top' ? 0 : target);
  });

  // the hero toggle filters the collection and glides down to it
  document.querySelectorAll('.seg__item').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      window.azileaFilter?.(i === 0 ? 'shabbat' : 'home');
      goTo(document.getElementById('collection'));
    });
  });
})();
