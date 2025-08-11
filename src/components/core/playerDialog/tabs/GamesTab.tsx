import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import GameReview from '../../GameReview';
import CurrentGame from '../../CurrentGame';
import { PlayerDetails } from '@/lib/api-types-generated';
import useScrollStyler from '@/hooks/useScrollStyler';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

function ReviewsTab({ player }: { player: PlayerDetails }) {
  const { onRender, style, stuck } = useScrollStyler();

  if (stuck) {
    style.borderTopRightRadius = 0;
    style.borderTopLeftRadius = 0;
    style.borderBottomLeftRadius = style.borderRadius;
    style.borderBottomRightRadius = style.borderRadius;
  }

  const [searchText, setSearchText] = useState('');
  const filteredGames = player.games.filter(
    game =>
      game.title.toLowerCase().includes(searchText.toLowerCase()) ||
      game.review.toLowerCase().includes(searchText.toLowerCase())
  );

  const showCurrentGame = player.current_game?.toLowerCase().includes(searchText.toLowerCase());

  const navigate = useNavigate();

  const [opening, setOpening] = useState(false);

  const openHistorySearch = () => {
    setOpening(true);
    const escapedSearchText = encodeURIComponent(searchText);
    navigate(`/history?player=${player.username}&search=${escapedSearchText}`);
  };

  return (
    <>
      <div className="z-50 sticky flex gap-2 top-[72px] px-5 pb-5" style={style} ref={onRender}>
        <SearchIcon
          className="absolute left-7 top-4.5 -translate-y-1/2 text-muted-foreground"
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
        <Button className="font-roboto-wide-semibold" onClick={openHistorySearch} loading={opening}>
          Прошлые ивенты
        </Button>
      </div>
      <div className="flex flex-col gap-8 py-8 px-5">
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
