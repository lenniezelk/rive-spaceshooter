import type {
  WrappedRenderer,
  RiveCanvas,
} from '@rive-app/canvas-advanced-single';
import { createMeteor, type Meteor } from './meteor';
import type { Player } from './player';
import { createTimer, Timer } from './timer';
import { type Vector } from './vector';
import type { ArtboardAndStateMachineFetcher } from './utils';
import type { Bullet } from './bullet';
import { createVitals, Vitals } from './vitals';

export type Game = {
  player?: Player;
  meteors: Meteor[];
  bullets: Bullet[];
  update: (dt: number) => void;
  draw: (renderer: WrappedRenderer) => void;
  meterSpawnTimer: Timer;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
  renderer: WrappedRenderer;
  onKeyPress: (key: string) => void;
  onKeyRelease: (key: string) => void;
  addBullet: (bullet: Bullet) => void;
  reset: () => void;
  vitals: Vitals;
};

export type GameProps = {
  renderer: WrappedRenderer;
  canvasSize: Vector;
  rive: RiveCanvas;
  artboardStateMachineFetcher: ArtboardAndStateMachineFetcher;
};

// Game factory
export const createGame = ({
  renderer,
  canvasSize,
  rive,
  artboardStateMachineFetcher,
}: GameProps): Game => {
  return {
    renderer,
    meterSpawnTimer: createTimer(1000),
    meteors: [],
    bullets: [],
    pressedKeys: new Set(),
    isKeyPressed(key: string) {
      return this.pressedKeys.has(key);
    },
    update(dt: number) {
      this.player?.update(dt);

      this.meterSpawnTimer.tick(dt);

      if (this.meterSpawnTimer.isReady()) {
        this.meterSpawnTimer.reset();

        const meteor = createMeteor(
          this.player!.position,
          canvasSize,
          artboardStateMachineFetcher,
        );

        this.meteors.push(meteor);
      }

      const bulletsToRemove: Set<Bullet> = new Set();
      const meteorsToRemove: Set<Meteor> = new Set();

      for (const meteor of this.meteors) {
        if (this.player?.collider().intersects(meteor.collider())) {
          this.player.hit();
          this.vitals.updateHealth(this.player.health);
          meteorsToRemove.add(meteor);
        }

        for (const bullet of this.bullets) {
          if (bullet.collider().intersects(meteor.collider())) {
            meteorsToRemove.add(meteor);
            bulletsToRemove.add(bullet);
          }
        }
      }

      if (this.player!.lives === 0) {
        this.reset();
        return;
      }

      if (bulletsToRemove.size > 0) {
        this.bullets = this.bullets.filter(
          (bullet) => !bulletsToRemove.has(bullet),
        );
      }

      if (meteorsToRemove.size > 0) {
        this.meteors = this.meteors.filter(
          (meteor) => !meteorsToRemove.has(meteor),
        );
      }

      bulletsToRemove.forEach((bullet) => bullet.delete());
      meteorsToRemove.forEach((meteor) => meteor.delete());

      this.meteors.forEach((meteor) => {
        meteor.update(dt);
      });

      this.bullets.forEach((bullet) => {
        bullet.update(dt);
      });

      this.vitals.update(dt);
    },
    draw(renderer: WrappedRenderer) {
      this.player?.draw(renderer);

      this.meteors.forEach((meteor) => {
        meteor.draw(renderer);
      });

      this.bullets.forEach((bullet) => {
        bullet.draw(renderer);
      });

      this.vitals.draw(renderer, canvasSize, rive);
    },
    onKeyPress(key: string) {
      this.pressedKeys.add(key);
    },
    onKeyRelease(key: string) {
      this.pressedKeys.delete(key);
    },
    addBullet(bullet: Bullet) {
      this.bullets.push(bullet);
    },
    reset() {
      const previousMeteor = this.meteors;
      this.meteors = [];
      previousMeteor.forEach((meteor) => meteor.delete());
      const previousBullets = this.bullets;
      this.bullets = [];
      previousBullets.forEach((bullet) => bullet.delete());
      this.player!.reset(canvasSize);
    },
    vitals: createVitals({
      artboardStateMachineFetcher,
      health: 100,
      lives: 3,
    }),
  };
};
