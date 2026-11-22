import { Component } from '@theme/component';
import { prefersReducedMotion } from '@theme/utilities';

/**
 * Little Row: "you may also like" in the cart drawer (snippets/cart-recommendations.liquid).
 *
 * Fetches sections/cart-recommendations.liquid from Shopify's recommendations endpoint (`data-url`) once
 * the element first scrolls into view, then again whenever the drawer's morph changes `data-url` (the
 * newest piece or the cart's products changed). `data-skip-subtree-update` keeps the fetched products
 * through those morphs. Nothing renders until products arrive, and an empty or failed fetch leaves the
 * element empty.
 *
 * @extends {Component}
 */
class CartRecommendations extends Component {
  static observedAttributes = ['data-url'];

  /** @type {AbortController | null} */
  #abortController = null;

  /** @type {IntersectionObserver | null} */
  #observer = null;

  /** @type {string | null} */
  #loadedUrl = null;

  #seen = false;

  connectedCallback() {
    super.connectedCallback();

    // An empty element has no height, but a zero-area target still intersects once the drawer is open.
    this.#observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.#seen = true;
        this.#observer?.disconnect();
        this.#observer = null;
        this.#load();
      },
      { rootMargin: '200px' }
    );
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.#observer = null;
    this.#abortController?.abort();
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'data-url' || oldValue === newValue || !this.#seen) return;
    this.#load();
  }

  async #load() {
    const url = this.dataset.url;
    if (!url || url === this.#loadedUrl) return;

    this.#abortController?.abort();
    const abortController = new AbortController();
    this.#abortController = abortController;

    try {
      const response = await fetch(url, { signal: abortController.signal });
      if (!response.ok) throw new Error(`Cart recommendations failed: ${response.status}`);

      const html = await response.text();
      const content = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-cart-recommendations]');
      const elements = content ? Array.from(content.children) : [];

      this.replaceChildren(...elements);
      this.#loadedUrl = url;
    } catch (error) {
      if (abortController.signal.aborted) return;
      this.replaceChildren();
      console.error(error);
    }
  }

  scrollPrevious = () => this.#scrollByCard(-1);

  scrollNext = () => this.#scrollByCard(1);

  /**
   * Scrolls the row by one card.
   * @param {number} direction - -1 for previous, 1 for next
   */
  #scrollByCard(direction) {
    const list = this.querySelector('.cart-recommendations__list');
    const card = list?.firstElementChild;
    if (!(list instanceof HTMLElement) || !(card instanceof HTMLElement)) return;

    const style = getComputedStyle(list);
    const gap = parseFloat(style.columnGap) || 0;
    const rtl = style.direction === 'rtl' ? -1 : 1;

    list.scrollBy({
      left: direction * rtl * (card.offsetWidth + gap),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }
}

if (!customElements.get('cart-recommendations')) {
  customElements.define('cart-recommendations', CartRecommendations);
}
