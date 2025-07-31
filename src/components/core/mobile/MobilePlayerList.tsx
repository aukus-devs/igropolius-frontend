import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import PlayerDialog from '../playerDialog/PlayerDialog';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from '@/components/icons';

function MobilePlayersList() {
  const { players, myPlayer } = usePlayerStore(
    useShallow(state => ({
      players: state.players,
      myPlayer: state.myPlayer,
    }))
  );
  const [isOpened, setIsOpened] = useState(false);
  const redElementRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const toggleDialog = () => setIsOpened(!isOpened);

  const handleRedElementClick = () => {
    if (!isOpened) {
      setIsOpened(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart - touchEnd;

      if (diff > 50 && !isOpened) {
        setIsOpened(true);
      }

      setTouchStart(null);
    }
  };

  const handleScrollAreaTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleScrollAreaTouchEnd = (e: React.TouchEvent) => {
    if (touchStart !== null && isOpened) {
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart - touchEnd;

      if (diff < -50) {
        const scrollElement = scrollAreaRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]'
        );
        if (scrollElement && scrollElement.scrollTop === 0) {
          setIsOpened(false);
        }
      }

      setTouchStart(null);
    }
  };

  const PlayersList = useMemo(() => {
    return (
      <div className="space-y-2">
        {players.map((player, idx) => {
          const isCurrentPlayer = myPlayer?.id === player.id;
          return (
            <PlayerDialog
              key={player.id}
              player={player}
              isCurrentPlayer={isCurrentPlayer}
              placement={idx + 1}
            />
          );
        })}
      </div>
    );
  }, [players, myPlayer]);

  return (
    players.length > 0 && (
      <ScrollArea
        ref={scrollAreaRef}
        className="group data-[opened=true]:bg-background bg-gradient-to-t from-50% from-background translate-y-[calc(100%_-_20rem)] data-[opened=true]:translate-y-0 transition-all duration-300 data-[opened=false]:pointer-events-none h-dvh data-[opened=false]:[&_[data-slot='scroll-area-viewport']]:!overflow-hidden"
        data-opened={isOpened}
        onTouchStart={isOpened ? handleScrollAreaTouchStart : undefined}
        onTouchEnd={isOpened ? handleScrollAreaTouchEnd : undefined}
      >
        <div className="w-full px-4 mx-auto pt-[110px] h-full pb-6 relative">
          <Button
            className="mb-5 p-0 text-[32px] font-wide-black bg-transparent hover:bg-transparent group-data-[opened=false]:pointer-events-auto flex items-center gap-2 relative z-10"
            onClick={toggleDialog}
          >
            Игроки
            {isOpened ? (
              <ChevronDown className="size-6 stroke-3" />
            ) : (
              <ChevronUp className="size-6 stroke-3" />
            )}
          </Button>

          {!isOpened && (
            <div
              ref={redElementRef}
              className="absolute top-[110px] left-0 right-0 bottom-0 bg-transparent z-20 cursor-pointer pointer-events-auto"
              onClick={handleRedElementClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ pointerEvents: 'auto' }}
            />
          )}

          <div className="relative z-10">{PlayersList}</div>
        </div>
      </ScrollArea>
    )
  );
}

export default MobilePlayersList;
