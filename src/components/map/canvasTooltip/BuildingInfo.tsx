import { Share } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameLengthDisplay, SECTORS_COLOR_GROUPS } from '@/lib/constants';
import { BuildingData } from '@/lib/types';
import { formatTsToMonthDatetime } from '@/lib/utils';
import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = {
  building: BuildingData;
};

function BuildingInfo({ building }: Props) {
  const { gameTitle, owner, gameLength, gameStatus } = building;

  const isMobile = useIsMobile();

  const showGroupBonus = useMemo(() => {
    return SECTORS_COLOR_GROUPS.some(group => group.includes(building.sectorId));
  }, [building.sectorId]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.stopPropagation();
    }
  };

  return (
    <Card
      className={`w-70 ${isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle>
          {gameTitle} {gameStatus === 'drop' && '(дроп)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground font-semibold">
        <p>Владелец: {owner.username}</p>
        {gameStatus === 'completed' && (
          <p>
            Тир здания: {GameLengthDisplay[gameLength]}
            {building.lengthBonus > 0 && (
              <span className="text-green-500">&nbsp;(тир +{building.lengthBonus})</span>
            )}
            {building.lengthBonus < 0 && (
              <span className="text-red-500">&nbsp;(тир {building.lengthBonus})</span>
            )}
          </p>
        )}

        <div className="flex items-center">
          <p>Доход: {building.income}</p>
          <Share className="w-4 h-4" />
        </div>
        {showGroupBonus && gameStatus === 'completed' && (
          <div>Монополия: {building.hasGroupBonus ? 'да' : 'нет'}</div>
        )}
        <p>Построено: {formatTsToMonthDatetime(building.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

export default BuildingInfo;
