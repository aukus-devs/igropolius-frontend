import { ColorName, SectorData } from '@/lib/types';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { useShallow } from 'zustand/shallow';
import usePlayerStore from '@/stores/playerStore';
import SectorModel from '../models/SectorModel';

type Props = {
  id: number;
  sector: SectorData;
  isCorner: boolean;
  color?: ColorName;
};

function SectorBase({ sector, color, isCorner }: Props) {
  const {
    setData,
    dismiss,
    pin,
    isPinned,
    data: tooltipData,
    previousData: tooltipPrevData,
    setPinPosition,
  } = useCanvasTooltipStore(
    useShallow(state => ({
      data: state.data,
      previousData: state.previousData,
      setData: state.setData,
      dismiss: state.dismiss,
      pin: state.pin,
      isPinned: state.isPinned,
      setPinPosition: state.setPinPosition,
    }))
  );
  const canSelectBuildingSector = usePlayerStore(state => state.canSelectBuildingSector);
  const [isHovered, setIsHovered] = useState(false);

  const model = useMemo(() => (
    <SectorModel
      color={color}
      isCorner={isCorner}
      isHovered={isHovered}
    />
  ), [isCorner, color, isHovered]);

  const tooltipWasOnCurrentSector =
    tooltipPrevData?.type === 'sector' && tooltipPrevData.payload.id === sector.id;

  const tooltipIsOnAnotherSector =
    tooltipData?.type === 'sector' && tooltipData?.payload.id !== sector.id;

  useEffect(() => {
    if (!isPinned && isHovered && tooltipWasOnCurrentSector) {
      setIsHovered(false);
    }
    if (isPinned && isHovered && tooltipIsOnAnotherSector) {
      setIsHovered(false);
    }
  }, [isPinned, isHovered, tooltipWasOnCurrentSector, tooltipIsOnAnotherSector]);

  function onPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    setData({ type: 'sector', payload: sector });
    setIsHovered(true);

    if (canSelectBuildingSector()) {
      document.body.style.cursor = 'pointer';
    }
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    dismiss();

    const pinnedOnCurrentSector =
      isPinned && tooltipData?.type === 'sector' && tooltipData.payload.id === sector.id;

    if (!pinnedOnCurrentSector) {
      setIsHovered(false);
    }
    document.body.style.cursor = 'default';
  }

  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (!canSelectBuildingSector()) return;

    if (isPinned) {
      setData({ type: 'sector', payload: sector }, true);
      setPinPosition(e.clientX, e.clientY);
    }
    pin();
    setIsHovered(true);
  }

  return (
    <group onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onClick={onClick}>
      {model}
    </group>
  );
}

export default SectorBase;
