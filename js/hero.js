// Hero: the photograph slowly settles in, the headline rises line by line,
// and the picture leans a few pixels toward the pointer. Nothing else moves.
(() => {
  const gsap = window.gsap;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('top');
  const img = document.getElementById('heroImg');

  // links that aren't wired yet
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-demo]')) e.preventDefault();
  });

  // שבת / בית toggle look (smooth.js does the filtering + scrolling)
  document.querySelectorAll('.seg__item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg__item').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
    });
  });

  if (reduce || !gsap || !hero || !img) return;

  /* ---------- entrance ---------- */
  const tl = gsap.timeline();
  tl.fromTo(img, { scale: 1.12, opacity: 0 }, { scale: 1.03, opacity: 1, duration: 2.8, ease: 'power2.out' }, 0)
    .from('[data-line]', { yPercent: 110, duration: 1.4, ease: 'power4.out', stagger: 0.12 }, 0.6)
    .fromTo('[data-reveal]', { opacity: 0, y: 14, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.08 }, 1.0)
    .fromTo('[data-nav]', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.9);

  /* ---------- the picture leans toward the pointer, and drifts as the page scrolls ---------- */
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width - 0.5;
    target.y = (e.clientY - r.top) / r.height - 0.5;
  });
  hero.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  const frame = img.parentElement;
  const loop = () => {
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;
    const scrolled = Math.min(window.scrollY, hero.offsetHeight);
    frame.style.transform =
      `translate3d(${(-cur.x * 14).toFixed(2)}px, ${(-cur.y * 10 + scrolled * 0.18).toFixed(2)}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
