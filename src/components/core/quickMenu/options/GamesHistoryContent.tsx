import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type Historyitem = {
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
  games: Historyitem[];
};

export default function GamesHistoryContent() {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['gamesHistory'],
    queryFn: async (): Promise<GamesHistory> => {
      const data = await fetch('/games_history.json');
      return data.json();
    },
  });

  const [searchFilter, setSearchFilter] = useState('');

  const debouncedFilter = useDebounce(searchFilter.toLowerCase(), 300);

  const filteredGames = useMemo(() => {
    if (!historyData?.games.length) {
      return [];
    }
    return historyData.games.filter(
      item =>
        item.game_title.toLowerCase().includes(debouncedFilter) ||
        item.player_nickname.toLowerCase().includes(debouncedFilter) ||
        item.event_name.toLowerCase().includes(debouncedFilter) ||
        item.review.toLowerCase().includes(debouncedFilter)
    );
  }, [debouncedFilter, historyData?.games.length]);

  if (isLoading || !historyData) {
    return (
      <div className="flex justify-center mt-20">
        <LoaderCircleIcon className="animate-spin text-primary" size={54} />
      </div>
    );
  }

  return (
    <div>
      <Input
        className="mt-[30px] mb-[30px] font-roboto-wide-semibold bg-foreground/10 border-none"
        type="text"
        value={searchFilter}
        onChange={e => setSearchFilter(e.target.value)}
        placeholder="Поиск"
        onKeyDown={e => e.stopPropagation()}
      />
      <div className="flex flex-col gap-[50px] w-full">
        {filteredGames.map(item => (
          <div
            key={`${item.player_nickname}-${item.game_title}-${item.date}`}
            className="flex flex-col gap-[10px]"
          >
            <div className="font-roboto-wide-semibold">
              {item.player_nickname}&nbsp;—&nbsp;{item.event_name}&nbsp;—&nbsp;
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
                    Пройдено за: {sencondsToHourMin(item.game_time)}
                  </Badge>
                </div>
                <span className="break-words whitespace-normal text-pretty">
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
