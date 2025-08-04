import { ArrowRight, Document2, Share, TickCircle } from '@/components/icons';
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
import { getEventDescription, getBonusCardName, eventTimeFormat } from '@/lib/utils';
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
import { bonusCardsData } from '@/lib/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ImageLoader from '../../ImageLoader';
import { Toggle } from '@/components/ui/toggle';

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
    <div className="space-y-[5px] text-sm font-medium text-muted-foreground animate-in fade-in-0">
      <div>
        {diceRollJson.is_random_org_result
          ? 'Результаты броска кубиков через Random.org'
          : `Результаты броска кубиков (локальный бросок, причина: ${diceRollJson.random_org_fail_reason})`}
      </div>
      <div>Кубики: {diceRollJson.data.join(', ')}</div>
      <div>
        Сумма кубиков: {diceRollJson.data[0] + diceRollJson.data[1]}
      </div>
      <div>Итоговый результат: {adjustedRoll}</div>
      {diceRollJson.is_random_org_result && (
        <div className="flex items-center gap-[5px] text-green-500">
          <TickCircle />
          Результат подтвержден Random.org
        </div>
      )}
      {diceRollJson.random_org_check_form && (
        <a
          href={diceRollJson.random_org_check_form}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Открыть проверочную форму
        </a>
      )}
    </div>
  );
}

function Event({ event, player }: { event: Events[0]; player: PlayerDetails }) {
  const [showDetails, setShowDetails] = useState(false);

  const { hours, minutes } = eventTimeFormat(event.timestamp);
  const { title, description, image, timeHeader, sectorId, bonusType } = getEventDescription(
    event,
    player
  );
  const cardInfo = bonusType ? bonusCardsData[bonusType] : null;
  const isScoreChangeEvent = event.event_type === 'score-change';
  const isMoveEvent = event.event_type === 'player-move';
  const moveEvent = isMoveEvent ? (event as MoveEvent) : null;
  const hasDiceRollData = moveEvent?.dice_roll_json && moveEvent.subtype === 'dice-roll';

  let bonusesUsed: MainBonusCardType[] = [];
  if (event.event_type === 'player-move') {
    bonusesUsed = event.bonuses_used;
  }

  return (
    <div>
      <div className="mb-2.5 text-muted-foreground text-sm font-semibold">
        {timeHeader ? timeHeader : `${hours}:${minutes}`}
      </div>
      <div className="flex gap-2.5 items-start mb-[5px]">
        {image && (
          <Tooltip>
            <TooltipTrigger>
              <ImageLoader
                className="w-[40px] h-[53px] md:w-[52px] md:h-[70px] rounded-sm overflow-hidden"
                src={image}
                alt={description}
              />
            </TooltipTrigger>
            {cardInfo && (
              <TooltipContent className="w-fit max-w-60">{cardInfo.description}</TooltipContent>
            )}
          </Tooltip>
        )}
        <div className="flex flex-wrap justify-between items-center w-full">
          <div className="flex flex-col">
            <div className="font-roboto-wide-semibold break-words leading-tight">
              {title}
              {!sectorId && ': '}
              {!sectorId && description}
            </div>
            {sectorId && (
              <div className="text-sm text-muted-foreground font-semibold">
                Сектор #{sectorId}
              </div>
            )}
          </div>
          {hasDiceRollData && (
            <Toggle
              size="sm"
              className="bg-foreground/20 text-foreground/70"
              onPressedChange={setShowDetails}
            >
              <Document2 />
              Детали
            </Toggle>
          )}
        </div>
      </div>

      {isScoreChangeEvent &&
        <ScoreChangeDescription event={event as ScoreChangeEvent} />
      }

      <div className="space-y-[5px]">
        {bonusesUsed.length > 0 && (
          <div className="text-sm font-medium text-muted-foreground">
            Примененные карточки: {bonusesUsed.map((bonus, _) => getBonusCardName(bonus)).join(', ')}
          </div>
        )}
        {hasDiceRollData && showDetails && (
          <DiceRollDetails
            diceRollJson={moveEvent.dice_roll_json!}
            adjustedRoll={moveEvent.adjusted_roll}
          />
        )}
      </div>
    </div>
  );
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
        <SelectTrigger className="w-[140px] rounded-lg bg-foreground/10 text-muted-foreground">
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
        <p className="text-muted-foreground text-center font-semibold">Произошла ошибка при загрузке событий</p>
        <p className="text-sm text-red-500 text-center font-semibold">
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </p>
        <Button onClick={() => refetch()}>
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
            const eventDate = new Date(date);
            const isToday = eventDate.toDateString() === new Date().toDateString();
            const { month, day } = eventTimeFormat(eventDate.getTime() / 1000);

            return (
              <div key={date}>
                <div className="mb-5 w-full text-center text-muted-foreground font-roboto-wide-semibold text-sm">
                  {isToday ? 'Сегодня' : `${day} ${month}`}
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
  const amount = event.amount === 0 ? '0' : `${event.amount > 0 ? '+ ' : '- '}${Math.abs(event.amount)}`;
  const color = event.amount > 0 ? 'text-green-500' : event.amount < 0 ? 'text-red-500' : 'text-foreground';

  return (
    <div className="flex items-center gap-1">
      <div className={`flex items-center font-semibold ${color}`}>
        <p>{amount}</p>
        <Share className="size-[15px]" />
      </div>
      <p className="text-muted-foreground text-sm font-semibold">
        ({event.score_before} <ArrowRight className="inline size-4" /> {event.score_after})
      </p>
    </div>
  );
}
