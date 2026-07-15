// AnimeBill — Quotes Library
// © AnimeBill by iprsnmsra | github.com/iprsnmsra

const ANIME_QUOTES = [
  // One Piece
  { text: "I'm going to be King of the Pirates!", emoji: "⚓", source: "Monkey D. Luffy — One Piece" },
  { text: "People's dreams never end!", emoji: "🔥", source: "Whitebeard — One Piece" },
  { text: "Nothing happened.", emoji: "😏", source: "Roronoa Zoro — One Piece" },
  { text: "You need a reason to save someone?", emoji: "❤️", source: "Zoro — One Piece" },
  { text: "I don't want to conquer anything. I just think the guy with the most freedom in the sea is King of the Pirates!", emoji: "🏴‍☠️", source: "Luffy — One Piece" },

  // Naruto
  { text: "Hard work betrays none, but dreams betray many.", emoji: "💪", source: "Hachiman Hikigaya" },
  { text: "A dropout will beat a genius through hard work!", emoji: "📚", source: "Rock Lee — Naruto" },
  { text: "Don't give up! That's your nindō — your ninja way!", emoji: "🌀", source: "Naruto Uzumaki" },
  { text: "In this world, wherever there is light, there are also shadows.", emoji: "🌗", source: "Itachi Uchiha — Naruto" },
  { text: "If you don't share someone's pain, you can never understand them.", emoji: "💙", source: "Nagato — Naruto" },

  // Dragon Ball Z
  { text: "Weakness is a sin.", emoji: "⚡", source: "Vegeta — Dragon Ball Z" },
  { text: "I am the hope of the universe!", emoji: "✊", source: "Goku — Dragon Ball Z" },
  { text: "Power comes in response to a need, not a desire.", emoji: "🌊", source: "Goku — Dragon Ball Z" },
  { text: "It's not over until it's over!", emoji: "💥", source: "Vegeta — Dragon Ball Z" },
  { text: "Surpass your limits. Right here. Right now!", emoji: "🔥", source: "Vegeta — Dragon Ball Z" },

  // Jujutsu Kaisen
  { text: "Throughout Heaven and Earth, I alone am the honoured one.", emoji: "👑", source: "Ryomen Sukuna — JJK" },
  { text: "Don't worry, I'm the strongest.", emoji: "😎", source: "Gojo Satoru — JJK" },
  { text: "No matter how hard or impossible it is, never lose sight of your goal.", emoji: "🎯", source: "Monkey D. Luffy" },

  // Attack on Titan
  { text: "If you win, you live. If you lose, you die. If you don't fight, you can't win!", emoji: "⚔️", source: "Eren Yeager — AoT" },
  { text: "Keep moving forward. Even if it's a crawl.", emoji: "🦋", source: "Levi Ackerman — AoT" },

  // Demon Slayer
  { text: "I can do it. I know I can do it. I'm the guy who will surpass the Hashira!", emoji: "🌊", source: "Tanjiro Kamado" },
  { text: "The bond between Demon Slayers is forged through blood and tears.", emoji: "🌸", source: "Demon Slayer" },

  // FMA
  { text: "The world isn't perfect. But it's there for us, doing the best it can.", emoji: "🌍", source: "Roy Mustang — FMA" },
  { text: "To gain something, something of equal value must be lost.", emoji: "⚖️", source: "Edward Elric — FMA" },

  // Pokémon
  { text: "Gotta catch 'em all! Every day is a new adventure! 🌟", emoji: "⚡", source: "Ash Ketchum — Pokémon" },
  { text: "I choose YOU!", emoji: "❤️", source: "Ash Ketchum — Pokémon" },

  // Motivational
  { text: "The sky is not the limit. Your mind is!", emoji: "☁️", source: "Life Philosophy" },
  { text: "Today's pain is tomorrow's power.", emoji: "💥", source: "Motivation" },
  { text: "Chase your dreams, not people's approval.", emoji: "🦋", source: "Reality" },
  { text: "Every sunrise is an invitation to arise and pursue greatness!", emoji: "🌅", source: "Philosophy" },
  { text: "Small steps every day lead to giant leaps over time.", emoji: "👣", source: "Wisdom" },
  { text: "Even the greatest were once beginners. Don't be afraid to start.", emoji: "🌱", source: "Wisdom" },
  { text: "Without darkness, stars wouldn't shine as bright.", emoji: "⭐", source: "Reality" },
  { text: "Fear is not evil. It tells you what your weakness is.", emoji: "⚡", source: "Gildarts — Fairy Tail" },

  // Store-themed
  { text: "Thank you for choosing us! Your smile is our best reward! 🛍️", emoji: "🎉", source: "AnimeBill Store" },
  { text: "Every purchase is a step toward something greater!", emoji: "💰", source: "AnimeBill" },
  { text: "Your support means the world to us — Come again soon!", emoji: "🙏", source: "AnimeBill Store" },
  { text: "The best investment is in the things that truly matter to you!", emoji: "🌸", source: "Life" },
  { text: "Great things are done by a series of small things brought together.", emoji: "🔗", source: "Philosophy" },
  { text: "It always seems impossible until it's done!", emoji: "🏆", source: "Wisdom" },
];

function getRandomQuote() {
  return ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
}
