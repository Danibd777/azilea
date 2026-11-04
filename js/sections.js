// About / contact / footer: scroll reveals, the logo's slow turn, footer icons.
(() => {
  const gsap = window.gsap;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // footer reuses the header's contact icons (one place to update the links)
  const icons = document.querySelector('.nav .pillgroup');
  document.querySelectorAll('[data-icons-copy]').forEach((el) => { if (icons) el.innerHTML = icons.innerHTML; });

  if (!gsap || reduce) return;

  /* ---------- reveals ---------- */
  const items = [...document.querySelectorAll('[data-sec-reveal]')];
  gsap.set(items, { opacity: 0, y: 34, filter: 'blur(8px)' });
  const badge = document.querySelector('[data-badge]');
  if (badge) gsap.set(badge, { opacity: 0, y: 24, scale: 0.9 });

  const io = new IntersectionObserver((entries) => {
    const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    if (!shown.length) return;
    shown.forEach((el) => io.unobserve(el));
    const plain = shown.filter((el) => el !== badge);
    if (plain.length) {
      gsap.to(plain, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power4.out', stagger: 0.09 });
    }
    if (shown.includes(badge)) {
      gsap.to(badge, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.6)', delay: 0.45 });
    }
  }, { threshold: 0.2 });
  [...items, badge].filter(Boolean).forEach((el) => io.observe(el));

  /* ---------- the logo turns slowly as the section passes ---------- */
  const logo = document.getElementById('aboutLogo');
  const about = document.getElementById('about');
  if (logo && about) {
    const setRot = gsap.quickTo(logo, 'rotation', { duration: 0.8, ease: 'power3.out' });
    const setY = gsap.quickTo(logo, 'y', { duration: 0.8, ease: 'power3.out' });
    const onScroll = () => {
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      // -1 when the section enters from below, +1 when it leaves at the top
      const p = Math.max(-1, Math.min(1, ((vh - r.top) / (vh + r.height)) * 2 - 1));
      setRot(p * 14);
      setY(p * -24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
