import { Button } from '@/components/ui/button';
import { GameLengthRange } from '@/lib/types';
import { getGameLengthShortText } from '@/lib/utils';

type Props = {
  gameLengthRanges: GameLengthRange;
  className?: string;
};

export default function GameGauntletsButton({ gameLengthRanges, className }: Props) {
  const handleClick = () => {
    window.open(
      `https://gamegauntlets.igropolius.ru/?queryFilters=true&length=${gameLengthRanges.min},${gameLengthRanges.max}#wheel`,
      '_blank'
    );
  };

  return (
    <Button variant="outline" className={className} onClick={handleClick}>
      GameGauntlets {getGameLengthShortText(gameLengthRanges)}
    </Button>
  );
}
