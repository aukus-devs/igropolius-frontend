import CameraControls from 'camera-controls';
import { create } from 'zustand';
import useModelsStore from './modelsStore';
import { Group, Vector3 } from 'three';
import { HALF_BOARD } from '@/lib/constants';
import { getShortestRotationDelta } from '@/lib/utils';

const useCameraStore = create<{
  cameraControls: CameraControls | null;
  isOrthographic: boolean;
  setCameraControls: (controls: CameraControls) => void;
  cameraToPlayer: (sectorId: number) => Promise<void>;
  toggleOrthographic: (enabled: boolean) => void;
  moveToPlayer: (model: Group, enableTransition?: boolean) => Promise<void>;
  rotateAroundPlayer: (model: Group, enableTransition?: boolean) => Promise<void>;
  cameraToRoll: () => Promise<void>;
}>((set, get) => ({
  cameraControls: null,
  isOrthographic: false,

  toggleOrthographic: enabled => set({ isOrthographic: enabled }),

  setCameraControls: controls => {
    set({ cameraControls: controls });
  },

  rotateAroundPlayer: async (model: Group, enableTransition = true) => {
    const cameraControls = get().cameraControls;
    if (!cameraControls) return;

    const modelPosition = new Vector3();
    model.getWorldPosition(modelPosition);

    const modelLeft = new Vector3(0, 0, 1);
    modelLeft.applyQuaternion(model.quaternion);

    const cameraPosition = new Vector3().copy(modelPosition).add(modelLeft);

    const direction = new Vector3().subVectors(modelPosition, cameraPosition).normalize();

    const currentAzimuth = cameraControls.azimuthAngle;
    const rawTargetAzimuth = Math.atan2(direction.x, direction.z);
    const delta = getShortestRotationDelta(currentAzimuth, rawTargetAzimuth);
    const targetAzimuth = currentAzimuth + delta;

    cameraControls.rotateTo(targetAzimuth, Math.PI / 4, enableTransition);
    await cameraControls.dollyTo(40, enableTransition);
  },

  moveToPlayer: async (model: Group, enableTransition = true) => {
    const cameraControls = get().cameraControls;
    if (!cameraControls) return;

    await cameraControls.moveTo(
      model.position.x - HALF_BOARD,
      model.position.y,
      model.position.z - HALF_BOARD,
      enableTransition
    );
  },

  cameraToPlayer: async playerId => {
    const { cameraControls, moveToPlayer, rotateAroundPlayer } = get();
    if (!cameraControls) return;

    const playerModel = useModelsStore.getState().getPlayerModel(playerId);

    console.log({ playerModel });

    if (playerModel) {
      moveToPlayer(playerModel);
      await rotateAroundPlayer(playerModel);
    }
  },

  cameraToRoll: async () => {
    const { cameraControls } = get();
    if (!cameraControls) return;

    await cameraControls.setLookAt(-1.3, 112, -124, 0, 0, 0, true);
  },
}));

export default useCameraStore;
