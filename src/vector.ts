export type Vector = {
  x: number;
  y: number;
  normalize: () => Vector;
};

// Vector factory
export const createVector = (x: number = 0, y: number = 0): Vector => ({
  x,
  y,
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);

    if (length === 0) {
      return { x: 0, y: 0, normalize: this.normalize };
    }

    return {
      x: this.x / length,
      y: this.y / length,
      normalize: this.normalize,
    };
  },
});
