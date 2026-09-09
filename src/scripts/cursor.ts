/**
 * cursor.ts — Custom Cursor (dot + ring) — MODULE_4
 */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initCursor(): void {
  const cursorEl = document.getElementById('cursor');
  if (!cursorEl || !window.matchMedia('(pointer: fine)').matches) return;

  const dot  = cursorEl.querySelector<HTMLElement>('.cursor__dot');
  const ring = cursorEl.querySelector<HTMLElement>('.cursor__ring');
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  (function loop() {
    rx = lerp(rx, mx, 0.1); ry = lerp(ry, my, 0.1);
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, [data-magnetic], .service-card, label').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-hovering'));
  });

  document.body.style.cursor = 'none';
  cursorEl.style.display = 'block';
}
