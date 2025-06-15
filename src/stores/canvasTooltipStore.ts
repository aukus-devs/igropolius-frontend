import { BuildingData, SectorData } from "@/lib/types";
import { create } from "zustand";

type TooltipDataType = "building" | "sector";

type TooltipDataBase = {
  type: TooltipDataType;
};

type TooltipBuildingData = TooltipDataBase & {
  type: "building";
  payload: BuildingData;
};
type TooltipSectorData = TooltipDataBase & {
  type: "sector";
  payload: SectorData;
};

type TooltipData =
  | TooltipBuildingData
  | TooltipSectorData;

const useCanvasTooltipStore = create<{
  data: TooltipData | null;
  setData: (data: TooltipData) => void;
  dismiss: () => void;
}>((set) => ({
  data: null,

  setData: (data: TooltipData) => set({ data }),
  dismiss: () => set({ data: null })
}));

export default useCanvasTooltipStore;
