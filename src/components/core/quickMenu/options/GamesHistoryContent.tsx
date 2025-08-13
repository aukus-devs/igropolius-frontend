import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import useScrollStyler from '@/hooks/useScrollStyler';
import useUrlPath from '@/hooks/useUrlPath';
import { IS_DEV } from '@/lib/constants';
import usePlayerStore from '@/stores/playerStore';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon, SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

const CompletionTitle: Record<HistoryItem['completion_status'], string> = {
  completed: 'Прошел',
  drop: 'Дропнул',
  reroll: 'Реролл',
};

const CompletionColor: Record<HistoryItem['completion_status'], string> = {
  completed: 'bg-[#30D158]',
  drop: 'bg-red-500',
  reroll: 'bg-blue-500',
};

type GamesHistory = {
  games: HistoryItem[];
};

type Props = {
  initialPlayerFilter?: string;
  initialSearchFilter?: string;
};

export default function GamesHistoryContent({
  initialPlayerFilter,
  initialSearchFilter,
}: Props = {}) {
  const { location } = useUrlPath('/history');

  const playersOrig = usePlayerStore(state => state.players);

  const players = [...playersOrig].sort((a, b) => {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });

  const colorsByName = useMemo(() => {
    return players.reduce(
      (acc, player) => {
        if (player.color === 'white') {
          acc[player.username.toLowerCase()] = '';
        } else {
          acc[player.username.toLowerCase()] = player.color;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [players]);

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

  const [limit, setLimit] = useState(100);

  useEffect(() => {
    if (initialPlayerFilter) {
      setPlayerFilter(initialPlayerFilter);
    } else {
      const urlParams = new URLSearchParams(location.search);
      const player = urlParams.get('player');
      if (player) {
        setPlayerFilter(player);
      }
    }

    if (initialSearchFilter) {
      setSearchFilter(initialSearchFilter);
    } else {
      const urlParams = new URLSearchParams(location.search);
      const search = urlParams.get('search');
      if (search) {
        setSearchFilter(search);
      }
    }
  }, [location.search, initialPlayerFilter, initialSearchFilter]);

  const filteredGames = useMemo(() => {
    if (!historyData?.games) {
      return [];
    }

    const baseFilter = historyData.games.filter(defaultFilter);

    const playerFiltered =
      playerFilter !== 'none'
        ? baseFilter.filter(
            item => item.player_nickname.toLowerCase() === playerFilter.toLowerCase()
          )
        : baseFilter;

    const eventFiltered =
      eventFilter !== 'none'
        ? playerFiltered.filter(item => item.event_name.toLowerCase() === eventFilter.toLowerCase())
        : playerFiltered;

    const searchFiltered =
      debouncedFilter.length < 3
        ? eventFiltered
        : eventFiltered.filter(
            item =>
              item.game_title.toLowerCase().includes(debouncedFilter) ||
              item.player_nickname.toLowerCase().includes(debouncedFilter) ||
              item.event_name.toLowerCase().includes(debouncedFilter) ||
              item.review.toLowerCase().includes(debouncedFilter)
          );

    return searchFiltered;
  }, [debouncedFilter, historyData?.games, playerFilter, eventFilter]);

  const limitedGames = useMemo(() => {
    return filteredGames.slice(0, limit);
  }, [filteredGames, limit]);

  const { onRender, style } = useScrollStyler();

  if (isLoading || !historyData) {
    return (
      <div className="flex justify-center mt-20">
        <LoaderCircleIcon className="animate-spin text-primary" size={54} />
      </div>
    );
  }

  const showLoadMore = limitedGames.length < filteredGames.length;

  return (
    <>
      <div className="sticky p-5 top-0 z-50 rounded-lg mb-[30px]" style={style} ref={onRender}>
        <div className="relative">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size="1rem"
          />
          <Input
            className="pl-8 font-roboto-wide-semibold bg-[#575b58] border-none"
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Поиск, минимум 3 символа"
            onKeyDown={e => e.stopPropagation()}
          />
        </div>
        <div>
          <div className="flex mt-[10px] gap-[10px]">
            <Select value={playerFilter} onValueChange={value => setPlayerFilter(value)}>
              <SelectTrigger className="bg-[#575b58]">
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
              <SelectTrigger className="bg-[#575b58]">
                <SelectValue placeholder="Ивент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Все ивенты</SelectItem>
                {['MGE', 'Aukus2', 'Aukus3'].sort().map(evt => (
                  <SelectItem key={evt} value={evt}>
                    {evt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[50px] w-full px-5">
        {limitedGames.map(item => (
          <div
            key={`${item.player_nickname}-${item.game_title}-${item.date}`}
            className="flex flex-col gap-[10px]"
          >
            <div className="font-roboto-wide text-base flex gap-[8px]">
              <Badge
                style={{
                  backgroundColor:
                    colorsByName[item.player_nickname.toLowerCase()] || 'var(--primary)',
                }}
              >
                {capitalize(item.player_nickname)}
              </Badge>
              <Badge className={`${CompletionColor[item.completion_status]}`}>
                {CompletionTitle[item.completion_status]}
              </Badge>
              <Badge className="bg-white/20 text-white/70">{item.event_name}</Badge>
            </div>
            <div className="text-2xl p-0 font-roboto-wide-semibold">{item.game_title}</div>
            <div className={`flex gap-[8px] flex-col md:flex-row`}>
              {item.game_cover && (
                <div>
                  <img src={item.game_cover} className="min-w-[150px] w-[150px] rounded-md"></img>
                </div>
              )}

              <div className="flex flex-col gap-[10px]">
                <div className="flex gap-2">
                  <Badge className="bg-white/20 text-white/70 font-semibold">
                    {item.game_time < 60 && <span>Время: нет данных</span>}
                    {item.game_time > 60 &&
                      (item.completion_status === 'completed' ? (
                        <span>Пройдено за: {sencondsToHourMin(item.game_time)}</span>
                      ) : (
                        <span>Играл: {sencondsToHourMin(item.game_time)}</span>
                      ))}
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

        {showLoadMore && (
          <div className="flex justify-center">
            <Button className=" font-roboto-wide-semibold" onClick={() => setLimit(limit + 100)}>
              Показать еще ({limitedGames.length} / {filteredGames.length})
            </Button>
          </div>
        )}
      </div>
    </>
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

function defaultFilter(item: HistoryItem) {
  return item.event_name !== 'Aukus1';
}
