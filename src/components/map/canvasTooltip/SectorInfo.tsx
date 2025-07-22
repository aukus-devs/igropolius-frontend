import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { frontendCardsData } from '@/lib/mockData';
import { SectorData } from '@/lib/types';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;

  const unpin = useCanvasTooltipStore((state) => state.unpin);
  const dismiss = useCanvasTooltipStore((state) => state.dismiss);
  const { taxInfo, prisonCards } = usePlayerStore(
    useShallow(state => ({
      taxInfo: state.taxPerSector[id],
      prisonCards: sector.type === 'prison' ? state.prisonCards : null,
    }))
  );
  const showTax = sector.type === 'railroad' || sector.type === 'property';

  const showPrisonCards = sector.type === 'prison';
  const prisonCardsList = prisonCards ?? [];

  function build() {
    console.log('Build');
    unpin();
    dismiss();
  }

  return (
    <Card className="w-[260px]">
      <CardHeader>
        <div className="flex justify-between">
          <div className="w-[50px] h-[17px] bg-muted rounded" style={{ backgroundColor: sector.color }}></div>
          <p className="text-sm font-bold text-muted-foreground">#{id}</p>
        </div>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground font-semibold">
          <p>Тип: {SectorTypeLabes[type]}</p>
          <p>Ролл игры: {rollType}</p>
          {showTax && (
            <div className="flex items-center">
              <p className="text-sm">Налог: {taxInfo.taxAmount}</p>
              <Share className="w-4 h-4" />
            </div>
          )}
          {showPrisonCards && prisonCardsList.length > 0 && (
            <div>
              <div>Хранилище:</div>
              <div className="flex gap-1">
                {prisonCardsList.map((c, id) => (
                  <img key={id} className="w-5 h-10" src={frontendCardsData[c.bonus_type].picture} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* if build mode */}
        <Button className="bg-green-500 w-full mt-4 hover:bg-green-600" onClick={build}>
          Построить
        </Button>
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
