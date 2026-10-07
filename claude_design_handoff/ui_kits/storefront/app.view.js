/* single-run */
(function () {
function App() {
  const { Announcement } = window.LittleRowDesignSystem_ac6c4c || {};
  const { Header, Footer, Home, Collection, Product, SearchOverlay, CartDrawer, PersonaliseModal, NotifyModal } = window;
  const [screen, setScreen] = React.useState('home');
  const [product, setProduct] = React.useState(window.CATALOGUE[0].t);
  const [search, setSearch] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [personalise, setPersonalise] = React.useState(false);
  const [notify, setNotify] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [lines, setLines] = React.useState([{ key: 'k1', title: 'arlo cotton long sleeve top - white', variant: 'white · 2-3y', price: '£20.00', qty: 1 }]);

  const navigate = (s, t) => {
    if (t) setProduct(t);
    if (s === 'product' && window.LRRecentlyViewed) window.LRRecentlyViewed.addProduct(t || product);
    if (s !== 'collection') setQuery('');
    setScreen(s);
    setSearch(false);
    window.scrollTo(0, 0);
  };
  const add = (title, price, variant, qty) => {
    setLines((l) => l.concat([{ key: 'k' + Date.now(), title, price, variant: variant || 'sand · 2-3y', qty: qty || 1 }]));
    setCartOpen(true);
  };
  const subtotal = '£' + lines.reduce((sum, l) => sum + parseFloat(l.price.replace('£', '')) * l.qty, 0).toFixed(2);

  return (
    <div>
      <Announcement>free uk delivery over £60</Announcement>
      <Header
        cartCount={lines.reduce((n, l) => n + l.qty, 0)}
        onSearch={() => setSearch(true)}
        onCart={() => setCartOpen(true)}
        onNavigate={navigate}
      />
      {screen === 'home' ? <Home onNavigate={navigate} onQuickAdd={add} /> : null}
      {screen === 'collection' ? <Collection query={query} onNavigate={navigate} onQuickAdd={add} /> : null}
      {screen === 'product' ? <Product title={product} onNavigate={navigate} onAddToCart={add} onPersonalise={() => setPersonalise(true)} onNotify={(s) => setNotify(s)} /> : null}
      <Footer />
      <SearchOverlay
        open={search}
        onClose={() => setSearch(false)}
        onToggle={() => setSearch((s) => !s)}
        onNavigate={navigate}
        onSubmit={(q) => { setQuery(q); setScreen('collection'); setSearch(false); window.scrollTo(0, 0); }}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={lines}
        subtotal={subtotal}
        onQty={(key, n) => setLines((l) => l.map((x) => (x.key === key ? Object.assign({}, x, { qty: n }) : x)))}
        onRemove={(key) => setLines((l) => l.filter((x) => x.key !== key))}
      />
      <NotifyModal open={notify !== null} size={notify} item={product} onClose={() => setNotify(null)} />
      <PersonaliseModal open={personalise} onClose={() => setPersonalise(false)} onAdd={(name, thread) => { setPersonalise(false); add('name label — ' + name, '£4.00', thread + ' thread', 1); }} />
    </div>
  );
}

/* Babel transpiles each src script asynchronously, so in the bundled standalone export the
   sibling screens are not guaranteed to be defined when this file runs. Wait for them. */
const NEEDED = ['Header', 'Footer', 'Home', 'Collection', 'Product', 'SearchOverlay', 'CartDrawer', 'PersonaliseModal', 'NotifyModal'];
(function mount() {
  /* Retry until the design system, the data files and every sibling screen exist, then mount
     exactly once. Order-proof: any copy of this file may win the race, all render the same. */
  const ds = window.LittleRowDesignSystem_ac6c4c;
  const ready = ds && ds.Announcement && window.CATALOGUE && window.productImage
    && document.getElementById('root') && !NEEDED.some((n) => !window[n]);
  if (!ready) return void setTimeout(mount, 16);
  if (window.__lrMounted) return;
  window.__lrMounted = true;
  window.__lrRoot = ReactDOM.createRoot(document.getElementById('root'));
  window.__lrRoot.render(<App />);
})();

})();
