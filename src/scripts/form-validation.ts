/**
 * form-validation.ts — Contact Form Validation & UX — MODULE_11
 * Validazione real-time blur+input, shake su errore, loading state,
 * success card animata con GSAP.
 */
import { gsap } from './gsap-init';

type FieldId = 'contact-name' | 'contact-email-input' | 'contact-message' | 'contact-service' | 'contact-privacy';

const VALIDATORS: Record<FieldId, (v: string, el: HTMLInputElement) => boolean> = {
  'contact-name':        v => v.trim().length >= 2,
  'contact-email-input': v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  'contact-message':     v => v.trim().length >= 10,
  'contact-service':     v => v !== '',
  'contact-privacy':     (_, el) => el.checked,
};

const ERRORS: Record<FieldId, string> = {
  'contact-name':        'Inserisci il tuo nome (min. 2 caratteri)',
  'contact-email-input': 'Inserisci un indirizzo email valido',
  'contact-message':     'Il messaggio deve contenere almeno 10 caratteri',
  'contact-service':     "Seleziona un'area di interesse",
  'contact-privacy':     'Devi accettare la privacy policy per procedere',
};

function setState(el: HTMLInputElement, state: 'idle' | 'valid' | 'error'): void {
  const isCheckbox = el.type === 'checkbox';
  const group = el.closest(isCheckbox ? '.form-checkbox' : '.form-group');
  if (!group) return;
  group.classList.remove('is-valid', 'has-error');
  group.querySelector('.field-error-msg')?.remove();

  if (state === 'valid') {
    group.classList.add('is-valid');
  } else if (state === 'error') {
    group.classList.add('has-error');
    const msg = document.createElement('span');
    msg.className = 'field-error-msg';
    msg.setAttribute('role', 'alert');
    msg.textContent = ERRORS[el.id as FieldId] || 'Campo non valido';
    group.appendChild(msg);
    gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)', overwrite: 'auto' });
  }
}

function validate(el: HTMLInputElement): boolean {
  const fn = VALIDATORS[el.id as FieldId];
  if (!fn) return true;
  const ok = fn(el.value, el);
  if ((el as any).dataset.touched === 'true') setState(el, ok ? 'valid' : 'error');
  return ok;
}

export function initContactFormAdvanced(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;

  Object.keys(VALIDATORS).forEach(id => {
    const el = form.querySelector<HTMLInputElement>('#' + id);
    if (!el) return;
    el.addEventListener('blur', () => { (el as any).dataset.touched = 'true'; validate(el); });
    const evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, () => { if ((el as any).dataset.touched === 'true') validate(el); });
  });

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    let ok = true;
    Object.keys(VALIDATORS).forEach(id => {
      const el = form.querySelector<HTMLInputElement>('#' + id);
      if (!el) return;
      (el as any).dataset.touched = 'true';
      if (!validate(el)) ok = false;
    });

    if (!ok) {
      const first = form.querySelector<HTMLElement>('.has-error input, .has-error textarea, .has-error select');
      first?.focus();
      return;
    }

    const btn   = document.getElementById('contact-submit') as HTMLButtonElement | null;
    const label = btn?.querySelector<HTMLElement>('.btn__label');
    const icon  = btn?.querySelector<HTMLElement>('.btn__icon');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-loading');
      if (label) label.textContent = 'Invio in corso...';
      if (icon)  icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2 a10 10 0 0 1 10 10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>';
    }

    await new Promise<void>(r => setTimeout(r, 2000));

    const wrapper = document.querySelector<HTMLElement>('.cta-contact__form-wrapper');
    if (!wrapper) return;

    const html = `<div class="form-success" id="form-success" aria-live="polite" role="status">
      <div class="form-success__icon" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="37" stroke="var(--clr-neon-green)" stroke-width="1.5" stroke-dasharray="232" stroke-dashoffset="232" class="success-circle"/>
          <path d="M24 41 L34 51 L56 29" stroke="var(--clr-neon-green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48" stroke-dashoffset="48" class="success-check"/>
        </svg>
      </div>
      <h3 class="form-success__title heading-md">Messaggio inviato!</h3>
      <p class="form-success__subtitle body-lg text-secondary">Grazie per aver contattato lo studio.<br/>Ti rispondo entro <strong>24 ore lavorative</strong>.</p>
      <p class="form-success__tag mono text-neon-green">[ RICHIESTA RICEVUTA ]</p>
    </div>`;

    gsap.to(form, {
      opacity: 0, y: -24, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        wrapper.innerHTML = html;
        const el = wrapper.querySelector<HTMLElement>('.form-success')!;
        gsap.from(el, { opacity: 0, y: 32, duration: 0.8, ease: 'power3.out' });
        const circle = el.querySelector<SVGElement>('.success-circle');
        const check  = el.querySelector<SVGElement>('.success-check');
        if (circle) gsap.to(circle, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
        if (check)  gsap.to(check,  { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', delay: 0.8 });
      },
    });
  });
}
