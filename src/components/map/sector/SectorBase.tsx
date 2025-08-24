import { ColorName, SectorData } from '@/lib/types';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { useShallow } from 'zustand/shallow';
import usePlayerStore from '@/stores/playerStore';
import useSystemStore from '@/stores/systemStore';
import useHighlightStore from '@/stores/highlightStore';
import SectorModel from '../models/SectorModel';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = {
  id: number;
  sector: SectorData;
  isCorner: boolean;
  color?: ColorName;
};

function SectorBase({ sector, color, isCorner }: Props) {
  const isMobile = useIsMobile();
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
  const highlightedSectorId = useSystemStore(state => state.highlightedSectorId);
  const buildingsPerSector = usePlayerStore(state => state.buildingsPerSector);
  const [isHovered, setIsHovered] = useState(false);

  const highlightedPlayerId = useHighlightStore(state => state.highlightedPlayerId);
  const sectorHasHighlightedPlayerBuildings =
    highlightedPlayerId &&
    buildingsPerSector[sector.id]?.some(
      building => building.owner.id === highlightedPlayerId && building.gameStatus !== 'drop'
    );

  const sectorBuildings = buildingsPerSector[sector.id];
  let sectorOwner = null;
  if (sectorBuildings && sectorBuildings.length > 0) {
    sectorOwner = sectorBuildings[0].owner;
  }

  const sectorBelongsToHighlightedPlayer =
    highlightedPlayerId && sectorOwner?.id === highlightedPlayerId;

  const isHighlighted =
    highlightedSectorId === sector.id ||
    sectorHasHighlightedPlayerBuildings ||
    sectorBelongsToHighlightedPlayer;

  const model = useMemo(
    () => (
      <SectorModel
        color={color}
        isCorner={isCorner}
        isHovered={isHovered}
        isHighlighted={!!isHighlighted}
      />
    ),
    [isCorner, color, isHovered, isHighlighted]
  );

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

    if (isMobile) return;

    setData({ type: 'sector', payload: sector });
    setIsHovered(true);

    if (canSelectBuildingSector()) {
      document.body.style.cursor = 'pointer';
    }
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    if (isMobile) return;

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

    if (isMobile) {
      setData({ type: 'sector', payload: sector });
      setIsHovered(true);
      return;
    }

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
