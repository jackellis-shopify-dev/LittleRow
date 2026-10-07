/* Little Row catalogue — 14 pieces.
   Names and descriptions are the client's copy, verbatim. Prices are PLACEHOLDERS
   (not supplied) — replace `p` on each item. Items 13 and 14 (rucksack, hat) have no
   detail yet and render as "coming soon" tiles with no price and no quick add. */
window.CATALOGUE = [
  { t: 'romie borg coat - brown', p: '£58.00', tone: 'taupe', colour: 'brown', d: 'a cosy borg coat with a relaxed fit and soft cotton lining. an easy everyday layer for little adventures.' },
  { t: 'avery colour block borg jacket - khaki', p: '£54.00', tone: 'taupe', colour: 'khaki', d: 'a cosy colour block jacket with soft borg sleeves and practical pocket detailing. made for layering through autumn and winter.' },
  { t: 'river cotton dungarees - brown', p: '£42.00', tone: 'sand', colour: 'brown', d: 'soft cotton dungarees in a timeless neutral shade, designed with comfort and movement in mind. perfect layered over everyday basics.' },
  { t: 'sage cotton robe - white', p: '£38.00', tone: 'cream', colour: 'white', d: 'a beautifully soft cotton robe with a cosy hood and tie waist. made for slow mornings, bath time and bedtime cuddles.' },
  { t: 'emerson borg gilet - cream', p: '£44.00', tone: 'cream', colour: 'cream', d: 'a soft borg gilet with a simple zip front and curved pocket detail. the perfect extra layer for cooler days.' },
  { t: 'rowan knitted all-in-one - taupe', p: '£46.00', tone: 'taupe', colour: 'taupe', b: 'new in', bt: 'new', d: 'a beautifully soft knitted all-in-one with delicate button detailing. a cosy, effortless outfit for little ones.' },
  { t: 'remy knitted two-piece - cream', p: '£48.00', tone: 'cream', colour: 'cream', d: 'a soft knitted two-piece designed for all-day comfort. an elevated everyday set made for mixing, matching and layering.' },
  { t: 'remy knitted two-piece - brown', p: '£48.00', tone: 'sand', colour: 'brown', d: 'a soft knitted two-piece designed for all-day comfort. an elevated everyday set made for mixing, matching and layering.' },
  { t: 'ellis striped pyjamas - sage', p: '£34.00', tone: 'sand', colour: 'sage', d: 'a timeless striped pyjama set crafted from soft 100% cotton. cosy, comfortable and made for slow mornings and sweet dreams.' },
  { t: 'marlow cotton sweat set - brown', p: '£40.00', tone: 'taupe', colour: 'brown', d: 'a relaxed cotton sweatshirt and jogger set made for everyday comfort. soft, easy and perfect for play days or days at home.' },
  { t: 'marlow cotton sweat set - cream', p: '£40.00', tone: 'cream', colour: 'cream', b: 'new in', bt: 'new', d: 'a relaxed cotton sweatshirt and jogger set made for everyday comfort. soft, easy and perfect for play days or days at home.' },
  { t: 'arlo cotton long sleeve top - white', p: '£20.00', tone: 'cream', colour: 'white', d: 'a super-soft cotton long sleeve top designed for everyday layering. a simple little row essential that goes with everything.' },
  { t: 'rucksack', tone: 'sand', pending: true, d: 'detail to follow.' },
  { t: 'hat', tone: 'taupe', pending: true, d: 'detail to follow.' },
];
window.findProduct = (t) => window.CATALOGUE.filter((x) => x.t === t)[0] || window.CATALOGUE[0];

/* Swatch values for the colour words used above. brown, khaki and sage are not yet in
   tokens/colors.css — they are the closest read of the product photography and should be
   promoted to tokens once the range is signed off. */
window.SWATCH = {
  brown: '#7A5C43',
  khaki: '#7C7A5E',
  sage: '#9AA68F',
  cream: 'var(--lr-soft-cream)',
  white: 'var(--lr-white)',
  taupe: 'var(--lr-warm-taupe)',
};
/* Each SKU exists in one colour; two styles (remy, marlow) come in two. Group by the name
   before the dash so the product page only offers colourways that actually exist. */
window.colourways = (item) => {
  const base = item.t.split(' - ')[0];
  return window.CATALOGUE.filter((x) => !x.pending && x.t.split(' - ')[0] === base);
};

/* Size range offered on every piece. `soldOut` is demo stock state. */
window.SIZES = [
  { value: '0-3m', label: '0-3m' },
  { value: '3-6m', label: '3-6m' },
  { value: '2-3y', label: '2-3y' },
  { value: '4-5y', label: '4-5y', soldOut: true },
];
