/**
 * nav.ts — Nav & UI Helpers — MODULE_7
 * Header scroll state, hamburger mobile, footer year, anchor scroll
 */
export function initNav(): void {
  /* Header is-scrolled */
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* Hamburger mobile */
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('.nav__mobile-link').forEach(lk => {
      lk.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-label', 'Apri menu');
        document.body.style.overflow = '';
      });
    });
  }

  /* Footer year */
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* Anchor scroll (Lenis-aware) */
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const tgt = document.querySelector(href);
      if (!tgt) return;
      e.preventDefault();
      const h = document.getElementById('site-header')?.offsetHeight ?? 72;
      const top = tgt.getBoundingClientRect().top + window.scrollY - h - 24;
      const lenis = (window as any)._lenis;
      lenis ? lenis.scrollTo(top, { duration: 0.8 }) : window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
