import CameraControls from "camera-controls";
import { create } from "zustand";

const useCameraStore = create<{
  cameraControls: CameraControls | null;
  setCameraControls: (controls: CameraControls) => void;
}>((set) => ({
  cameraControls: null,

  setCameraControls: (controls) => set({ cameraControls: controls }),
}));

export default useCameraStore;
