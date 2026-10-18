import assert from 'node:assert/strict';
import test from 'node:test';
import {
  easeOutCubic,
  mediaSyncopation as score,
  progressAt,
  revealAt,
} from '../src/app/components/mediaSyncopation.ts';

function approximately(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);
}

test('each movement uses local cubic ease-out and clamps outside its interval', () => {
  assert.equal(easeOutCubic(-1), 0);
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(0.5), 0.875);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(2), 1);
  assert.equal(progressAt(999, [1000, 1400]), 0);
  assert.equal(progressAt(1000, [1000, 1400]), 0);
  assert.equal(progressAt(1200, [1000, 1400]), 0.875);
  assert.equal(progressAt(1400, [1000, 1400]), 1);
  assert.equal(progressAt(9000, [1000, 1400]), 1);
});

test('the image and tile pauses hold exact values without residual movement', () => {
  const holds = [
    [score.cards[0].reveal, 0, 192, 0],
    [score.cards[0].reveal, 448, 896, 0.17],
    [score.cards[0].reveal, 1216, 1728, 0.59],
    [score.cards[0].reveal, 2112, 4000, 1],
    [score.cards[1].reveal, 0, 576, 0],
    [score.cards[1].reveal, 800, 1408, 0.14],
    [score.cards[1].reveal, 1664, 2144, 0.64],
    [score.cards[1].reveal, 2464, 4000, 1],
    [score.tile.reveal, 320, 736, 0.13],
    [score.tile.reveal, 1088, 4000, 1],
  ];

  for (const [segments, start, end, expected] of holds) {
    for (let time = start; time <= end; time += 1) {
      assert.equal(revealAt(time, segments), expected, `hold at ${time}ms`);
    }
  }
});

test('a new reveal movement restarts the easing from its held value', () => {
  const [a, b] = score.cards;
  approximately(revealAt(320, a.reveal), 0.17 * 0.875);
  approximately(revealAt(1056, a.reveal), 0.17 + 0.42 * 0.875);
  approximately(revealAt(1920, a.reveal), 0.59 + 0.41 * 0.875);
  approximately(revealAt(688, b.reveal), 0.14 * 0.875);
  approximately(revealAt(1536, b.reveal), 0.14 + 0.5 * 0.875);
  approximately(revealAt(2304, b.reveal), 0.64 + 0.36 * 0.875);
  approximately(revealAt(912, score.tile.reveal), 0.13 + 0.87 * 0.875);
});

test('time sampling is independent of frame rate and survives a skipped scene', () => {
  for (const { reveal } of [...score.cards, score.tile]) {
    const later = revealAt(2450, reveal);
    for (let time = 0; time < 2450; time += 1000 / 144) revealAt(time, reveal);
    assert.equal(revealAt(2450, reveal), later);
    assert.equal(revealAt(score.duration, reveal), 1);
    assert.equal(revealAt(60_000, reveal), 1);
  }
  assert.equal(revealAt(-100, score.cards[0].reveal), 0);
  assert.equal(revealAt(100, []), 0);
});

test('deferred mobile articles retain the uneven desktop rhythm', () => {
  const { rows, all, mobileOffset } = score.articles;
  const shift = ([start, end]) => [start - mobileOffset, end - mobileOffset];
  assert.deepEqual(rows.map(shift), [[0, 608], [480, 1088], [1312, 1920], [1408, 2016]]);
  assert.deepEqual(shift(all), [1664, 2080]);
  assert.deepEqual(rows.slice(1).map(([start], index) => start - rows[index][0]), [480, 832, 96]);
});

test('deferred mobile card B changes its origin without compressing movement or pauses', () => {
  const b = score.cards[1];
  const localSegments = b.reveal.map(segment => ({
    ...segment,
    start: segment.start - b.mobileOffset,
    end: segment.end - b.mobileOffset,
  }));
  assert.deepEqual(localSegments.map(({ start, end }) => [start, end]), [[0, 224], [832, 1088], [1568, 1888]]);
  assert.deepEqual([b.title, b.meta, b.play].map(([start, end]) => [start - b.mobileOffset, end - b.mobileOffset]), [
    [1760, 2400], [1984, 2528], [2016, 2240],
  ]);
  for (let localTime = 0; localTime <= 2528; localTime += 13) {
    assert.equal(revealAt(localTime + b.mobileOffset, b.reveal), revealAt(localTime, localSegments));
  }
});

test('every configured element is fully settled at 3200 milliseconds', () => {
  const intervals = [score.tile.label, ...score.cards.flatMap(card => [card.title, card.meta, card.play]), ...score.articles.rows, score.articles.all];
  assert.equal(score.duration, 3200);
  assert.equal(score.articles.all[1], score.duration);
  for (const interval of intervals) assert.equal(progressAt(score.duration, interval), 1);
  for (const card of score.cards) assert.equal(Math.abs(card.shift * (1 - revealAt(score.duration, card.reveal))), 0);
});
