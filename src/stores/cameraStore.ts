import CameraControls from "camera-controls";
import { create } from "zustand";
import useModelsStore from "./modelsStore";

const useCameraStore = create<{
  cameraControls: CameraControls | null;
  setCameraControls: (controls: CameraControls) => void;
  cameraToPlayer: (sectorId: number) => Promise<void>;
}>((set) => ({
  cameraControls: null,

  setCameraControls: (controls) => set({ cameraControls: controls }),

  cameraToPlayer: async (sectorId) => {
    const cameraControls = useCameraStore.getState().cameraControls;
    const sectorModel = useModelsStore.getState().getSectorModel(sectorId);
    if (!cameraControls) return;

    if (sectorModel) {
      let targetRotationY = sectorModel.rotation.y;

      if (targetRotationY === Math.PI) {
        targetRotationY -= Math.PI;
      } else if (targetRotationY === 0) {
        targetRotationY += Math.PI;
      } else {
        targetRotationY = -targetRotationY;
      }

      const cameraAzimuth = cameraControls.azimuthAngle ?? 0;
      const base = Math.floor(cameraAzimuth / (Math.PI * 2));
      const targetAzimuth = base * Math.PI * 2 + targetRotationY;

      cameraControls.fitToBox(sectorModel, true, { cover: true });
      cameraControls.rotateTo(targetAzimuth, Math.PI / 4, true);
      await cameraControls.dollyTo(15, true);
    }
  },
}));

export default useCameraStore;
