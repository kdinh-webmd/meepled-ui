export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Player' | 'CafeOwner' | 'Admin';
  language: string;
  avatarColor?: string | null;
  avatarIcon?: string | null;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface GameCardData {
  id: string;
  gameId?: string;
  title: string;
  bggId: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  bggRating?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  minTime?: number | null;
  maxTime?: number | null;
  weight?: number | null;
  featured?: boolean;
  copies?: number;
}

export interface GameDetailData extends GameCardData {
  designer?: string | null;
  publisher?: string | null;
  yearPublished?: number | null;
  minAge?: number | null;
  bggRank?: number | null;
  description?: string | null;
  categories: string[];
  cafes: GameCafeRef[];
}

export interface GameCafeRef {
  cafeId: string;
  cafeName: string;
  cafeAddress?: string | null;
  copies: number;
}

export interface CafeCard {
  id: string;
  name: string;
  address?: string | null;
  coverUrl?: string | null;
  rating: number;
  gameCount: number;
  lat?: number | null;
  lng?: number | null;
}

export interface CafeDetail {
  id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  mapUrl?: string | null;
  fanpage?: string | null;
  contact?: string | null;
  hours?: string | null;
  dayPass?: string | null;
  about?: string | null;
  coverUrl?: string | null;
  rating: number;
  games: GameCardData[];
  menu: MenuItem[];
  photos: string[];
  reviews: Review[];
}

export interface MenuItem {
  id: string;
  name: string;
  price?: string | null;
  imageUrl?: string | null;
}

export interface Review {
  id: string;
  userName: string;
  stars: number;
  body?: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  userName: string;
  avatarColor?: string | null;
  body: string;
  isStaff: boolean;
  createdAt: string;
}

export interface WishlistItem {
  gameId: string;
  title: string;
  bggId: number;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  bggRating?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
}

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished?: number | null;
}

export interface HotGame {
  rank: number;
  bggId: number;
  name: string;
  yearPublished?: number | null;
  thumbnailUrl?: string | null;
  localId?: string | null;
}

export interface BggImageResult {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
}

export interface UpdateUserRequest {
  language?: string;
  avatarColor?: string;
  avatarIcon?: string;
}

export interface UpdateCafeRequest {
  name?: string;
  address?: string;
  about?: string;
  hours?: string;
  dayPass?: string;
  contact?: string;
  mapUrl?: string;
  fanpage?: string;
}
