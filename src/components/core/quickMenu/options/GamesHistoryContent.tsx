import { useQuery } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';

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

  if (isLoading || !historyData) {
    return (
      <div className="flex justify-center mt-20">
        <LoaderCircleIcon className="animate-spin text-primary" size={54} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      {historyData.games.map((item, idx) => (
        <div key={idx} className="w-full min-w-0 flex-1">
          <div>
            {item.player_nickname}&nbsp;—&nbsp;{item.event_name}&nbsp;—&nbsp;
            {item.completion_status}
          </div>
          <div className="text-2xl">{item.game_title}</div>
          <div className="flex gap-2">
            <div className="min-w-[150px]">
              <img src={item.game_cover} className="min-w-[150px] w-[150px]"></img>
            </div>
            <div className="">
              <div className="flex gap-2">
                <div>Время: {item.game_time}сек.</div>
              </div>
              <span className="break-words whitespace-normal text-pretty">{item.review}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
