/* single-run */
(function () {
/* The design-system namespace is resolved inside each component, at RENDER time.
   The compiler folds every file in this project into _ds_bundle.js, so a second copy of this
   file also runs from the bundle — at which point the namespace is not yet registered. A
   module-top-level destructure would capture undefined there and crash React. */

function Product({ onAddToCart, onPersonalise, onNotify, onNavigate, title }) {
  const { Price, VariantButtons, VariantSwatches, QuantitySelector, Button, Accordion, InventoryStatus, Rating, ProductCard, Icon } = window.LittleRowDesignSystem_ac6c4c;
  const { Photo, productImage, sceneImage, findProduct, CATALOGUE, SWATCH, colourways } = window;
  const item = findProduct(title);
  const ways = colourways(item);
  const [size, setSize] = React.useState('2-3y');
  const colour = item.colour || 'cream';
  React.useEffect(() => { setQty(1); }, [item.t]);
  const alsoLike = CATALOGUE.filter((x) => x.t !== item.t && !x.pending).slice(0, 4);
  const [qty, setQty] = React.useState(1);
  const soldOut = window.SIZES.filter((s) => s.soldOut).some((s) => s.value === size);
  return (
    <main className="lr-pdp-wrap" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 0' }}>
      <div className="lr-pdp" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 'var(--gap-3xl)', alignItems: 'start' }}>
        <div className="lr-pdp-media" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Photo src={sceneImage('product-front', 1000)} tone="sand" ratio="3 / 4" label="front" style={{ gridColumn: '1 / -1' }} />
          <Photo src={sceneImage('product-detail', 600)} tone="cream" ratio="3 / 4" label="detail" />
          <Photo src={sceneImage('product-worn', 600)} tone="taupe" ratio="3 / 4" position="50% 30%" label="worn" />
        </div>

        <div className="lr-pdp-info" style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontSize: 'var(--font-size--2xs)', color: 'var(--text-muted)' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ color: 'inherit' }}>home</a>
              <Icon name="chevron-right" size="2xs" />
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('collection'); }} style={{ color: 'inherit' }}>baby 0-24m</a>
              <Icon name="chevron-right" size="2xs" />
              <span>{item.t}</span>
            </div>
            <h3 style={{ margin: '0 0 10px' }}>{item.t}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)' }}>
              <Price price={item.p || 'coming soon'} size="large" />
              <Rating value={4.6} count={38} />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 'var(--font-size--sm)', lineHeight: 'var(--line-height--body-loose)', color: 'var(--text-subdued)', maxWidth: '32.5em' }}>
            {item.d}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="lr-label" style={{ color: 'var(--text-body)' }}>colour — {colour}{ways.length < 2 ? ' (one colourway)' : ''}</span>
            <VariantSwatches value={colour} onChange={(v) => onNavigate('product', ways.filter((x) => x.colour === v)[0].t)} options={ways.map((x) => ({ value: x.colour, color: SWATCH[x.colour] || 'var(--lr-sand)', label: x.colour }))} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--gap-sm)', flexWrap: 'wrap' }}>
              <span className="lr-label" style={{ color: 'var(--text-body)' }}>size &amp; age</span>
              {soldOut
                ? <InventoryStatus status="outOfStock" label={size + ' is sold out — we restock monthly'} />
                : <InventoryStatus status="lowStock" label={'only 2 left in ' + size} />}
            </div>
            <VariantButtons value={size} onChange={setSize} options={window.SIZES} />
          </div>

          <button type="button" onClick={onPersonalise} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', cursor: 'pointer', background: 'var(--surface-accent)', border: 'none', borderRadius: 'var(--style-border-radius-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-body--family)', fontSize: 'var(--font-size--sm)' }}>add a name to the label</span>
              <span style={{ fontFamily: 'var(--font-body--family)', fontSize: 'var(--font-size--2xs)', color: 'var(--text-subdued)' }}>+£4.00, stitched in 2 days</span>
            </span>
            <Icon name="chevron-right" size="xs" />
          </button>

          <div className="lr-atc" style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'center' }}>
            {soldOut ? null : <QuantitySelector value={qty} onChange={setQty} />}
            <div key={soldOut ? 'notify' : 'add'} style={{ flex: 1, animation: 'lrCtaSwap var(--animation-speed-slow, 0.25s) var(--animation-easing, ease-in-out)' }}>
              <style>{'@keyframes lrCtaSwap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'}</style>
              {soldOut
                ? <Button fullWidth onClick={() => onNotify(size)}>notify me</Button>
                : <Button fullWidth onClick={() => onAddToCart(item.t, item.p, colour + ' · ' + size, qty)}>add to cart</Button>}
            </div>
          </div>

          <Accordion defaultOpenIndex={0} items={[
            { title: 'fabric & care', content: '100% GOTS-certified organic cotton. wash at 30, dry flat, skip the iron.' },
            { title: 'sizing & fit', content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: 0 }}>cut generously through the body. if your little one is between sizes, take the smaller one.</p>
                <table className="lr-sizeguide" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size--2xs)', fontVariantNumeric: 'tabular-nums' }}>
                  <thead>
                    <tr>
                      {['size', 'age', 'height', 'chest'].map((th) => (
                        <th key={th} style={{ textAlign: 'left', paddingBlock: 7, borderBottom: '1px solid rgb(var(--color-foreground-rgb) / var(--opacity-20))', fontWeight: 500, color: 'var(--text-body)', textTransform: 'lowercase', letterSpacing: 'var(--letter-spacing--label)' }}>{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[['0-3m', 'newborn', '56-62 cm', '42 cm'], ['3-6m', '3-6 months', '62-68 cm', '44 cm'], ['6-12m', '6-12 months', '68-80 cm', '47 cm'], ['1-2y', '12-24 months', '80-92 cm', '50 cm'], ['2-3y', '2-3 years', '92-98 cm', '53 cm'], ['4-5y', '4-5 years', '104-110 cm', '57 cm'], ['6-8y', '6-8 years', '116-128 cm', '62 cm']].map((r) => (
                      <tr key={r[0]} style={{ background: r[0] === size ? 'var(--surface-accent)' : 'transparent' }}>
                        {r.map((cell, i) => (
                          <td key={i} style={{ paddingBlock: 7, paddingInline: i === 0 ? 0 : undefined, borderBottom: '1px solid rgb(var(--color-foreground-rgb) / var(--opacity-10))', color: i === 0 ? 'var(--text-body)' : 'inherit' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <span style={{ fontSize: 'var(--font-size--2xs)', color: 'var(--text-muted)' }}>measurements are body measurements, not garment. [placeholder — replace with your spec sheet]</span>
              </div>
            ) },
            { title: 'delivery & returns', content: 'free uk delivery over £60, otherwise £3.95. 60 days to change your mind, returns are free.' },
          ]} />
        </div>
      </div>

      <section style={{ paddingTop: 72 }}>
        <h3 style={{ marginBottom: 24 }}>wears well with</h3>
        <div className="lr-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', columnGap: 8, rowGap: 24 }}>
          {alsoLike.map((x) => (
            <ProductCard key={x.t} title={x.t} price={x.p} media={<Photo src={productImage(x.t)} tone={x.tone} />} href="#" onClick={(e) => { e.preventDefault(); onNavigate('product', x.t); }} />
          ))}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Product });

})();
