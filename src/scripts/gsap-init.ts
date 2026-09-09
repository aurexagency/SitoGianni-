/**
 * gsap-init.ts — Inizializzazione GSAP e registrazione plugin
 * Importato come ES Module da Astro.
 * SplitText viene letto dal global window (CDN GSAP Club nel <head>).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

// Registra i plugin npm
gsap.registerPlugin(ScrollTrigger, Flip);

// SplitText: disponibile come globale da CDN nel BaseLayout
// (non su npm pubblico — richiede licenza GSAP Club)
const SplitText = (typeof window !== 'undefined' && (window as any).SplitText)
  ? (window as any).SplitText
  : null;

if (SplitText) {
  gsap.registerPlugin(SplitText);
}

export { gsap, ScrollTrigger, Flip, SplitText };
