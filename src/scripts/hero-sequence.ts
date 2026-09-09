/**
 * hero-sequence.ts — Canvas Frame-by-Frame Sequence — MODULE_6
 * Carica le immagini dalla cartella /public/hero-frame/
 * e usa GSAP ScrollTrigger per lo scrub sincronizzato con Lenis.
 */
import { gsap, ScrollTrigger } from './gsap-init';

export function initHeroSequence(): void {
  const canvas = document.getElementById('hero-sequence-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameCount = 108;
  const currentFrame = (index: number) =>
    `/pozzo%20hero/pozzo%20hero%20_${index.toString().padStart(3, '0')}.webp`;

  const images: HTMLImageElement[] = [];
  const seq = { frame: 0 };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  function render() {
    const img = images[seq.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const canvasRatio = canvas!.width / canvas!.height;
    const imgRatio    = img.width / img.height;
    let drawWidth  = canvas!.width;
    let drawHeight = canvas!.height;
    let offsetX = 0, offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas!.width / imgRatio;
      offsetY = (canvas!.height - drawHeight) / 2;
    } else {
      drawWidth = canvas!.height * imgRatio;
      offsetX = (canvas!.width - drawWidth) / 2;
    }
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx!.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  images[0].onload = render;

  let resizeTimeout: ReturnType<typeof setTimeout>;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width  = window.innerWidth  * dpr;
      canvas!.height = window.innerHeight * dpr;
      render();
    }, 150);
  }

  window.addEventListener('resize', onResize);
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  render();

  if (!REDUCED_MOTION) {
    gsap.to(seq, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero-pin-wrapper',
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.5,
      },
      onUpdate: render,
    });
  } else {
    seq.frame = frameCount - 1;
    images[seq.frame].onload = render;
  }
}
