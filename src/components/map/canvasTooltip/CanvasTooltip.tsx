import useCanvasTooltipStore from '@/stores/canvasTooltipStore'
import { useState, useEffect } from 'react'
import SectorInfo from './SectorInfo';
import BuildingInfo from './BuildingInfo';

function CanvasTooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const storeData = useCanvasTooltipStore((state) => state.data);
  const isPinned = useCanvasTooltipStore((state) => state.isPinned);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return
      setPosition({ x: e.clientX + 25, y: e.clientY - 25 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isPinned])

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: storeData ? 1 : 0,
        zIndex: 999,
      }}
    >
      {storeData?.type === 'sector' ? (
        <SectorInfo sector={storeData.payload} />
      ) : storeData?.type === 'building' ? (
        <BuildingInfo building={storeData.payload} />
      ) : null}
    </div>
  )
}

export default CanvasTooltip;
