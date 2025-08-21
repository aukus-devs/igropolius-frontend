import { Button } from '@/components/ui/button';
import { GameLengthRange } from '@/lib/types';
import { getGameLengthShortText } from '@/lib/utils';

type Props = {
  gameLengthRanges: GameLengthRange;
  className?: string;
};

const ENABLE_NEW_WHEEL = true;

export default function GameGauntletsButton({ gameLengthRanges, className }: Props) {
  const handleClick = () => {
    if (ENABLE_NEW_WHEEL) {
      window.open(
        `/games-roller?min=${gameLengthRanges.min}&max=${gameLengthRanges.max}`,
        '_blank'
      );
      return;
    }
    window.open(
      `https://gamegauntlets.igropolius.ru/?queryFilters=true&empty=false&length=${gameLengthRanges.min},${gameLengthRanges.max}#wheel`,
      '_blank'
    );
  };

  return (
    <Button variant="action" className={className} onClick={handleClick}>
      GameGauntlets {getGameLengthShortText(gameLengthRanges)}
    </Button>
  );
}
