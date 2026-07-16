/** アプリ全体の定数 */

/** AsyncStorage キー */
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboardingCompleted',
} as const;

/** ルート逸脱判定の閾値（メートル） */
export const DEVIATION_THRESHOLD_M = 30;

/** 自動リルートの最大試行回数 */
export const MAX_REROUTE_ATTEMPTS = 2;

/** Places Autocomplete のデバウンス時間（ミリ秒） */
export const SEARCH_DEBOUNCE_MS = 300;

/** お気に入りルート名の最大文字数 */
export const FAVORITE_NAME_MAX_LENGTH = 50;
