# Prompt for Claude Code

Unzip this folder somewhere inside (or next to) your local checkout of the theme, then run Claude Code from the theme root and paste the prompt below.

---

## Start here

```
I'm working in my branch of the Horizon theme for Little Row (jackellis-shopify-dev/LittleRow).

In ./design_handoff_storefront there's a design handoff: a README, a self-contained HTML
prototype, the design-token CSS, and the prototype source under ui_kits/storefront/.

Read design_handoff_storefront/README.md in full first. The HTML/React in that folder is a
DESIGN REFERENCE ONLY — do not port it. Everything gets implemented as Liquid plus the
theme's existing vanilla-JS custom elements, following the theme's own patterns. No React,
no new dependencies, no build step.

Before writing code:
1. Read the theme files the README's "Implementing in Liquid" table names, so you match
   existing conventions (custom element registration, section schema style, CSS layering).
2. Tell me your plan, file by file, and wait for me to confirm.

Then implement in this order, stopping after each for me to review:

  1. Header navigation — desktop submenus that expand in the header flow and push page
     content down. Menu content comes from the main-menu linklist, not hardcoded.
  2. Mobile drawer — slide-in from the left with accordion submenus that push the list down.
  3. Predictive search overlay — Cmd/Ctrl+K, 200ms debounce, keyboard result cycling,
     recently-viewed empty state.
  4. Search results template reusing the collection grid.
  5. Footer — nav-matching shop column, social icons, mobile accordions via the theme's
     existing accordion element.

Rules:
- Match the token values in design_handoff_storefront/tokens/ exactly; use the existing CSS
  custom properties rather than new hex values.
- Keep the accessibility behaviour the README specifies (aria-expanded/controls, inert
  collapsed panels, focus trap, escape handling, focus return). It's part of the design.
- Everything must degrade without JS: real <ul> menus, a real <form action="/search">.
- Don't touch templates or sections the work doesn't require.
- Run `shopify theme check` before you tell me a step is done.
```

## Then, per step

```
Show me a diff of the changed files, and tell me what to click in the theme preview to
verify this step against the prototype.
```

## If it drifts toward the prototype's approach

```
Stop — you're porting the prototype. That React/inline-style code is a reference for
appearance and behaviour only. Re-read the "Implementing in Liquid" section of the README
and redo this as Liquid plus a custom element in assets/.
```

## Useful follow-ups

```
Push this to a new branch and open a PR summarising each behaviour change against the
handoff README.
```

```
The handoff lists open items (photography, real prices, swatch hexes, size guide). Wire the
placeholders so they read from product metafields rather than hardcoded values, and list the
metafield definitions I need to create in admin.
```
