import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { useState, useEffect } from 'react';
import SectorInfo from './SectorInfo';
import BuildingInfo from './BuildingInfo';
import { useShallow } from 'zustand/shallow';

function CanvasTooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const {
    data: tooltipData,
    isPinned,
    pinPosition,
  } = useCanvasTooltipStore(
    useShallow(state => ({
      data: state.data,
      isPinned: state.isPinned,
      pinPosition: state.pinPosition,
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;
      setPosition({ x: e.clientX + 25, y: e.clientY - 25 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPinned]);

  useEffect(() => {
    if (pinPosition?.x && pinPosition?.y) {
      setPosition({ x: pinPosition.x + 25, y: pinPosition.y - 25 });
    }
  }, [pinPosition?.x, pinPosition?.y]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: tooltipData ? 1 : 0,
        zIndex: 999,
      }}
    >
      {tooltipData?.type === 'sector' ? (
        <SectorInfo sector={tooltipData.payload} />
      ) : tooltipData?.type === 'building' ? (
        <BuildingInfo building={tooltipData.payload} />
      ) : null}
    </div>
  );
}

export default CanvasTooltip;
