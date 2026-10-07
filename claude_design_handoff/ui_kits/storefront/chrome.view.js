/* single-run */
(function () {
/* Resource lookup: in the bundled standalone export the images are inlined as blob URLs on
   window.__resources; in the project they resolve from ../../assets. */
const asset = (id, path) => (window.__resources && window.__resources[id]) || path;

/* The design-system namespace is resolved inside each component, at RENDER time.
   The compiler folds every file in this project into _ds_bundle.js, so a second copy of this
   file also runs from the bundle — at which point the namespace is not yet registered. A
   module-top-level destructure would capture undefined there and crash React. */

/* Menu shape mirrors the theme's main-menu: top-level entries with child links, and the
   `featured_products` menu style (4/5 media) from sections/header-group.json. Links with a
   `t` go straight to that product; the rest open the collection. */
const P = (t, label) => ({ label: label || t.split(' - ')[0], t });
const NAV = [
  {
    label: 'new in',
    links: [P('rowan knitted all-in-one - taupe'), P('marlow cotton sweat set - cream', 'marlow cotton sweat set'), { label: 'view all new in' }],
    featured: ['rowan knitted all-in-one - taupe', 'marlow cotton sweat set - cream'],
  },
  {
    label: 'coats & layers',
    links: [P('romie borg coat - brown'), P('avery colour block borg jacket - khaki'), P('emerson borg gilet - cream'), { label: 'view all coats & layers' }],
    featured: ['romie borg coat - brown', 'avery colour block borg jacket - khaki'],
  },
  {
    label: 'knitwear & sets',
    links: [P('rowan knitted all-in-one - taupe'), P('remy knitted two-piece - cream', 'remy knitted two-piece'), P('marlow cotton sweat set - brown', 'marlow cotton sweat set'), { label: 'view all knitwear & sets' }],
    featured: ['remy knitted two-piece - cream', 'rowan knitted all-in-one - taupe'],
  },
  {
    label: 'everyday',
    links: [P('arlo cotton long sleeve top - white'), P('river cotton dungarees - brown'), { label: 'rucksack — coming soon', t: 'rucksack' }, { label: 'hat — coming soon', t: 'hat' }],
    featured: ['arlo cotton long sleeve top - white', 'river cotton dungarees - brown'],
  },
  {
    label: 'sleep & bath',
    links: [P('ellis striped pyjamas - sage'), P('sage cotton robe - white'), { label: 'view all sleep & bath' }],
    featured: ['ellis striped pyjamas - sage', 'sage cotton robe - white'],
  },
  { label: 'shop by age', links: [{ label: '0-3m' }, { label: '3-6m' }, { label: '2-3y' }, { label: '4-5y' }] },
  { label: 'our story', links: [], drawerOnly: true },
];
const DESKTOP_NAV = NAV.filter((n) => !n.drawerOnly);

/* header-menu.js: the pointer must dwell before a submenu commits, so skimming the row
   does not flash every panel open. Focus opens immediately. */
const HOVER_COMMIT_DELAY_MS = 150;

function focusables(root) {
  return root ? Array.prototype.filter.call(root.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'), (el) => el.offsetParent !== null) : [];
}

function MegaPanel({ item, id, active, onNavigate }) {
  const { productImage } = window;
  const ref = React.useRef(null);
  /* Collapsed submenus stay inert so their links cannot be tabbed into. */
  React.useEffect(() => { if (ref.current) ref.current.inert = !active; }, [active]);
  const feature = (item.featured || []).map((t) => (window.CATALOGUE || []).filter((x) => x.t === t)[0]).filter(Boolean);
  return (
    <div
      ref={ref}
      id={id}
      className="lr-submenu"
      data-active={active ? '' : undefined}
      aria-hidden={!active}
      style={{ display: 'grid', gridTemplateRows: active ? '1fr' : '0fr', overflow: 'hidden', background: 'var(--surface-page)', transition: 'grid-template-rows 240ms var(--ease-out, ease)' }}
    >
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 32px', display: 'flex', gap: 'var(--gap-3xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220 }}>
          {item.links.map((l) => (
            <a key={l.label} href="#" onClick={(e) => { e.preventDefault(); l.t ? onNavigate('product', l.t) : onNavigate('collection'); }} style={{ fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>{l.label}</a>
          ))}
        </div>
        {feature.length ? (
          <div style={{ display: 'flex', gap: 'var(--gap-lg)', marginInlineStart: 'auto' }}>
            {feature.map((p) => (
              <a key={p.t} href="#" onClick={(e) => { e.preventDefault(); onNavigate('product', p.t); }} style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Photo src={productImage(p.t, 300)} tone={p.tone} ratio="4 / 5" />
                <span style={{ fontSize: 'var(--font-size--2xs)' }}>{p.t}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}

function Photo({ src, tone = 'sand', ratio, label, position = 'center', style }) {
  const { Icon, Announcement, Marquee, Button, Divider, Field } = window.LittleRowDesignSystem_ac6c4c;
  const bg = { sand: 'var(--lr-sand-light)', taupe: 'var(--lr-warm-taupe)', cream: 'var(--lr-cream-deep)', ink: 'var(--lr-ink-soft)' }[tone];
  const [failed, setFailed] = React.useState(false);
  const showImage = src && !failed;
  return (
    <div style={{ position: 'relative', width: '100%', height: ratio ? undefined : '100%', aspectRatio: ratio, background: bg, overflow: 'hidden', ...style }}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block' }}
        />
      ) : (
        <React.Fragment>
          <img src={asset('logoMonogram', '../../assets/logo-monogram.png')} alt="" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', height: '34%', width: 'auto', opacity: 0.14 }} />
          {label ? <span className="lr-label" style={{ position: 'absolute', left: 10, bottom: 8, color: 'rgb(var(--color-foreground-rgb) / 0.45)' }}>{label}</span> : null}
        </React.Fragment>
      )}
    </div>
  );
}

function Header({ onSearch, onCart, cartCount, onNavigate }) {
  const { Icon, Announcement, Marquee, Button, Divider, Field } = window.LittleRowDesignSystem_ac6c4c;
  const [scrolled, setScrolled] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [sub, setSub] = React.useState(null); /* drawer submenu push, header-drawer.js */
  const [openSub, setOpenSub] = React.useState(null); /* drawer accordion, drawer_accordion setting */
  const [active, setActive] = React.useState(-1); /* open desktop submenu */
  const triggers = React.useRef([]);
  const drawerRef = React.useRef(null);
  const burgerRef = React.useRef(null);
  const hoverTimer = React.useRef(null);
  const go = (s, t) => { setMenu(false); setSub(null); setOpenSub(null); setActive(-1); onNavigate(s, t); };
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- desktop submenus (header-menu.js) --- */
  const commit = (i) => {
    window.clearTimeout(hoverTimer.current);
    if (!DESKTOP_NAV[i].links.length) return void setActive(-1);
    hoverTimer.current = window.setTimeout(() => setActive(i), HOVER_COMMIT_DELAY_MS);
  };
  const openNow = (i) => { window.clearTimeout(hoverTimer.current); setActive(DESKTOP_NAV[i].links.length ? i : -1); };
  const closeSubmenus = () => { window.clearTimeout(hoverTimer.current); setActive(-1); };
  React.useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* --- drawer (header-drawer.js): slide-in panel, scroll lock, focus trap, escape --- */
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!menu) return void setShown(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = window.requestAnimationFrame(() => setShown(true));
    const first = focusables(drawerRef.current)[0];
    if (first) first.focus();
    return () => { window.cancelAnimationFrame(id); document.body.style.overflow = prev; };
  }, [menu]);
  /* The drawer is a small-screen affordance; resizing up dismisses it. */
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width:761px)');
    const onChange = (e) => { if (e.matches) { setMenu(false); setSub(null); } };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const closeDrawer = () => {
    setShown(false);
    window.setTimeout(() => { setMenu(false); setSub(null); setOpenSub(null); }, 200);
    if (burgerRef.current) burgerRef.current.focus();
  };
  const onDrawerKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); return void (openSub !== null ? setOpenSub(null) : closeDrawer()); }
    if (e.key !== 'Tab') return;
    const items = focusables(drawerRef.current);
    if (!items.length) return;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
    else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
  };

  const onHeaderKeyDown = (e) => {
    if (e.key !== 'Escape' || active === -1) return;
    const trigger = triggers.current[active];
    closeSubmenus();
    if (trigger) trigger.focus();
  };

  return (
    <header
      onKeyDown={onHeaderKeyDown}
      onPointerLeave={closeSubmenus}
      style={{ position: 'sticky', top: 0, zIndex: 'var(--layer-sticky)', background: 'var(--surface-page)', borderBottom: '1px solid rgb(var(--color-foreground-rgb) / 0.1)' }}
    >
      <div className="lr-headbar" style={{ maxWidth: 1280, margin: '0 auto', padding: scrolled ? '8px 32px' : '12px 32px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 'var(--gap-2xl)', transition: 'padding 240ms var(--ease-out, ease)' }}>
        <nav className="lr-nav-desktop" style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'nowrap' }}>
          {DESKTOP_NAV.map((n, i) => (
            <a
              key={n.label}
              ref={(el) => { triggers.current[i] = el; }}
              href="#"
              aria-expanded={n.links.length ? active === i : undefined}
              aria-controls={n.links.length ? 'lr-submenu-' + i : undefined}
              onPointerEnter={() => commit(i)}
              onFocus={() => openNow(i)}
              onClick={(e) => { e.preventDefault(); if (!n.links.length) return void onNavigate('collection'); active === i ? closeSubmenus() : openNow(i); }}
              style={{ fontSize: 'var(--font-size--sm)', whiteSpace: 'nowrap' }}
            >{n.label}</a>
          ))}
        </nav>
        <button type="button" ref={burgerRef} className="lr-burger" onClick={() => (menu ? closeDrawer() : setMenu(true))} aria-label="Open menu" aria-expanded={menu} aria-controls="lr-menu-drawer" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'var(--minimum-touch-target)', height: 'var(--minimum-touch-target)', placeItems: 'center', justifySelf: 'start', marginInlineStart: -10 }}>
          <Icon name="menu" size="md" />
        </button>
        <a href="#" className="lr-logo" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ display: 'grid', placeItems: 'center', height: 30 }}>
          <img src={scrolled ? asset('logoMonogram', '../../assets/logo-monogram.png') : asset('logoWordmark', '../../assets/logo-wordmark.png')} alt="Little Row" style={{ height: scrolled ? 24 : 30, width: 'auto', transition: 'height 240ms var(--ease-out, ease)' }} />
        </a>
        <div className="lr-headicons" style={{ display: 'flex', gap: 'var(--gap-xl)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button type="button" onClick={onSearch} aria-label="Search" aria-keyshortcuts="Meta+K" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center' }}>
            <Icon name="search" size="md" />
          </button>
          <a href="#" aria-label="Account" className="lr-account" style={{ display: 'grid', placeItems: 'center' }}><Icon name="account" size="md" /></a>
          <button type="button" onClick={onCart} aria-label="Basket" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="cart" size="md" />
            <span style={{ fontFamily: 'var(--font-subheading--family)', fontSize: 'var(--font-size--2xs)' }}>{cartCount}</span>
          </button>
        </div>
      </div>
      {DESKTOP_NAV.map((n, i) => (
        n.links.length ? <MegaPanel key={n.label} item={n} id={'lr-submenu-' + i} active={active === i} onNavigate={go} /> : null
      ))}
      {menu ? (
        <div className="lr-drawer-shell" style={{ position: 'fixed', inset: 0, zIndex: 'var(--layer-menu-drawer)' }}>
          <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--color-shadow-rgb) / var(--backdrop-opacity))', opacity: shown ? 1 : 0, transition: 'opacity var(--drawer-animation-speed) var(--animation-timing-fade-out)' }} />
          <nav
            id="lr-menu-drawer"
            ref={drawerRef}
            onKeyDown={onDrawerKeyDown}
            aria-label="Main menu"
            className="lr-mobilemenu"
            style={{ position: 'absolute', inset: '0 auto 0 0', width: 'min(88vw, 400px)', background: 'var(--surface-page)', boxShadow: 'var(--shadow-popover)', transform: shown ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform var(--drawer-animation-speed) var(--animation-timing-fade-in)', display: 'flex', flexDirection: 'column', padding: '12px 20px 24px', overflowY: 'auto' }}
          >
            <button type="button" onClick={closeDrawer} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'var(--minimum-touch-target)', height: 'var(--minimum-touch-target)', display: 'grid', placeItems: 'center', justifySelf: 'start', marginInlineStart: -10, marginBottom: 8 }}>
              <Icon name="close" size="md" />
            </button>
            {sub === null ? (
              <React.Fragment>
                {NAV.map((n, i) => (
                  n.links.length ? (
                    <div key={n.label} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button type="button" onClick={() => setOpenSub((s) => (s === i ? null : i))} aria-expanded={openSub === i} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-heading--family)', fontSize: 'var(--font-size--xl)', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-sm)' }}>
                        {n.label}<Icon name="caret" size="xs" style={{ transform: openSub === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms var(--ease-out, ease)' }} />
                      </button>
                      <div style={{ display: 'grid', gridTemplateRows: openSub === i ? '1fr' : '0fr', overflow: 'hidden', transition: 'grid-template-rows 240ms var(--ease-out, ease)' }}>
                        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingInlineStart: 2 }}>
                          {n.links.map((l) => (
                            <a key={l.label} href="#" tabIndex={openSub === i ? 0 : -1} onClick={(e) => { e.preventDefault(); l.t ? go('product', l.t) : go('collection'); }} style={{ fontSize: 'var(--font-size--md)', color: 'var(--text-subdued)', padding: '10px 0' }}>{l.label}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a key={n.label} href="#" onClick={(e) => { e.preventDefault(); go('collection'); }} style={{ fontFamily: 'var(--font-heading--family)', fontSize: 'var(--font-size--xl)', padding: '14px 0' }}>{n.label}</a>
                  )
                ))}
                <a href="#" onClick={(e) => { e.preventDefault(); closeDrawer(); }} style={{ fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)', padding: '18px 0 0', marginTop: 'auto' }}>account</a>
              </React.Fragment>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function FooterColumn({ title, links }) {
  const { Icon } = window.LittleRowDesignSystem_ac6c4c;
  /* Horizon's footer pattern: the columns are accordions on small screens and plain lists on
     desktop. Below 900px the heading becomes the summary row with a rotating caret. */
  const [mobile, setMobile] = React.useState(() => window.matchMedia('(max-width:900px)').matches);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width:900px)');
    const onChange = (e) => setMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const expanded = !mobile || open;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)', borderBottom: mobile ? '1px solid rgb(var(--color-foreground-rgb) / var(--opacity-10))' : 'none' }}>
      {mobile ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={expanded} style={{ background: 'none', border: 'none', padding: '14px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-sm)', minHeight: 'var(--minimum-touch-target)', width: '100%' }}>
          <span className="lr-label">{title}</span>
          <Icon name="caret" size="xs" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms var(--ease-out, ease)' }} />
        </button>
      ) : (
        <span className="lr-label">{title}</span>
      )}
      <div style={{ display: expanded ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--gap-xs)', paddingBottom: mobile ? 16 : 0 }}>
        {links.map((l) => <a key={l} href="#" style={{ fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)', paddingBlock: mobile ? 4 : 0 }}>{l}</a>)}
      </div>
    </div>
  );
}

function Footer() {
  const { Icon, Announcement, Marquee, Button, Divider, Field } = window.LittleRowDesignSystem_ac6c4c;
  const col = (title, links) => <FooterColumn key={title} title={title} links={links} />;
  return (
    <footer style={{ background: 'var(--surface-sunken)', marginTop: 'var(--section-padding-block-large)' }}>
      <div className="lr-footer" style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 32px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 'var(--gap-3xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', maxWidth: 320 }}>
          <img src={asset('logoWordmark', '../../assets/logo-wordmark.png')} alt="Little Row" style={{ height: 56, width: 'auto', alignSelf: 'flex-start', objectFit: 'contain' }} />
          <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)', lineHeight: 'var(--line-height--body-loose)' }}>
            organic cotton clothes for small people, designed for comfort and movement.
          </p>
          <div className="lr-footer-signup" style={{ display: 'flex', gap: 'var(--gap-xs)', alignItems: 'flex-end' }}>
            <Field label="Join the list" placeholder="your email" radius="button" style={{ maxWidth: 220 }} />
            <Button size="small">Sign up</Button>
          </div>
        </div>
        {col('shop', ['new in', 'coats & layers', 'knitwear & sets', 'everyday', 'sleep & bath', 'shop by age'])}
        {col('help', ['delivery & returns', 'sizing', 'fabric & care', 'contact'])}
        {col('about', ['our story', 'how we make things', 'the row journal', 'stockists'])}
      </div>
      <div className="lr-footer-base" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 40px' }}>
        <Divider spacing="var(--padding-lg)" />
        <div className="lr-footer-base-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="lr-label" style={{ color: 'var(--text-subdued)' }}>© 2026 little row</span>
          <div style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
            {[['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['pinterest', 'Pinterest']].map(([n, label]) => (
              <a key={n} href="#" aria-label={label} style={{ display: 'grid', placeItems: 'center', color: 'var(--text-subdued)', width: 24, height: 24 }}><Icon name={n} size="md" /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Photo, Header, Footer, LR_NAV: NAV.map((n) => n.label) });

})();
