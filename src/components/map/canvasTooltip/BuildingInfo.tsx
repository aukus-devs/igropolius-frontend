import { Share } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SECTORS_COLOR_GROUPS } from '@/lib/constants';
import { BuildingData } from '@/lib/types';
import { formatTsToMonthDatetime } from '@/lib/utils';
import { useMemo } from 'react';

type Props = {
  building: BuildingData;
};

function BuildingInfo({ building }: Props) {
  const { gameTitle, owner, gameLength, gameStatus } = building;

  const showGroupBonus = useMemo(() => {
    return SECTORS_COLOR_GROUPS.some(group => group.includes(building.sectorId));
  }, [building.sectorId]);

  return (
    <Card className="w-56 pointer-events-none">
      <CardHeader>
        <CardTitle>
          {gameTitle} {gameStatus === 'drop' && '(дроп)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground font-semibold">
        <p>Владелец: {owner.username}</p>
        {gameStatus === 'completed' && <p>Длительность игры: {gameLength}</p>}

        <div className="flex items-center">
          <p>Доход: {building.income}</p>
          <Share className="w-4 h-4" />
        </div>
        {showGroupBonus && gameStatus === 'completed' && (
          <div>Бонус группы: {building.hasGroupBonus ? 'да' : 'нет'}</div>
        )}
        <p>Построено: {formatTsToMonthDatetime(building.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

export default BuildingInfo;
