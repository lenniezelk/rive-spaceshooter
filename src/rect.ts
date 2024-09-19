export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  maxX: number;
  maxY: number;
  intersects: (rect: Rect) => boolean;
};

// Rect factory
export const createRect = (
  x: number = 0,
  y: number = 0,
  width: number = 0,
  height: number = 0,
): Rect => {
  const maxX = x + width;
  const maxY = y + height;

  return {
    x,
    y,
    width,
    height,
    maxX,
    maxY,
    intersects(other: Rect) {
      return (
        this.x < other.maxX &&
        this.maxX > other.x &&
        this.y < other.maxY &&
        this.maxY > other.y
      );
    },
  };
};
