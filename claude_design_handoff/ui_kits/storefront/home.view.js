/* single-run */
(function () {
/* The design-system namespace is resolved inside each component, at RENDER time.
   The compiler folds every file in this project into _ds_bundle.js, so a second copy of this
   file also runs from the bundle — at which point the namespace is not yet registered. A
   module-top-level destructure would capture undefined there and crash React. */

const newIn = () => window.CATALOGUE.slice(0, 4);

function Home({ onNavigate, onQuickAdd }) {
  const { Button, Marquee, ProductCard, CollectionCard, Badge } = window.LittleRowDesignSystem_ac6c4c;
  const { Photo, productImage, sceneImage } = window;
  return (
    <main>
      {/* Colour-blocked hero: type block beside image block, no overlay type */}
      <section className="lr-hero" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', minHeight: 560 }}>
        <div className="lr-hero-copy" style={{ background: 'var(--surface-accent)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--gap-xl)', padding: '64px 56px' }}>
          <span className="lr-label" style={{ color: 'var(--text-body)' }}>autumn, in fourteen pieces</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(3.5rem, 6vw, 5rem)', lineHeight: 0.95, maxWidth: '11em' }}>
            little things, worn well
          </h1>
          <p style={{ margin: 0, maxWidth: '24em', fontSize: 'var(--font-size--md)', lineHeight: 'var(--line-height--body-loose)' }}>
            a small range of organic cotton basics, designed for comfort and movement. that is the whole shop.
          </p>
          <div style={{ display: 'flex', gap: 'var(--gap-sm)', flexWrap: 'wrap' }}>
            <Button size="large" onClick={() => onNavigate('collection')}>shop the range</Button>
            <Button variant="secondary" size="large" onClick={() => onNavigate('product', newIn()[0].t)}>new in</Button>
          </div>
        </div>
        <div className="lr-hero-media" style={{ position: 'relative', background: 'var(--lr-warm-taupe)' }}>
          <Photo src={sceneImage('hero', 1400)} tone="taupe" position="50% 30%" style={{ position: 'absolute', inset: 0, height: '100%' }} label="hero image" />
        </div>
      </section>

      {/* Loud graphic band */}
      <Marquee scale="display" tone="inverse" speed={30} items={['organic cotton', '·', 'small batch', '·', 'sized to grow into', '·', 'made with love', '·']} />

      {/* Colour-blocked age strip — three flat blocks, no photography */}
      <section className="lr-ages" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { t: 'newborn', c: '4 pieces', bg: 'var(--lr-cream-deep)', k: 'newborn' },
          { t: 'baby 0-24m', c: '6 pieces', bg: 'var(--lr-sand)', k: 'baby' },
          { t: 'kids 2-8y', c: '5 pieces', bg: 'var(--lr-taupe-light)', k: 'kids' },
        ].map((x) => (
          <a
            key={x.t}
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate('collection'); }}
            style={{ position: 'relative', background: x.bg, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 200, justifyContent: 'flex-end', padding: '52px 32px', overflow: 'hidden' }}
          >
            <span style={{ position: 'relative', fontFamily: 'var(--font-heading--family)', fontSize: 'var(--font-size--4xl)', lineHeight: 1 }}>{x.t}</span>
            <span className="lr-label" style={{ position: 'relative', color: 'var(--text-body)' }}>{x.c}</span>
          </a>
        ))}
      </section>

      <section className="lr-section" style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--gap-lg)', marginBottom: 32 }}>
          <h2 style={{ margin: 0 }}>new in this week</h2>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('collection'); }} style={{ fontSize: 'var(--font-size--sm)', textDecoration: 'underline', textUnderlineOffset: 3 }}>view all</a>
        </div>
        <div className="lr-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', columnGap: 8, rowGap: 24 }}>
          {newIn().map((x) => (
            <ProductCard
              key={x.t}
              title={x.t}
              price={x.p}
              compareAt={x.c}
              badge={x.b}
              badgeTone={x.bt || 'sale'}
              quickAdd="Quick add"
              onQuickAdd={() => onQuickAdd(x.t, x.p)}
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('product', x.t); }}
              media={<Photo src={productImage(x.t)} tone={x.tone} />}
            />
          ))}
        </div>
      </section>

      {/* Full-bleed ink block — the loudest moment on the page */}
      <section style={{ background: 'var(--surface-inverse)', color: 'var(--text-on-inverse)' }}>
        <div className="lr-story" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-3xl)', alignItems: 'center' }}>
          <div>
            <span className="lr-label" style={{ color: 'var(--lr-sand)' }}>how we make things</span>
            <h2 style={{ margin: '16px 0 20px', color: 'var(--text-on-inverse)' }}>soft, simple, made to be worn</h2>
            <p style={{ fontSize: 'var(--font-size--md)', lineHeight: 'var(--line-height--body-loose)', maxWidth: '26em', color: 'var(--lr-soft-cream)' }}>
              a short, considered range of everyday pieces in soft cotton and knit — designed for comfort and movement, and made to be layered, mixed and worn every day. [placeholder — your brand copy here]
            </p>
            <Button variant="secondary" style={{ color: 'var(--lr-soft-cream)', boxShadow: 'inset 0 0 0 1px var(--lr-soft-cream)' }}>read our story</Button>
          </div>
          <Photo src={sceneImage('fabric', 900)} tone="cream" ratio="4 / 3" label="fabric detail" />
        </div>
      </section>

      <Marquee items={['free uk delivery over £60', '60 days to change your mind', 'organic cotton, always']} tone="accent" />
    </main>
  );
}

Object.assign(window, { Home });

})();
