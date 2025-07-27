import CustomCameraControls from './CustomCameraControls';
import { Environment, Stats } from '@react-three/drei';
import GameBoard from './GameBoard';
import { Railroad } from './Railroad';
import { STORAGE_BASE_URL } from '@/lib/constants';
import CenterCompModel from './models/CenterCompModel';

function Scene() {
  return (
    <>
      <CustomCameraControls />

      <GameBoard />
      <Railroad />
      <CenterCompModel />
      <Environment
        files={`${STORAGE_BASE_URL}/textures/sky2_2k.hdr`}
        background
        environmentIntensity={0.6}
      />

      <Stats className="fps-meter" />
    </>
  );
}

export default Scene;
