/**
 * Updates the recently viewed products in localStorage.
 * Storage can be unavailable (private browsing, blocked site data), so every access is guarded.
 */
export class RecentlyViewed {
  /** @static @constant {string} The key used to store the viewed product ids in localStorage */
  static #STORAGE_KEY = 'little-row:recently-viewed';
  /** @static @constant {number} The maximum number of products to store */
  static #MAX_PRODUCTS = 6;

  /**
   * Adds a product to the front of the recently viewed list, removing any earlier entry for it.
   * @param {string} productId - The ID of the product to add.
   */
  static addProduct(productId) {
    if (!productId) return;

    const viewedProducts = [productId, ...this.getProducts().filter((id) => id !== productId)].slice(
      0,
      this.#MAX_PRODUCTS
    );

    try {
      localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(viewedProducts));
    } catch {
      // Storage unavailable
    }
  }

  static clearProducts() {
    try {
      localStorage.removeItem(this.#STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Retrieves the recently viewed product ids, newest first.
   * @returns {string[]} The list of viewed products.
   */
  static getProducts() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.#STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored.map(String) : [];
    } catch {
      return [];
    }
  }
}
