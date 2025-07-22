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
  isPinned: boolean;
  setData: (data: TooltipData) => void;
  dismiss: () => void;
  pin: () => void;
  unpin: () => void;
  togglePin: () => void;
}>((set, get) => ({
  data: null,
  isPinned: false,

  setData: (data: TooltipData) => {
    const isPinned = get().isPinned;

    if (isPinned) return;
    set({ data });
  },
  dismiss: () => {
    const isPinned = get().isPinned;

    if (isPinned) return;
    set({ data: null })
  },
  pin: () => set({ isPinned: true }),
  unpin: () => set({ isPinned: false }),
  togglePin: () => set({ isPinned: !get().isPinned }),
}));

export default useCanvasTooltipStore;
