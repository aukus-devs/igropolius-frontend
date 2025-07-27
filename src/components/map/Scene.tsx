import CustomCameraControls from './CustomCameraControls';
import { Environment, Stats } from '@react-three/drei';
import GameBoard from './GameBoard';
import { Railroad } from './Railroad';
import { STORAGE_BASE_URL } from '@/lib/constants';
import CenterCompModel from './models/CenterCompModel';
import { useControls } from 'leva';

function Scene() {
  const { lightIntensity, bgIntensity, bgBlurriness } = useControls({
    lightIntensity: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
    bgIntensity: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
    bgBlurriness: {
      value: 0.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  return (
    <>
      <CustomCameraControls />

      <GameBoard />
      <Railroad />
      <CenterCompModel />
      <Environment
        files={`${STORAGE_BASE_URL}/textures/sky2_2k.hdr`}
        background
        environmentIntensity={lightIntensity}
        backgroundIntensity={bgIntensity}
        backgroundBlurriness={bgBlurriness}
      />

      <Stats className="fps-meter" />
    </>
  );
}

export default Scene;
