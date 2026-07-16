import { calculateWalkScore, applyPriorityWeights } from '../scorer';
import type { ScoringInput, Priority } from '../scorer';

const makePoi = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ placeId: `p${i}`, type: 'park' as const }));

describe('calculateWalkScore', () => {
  const baseInput: ScoringInput = {
    naturePoiCount: 0,
    parkPoiCount: 0,
    riverPoiCount: 0,
    arterialRoadRatio: 0,
    priorities: [],
  };

  it('POI がすべて 0・幹線道路なしのとき walkScore は 0〜100 の範囲', () => {
    const score = calculateWalkScore(baseInput);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('公園 POI が多いとき park スコアが高い', () => {
    const low = calculateWalkScore({ ...baseInput, parkPoiCount: 0 });
    const high = calculateWalkScore({ ...baseInput, parkPoiCount: 10 });
    expect(high).toBeGreaterThan(low);
  });

  it('幹線道路割合が高いとき quiet スコアが低い', () => {
    const quiet = calculateWalkScore({ ...baseInput, arterialRoadRatio: 0 });
    const noisy = calculateWalkScore({ ...baseInput, arterialRoadRatio: 1 });
    expect(quiet).toBeGreaterThan(noisy);
  });

  it('walkScore は常に 0〜100 の範囲に収まる（上限テスト）', () => {
    const score = calculateWalkScore({
      naturePoiCount: 100,
      parkPoiCount: 100,
      riverPoiCount: 100,
      arterialRoadRatio: 0,
      priorities: ['nature', 'park', 'river', 'quiet'],
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('applyPriorityWeights', () => {
  it('priorities が空のときデフォルト重みを使う', () => {
    const scores = { nature: 80, park: 60, river: 40, quiet: 70 };
    const result = applyPriorityWeights(scores, []);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('nature を優先したとき、nature スコアが優先なし時より高い重みで反映される', () => {
    const scores = { nature: 100, park: 0, river: 0, quiet: 0 };
    const withPriority = applyPriorityWeights(scores, ['nature']);
    const withoutPriority = applyPriorityWeights(scores, []);
    // nature=100、他=0 のとき、nature を優先指定した方が合計スコアが高くなる
    expect(withPriority).toBeGreaterThan(withoutPriority);
  });
});
