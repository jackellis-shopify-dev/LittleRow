/* single-run */
(function () {
/* The design-system namespace is resolved inside each component, at RENDER time.
   The compiler folds every file in this project into _ds_bundle.js, so a second copy of this
   file also runs from the bundle — at which point the namespace is not yet registered. A
   module-top-level destructure would capture undefined there and crash React. */

/* recently-viewed-products.js: the theme keeps viewed product ids in localStorage and uses
   them as the predictive-search empty state. */
const RECENT_KEY = 'little-row:recently-viewed';
const RecentlyViewed = {
  getProducts() { try { return JSON.parse(window.localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; } },
  addProduct(t) {
    if (!t) return;
    try { window.localStorage.setItem(RECENT_KEY, JSON.stringify([t].concat(RecentlyViewed.getProducts().filter((x) => x !== t)).slice(0, 6))); } catch (e) { /* storage unavailable */ }
  },
  clearProducts() { try { window.localStorage.removeItem(RECENT_KEY); } catch (e) { /* storage unavailable */ } },
};

/* predictive-search.js timings */
const SEARCH_DEBOUNCE_MS = 200;

function SearchOverlay({ open, onClose, onToggle, onNavigate, onSubmit }) {
  const { SearchInput, ProductCard, Icon } = window.LittleRowDesignSystem_ac6c4c;
  const { Photo, productImage } = window;
  const [term, setTerm] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(-1);
  const [recent, setRecent] = React.useState([]);
  const panelRef = React.useRef(null);
  const timer = React.useRef(null);
  const input = () => (panelRef.current ? panelRef.current.querySelector('input') : null);

  /* Cmd/Ctrl+K toggles the search dialog. */
  React.useEffect(() => {
    if (!onToggle) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') { e.preventDefault(); onToggle(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onToggle]);

  const reset = () => { window.clearTimeout(timer.current); setTerm(''); setQuery(''); setSelected(-1); };

  /* Opening focuses the input and reloads the empty state; closing resets the search. */
  React.useEffect(() => {
    if (open) {
      setRecent(RecentlyViewed.getProducts());
      const id = window.requestAnimationFrame(() => { const el = input(); if (el) el.focus(); });
      return () => window.cancelAnimationFrame(id);
    }
    reset();
  }, [open]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChange = (e) => {
    const value = e.target.value;
    setTerm(value);
    setSelected(-1);
    window.clearTimeout(timer.current);
    if (!value.trim().length) return void setQuery('');
    timer.current = window.setTimeout(() => setQuery(value.trim().toLowerCase()), SEARCH_DEBOUNCE_MS);
  };

  const results = query ? window.CATALOGUE.filter((x) => !x.pending && x.t.indexOf(query) > -1).slice(0, 6) : [];
  const recentItems = recent.map((t) => window.CATALOGUE.filter((x) => x.t === t)[0]).filter(Boolean).slice(0, 3);
  const shown = query ? results : recentItems;

  const move = (delta) => {
    if (!results.length) return;
    setSelected((i) => {
      const next = i + delta;
      if (next >= results.length) return 0;
      if (next < 0) return results.length - 1;
      return next;
    });
  };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); return void (term ? reset() : onClose()); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || !results.length) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      return;
    }
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); move(1); return; }
    if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); move(-1); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selected > -1) return void onNavigate('product', results[selected].t);
      submit();
    }
  };
  const submit = () => { if (term.trim().length && onSubmit) onSubmit(term.trim()); };

  /* Clicking dead space inside the dialog keeps focus on the input. */
  const keepFocus = (e) => {
    const t = e.target;
    if (t.closest && (t.closest('a') || t.closest('button') || t.closest('input'))) return;
    const el = input();
    if (el) el.focus();
  };

  const clearRecent = () => { RecentlyViewed.clearProducts(); setRecent([]); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--layer-overlay)', pointerEvents: open ? 'auto' : 'none' }} aria-hidden={!open}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--color-shadow-rgb) / var(--backdrop-opacity))', opacity: open ? 1 : 0, transition: 'opacity var(--drawer-animation-speed) var(--animation-timing-fade-out)' }} />
      <div role="dialog" aria-modal="true" aria-label="Search" ref={panelRef} onClick={keepFocus} style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--surface-page)', transform: open ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform var(--drawer-animation-speed) var(--animation-timing-fade-in)', borderBottom: '1px solid rgb(var(--color-foreground-rgb) / 0.1)' }}>
        <div className="lr-search-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 32px' }}>
          <div style={{ display: 'flex', gap: 'var(--gap-lg)', alignItems: 'center' }}>
            <SearchInput value={term} onChange={onChange} onKeyDown={onKeyDown} onClear={reset} placeholder="search for something soft" role="combobox" aria-expanded={results.length > 0} aria-controls="lr-search-results" />
            <button type="button" onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', cursor: 'pointer', width: 44, height: 44, display: 'grid', placeItems: 'center' }}><Icon name="close" size="xs" /></button>
          </div>
          <div className="lr-search" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--gap-3xl)', marginTop: 28 }}>
            <div className="lr-search-suggestions" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="lr-label">suggestions</span>
              {['knitted', 'borg', 'cotton', 'pyjamas'].map((s) => (
                <a key={s} href="#" onClick={(e) => { e.preventDefault(); window.clearTimeout(timer.current); setTerm(s); setQuery(s); setSelected(-1); }} style={{ fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>{s}</a>
              ))}
            </div>
            <div id="lr-search-results" role="listbox" aria-label="Search results">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--gap-md)' }}>
                <span className="lr-label">{query ? results.length + ' results for “' + query + '”' : recentItems.length ? 'recently viewed' : 'start typing to search'}</span>
                {!query && recentItems.length ? (
                  <button type="button" onClick={clearRecent} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'var(--font-size--2xs)', color: 'var(--text-muted)', textDecoration: 'underline' }}>clear</button>
                ) : null}
              </div>
              <div className="lr-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
                {shown.map((r, i) => (
                  <div key={r.t} role="option" aria-selected={query && selected === i ? 'true' : undefined} style={{ outline: query && selected === i ? '1px solid rgb(var(--color-foreground-rgb) / 0.35)' : 'none', outlineOffset: 2 }}>
                    <ProductCard title={r.t} price={r.p} media={<Photo src={productImage(r.t, 400)} tone={r.tone} />} href="#" onClick={(e) => { e.preventDefault(); onNavigate('product', r.t); }} />
                  </div>
                ))}
              </div>
              {query && !results.length ? (
                <p style={{ marginTop: 14, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>nothing matches “{query}”. press enter to search everything.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, lines, onQty, onRemove, subtotal }) {
  const { Drawer, CartLineItem, CartSummary, Divider, SearchInput, ProductCard, Button, Field, Radio, Icon, Price } = window.LittleRowDesignSystem_ac6c4c;
  const { Photo, productImage } = window;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--layer-menu-drawer)', pointerEvents: open ? 'auto' : 'none' }}>
      <Drawer
        open={open}
        onClose={onClose}
        title="your basket"
        footer={lines.length ? <CartSummary subtotal={subtotal} note="taxes and delivery calculated at checkout" /> : null}
      >
        {lines.length === 0 ? (
          <div style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', alignItems: 'flex-start' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>nothing in here yet.</p>
            <Button variant="secondary" onClick={onClose}>continue shopping</Button>
          </div>
        ) : (
          lines.map((l, i) => (
            <div key={l.key}>
              {i ? <Divider spacing="0" /> : null}
              <CartLineItem title={l.title} variant={l.variant} price={l.price} quantity={l.qty} media={<Photo src={productImage(l.title, 200)} tone="sand" />} onQuantityChange={(n) => onQty(l.key, n)} onRemove={() => onRemove(l.key)} />
            </div>
          ))
        )}
      </Drawer>
    </div>
  );
}

function PersonaliseModal({ open, onClose, onAdd }) {
  const { Drawer, CartLineItem, CartSummary, Divider, SearchInput, ProductCard, Button, Field, Radio, Icon, Price } = window.LittleRowDesignSystem_ac6c4c;
  const [name, setName] = React.useState('');
  const [thread, setThread] = React.useState('ink');
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--layer-temporary)', display: 'grid', placeItems: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--color-shadow-rgb) / var(--backdrop-opacity))' }} />
      <div style={{ position: 'relative', width: 'min(520px, 92vw)', background: 'var(--surface-page)', borderRadius: 'var(--style-border-radius-popover)', padding: 28, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', boxShadow: 'var(--shadow-popover)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="lr-label">personalisation</span>
            <h4 style={{ margin: '8px 0 0' }}>add a name to the label</h4>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center' }}><Icon name="close" size="xs" /></button>
        </div>
        <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>
          stitched onto the inside label, up to 12 characters. adds two days to delivery and makes the piece non-returnable.
        </p>
        <Field label="name" value={name} onChange={(e) => setName(e.target.value.slice(0, 12))} placeholder="e.g. nora" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="lr-label">thread</span>
          <div style={{ display: 'flex', gap: 'var(--gap-xl)' }}>
            <Radio name="thread" label="ink" checked={thread === 'ink'} onChange={() => setThread('ink')} />
            <Radio name="thread" label="cream" checked={thread === 'cream'} onChange={() => setThread('cream')} />
            <Radio name="thread" label="sand" checked={thread === 'sand'} onChange={() => setThread('sand')} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-lg)' }}>
          <Price price="+£4.00" />
          <Button disabled={!name} onClick={() => onAdd(name, thread)}>add personalisation</Button>
        </div>
      </div>
    </div>
  );
}

function NotifyModal({ open, onClose, item, size }) {
  const { Drawer, CartLineItem, CartSummary, Divider, SearchInput, ProductCard, Button, Field, Radio, Icon, Price } = window.LittleRowDesignSystem_ac6c4c;
  const { SIZES } = window;
  const soldOutSizes = SIZES.filter((s) => s.soldOut);
  const [picked, setPicked] = React.useState(size);
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { if (open) { setPicked(size); setEmail(''); setDone(false); } }, [open, size]);
  if (!open) return null;
  const valid = /.+@.+\..+/.test(email);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--layer-temporary)', display: 'grid', placeItems: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgb(var(--color-shadow-rgb) / var(--backdrop-opacity))' }} />
      <div style={{ position: 'relative', width: 'min(480px, 92vw)', background: 'var(--surface-page)', borderRadius: 'var(--style-border-radius-popover)', padding: 28, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', boxShadow: 'var(--shadow-popover)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--gap-lg)' }}>
          <div>
            <span className="lr-label">back in stock</span>
            <h4 style={{ margin: '8px 0 0' }}>{done ? 'you are on the list' : 'notify me'}</h4>
          </div>
          <button type="button" onClick={onClose} aria-label="close" style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center' }}><Icon name="close" size="xs" /></button>
        </div>
        {done ? (
          <React.Fragment>
            <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>
              we will email {email} the moment {item} is back in {picked}. we restock monthly and only email about this piece.
            </p>
            <Button fullWidth onClick={onClose}>done</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', color: 'var(--text-subdued)' }}>
              {item} is sold out in {soldOutSizes.length > 1 ? 'a few sizes' : 'one size'}. leave your email and we will let you know as soon as it is back.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="lr-label" style={{ color: 'var(--text-body)' }}>which size</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {soldOutSizes.map((s) => (
                  <Radio key={s.value} name="notify-size" label={s.label} checked={picked === s.value} onChange={() => setPicked(s.value)} />
                ))}
              </div>
            </div>
            <Field label="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button fullWidth disabled={!valid} onClick={() => setDone(true)}>notify me</Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SearchOverlay, CartDrawer, PersonaliseModal, NotifyModal, LRRecentlyViewed: RecentlyViewed });

})();
