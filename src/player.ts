import type {
  Artboard,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { createVector, type Vector } from './vector';
import { createTimer, type Timer } from './timer';
import type { Game } from './game';
import type { ArtboardAndStateMachineFetcher } from './utils';
import { createRect, Rect } from './rect';
import { createBullet } from './bullet';

const ROTATION_SPEED = 2;
const bulletSpawnOffset = 80;
const MOVE_SPEED = 200;

export type Player = {
  direction: Vector;
  health: number;
  lives: number;
  position: Vector;
  rotation: number;
  artboard: Artboard;
  stateMachine: StateMachineInstance;
  update: (dt: number) => void;
  draw: (renderer: WrappedRenderer) => void;
  shootCooldownTimer: Timer;
  game: Game;
  shoot: () => void;
  collider: () => Rect;
  hit: () => void;
  reset: (canvasSize: Vector) => void;
};

// Player factory
export const createPlayer = (
  game: Game,
  artboardStateMachineFetcher: ArtboardAndStateMachineFetcher,
  target: Vector,
): Player => {
  const { artboard, stateMachine } = artboardStateMachineFetcher(
    'hero',
    'State Machine 1',
  );
  artboard.frameOrigin = false;

  return {
    direction: createVector(0, 0),
    health: 100,
    lives: 3,
    stateMachine,
    artboard,
    position: target,
    rotation: 0,
    game,
    shootCooldownTimer: createTimer(300),
    update(dt: number) {
      this.shootCooldownTimer.tick(dt);

      if (this.game.isKeyPressed(' ') && this.shootCooldownTimer.isReady()) {
        this.shootCooldownTimer.reset();
        this.shoot();
      }

      if (this.game.isKeyPressed('ArrowLeft') || this.game.isKeyPressed('a')) {
        this.rotation -= ROTATION_SPEED * dt;
      }

      if (this.game.isKeyPressed('ArrowRight') || this.game.isKeyPressed('d')) {
        this.rotation += ROTATION_SPEED * dt;
      }

      if (this.game.isKeyPressed('ArrowUp') || this.game.isKeyPressed('w')) {
        this.direction = createVector(
          Math.sin(this.rotation),
          Math.cos(this.rotation),
        ).normalize();
        this.position.x += this.direction.x * MOVE_SPEED * dt;
        this.position.y += this.direction.y * -MOVE_SPEED * dt;
      } else {
        this.direction = createVector(0, 0);
      }

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
    shoot() {
      const spawnPosition = createVector(
        this.position.x + Math.sin(this.rotation) * bulletSpawnOffset,
        this.position.y + Math.cos(this.rotation) * -bulletSpawnOffset,
      );

      const bullet = createBullet(
        spawnPosition,
        this.rotation,
        artboardStateMachineFetcher,
      );

      this.game.addBullet(bullet);
    },
    collider() {
      return createRect(
        this.position.x,
        this.position.y,
        this.artboard.bounds.maxX,
        this.artboard.bounds.maxY,
      );
    },
    hit() {
      this.health -= 10;

      if (this.health <= 0) {
        this.lives -= 1;
        this.health = 100;
      }
    },
    reset(canvasSize: Vector) {
      this.health = 100;
      this.lives = 3;
      this.position = createVector(canvasSize.x / 2, canvasSize.y / 2);
      this.rotation = 0;
    },
  };
};
