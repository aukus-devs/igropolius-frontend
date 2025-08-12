import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { useState, useEffect } from 'react';
import SectorInfo from './SectorInfo';
import BuildingInfo from './BuildingInfo';
import { useShallow } from 'zustand/shallow';
import { useIsMobile } from '@/hooks/use-mobile';

function CanvasTooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const {
    data: tooltipData,
    isPinned,
    pinPosition,
    dismiss,
  } = useCanvasTooltipStore(
    useShallow(state => ({
      data: state.data,
      isPinned: state.isPinned,
      pinPosition: state.pinPosition,
      dismiss: state.dismiss,
    }))
  );

  useEffect(() => {
    if (isMobile) {
      const updateMobilePosition = () => {
        setPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
      };

      updateMobilePosition();
      window.addEventListener('resize', updateMobilePosition);
      return () => window.removeEventListener('resize', updateMobilePosition);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;
      setPosition({ x: e.clientX + 25, y: e.clientY - 25 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPinned, isMobile]);

  useEffect(() => {
    if (isMobile && tooltipData) {
      setPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, [isMobile, tooltipData]);

  useEffect(() => {
    if (isMobile || !pinPosition?.x || !pinPosition?.y) return;
    setPosition({ x: pinPosition.x + 25, y: pinPosition.y - 25 });
  }, [pinPosition?.x, pinPosition?.y, isMobile]);

  const handleTooltipClick = () => {
    if (isMobile && tooltipData) {
      dismiss();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isMobile ? 'translate(-50%, -50%)' : 'none',
        opacity: tooltipData ? 1 : 0,
        zIndex: 999,
        pointerEvents: tooltipData ? 'auto' : 'none',
      }}
      onClick={handleTooltipClick}
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
