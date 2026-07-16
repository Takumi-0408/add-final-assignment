import type { Priority } from './places';

export type Favorite = {
  favoriteId: string;
  name: string;
  origin: { latitude: number; longitude: number };
  originName: string;
  destination: { latitude: number; longitude: number };
  destinationName: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  priorities: Priority[];
  createdAt: Date;
};

/** Firestore 保存時の入力型（ID・日時はサーバー側で付与） */
export type FavoriteInput = Omit<Favorite, 'favoriteId' | 'createdAt'>;
