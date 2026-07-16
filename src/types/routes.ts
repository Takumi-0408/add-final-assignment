import type { Priority } from './places';

export type ScoreDetail = Record<Priority, number>;

export type RouteStep = {
  instruction: string;
  distanceMeters: number;
  polyline: string;
  maneuver?: string;
};

export type WalkRoute = {
  routeId: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  walkScore: number;
  scoreDetail: ScoreDetail;
  steps: RouteStep[];
};
