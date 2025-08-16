import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { frontendCardsData } from '@/lib/mockData';
import { SectorData } from '@/lib/types';
import { getGameLengthFullText, getSectorDescription, splitTaxInfo } from '@/lib/utils';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { canBuildOnSector } from '../utils';
import { useMutation } from '@tanstack/react-query';
import { movePlayerGame } from '@/lib/api';
import ImageLoader from '@/components/core/ImageLoader';
import { GameRollTypeNames } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType, gameLengthRanges } = sector;

  const isMobile = useIsMobile();
  const unpin = useCanvasTooltipStore(state => state.unpin);
  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const { taxInfo, prisonCards, canSelectBuildingSector, myPlayer } = usePlayerStore(
    useShallow(state => ({
      taxInfo: state.taxPerSector[id],
      prisonCards: sector.type === 'prison' ? state.prisonCards : null,
      canSelectBuildingSector: state.canSelectBuildingSector,
      myPlayer: state.myPlayer,
    }))
  );
  const showTax = canBuildOnSector(sector.type);
  let otherIncomes: Record<string, number> = {};
  let myIncome: number | undefined = undefined;
  if (showTax) {
    const split = splitTaxInfo(taxInfo, myPlayer?.id);
    otherIncomes = split.otherIncomes;
    myIncome = split.myIncome;
  }

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

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.stopPropagation();
    }
  };

  return (
    <Card className="w-[260px]" onClick={handleCardClick}>
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
          <p>Ролл игры: {GameRollTypeNames[rollType]}</p>
          {gameLengthRanges && <p>Длительность: {getGameLengthFullText(gameLengthRanges)}</p>}
          {showTax && (
            <div>
              <div className="flex items-center">
                <p className="text-sm">Налог: {taxInfo.taxAmount}</p>
                <Share className="w-4 h-4" />
              </div>
              {(Object.keys(otherIncomes).length > 0 || myIncome) && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(otherIncomes).map(([playerId, num], idx) => {
                    const player = usePlayerStore
                      .getState()
                      .players.find(p => String(p.id) === playerId);
                    if (!player) return null;
                    return (
                      <div
                        key={idx}
                        className="w-10 flex justify-center bg-red-500/30 text-red-400 rounded-md"
                      >
                        {num / 2}
                      </div>
                    );
                  })}

                  {myIncome !== undefined && (
                    <div className="w-10 flex justify-center bg-green-500/30 text-green-400 rounded-md">
                      {myIncome}
                    </div>
                  )}
                </div>
              )}
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

        <div className="mt-2 text-xs text-muted-foreground">{getSectorDescription(sector)}</div>
      </CardContent>
    </Card>
  );
}

export default SectorInfo;

const SectorTypeLabes: Record<SectorData['type'], string> = {
  bonus: 'Шанс',
  parking: 'Парковка',
  prison: 'Тюрьма',
  property: 'Улица',
  railroad: 'Вокзал',
  'start-corner': 'Старт',
};
