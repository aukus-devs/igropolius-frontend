import CustomCameraControls from '../CustomCameraControls';
import GameBoard from '../GameBoard';
import { Railroad } from '../Railroad';
import CenterCompModel from '../models/CenterCompModel';
import TestSectors from '../models/TestSectors';

function GameScene() {
  return (
    <>
      <CustomCameraControls />
      <TestSectors />
      <GameBoard />
      <Railroad />
      <CenterCompModel />
    </>
  );
}

export default GameScene;
