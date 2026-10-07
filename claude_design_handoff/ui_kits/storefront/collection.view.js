/* single-run */
(function () {
/* The design-system namespace is resolved inside each component, at RENDER time.
   The compiler folds every file in this project into _ds_bundle.js, so a second copy of this
   file also runs from the bundle — at which point the namespace is not yet registered. A
   module-top-level destructure would capture undefined there and crash React. */

function Collection({ onNavigate, onQuickAdd, query }) {
  const { ProductCard, FacetGroup, Select, Button, Icon, Badge } = window.LittleRowDesignSystem_ac6c4c;
  const { Photo, productImage, CATALOGUE: ITEMS } = window;
  const [selected, setSelected] = React.useState(['2-3y']);
  const live = ITEMS.filter((x) => !x.pending);
  const colourFacets = Object.keys(window.SWATCH)
    .map((k) => ({ value: k, label: k, count: live.filter((x) => x.colour === k).length }))
    .filter((o) => o.count > 0);
  const priceFacets = [
    { value: 'u25', label: 'under £25', count: live.filter((x) => parseFloat(x.p.slice(1)) < 25).length },
    { value: '25-45', label: '£25 – £45', count: live.filter((x) => parseFloat(x.p.slice(1)) >= 25 && parseFloat(x.p.slice(1)) <= 45).length },
    { value: 'o45', label: 'over £45', count: live.filter((x) => parseFloat(x.p.slice(1)) > 45).length },
  ].filter((o) => o.count > 0);
  const [facetsOpen, setFacetsOpen] = React.useState(false);
  const toggle = (v) => setSelected((s) => (s.indexOf(v) === -1 ? s.concat(v) : s.filter((x) => x !== v)));
  /* Search results reuse the collection template, as the theme's search template does. */
  const q = (query || '').trim().toLowerCase();
  const shown = q ? ITEMS.filter((x) => x.t.indexOf(q) > -1) : ITEMS;
  return (
    <main className="lr-collection-main" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
      <div className="lr-collection-head" style={{ background: 'var(--surface-accent)', padding: '48px 40px', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(3rem, 5vw, 4rem)', lineHeight: 0.98, maxWidth: '16em' }}>{q ? '“' + q + '”' : 'shop all'}</h1>
        <p style={{ margin: 0, maxWidth: '34em', fontSize: 'var(--font-size--md)', lineHeight: 'var(--line-height--body-loose)' }}>
          {q ? shown.length + (shown.length === 1 ? ' piece matches your search.' : ' pieces match your search.') : 'the full range in one place — fourteen pieces in organic cotton and soft knit, newborn to eight years.'}
        </p>
      </div>
      <div className="lr-collection" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--gap-3xl)', alignItems: 'start' }}>
        <aside className="lr-facets" data-open={facetsOpen ? 'true' : 'false'} style={{ position: 'sticky', top: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
            <button type="button" className="lr-facets-toggle" onClick={() => setFacetsOpen((o) => !o)} aria-expanded={facetsOpen} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', alignItems: 'center', gap: 8, minHeight: 'var(--minimum-touch-target)' }}>
              <Icon name="filter" size="xs" /><span className="lr-label" style={{ color: 'var(--text-body)' }}>filter{selected.length ? ' (' + selected.length + ')' : ''}</span>
            </button>
            <span className="lr-facets-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="filter" size="xs" /><span className="lr-label" style={{ color: 'var(--text-body)' }}>filter</span></span>
            {selected.length ? <button type="button" onClick={() => setSelected([])} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'var(--font-size--2xs)', color: 'var(--text-muted)', textDecoration: 'underline' }}>clear all</button> : null}
          </div>
          <div className="lr-facet-list">
          <FacetGroup label="age" selected={selected} onToggle={toggle} options={window.SIZES.map((s) => ({ value: s.value, label: s.label }))} />
          <FacetGroup label="colour" selected={selected} onToggle={toggle} options={colourFacets} />
          <FacetGroup label="price" defaultOpen={false} selected={selected} onToggle={toggle} options={priceFacets} />
          </div>
        </aside>
        <div>
          <div className="lr-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 'var(--gap-lg)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size--2xs)', color: 'var(--text-muted)' }}>{shown.length} pieces</span>
              {selected.map((s) => (
                <button key={s} type="button" onClick={() => toggle(s)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <Badge tone="neutral">{s} ✕</Badge>
                </button>
              ))}
            </div>
            <Select className="lr-sort" options={['featured', 'newest', 'price: low to high']} style={{ maxWidth: 200 }} />
          </div>
          <div className="lr-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', columnGap: 8, rowGap: 24 }}>
            {shown.map((x) => (
              <ProductCard
                key={x.t}
                title={x.t}
                price={x.pending ? 'coming soon' : x.p}
                compareAt={x.c}
                badge={x.pending ? 'coming soon' : x.b}
                badgeTone={x.pending ? 'neutral' : (x.bt || 'sale')}
                quickAdd={x.pending ? undefined : 'quick add'}
                onQuickAdd={() => onQuickAdd(x.t, x.p)}
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('product', x.t); }}
                media={<Photo src={productImage(x.t)} tone={x.tone} />}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { Collection });

})();
