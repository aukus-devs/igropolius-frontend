import { BuildingData, SectorData } from '@/lib/types';
import { create } from 'zustand';

type TooltipDataType = 'building' | 'sector';

type TooltipDataBase = {
  type: TooltipDataType;
};

type TooltipBuildingData = TooltipDataBase & {
  type: 'building';
  payload: BuildingData;
};
type TooltipSectorData = TooltipDataBase & {
  type: 'sector';
  payload: SectorData;
};

type TooltipData = TooltipBuildingData | TooltipSectorData;

const useCanvasTooltipStore = create<{
  data: TooltipData | null;
  previousData: TooltipData | null;
  pinPosition: { x: number; y: number } | null;
  isPinned: boolean;
  setData: (data: TooltipData, force?: boolean) => void;
  dismiss: () => void;
  pin: () => void;
  unpin: () => void;
  setPinPosition: (x: number, y: number) => void;
}>((set, get) => ({
  data: null,
  previousData: null,
  isPinned: false,
  pinPosition: null,

  setData: (data: TooltipData, force?: boolean) => {
    const { isPinned, data: previousData } = get();

    if (isPinned && !force) return;
    set({ data, previousData });
  },

  dismiss: () => {
    const { isPinned, data: previousData } = get();

    if (isPinned) return;
    set({ data: null, previousData });
  },
  pin: () => set({ isPinned: true }),
  unpin: () => set({ isPinned: false, pinPosition: null }),

  setPinPosition: (x: number, y: number) => {
    set({ pinPosition: { x, y } });
  },
}));

export default useCanvasTooltipStore;
