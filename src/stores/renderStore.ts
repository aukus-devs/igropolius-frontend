import { create } from 'zustand';

interface RenderStore {
    shouldRender3D: boolean;
    setShouldRender3D: (shouldRender: boolean) => void;
}

const useRenderStore = create<RenderStore>((set) => ({
    shouldRender3D: true,
    setShouldRender3D: (shouldRender) => set({ shouldRender3D: shouldRender }),
}));

export default useRenderStore;
