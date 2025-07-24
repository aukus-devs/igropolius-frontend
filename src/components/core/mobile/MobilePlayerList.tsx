import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import PlayerDialog from '../playerDialog/PlayerDialog';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
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

  const toggleDialog = () => setIsOpened(!isOpened);

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
        className="group data-[opened=true]:bg-background bg-gradient-to-t from-50% from-background translate-y-[calc(100%_-_20rem)] data-[opened=true]:translate-y-0 transition-all duration-300 data-[opened=false]:pointer-events-none h-dvh data-[opened=false]:[&_[data-slot='scroll-area-viewport']]:!overflow-hidden"
        data-opened={isOpened}
      >
        <div className="w-full px-4 mx-auto pt-[110px] h-full pb-6">
          <Button
            className="mb-5 p-0 text-[32px] font-wide-black bg-transparent hover:bg-transparent group-data-[opened=false]:pointer-events-auto flex items-center gap-2"
            onClick={toggleDialog}
          >
            Игроки
            {isOpened ? (
              <ChevronDown width={32} height={32} />
            ) : (
              <ChevronUp width={32} height={32} />
            )}
          </Button>

          {!isOpened && (
            <div className="absolute inset-0 top-[200px] cursor-pointer" onClick={toggleDialog} />
          )}

          {PlayersList}
        </div>
      </ScrollArea>
    )
  );
}

export default MobilePlayersList;
