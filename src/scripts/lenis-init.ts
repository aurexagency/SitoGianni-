/**
 * lenis-init.ts — Init e Destroy di Lenis Smooth Scroll
 * Pattern Astro View Transitions:
 *   - initLenis() su astro:page-load
 *   - destroyLenis() su astro:before-swap
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap-init';

let _lenis: Lenis | null = null;
let _rafId: number | null = null;

// Funzione ticker per GSAP (usata per rimuoverla su destroy)
function lenisTicker(time: number) {
  _lenis?.raf(time * 1000);
}

export function initLenis(): Lenis | null {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED_MOTION) return null;

  _lenis = new Lenis({
    lerp: 0.20,
    wheelMultiplier: 1.2,
    touchMultiplier: 1.5,
    syncTouch: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    infinite: false,
  });

  // Bridge Lenis ↔ GSAP ScrollTrigger
  _lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisTicker);
  gsap.ticker.lagSmoothing(0);

  // Esponi globalmente per i link ancor (#section)
  (window as any)._lenis = _lenis;
  return _lenis;
}

export function destroyLenis(): void {
  if (_lenis) {
    gsap.ticker.remove(lenisTicker);
    _lenis.destroy();
    _lenis = null;
    (window as any)._lenis = null;
  }
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
}
