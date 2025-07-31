import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { frontendCardsData } from '@/lib/mockData';
import { SectorData } from '@/lib/types';
import { getGameLengthFullText } from '@/lib/utils';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { canBuildOnSector } from '../utils';
import { useMutation } from '@tanstack/react-query';
import { movePlayerGame } from '@/lib/api';
import ImageLoader from '@/components/core/ImageLoader';

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType, gameLengthRanges } = sector;

  const unpin = useCanvasTooltipStore(state => state.unpin);
  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const { taxInfo, prisonCards, canSelectBuildingSector } = usePlayerStore(
    useShallow(state => ({
      taxInfo: state.taxPerSector[id],
      prisonCards: sector.type === 'prison' ? state.prisonCards : null,
      canSelectBuildingSector: state.canSelectBuildingSector,
    }))
  );
  const showTax = canBuildOnSector(sector.type);

  const showPrisonCards = sector.type === 'prison';
  const prisonCardsList = prisonCards ?? [];

  const canBuild = canSelectBuildingSector() && canBuildOnSector(sector.type);

  const { mutateAsync: moveGame, isPending: isBuilding } = useMutation({
    mutationFn: movePlayerGame,
  });

  const build = async () => {
    await moveGame({
      new_sector_id: id,
    });
    await usePlayerStore.getState().setNextTurnState({});
    unpin();
    dismiss();
  };

  return (
    <Card className="w-[260px]">
      <CardHeader>
        <div className="flex justify-between">
          <div
            className="w-[50px] h-[17px] bg-muted rounded"
            style={{ backgroundColor: sector.color }}
          ></div>
          <p className="text-sm font-bold text-muted-foreground">#{id}</p>
        </div>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground font-semibold">
          <p>Тип: {SectorTypeLabes[type]}</p>
          <p>Ролл игры: {rollType}</p>
          {gameLengthRanges && <p>Длительность: {getGameLengthFullText(gameLengthRanges)}</p>}
          {showTax && (
            <div className="flex items-center">
              <p className="text-sm">Налог: {taxInfo.taxAmount}</p>
              <Share className="w-4 h-4" />
            </div>
          )}
          {showPrisonCards && (
            <div>
              <div>Хранилище карточек: {prisonCardsList.length === 0 && 'пусто'}</div>
              {prisonCardsList.length > 0 && (
                <div className="flex gap-1">
                  {prisonCardsList.map((c, id) => (
                    <ImageLoader
                      key={id}
                      src={frontendCardsData[c].picture}
                      alt={frontendCardsData[c].name}
                      className="w-5 h-10"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {canBuild && (
          <Button
            className="bg-green-500 w-full mt-4 hover:bg-green-600"
            onClick={build}
            loading={isBuilding}
          >
            Построить
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default SectorInfo;

const SectorTypeLabes: Record<SectorData['type'], string> = {
  bonus: 'бонусный',
  parking: 'парковка',
  prison: 'тюрьма',
  property: 'строительный',
  railroad: 'вокзал',
  'start-corner': 'старт',
};
