import { Component } from '@theme/component';

/**
 * Name-on-label personalisation (blocks/personalisation.liquid).
 *
 * The dialog collects a name, font and thread colour, drawn live on the optional embroidery preview.
 * Applying copies them into hidden line item
 * property inputs on the product form and enables the fee input, which product-form.js uses to
 * add the fee variant as a nested cart line. Removing clears and disables them again.
 *
 * Elements inside the <dialog-component> belong to that component's refs, so they are looked up
 * with data attributes instead.
 *
 * @extends {Component}
 */
class PersonalisationComponent extends Component {
  /** @param {string} field */
  #hiddenInput(field) {
    const input = this.querySelector(`input[type="hidden"][data-personalisation-field="${field}"]`);
    return input instanceof HTMLInputElement ? input : null;
  }

  get #nameInput() {
    const input = this.querySelector('[data-personalisation-input]');
    return input instanceof HTMLInputElement ? input : null;
  }

  get #selectedThread() {
    const checked = this.querySelector('[data-personalisation-thread]:checked');
    return checked instanceof HTMLInputElement ? checked.value : '';
  }

  get #selectedFont() {
    const checked = this.querySelector('[data-personalisation-font]:checked');
    return checked instanceof HTMLInputElement ? checked.value : '';
  }

  get #dialog() {
    return /** @type {(HTMLElement & { closeDialog?: () => void }) | null} */ (
      this.querySelector('dialog-component')
    );
  }

  /** Keeps the character count and the apply button in step with the name field. */
  handleInput() {
    const input = this.#nameInput;
    if (!input) return;

    const count = this.querySelector('[data-personalisation-count]');
    const template = count?.getAttribute('data-template');
    if (count && template) count.textContent = template.replace('[used]', String(input.value.length));

    const apply = this.querySelector('[data-personalisation-apply]');
    if (apply instanceof HTMLButtonElement) apply.disabled = input.value.trim().length === 0;

    this.#updatePreviewName(input.value.trim());
  }

  /**
   * Colours the embroidery preview with the chosen thread (hex from the thread radio).
   * @param {Event} event
   */
  selectThread(event) {
    const preview = this.querySelector('[data-personalisation-preview]');
    const radio = event.target;
    if (!(preview instanceof HTMLElement) || !(radio instanceof HTMLInputElement)) return;

    const colour = radio.dataset.threadColour;
    if (colour) {
      preview.style.setProperty('--preview-thread-colour', colour);
    } else {
      preview.style.removeProperty('--preview-thread-colour');
    }
  }

  /**
   * Sets the embroidery preview in the chosen font (CSS family from the font radio).
   * @param {Event} event
   */
  selectFont(event) {
    const preview = this.querySelector('[data-personalisation-preview]');
    const radio = event.target;
    if (!(preview instanceof HTMLElement) || !(radio instanceof HTMLInputElement)) return;

    const family = radio.dataset.fontFamily;
    if (family) {
      preview.style.setProperty('--preview-font-family', family);
    } else {
      preview.style.removeProperty('--preview-font-family');
    }
  }

  /**
   * Shows the typed name on the embroidery preview, or the faded placeholder while it's empty.
   * @param {string} name
   */
  #updatePreviewName(name) {
    const text = this.querySelector('[data-personalisation-preview-name]');
    if (!(text instanceof HTMLElement)) return;

    text.textContent = name || text.dataset.placeholder || '';
    text.toggleAttribute('data-empty', !name);
  }

  /** Saves the personalisation onto the product form and closes the dialog. */
  apply() {
    const name = this.#nameInput?.value.trim() ?? '';
    if (!name) return;

    const thread = this.#selectedThread;
    const font = this.#selectedFont;
    const nameProperty = this.#hiddenInput('name');
    const threadProperty = this.#hiddenInput('thread');
    const fontProperty = this.#hiddenInput('font');
    const fee = this.#hiddenInput('fee');

    if (nameProperty) {
      nameProperty.value = name;
      nameProperty.disabled = false;
    }
    if (threadProperty) {
      threadProperty.value = thread;
      threadProperty.disabled = !thread;
    }
    if (fontProperty) {
      fontProperty.value = font;
      fontProperty.disabled = !font;
    }
    if (fee) fee.disabled = false;

    const { appliedTemplate, appliedTemplateNoThread, appliedTemplateFont, appliedTemplateFontNoThread } =
      this.dataset;
    const template = font
      ? thread
        ? appliedTemplateFont
        : appliedTemplateFontNoThread
      : thread
        ? appliedTemplate
        : appliedTemplateNoThread;
    this.#setSummary((template ?? '').replace('[name]', name).replace('[thread]', thread).replace('[font]', font));
    this.#setRemoveVisible(true);
    this.#setPriceNoteVisible(true);
    this.#dialog?.closeDialog?.();
  }

  /** Clears the personalisation so the piece is added without it. */
  remove() {
    for (const field of ['name', 'thread', 'font', 'fee']) {
      const input = this.#hiddenInput(field);
      if (!input) continue;
      if (field !== 'fee') input.value = '';
      input.disabled = true;
    }

    const nameInput = this.#nameInput;
    if (nameInput) {
      nameInput.value = '';
      this.handleInput();
    }

    this.#setSummary(this.dataset.defaultSummary ?? '');
    this.#setRemoveVisible(false);
    this.#setPriceNoteVisible(false);
    this.#dialog?.closeDialog?.();
  }

  /** @param {string} text */
  #setSummary(text) {
    const summary = this.querySelector('[data-personalisation-summary]');
    if (summary) summary.textContent = text;
  }

  /**
   * Shows the "+ fee" note beside the price block in the same section (price-personalisation-note).
   * @param {boolean} visible
   */
  #setPriceNoteVisible(visible) {
    const section = this.closest('.shopify-section') ?? document;
    for (const note of section.querySelectorAll('[data-personalisation-price-note]')) {
      if (note instanceof HTMLElement) note.hidden = !visible;
    }
  }

  /** @param {boolean} visible */
  #setRemoveVisible(visible) {
    const remove = this.querySelector('[data-personalisation-remove]');
    if (remove instanceof HTMLElement) remove.hidden = !visible;
  }
}

if (!customElements.get('personalisation-component')) {
  customElements.define('personalisation-component', PersonalisationComponent);
}
