export type Timer = {
  currentTicks: number;
  targetTicks: number;
  tick: (elapsedTime: number) => void;
  isReady: () => boolean;
  reset: () => void;
};

// Timer factory
export const createTimer = (targetTicks: number = 0): Timer => ({
  currentTicks: 0,
  targetTicks,
  tick(elapsedTime: number) {
    this.currentTicks += elapsedTime * 1000;
  },
  isReady() {
    return this.currentTicks >= this.targetTicks;
  },
  reset() {
    this.currentTicks = 0;
  },
});
