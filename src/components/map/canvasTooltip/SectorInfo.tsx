import { Share } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { frontendCardsData } from '@/lib/mockData';
import { SectorData } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;

  const { taxInfo, prisonCards } = usePlayerStore(
    useShallow(state => ({
      taxInfo: state.taxPerSector[id],
      prisonCards: sector.type === 'prison' ? state.prisonCards : null,
    }))
  );
  const showTax = sector.type === 'railroad' || sector.type === 'property';

  const showPrisonCards = sector.type === 'prison';
  const prisonCardsList = prisonCards ?? [];

  return (
    <Card className="w-52 pointer-events-none">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <p className="text-xs text-muted-foreground">#{id}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Тип: {SectorTypeLabes[type]}</p>
        <p className="text-sm">Ролл игры: {rollType}</p>
        {showTax && (
          <div className="flex items-center">
            <p className="text-sm">Налог: {taxInfo.taxAmount}</p>
            <Share className="w-4 h-4" />
          </div>
        )}
        {showPrisonCards && (
          <div>
            <div className="text-sm">Хранилище:</div>
            <div className="flex gap-1">
              {prisonCardsList.map((c, id) => (
                <img key={id} className="w-5 h-10" src={frontendCardsData[c.bonus_type].picture} />
              ))}
            </div>
          </div>
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
