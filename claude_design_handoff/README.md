# Handoff: Little Row storefront

## Overview

Little Row is a kidswear brand. This bundle is the design for its storefront: homepage, collection/search results, product detail, plus the shared chrome (header, navigation, footer) and overlays (cart drawer, predictive search, personalisation and notify modals).

The design was built on top of the brand's existing Shopify theme — `jackellis-shopify-dev/LittleRow`, a fork of Shopify's **Horizon**. Structure, class contracts, token names and JS behaviour were derived from that theme's own Liquid and assets, so the implementation target is that theme unless told otherwise. `github.md` at the project root records the repo, branch and a screen→repo-file map.

## About the design files

The files in this bundle are **design references created in HTML/React**, not production code to ship. They are prototypes that show intended look and behaviour, running on fake data held in React state and rendered with in-browser Babel.

The task is to **recreate these designs in the target codebase** — for this project, the Horizon fork's Liquid sections/blocks + its vanilla-JS custom elements — using its established patterns. Do not port the React components as-is. Where this bundle names a Horizon file (e.g. `assets/header-menu.js`, `blocks/_header-menu.liquid`), that file is the place the behaviour belongs.

## Fidelity

**High fidelity.** Colours, type, spacing, radii, motion and interaction states are final and come from real tokens (`tokens/*.css`, generated from `snippets/theme-styles-variables.liquid` and `config/settings_data.json`). Implement pixel-accurately against the tokens rather than eyeballing the screenshots.

Two things are **not** final:
- **Photography.** No Little Row imagery has been supplied. Every image slot renders a placeholder (a tinted block with the monogram at 14% opacity). `ui_kits/storefront/imagery.js` is the single swap point — two maps, `PRODUCT_IMAGES` (keyed by product title) and `SCENE_IMAGES` (`hero`, `newborn`, `baby`, `kids`, `fabric`, `product-front`, `product-detail`, `product-worn`).
- **Prices, size-guide values and three swatch hexes** (brown `#7A5C43`, khaki `#7C7A5E`, sage `#9AA68F`) are placeholders pending real product data.

---

## Screens / views

### 1. Homepage — `ui_kits/storefront/home.view.js`
From `templates/index.json`.

- **Purpose:** brand entry; route to new-in and to age ranges.
- **Layout:** full-bleed hero → USP marquee → "new in" product row → shop-by-age collection cards → story band. Page max-width 1280px, side padding 32px (16px under 760px).
- **Hero:** full-bleed media with an overlaid text block; h1 at `--font-size--h1` (`clamp(3rem,5.6vw,3.5rem)`), one paragraph, one primary CTA. CTA vertical padding was deliberately reduced to **16px** (from 20px) on large buttons.
- **Marquee:** `Marquee` component, content `organic cotton · small batch · sized to grow into · made with love`.
- **Product rows:** `ProductCard`, 3-up desktop → 2-up at 900px → 2-up at 760px.
- **Responsive:** home blocks stack under 760px.

### 2. Collection / search results — `ui_kits/storefront/collection.view.js`
From `templates/collection.json` + `blocks/filters.liquid`.

- **Purpose:** browse the full range; also serves as the search-results template.
- **Layout:** left facet sidebar (fixed column) + product grid. Under 900px the sidebar becomes a collapsible filter row above the grid.
- **Header:** h1 (`shop all`, or the quoted query when arriving from search), a one-line description, a result count (`{n} pieces`), and a sort control.
- **Grid:** 3 → 2 → 2 columns, 8px gap.
- **Search behaviour:** the component takes a `query` prop. When set, the item list is filtered by title substring, the h1 becomes `"<query>"`, and the description becomes `{n} piece(s) match your search`.
- **Cards:** image, centred title, centred price. **No colour swatches on cards** — that was removed deliberately.

### 3. Product — `ui_kits/storefront/product.view.js`
From `templates/product.json` and its blocks.

- **Layout:** media column + buy column. Media is a grid desktop-side.
- **Mobile gallery:** under **900px** `.lr-pdp-media` becomes a horizontally scrolling, snapping filmstrip; each image is **86%** of the viewport wide so the next peeks in and cues the swipe. Pure CSS, no JS carousel. It must not stack.
- **Buy column:** title, price, variant swatches, `VariantButtons` for size, quantity, buy buttons, then accordions (description, size guide, delivery).
- **Size guide** lives in a dropdown and currently holds placeholder UK kidswear ranges.
- **Out of stock:** the **"notify me"** button is the *primary* action and opens a modal with size selection and email capture.
- **Related items** stay side-by-side on mobile (they do not stack).
- Viewing a product records it in `localStorage` under `little-row:recently-viewed` (see search below).

### 4. Header + navigation — `ui_kits/storefront/chrome.view.js`
From `sections/header-group.json`, `blocks/_header-logo.liquid`, `blocks/_header-menu.liquid`, `assets/header-menu.js`, `assets/header-drawer.js`.

**Menu structure** (built around the real range; age ranges kept verbatim):

| Top level | Children |
| --- | --- |
| new in | rowan knitted all-in-one · marlow cotton sweat set · view all new in |
| coats & layers | romie borg coat · avery colour block borg jacket · emerson borg gilet · view all coats & layers |
| knitwear & sets | rowan knitted all-in-one · remy knitted two-piece · marlow cotton sweat set · view all knitwear & sets |
| everyday | arlo cotton long sleeve top · river cotton dungarees · rucksack — coming soon · hat — coming soon |
| sleep & bath | ellis striped pyjamas · sage cotton robe · view all sleep & bath |
| shop by age | 0-3m · 3-6m · 2-3y · 4-5y |
| our story | (drawer only — not in the desktop row) |

Child links that name a product navigate straight to that product page; the rest go to the collection. Each panel also shows 1–2 **featured product tiles** at 4/5 ratio, drawn from that category (the Horizon `featured_products` menu style).

**Desktop behaviour** (port to `header-menu.js`):
- Submenus are **in the header flow**: opening one expands the header and **pushes page content down** (animated `grid-template-rows: 0fr → 1fr`, 240ms). They are not absolutely-positioned overlays.
- Pointer must **dwell 150ms** before a submenu commits, so skimming the row doesn't flash every panel.
- Focus opens a submenu immediately; click on a top-level item toggles it.
- `aria-expanded` / `aria-controls` on triggers; collapsed panels are set `inert` so their links can't be tabbed into.
- Escape closes and returns focus to the trigger. Pointer leaving the header closes.

**Header layout / responsive:**
- Above 1150px: wordmark centred, menu left, icons right.
- 761–1150px: switches to the theme's **logo-left** row (logo, menu, icons) — six menu items no longer fit either side of a centred wordmark.
- ≤760px: burger + drawer.

**Mobile drawer** (port to `header-drawer.js`):
- Slide-in panel from the left, `min(88vw, 400px)`, `--shadow-popover`, transform transition at `--drawer-animation-speed` / `--animation-timing-fade-in`, entered on the next animation frame so it animates rather than appearing.
- Dimmed backdrop (`--backdrop-opacity`) that dismisses on click; body scroll locked while open.
- Close **×** top-left inside the panel; the header button stays a burger glyph at all times.
- Submenus are **accordions that push the list down** — tapping a top-level item expands its children in place. They do **not** replace the panel contents. Caret rotates 180°. Collapsed links get `tabIndex={-1}`.
- Focus trap across the panel; first focusable is focused on open; Escape collapses an open section first, then closes; closing returns focus to the burger.
- Resizing above 760px dismisses the drawer.

### 5. Search overlay — `ui_kits/storefront/overlays.view.js`
From `blocks/_search-input.liquid` + `assets/predictive-search.js`.

- **Presentation:** full-width panel sliding down from the top over a dimmed backdrop; `role="dialog" aria-modal="true"`. Left column of suggestion links (`knitted`, `borg`, `cotton`, `pyjamas`), right column of results.
- **Open/close:** search icon, or **Cmd/Ctrl+K** (toggles). Opening focuses the input on the next frame. Closing resets term, query and selection.
- **Query:** debounced **200ms**. Empty input returns to the empty state immediately. Max 6 results, matched on title substring, `pending` (coming-soon) products excluded.
- **Empty state:** recently-viewed products from `localStorage` (`little-row:recently-viewed`, max 6 stored, 3 shown, newest first, de-duplicated) with a **clear** link. Falls back to "start typing to search".
- **Keyboard:** ↑/↓ and Tab/Shift-Tab cycle results (wrapping); the highlighted result carries `aria-selected` and a 1px outline at 35% foreground, offset 2px. Enter opens the highlighted result, or runs a full search when nothing is highlighted. Escape clears a non-empty term first, then closes.
- **Full search** navigates to the collection template with `query` set (see screen 2).
- Clicking dead space inside the dialog returns focus to the input.
- The clear button appears only when the field has a value.
- Result count line reads `{n} results for "<query>"`; no matches reads `nothing matches "<query>". press enter to search everything.`

### 6. Cart drawer + modals — `ui_kits/storefront/overlays.view.js`
From `assets/cart-drawer.js`, `blocks/_cart-summary.liquid`, `blocks/product-custom-property.liquid`.

- Cart drawer: line items with quantity steppers and remove, live subtotal, `CartSummary` footer. Any product card or its quick-add opens it with the line added.
- Personalisation modal: "add a name to the label" on the PDP.
- Notify modal: size select + email capture, opened from "notify me".

### 7. Footer — `ui_kits/storefront/chrome.view.js`
From `sections/footer-group.json`, `blocks/email-signup.liquid`.

- Background `#E8E3D6` (`--lr-cream-deep`) — darker than the page.
- Columns: **shop** (new in, coats & layers, knitwear & sets, everyday, sleep & bath, shop by age — mirrors the nav), **help**, **about**, plus email signup.
- Social icons (Instagram, TikTok, Pinterest) sit where "made with love" used to; column titles are darkened to match the "2026 little row" line.
- Full-width on mobile. Sections are intended to be **collapsible on mobile via Horizon's accordion component** — not yet wired; this is an open item.

---

## Interactions & behaviour summary

| Trigger | Result |
| --- | --- |
| Hover top-level nav item 150ms | Submenu expands in header, pushes content down |
| Focus top-level nav item | Submenu expands immediately |
| Escape in header | Close submenu, focus returns to trigger |
| Burger tap | Drawer slides in from left, scroll locked |
| Tap drawer item with children | Accordion expands below it |
| Escape in drawer | Collapse open section, else close drawer |
| Search icon / Cmd-K | Search overlay slides down, input focused |
| Type | 200ms debounce → up to 6 results |
| ↑ ↓ Tab | Cycle results, wrapping |
| Enter | Open highlighted result, else full search → collection |
| Quick add / product card | Cart drawer opens with line added |
| Scroll past 24px | Header `scrolled` state |

## State

Prototype-level state, for reference when wiring the real thing:

- `screen`, `product` — routing stand-in; real implementation uses theme templates.
- `query` — search term handed to the collection template.
- `search`, `menu`, `sub`/`openSub`, `active` — overlay/drawer/submenu open state.
- `cart` lines, `notify` target, personalisation value.
- `localStorage: little-row:recently-viewed` — array of product titles, newest first, capped at 6, wrapped in try/catch for private-mode failures.

## Design tokens

Do not hardcode values — all of these already exist as CSS custom properties in `tokens/`.

**Brand palette:** off-black `#1A1A1A` · warm taupe `#A69F92` · soft cream `#F2EFE6` · sand `#DCCAB5` · white `#FFFFFF`. Derived tints: cream-deep `#E8E3D6`, sand-light `#EFE4D6`, taupe-light `#C9C3B8`, ink-soft `#3A3833`. No hues outside these.

**Semantic:** `--surface-page` cream · `--surface-card` white · `--surface-sunken` cream-deep · `--surface-accent` sand · `--surface-inverse` off-black · `--text-body` off-black · `--text-subdued` ink-soft · `--text-muted` warm taupe · `--color-border` taupe-light.

**Buttons:** primary = off-black on cream text, hover ink-soft. Secondary = transparent with off-black border, hover fills sand.

**Type:** Familjen Grotesk for body and all UI; Newsreader for **h1–h2 only**. h3 and below are sans. Sizes: h1 `clamp(3rem,5.6vw,3.5rem)`, h2 `clamp(2.5rem,4.8vw,3rem)`, h3 2rem/600, h4 1.5rem/600, paragraph 0.875rem at line-height 1.6. Label preset: 0.625rem, letter-spacing 0.16em. **Brand voice is lowercase** — `--label-text-case: lowercase`, and copy is written lowercase throughout, with mixed case allowed at h1–h2.

**Spacing, radii, motion, layers:** `tokens/spacing.css`, `borders.css`, `motion.css`, `layout.css`. Key motion tokens: `--drawer-animation-speed`, `--animation-timing-fade-in/out`. Layers: `--layer-sticky` (header), `--layer-menu-drawer`, `--layer-overlay`.

**Breakpoints:** 1150px (header goes logo-left), 900px (facets collapse, grid to 2-up, PDP gallery to filmstrip), 760px (burger drawer, blocks stack).

## Assets

- **Icons:** `assets/icon-*.svg` — the theme's own 34 icons, copied verbatim, plus Instagram, TikTok and Pinterest added for the footer. Registered in `components/core/icons.js`.
- **Photography:** none supplied. See the imagery note under Fidelity.
- **Fonts:** Familjen Grotesk and Newsreader; `@font-face` / links declared in `tokens/fonts.css`.

## Implementing in Liquid

This ships as a Shopify theme, not an app. Everything below is Liquid + the theme's existing vanilla-JS custom elements — no React, no build step, no new dependencies.

**Where each piece belongs in the Horizon fork:**

| Design piece | Theme file(s) |
| --- | --- |
| Menu structure (7 top-level entries) | Shopify admin → Navigation → `main-menu`, as a two-level linklist. Do **not** hardcode the entries in Liquid. |
| Desktop submenu markup | `blocks/_header-menu.liquid` |
| Desktop submenu behaviour | `assets/header-menu.js` (the `<header-menu>` custom element) |
| Drawer markup | `blocks/_header-drawer.liquid` / the drawer partial in `sections/header-group.json` |
| Drawer behaviour | `assets/header-drawer.js` |
| Featured product tiles in panels | `snippets/product-card.liquid` at `image_ratio: portrait`, fed by a `menu_featured_products` block setting |
| Header layout + breakpoints | `assets/base.css` / the header section's own styles |
| Search overlay markup | `blocks/_search-input.liquid` |
| Search behaviour | `assets/predictive-search.js` |
| Recently viewed | `assets/recently-viewed-products.js` |
| Search results page | `templates/search.json` — reuse the collection template's grid and card |
| Footer columns | Shopify admin → Navigation → footer linklists; markup in `sections/footer-group.json` |
| Footer mobile accordions | Horizon's existing `<accordion-custom>` element |
| Tokens | `snippets/theme-styles-variables.liquid` + `config/settings_data.json` |

**Liquid-specific rules for this work:**

- **Menus come from linklists.** `linklists.main-menu.links` for top level, `link.links` for children. Product links are ordinary menu links pointing at product URLs; the "coming soon" pieces are menu links to products whose inventory is zero — render the suffix from the product, not from the link title.
- **Featured tiles** should be a section/block setting (product list, max 2 per menu item), not hardcoded handles.
- **Search** is Shopify's predictive search endpoint (`/search/suggest.json?q=&resources[type]=product&resources[limit]=6`), debounced 200ms, not a client-side filter over a catalogue array. The prototype's array filtering is only standing in for it.
- **Full search** submits the form to `/search?q=`, which renders `templates/search.json`.
- **Recently viewed** stores product *handles* in `localStorage`, then fetches each as a card section (`?section_id=`) or via the product JSON — the prototype stores titles for convenience only.
- **No inline styles.** Everything in this bundle is written inline because it is a prototype; in the theme it becomes CSS in the section's stylesheet or `base.css`, using the existing custom properties.
- **Progressive enhancement.** Menus and search must work with JS disabled: submenus are real `<ul>`s in the DOM, the search overlay wraps a real `<form action="/search">`.
- **Section rendering, not client routing.** The prototype fakes navigation with React state; in the theme every nav link is a real URL.

## Files in this bundle

```
PROMPT.md                    paste this into Claude Code to start the work
Little Row Storefront.html   self-contained click-through prototype — open this first
ui_kits/storefront/          the design source
  index.html                 entry (loads the .view.js files as text/babel)
  chrome.view.js             header, navigation, drawer, footer
  overlays.view.js           search overlay, cart drawer, modals, recently-viewed
  home.view.js               homepage
  collection.view.js         collection + search results
  product.view.js            product detail
  catalogue.js               the 14 products, tones, pending flags
  imagery.js                 photography swap point (empty)
  responsive.css             every breakpoint rule, keyed to lr-* classes
  README.md                  kit-level notes
tokens/                      9 CSS files — the full token set
styles.css                   token entry point
```

The 24 design-system components (5 groups, each with a `.d.ts` and a `.prompt.md` spec) live in `components/` in the Little Row design-system project itself — they are deliberately **not** copied here, because a second copy of the same component files breaks that project's compiler. Download the design system project if you want the component source; the prototype in this bundle already has them compiled in.

Screen files are `*.view.js` rather than `.jsx` deliberately — the design-system compiler picks up every `.jsx` in the project and a second bundled copy of the screens crashes the prototype. They are still JSX.

## Open items

- Product photography (14 SKUs + lifestyle).
- Real hexes for brown / khaki / sage swatches.
- Real prices for all fourteen items.
- Footer mobile sections still need Horizon's accordion wired in.
- Size spec sheet to replace the placeholder UK ranges.
