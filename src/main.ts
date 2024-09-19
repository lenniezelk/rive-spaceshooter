import { createGame } from './game';
import RiveCanvas from '@rive-app/canvas-advanced-single';
import './style.css';
import { getArtboardAndStateMachine, getFile } from './utils';
import { createPlayer } from './player';
import { createVector } from './vector';

const isDevMode = import.meta.env.DEV;

const main = async () => {
  const rive = await RiveCanvas();
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const renderer = rive.makeRenderer(canvas);
  const file = await getFile(rive, '/spaceshooter.riv');

  const windowSize = createVector();

  const artboardStateMachineFetcher = getArtboardAndStateMachine(rive, file);

  function onWindowResize() {
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    windowSize.x = canvas.width;
    windowSize.y = canvas.height;
  }

  onWindowResize();

  window.addEventListener('resize', onWindowResize);

  function onKeyPress(event: KeyboardEvent) {
    game.onKeyPress(event.key);
  }

  function onKeyRelease(event: KeyboardEvent) {
    game.onKeyRelease(event.key);
  }

  function onMouseClick(event: MouseEvent) {
    game.player?.shoot();
  }

  window.addEventListener('keydown', onKeyPress);
  window.addEventListener('keyup', onKeyRelease);
  window.addEventListener('click', onMouseClick);

  const game = createGame({
    renderer,
    canvasSize: windowSize,
    artboardStateMachineFetcher,
    rive,
  });
  const player = createPlayer(
    game,
    artboardStateMachineFetcher,
    createVector(windowSize.x / 2, windowSize.y / 2),
  );
  game.player = player;

  let lastTime = 0;

  const update = (time: number) => {
    if (lastTime === 0) {
      lastTime = time;
    }

    const elapsedTimeMs = time - lastTime;
    const dt = elapsedTimeMs / 1000;
    lastTime = time;

    renderer.clear();

    game.update(dt);
    game.draw(renderer);

    rive.requestAnimationFrame(update);
  };

  if (isDevMode) {
    rive.enableFPSCounter();
  }

  rive.requestAnimationFrame(update);
};

main();
