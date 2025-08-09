import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import GameReview from '../../GameReview';
import CurrentGame from '../../CurrentGame';
import { PlayerDetails } from '@/lib/api-types-generated';

function ReviewsTab({ player }: { player: PlayerDetails }) {
  const [searchText, setSearchText] = useState('');
  const filteredGames = player.games.filter(
    game =>
      game.title.toLowerCase().includes(searchText.toLowerCase()) ||
      game.review.toLowerCase().includes(searchText.toLowerCase())
  );

  const showCurrentGame = player.current_game?.toLowerCase().includes(searchText.toLowerCase());

  return (
    <>
      <div className="sticky top-[54px] z-50">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size="1rem"
        />
        <Input
          id="search"
          type="text"
          className="pl-8 font-roboto-wide-semibold bg-[#575b58] border-none"
          placeholder="Поиск по играм"
          onKeyDown={e => e.stopPropagation()}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-8 py-8">
        {showCurrentGame && <CurrentGame player={player} />}
        {filteredGames.length === 0 ? (
          <div className="text-center text-xs font-roboto-wide-semibold text-muted-foreground">
            Нет игр {searchText && <span>, соответствующих запросу.</span>}
          </div>
        ) : (
          <>
            {filteredGames.map(game => (
              <GameReview key={game.id} game={game} />
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default ReviewsTab;
