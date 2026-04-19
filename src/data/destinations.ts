export interface Destination {
  id: number;
  country: string;
  caption: string;
  emoji: string;
  // Unsplash images — free to use, no API key needed
  imageUrl: string;
  accentColor: string;
  tagline: string;
}

export const destinations: Destination[] = [
  {
    id: 1,
    country: "Maldives",
    caption: "Crystal lagoons & overwater bungalows",
    emoji: "🌊",
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    accentColor: "#00b4d8",
    tagline: "Where the ocean meets the sky",
  },
  {
    id: 2,
    country: "Santorini",
    caption: "Whitewashed cliffs & Aegean sunsets",
    emoji: "🏛️",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    accentColor: "#e07a5f",
    tagline: "A love story written in blue & white",
  },
  {
    id: 3,
    country: "Bali",
    caption: "Lush temples & terraced rice fields",
    emoji: "🌺",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    accentColor: "#52b788",
    tagline: "The island of the gods",
  },
  {
    id: 4,
    country: "Paris",
    caption: "City of lights, love & haute cuisine",
    emoji: "🗼",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    accentColor: "#c9a84c",
    tagline: "Every corner tells a love story",
  },
  {
    id: 5,
    country: "Kyoto",
    caption: "Cherry blossoms & ancient temples",
    emoji: "🌸",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    accentColor: "#f4a0b5",
    tagline: "Timeless beauty in every season",
  },
  {
    id: 6,
    country: "Amalfi Coast",
    caption: "Cliffside villages & turquoise waters",
    emoji: "⛵",
    imageUrl: "https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=800&q=80",
    accentColor: "#f77f00",
    tagline: "La dolce vita on the Mediterranean",
  },
];
