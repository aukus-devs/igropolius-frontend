import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import GameReview from '../../GameReview';
import CurrentGame from '../../CurrentGame';
import { PlayerDetails } from '@/lib/api-types-generated';

function ReviewsTab({ player }: { player: PlayerDetails }) {
  const [searchText, setSearchText] = useState('');
  const filteredGames = player.games.filter(game =>
    game.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size="1rem"
        />
        <Input
          id="search"
          type="text"
          className="pl-8 font-roboto-wide-semibold bg-foreground/10 border-none"
          placeholder="Поиск по играм"
          onKeyDown={e => e.stopPropagation()}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-8 py-8">
        <CurrentGame player={player} />
        {filteredGames.map((game, idx) => (
          <GameReview key={idx} game={game} playerId={player.id} />
        ))}
      </div>
    </>
  );
}

export default ReviewsTab;
