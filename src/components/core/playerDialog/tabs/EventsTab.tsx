import { Share } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon } from "lucide-react";
import { fetchPlayerEvents } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import {
  PlayerData,
  PlayerEvent,
  PlayerEventMove,
  DiceRollJson,
} from "@/lib/types";
import { getEventDescription, getBonusCardName } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState, useMemo } from "react";

type Props = {
  player: PlayerData;
};

function DiceRollDetails({ diceRollJson }: { diceRollJson: DiceRollJson }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">Результат броска кубиков</h4>
        <Badge
          variant={diceRollJson.is_random_org_result ? "default" : "secondary"}
        >
          {diceRollJson.is_random_org_result ? "Random.org" : "Локальный"}
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-semibold">Кубики:</span>{" "}
          {diceRollJson.data.join(", ")}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Сумма:</span>{" "}
          {diceRollJson.data[0] + diceRollJson.data[1]}
        </p>

        {diceRollJson.is_random_org_result && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-600">
              ✓ Результат подтвержден Random.org
            </p>
            {diceRollJson.random_org_check_form && (
              <div>
                <p className="text-sm font-semibold">Проверочная форма:</p>
                <a
                  href={diceRollJson.random_org_check_form}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm break-all underline"
                >
                  Открыть проверочную форму Random.org
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Event({ event }: { event: PlayerEvent }) {
  const { title, description, gameCover } = getEventDescription(event);
  const { hours, minutes } = getFormattedTime(event.timestamp);
  const isScoreChangeEvent = event.event_type === "score-change";
  const isMoveEvent = event.event_type === "player-move";
  const moveEvent = isMoveEvent ? (event as PlayerEventMove) : null;
  const hasDiceRollData =
    moveEvent?.dice_roll_json && moveEvent.subtype === "dice-roll";

  const bonusesUsed = (event as any).bonuses_used || [];

  const EventContent = () => (
    <div className={gameCover ? "flex gap-2" : ""}>
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
      <div className={gameCover ? "flex-1 pt-6" : ""}>
        {!gameCover && (
          <div className="text-muted-foreground text-sm font-semibold">{`${hours}:${minutes}`}</div>
        )}
        <h3 className="font-wide-medium text-[#F2F2F2]">{title}</h3>
        <p className="text-muted-foreground text-sm font-semibold mt-1">
          {description}{" "}
          {isScoreChangeEvent && <Share className="w-3.5 h-3.5 inline" />}
        </p>
        {bonusesUsed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-1">
              Использованы карты:
            </span>
            {bonusesUsed.map((bonus: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {getBonusCardName(bonus as any)}
              </Badge>
            ))}
          </div>
        )}
        {hasDiceRollData && (
          <p className="text-xs text-blue-500 mt-1">
            Нажмите для просмотра деталей броска
          </p>
        )}
      </div>
    </div>
  );

  if (hasDiceRollData) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer hover:bg-foreground/5 rounded transition-colors">
            <EventContent />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DiceRollDetails diceRollJson={moveEvent.dice_roll_json!} />
        </DialogContent>
      </Dialog>
    );
  }

  return <EventContent />;
}

type FilterValue = PlayerEvent["event_type"] | "all";

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
    { title: "Все", value: "all" },
    { title: "Карточки", value: "bonus-card" },
    { title: "Налоги", value: "score-change" },
    { title: "Игры", value: "game" },
    { title: "Ходы", value: "player-move" },
  ];

  return (
    <div className="flex items-center gap-2.5 justify-self-end">
      <span className="font-semibold text-muted-foreground">Фильтр</span>
      <Select
        value={selectedFilter}
        onValueChange={(value) => onFilterChange(value as FilterValue)}
      >
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

export default function EventsTab({ player }: Props) {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>("all");

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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedFilter === "all") {
      return sortedEvents;
    }
    return sortedEvents.filter((event) => event.event_type === selectedFilter);
  }, [sortedEvents, selectedFilter]);

  const eventsByDate = useMemo(() => {
    return getEventsByDate(filteredEvents);
  }, [filteredEvents]);

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
        <p className="text-muted-foreground text-center">
          Произошла ошибка при загрузке событий
        </p>
        <p className="text-sm text-red-500 text-center">
          {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div>
      <EventsTabFilter
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <div className="flex flex-col gap-7.5 mb-5">
        {Object.keys(eventsByDate || {}).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {selectedFilter === "all"
              ? "Нет событий"
              : `Нет событий типа "${selectedFilter}"`}
          </div>
        ) : (
          Object.entries(eventsByDate || {}).map(([date, events]) => {
            const { month, day } = getFormattedTime(
              new Date(date).getTime() / 1000
            );

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
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function getFormattedTime(ts: number) {
  const date = new Date(ts * 1000);

  return {
    month: months[date.getMonth()],
    day: String(date.getDate()).padStart(2, "0"),
    hours: String(date.getHours()).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
  };
}

function getEventsByDate(events: PlayerEvent[]) {
  const eventsByDate = events.reduce((acc, cur) => {
    const date = new Date(cur.timestamp * 1000).toDateString();
    (acc[date] = acc[date] || []).push(cur);
    return acc;
  }, {} as Record<string, PlayerEvent[]>);

  const sortedEventsByDate: Record<string, PlayerEvent[]> = {};
  for (const [date, dateEvents] of Object.entries(eventsByDate)) {
    sortedEventsByDate[date] = [...dateEvents].sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  return sortedEventsByDate;
}
