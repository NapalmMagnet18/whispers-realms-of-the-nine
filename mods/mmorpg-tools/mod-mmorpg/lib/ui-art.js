// The creator's uploaded UI art, every piece with a job. Screens draw from here: frame(role) for a
// panel's border (CSS border-image, 96x96 sources, 9-slice), rule(role) for a divider <img>.
// Pixel borders scale crisp; tint them warm with the brass filter so the grey art reads as the game's brass.
const B = (n, sha) => `/cdn/panel-transparent-border-${n}-${sha}.webp`;
export const BORDERS = {
  window: B('000', 'u4v0m3d4r'),      // big windows: bags, character, spellbook
  dialog: B('001', 'u46rvacpx'),      // NPC dialog and quest offer
  menu: B('002', 'u9455mt8l'),        // game menu (Esc)
  tooltip: B('003', 'u1fgujvgg'),     // item / spell tooltips
  slot: B('004', 'u7q0i1ais'),        // bag slots
  actionSlot: B('005', 'u7q9bbn1y'),  // action-bar buttons
  banner: B('006', 'u96yjcxke'),      // wide banners: zone, level up
  unitFrame: B('007', 'u77gmp1hd'),   // player and target frames
  tracker: B('008', 'u0r97t2nv'),     // quest tracker
  minimap: B('009', 'u85paa2uy'),     // minimap ring box
  chat: B('010', 'u51265pb2'),        // chat box
  portrait: B('011', 'u8qg9pl91'),    // portraits
  realmRow: B('012', 'u6gh9bxcd'),    // realm list rows
  charRow: B('013', 'u5bl47dq2'),     // character list rows
  charRowActive: B('014', 'u2knf2g3x'), // the selected character row
  button: B('015', 'u6s3pa86t'),      // ordinary buttons
  buttonHot: B('016', 'u2s2k7q06'),   // primary buttons: Enter World, Accept
  input: B('017', 'u69orbv63'),       // text inputs: names, chat entry
  equipSlot: B('018', 'u7xsb4cx4'),   // equipment slots
  equipSlotRare: B('019', 'u83qacxsd'), // equipped rare item
  skillRow: B('020', 'u58rxhrvg'),    // skills / professions rows
  buff: B('021', 'u7xml1bjd'),        // buff and debuff icons
  vendor: B('022', 'u35pgo4ve'),      // vendor window
  vendorItem: B('023', 'u8yoosw03'),  // vendor goods
  loot: B('024', 'u3owzhlh3'),        // loot window
  map: B('025', 'u3i8iqz6s'),         // world map
  journal: B('026', 'u43mg4454'),     // quest journal
  settings: B('027', 'u1e9acukk'),    // settings
  raceCard: B('028', 'u21he9mqp'),    // race picks in create
  classCard: B('029', 'u0ppk9d0s'),   // class picks in create
  notice: B('030', 'u75ro98z6'),      // toasts and notices
  castBar: B('031', 'u4fn43l22'),     // cast bar
};
export const DIVIDERS = {
  title: '/cdn/divider-000-u5jt57yqa.webp',
  section: '/cdn/divider-001-u1da8j4ui.webp',
  tooltip: '/cdn/divider-002-u2msjfueu.webp',
  dialog: '/cdn/divider-003-u9itsqkru.webp',
  menu: '/cdn/divider-004-u4y1dc107.webp',
  list: '/cdn/divider-005-u2ltfal69.webp',
  fadeLeft: '/cdn/divider-fade-000-u8dmiieft.webp',
  fadeBoth: '/cdn/divider-fade-001-u2r2cvmsk.webp',
  fadeDouble: '/cdn/divider-fade-002-u6fn0fxo0.webp',
  fadeCross: '/cdn/divider-fade-003-u6sho8j7b.webp',
  zone: '/cdn/divider-fade-004-u0lc3elr5.webp',
  fadeCorner: '/cdn/divider-fade-005-u9e6fx8k2.webp',
  capEnd: '/cdn/divider-000-u2fr5u9vf.webp',
  twin: '/cdn/divider-001-u2yps8nlw.webp',
  danger: '/cdn/divider-002-u05t3j8fy.webp',
  crossEnd: '/cdn/divider-003-u6nb5h4dy.webp',
  notch: '/cdn/divider-004-u8hugwm2c.webp',
  crossThin: '/cdn/divider-005-u8gjahgtn.webp',
};
const BRASS = 'sepia(1) saturate(2.2) hue-rotate(-12deg) brightness(1.05)';
// a panel's frame: style text for the element (border-image 9-slice at 32 of 96 px)
export function frame(role, px = 14, fill = 'rgba(28,20,14,0.88)') {
  const src = BORDERS[role] || BORDERS.window;
  return `border:${px}px solid transparent;border-image:url(${src}) 32 fill / ${px}px stretch;image-rendering:pixelated;background:${fill};background-clip:padding-box;`;
}
// a divider line: an <img> the width of its box
export function rule(role, width = '100%', height = 20) {
  const src = DIVIDERS[role] || DIVIDERS.section;
  return `<img src="${src}" alt="" style="display:block;width:${width};height:${height}px;object-fit:fill;image-rendering:pixelated;filter:${BRASS};margin:4px auto">`;
}
export const BRASS_FILTER = BRASS;
