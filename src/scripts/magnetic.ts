/**
 * magnetic.ts — Magnetic Buttons hover effect — MODULE_5
 */
import { gsap } from './gsap-init';

export function initMagneticButtons(): void {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED_MOTION || !window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(btn => {
    const icon = btn.querySelector<HTMLElement>('.btn__icon');

    function offset(e: MouseEvent, p: number) {
      const r = btn.getBoundingClientRect();
      return {
        x: (e.clientX - (r.left + r.width  / 2)) * p,
        y: (e.clientY - (r.top  + r.height / 2)) * p,
      };
    }

    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const o = offset(e, 0.35);
      gsap.to(btn, { x: o.x, y: o.y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      if (icon) {
        const io = offset(e, 0.65);
        gsap.to(icon, { x: io.x, y: io.y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn,  { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
      if (icon) gsap.to(icon, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
    });
  });
}
