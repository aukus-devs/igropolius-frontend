import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { IS_DEV } from '@/lib/constants';
import usePlayerStore from '@/stores/playerStore';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type HistoryItem = {
  player_nickname: string;
  game_title: string;
  game_cover: string;
  game_link: string;
  completion_status: 'drop' | 'completed' | 'reroll';
  date: string;
  event_name: 'MGE' | 'Aukus1' | 'Aukus2' | 'Aukus3';
  review: string;
  rating: string;
  game_time: number;
};

type GamesHistory = {
  games: HistoryItem[];
};

export default function GamesHistoryContent() {
  const playersOrig = usePlayerStore(state => state.players);

  const players = [...playersOrig].sort((a, b) => {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['gamesHistory'],
    queryFn: async (): Promise<GamesHistory> => {
      if (IS_DEV) {
        const data = await fetch(
          'https://raw.githubusercontent.com/aukus-devs/games-history/refs/heads/main/games_history.json'
        );
        return data.json();
      }
      const data = await fetch('/games_history.json');
      return data.json();
    },
  });

  const [playerFilter, setPlayerFilter] = useState<string>('none');
  const [eventFilter, setEventFilter] = useState<string>('none');

  const [searchFilter, setSearchFilter] = useState('');

  const debouncedFilter = useDebounce(searchFilter.toLowerCase(), 300);

  const filteredGames = useMemo(() => {
    if (!historyData?.games.length) {
      return [];
    }

    const searchFiltered =
      debouncedFilter.length < 3
        ? historyData.games
        : historyData.games.filter(
            item =>
              item.game_title.toLowerCase().includes(debouncedFilter) ||
              item.player_nickname.toLowerCase().includes(debouncedFilter) ||
              item.event_name.toLowerCase().includes(debouncedFilter) ||
              item.review.toLowerCase().includes(debouncedFilter)
          );
    const playerFiltered =
      playerFilter !== 'none'
        ? searchFiltered.filter(
            item => item.player_nickname.toLowerCase() === playerFilter.toLowerCase()
          )
        : searchFiltered;

    const eventFiltered =
      eventFilter !== 'none'
        ? playerFiltered.filter(item => item.event_name.toLowerCase() === eventFilter.toLowerCase())
        : playerFiltered;

    return eventFiltered;
  }, [debouncedFilter, historyData?.games, playerFilter, eventFilter]);

  if (isLoading || !historyData) {
    return (
      <div className="flex justify-center mt-20">
        <LoaderCircleIcon className="animate-spin text-primary" size={54} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative mt-[30px]">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size="1rem"
        />
        <Input
          className="pl-8 font-roboto-wide-semibold bg-foreground/10 border-none"
          type="text"
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          placeholder="Поиск"
          onKeyDown={e => e.stopPropagation()}
        />
      </div>
      <div>
        <div className="flex mt-[10px] mb-[30px] gap-[10px]">
          <Select value={playerFilter} onValueChange={value => setPlayerFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Игрок" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Все игроки</SelectItem>
              {players.map(player => (
                <SelectItem key={player.id} value={player.username}>
                  {player.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventFilter} onValueChange={value => setEventFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ивент" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Все ивенты</SelectItem>
              {['MGE', 'Aukus1', 'Aukus2', 'Aukus3'].map(evt => (
                <SelectItem key={evt} value={evt}>
                  {evt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-[50px] w-full">
        {filteredGames.map(item => (
          <div
            key={`${item.player_nickname}-${item.game_title}-${item.date}`}
            className="flex flex-col gap-[10px]"
          >
            <div className="font-roboto-wide text-base">
              {capitalize(item.player_nickname)}&nbsp;—&nbsp;{item.event_name}&nbsp;—&nbsp;
              {item.completion_status}
            </div>
            <div className="text-2xl p-0 font-roboto-wide-semibold">{item.game_title}</div>
            <div className="flex gap-[8px]">
              <div className="min-w-[150px]">
                {item.game_cover && (
                  <img src={item.game_cover} className="min-w-[150px] w-[150px]"></img>
                )}
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex gap-2">
                  <Badge className="bg-white/20 text-white/70 font-semibold">
                    {item.completion_status === 'completed' ? (
                      <span>Пройдено за: {sencondsToHourMin(item.game_time)}</span>
                    ) : (
                      <span>Играл: {sencondsToHourMin(item.game_time)}</span>
                    )}
                  </Badge>
                </div>
                <span className="wrap-anywhere">
                  {item.rating && <span>{item.rating}&nbsp;—&nbsp;</span>}
                  {item.review}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function sencondsToHourMin(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}ч ${minutes}мин`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
