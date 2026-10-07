# Storefront UI kit

A click-through recreation of the Little Row storefront, built on the theme in
`jackellis-shopify-dev/LittleRow` (a fork of Shopify's Horizon).

Open `index.html`. Everything is fake data held in React state.

## Screens

| Screen | File | Built from |
| --- | --- | --- |
| Homepage — hero, marquee, new in, shop by age, story band | `home.view.js` | `templates/index.json` (hero + product-list sections) |
| Collection — sidebar facets, sort, 3-up grid, load more | `collection.view.js` | `templates/collection.json`, `blocks/filters.liquid` |
| Product — gallery, variant pickers, buy row, accordions, recommendations | `product.view.js` | `templates/product.json`, `blocks/variant-picker.liquid`, `blocks/quantity.liquid` |
| Header / footer | `chrome.view.js` | `sections/header-group.json`, `sections/footer-group.json` |
| Stand-in photography map | `imagery.js` | — (empty; add real imagery here) |
| Cart drawer, search overlay, personalisation modal | `overlays.view.js` | `assets/cart-drawer.js`, `blocks/_search-input.liquid`, `blocks/product-custom-property.liquid` |

## What to click

- Any product card or its "Quick add" → the cart drawer opens with the line added.
- Search icon → full-width search overlay with suggestions and results.
- On the product page, "add a name to the label" → the personalisation modal.
- Cart drawer → change quantities, remove lines; the subtotal recalculates.

## Imagery

No Little Row photography has been supplied, so every image slot renders a placeholder:
a tinted block with the monogram at 14%.

`imagery.js` is the single place to change that. It exports two empty maps — `PRODUCT_IMAGES`
(keyed by product title) and `SCENE_IMAGES` (`hero`, `newborn`, `baby`, `kids`, `fabric`,
`product-front`, `product-detail`, `product-worn`) — and `productImage`/`sceneImage` read from
them. Add entries pointing at files in `../../assets/` or any URL and the whole kit picks them
up; `Photo` falls back to the placeholder for anything still missing.

> Screen files are `*.view.js`, not `.jsx`, on purpose: the design-system compiler picks up
> every `.jsx` in the project, and a bundled second copy of these screens crashes the app.
> They are still JSX — `index.html` loads them with `type="text/babel"`.

### Mobile product gallery
Under 900px the PDP gallery (`.lr-pdp-media`) switches from a grid to a horizontally
scrolling, snapping filmstrip — each image is 86% wide so the next one peeks in, cueing the
swipe. Pure CSS in `responsive.css`; no JS carousel.
