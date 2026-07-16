export type Priority = 'nature' | 'park' | 'river' | 'quiet';

export type SubScores = Record<Priority, number>;

export type ScoringInput = {
  naturePoiCount: number;
  parkPoiCount: number;
  riverPoiCount: number;
  arterialRoadRatio: number; // 0〜1: 幹線道路経由の割合
  priorities: Priority[];
};

/** POI 数を 0〜100 のスコアに変換（上限 10 件で飽和） */
function poiCountToScore(count: number): number {
  return Math.min(count / 10, 1) * 100;
}

/** 幹線道路割合の逆数スコア（0=幹線道路なし→100, 1=全て幹線道路→0） */
function arterialToQuietScore(ratio: number): number {
  return (1 - Math.min(ratio, 1)) * 100;
}

/** サブスコアを計算する */
function calcSubScores(input: ScoringInput): SubScores {
  return {
    nature: poiCountToScore(input.naturePoiCount),
    park: poiCountToScore(input.parkPoiCount),
    river: poiCountToScore(input.riverPoiCount),
    quiet: arterialToQuietScore(input.arterialRoadRatio),
  };
}

/** デフォルト重み（均等） */
const DEFAULT_WEIGHTS: Record<Priority, number> = {
  nature: 0.25,
  park: 0.25,
  river: 0.25,
  quiet: 0.25,
};

/**
 * priorities に応じて重み付きスコアを計算する
 *
 * 重み配分:
 *   - 優先あり: 指定カテゴリ = 3 / (3n + m)、残り = 1 / (3n + m)
 *     （n=優先カテゴリ数, m=残りカテゴリ数）
 *   - 優先なし: 均等 0.25 ずつ
 */
export function applyPriorityWeights(
  subScores: SubScores,
  priorities: Priority[],
): number {
  const allKeys = Object.keys(DEFAULT_WEIGHTS) as Priority[];

  if (priorities.length === 0) {
    const total = allKeys.reduce(
      (sum, key) => sum + subScores[key] * DEFAULT_WEIGHTS[key],
      0,
    );
    return Math.round(Math.min(Math.max(total, 0), 100));
  }

  const n = priorities.length;
  const m = allKeys.length - n;
  const denominator = 3 * n + m;

  const total = allKeys.reduce((sum, key) => {
    const w = priorities.includes(key) ? 3 / denominator : 1 / denominator;
    return sum + subScores[key] * w;
  }, 0);

  return Math.round(Math.min(Math.max(total, 0), 100));
}

/**
 * ルートの散歩スコア（0〜100）を計算する
 */
export function calculateWalkScore(input: ScoringInput): number {
  const subScores = calcSubScores(input);
  return applyPriorityWeights(subScores, input.priorities);
}
