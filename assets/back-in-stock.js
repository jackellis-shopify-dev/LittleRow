import { Component } from '@theme/component';
import { DialogOpenEvent } from '@theme/dialog';

/**
 * Back in stock ("notify me") for the product page (blocks/back-in-stock.liquid).
 *
 * Submits to the Amp app's storefront API, loaded by the app embed:
 *   BIS.create(email, variantId, productId) -> promise with .then(data)
 *   data.status === 'OK' | 'Error' (with data.errors keyed by field)
 *
 * The block renders only the modal. The add-to-cart button opens it while it reads "notify me"
 * (util-notify-me): AddToCartComponent calls `open(variantId)` with the selected size.
 *
 * Elements inside the <dialog-component> belong to that component's refs, so they are looked up
 * with data attributes instead.
 *
 * @extends {Component}
 */
class BackInStockComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.querySelector('dialog-component')?.addEventListener(DialogOpenEvent.eventName, this.#reset);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.querySelector('dialog-component')?.removeEventListener(DialogOpenEvent.eventName, this.#reset);
  }

  /**
   * Opens the modal with a size preselected.
   * @param {string} [variantId] - The sold-out variant the shopper is looking at.
   */
  open(variantId) {
    if (variantId) {
      this.dataset.variantId = variantId;
      const size = this.#find('[data-back-in-stock-variant]');
      if (size instanceof HTMLSelectElement) size.value = variantId;
    }

    /** @type {any} */ (this.querySelector('dialog-component'))?.showDialog();
  }

  /** Reopening after a successful signup starts from the form again. */
  #reset = () => {
    const form = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-form]'));
    const success = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-success]'));
    const heading = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-heading]'));

    if (heading?.dataset.headingDefault) heading.textContent = heading.dataset.headingDefault;
    if (form) form.hidden = false;
    if (success) success.hidden = true;
    this.#showError(null);
  };

  /** @param {string} selector */
  #find(selector) {
    return this.querySelector(selector);
  }

  /**
   * Enter in the email field submits instead of reloading the page.
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.submit();
  }

  /** Registers the notification with the Amp app. */
  submit() {
    const email = /** @type {HTMLInputElement | null} */ (this.#find('[data-back-in-stock-email]'));
    const submitButton = /** @type {HTMLButtonElement | null} */ (this.#find('[data-back-in-stock-submit]'));
    if (!email) return;

    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }

    const selectedSize = /** @type {HTMLSelectElement | null} */ (this.#find('[data-back-in-stock-variant]'));
    const variantId = Number(selectedSize?.value || this.dataset.variantId);
    const productId = Number(this.dataset.productId);

    const bis = /** @type {any} */ (window).BIS;
    if (!bis?.create || !variantId || !productId) {
      this.#showError(this.dataset.errorUnavailable);
      return;
    }

    this.#showError(null);
    if (submitButton) submitButton.disabled = true;

    try {
      bis.create(email.value.trim(), variantId, productId).then(
        /** @param {{ status?: string, message?: string, errors?: Record<string, string[]> }} data */ (data) => {
          if (submitButton) submitButton.disabled = false;

          if (data?.status === 'OK') {
            this.#showSuccess(email.value.trim(), selectedSize?.selectedOptions[0]?.textContent?.trim() ?? '');
            return;
          }

          const messages = Object.values(data?.errors ?? {})
            .flat()
            .filter(Boolean);
          this.#showError(messages.length ? messages.join('. ') : data?.message || this.dataset.errorGeneric);
        }
      );
    } catch (error) {
      console.warn('[back-in-stock] BIS.create failed:', error);
      if (submitButton) submitButton.disabled = false;
      this.#showError(this.dataset.errorGeneric);
    }
  }

  /**
   * @param {string} email
   * @param {string} size
   */
  #showSuccess(email, size) {
    const form = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-form]'));
    const success = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-success]'));
    const text = this.#find('[data-back-in-stock-success-text]');
    const heading = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-heading]'));

    if (text) {
      text.textContent = (this.dataset.successTemplate ?? '')
        .replace('[email]', email)
        .replace('[size]', size);
    }
    if (heading?.dataset.headingSuccess) heading.textContent = heading.dataset.headingSuccess;
    if (form) form.hidden = true;
    if (success) success.hidden = false;
  }

  /** @param {string | null | undefined} message */
  #showError(message) {
    const error = /** @type {HTMLElement | null} */ (this.#find('[data-back-in-stock-error]'));
    if (!error) return;

    error.textContent = message ?? '';
    error.hidden = !message;
  }
}

if (!customElements.get('back-in-stock-component')) {
  customElements.define('back-in-stock-component', BackInStockComponent);
}
