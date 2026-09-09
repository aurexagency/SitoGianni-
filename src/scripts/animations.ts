/**
 * animations.ts — Tutte le animazioni GSAP (ex MODULE_3 + MODULE_12)
 * Hero title split, fade-up, stagger cards, counters, parallax, scroll-logo
 */
import { gsap, ScrollTrigger, SplitText } from './gsap-init';

const REDUCED_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initGSAPAnimations(): void {
  const rm = REDUCED_MOTION();

  /* Hero title (SplitText se disponibile) */
  const heroTitle = document.querySelector<HTMLElement>('[data-gsap="split-chars"]');
  if (heroTitle) {
    if (SplitText && !rm) {
      heroTitle.style.overflow = 'hidden';
      const split = new SplitText(heroTitle, { type: 'chars,words,lines', linesClass: 'split-line' });
      split.lines.forEach((l: HTMLElement) => (l.style.overflow = 'hidden'));
      gsap.from(split.chars, {
        yPercent: 120, opacity: 0, rotateX: -60,
        transformOrigin: 'center bottom',
        duration: 0.9, stagger: { amount: 0.5 }, ease: 'power3.out', delay: 0.3,
      });
    } else {
      gsap.from(heroTitle, { y: rm ? 0 : 48, opacity: 0, duration: rm ? 0.01 : 1.2, delay: 0.3, ease: 'power3.out' });
    }
  }

  /* Fade-up generici */
  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: rm ? 0 : 48 },
      {
        opacity: 1, y: 0,
        duration: rm ? 0.01 : 1,
        delay: parseFloat(el.dataset.gsapDelay || '0'),
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  /* Stagger cards */
  gsap.utils.toArray<HTMLElement>('[data-gsap="stagger-cards"]').forEach(c => {
    gsap.set(c, { opacity: 1 });
    gsap.fromTo(c.querySelectorAll('.service-card'),
      { opacity: 0, y: rm ? 0 : 80 },
      {
        opacity: 1, y: 0,
        duration: rm ? 0.01 : 0.85,
        stagger: { amount: 0.4 }, ease: 'power3.out',
        scrollTrigger: { trigger: c, start: 'top 82%', once: true },
      }
    );
  });

  /* Stagger-up generici */
  gsap.utils.toArray<HTMLElement>('[data-gsap="stagger-up"]').forEach(el => {
    const children = el.children;
    gsap.fromTo(children,
      { opacity: 0, y: rm ? 0 : 48 },
      {
        opacity: 1, y: 0,
        duration: rm ? 0.01 : 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });

  /* Section labels */
  gsap.utils.toArray<HTMLElement>('.section-label').forEach(label => {
    const line = label.querySelector('.section-label__line');
    if (!line) return;
    gsap.from(line, {
      scaleX: 0, transformOrigin: 'left center',
      duration: rm ? 0 : 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: label, start: 'top 90%', once: true },
    });
  });

  /* Stat counters */
  document.querySelectorAll<HTMLElement>('[data-gsap="count-up"]').forEach(el => {
    const target = parseInt(el.dataset.count || '0', 10);
    const num = el.querySelector<HTMLElement>('.stat-item__number');
    if (!num) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 75%', once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: rm ? 0.01 : 2.2, ease: 'power2.out',
          onUpdate: () => { num.textContent = String(Math.round(obj.val)); },
        });
      },
    });
  });

  /* Parallax */
  if (!rm) {
    const bgNum = document.querySelector<HTMLElement>('.vision__bg-number');
    if (bgNum) gsap.to(bgNum, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.vision', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
    const blob = document.querySelector<HTMLElement>('.cta-contact__blob');
    if (blob) gsap.to(blob, { yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.cta-contact', start: 'top bottom', end: 'bottom top', scrub: 2 } });
  }
}

/* MODULE_12 — Scroll Logo (Bussola Topografica) */
export function initScrollLogo(): void {
  const wrapper = document.getElementById('scroll-logo-wrapper');
  const logo = document.getElementById('scroll-logo');
  if (!wrapper || !logo) return;

  const rm = REDUCED_MOTION();
  gsap.set(logo, { scale: 1, rotation: 0, x: 0, opacity: 0.12 });

  if (rm) {
    gsap.set(logo, { opacity: 0.06, scale: 0.6 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top', end: 'bottom bottom',
      scrub: 1.8,
    },
  });

  tl
    .to(logo, { rotation: 45,  scale: 0.85, opacity: 0.18, x: '14vw', ease: 'none', duration: 2 })
    .to(logo, { rotation: 135, scale: 0.55, opacity: 0.08, x: '-8vw', ease: 'none', duration: 2 })
    .to(logo, { rotation: 240, scale: 0.38, opacity: 0.05, x: '6vw',  ease: 'none', duration: 2 })
    .to(logo, { rotation: 360, scale: 0.28, opacity: 0.07, x: 0,      ease: 'none', duration: 2 });
}

/* Destroy: usato da astro:before-swap */
export function destroyGSAPAnimations(): void {
  ScrollTrigger.getAll().forEach(t => t.kill());
  gsap.killTweensOf('*');
}
