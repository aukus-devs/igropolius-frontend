import { Share } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectorData } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;

  const taxInfo = usePlayerStore(state => state.taxPerSector[id]);
  const showTax = sector.type === 'railroad' || sector.type === 'property';

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
