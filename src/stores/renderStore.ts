import { create } from 'zustand';

interface RenderStore {
    shouldRender3D: boolean;
    setShouldRender3D: (shouldRender: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const useRenderStore = create<RenderStore>((set) => ({
    shouldRender3D: true,
    setShouldRender3D: (shouldRender) => set({ shouldRender3D: shouldRender }),
    activeTab: 'map',
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useRenderStore;
