import { Component } from '@theme/component';
import { fetchConfig } from '@theme/utilities';
import { CartErrorEvent, CartLinesUpdateEvent } from '@shopify/events';

/**
 * Little Row: the "add a gift box" tick box in the cart summary.
 * The gift box is a product added as a single cart line, hidden in the cart list.
 *
 * @typedef {object} Refs
 * @property {HTMLInputElement} checkbox - The tick box.
 *
 * @extends {Component<Refs>}
 */
class CartGiftBox extends Component {
  requiredRefs = ['checkbox'];

  connectedCallback() {
    super.connectedCallback();

    // A gift box never stays in the cart on its own (e.g. the last piece was removed without JS).
    if (this.dataset.onlyItem !== undefined && this.refs.checkbox.checked) {
      this.refs.checkbox.checked = false;
      this.toggle();
    }
  }

  /**
   * Adds or removes the gift box to match the tick box.
   */
  toggle = async () => {
    const { checkbox } = this.refs;
    const { variantId, lineKey } = this.dataset;

    if (!variantId || checkbox.disabled) return;

    const quantity = checkbox.checked ? 1 : 0;
    checkbox.disabled = true;

    const sectionIds = new Set();
    for (const item of document.querySelectorAll('cart-items-component')) {
      if (item instanceof HTMLElement && item.dataset.sectionId) sectionIds.add(item.dataset.sectionId);
    }

    // cart-items-component and the cart icon listen for this event and re-render from its promise.
    const deferredUpdatePromise = CartLinesUpdateEvent.createPromise();
    this.dispatchEvent(
      new CartLinesUpdateEvent({
        action: quantity > 0 ? 'add' : 'remove',
        context: 'cart',
        lines: [quantity > 0 ? { merchandiseId: variantId, quantity } : { id: lineKey ?? '', quantity }],
        promise: deferredUpdatePromise.promise,
      })
    );

    try {
      // cart/update.js sets the quantity outright, so there is never more than one gift box.
      const body = JSON.stringify({
        updates: { [variantId]: quantity },
        sections: Array.from(sectionIds).join(','),
        sections_url: window.location.pathname,
      });
      const response = await fetch(Theme.routes.cart_update_url, fetchConfig('json', { body }));
      const data = await response.json();

      // cart/update.js reports failures as { status, description } rather than { errors }
      if (data.status) throw new Error(data.description || data.message || 'Failed to update gift box');

      deferredUpdatePromise.resolve({
        cart: CartLinesUpdateEvent.createCartFromAjaxResponse(data),
        detail: {
          sections: data.sections,
          items: data.items,
          itemCount: data.item_count,
          source: 'cart-gift-box',
          didError: false,
        },
      });
    } catch (error) {
      checkbox.checked = quantity === 0;
      deferredUpdatePromise.reject(error);
      this.dispatchEvent(
        new CartErrorEvent({
          error: (error instanceof Error && error.message) || 'Failed to update gift box',
          code: 'SERVICE_UNAVAILABLE',
        })
      );
    } finally {
      checkbox.disabled = false;
    }
  };
}

if (!customElements.get('cart-gift-box')) {
  customElements.define('cart-gift-box', CartGiftBox);
}
