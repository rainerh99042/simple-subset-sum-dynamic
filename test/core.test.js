import test from 'node:test';
import assert from 'node:assert/strict';
import { subsetSum, SubsetSum } from '../src/index.js';

test('empty array with target zero is reachable', () => {
  assert.equal(subsetSum([], 0), true);
});

test('empty array with positive target is unreachable', () => {
  assert.equal(subsetSum([], 5), false);
});

test('a single matching value is reachable', () => {
  assert.equal(subsetSum([7], 7), true);
});

test('a single non-matching value is unreachable', () => {
  assert.equal(subsetSum([7], 3), false);
});

test('classic reachable subset', () => {
  assert.equal(subsetSum([3, 34, 4, 12, 5, 2], 9), true);
});

test('classic unreachable subset', () => {
  assert.equal(subsetSum([3, 34, 4, 12, 5, 2], 30), false);
});

test('duplicate values are handled', () => {
  assert.equal(subsetSum([2, 2, 2], 6), true);
});

test('values larger than the target are ignored', () => {
  assert.equal(subsetSum([100, 200, 300], 50), false);
  assert.equal(subsetSum([1, 100, 200], 1), true);
});

test('target larger than the sum of all values is unreachable', () => {
  assert.equal(subsetSum([1, 2, 3], 10), false);
});

test('bitset tracks reachable sums directly', () => {
  const dp = new SubsetSum(10);
  assert.equal(dp.getBit(0), true);
  assert.equal(dp.getBit(1), false);
  dp.add(3);
  assert.equal(dp.getBit(3), true);
  dp.add(4);
  assert.equal(dp.getBit(7), true);
  assert.equal(dp.getBit(1), false);
  assert.equal(dp.canReachTarget(), false);
  dp.add(10);
  assert.equal(dp.canReachTarget(), true);
});

test('negative target is rejected', () => {
  assert.throws(() => subsetSum([1], -1), RangeError);
});

test('non-integer target is rejected', () => {
  assert.throws(() => subsetSum([1], 1.5), RangeError);
});

test('non-array input is rejected', () => {
  assert.throws(() => subsetSum('123', 3), TypeError);
});

test('non-positive values are rejected', () => {
  assert.throws(() => subsetSum([0], 0), RangeError);
  assert.throws(() => subsetSum([-1], 1), RangeError);
  assert.throws(() => subsetSum([1.5], 2), RangeError);
});

test('SubsetSum rejects invalid constructor target', () => {
  assert.throws(() => new SubsetSum(-1), RangeError);
  assert.throws(() => new SubsetSum(1.5), RangeError);
});

test('SubsetSum rejects invalid add value', () => {
  const dp = new SubsetSum(10);
  assert.throws(() => dp.add(0), RangeError);
  assert.throws(() => dp.add(-2), RangeError);
  assert.throws(() => dp.add(1.5), RangeError);
});

test('large target with a small witness', () => {
  const numbers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
  assert.equal(subsetSum(numbers, 1023), true);
  assert.equal(subsetSum(numbers, 1024), false);
});
