const WORD_BITS = 32;

/**
 * Bitset backed by a Uint32Array.
 * We use a typed array rather than a plain number array so the bit packing is
 * exact and the memory footprint is predictable for large targets.
 */
export class SubsetSum {
  /**
   * @param {number} target non-negative integer upper bound on the sum
   */
  constructor(target) {
    if (!Number.isInteger(target) || target < 0) {
      throw new RangeError('target must be a non-negative integer');
    }
    this.target = target;
    this.words = new Uint32Array(Math.ceil((target + 1) / WORD_BITS));
    this.setBit(0);
  }

  /**
   * @param {number} index zero-based bit index
   * @returns {boolean} whether the bit is set
   */
  getBit(index) {
    const word = index >>> 5;
    const mask = 1 << (index & 31);
    return (this.words[word] & mask) !== 0;
  }

  /**
   * @param {number} index zero-based bit index
   */
  setBit(index) {
    const word = index >>> 5;
    const mask = 1 << (index & 31);
    this.words[word] |= mask;
  }

  /**
   * Shift the whole bitset left by `shift` positions and OR it back in.
   * This is the step that turns a subset-sum recurrence into a bit operation:
   * reachable sums after adding a value v are exactly the old reachable sums
   * and the old reachable sums plus v.
   *
   * @param {number} shift positive integer shift amount
   */
  shiftOr(shift) {
    const wordShift = shift >>> 5;
    const bitShift = shift & 31;
    const len = this.words.length;

    if (bitShift === 0) {
      for (let i = len - 1; i >= wordShift; i--) {
        this.words[i] |= this.words[i - wordShift];
      }
    } else {
      const inv = WORD_BITS - bitShift;
      for (let i = len - 1; i > wordShift; i--) {
        const low = this.words[i - wordShift] << bitShift;
        const high = this.words[i - wordShift - 1] >>> inv;
        this.words[i] |= low | high;
      }
      this.words[wordShift] |= this.words[0] << bitShift;
    }
  }

  /**
   * Add one value to the reachable set.
   *
   * @param {number} value positive integer
   */
  add(value) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError('value must be a positive integer');
    }
    this.shiftOr(value);
  }

  /**
   * @returns {boolean} whether the target is reachable
   */
  canReachTarget() {
    return this.getBit(this.target);
  }
}

/**
 * Determines whether a subset of `numbers` sums to `target`.
 *
 * The implementation is a bitset dynamic program: bit i of the bitset is set
 * exactly when sum i is reachable using the values seen so far. Adding a value
 * v is `bits |= bits << v`. A Uint32Array is used because JavaScript numbers
 * are doubles and a plain array of booleans would use far more memory; the
 * typed array also keeps the shift arithmetic on 32-bit words exact.
 *
 * @param {number[]} numbers positive integers
 * @param {number} target non-negative integer
 * @returns {boolean} true if some subset sums to target
 */
export function subsetSum(numbers, target) {
  if (!Array.isArray(numbers)) {
    throw new TypeError('numbers must be an array');
  }
  if (!Number.isInteger(target) || target < 0) {
    throw new RangeError('target must be a non-negative integer');
  }
  if (target === 0) {
    for (const value of numbers) {
      if (!Number.isInteger(value) || value <= 0) {
        throw new RangeError('every value must be a positive integer');
      }
    }
    return true;
  }

  const dp = new SubsetSum(target);
  for (const value of numbers) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new RangeError('every value must be a positive integer');
    }
    // Values larger than the target can never participate in a subset that
    // sums to the target, so skipping them avoids useless work.
    if (value > target) {
      continue;
    }
    dp.add(value);
    if (dp.canReachTarget()) {
      return true;
    }
  }
  return dp.canReachTarget();
}
