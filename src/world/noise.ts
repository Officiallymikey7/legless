const PERMUTATION_SIZE = 256;
const SIMPLEX_SKEW_2D = 0.5 * (Math.sqrt(3) - 1);
const SIMPLEX_UNSKEW_2D = (3 - Math.sqrt(3)) / 6;

const GRADIENTS_2D: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0, 1],
  [0, -1],
];

/**
 * Seeded 2D Simplex Noise implementation suitable for procedural terrain.
 */
export class SimplexNoise {
  private readonly _permutation: Uint8Array;

  /**
   * @param seed - Deterministic seed for permutation generation.
   */
  constructor(seed: number) {
    this._permutation = this._buildPermutation(seed);
  }

  private _buildPermutation(seed: number): Uint8Array {
    const random = mulberry32(seed);
    const values = new Uint8Array(PERMUTATION_SIZE * 2);
    const source = new Uint8Array(PERMUTATION_SIZE);

    for (let i = 0; i < PERMUTATION_SIZE; i += 1) {
      source[i] = i;
    }

    for (let i = PERMUTATION_SIZE - 1; i >= 0; i -= 1) {
      const swapIndex = Math.floor(random() * (i + 1));
      const value = source[swapIndex];
      source[swapIndex] = source[i];
      source[i] = value;
    }

    for (let i = 0; i < values.length; i += 1) {
      values[i] = source[i & (PERMUTATION_SIZE - 1)];
    }

    return values;
  }

  private _gradient(hash: number, x: number, y: number): number {
    const gradient = GRADIENTS_2D[hash % GRADIENTS_2D.length];
    return (gradient[0] * x) + (gradient[1] * y);
  }

  /**
   * Samples 2D simplex noise at the given coordinates.
   *
   * @param x - X coordinate in noise space.
   * @param y - Y coordinate in noise space.
   * @returns Noise value in the approximate range `[-1, 1]`.
   */
  noise2D(x: number, y: number): number {
    const skewedCell = (x + y) * SIMPLEX_SKEW_2D;
    const i = Math.floor(x + skewedCell);
    const j = Math.floor(y + skewedCell);
    const cellOrigin = (i + j) * SIMPLEX_UNSKEW_2D;
    const x0 = x - (i - cellOrigin);
    const y0 = y - (j - cellOrigin);

    const x0IsGreater = x0 > y0;
    const i1 = x0IsGreater ? 1 : 0;
    const j1 = x0IsGreater ? 0 : 1;

    const x1 = x0 - i1 + SIMPLEX_UNSKEW_2D;
    const y1 = y0 - j1 + SIMPLEX_UNSKEW_2D;
    const x2 = x0 - 1 + (2 * SIMPLEX_UNSKEW_2D);
    const y2 = y0 - 1 + (2 * SIMPLEX_UNSKEW_2D);

    const ii = i & (PERMUTATION_SIZE - 1);
    const jj = j & (PERMUTATION_SIZE - 1);

    const gi0 = this._permutation[ii + this._permutation[jj]];
    const gi1 = this._permutation[ii + i1 + this._permutation[jj + j1]];
    const gi2 = this._permutation[ii + 1 + this._permutation[jj + 1]];

    const n0 = contribution(this._gradient(gi0, x0, y0), x0, y0);
    const n1 = contribution(this._gradient(gi1, x1, y1), x1, y1);
    const n2 = contribution(this._gradient(gi2, x2, y2), x2, y2);

    return 70 * (n0 + n1 + n2);
  }
}

function contribution(gradientDotProduct: number, x: number, y: number): number {
  const attenuation = 0.5 - (x * x) - (y * y);
  if (attenuation <= 0) {
    return 0;
  }

  const attenuationSquared = attenuation * attenuation;
  return attenuationSquared * attenuationSquared * gradientDotProduct;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
