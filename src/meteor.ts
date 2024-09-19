import type {
  Artboard,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { createVector, type Vector } from './vector';
import { createRect, Rect } from './rect';
import type { ArtboardAndStateMachineFetcher } from './utils';
import { createTimer, Timer } from './timer';

export type Meteor = {
  position: Vector;
  movement: Vector;
  artboard: Artboard;
  stateMachine: StateMachineInstance;
  rotation: number;
  rotationSpeed: number;
  update: (dt: number) => void;
  draw: (renderer: WrappedRenderer) => void;
  collider: () => Rect;
  delete: () => void;
  life: Timer;
  canBeRemovedAfterOffscreen: () => boolean;
};

// Meteor factory
export const createMeteor = (
  target: Vector,
  canvasSize: Vector,
  artboardStateMachineFetcher: ArtboardAndStateMachineFetcher,
): Meteor => {
  const radius = canvasSize.x / 2;
  const angle = Math.random() * Math.PI * 2;
  const position = createVector(
    target.x + radius * Math.cos(angle),
    target.y + radius * Math.sin(angle),
  );

  const minVelocity = 50;
  const maxVelocity = 150;

  const velocity = minVelocity + Math.random() * (maxVelocity - minVelocity);

  const direction = createVector(
    target.x - position.x,
    target.y - position.y,
  ).normalize();
  const movement = createVector(direction.x * velocity, direction.y * velocity);

  const { artboard, stateMachine } = artboardStateMachineFetcher(
    'meteor',
    'State Machine 1',
  );
  artboard.frameOrigin = false;

  const minRotationSpeed = 0.1;
  const maxRotationSpeed = 1;
  const rotationSpeed =
    minRotationSpeed + Math.random() * (maxRotationSpeed - minRotationSpeed);

  return {
    stateMachine,
    artboard,
    position,
    movement,
    rotation: 0,
    rotationSpeed,
    life: createTimer(10000), // we don't really care about the end time really.
    update(dt: number) {
      this.life.tick(dt);

      this.position.x += this.movement.x * dt;
      this.position.y += this.movement.y * dt;
      this.rotation += this.rotationSpeed * dt;

      this.stateMachine.advance(dt);
      this.artboard.advance(dt);
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
    canBeRemovedAfterOffscreen() {
      return this.life.isReady();
    },
  };
};
