import {
  DEFAULT_LOCATION,
  LOCATION_UPDATE_INTERVAL_MS,
  LOCATION_DISTANCE_FILTER_M,
  DEFAULT_MAP_DELTA,
} from '../location';

describe('location 定数', () => {
  it('DEFAULT_LOCATION が東京駅の座標であること', () => {
    expect(DEFAULT_LOCATION.latitude).toBeCloseTo(35.6812, 3);
    expect(DEFAULT_LOCATION.longitude).toBeCloseTo(139.7671, 3);
  });

  it('LOCATION_UPDATE_INTERVAL_MS が 1000ms であること', () => {
    expect(LOCATION_UPDATE_INTERVAL_MS).toBe(1000);
  });

  it('LOCATION_DISTANCE_FILTER_M が 5m であること', () => {
    expect(LOCATION_DISTANCE_FILTER_M).toBe(5);
  });

  it('DEFAULT_MAP_DELTA が適切な値であること', () => {
    expect(DEFAULT_MAP_DELTA.latitudeDelta).toBeGreaterThan(0);
    expect(DEFAULT_MAP_DELTA.longitudeDelta).toBeGreaterThan(0);
  });
});
