# Little Row: Shopify theme (Horizon fork)

Read this before working in the repo. It covers how Horizon is built, where its design tokens live, and every change made for Little Row, with the reasons behind them.

- **Repo:** `jackellis-shopify-dev/LittleRow` (remote `origin`, branch `main`)
- **Base:** Shopify **Horizon v4.1.5** (see `release-notes.md`). Upstream updates arrive as "Horizon vX.Y.Z" merge PRs from `Shopify/horizon`.
- **Brand:** Little Row, a kidswear label. Lowercase brand voice, organic cotton, small batch.
- **Design source:** `claude_design_handoff/` (uncommitted). A React/HTML prototype plus token CSS. It's a **reference only; never port it**. Start with `claude_design_handoff/README.md`.

---

## 1. Working rules

1. **Liquid plus Horizon's vanilla-JS custom elements only.** No React, no new dependencies, no build step. Follow the pattern of the file you're editing.
2. **Tokens, not hex.** Use the existing CSS custom properties (§5). New colours go in `snippets/brand-tokens.liquid` as tokens, never inline.
3. **Horizon breakpoints:** `750px` (mobile/desktop) and `990px` (tablet/desktop). Don't introduce the prototype's 760/900/560; the owner chose to keep Horizon's. Exception: the header uses `1150px` for its logo-left switch.
4. **Progressive enhancement:** real `<ul>` menus, real links, a real `<form action="/search">`. Everything must work without JS.
5. **Accessibility is part of the design:** `aria-expanded`/`aria-controls`, `inert` on collapsed panels, focus traps, Escape handling, focus return.
6. **Content comes from admin:** menus from linklists and products from collections or settings. Don't hardcode handles or copy that a merchant would edit.
7. **Touch only what the task needs.** Prefer small, commented overrides in the relevant file over rewriting Horizon code, so upstream merges stay manageable.
8. **Run `shopify theme check` before calling anything done** (baseline in §9).
9. **Work in steps:** plan, wait for OK, implement one step, report what changed and what to click in the preview. The owner reviews in the Shopify preview after each step.
10. **Everything must stay editable in Customize.** Never hard-code a value in CSS that an existing section, block or theme setting controls (sizes, colours, gaps, presets, case). Put the design value into the setting (template/group JSON) instead. Where Horizon has no setting and the owner may want to change it, add one to the schema (with locale labels). Hard-coded CSS is only for layout details with no setting. If an override is unavoidable, make it conditional on the setting's default (see button case in `brand-tokens`).
11. **Never use em dashes** in copy, locale strings, comments or docs. Use a hyphen (`-`), e.g. "colour - cream", " - coming soon".

## 2. Commands

```sh
shopify theme check                      # lint (Theme Check). JSON: --output json
shopify theme dev                        # local preview against the store
shopify theme push / pull                # sync with the store (pull brings admin edits into settings_data.json and *-group.json)
```

JS syntax check (files are ES modules): copy to the scratchpad as `.mjs`, then run `node --check file.mjs`.

---

## 3. Directory map

| Dir | Count | What lives there |
| --- | --- | --- |
| `layout/` | 2 | `theme.liquid` (main), `password.liquid` |
| `templates/` | 13 | JSON templates (`index`, `product`, `collection`, `search`, `cart`, `page`, `page.contact`, `blog`, `article`, `list-collections`, `404`, `password`) plus `gift_card.liquid` |
| `sections/` | 42 | Sections plus section groups `header-group.json` and `footer-group.json` |
| `blocks/` | 95 | Theme blocks. `_`-prefixed = **private** (only usable where a parent names them); others are public and can nest anywhere `@theme` is accepted |
| `snippets/` | 148 | Partials, `*-styles.liquid` CSS-only snippets, `util-*` helpers that echo values |
| `assets/` | 129 | 81 JS modules, `base.css`, `overflow-list.css`, SVG icons, fonts |
| `config/` | 2 | `settings_schema.json` (global settings definitions), `settings_data.json` (values; **admin writes here**) |
| `locales/` | 57 | `*.json` storefront strings and `*.schema.json` editor labels; `en.default*` is the source |

### How a page renders (`layout/theme.liquid`)

`<head>` renders these snippets in order:
1. `meta-tags`
2. `stylesheets` (loads `base.css`)
3. `card-hover-effect-styles`
4. `fonts` (preloads font-picker fonts)
5. `scripts` (import map plus global modules)
6. `theme-styles-variables` (most `:root` tokens)
7. `color-palette` (colour tokens from settings)
8. **`brand-tokens`** (Little Row overrides; must come last)
9. `theme-editor` (design mode only)

`<body>` contains:
- `div.page-wrapper`, holding `#header-group` (the `header-group` sections), an inline script that measures header heights and sets `data-menu-style`, `main#MainContent`, and `footer` (the `footer-group` sections).
- After the wrapper: `cart-drawer`, `theme-drawer`, **`search-modal`**, and `quick-add-modal` if quick add is enabled.

**Scroll container:** at ≥990px Horizon scrolls `.page-wrapper`, not the document (`assets/scroll-container.js`, `SQUEEZE_QUERY`). Always use `getScrollTop()` / `getScrollEventTarget()` from `@theme/scroll-container`, never `window.scrollY`.

### Templates (current)
- `index`: `hero`, then `product-list` (product card blocks)
- `product`: `product-information` (disclosures), then `product-recommendations`
- `collection`: `section` (title and description text blocks), then `main-collection` (filters, `_product-card`, gallery, title, price, **swatches**)
- `search`: `search-header` (`_heading`, `_search-input`), then `search-results` (filters, `_product-card`, gallery, title, price)
- `cart`: `main-cart`, then `product-list`

---

## 4. Horizon architecture

### Liquid patterns
- **Theme blocks:** sections render children with `{% content_for 'blocks' %}`. Fixed children use **static blocks**: `{% content_for 'block', type: '_heading', id: 'heading', text: ... %}`, with `"static": true` in template JSON. Extra params (e.g. `text`, `closest.product`) pass data into the block.
- **`{% doc %}`** headers declare snippet params. Theme Check flags unused or unknown params.
- **`{% stylesheet %}`** per file: static CSS, bundled by Shopify. **No Liquid inside.** Dynamic values go in `{% style %}` or inline `style="--var: …"`.
- **Style helper snippets** echo declarations into `style=""`: `spacing-style` (padding from `padding-block-*` settings), `size-style`, `gap-style`, `typography-style`, `menu-font-styles`, `submenu-font-styles`.
- **`contrast-override`**: when a block or section has a custom `background_color`, it emits a `.color-custom-{id}` class with text and border colours contrast-checked against the palette.
- **`util-*` snippets** echo a computed value, e.g. `util-product-grid-card-size` gives the min card width for grids (small 165 / medium 250 / large 340 / extra-large 480px).
- **Section Rendering API:** JS re-fetches a section's HTML (`sectionRenderer.getSectionHTML(id, …, url)`) and applies it with `morph()`. `section.index == blank` means the section is being rendered through the API; header snippets use that to eager-load heavy content only on the second render.
- **Translations:** `'key' | t`. Pluralise with `{ "one": …, "other": … }` plus `count:`. `t` escapes interpolated values (don't pre-escape). Schema labels use `t:settings.x`, `t:info.x`, `t:content.x`, `t:options.x`, `t:names.x`.

### JS patterns (`assets/*.js`, native ES modules)
- **Import map** in `snippets/scripts.liquid`: `@theme/component`, `@theme/utilities`, `@theme/events`, `@theme/dialog`, `@theme/focus`, `@theme/morph`, `@theme/section-renderer`, `@theme/scroll-container`, `@theme/recently-viewed-products`, and others. New shared modules need an entry there. Feature scripts load with `<script type="module" src="{{ 'x.js' | asset_url }}">` next to their markup.
- **`Component`** (`assets/component.js`) is the base class for custom elements:
  - `ref="name"` makes `this.refs.name`; `ref="items[]"` makes an array. `requiredRefs = [...]` throws if one is missing. Refs stay in sync through a MutationObserver.
  - **Declarative events:** `on:click="/method"` calls `method` on the closest Component. `on:click="tag-name/method"` targets the closest ancestor matching the selector; `on:click="#id/method"` targets an element by id. One capture-phase listener on `document` per event type dispatches to the **closest element carrying the `on:` attribute**, so only one handler runs per event.
    - When the attribute sits on an ancestor of the real target, `event.target` is proxied to that ancestor. Use `document.activeElement` if you need the real focused element.
    - Because dispatch happens at document capture, `event.stopPropagation()` in a handler prevents component-level `addEventListener` handlers (e.g. `dialog-component`'s Escape) from running.
  - Private `#fields` hold listeners. Clean up in `disconnectedCallback`, often with an `AbortController`.
- **`utilities.js`:**
  - Timing: `debounce(fn, ms)` (has `.cancel()`), `throttle`, `requestIdleCallback`, `onAnimationEnd(el, cb, {subtree})`, `onDocumentLoaded`, `prefersReducedMotion`.
  - Scroll and breakpoints: `lockScroll`/`unlockScroll`, `mediaQueryLarge` (`min-width: 750px`), `isMobileBreakpoint()`.
  - Header: `setHeaderMenuStyle()`, `calculateHeaderGroupHeight()`.
- **`events.js`:** `ThemeEvents` names plus event classes (`MegaMenuHoverEvent`, etc.). `dialog.js` exports `DialogComponent`, `DialogOpenEvent` and `DialogCloseEvent`.
- **`focus.js`:** `trapFocus(container)` (Tab/Shift+Tab cycling plus a focusin guard; the list of focusable elements is fixed when the trap starts) and `removeTrapFocus()`.
- **`dialog-component`:** wraps a native `<dialog>` with `showDialog`/`closeDialog`/`toggleDialog`. It closes on Escape (component keydown) and on clicks outside the dialog. Closing adds `.dialog-closing` and waits for `animationend`.
- **`accordion-custom`:** wraps `<details>`. Attributes: `open-by-default-on-mobile`/`-desktop`, `data-disable-on-mobile`/`-desktop`, `data-close-with-escape`. Open/close animates `::details-content` block-size (push-down) with `interpolate-size`.

### Header internals (important before touching nav)
- **`sections/header.liquid` → `<header-component id="header-component">`** (`assets/header.js`):
  - Holds rows `.header__row--top` / `--bottom`. Each has `.header__columns`, a 3-column grid (`left center right`) built by `snippets/header-row.liquid` from `*_position` settings.
  - Sets `data-menu-style="menu|drawer"` (drawer on touch devices or when the menu overflows) and `sticky="always|scroll-up"` / `data-sticky-state`.
  - A ResizeObserver keeps `--header-height` on `body`.
  - Underlays (`.header__underlay-open/-closed`) paint the row and submenu backgrounds.
- **`blocks/_header-menu.liquid` → `<header-menu>`** (`assets/header-menu.js`):
  - Top-level items are slotted into `<overflow-list>` (shadow DOM, with a "More" slot).
  - Each item with children has a link (`ref="menuitem"`), a hidden disclosure button (`ref="disclosure[]"`, `aria-expanded`, `aria-controls`, `on:click="/toggle"`) and `.menu-list__submenu` (`inert` when closed).
  - Submenus are absolutely positioned and revealed with `clip-path`. JS sets `--submenu-height` and `--full-open-header-height` on the header, plus Safari "safety box" pointer tracking.
  - Mega menu content comes from `snippets/mega-menu-list.liquid`. `menu_style` = `text | collection_images | featured_products | featured_collections`; featured products come from the **top-level link's collection**.
- **`snippets/header-drawer.liquid` → `<header-drawer>`** (`assets/header-drawer.js`): `<details ref="details" scroll-lock>` → `.menu-drawer` (`ref="menuDrawer"`) → `nav`, then utility links and the backdrop. It has three render paths (accordion 2-level, flat 2-level, 3-level sliding submenus). **Liquid complexity is at the Theme Check limit (120)**: move new logic into snippets.
- **Search:** header search button → `snippets/search.liquid` (`on:click="#search-modal/showDialog"`) → `snippets/search-modal.liquid` (`dialog-component#search-modal` > `predictive-search-component`) → results via the Section Rendering API from `sections/predictive-search.liquid`. The empty state comes from `sections/predictive-search-empty.liquid` (`snippets/predictive-search-empty-state.liquid`), with recently viewed products inserted into `#predictive-search-products`. Recently viewed IDs are recorded in `snippets/scripts.liquid` on product pages (`RecentlyViewed.addProduct(product.id)`).
  - **Note:** `blocks/_search-input.liquid` is the **search page's** input, not the overlay.

### Footer internals
- `sections/footer.liquid` is a grid of blocks (`--grid-columns` = block count, up to 4). Allowed blocks include `group`, `menu`, `logo`, `text`, `email-signup` and `social-links`.
- `sections/footer-utilities.liquid` is the bottom row (max 3 blocks: `footer-copyright`, `footer-policy-list`, `social-links`), with layout by block count.
- `blocks/menu.liquid` renders `<accordion-custom>` > `<details>`. It's always open on desktop; on mobile it's an accordion when `show_as_accordion`. Headings use `heading_preset` classes (`h1`–`h6`, `paragraph`).
- `blocks/social-links.liquid` only renders an icon on the storefront when the URL has a profile path (a bare domain renders in the editor only).

---

## 5. Design tokens and variables

### Where they come from (later wins)
1. **`snippets/theme-styles-variables.liquid`**, from settings and hardcoded values. It defines:
   - **Layout:** page widths (`--narrow-page-width: 90rem`, `--normal-page-width: 120rem`, `--wide-page-width: 150rem`, `--page-width`), section heights, safe-area insets.
   - **Type:**
     - Families, weights and styles: `--font-{body|subheading|heading|accent}--{family|weight|style}`.
     - Presets for `paragraph` and `h1`–`h6`: `--font-{preset}--{size|family|weight|style|case|line-height|letter-spacing}`.
     - Sizes: `--font-size--{3xs…6xl}` and `--font-size--h1…h6`; h1–h6 are fluid `clamp()` values from the `type_size_*` settings.
     - Line height and tracking: `--line-height--{display|heading|body}-{tight|normal|loose}`, `--letter-spacing--*`.
   - **Spacing:** `--margin-*`, `--padding-{3xs…6xl}`, `--gap-{3xs…3xl}`, `--section-padding-block`.
   - **Opacity:** `--opacity-{5…90}`, `--opacity-subdued-text` (.8), `--opacity-muted-text` (.6), `--backdrop-opacity` (.15), `--backdrop-color-rgb`.
   - **Borders and radii:** `--style-border-radius-{buttons-primary|buttons-secondary|inputs|popover|card|product-media|badge|swatch|variant-button}`, `--style-border-width*`.
   - **Motion:** `--animation-speed{-fast|-medium|-slow}`, `--drawer-animation-speed` (0.2s), `--submenu-animation-speed` (360ms), `--ease-out-cubic`, `--ease-out-quad`, `--animation-timing-{fade-in|fade-out|hover|active|bounce|default}`.
   - **Layers:** `--layer-{section-background:-2|lowest:-1|base:0|flat:1|raised:2|heightened:4|sticky:8|window-overlay:10|header-menu:12|overlay:16|menu-drawer:18|temporary:20}`.
   - **Components:** `--minimum-touch-target` (44px), `--icon-size-{2xs…lg}`, buttons (`--button-padding-block` 16px, `--button-text-case-*`), inputs, checkbox, drawers (`--drawer-width`, `--drawer-max-width`, `--drawer-padding`), modal (`--modal-max-height`), badges, variant pickers.
2. **`snippets/color-palette.liquid`**, from colour settings. It defines:
   - **Page colours:** `--color-background(-rgb)` and `--color-foreground(-rgb)`. `--color-border(-rgb)` defaults to the page text colour.
   - **Palette extremes:** `--palette-lightest/-darkest`.
   - **Buttons:** `--color-{primary|secondary}-button-{text|background|border|hover-*}`. Hovers are computed by `util-palette-hover-shift`.
   - **Inputs:** `--color-input-{background|text|border}`.
   - **Variants:** `--color-variant-*`, `--color-selected-variant-*`.
   - **Subdued and muted text:** `--color-foreground-{muted|subdued}`.
   - **Shadows:** `--shadow-drawer` and `--shadow-popover`, only when the drop-shadow settings are on.
3. **`snippets/brand-tokens.liquid`** (Little Row, rendered after the above in both layouts), described next.

### Little Row tokens (`snippets/brand-tokens.liquid`)
| Token | Value |
| --- | --- |
| `--lr-off-black` / `--lr-warm-taupe` / `--lr-soft-cream` / `--lr-sand` / `--lr-white` | `#1a1a1a` / `#a69f92` / `#f2efe6` / `#dccab5` / `#fff` (plus `-rgb` triplets) |
| `--lr-cream-deep` / `--lr-sand-light` / `--lr-taupe-light` / `--lr-ink-soft` | `#e8e3d6` / `#efe4d6` / `#c9c3b8` / `#3a3833` |
| `--surface-page` / `-card` / `-sunken` / `-accent` / `-inverse` | cream / white / cream-deep / sand / off-black |
| `--text-body` / `-subdued` / `-muted` / `-on-inverse` / `-on-accent` | off-black / ink-soft / warm-taupe / cream / off-black |
| `--color-border(-rgb)` | taupe-light |
| `--color-shadow-rgb` | off-black (**Horizon never defined this**, so backdrops using `--backdrop-color-rgb` were invalid) |
| Button hovers | primary to ink-soft, secondary to sand. `--button-text-case-*: lowercase` **only while** `button_text_case_*` is not `uppercase` |
| `--shadow-popover` | `0 8px 24px rgb(off-black / .08)` **only while** `popover_drop_shadow` is on |
| Fonts | body and subheading: **Familjen Grotesk** (subheading 500); heading and accent: **Newsreader** 500; `--font-script--family`: **Dancing Script** (personalisation preview only) |
| Heading sizes | **not overridden**; they come from Theme settings → Typography (`type_size_h1…h6`). `--font-h3/h4--weight: 600` |
| Label preset | **Removed** (2026-09-24, owner: too small and hard to read). The tiny, tracked `--font-label--*` style is gone; don't reintroduce it. Former uses are small sans text at `--font-size--sm` in subdued colours |

**Type roles:** Newsreader is for h1–h2 only; h3 and below are sans (`type_font_h3/h4 = subheading`). Brand copy is lowercase at source; mixed case is allowed at h1–h2.

### Theme settings (`config/settings_data.json` → `current`)
- **Palette:** `background #F2EFE6`, `foreground #1A1A1A`, `color1 #E8E3D6` (cream-deep: footer bg), `color2 #DCCAB5` (sand), `color3 #C9C3B8` (taupe-light: dividers and input borders).
- **Buttons:** primary is foreground on background; secondary is transparent `rgba(0,0,0,0)` with a foreground border. Radius 14px (both).
- **Inputs:** `#FFFFFF` background with a `color3` border, radius 4px.
- **Badges:** sold out is `color1` with `#3A3833` text; sale is foreground on background.
- **Fonts:** all four pickers are `sans_serif_n4`, a **system** handle, so nothing downloads.
  - `sans-serif_n4` with a hyphen is invalid and push fails.
  - The real families are overridden in `brand-tokens`, so changing a font picker in the editor has no visible effect.
- **Logo:** 36px desktop / 28px mobile. The design calls for 30px desktop; a 30px value was later overwritten by an admin save, so set it in the theme editor. The logo and favicon images were set in admin.
- **Search:** `search_suggestions: "knitted, borg, cotton, pyjamas"` (new setting).
- Settings groups in the schema: logo, colours, typography, page layout, animations, badges, buttons, cart, drawers, icons, inputs, popovers, prices, product cards, search, swatches, variant pickers.

**Self-hosted fonts** (`assets/`): `familjen-grotesk(.woff2|-italic.woff2)` (400–700 variable), `newsreader(.woff2|-italic.woff2)` (300–600 / 300–500, opsz). `dancing-script.woff2` (400-700 variable, OFL, not preloaded; only the embroidery preview uses it). `rockwell-bold.woff2` / `clarendon-bold.woff2` (700 only, latin subset, not preloaded; families `LR Rockwell` / `LR Clarendon`, tokens `--font-embroidery-{rockwell|clarendon}--family`): the personalisation font choices, converted from the owner's OTFs (originals in `claude_design_handoff/fonts/`, kept out of `assets/`). Their web licence is the owner's responsibility. Latin subset from Google Fonts. The regular Familjen Grotesk is preloaded.

---

## 6. Little Row changes by area

### Step 0: brand tokens
- `snippets/brand-tokens.liquid` (new), rendered in `layout/theme.liquid` and `layout/password.liquid` after `color-palette`.
- `config/settings_data.json`: palette, buttons, inputs, badges, font pickers, h3/h4 as subheading with tight tracking.
- Four woff2 files in `assets/`.

### Step 1: desktop header navigation
- **`assets/header-menu.js`:**
  - **Hover dwell is real:** `activate()` on `pointerenter` waits `HOVER_COMMIT_DELAY_MS` (150ms) before `#commit()` opens the submenu. Horizon originally opened instantly and only delayed `MegaMenuHoverEvent`, which nothing in the theme listens to. Focus and click open immediately. Repeat enters on the pending item don't restart the timer (`#pendingHoverItem`, needed for Safari's synthetic `pointerenter`).
  - Moving the pointer between top-level items keeps the open submenu until the next dwell commits (`deactivate()` returns early on `pointerleave` into a sibling list item).
  - **Desktop submenus use Horizon's default overlay dropdown and do not push page content down.** A push-down (padding on `.header-section`) was built and then removed at the owner's request; don't reintroduce it.
- **`sections/header.liquid` (CSS):**
  - **750–1150px:** a centred logo moves to the start of the row (`grid-template-areas: 'center left right'`).
- **`blocks/_header-menu.liquid`:**
  - New settings `hide_childless_links_desktop` (skips top-level links without children, keeping "our story" drawer-only), `featured_products_count` (1–3) and `drawer_featured_content`.
  - Panel CSS: 24/32px padding, 140px product tiles with small titles and no price. Child link size and colour come from the "Submenu size" setting (`menu_font_style: regular` = small, subdued).
- **`snippets/mega-menu-list.liquid`:** new `max_featured_products_count` param; adds the "coming soon" suffix.
- **`snippets/menu-link-suffix.liquid` (new):** renders " - coming soon" when a menu link is a `product_link` whose product is unavailable. Shared by the mega menu and the drawer.
- **`sections/header-group.json`:** logo centre, 1px bottom border, `menu_font_style: regular`, `menu_style: text` (featured product tiles removed from the desktop mega menu at the owner's request, 2026-09-25; was `featured_products`, 2 per item), `hide_childless_links_desktop: false` (turned off 2026-09-25 so "new in", which has no children, shows on desktop; "our story" is no longer in `main-menu`), `drawer_accordion: true`, `drawer_featured_content: false`.

### Step 2: mobile drawer
- **`assets/header-drawer.js`:**
  - **Opening:** traps focus on `menuDrawer` immediately and focuses the close button.
  - **Escape:** first closes an open `accordion-custom > details`, then a sliding submenu, then the drawer.
  - **Closing:** releases the trap at once and returns focus to the burger `summary`.
  - **Resize:** closes the drawer when `mediaQueryLarge` starts matching.
- **`snippets/header-drawer.liquid`:**
  - Markup: caret icon (`icon-caret icon-animated`) on accordion summaries, coming-soon suffix on child links, account link at the foot, featured content gated by `drawer_featured_content`.
  - Panel: `min(88vw, 400px)` wide with `--shadow-popover` and a `--animation-timing-fade-in` slide.
  - Backdrop: `rgb(var(--backdrop-color-rgb) / var(--backdrop-opacity))`.
  - Close button top-left, burger never swaps to ×, no staggered item animation.
  - Items: top level is `xl` with 14px padding, in the font from the menu block's new **`drawer_font`** setting ("Drawer font", default heading). Children follow the block's "Submenu size" setting, with 10px padding. 240ms accordion.
- **`snippets/header-drawer-account-link.liquid` (new):** account link, extracted to stay under the Liquid complexity limit.

### Step 3: predictive search overlay
- **`snippets/search-modal.liquid` (rewritten):**
  - Layout: a full-width panel that slides down from the top over the backdrop; the search field with a clear button (hidden until typing) and close ×.
  - Suggestions: a column from `settings.search_suggestions`, as real `/search?type=product&q=` links with `on:click="/applySuggestion"`.
  - Results column; a hidden `type=product` input keeps no-JS searches to products.
  - All styles are scoped under `.search-modal` and override `predictive-search-styles` / `dialog-styles`.
- **`assets/predictive-search.js`:**
  - **Opening:** Cmd **or Ctrl**+K toggles (with `preventDefault`), and the input is focused on every open (`#focusInputOnOpen`).
  - **Typing:**
    - `search()` resets immediately when the field is empty; otherwise `#debouncedSearch` fires after 200ms.
    - Requests use `resources[type]=product`, `resources[limit]=6` and `resources[options][unavailable_products]=hide`.
    - `applySuggestion()` searches without the debounce.
  - **Keys:**
    - Escape clears a non-empty term (`stopPropagation`, so the dialog stays open); an empty-field Escape closes.
    - Enter and arrow/Tab cycling only act while the input has focus (`document.activeElement`), and cycling only while a term is present.
    - Enter with nothing highlighted goes to `/search?q=…&type=product`.
  - The single-result auto-redirect is removed, and `aria-expanded` on the combobox is synced.
- **`assets/recently-viewed-products.js`:** key `little-row:recently-viewed` (was `viewedProducts`), max 6 **product IDs**, newest first, deduplicated, try/catch around storage.
- **`sections/predictive-search.liquid`:** products only; a `{n} results for "q"` label, or the "nothing matches…" line; recently viewed limited to 4 (four columns on desktop, 2 x 2 on mobile; the "clear" link is `--font-size--sm` in the subdued colour).
- **`snippets/predictive-search-empty-state.liquid`:** a "start typing to search" hint inside `#predictive-search-products`, hidden by CSS when recently viewed items are inserted.
- **`snippets/predictive-search-products-list.liquid`:** the recently viewed order loop respects `limit` and skips missing products.
- `predictive-search-resource-carousel.liquid` is now unused (left in place for upstream merges).
- **`config/settings_schema.json`:** new `search_suggestions` text setting (Search group).

### Step 4: search results page
- **`templates/search.json`:** heading preset h1 in the heading font; filters `vertical` with `enable_grid_density: false`; `product_card_size: large` (3 columns beside the sidebar, 2 below via Horizon's container query); horizontal gap 8, vertical 24; product title and price centred at 100% width.
- **`sections/search-header.liquid`:**
  - A panel inside a `spacing-style` wrapper, coloured by the new **`panel_color`** section setting ("Panel background", default `color2` sand).
  - The h1 is `“terms”` (or "Search" with no query), with a "{n} pieces match your search." line.
  - The `_search-input` block only shows with no query or zero results.
- Overlay searches add `type=product` so the counts match the product grid.

### Step 5: footer
- **`sections/footer-group.json`** (colours and sizes live in block settings, not CSS):
  - Blurb `text` block: `type_preset: paragraph`, `text_color: #3A3833`. Menus: `background_color: color1` plus `text_color: #3A3833` (a menu's text colour only applies when it has a background colour; see `contrast-override`). Email `heading_text_color`, copyright `text_color` and social `icon_color` are all `#3A3833`; utilities `divider_color: #1A1A1A1A`.
  - Brand group: `logo` 56px, blurb `text`, `email-signup` ("join the list", default inputs, primary "sign up").
  - Menus: `menu` shop = `main-menu` with `hide_childless_links: true`, help = `footer`, about = `footer-about`, legal = `footer-legal`. All are accordions on mobile with caret and dividers, heading preset Default.
  - Background `color1`, gap 48, padding 56/32.
  - Utilities: `footer-copyright` (no "powered by", 0.875rem), `payment-icons` (centred, gap 8, new **`icon_colour`** setting "Icon colour" = tonal: `grayscale(1) sepia(0.3) contrast(0.9)`, `mix-blend-mode: multiply`, 80% opacity, so the brand colours become the palette's warm neutrals; `full` is Horizon's look; Horizon's block, added to `footer-utilities`' allowed blocks on 2026-09-25; icons come from the store's enabled payment methods) and `social-links` (Instagram/TikTok/Pinterest). Three blocks use Horizon's 3-column layout at ≥750px (left, centre, right) and stack centred below 750px. The policy list is not used: policies are the "legal" menu column instead.
- **`blocks/menu.liquid`:** new `hide_childless_links` setting.
- **`sections/footer.liquid` (CSS):**
  - Grid: 1.4fr/1fr/1fr/1fr at ≥990px; brand column max 320px. With five blocks (brand + four menus), `:has(> :nth-child(5):last-child)` makes it 1.4fr + 4 x 1fr on one row at ≥990px, and at 750-989px the brand spans the top with the four menus in a row below (Horizon caps at four columns and would isolate the fifth).
  - Headings are small sans headings (subheading font and weight, `--font-size--sm`, lowercase) **only when the heading preset is Default** (`:not(.paragraph, .h1…h6)`). Colours and link size are not set in CSS.
  - Mobile: stacked accordions with 44px rows and 10% dividers; the signup stacks.
- **`sections/footer-utilities.liquid` (CSS):** a 2-block row kept horizontal at all widths. Colour, size, case, icon colour and divider come from settings; the copyright is no longer forced to lowercase.

### Scrolled header (after Step 5)
- **`assets/header.js`:** `#updateScrolledState()` toggles `data-scrolled` past `SCROLLED_ENTER_THRESHOLD` (24px) and clears it below `SCROLLED_EXIT_THRESHOLD` (4px). The gap is hysteresis, so the swap doesn't flicker at the boundary. It runs on every scroll frame and on connect.
- **`blocks/_header-logo.liquid`:** new `scrolled_logo` (image) and `scrolled_logo_height` (default 24). Both logos stack in one grid cell and crossfade over 240ms. It keeps the wordmark's width, so a monogram sits centred in that space.
- **The scrolled state must never change the header's height.** No padding change, no collapsing logo. Heroes (`min-height: calc(var(--hero-min-height) - var(--header-group-height))`) and sticky offsets are sized from `--header-height` / `--header-group-height`, which ResizeObservers in `header.js` keep live. An earlier version tightened the header padding and collapsed the hidden logo; the hero then resized on every scroll, so that was removed.

### Product image placeholders
- **`snippets/product-placeholder.liquid` (new):** for products with no media, a tinted block with `assets/logo-monogram.png` (the real monogram, extracted from the handoff prototype bundle) centred at 34% height and 14% opacity.
  - Tint cycles by `product.id` modulo 3: taupe `--lr-warm-taupe`, then sand `--lr-sand-light`, then cream `--lr-cream-deep`. A given product always gets the same tint.
  - Aspect ratio comes from a param (default `3 / 4`).
- **`snippets/card-gallery.liquid`:** a product with no media renders the placeholder (3/4 when the card's image ratio is "adapt") inside the gallery link. Horizon's title-text placeholder is gone. Editor preview cards (no product) also use it instead of `placeholder_svg_tag`.
- **`snippets/resource-card.liquid`:** product tiles without an image (search overlay, menu featured products) use the placeholder at the card's ratio.
- **PDP gallery** (`templates/product.json` media-gallery settings, `blocks/_product-media-gallery.liquid`, `snippets/product-media-gallery-content.liquid`):
  - **Settings:** grid, two columns, `large_first_image: false` (2 x 2 on desktop), `image_gap` (desktop grid gap), new **`image_gap_mobile`** ("Mobile gap", default 16: the mobile carousel/filmstrip gap, via `--image-gap-mobile`), new aspect option **`3/4`** (label `options.portrait_tall`), `constrain_to_viewport: false`, `media_fit: cover`, `slideshow_mobile_controls_style: hint`.
  - **Layout:** a 2 x 2 grid on desktop, all 3:4 (was one large image then two below). On mobile it's Horizon's hint carousel, with a CSS override making each image **86%** wide and the gap between slides from the Mobile gap setting. The slideshow is rendered with `slideshow_gutters: 'start end'`, and `--gutter-slide-width: var(--page-margin)` is set only below 750px, so slides line up with the page margin.
  - **`snippets/product-information-content.liquid`:** `product_has_media` is always `true`. Horizon hid the whole media column (and switched to a details-only layout) when `product.media.size == 0`, which stopped the placeholders from rendering. This also applies to `featured-product-information`.
  - **No media** (or no product in the editor): renders `.media-gallery-placeholder` with three `brand-placeholder`s labelled `front` / `detail` / `worn` (tones sand / cream / taupe; strings `content.product_media_placeholder_*`), plus a fourth `back` (sand) when the layout is a plain two-column grid, so it fills 2 x 2.
    - Desktop follows the block's grid settings (columns, large first, gap, ratio).
    - Mobile is a pure-CSS scroll-snap filmstrip (86% items) with `padding-inline` / `scroll-padding-inline: var(--page-margin)` and gap from Mobile gap.
    - The carousel presentation uses a 100% filmstrip.
    - Quick add modal (≥750px): the placeholder is `position: absolute; inset: 0` in the gallery column and its rows stretch (`grid-auto-rows: minmax(0, 1fr)`, no aspect ratio), so the tiles fill the modal's full height.
- **`snippets/brand-placeholder.liquid` (new):** replaces **every** Horizon `placeholder_svg_tag` illustration.
  - It's an inline `<svg>` that keeps the caller's class, so existing sizing CSS still applies. The svg fills its box like `object-fit: cover` (`preserveAspectRatio="xMidYMid slice"`), and its viewBox (default 1300×730) sets the intrinsic ratio.
  - Params `tone` (taupe/sand/cream, default sand), or `index` to cycle the tone.
  - **Used in:**
    - `sections/hero.liquid` (×3)
    - `snippets/background-media.liquid` (×2)
    - `snippets/media.liquid` (×2)
    - `blocks/_image.liquid`, `blocks/image.liquid`
    - `blocks/_slide.liquid`, `blocks/_layered-slide.liquid` (tint by `block_index`)
    - `snippets/video.liquid`
    - `snippets/resource-image.liquid` (collection and blog cards)
    - `blocks/comparison-slider.liquid` (taupe/cream)
    - `sections/product-hotspots.liquid`, `blocks/_hotspot-product.liquid`
    - `snippets/product-media-gallery-content.liquid` (editor preview)
    - `snippets/cart-products.liquid` (cart page and cart drawer thumbnails when a line item has no image; tint by `item.product_id`, so it matches that product's card; uses the cart thumbnail border and ratio settings via the placeholder's `style` param)
- **Cart thumbnails** (`snippets/cart-products.liquid`, `config/settings_schema.json` Cart group):
  - **New theme setting `cart_thumbnail_width`** ("Thumbnail width", 60–160px, default 120) is output as `--cart-thumbnail-width` on `.cart-items`. The media column is `clamp(2.5rem, 30cqi, var(--cart-thumbnail-width))` (was a hard-coded `clamp(2.5rem, 15cqi, 7.5rem)`); the wide cart-page row uses the width directly.
  - **New theme setting `cart_drawer_image_ratio`** ("Cart drawer image ratio", default portrait). The cart page uses its `_cart-products` block's `image_ratio` (portrait in `templates/cart.json`); the drawer has no block, so `image_ratio = block_settings.image_ratio | default: settings.cart_drawer_image_ratio`. Horizon's drawer was always square.
  - **New theme setting `cart_product_title_size`** ("Product title size", 12-20px, default 14) is output as `--cart-title-font-size` on `.cart-items`; `.cart-items__title` uses it (Horizon hard-coded `--font-size--md`) with `--line-height--body-tight`.
  - **Variant in the title:** the line title reads "{product title} - {variant title}" (e.g. "arlo cotton long sleeve top - white - 3-6m"); Horizon's separate `.cart-items__variants` list is removed.
  - **Drawer close buttons** (`snippets/theme-drawer-styles.liquid`, cart, filters and pickup availability): a bare × in the text colour on a 44px target, `--icon-size-xs`, no circle, border or shadow, matching the search overlay, menu drawer and dialogs.
  - **Quantity stepper** is compact at every width: 84 x 28px, 28px buttons (above the 24px WCAG minimum), `--icon-size-2xs` icons (Horizon: 124 x 44px mobile, 105 x 36px desktop). The number keeps base.css's 16px+ input size below 1200px so iOS doesn't zoom.
  - **Unit price** (`.cart-items__unit-price-wrapper`) only renders for sale items, where it carries the strikethrough compare-at price. Otherwise only the line total shows (Horizon showed the unit price under the details as well, which read as a duplicate; the owner removed it at every quantity).
  - In `_image` and `background-media`, the legacy `placeholder` name param (e.g. `hero-apparel-2`) now only supplies its trailing number as the tint index.
  - `grep placeholder_svg_tag` should return nothing outside that snippet; keep it that way when merging Horizon updates.

### Colourways, size picker and low stock (PDP)
Products are **one product per colour**; each has a single **Size** option (`0-3m, 3-6m, 2-3y, 4-5y`). Colour lives only in the title after " - " (e.g. `remy knitted two-piece - cream`).
- **Metafield `custom.linked_products`** (`list.product_reference`, created in admin): each colourway lists the **whole group, itself included** (set on remy and marlow so far).
- **`blocks/colour-swatches.liquid` (new public block, in `templates/product.json` product-details above the variant picker):**
  - Label `content.colour_swatches_label` ("colour - {{ colour }}"), plus "(one colourway)" when there are no linked products.
  - One `<a href>` swatch per linked product (`snippets/colour-swatch.liquid`); the current product is marked `aria-current="page"` with a ring. If the current product is missing from its own list, it's still shown.
  - **Settings:** `swatch_size` (default 52), `show_single_colourway`, padding.
- **Swatch colours:** theme setting **`colour_swatch_map`** (Theme settings → Swatches, textarea `name: #hex` per line or comma). It is matched against the title's colour word; unmatched names render an outlined swatch with a diagonal hairline. Brown/khaki/sage hexes are still the prototype placeholders. The map also holds the personalisation thread colours (`ink`, `cream`, `sand`). The lookup lives in `snippets/util-colour-hex.liquid` (echoes the hex for a name), shared by `colour-swatch` and `personalisation`.
- **`snippets/variant-main-picker.liquid` + `blocks/variant-picker.liquid`:**
  - New `option_labels` setting ("Label overrides", e.g. `Size: size & age`).
  - The legend wraps the name in `.variant-option__label` (Horizon's own text style, not the label preset; the colour-swatches label matches it), plus, on the last option when `show_low_stock` is on, `snippets/variant-low-stock.liquid`: an orange dot and "only {n} left in {value}" when the selected variant is Shopify-tracked with 1…`low_stock_threshold` (default 3) in stock.
  - The picker re-renders on selection (`variant-picker.js` morph), so the note follows the chosen size.
- **`snippets/variant-picker-styles.liquid` (Little Row section):** legend flex row; sold-out buttons drop Horizon's diagonal line (`.variant-option__strikethrough`) for a 50% border, with the label text left unstruck.

### Personalisation (name on label)
**Store objects (created via the Admin API, 2026-09-16):**
- **Fee product `personalisation`** (`gid://shopify/Product/10399459606857`, variant `gid://shopify/ProductVariant/55368308392265`): £4.00, status **UNLISTED** (hidden from search, collections and recommendations; reachable via metafield), published to Online Store, untracked inventory, no shipping, product type `Personalisation`.
- **Metaobject definition `personalisation`** (storefront PUBLIC_READ). Fields:
  - `heading` (single line, required)
  - `summary` (single line)
  - `description` (multi line)
  - `max_characters` (integer 1-40, required)
  - `thread_colours` (list of single line)
  - `fonts` (list of single line, choices `rockwell bold` / `clarendon bold`; added 2026-09-30). The customer picks one; the first is preselected. Blank means no font choice.
  - `fee_variant` (variant reference, required)
- **Entry `name-on-label`:** "add a name to the label" / "stitched in 2 days" / description ("up to 10 characters") / **10** (storewide max, owner's choice) / ink, cream, sand / fee variant / fonts rockwell bold, clarendon bold.
- **Product metafield definition `custom.personalisation`** (metaobject_reference, pinned, storefront readable). Set on all 12 garments; clear it on a product to hide the offer.
- **Embroidery preview (created via the connector, 2026-09-24):**
  - **Metaobject definition `embroidery_preview`** (storefront PUBLIC_READ): `background_image` (image file, required), `font` (`script` / `serif` / `sans`, required), `size` (% of image width, 1-20, required), `position_x` / `position_y` (centre of the name, % from left / top, 0-100, required), `rotation` (degrees, -45..45, optional).
  - **Product metafield definition `custom.embroidery_preview`** (metaobject_reference to it, pinned, storefront readable). Blank means no preview; personalisation works as before.
  - **Entry `hang-tag-example`:** Files image `embroidery-preview-label.jpg` (880x1100, a crop around the blank hang tag of Anastasiya Doicheva's Unsplash photo, free licence, https://unsplash.com/photos/GzMZ86vsVjk; cropped because the full frame made the name about 10px in the dialog), script, size 8, x 50, y 56, rotation 0. Set on **remy knitted two-piece - cream only** so far. It's a stand-in until there's a real label photo.

**Theme:**
- **`blocks/personalisation.liquid`** (public block, in `templates/product.json` product-details between the variant picker and buy buttons):
  - **Visibility:** renders only when the product has an offer whose fee variant is available.
  - **Bar:** a button in the `bar_color` setting (default `color2` sand, via `contrast-override`) showing the heading and "+{fee price}, {summary}". It opens a Horizon `dialog-component` modal: heading, description, name input (maxlength from metaobject, character count), thread radios, price, "add personalisation" (disabled until a name is entered), and "remove personalisation".
  - **Hidden inputs** use `form="BuyButtons-ProductForm-{section.id}"`: `properties[Name on label]`, `properties[Thread]` and `personalisation_fee_variant`. All are disabled until applied.
- **Font choice:** a "font" radio group above the thread radios, each option set in its own face. `snippets/util-embroidery-font.liquid` maps a name to its family token (matches "rockwell" / "clarendon"; a new font needs a woff2, an `@font-face` in `brand-tokens`, a branch here and a new choice on the metaobject field). The choice fills `properties[Font]` on the garment line and sets `--preview-font-family` on the preview (JS `selectFont`); the preview metaobject's own `font` is only the fallback when the offer has no fonts.
- **Embroidery preview** (in the dialog, between the description and the name field; only when the product's `custom.embroidery_preview` has an image): the image in a box with the image's aspect ratio (`container-type: inline-size`), with the name absolutely positioned at `position_x/y`, `font-size: size * 1cqi`, rotated, `aria-hidden`. Font: script = Dancing Script, serif = Newsreader, sans = Familjen Grotesk. While the field is empty it shows a faded `content.personalisation_preview_placeholder` ("nora"). Text colour is the selected thread's hex (radios carry `data-thread-colour` from `util-colour-hex`; unmapped threads fall back to the text colour). Height is capped by the new block setting **`preview_height`** ("Embroidery preview height", 160-480px, default 320) and `40dvh`.
- **`assets/personalisation.js`** (`<personalisation-component>`): `handleInput` (also redraws the preview name), `selectThread` (`on:change` on the thread radios, sets `--preview-thread-colour`), `apply`, `remove`. Dialog contents are found with `data-personalisation-*` attributes because they belong to the nested dialog component's refs.
- **Price note (`snippets/price-personalisation-note.liquid`, rendered by `blocks/price.liquid` only for the page's own product):** a hidden "+ {fee} name on label" span (`content.personalisation_price_note`, `data-personalisation-price-note`) after the price's `priceContainer`, so the variant price swap leaves it alone. `apply()`/`remove()` toggle every note in the same section. `.text-block` is a flex column with full-width children (`snippets/text.liquid`), so while the note is visible the price block becomes a wrapping, baseline-aligned row with the price and note at `width: auto`; its size and colour follow the unit-price style (0.85em, subdued).
- **`assets/product-form.js` `#buildPersonalisedPayload()`:** when `personalisation_fee_variant` is in the form data, posts JSON `{ items: [garment with properties, { id: fee, quantity, parent_id: garment variant, properties: { _personalisation: 'fee' } }], sections }`. The name and thread are **only on the garment line** (owner's choice, 2026-09-24), so cart, checkout and order show them once; `parent_id` ties the fee to the garment added in the same request.
  - The fee is a Shopify **nested cart line** under the garment, removed with it by Shopify.
  - The rest of Horizon's add-to-cart response handling is unchanged.
- **`snippets/cart-products.liquid` (one listing per personalised piece):** a nested line with `properties['_personalisation'] == 'fee'` (`is_personalisation_fee`) gets `data-quantity-follows-parent`, no stepper or remove button, and `.cart-items__table-row--personalisation-fee`, which is `display: none`. The row must stay in the DOM: `component-cart-items.js` finds rows and quantity selectors by line number and updates the fee with its garment. The garment row sums its fee children (`personalisation_fee_unit` / `personalisation_fee_line`) into its unit and line prices (no separate fee note; the name and thread properties are enough). CSS restores the garment's divider (Horizon's nested-line rule drops it) and treats it as the last row when the hidden fee is last. Checkout still shows the fee as its own nested line. The header and drawer counts still include fee lines (`cart.item_count`). `_` properties are already hidden by Horizon.
- **`assets/component-cart-items.js` `updateQuantity()`:** changing a garment with following fee lines uses `cart/update.js` with `updates` for both keys, mapping update.js `{status, description}` errors to `errors`.
- **Strings:** `content.personalisation_*` (all storefront locales, English; font keys `personalisation_property_font`, `personalisation_font_label`, `personalisation_applied_font`, `personalisation_applied_font_no_thread`), `names.personalisation`, `content.personalisation_info`, `settings.embroidery_preview_height`, `info.embroidery_preview_height`.
- **Known limits:**
  - JS is required, as for all Horizon dialogs.
  - Fee lines have no remove button (`cart-products.liquid`), so a name can't be kept without paying; removing the garment removes its fee.
  - Accelerated checkout buttons ignore the personalisation.

### Notify me (sold out button, back in stock modal)
Horizon's sold-out button becomes an enabled **"notify me"** button (bell icon) that opens the custom back in stock modal. Sign-ups go to the **Amp** app via `BIS.create(email, variantId, productId)` (https://help.useamp.com/article/757-javascript-api), so the Amp app embed must be on (Theme settings > App embeds).
- **`blocks/back-in-stock.liquid`** (public block, in `templates/product.json` product-details after buy-buttons; renders only when the product has sold-out variants): **only the modal**, a Horizon `dialog-component` with eyebrow, heading, intro, sold-out sizes in a `<select>` (styled like the email input, caret icon), email (`customer.email` prefilled), inline error, submit, then a success view. `back-in-stock-component` is `position: absolute` so it leaves no row or gap. `!important` sizing beats the full-screen `.dialog-modal` rule below 750px. Strings `content.back_in_stock_*`, `names.back_in_stock`, `content.back_in_stock_info`.
- **`assets/back-in-stock.js`** (`<back-in-stock-component>`): `open(variantId)` preselects that size and shows the dialog; `submit()` calls `BIS.create` and maps Amp's field errors into the inline error; Enter in the email field submits (no `<form>`); resets to the form on `DialogOpenEvent`.
- These two files were deleted once (never committed) and rebuilt on 2026-09-25 by replaying the earlier session's edits. **Commit them.**
- **Theme setting `notify_me_when_sold_out`** (Theme settings > Buttons > "Sold out button", on in `settings_data.json`). Off = Horizon's disabled "sold out".
- **`snippets/util-notify-me.liquid`** echoes `true` when the setting is on, `request.page_type == 'product'`, the button's product is the page's `product` (the Amp popup only knows the page's product), and the variant exists but is unavailable. Capture it and compare to `'true'` (an empty string is truthy in Liquid).
- **`blocks/add-to-cart.liquid`** computes it itself (params passed through `content_for 'block'` that the block didn't already take don't arrive) and passes `notify_me` to **`snippets/add-to-cart-button.liquid`**. That renders `type="button"`, no `disabled`, `data-notify-me`, `data-variant-id`, `data-product-url`, the text `content.notify_me` with a bell icon (`assets/icon-notify.svg`, same style as `icon-add-to-cart.svg`; the sticky bar shows it too), and **no `name="add"`** (the Amp widget anchors its own injected button on `button[name='add']`).
- **`sections/product-information.liquid`** sticky bar: same state (`data-notify-me`, "notify me" text).
- **`assets/product-form.js`:** `AddToCartComponent.handleClick` sends `data-notify-me` clicks to `#openNotifyMe()`: it calls `open(variantId)` on the `back-in-stock-component` in the same section, or `BIS.popup.show({ variantId })` (Amp's own popup) when the block isn't there. In a quick add modal it goes to the product page instead. `#processAddToCart` and `#isAddToCartDisabled` treat a notify button as disabled, so implicit form submission can't add a sold-out variant.
- **`assets/sticky-add-to-cart.js`:** skips fly-to-cart for a notify button, and hides the quantity count.
- **Variant changes:** `#onProductSelect` calls `morph(button, newButton)`, and morph's default is `childrenOnly: true`, so only the label updates; the button's own attributes stay as they were on page load (Horizon sets `disabled` separately). `#syncNotifyMeState()` copies `type`, `name`, `data-notify-me`, `data-variant-id` and `data-product-url` from the new button, and re-enables it for notify me. Without it, a page loaded on a sold-out size opened the form from "add to cart", and one loaded in stock never offered notify me. The sticky bar needs nothing: its button is a child of the morphed bar.
- **Amp's own inline button is hidden** (`#BIS_trigger, .BIS_trigger { display: none !important }`, a `{% style %}` in `blocks/add-to-cart.liquid` while the setting is on). Amp's `detectVariant()` reads the URL's `?variant=`, which Horizon never updates on a size change, so its button stays shown or hidden for the size the page loaded on. It re-injects itself if removed, so hide it rather than delete it. Amp's widget script is `backinstock.useamp.com/widget/275674_1790103261.js`.
- Notify Me's public API is read-only, so it can't replace Amp here.

### Size guide (PDP accordion)
**Store objects (created via the Admin API, 2026-09-25):**
- **Metaobject definition `size_guide`** (storefront PUBLIC_READ, display name `name`): `name` (single line, required, admin only), `intro` (multi line), `columns` (list of single line, required, e.g. size, age, height, chest), `rows` (list of single line, required; one row per line, cells split by `|` in column order, e.g. `0-3m | newborn | 56-62 cm | 42 cm`), `note` (single line).
- **Product metafield `custom.size_guide`** (metaobject_reference to it, pinned, storefront readable). Blank hides the size guide.
- **Entry `babywear-and-kidswear`:** columns size, height, chest, waist (age dropped: the size name says it). The handoff's placeholder UK ranges (0-3m to 6-8y), waist values also placeholders; set on all 12 garments. Values are placeholders until the real spec sheet arrives.

**Theme:** **`blocks/size-guide.liquid`** (public block) sits in the "size guide" `_accordion-row` in `templates/product.json` (replacing Horizon's placeholder text). It renders the intro, a table (`th scope="col"` headings, first cell `th scope="row"`, `--font-size--sm`, tabular numbers, hairline dividers at 20%/10%, horizontal scroll if narrow) and the note. With no size guide it renders a hidden `.size-guide--empty`, and `accordion-custom:has(.size-guide--empty)` hides the whole row; in the editor it shows `content.size_guide_missing` instead. Strings `names.size_guide`, `content.size_guide_info`, `content.size_guide_missing`. Not built: highlighting the selected size's row (the handoff does it; needs JS on variant change).

### Gift box (cart add-on)
One gift box per order, added from the cart, no gift message (owner's choices, 2026-10-07).
- **Store product `gift-box`** (`gid://shopify/Product/10443776557385`, variant `gid://shopify/ProductVariant/55545685770569`, created via the Admin API on 2026-10-07): £5.00, status **UNLISTED**, published to Online Store, untracked inventory, no shipping, product type `Gift box`. The price shown in the cart is the product's price, so it is changed in admin.
- **Theme setting `gift_box_product`** ("Gift box product", Theme settings > Cart, `gift-box` in `settings_data.json`). Blank hides the option.
- **`snippets/cart-gift-box.liquid` (new):** a tick box ("add a gift box", "+ {price}") rendered by `snippets/cart-summary.liquid` as the first row of `.cart-actions`, so the drawer and the cart page both have it. It renders only when the product is set and available and the cart is not empty; it is ticked when the product is in the cart. It needs JS. Don't add a `<noscript>` fallback inside it: section HTML is parsed with `DOMParser` (scripting off), so noscript content becomes real elements and gets morphed into the page (a noscript style hid the tick box after the first click).
- **`assets/cart-gift-box.js`** (`<cart-gift-box>`): `toggle` posts `cart/update.js` with `updates: { [variantId]: 1 | 0 }` (never more than one box) and dispatches a `CartLinesUpdateEvent`; `cart-items-component` and the cart icon re-render from it.
- **`snippets/cart-products.liquid`:** the gift box line (`is_gift_box`, matched by `item.product_id`) gets `data-gift-box` and `.cart-items__table-row--gift-box`, which is `display: none` like the personalisation fee row. It must stay in the DOM (rows are indexed by line number). Checkout shows it as its own line.
- **Never on its own:** `component-cart-items.js` `#orphanedGiftBoxRows()` finds the gift box rows that would be the only lines left; `updateQuantity()` then removes them in the same `cart/update.js` request and `onLineItemRemove()` shows the empty state. As a safety net, `cart-gift-box.js` removes the box on connect when it is the only cart line (`data-only-item`).
- **Strings:** `content.gift_box_label`, `content.gift_box_price`, `settings.gift_box_product`, `info.gift_box_product`.
- **Known limits:** header and drawer counts include the gift box (`cart.item_count`); accelerated checkout from the product page skips the cart, so it can't be added there.

### Drawers overlay the page on desktop
- **Theme setting `drawer_overlay_desktop`** ("Overlay page on desktop", Theme settings > Drawers, on in `settings_data.json`). Horizon's `<theme-drawer>` (cart, filters, pickup) pushes the page aside at ≥990px (`.page-wrapper--drawer-open` margin, non-modal `show()`); with this on, drawers open as a modal overlay with a backdrop at every width, like the mobile menu.
- **`snippets/theme-drawer.liquid`** sets `data-drawer-overlay` on `<html>` when on; its session-restore script skips restoring (as below 990px) and its squeeze query becomes `'not all'`. **`assets/theme-drawer.js`**: `ALWAYS_MODAL` makes `#modalQuery` match `'all'`, so `showModal()`, the backdrop, focus trap and `lockScroll` (which covers `.page-wrapper`) apply on desktop too.

### Copy and locales
- **New storefront keys in `content.*`:** `coming_soon`, `search_suggestions_title`, `search_start_typing`, `search_results_summary` (plural), `search_results_nothing_matches`, `search_results_pieces` (plural).
- **New schema keys:**
  - `settings.*`: `featured_products_count`, `hide_childless_links_desktop`, `drawer_featured_content`, `search_suggestions`, `hide_childless_links`, `scrolled_logo`, `scrolled_logo_height`.
  - `info.*`: `search_suggestions`, `hide_childless_links`, `scrolled_logo`.
  - `content.*`: `scrolled_logo`.
- **`en.default.json` copy changes:** `content.cart_title` "cart" and `content.your_cart_is_empty` "your cart is empty" (drawer title), `content.search_input_placeholder` "search for something soft", `content.item_count` "{n} piece(s)", `blocks.email_signup.placeholder` "your email".
- **All 56 non-English locale files carry English text** for the new keys (placeholders awaiting translation).

---

## 7. Admin setup the theme expects
- **Navigation → `main-menu`** (two levels):
  - **Top-level categories:** new in, coats & layers, knitwear & sets, everyday and sleep & bath link to their **collections**; featured tiles come from that collection.
  - **Named pieces:** child links point to **products**; "view all …" links point to the collection.
  - **"shop by age":** children are the age collections.
  - **"our story":** no children, so it's drawer-only on desktop and hidden in the footer shop column.
  - **Coming-soon pieces:** link to products with zero inventory. The suffix comes from availability, so don't type it into titles.
- **Navigation → `footer`** (help column): delivery & returns, faqs, contact. **`footer-about`** (about column): our story. **`footer-legal`** (legal column): terms of service, privacy policy, contact information (`SHOP_POLICY` items; add refund and shipping once created). All set via the Admin API on 2026-09-25.
- **Pages** (created 2026-09-25, placeholder copy to edit): `about` (title "our story", `page.about`: title + page content), `faqs` (`page.faqs`: intro from the page, then h3 headings with Horizon accordions for sizing, fabric & care, orders), `delivery-returns` (`page.delivery-returns`: intro, then one accordion). Accordion questions and answers live in the template JSON, so they're edited in Customize. `contact` already existed.
- **Policies:** only the privacy policy exists; refund, shipping and terms need creating in Settings > Policies (the owner does this; legal text). The privacy policy's contact section shows the owner's personal email and home address, to be changed in admin.
- **Theme editor → Footer → social links:** full profile URLs (not bare domains).
- **Theme editor → Header → Logo → "Logo when scrolled":** the monogram image.

## 8. Open items
- **Collection template:** cards still show swatches (the design removes them), and the collection page has no sand header yet.
- **Header account icon:** still visible at phone width (the design hides it; the drawer has the account link).
- **Translations:** the new locale strings need translating.
- **Content:** product photography, real prices, three swatch hexes (brown `#7A5C43`, khaki `#7C7A5E`, sage `#9AA68F` are placeholders) and real size guide values (edit the `babywear-and-kidswear` metaobject) are outstanding.
- **Logo height:** desktop is 36px in settings; the design wants 30px (Theme settings → Logo).
- **Embroidery preview:** the owner hasn't confirmed Dancing Script as the script font, or whether the example should go on every product (only remy cream has it). The hang-tag photo is a stand-in for a real label photo.
- **Handoff screens not yet built:** homepage sections, PDP (mobile filmstrip gallery, personalisation modal) and cart drawer styling.
- **Focus trap edge case:** `trapFocus` counts links inside collapsed drawer accordions, so Shift+Tab from the first control jumps to the DOM-last element.
- **Git:** nothing from this work has been committed yet; `claude_design_handoff/` is untracked.

## 9. Gotchas
- **Theme Check baseline: 9 warnings, 0 errors.** `sections/header.liquid` ExcessiveSettingsCount (42 > 40), `snippets/divider.liquid` UnusedDocParam ×5, `snippets/predictive-search-resource-carousel.liquid` OrphanedSnippet plus 2 ValidScopedCSSClass. Anything beyond these is new.
- **Locale keys must exist in every locale file** or Theme Check errors (`MatchingTranslations`). Add them with a script over `locales/*.json` / `locales/*.schema.json`, anchoring on an existing key. The files start with a `/* … */` banner and aren't strict JSON, so don't round-trip them through a JSON parser; do string insertion.
- **`config/settings_data.json` and `sections/*-group.json` are rewritten by the admin.** Edit only the `current` block (never `presets`), expect admin-made values (logo, favicon) to appear, and pull before large edits.
- **Font picker values must be real Shopify font handles** (system sans is `sans_serif_n4`).
- **A `{% comment %}` inside an HTML element's attribute list is a `LiquidHTMLSyntaxError`** (Theme Check parses the tag, and the error surfaces far away - at the file's last `endif`). Put the note in the `{% doc %}` header instead.
- **`header-drawer.liquid` is at the Liquid complexity limit.** Put new conditionals in snippets.
- **Class-based preset styles** (`.h3`, `.paragraph`) lose to higher-specificity section CSS. When overriding typography, exclude elements that carry a preset class.
- **`predictive-search.js` reuses the same keydown handler** on the input and the form; check `document.activeElement` before hijacking keys.
- **`--color-shadow-rgb` is only defined by `brand-tokens`.** Keep it there.
