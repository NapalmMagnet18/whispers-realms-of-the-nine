// The creator's uploaded UI art, every piece with a job. Screens draw from here: frame(role) for a
// panel's border (CSS border-image, 96x96 sources, 9-slice), rule(role) for a divider <img>.
// Pixel borders scale crisp; tint them warm with the brass filter so the grey art reads as the game's brass.
// Each border is the creator's panel-transparent-border-NNN art, cooked once to brass: the white plate
// cleared from inside the line-work, the lines shaded light-brass to oak with a charcoal edge.
const BRASS_ART = {"000": "/cdn/value.8cba9f578f785676f0a1da9f9aac606cd47a6f6090a21f8d9ae2fe341845bf92.webp", "001": "/cdn/value.dd053911271732fec6a854e111abca3fdb058c47c2d8693585e22cef3bf3d7e5.webp", "002": "/cdn/value.3d6a76a8f8503cbe4f7606efc00daf486bb6a40d6013ab59d4bce6b647b4928a.webp", "003": "/cdn/value.43f417d3cc5d7c35c5fcd92de4e668ccf2fa341247b13a484f9e47b4b740369c.webp", "004": "/cdn/value.e662f0a2bf7114368a46b495a8329781752e1cba74631d0d3ac9d6e1c5f36d6a.webp", "005": "/cdn/value.bdaf39a924dbd4121886cbc2a97d325e147674a5b952f68c4c1fa822612dd633.webp", "006": "/cdn/value.60df5d95341dfb62808e30d7cc3b0f5d14b73e0c38eae35d6383ce30d56876a4.webp", "007": "/cdn/value.f898df6128d82b216bbe93792f183d9ff7db390d23094a6ed6922b37c3924dcb.webp", "008": "/cdn/value.154c3a10c3e5919092735b817acbf200f13ef9aacdeb8a8988cea626ca7dd034.webp", "009": "/cdn/value.154c3a10c3e5919092735b817acbf200f13ef9aacdeb8a8988cea626ca7dd034.webp", "010": "/cdn/value.909287cef7c487e5ac02446092df6b692496dee180acdd9df1d24e31b4e8899d.webp", "011": "/cdn/value.d519a70372dc83cbd282be7f9f373384c8c337a593090f3e3c56f5ff6e9ce9c2.webp", "012": "/cdn/value.04febd29a8f98baa54deca17ecd98134055e1d7da6a9e9fdc935580eb9fe2182.webp", "013": "/cdn/value.071d233c1fcc8fbab0a8519d426247d521b0e6b7298edf79e4f2fd3c9e42ba51.webp", "014": "/cdn/value.8548ccfee5d3192ef6bd67042d4596383c58802320c674a93f86a3a0d44b69db.webp", "015": "/cdn/value.4a1c027f4a672d15b6c2e83ff9ed298ea2689e371e1e2c458930c98c49151cfc.webp", "016": "/cdn/value.62cf0475fb8d64d56de4e7560cf4d6075fdaecb17307b75139a9765c67f8694c.webp", "017": "/cdn/value.5d21f26b5971099ba083fc2bed04296a3afa3827efaef6a06020579a476737b6.webp", "018": "/cdn/value.537a680194cce6a999d469fd33307ac4cec9c40b1ae1161bc8a94db7e2540679.webp", "019": "/cdn/value.86516ee73afd28b55b800a3937f61ac37e54576ab84a6fbccc91d3ff6b846334.webp", "020": "/cdn/value.80ad53cfcebe341108ffe89ced690ff10f9d9ecc76fc5f573a03263f8d224afe.webp", "021": "/cdn/value.3d5c775cf7b6bde6758f8048b4e37a5ad2dd7132935afd1c83132addec02e8d0.webp", "022": "/cdn/value.15b90a6c33aeece7d58c915e721fb5320f88c088c4fa9a6eae9099aa64bb983a.webp", "023": "/cdn/value.157d3d7a4a80a63b0f5736b1e2072cbfdcfb6588e4b47c06764653a95c65d0bf.webp", "024": "/cdn/value.cdba208e70eac05465024672039a6c5966dda83e61ca8c3ceccda9c02703eecf.webp", "025": "/cdn/value.167175f84465d0155c276c4f166b1a53bdd4bb4f436ce13e80e5972581207f73.webp", "026": "/cdn/value.a2a436ff9f9f93681ddd383aa697f641d4ddacbe08f840adbca612b45c558f61.webp", "027": "/cdn/value.c6f08649d5a39ac7521d643e8e0cbe30c75a6459bcaf863f609b7c98c90f5a9d.webp", "028": "/cdn/value.909287cef7c487e5ac02446092df6b692496dee180acdd9df1d24e31b4e8899d.webp", "029": "/cdn/value.e292d3a0d32c38f06f279851d6c066246140105fdbb2ac414094e318e07aa209.webp", "030": "/cdn/value.2bae91b5cd15f6d719cddd373f775f52b29069871ad59458c152ade004a61543.webp", "031": "/cdn/value.42902f3827a40761ce0447f2d9abd9c82c0f8185e852724d1e7b62361d1e409b.webp"};
const B = (n) => BRASS_ART[n];
export const BORDERS = {
  window: B('000'),      // big windows: bags, character, spellbook
  dialog: B('001'),      // NPC dialog and quest offer
  menu: B('002'),        // game menu (Esc)
  tooltip: B('003'),     // item / spell tooltips
  slot: B('004'),        // bag slots
  actionSlot: B('005'),  // action-bar buttons
  banner: B('006'),      // wide banners: zone, level up
  unitFrame: B('007'),   // player and target frames
  tracker: B('008'),     // quest tracker
  minimap: B('009'),     // minimap ring box
  chat: B('010'),        // chat box
  portrait: B('011'),    // portraits
  realmRow: B('012'),    // realm list rows
  charRow: B('013'),     // character list rows
  charRowActive: B('014'), // the selected character row
  button: B('015'),      // ordinary buttons
  buttonHot: B('016'),   // primary buttons: Enter World, Accept
  input: B('017'),       // text inputs: names, chat entry
  equipSlot: B('018'),   // equipment slots
  equipSlotRare: B('019'), // equipped rare item
  skillRow: B('020'),    // skills / professions rows
  buff: B('021'),        // buff and debuff icons
  vendor: B('022'),      // vendor window
  vendorItem: B('023'),  // vendor goods
  loot: B('024'),        // loot window
  map: B('025'),         // world map
  journal: B('026'),     // quest journal
  settings: B('027'),    // settings
  raceCard: B('028'),    // race picks in create
  classCard: B('029'),   // class picks in create
  notice: B('030'),      // toasts and notices
  castBar: B('031'),     // cast bar
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
// a panel's frame: style text for the element. The brass line-work is a border-image 9-slice (32 of 96 px);
// the fill sits inset half the border so the ornament's outer corners stay open over the world.
export function frame(role, px = 14, fill = 'rgba(28,20,14,0.88)') {
  const src = BORDERS[role] || BORDERS.window;
  const layer = /gradient|url\(/.test(fill) ? fill : `linear-gradient(${fill},${fill})`;
  const h = Math.round(px / 2);
  return `border:${px}px solid transparent;border-image:url(${src}) 32 / ${px}px stretch;image-rendering:pixelated;background:${layer} center / calc(100% - ${2 * h}px) calc(100% - ${2 * h}px) no-repeat border-box;`;
}
// a divider line: an <img> the width of its box
export function rule(role, width = '100%', height = 20) {
  const src = DIVIDERS[role] || DIVIDERS.section;
  return `<img src="${src}" alt="" style="display:block;width:${width};height:${height}px;object-fit:fill;image-rendering:pixelated;filter:${BRASS};margin:4px auto">`;
}
export const BRASS_FILTER = BRASS;
