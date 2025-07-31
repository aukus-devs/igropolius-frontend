import CustomCameraControls from '../CustomCameraControls';
import DiceRoll from '../DiceRoll';
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
      <DiceRoll />
    </>
  );
}

export default GameScene;
