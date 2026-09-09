---
trigger: always_on
---

# REGOLA ANIMAZIONI: Creative, GSAP & Micro-Interactions

## 1. Stile dell'Animazione (Creative & Tech-Forward)
Il sito adotta un approccio visivo altamente interattivo e moderno. Sono esplicitamente consentiti ed incoraggiati effetti di hover avanzati e micro-interazioni sperimentali sui bottoni e sugli elementi di UI (inclusi, ma non limitati a, effetti "Stretch", "Peel", "Frost", "Sand", "Gravity" e "Pin Art"). L'obiettivo è stupire l'utente con soluzioni tecniche all'avanguardia.

## 2. Animazioni Complesse e Interazioni (GSAP & CSS Avanzato)
- Per animazioni di layout avanzate, caroselli temporizzati (Timed Cards) e scroll animations, l'agente DEVE utilizzare **GSAP (GreenSock Animation Platform)** e i suoi plugin (come *Flip* o *ScrollTrigger*).
- Per i button hover effects complessi, utilizzare trasformazioni CSS avanzate, filtri, `clip-path` e logiche di posizionamento assoluto per indicatori fluidi.

## 3. Accessibilità del Movimento (Strict Rule)
TUTTE le animazioni, sia CSS che JavaScript (GSAP), DEVONO obbligatoriamente rispettare la preferenza dell'utente per la riduzione del movimento.
- **CSS:** Usa la media query `@media (prefers-reduced-motion: reduce)` per disabilitare trasformazioni complesse e forzare transizioni di stato istantanee.
- **JavaScript/GSAP:** Utilizza `gsap.matchMedia()` per azzerare le durate (es. `duration: 0`) o inibire del tutto il trigger delle animazioni se il reduced-motion è attivo.