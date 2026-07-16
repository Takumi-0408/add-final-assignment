/**
 * 距離（メートル）をフォーマットする
 * - 1000m 未満: "Xm"
 * - 1000m 以上: "X.Xkm"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 所要時間（秒）をフォーマットする
 * - 60秒未満: "1分未満"
 * - 60分未満: "X分"
 * - 60分以上: "X時間Y分"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return '1分未満';
  const totalMinutes = Math.floor(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}分`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}時間${minutes}分`;
}
