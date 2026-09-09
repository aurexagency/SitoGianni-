/**
 * timed-cards.ts — GSAP Flip Timed Cards — MODULE_10
 * Lista orizzontale: espande/collassa le righe in altezza.
 * Progress bar + auto-advance con pausa su hover.
 */
import { gsap, Flip, ScrollTrigger } from './gsap-init';

const REDUCED_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const AUTO_DUR = 6; // secondi per card

export function initTimedCards(): void {
  const grid = document.querySelector<HTMLElement>('[data-gsap="stagger-cards"]');
  if (!grid) return;

  const cards = [...grid.querySelectorAll<HTMLElement>('.service-card')];
  if (!cards.length) return;

  let cur = -1;
  let ptween: gsap.core.Tween | null = null;
  let animating = false;
  let paused = false;

  /** Elementi che vengono rivelati/nascosti nel toggle */
  function expandableEls(card: HTMLElement): HTMLElement[] {
    return [
      card.querySelector<HTMLElement>('.service-card__desc'),
      card.querySelector<HTMLElement>('.service-card__tags'),
      card.querySelector<HTMLElement>('.service-card__cta'),
    ].filter(Boolean) as HTMLElement[];
  }

  function resetBars(): void {
    if (ptween) { ptween.kill(); ptween = null; }
    cards.forEach(c => {
      const b = c.querySelector<HTMLElement>('.service-card__progress-bar');
      if (b) gsap.set(b, { width: '0%' });
    });
  }

  function startBar(idx: number): void {
    if (REDUCED_MOTION() || paused) return;
    const bar = cards[idx]?.querySelector<HTMLElement>('.service-card__progress-bar');
    if (!bar) return;
    ptween = gsap.to(bar, {
      width: '100%', duration: AUTO_DUR, ease: 'none',
      onComplete: () => goTo((idx + 1) % cards.length),
    });
  }

  function goTo(idx: number, instant = false): void {
    if ((animating && !instant) || (idx === cur && !instant && cur !== -1)) return;
    animating = true;
    resetBars();

    // Cattura lo stato PRIMA del toggle per Flip
    const state = (!REDUCED_MOTION() && !instant && cur !== -1)
      ? Flip.getState([grid, ...cards], { props: 'opacity' }) : null;

    // Fade-out del contenuto espandibile della card precedente
    if (!instant && cur !== -1) {
      gsap.to(expandableEls(cards[cur]), {
        opacity: 0, duration: 0.2, ease: 'power2.in', overwrite: 'auto',
      });
    }

    // Toggle delle classi
    cards.forEach((c, i) => {
      const active = i === idx;
      c.classList.toggle('is-active',    active);
      c.classList.toggle('is-collapsed', !active);
      c.setAttribute('aria-pressed', String(active));
    });
    cur = idx;

    if (state) {
      Flip.from(state, {
        duration: REDUCED_MOTION() ? 0 : 0.7,
        ease: 'power2.inOut',
        nested: true,
        onComplete: () => {
          animating = false;
          // Rivela contenuto espandibile con stagger cinematico
          gsap.fromTo(expandableEls(cards[idx]),
            { opacity: 0, y: 16, filter: 'blur(6px)' },
            {
              opacity: 1, y: 0, filter: 'blur(0px)',
              duration: 0.8, ease: 'expo.out',
              stagger: 0.1, overwrite: 'auto',
            }
          );
          startBar(idx);
        },
      });
    } else {
      // Inizializzazione istantanea (primo load)
      const activeEls = expandableEls(cards[idx]);
      gsap.set(activeEls, { opacity: 1, y: 0, filter: 'blur(0px)' });
      cards.forEach((c, i) => {
        if (i !== idx) gsap.set(expandableEls(c), { opacity: 0 });
      });
      animating = false;
      startBar(idx);
    }
  }

  /* Event listeners — click + hover per navigazione */
  cards.forEach((c, i) => {
    c.addEventListener('click', () => { if (i !== cur) goTo(i); });
    c.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && i !== cur) { e.preventDefault(); goTo(i); }
    });
  });

  grid.addEventListener('mouseenter', () => { paused = true;  if (ptween) ptween.pause(); });
  grid.addEventListener('mouseleave', () => { paused = false; if (ptween) ptween.play();  });

  /* Attiva via ScrollTrigger */
  ScrollTrigger.create({
    trigger: grid, start: 'top 60%', once: true,
    onEnter: () => setTimeout(() => goTo(0, true), 650),
  });
}
