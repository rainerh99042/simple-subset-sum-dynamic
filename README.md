# simple-subset-sum-dynamic

Decides whether a subset of positive integers sums to a target using a bitset dynamic program.

```js
import { subsetSum, SubsetSum } from './src/index.js';

subsetSum([3, 34, 4, 12, 5, 2], 9); // true
subsetSum([3, 34, 4, 12, 5, 2], 30); // false

const dp = new SubsetSum(10);
dp.add(3);
dp.add(4);
dp.canReachTarget(); // false, 10 is not reachable from {0, 3, 4, 7}
dp.add(10);
dp.canReachTarget(); // true
```

## Why this exists

The subset-sum decision problem is a natural fit for a bitset. Bit `i` of the state is set exactly when sum `i` is reachable from the values seen so far; adding a value `v` is `state |= state << v`. On a 64-bit machine this is roughly sixty-four times denser than a boolean table and often fast enough that the pseudo-polynomial bound is not the bottleneck.

The trade-off is explicit: this library is pseudo-polynomial in the target, not in the number of values. A target of one billion allocates about 125 MB of bitset, so it is the wrong tool when the target is huge but the array is tiny. The alternative, a meet-in-the-middle search, has different memory behaviour and a different failure mode. I picked the bitset because the common case in practice is a moderate target with many values, and because the shift-or step is short enough to audit.

## Edge cases

Values larger than the target are skipped rather than rejected. They cannot appear in any subset that sums to the target, so adding them would only force the bitset to grow or would be discarded anyway. Values must still be positive integers: zero and negatives throw `RangeError`, and a non-array first argument throws `TypeError`. A target of `0` is reachable with the empty subset, and the empty array is accepted.

The bitset is a `Uint32Array`. JavaScript numbers are doubles, so a plain array of booleans would waste memory and a `BigInt` bitset would be slower for the sizes this library is meant for. The 32-bit word size is also what makes the shift arithmetic exact without masking surprises.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

## Limitations

Values are coerced to floats, so very large integers lose precision. If you need
exact integer aggregates over a window, this is the wrong tool.

## Contributing

Issues and pull requests are welcome. Please keep the dependency list empty —
that constraint is the point of the project, not an oversight.

