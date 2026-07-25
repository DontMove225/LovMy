/// Emoji/flag lookups for interest and language chips.
///
/// The backend only stores a placeholder PNG per interest/language (a solid
/// color circle with a 2-letter abbreviation baked into the image itself,
/// not a real emoji/flag) — this maps the chip's title to a real emoji so
/// the UI doesn't need a backend change or new image assets.
String interestEmoji(String? title) {
  switch (title) {
    case "Voyage":
      return "✈️";
    case "Repas":
      return "🍽️";
    case "Randonnée":
      return "🥾";
    case "Yoga":
      return "🧘";
    case "Sport":
      return "⚽";
    case "Cinéma":
      return "🎬";
    case "Lecture":
      return "📖";
    case "Animaux":
      return "🐾";
    case "Boisson":
      return "🍹";
    case "Dance":
      return "💃";
    case "Musique":
      return "🎵";
    default:
      return "✨";
  }
}

String languageFlag(String? title) {
  switch (title) {
    case "Français":
      return "🇫🇷";
    case "Anglais":
      return "🇬🇧";
    case "Espagnol":
      return "🇪🇸";
    case "Portugais":
      return "🇵🇹";
    case "Arabe":
      return "🇸🇦";
    case "Italien":
      return "🇮🇹";
    case "Portugais (Brésil)":
      return "🇧🇷";
    case "Allemand":
      return "🇩🇪";
    case "Néerlandais":
      return "🇳🇱";
    case "Belge":
      return "🇧🇪";
    case "Suisse":
      return "🇨🇭";
    case "Français canadien":
      return "🇨🇦";
    case "Anglais (Inde)":
      return "🇮🇳";
    case "Chinois":
      return "🇨🇳";
    case "Bengali":
      return "🇧🇩";
    case "Indonésien":
      return "🇮🇩";
    case "Russe":
      return "🇷🇺";
    case "Japonais":
      return "🇯🇵";
    case "Turc":
      return "🇹🇷";
    case "Vietnamien":
      return "🇻🇳";
    default:
      return "🏳️";
  }
}
