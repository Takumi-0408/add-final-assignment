export type Priority = 'nature' | 'park' | 'river' | 'quiet';

export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetail = {
  placeId: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
};
