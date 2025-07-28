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
  const { gameTitle, owner, gameLength } = building;

  const showGroupBonus = useMemo(() => {
    return SECTORS_COLOR_GROUPS.some(group => group.includes(building.sectorId));
  }, [building.sectorId]);

  return (
    <Card className="w-56 pointer-events-none">
      <CardHeader>
        <CardTitle>{gameTitle}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p>Владелец: {owner.username}</p>
        <p>Длительность игры: {gameLength}</p>
        <div className="flex items-center">
          <p className="text-sm">Доход: {building.income}</p>
          <Share className="w-4 h-4" />
        </div>
        {showGroupBonus && <div>Бонус группы: {building.hasGroupBonus ? 'да' : 'нет'}</div>}
        <p className="text-sm">Построено: {formatTsToMonthDatetime(building.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

export default BuildingInfo;
