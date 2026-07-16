/** 位置情報関連の定数 */

/** デフォルト地点: 東京駅（位置情報が利用不可の場合に使用） */
export const DEFAULT_LOCATION = {
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

/** ナビゲーション中の位置情報更新間隔（ミリ秒） */
export const LOCATION_UPDATE_INTERVAL_MS = 1000;

/** ナビゲーション中の位置情報距離フィルター（メートル） */
export const LOCATION_DISTANCE_FILTER_M = 5;

/** 地図の初期表示範囲 */
export const DEFAULT_MAP_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
} as const;
