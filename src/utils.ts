import type {
  Artboard,
  File,
  RiveCanvas,
  StateMachineInstance,
} from '@rive-app/canvas-advanced-single';

const getArtboard = (file: File, name: string): Artboard => {
  return file.artboardByName(name);
};

const getStateMachine = (
  rive: RiveCanvas,
  artboard: Artboard,
  name: string,
) => {
  const stateMachine = artboard.stateMachineByName(name);
  return new rive.StateMachineInstance(stateMachine, artboard);
};

export type ArtboardAndStateMachineFetcher = (
  artboardName: string,
  stateMachineName: string,
) => {
  artboard: Artboard;
  stateMachine: StateMachineInstance;
};

export const getArtboardAndStateMachine = (rive: RiveCanvas, file: File) => {
  return (artboardName: string, stateMachineName: string) => {
    const artboard = getArtboard(file, artboardName);
    const stateMachine = getStateMachine(rive, artboard, stateMachineName);
    return { artboard, stateMachine };
  };
};

export const getFile = async (rive: RiveCanvas, url: string) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const array = new Uint8Array(arrayBuffer);
  return await rive.load(array);
};

export const getInputFromStateMachine = (
  stateMachine: StateMachineInstance,
  name: string,
) => {
  for (let index = 0; index < stateMachine.inputCount(); index++) {
    const element = stateMachine.input(index);
    if (element.name === name) {
      return element;
    }
  }
  return undefined;
};
