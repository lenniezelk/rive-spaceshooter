import {
  Artboard,
  StateMachineInstance,
  WrappedRenderer,
  RiveCanvas,
  SMIInput,
  TextValueRun,
} from '@rive-app/canvas-advanced-single';
import {
  ArtboardAndStateMachineFetcher,
  getInputFromStateMachine,
} from './utils';
import { Vector } from './vector';

export type Vitals = {
  healthInput?: SMIInput;
  health: number;
  lives: number;
  artboard: Artboard;
  stateMachine: StateMachineInstance;
  update: (dt: number) => void;
  draw: (
    renderer: WrappedRenderer,
    canvasSize: Vector,
    rive: RiveCanvas,
  ) => void;
  updateHealth: (health: number) => void;
  updateLives: (lives: number) => void;
  healthText: TextValueRun;
};

export type VitalsProps = {
  health: number;
  lives: number;
  artboardStateMachineFetcher: ArtboardAndStateMachineFetcher;
};

// Vitals factory
export const createVitals = ({
  artboardStateMachineFetcher,
  health,
  lives,
}: VitalsProps): Vitals => {
  const { artboard, stateMachine } = artboardStateMachineFetcher(
    'vitals',
    'State Machine 1',
  );
  artboard.frameOrigin = false;

  let healthInput: SMIInput | undefined = getInputFromStateMachine(
    stateMachine,
    'health',
  )?.asNumber();
  const healthText = artboard.textRun('healthTextRun');

  return {
    healthText,
    healthInput,
    artboard,
    stateMachine,
    health,
    lives,
    update(dt: number) {
      this.artboard.advance(dt);
      this.stateMachine.advance(dt);
    },
    draw(renderer: WrappedRenderer, canvasSize: Vector, rive: RiveCanvas) {
      renderer.save();
      renderer.align(
        rive.Fit.none,
        rive.Alignment.topLeft,
        {
          minX: 30,
          minY: 30,
          maxX: canvasSize.x,
          maxY: canvasSize.y,
        },
        this.artboard.bounds,
      );
      this.artboard.draw(renderer);
      renderer.restore();
    },
    updateHealth(health: number) {
      const _health = health < 0 ? 0 : health > 100 ? 100 : health;

      this.health = _health;

      if (this.healthInput) {
        this.healthInput.value = _health;
      }
      if (this.healthText) {
        this.healthText.text = `${_health}%`;
      }
    },
    updateLives(lives: number) {
      this.lives = lives;
    },
  };
};
