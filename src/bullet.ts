import type {
  Artboard,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { createVector, Vector } from './vector';
import { createRect, Rect } from './rect';
import { ArtboardAndStateMachineFetcher } from './utils';
import { createTimer, Timer } from './timer';

const speed = 500;

export type Bullet = {
  life: Timer;
  position: Vector;
  rotation: number;
  artboard: Artboard;
  stateMachine: StateMachineInstance;
  update: (dt: number) => void;
  draw: (renderer: WrappedRenderer) => void;
  collider: () => Rect;
  delete: () => void;
  canBeRemovedAfterOffscreen: () => boolean;
};

// Bullet factory
export const createBullet = (
  spawnPosition: Vector,
  spawnRotation: number,
  artboardStateMachineFetcher: ArtboardAndStateMachineFetcher,
): Bullet => {
  const { artboard, stateMachine } = artboardStateMachineFetcher(
    'bullet',
    'State Machine 1',
  );
  artboard.frameOrigin = false;

  return {
    position: spawnPosition,
    rotation: spawnRotation,
    artboard,
    stateMachine,
    update(dt: number) {
      this.life.tick(dt);

      const direction = createVector(
        Math.sin(this.rotation),
        Math.cos(this.rotation),
      ).normalize();
      this.position.x += direction.x * speed * dt;
      this.position.y += direction.y * -speed * dt;

      this.artboard.advance(dt);
      this.stateMachine.advance(dt);
    },
    draw(renderer: WrappedRenderer) {
      renderer.save();
      renderer.translate(this.position.x, this.position.y);
      renderer.rotate(this.rotation);
      this.artboard.draw(renderer);
      renderer.restore();
    },
    collider() {
      return createRect(
        this.position.x,
        this.position.y,
        this.artboard.bounds.maxX,
        this.artboard.bounds.maxY,
      );
    },
    delete() {
      this.stateMachine.delete();
      this.artboard.delete();
    },
    life: createTimer(2000),
    canBeRemovedAfterOffscreen() {
      return this.life.isReady();
    },
  };
};
