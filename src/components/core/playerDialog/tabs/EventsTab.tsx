import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPlayerEvents } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { PlayerData, PlayerEvent } from "@/lib/types";
import { getEventDescription } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ZapIcon } from "lucide-react";
import { Fragment } from "react";

type Props = {
  player: PlayerData;
};

function Event({ event }: { event: PlayerEvent }) {
  const { title, description } = getEventDescription(event);
  const { hours, minutes } = getFormattedTime(event.timestamp);
  const isScoreChangeEvent = event.event_type === "score-change";

  return (
    <div>
      <div className="text-muted-foreground text-sm font-semibold">{`${hours}:${minutes}`}</div>
      <h3 className="font-wide-medium">{title}</h3>
      <p className={`text-muted-foreground text-sm font-semibold`}>
        {description} {isScoreChangeEvent && <ZapIcon className="w-3.5 h-3.5 inline" />}
      </p>
    </div>
  );
}

type EventsTabFilterOption = {
  title: string;
  value: PlayerEvent["event_type"];
};

function EventsTabFilter() {
  const options: EventsTabFilterOption[] = [
    { title: "Карточки", value: "bonus-card" },
    { title: "Налоги", value: "score-change" },
    { title: "Игры", value: "game" },
    { title: "Ходы", value: "player-move" },
  ];

  return (
    <div className="flex items-center gap-2.5 justify-self-end">
      <span className="font-semibold text-muted-foreground">Фильтр</span>
      <Select>
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
  const { data: eventsData } = useQuery({
    queryKey: queryKeys.playerEvents(player.id),
    queryFn: () => fetchPlayerEvents(player.id),
    refetchInterval: 30 * 1000,
  });

  const events = eventsData?.events || [];
  events.sort((a, b) => (a.timestamp >= b.timestamp ? -1 : 1));

  const eventsByDate = getEventsByDate(events);

  return (
    <div>
      <EventsTabFilter />
      <div className="flex flex-col gap-7.5 mb-5">
        {Object.entries(eventsByDate || {}).map(([date, events]) => {
          const { month, day } = getFormattedTime(new Date(date).getTime());

          return (
            <div key={date}>
              <div className="mb-2.5 w-full text-center text-muted-foreground font-wide-semibold text-xs">
                {`${day} ${month}`}
              </div>
              <div className="flex flex-col gap-5">
                {events.map((event) => (
                  <Event key={event.timestamp} event={event} />
                ))}
              </div>
            </div>
          );
        })}
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
  const date = new Date(ts);

  return {
    month: months[date.getMonth()],
    day: String(date.getDate()).padStart(2, "0"),
    hours: String(date.getHours()).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
  };
}

function getEventsByDate(events: PlayerEvent[]) {
  const eventsByDate = events.reduce(
    (acc, cur) => {
      const date = new Date(cur.timestamp).toDateString();
      (acc[date] = acc[date] || []).push(cur);
      return acc;
    },
    {} as Record<string, PlayerEvent[]>,
  );

  for (const events of Object.values(eventsByDate)) {
    events.sort((a, b) => b.timestamp - a.timestamp);
  }

  return eventsByDate;
}
