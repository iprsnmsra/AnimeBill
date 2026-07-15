// ═══════════════════════════════════════════════════════
// AnimeBill — Anime Character Sketches
// Real B&W manga portrait images + SVG fallbacks
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

// Each character has either:
//   sketchImg  — path to a real B&W sketch PNG image
//   sketchSvg  — inline SVG (fallback for remaining characters)

const ANIME_CHARACTERS = [

  // ══════════ ONE PIECE ══════════
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    anime: 'One Piece',
    type: 'img',
    sketchImg: 'assets/sketches/luffy.png',
    animeFont: "'Bangers', cursive",
    animeFontSize: '1.15rem',
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    anime: 'One Piece',
    type: 'img',
    sketchImg: 'assets/sketches/zoro.png',
    animeFont: "'Bangers', cursive",
    animeFontSize: '1.15rem',
  },
  {
    id: 'nami',
    name: 'Nami',
    anime: 'One Piece',
    type: 'img',
    sketchImg: 'assets/sketches/nami.png',
    animeFont: "'Bangers', cursive",
    animeFontSize: '1.15rem',
  },
  {
    id: 'ace',
    name: 'Portgas D. Ace',
    anime: 'One Piece',
    type: 'img',
    sketchImg: 'assets/sketches/ace.png',
    animeFont: "'Bangers', cursive",
    animeFontSize: '1.15rem',
  },
  {
    id: 'sanji',
    name: 'Sanji',
    anime: 'One Piece',
    type: 'img',
    sketchImg: 'assets/sketches/sanji.png',
    animeFont: "'Bangers', cursive",
    animeFontSize: '1.15rem',
  },

  // ══════════ JUJUTSU KAISEN ══════════
  {
    id: 'gojo',
    name: 'Gojo Satoru',
    anime: 'Jujutsu Kaisen',
    type: 'img',
    sketchImg: 'assets/sketches/gojo.png',
    animeFont: "'Creepster', cursive",
    animeFontSize: '0.88rem',
  },
  {
    id: 'itadori',
    name: 'Itadori Yuji',
    anime: 'Jujutsu Kaisen',
    type: 'img',
    sketchImg: 'assets/sketches/itadori.png',
    animeFont: "'Creepster', cursive",
    animeFontSize: '0.88rem',
  },
  {
    id: 'sukuna',
    name: 'Ryomen Sukuna',
    anime: 'Jujutsu Kaisen',
    type: 'img',
    sketchImg: 'assets/sketches/sukuna.png',
    animeFont: "'Creepster', cursive",
    animeFontSize: '0.88rem',
  },
  {
    id: 'nobara',
    name: 'Nobara Kugisaki',
    anime: 'Jujutsu Kaisen',
    type: 'img',
    sketchImg: 'assets/sketches/nobara.png',
    animeFont: "'Creepster', cursive",
    animeFontSize: '0.88rem',
  },
  {
    id: 'megumi',
    name: 'Megumi Fushiguro',
    anime: 'Jujutsu Kaisen',
    type: 'img',
    sketchImg: 'assets/sketches/megumi.png',
    animeFont: "'Creepster', cursive",
    animeFontSize: '0.88rem',
  },

  // ══════════ POKÉMON ══════════
  {
    id: 'ash',
    name: 'Ash Ketchum',
    anime: 'Pokémon',
    type: 'img',
    sketchImg: 'assets/sketches/ash.png',
    animeFont: "'Press Start 2P', cursive",
    animeFontSize: '0.55rem',
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    anime: 'Pokémon',
    type: 'img',
    sketchImg: 'assets/sketches/pikachu.png',
    animeFont: "'Press Start 2P', cursive",
    animeFontSize: '0.55rem',
  },

  // ══════════ NARUTO ══════════
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    anime: 'Naruto',
    type: 'img',
    sketchImg: 'assets/sketches/naruto.png',
    animeFont: "'Righteous', cursive",
    animeFontSize: '1.0rem',
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    anime: 'Naruto',
    type: 'img',
    sketchImg: 'assets/sketches/sasuke.png',
    animeFont: "'Righteous', cursive",
    animeFontSize: '1.0rem',
  },

  // ══════════ DRAGON BALL Z ══════════
  {
    id: 'goku',
    name: 'Son Goku',
    anime: 'Dragon Ball Z',
    type: 'img',
    sketchImg: 'assets/sketches/goku.png',
    animeFont: "'Black Han Sans', sans-serif",
    animeFontSize: '0.9rem',
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    anime: 'Dragon Ball Z',
    type: 'img',
    sketchImg: 'assets/sketches/vegeta.png',
    animeFont: "'Black Han Sans', sans-serif",
    animeFontSize: '0.9rem',
  },

  // ══════════ ATTACK ON TITAN ══════════
  {
    id: 'levi',
    name: 'Levi Ackerman',
    anime: 'Attack on Titan',
    type: 'img',
    sketchImg: 'assets/sketches/levi.png',
    animeFont: "'Russo One', sans-serif",
    animeFontSize: '0.82rem',
  },
  {
    id: 'eren',
    name: 'Eren Yeager',
    anime: 'Attack on Titan',
    type: 'img',
    sketchImg: 'assets/sketches/eren.png',
    animeFont: "'Russo One', sans-serif",
    animeFontSize: '0.82rem',
  },

  // ══════════ FULLMETAL ALCHEMIST ══════════
  {
    id: 'edward',
    name: 'Edward Elric',
    anime: 'Fullmetal Alchemist',
    type: 'img',
    sketchImg: 'assets/sketches/edward.png',
    animeFont: "'Special Elite', cursive",
    animeFontSize: '0.78rem',
  },

  // ══════════ DEMON SLAYER ══════════
  {
    id: 'tanjiro',
    name: 'Tanjiro Kamado',
    anime: 'Demon Slayer',
    type: 'img',
    sketchImg: 'assets/sketches/tanjiro.png',
    animeFont: "'Noto Serif JP', serif",
    animeFontSize: '0.85rem',
  },
];

// ─── Helper: Get random character ───
function getRandomCharacter() {
  return ANIME_CHARACTERS[Math.floor(Math.random() * ANIME_CHARACTERS.length)];
}

// ─── Helper: Get by ID ───
function getCharacterById(id) {
  return ANIME_CHARACTERS.find(c => c.id === id) || getRandomCharacter();
}

// ─── Helper: Build the background sketch HTML for bill ───
function buildSketchHTML(character) {
  if (character.type === 'img') {
    return `<img
      src="${character.sketchImg}"
      alt="${character.name} sketch"
      class="bill-sketch-img"
      draggable="false"
    >`;
  } else {
    // SVG fallback
    return `<div class="bill-sketch-svg">${character.sketchSvg}</div>`;
  }
}
