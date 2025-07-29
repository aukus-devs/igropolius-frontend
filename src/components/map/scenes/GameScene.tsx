import CustomCameraControls from '../CustomCameraControls';
import GameBoard from '../GameBoard';
import { Railroad } from '../Railroad';
import CenterCompModel from '../models/CenterCompModel';

function GameScene() {
  return (
    <>
      <CustomCameraControls />
      <GameBoard />
      <Railroad />
      <CenterCompModel />
    </>
  );
}

export default GameScene;
