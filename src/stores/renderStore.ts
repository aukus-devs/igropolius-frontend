import { create } from 'zustand';
import useCanvasTooltipStore from './canvasTooltipStore';

interface RenderStore {
    shouldRender3D: boolean;
    setShouldRender3D: (shouldRender: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const useRenderStore = create<RenderStore>((set) => ({
    shouldRender3D: true,
    setShouldRender3D: (shouldRender) => {
        set({ shouldRender3D: shouldRender });

        if (!shouldRender) {
            const tooltipStore = useCanvasTooltipStore.getState();
            tooltipStore.dismiss();
            tooltipStore.unpin();
        }
    },
    activeTab: 'map',
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useRenderStore;
