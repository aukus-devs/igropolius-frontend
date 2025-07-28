import { Share } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import { fetchPlayerEvents } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import { getEventDescription, getBonusCardName } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import {
  DiceRollDetails as DiceRollDetailsType,
  Events,
  MainBonusCardType,
  MoveEvent,
  PlayerDetails,
  ScoreChangeEvent,
} from '@/lib/api-types-generated';

type Props = {
  player: PlayerDetails;
};

function DiceRollDetails({
  diceRollJson,
  adjustedRoll,
}: {
  diceRollJson: DiceRollDetailsType;
  adjustedRoll: number;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {diceRollJson.is_random_org_result
          ? 'Результаты броска кубиков через Random.org'
          : `Результаты броска кубиков (локальный бросок, причина: ${diceRollJson.random_org_fail_reason})`}
      </div>
      <div className="text-xs text-muted-foreground">Кубики: {diceRollJson.data.join(', ')}</div>
      <div className="text-xs text-muted-foreground">
        Сумма кубиков: {diceRollJson.data[0] + diceRollJson.data[1]}
      </div>
      <div className="text-xs text-muted-foreground">Итоговый результат: {adjustedRoll}</div>
      {diceRollJson.is_random_org_result && (
        <div className="flex items-center gap-2 mt-1">
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5013 1.4165C4.59839 1.4165 1.41797 4.59692 1.41797 8.49984C1.41797 12.4028 4.59839 15.5832 8.5013 15.5832C12.4042 15.5832 15.5846 12.4028 15.5846 8.49984C15.5846 4.59692 12.4042 1.4165 8.5013 1.4165ZM11.8871 6.87067L7.87088 10.8869C7.77172 10.9861 7.63714 11.0428 7.49547 11.0428C7.3538 11.0428 7.21922 10.9861 7.12005 10.8869L5.11547 8.88234C4.91005 8.67692 4.91005 8.33692 5.11547 8.1315C5.32089 7.92609 5.66089 7.92609 5.8663 8.1315L7.49547 9.76067L11.1363 6.11984C11.3417 5.91442 11.6817 5.91442 11.8871 6.11984C12.0926 6.32525 12.0926 6.65817 11.8871 6.87067Z"
              fill="#30D158"
            />
          </svg>
          <span className="text-[#30D158] text-xs">Результат подтвержден Random.org</span>
        </div>
      )}
      {diceRollJson.random_org_check_form && (
        <div className="mt-1">
          <a
            href={diceRollJson.random_org_check_form}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#268AFF] hover:text-blue-700 text-xs underline"
          >
            Открыть проверочную форму
          </a>
        </div>
      )}
    </div>
  );
}

function Event({ event, player }: { event: Events[0]; player: PlayerDetails }) {
  const { title, description, gameCover } = getEventDescription(event, player);
  const { hours, minutes } = getFormattedTime(event.timestamp);
  const isScoreChangeEvent = event.event_type === 'score-change';
  const isMoveEvent = event.event_type === 'player-move';
  const moveEvent = isMoveEvent ? (event as MoveEvent) : null;
  const hasDiceRollData = moveEvent?.dice_roll_json && moveEvent.subtype === 'dice-roll';

  let bonusesUsed: MainBonusCardType[] = [];
  if (event.event_type === 'player-move') {
    bonusesUsed = event.bonuses_used;
  }

  const [showDetails, setShowDetails] = useState(false);

  const EventContent = () => (
    <div className={gameCover ? 'flex gap-2' : ''}>
      {gameCover && (
        <div className="flex-shrink-0">
          <div className="text-muted-foreground text-sm font-semibold mb-1">{`${hours}:${minutes}`}</div>
          <img
            src={gameCover}
            alt={description}
            className="w-10 h-[53px] rounded-sm object-cover"
          />
        </div>
      )}
      <div className={gameCover ? 'flex-1 pt-6' : ''}>
        {!gameCover && (
          <div className="text-muted-foreground text-sm font-semibold">{`${hours}:${minutes}`}</div>
        )}
        <div>
          <h3 className="font-wide-medium text-[#F2F2F2]">{title}</h3>
        </div>
        <div className="flex gap-0 place-items-center text-muted-foreground text-sm font-semibold">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex gap-0 place-items-center">
              <p>{description}</p>
              {isScoreChangeEvent && <ScoreChangeDescription event={event as ScoreChangeEvent} />}
            </div>
            {hasDiceRollData && (
              <button
                type="button"
                onClick={() => setShowDetails(v => !v)}
                className={`flex items-center gap-1 px-3 h-[23px] rounded-[5px] ml-2 transition-colors
                  ${
                    showDetails
                      ? 'bg-[#81A671] text-white'
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }
                `}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.3333 1.4165H5.66667C3.1875 1.4165 2.125 2.83317 2.125 4.95817V12.0415C2.125 14.1665 3.1875 15.5832 5.66667 15.5832H11.3333C13.8125 15.5832 14.875 14.1665 14.875 12.0415V4.95817C14.875 2.83317 13.8125 1.4165 11.3333 1.4165ZM5.66667 8.67692H8.5C8.79042 8.67692 9.03125 8.91775 9.03125 9.20817C9.03125 9.49859 8.79042 9.73942 8.5 9.73942H5.66667C5.37625 9.73942 5.13542 9.49859 5.13542 9.20817C5.13542 8.91775 5.37625 8.67692 5.66667 8.67692ZM11.3333 12.5728H5.66667C5.37625 12.5728 5.13542 12.3319 5.13542 12.0415C5.13542 11.7511 5.37625 11.5103 5.66667 11.5103H11.3333C11.6237 11.5103 11.8646 11.7511 11.8646 12.0415C11.8646 12.3319 11.6237 12.5728 11.3333 12.5728ZM13.1042 6.55192H11.6875C10.6108 6.55192 9.73958 5.68067 9.73958 4.604V3.18734C9.73958 2.89692 9.98042 2.65609 10.2708 2.65609C10.5612 2.65609 10.8021 2.89692 10.8021 3.18734V4.604C10.8021 5.09275 11.1987 5.48942 11.6875 5.48942H13.1042C13.3946 5.48942 13.6354 5.73025 13.6354 6.02067C13.6354 6.31109 13.3946 6.55192 13.1042 6.55192Z"
                    fill="white"
                    fill-opacity="0.7"
                  />
                </svg>
                <span style={{ lineHeight: 1 }}>Детали</span>
              </button>
            )}
          </div>
        </div>
        {bonusesUsed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 items-center">
            <span className="text-xs text-muted-foreground mr-1">Примененные карточки:</span>
            <span className="text-xs text-muted-foreground">
              {bonusesUsed.map((bonus, _) => getBonusCardName(bonus)).join(', ')}
            </span>
          </div>
        )}
        {hasDiceRollData && showDetails && (
          <div className="mt-2">
            <DiceRollDetails
              diceRollJson={moveEvent.dice_roll_json!}
              adjustedRoll={moveEvent.adjusted_roll}
            />
          </div>
        )}
      </div>
    </div>
  );

  return <EventContent />;
}

type FilterValue = Events[0]['event_type'] | 'all';

type EventsTabFilterOption = {
  title: string;
  value: FilterValue;
};

function EventsTabFilter({
  selectedFilter,
  onFilterChange,
}: {
  selectedFilter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
}) {
  const options: EventsTabFilterOption[] = [
    { title: 'Все', value: 'all' },
    { title: 'Карточки', value: 'bonus-card' },
    { title: 'Очки', value: 'score-change' },
    { title: 'Игры', value: 'game' },
    { title: 'Ходы', value: 'player-move' },
  ];

  return (
    <div className="flex items-center gap-2.5 justify-self-end">
      <span className="font-semibold text-muted-foreground">Фильтр</span>
      <Select value={selectedFilter} onValueChange={value => onFilterChange(value as FilterValue)}>
        <SelectTrigger className="w-[140px] rounded-lg bg-foreground/10">
          <SelectValue placeholder="Все" />
        </SelectTrigger>
        <SelectContent className="bg-foreground/10">
          {options.map(({ title, value }, idx) => (
            <Fragment key={value}>
              <SelectItem key={title} value={value}>
                {title}
              </SelectItem>
              {idx !== options.length - 1 && <SelectSeparator />}
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const EventTypeOrder: { [k in Events[0]['event_type']]: number } = {
  game: 1,
  'bonus-card': 2,
  'score-change': 3,
  'player-move': 4,
};

export default function EventsTab({ player }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');

  const {
    data: eventsData,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.playerEvents(player.id),
    queryFn: () => fetchPlayerEvents(player.id),
    refetchInterval: 30 * 1000,
  });

  const events = eventsData?.events || [];
  const sortedEvents = events.sort((a, b) => {
    if (a.timestamp === b.timestamp) {
      if (a.event_type === 'player-move' && b.event_type === 'player-move') {
        if (a.subtype === 'train-ride') {
          return 1; // 'train-ride' events should come last
        }
        if (b.subtype === 'train-ride') {
          return -1; // 'train-ride' events should come last
        }
      }
      return EventTypeOrder[b.event_type] - EventTypeOrder[a.event_type];
    }
    return b.timestamp - a.timestamp;
  });

  const filteredEvents =
    selectedFilter === 'all'
      ? sortedEvents
      : sortedEvents.filter(event => event.event_type === selectedFilter);

  const eventsByDate = getEventsByDate(filteredEvents);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoaderCircleIcon className="animate-spin text-primary" size={54} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground text-center">Произошла ошибка при загрузке событий</p>
        <p className="text-sm text-red-500 text-center">
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div>
      <EventsTabFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      <div className="flex flex-col gap-7.5 mb-5">
        {Object.keys(eventsByDate).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {selectedFilter === 'all' ? 'Нет событий' : `Нет событий типа "${selectedFilter}"`}
          </div>
        ) : (
          Object.entries(eventsByDate).map(([date, events]) => {
            const { month, day } = getFormattedTime(new Date(date).getTime() / 1000);

            return (
              <div key={date}>
                <div className="mb-2.5 w-full text-center text-muted-foreground font-wide-semibold text-xs">
                  {`${day} ${month}`}
                </div>
                <div className="flex flex-col gap-5">
                  {events.map((event, index) => (
                    <Event
                      key={`${event.timestamp}-${event.event_type}-${index}`}
                      event={event}
                      player={player}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

function getFormattedTime(ts: number) {
  const date = new Date(ts * 1000);

  return {
    month: months[date.getMonth()],
    day: String(date.getDate()).padStart(2, '0'),
    hours: String(date.getHours()).padStart(2, '0'),
    minutes: String(date.getMinutes()).padStart(2, '0'),
  };
}

function getEventsByDate(events: Events) {
  const eventsByDate = events.reduce(
    (acc, cur) => {
      const date = new Date(cur.timestamp * 1000).toDateString();
      (acc[date] = acc[date] || []).push(cur);
      return acc;
    },
    {} as Record<string, Events>
  );

  const sortedEventsByDate: Record<string, Events> = {};
  for (const [date, dateEvents] of Object.entries(eventsByDate)) {
    sortedEventsByDate[date] = [...dateEvents].sort((a, b) => b.timestamp - a.timestamp);
  }

  return sortedEventsByDate;
}

function ScoreChangeDescription({ event }: { event: ScoreChangeEvent }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-0 ${event.amount > 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}
      >
        <p>
          {event.amount > 0 && '+'}
          {event.amount}
        </p>
        <Share className="w-3.5 h-3.5 inline" />
      </div>
      ({event.score_before}&nbsp;→&nbsp;{event.score_after})
    </div>
  );
}
