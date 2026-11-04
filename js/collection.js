// Collection: product data, card rendering, שבת / בית filter and scroll reveal.
// TEMPORARY: product photos are Unsplash images cut out with Higgsfield.
// When Azilea's own photos arrive, cut them out the same way and replace `img`.
(() => {
  // products whose matching photo isn't ready yet stay hidden
  const PRODUCTS = (window.AZILEA_PRODUCTS || []).filter((p) => !p.pending);
  const CAT_LABEL = window.AZILEA_CAT_LABEL || {};
  const ICONS = window.AZILEA_ICONS || {};
  const WA = window.AZILEA_WA || '';

  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const gsap = window.gsap;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  grid.innerHTML = PRODUCTS.map((p) => `
    <article class="card" data-cat="${p.cat}">
      <div class="card__media">
        <span class="chip chip--icon" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[p.icon]}</svg></span>
        <span class="chip chip--label">${CAT_LABEL[p.cat]}</span>
        <img class="card__img" src="${p.img}" alt="${p.title}" loading="lazy" decoding="async" />
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.title}</h3>
        <p class="card__text">${p.text}</p>
        <ul class="card__tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
        <a href="#" class="card__btn" data-demo>
          <svg viewBox="0 0 24 24" aria-hidden="true">${WA}</svg>
          להזמנה
        </a>
      </div>
    </article>`).join('');

  const cards = [...grid.querySelectorAll('.card')];

  /* ---------- filter: הכל / שבת / בית ---------- */
  const filterBtns = document.querySelectorAll('[data-filter]');
  let current = 'all';
  function applyFilter(cat) {
    if (cat === current) return;
    current = cat;
    filterBtns.forEach((b) => {
      const on = b.dataset.filter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const show = cards.filter((c) => cat === 'all' || c.dataset.cat === cat);
    const hide = cards.filter((c) => !show.includes(c));
    if (!gsap || reduce) {
      hide.forEach((c) => { c.hidden = true; });
      show.forEach((c) => { c.hidden = false; });
      return;
    }
    gsap.to(grid, {
      opacity: 0, y: 12, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        hide.forEach((c) => { c.hidden = true; });
        show.forEach((c) => {
          c.hidden = false;
          gsap.set(c, { clearProps: 'opacity,transform,filter' });
          gsap.set(c.querySelector('.card__img'), { clearProps: 'opacity,transform' });
          c.classList.add('is-in');
        });
        gsap.fromTo(grid, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
        gsap.fromTo(show, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 });
      },
    });
  }
  filterBtns.forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  // let the hero's שבת / בית toggle drive the same filter
  window.azileaFilter = applyFilter;

  /* ---------- scroll reveal ---------- */
  if (!gsap || reduce) return;
  const head = document.querySelectorAll('[data-col-reveal]');
  gsap.set(head, { opacity: 0, y: 34, filter: 'blur(8px)' });
  gsap.set(cards, { opacity: 0, y: 70 });
  gsap.set(cards.map((c) => c.querySelector('.card__img')), { scale: 1.14, opacity: 0 });

  const io = new IntersectionObserver((entries) => {
    const heads = entries.filter((e) => e.isIntersecting && e.target.hasAttribute('data-col-reveal')).map((e) => e.target);
    const newCards = entries.filter((e) => e.isIntersecting && e.target.classList.contains('card')).map((e) => e.target);
    [...heads, ...newCards].forEach((el) => io.unobserve(el));
    if (heads.length) {
      gsap.to(heads, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power4.out', stagger: 0.1 });
    }
    if (newCards.length) {
      gsap.to(newCards, { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 });
      gsap.to(newCards.map((c) => c.querySelector('.card__img')), {
        opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'power3.out', stagger: 0.12, delay: 0.2,
        clearProps: 'opacity,transform', // hand the image back to the CSS hover lift
      });
      newCards.forEach((c) => c.classList.add('is-in'));
    }
  }, { threshold: 0.18 });
  [...head, ...cards].forEach((el) => io.observe(el));
})();
