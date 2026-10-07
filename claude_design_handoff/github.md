repo: jackellis-shopify-dev/LittleRow
branch: main

## Last sync

date: 2026-09-03T20:49:10Z

### Updated in this project

- Built the token set from `snippets/theme-styles-variables.liquid` and `config/settings_data.json`
- Copied the theme's 34 icon SVGs and `assets/base.css` into `assets/`
- Authored 24 components matching the theme's own block families
- Recreated the storefront (home, collection, product, cart drawer, search, personalisation)

## Screen map

| Project screen | Repo files |
| --- | --- |
| `ui_kits/storefront/Home.jsx` | `templates/index.json`, `blocks/_slide.liquid`, `blocks/_marquee.liquid`, `blocks/featured-collection.liquid` |
| `ui_kits/storefront/Collection.jsx` | `templates/collection.json`, `blocks/filters.liquid`, `snippets/product-card.liquid` |
| `ui_kits/storefront/Product.jsx` | `templates/product.json`, `blocks/variant-picker.liquid`, `blocks/swatches.liquid`, `blocks/quantity.liquid`, `blocks/price.liquid`, `blocks/buy-buttons.liquid`, `blocks/disclosures.liquid` |
| `ui_kits/storefront/Chrome.jsx` | `sections/header-group.json`, `sections/footer-group.json`, `blocks/_header-logo.liquid`, `blocks/_header-menu.liquid`, `blocks/email-signup.liquid` |
| `ui_kits/storefront/Overlays.jsx` | `assets/cart-drawer.js`, `blocks/_cart-summary.liquid`, `blocks/_search-input.liquid`, `blocks/product-custom-property.liquid` |
| `tokens/*.css` | `snippets/theme-styles-variables.liquid`, `config/settings_data.json`, `assets/base.css` |
| `components/*` | `assets/base.css`, `snippets/product-card-styles.liquid`, `blocks/*.liquid` |
| `assets/icon-*.svg` | `assets/icon-*.svg` |
