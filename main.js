/**
 * main.js — Sito Geologo Professionista
 * =========================================================
 * Step 3: GSAP Flip Timed Cards | Form Validation & UX
 * =========================================================
 * MODULE_1  — Config & Utils
 * MODULE_2  — Lenis Smooth Scroll
 * MODULE_3  — GSAP Animations
 * MODULE_4  — Custom Cursor
 * MODULE_5  — Magnetic Buttons
 * MODULE_6  — Canvas Particles
 * MODULE_7  — Nav & UI helpers
 * MODULE_8  — (delegato a MODULE_11)
 * MODULE_9  — Bootstrap
 * MODULE_10 — Timed Cards GSAP Flip [NUOVO]
 * MODULE_11 — Form Validation & UX  [NUOVO]
 */
'use strict';

/* =========================================================
   MODULE_1 — CONFIG & UTILITIES
   ========================================================= */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp     = (a, b, t) => a + (b - a) * t;
const clamp    = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* =========================================================
   MODULE_2 — LENIS SMOOTH SCROLL
   ========================================================= */
function initLenis() {
  if (REDUCED_MOTION) return null;
  if (typeof Lenis === 'undefined') { console.warn('[Lenis] CDN mancante.'); return null; }
  const lenis = new Lenis({
    /*
     * MODALITÀ LERP — elimina la latenza della rotella del mouse.
     *
     * Perché duration causava il ritardo:
     *   Con duration:0.85, ogni tick di rotella avvia un'animazione
     *   di 850ms; i tick successivi si accodano → il movimento
     *   parte visibilmente in ritardo (~1s percepito).
     *
     * Come funziona lerp:
     *   Ogni frame, la posizione scroll si avvicina del [lerp]%
     *   alla destinazione target. Non esiste "coda" di animazioni:
     *   il primo frame risponde SUBITO, la decelerazione è naturale.
     *
     *   lerp: 0.12  →  12% di avvicinamento per frame @ 60fps
     *                   zona ottimale: reattivo senza essere secco
     *   Aumentare verso 0.2 = più scattante
     *   Diminuire verso 0.06 = più morbido/cinematico
     *
     * NOTA: lerp ed easing/duration sono mutualmente esclusivi.
     */
    lerp:               0.20,   /* massima reattività, inerzia quasi assente */
    wheelMultiplier:    1.2,
    touchMultiplier:    1.5,
    syncTouch:          true,   /* FORZA il sync con il trackpad/mouse hardware */
    orientation:        'vertical',
    gestureOrientation: 'vertical',
    smoothWheel:        true,
    infinite:           false,
  });
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  window._lenis = lenis;
  return lenis;
}

/* =========================================================
   MODULE_3 — GSAP ANIMATIONS
   ========================================================= */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Flip !== 'undefined')      gsap.registerPlugin(Flip);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

  /* Hero title */
  const heroTitle = document.querySelector('[data-gsap="split-chars"]');
  if (heroTitle) {
    if (typeof SplitText !== 'undefined' && !REDUCED_MOTION) {
      heroTitle.style.overflow = 'hidden';
      const split = new SplitText(heroTitle, { type: 'chars,words,lines', linesClass: 'split-line' });
      split.lines.forEach(l => l.style.overflow = 'hidden');
      gsap.from(split.chars, {
        yPercent: 120, opacity: 0, rotateX: -60,
        transformOrigin: 'center bottom',
        duration: 0.9, stagger: { amount: 0.5 }, ease: 'power3.out', delay: 0.3,
      });
    } else {
      gsap.from(heroTitle, { y: REDUCED_MOTION ? 0 : 48, opacity: 0, duration: REDUCED_MOTION ? 0.01 : 1.2, delay: 0.3, ease: 'power3.out' });
    }
  }

  /* Fade-up generici
     HOTFIX: gsap.from → gsap.fromTo con to:{opacity:1,y:0} esplicito.
     gsap.from() usava come destinazione il valore CSS (opacity:0) → invisibili.
     gsap.fromTo() forza la destinazione indipendentemente dal CSS. */
  gsap.utils.toArray('[data-gsap="fade-up"]').forEach(el => {
    gsap.fromTo(el,
      /* FROM: stato iniziale impostato da GSAP (non dipende dal CSS) */
      { opacity: 0, y: REDUCED_MOTION ? 0 : 48 },
      /* TO: destinazione finale ESPLICITA */
      {
        opacity: 1, y: 0,
        duration: REDUCED_MOTION ? 0.01 : 1,
        delay: parseFloat(el.dataset.gsapDelay || 0),
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  /* Stagger cards
     HOTFIX: il container [data-gsap="stagger-cards"] viene portato subito
     a opacity:1 (era bloccato a 0 dal CSS). I singoli .service-card
     vengono poi animati in stagger con gsap.fromTo(). */
  gsap.utils.toArray('[data-gsap="stagger-cards"]').forEach(c => {
    /* Container visibile subito — i figli faranno l'ingresso animato */
    gsap.set(c, { opacity: 1 });
    gsap.fromTo(c.querySelectorAll('.service-card'),
      { opacity: 0, y: REDUCED_MOTION ? 0 : 80 },
      {
        opacity: 1, y: 0,
        duration: REDUCED_MOTION ? 0.01 : 0.85,
        stagger: { amount: 0.4 }, ease: 'power3.out',
        scrollTrigger: { trigger: c, start: 'top 82%', once: true },
      }
    );
  });


  /* Section labels */
  gsap.utils.toArray('.section-label').forEach(label => {
    const line = label.querySelector('.section-label__line');
    if (!line) return;
    gsap.from(line, { scaleX: 0, transformOrigin: 'left center', duration: REDUCED_MOTION ? 0 : 0.8, ease: 'power3.out', scrollTrigger: { trigger: label, start: 'top 90%', once: true } });
  });

  /* Stat counters */
  document.querySelectorAll('[data-gsap="count-up"]').forEach(el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const num    = el.querySelector('.stat-item__number');
    if (!num) return;
    
    ScrollTrigger.create({ 
      trigger: el, 
      start: 'top 75%', /* Trigger più in basso per garantire visibilità */
      once: true,
      onEnter: () => {
        /* L'oggetto viene creato e azzerato qui per evitare scatti a vuoto nei pre-layout */
        const obj = { val: 0 };
        gsap.to(obj, { 
          val: target, 
          duration: REDUCED_MOTION ? 0.01 : 2.2, 
          ease: 'power2.out', 
          onUpdate: () => { num.textContent = Math.round(obj.val); } 
        });
      }
    });
  });

  /* Parallax */
  if (!REDUCED_MOTION) {
    const bgNum = document.querySelector('.vision__bg-number');
    if (bgNum) gsap.to(bgNum, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.vision', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
    const blob = document.querySelector('.cta-contact__blob');
    if (blob) gsap.to(blob, { yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.cta-contact', start: 'top bottom', end: 'bottom top', scrub: 2 } });
  }
}

/* =========================================================
   MODULE_4 — CUSTOM CURSOR
   ========================================================= */
function initCursor() {
  const cursorEl = document.getElementById('cursor');
  if (!cursorEl || !window.matchMedia('(pointer: fine)').matches) return;
  const dot = cursorEl.querySelector('.cursor__dot');
  const ring = cursorEl.querySelector('.cursor__ring');
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

/* =========================================================
   MODULE_5 — MAGNETIC BUTTONS
   ========================================================= */
function initMagneticButtons() {
  if (REDUCED_MOTION || !window.matchMedia('(pointer: fine)').matches) return;
  if (typeof gsap === 'undefined') return;
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    const icon = btn.querySelector('.btn__icon');
    function off(e, p) {
      const r = btn.getBoundingClientRect();
      return { x: (e.clientX - (r.left + r.width / 2)) * p, y: (e.clientY - (r.top + r.height / 2)) * p };
    }
    btn.addEventListener('mousemove', e => {
      const o = off(e, 0.35);
      gsap.to(btn, { x: o.x, y: o.y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      if (icon) { const io = off(e, 0.65); gsap.to(icon, { x: io.x, y: io.y, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }); }
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn,  { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
      if (icon) gsap.to(icon, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
    });
  });
}

/* =========================================================
   MODULE_6 — HERO SEQUENCE (Frame by frame)
   ========================================================= */
function initHeroSequence() {
  const canvas = document.getElementById('hero-sequence-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const frameCount = 82;
  /* Format: /public/hero-frame/hero-s_000.webp */
  const currentFrame = index => `/public/hero-frame/hero-s_${index.toString().padStart(3, '0')}.webp`;

  const images = [];
  const seq = { frame: 0 };

  /* Preloading delle immagini */
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  /* Disegna non appena il primo frame è carico */
  images[0].onload = render;

  function render() {
    if (!images[seq.frame] || !images[seq.frame].complete || images[seq.frame].naturalWidth === 0) return;
    const img = images[seq.frame];

    /* Calcolo per simulare "object-fit: cover" */
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      /* Il canvas è più largo dell'immagine in proporzione */
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      /* Il canvas è più alto dell'immagine in proporzione */
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /* Handle resize (con supporto Retina/High-DPI per massima qualità) */
  let resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      render();
    }, 150);
  }
  
  window.addEventListener('resize', onResize);
  /* Chiamata iniziale (sincrona per impostare dimensioni HD) */
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  render();

  /* Setup GSAP ScrollTrigger per lo scrub */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !REDUCED_MOTION) {
    gsap.to(seq, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#hero-pin-wrapper",
        start: "top top",
        end: "+=200%", /* Pinna la hero per un equivalente di 2 schermate di scroll */
        pin: true,
        scrub: 0.5, /* Leggero ritardo per renderlo burroso col Lenis lerp */
      },
      onUpdate: render // Aggiorna il canvas a ogni step
    });
  } else if (REDUCED_MOTION) {
    /* Fallback: fissa l'ultimo frame se le animazioni sono disabilitate */
    seq.frame = frameCount - 1;
    images[seq.frame].onload = render;
  }
}

/* =========================================================
   MODULE_7 — NAV & UI HELPERS
   ========================================================= */
function initNav() {
  const header = document.getElementById('site-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 40), { passive: true });
  const burger = document.getElementById('nav-burger'), menu = document.getElementById('mobile-menu');
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
        burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true');
        burger.setAttribute('aria-label', 'Apri menu'); document.body.style.overflow = '';
      });
    });
  }
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href'), tgt = document.querySelector(href);
      if (!tgt || href === '#') return;
      e.preventDefault();
      const h = document.getElementById('site-header')?.offsetHeight || 72;
      const top = tgt.getBoundingClientRect().top + window.scrollY - h - 24;
      /* duration: 0.8 — salto di sezione rapido e d'impatto */
      window._lenis ? window._lenis.scrollTo(top, { duration: 0.8 }) : window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

  const grid = document.querySelector('[data-gsap="stagger-cards"]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.service-card')];
  if (!cards.length) return;

  const AUTO_DUR  = 6;       /* secondi per card */
  let cur         = -1;      /* indice corrente (-1 = non ancora attivo) */
  let ptween      = null;    /* tween della progress bar */
  let animating   = false;
  let paused      = false;

  /* Raccoglie gli elementi di contenuto da mostrare/nascondere */
  function contentEls(card) {
    return [card.querySelector('.service-card__desc'), card.querySelector('.service-card__tags'), card.querySelector('.service-card__cta')].filter(Boolean);
  }

  /* Azzera tutte le progress bar */
  function resetBars() {
    if (ptween) { ptween.kill(); ptween = null; }
    cards.forEach(c => { const b = c.querySelector('.service-card__progress-bar'); if (b) gsap.set(b, { width: '0%' }); });
  }

  /* Avvia la progress bar della card attiva */
  function startBar(idx) {
    if (REDUCED_MOTION || paused) return;
    const bar = cards[idx]?.querySelector('.service-card__progress-bar');
    if (!bar) return;
    ptween = gsap.to(bar, {
      width: '100%', duration: AUTO_DUR, ease: 'none',
      onComplete: () => goTo((idx + 1) % cards.length),
    });
  }

  /* Transizione principale verso la card [idx] */
  function goTo(idx, instant) {
    if ((animating && !instant) || (idx === cur && !instant && cur !== -1)) return;
    animating = true;
    resetBars();

    /* 1. Cattura stato Flip PRIMA del cambio classi */
    const state = (!REDUCED_MOTION && !instant && cur !== -1)
      ? Flip.getState(cards, { props: 'opacity' }) : null;

    /* 2. Fade-out immediato contenuto card che collassano */
    if (!instant) {
      cards.forEach((c, i) => {
        if (i !== idx) gsap.to(contentEls(c), { opacity: 0, duration: 0.18, ease: 'power2.in', overwrite: 'auto' });
      });
    }

    /* 3. Applica classi CSS */
    cards.forEach((c, i) => {
      const active = i === idx;
      c.classList.toggle('is-active',    active);
      c.classList.toggle('is-collapsed', !active);
      c.setAttribute('aria-pressed', String(active));
    });
    cur = idx;

    /* 4a. Anima con Flip (cambio di layout fluido) */
    if (state) {
      Flip.from(state, {
        duration: 0.8, ease: 'power2.inOut', nested: true, 
        /* absolute: true RIMOSSO per evitare il collasso d'altezza della griglia genitore */
        onComplete: () => {
          animating = false;
          /* Fade-in contenuto card attiva */
          gsap.to(contentEls(cards[idx]), { opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', overwrite: 'auto' });
          startBar(idx);
        },
      });
    /* 4b. Prima attivazione (istantaneo) */
    } else {
      gsap.set(contentEls(cards[idx]), { opacity: 1 });
      cards.forEach((c, i) => { if (i !== idx) gsap.set(contentEls(c), { opacity: 0 }); });
      animating = false;
      startBar(idx);
    }
  }

  /* Event listeners */
  cards.forEach((c, i) => {
    /* Apertura al passaggio del mouse invece che al click */
    c.addEventListener('mouseenter', () => { 
      if (i !== cur) goTo(i); 
    });
    c.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && i !== cur) { e.preventDefault(); goTo(i); }
    });
  });

  /* Pausa mentre il mouse e' nel grid (UX: non far scorrere mentre si legge) */
  grid.addEventListener('mouseenter', () => { paused = true; if (ptween) ptween.pause(); });
  grid.addEventListener('mouseleave', () => { paused = false; if (ptween) ptween.play(); });

  /* Attiva via ScrollTrigger, dopo lo stagger di ingresso */
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: grid, start: 'top 60%', once: true,
      onEnter: () => setTimeout(() => goTo(0, true), 650),
    });
  } else { goTo(0, true); }
}

/* =========================================================
   MODULE_11 — FORM VALIDATION & UX
   =========================================================
   - Validazione real-time (blur + input)
   - Feedback visivo: is-valid (verde) / has-error (rosso + shake)
   - Submit: loading state 2s (setTimeout) => success card GSAP
   ========================================================= */
function initContactFormAdvanced() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  /* Validators: id => funzione(valore, element) => boolean */
  const V = {
    'contact-name':        v => v.trim().length >= 2,
    'contact-email-input': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    'contact-message':     v => v.trim().length >= 10,
    'contact-service':     v => v !== '',
    'contact-privacy':     (_, el) => el.checked,
  };

  /* Messaggi di errore per ogni campo */
  const ERR = {
    'contact-name':        'Inserisci il tuo nome (min. 2 caratteri)',
    'contact-email-input': 'Inserisci un indirizzo email valido',
    'contact-message':     'Il messaggio deve contenere almeno 10 caratteri',
    'contact-service':     'Seleziona un\'area di interesse',
    'contact-privacy':     'Devi accettare la privacy policy per procedere',
  };

  /* Imposta stato visivo: 'idle' | 'valid' | 'error' */
  function setState(el, state) {
    const cb    = el.type === 'checkbox';
    const group = el.closest(cb ? '.form-checkbox' : '.form-group');
    if (!group) return;
    group.classList.remove('is-valid', 'has-error');
    const prev = group.querySelector('.field-error-msg');
    if (prev) prev.remove();

    if (state === 'valid') {
      group.classList.add('is-valid');

    } else if (state === 'error') {
      group.classList.add('has-error');
      /* Messaggio accessibile */
      const msg = document.createElement('span');
      msg.className = 'field-error-msg';
      msg.setAttribute('role', 'alert');
      msg.textContent = ERR[el.id] || 'Campo non valido';
      group.appendChild(msg);
      /* Shake */
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)', overwrite: 'auto' });
      }
    }
  }

  /* Valida un campo e aggiorna l'UI */
  function validate(el) {
    const fn = V[el.id];
    if (!fn) return true;
    const ok = fn(el.value, el);
    if (el.dataset.touched === 'true') setState(el, ok ? 'valid' : 'error');
    return ok;
  }

  /* Setup validazione live */
  Object.keys(V).forEach(id => {
    const el = form.querySelector('#' + id);
    if (!el) return;
    el.addEventListener('blur', () => { el.dataset.touched = 'true'; validate(el); });
    const evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, () => { if (el.dataset.touched === 'true') validate(el); });
  });

  /* Submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    /* Valida tutti i campi */
    let ok = true;
    Object.keys(V).forEach(id => {
      const el = form.querySelector('#' + id);
      if (!el) return;
      el.dataset.touched = 'true';
      if (!validate(el)) ok = false;
    });
    if (!ok) {
      const first = form.querySelector('.has-error input, .has-error textarea, .has-error select');
      if (first) first.focus();
      return;
    }

    /* Loading state */
    const btn   = document.getElementById('contact-submit');
    const label = btn?.querySelector('.btn__label');
    const icon  = btn?.querySelector('.btn__icon');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-loading');
      if (label) label.textContent = 'Invio in corso...';
      if (icon)  icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2 a10 10 0 0 1 10 10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>';
    }

    /* Simula chiamata asincrona */
    await new Promise(r => setTimeout(r, 2000));

    /* Success */
    const wrapper = document.querySelector('.cta-contact__form-wrapper');
    if (!wrapper) return;
    const html = '<div class="form-success" id="form-success" aria-live="polite" role="status"><div class="form-success__icon" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="37" stroke="var(--clr-neon-green)" stroke-width="1.5" stroke-dasharray="232" stroke-dashoffset="232" class="success-circle"/><path d="M24 41 L34 51 L56 29" stroke="var(--clr-neon-green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48" stroke-dashoffset="48" class="success-check"/></svg></div><h3 class="form-success__title heading-md">Messaggio inviato!</h3><p class="form-success__subtitle body-lg text-secondary">Grazie per aver contattato lo studio.<br/>Ti rispondo entro <strong>24 ore lavorative</strong>.</p><p class="form-success__tag mono text-neon-green">[ RICHIESTA RICEVUTA ]</p></div>';

    if (typeof gsap !== 'undefined') {
      gsap.to(form, {
        opacity: 0, y: -24, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          wrapper.innerHTML = html;
          const el = wrapper.querySelector('.form-success');
          gsap.from(el, { opacity: 0, y: 32, duration: 0.8, ease: 'power3.out' });
          const circle = el.querySelector('.success-circle');
          const check  = el.querySelector('.success-check');
          if (circle) gsap.to(circle, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
          if (check)  gsap.to(check,  { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', delay: 0.8 });
        },
      });
    } else {
      wrapper.innerHTML = html;
    }
  });
}

/* =========================================================
   MODULE_12 — SCROLL LOGO (Bussola Topografica)
   Logo fisso in background che ruota e si scala con lo scroll.
   ========================================================= */
function initScrollLogo() {
  const wrapper = document.getElementById('scroll-logo-wrapper');
  const logo    = document.getElementById('scroll-logo');
  if (!wrapper || !logo || typeof gsap === 'undefined') return;

  /* Stato iniziale: grande, centrato, quasi trasparente */
  gsap.set(logo, {
    scale:    1,
    rotation: 0,
    x:        0,
    opacity:  0.12,
  });

  if (REDUCED_MOTION) {
    /* Accessibilità: niente animazione, solo presenza statica */
    gsap.set(logo, { opacity: 0.06, scale: 0.6 });
    return;
  }

  /* Timeline scrub collegata all'intera pagina */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger:  document.body,
      start:    'top top',
      end:      'bottom bottom',
      scrub:    1.8, /* Inerzia leggermente più lunga per dare senso di peso geologico */
    }
  });

  tl
    /* === FASE 1 (Hero) — si avvia grande e nitida ===*/
    .to(logo, {
      rotation: 45,          /* Primo quarto di giro mentre lasci la Hero */
      scale:    0.85,
      opacity:  0.18,
      x:        '14vw',      /* Scivola verso destra, quasi come un'ombra */
      ease:     'none',
      duration: 2,
    })
    /* === FASE 2 (Vision / Stats) — scende di dimensione, continua a ruotare === */
    .to(logo, {
      rotation: 135,
      scale:    0.55,
      opacity:  0.08,
      x:        '-8vw',      /* Torna a sinistra */
      ease:     'none',
      duration: 2,
    })
    /* === FASE 3 (Servizi) — quasi sparito, ancora in rotazione === */
    .to(logo, {
      rotation: 240,
      scale:    0.38,
      opacity:  0.05,
      x:        '6vw',
      ease:     'none',
      duration: 2,
    })
    /* === FASE 4 (Contatti) — torna centrale come firma finale === */
    .to(logo, {
      rotation: 360,
      scale:    0.28,
      opacity:  0.07,
      x:        0,
      ease:     'none',
      duration: 2,
    });
}

/* =========================================================
   MODULE_9 — BOOTSTRAP
   ========================================================= */
onReady(() => {
  document.documentElement.classList.remove('no-js');
  initNav();
  initLenis();
  initGSAPAnimations();
  initCursor();
  if (typeof gsap !== 'undefined') initMagneticButtons();
  initHeroSequence();

  initContactFormAdvanced();
  initScrollLogo();
});
