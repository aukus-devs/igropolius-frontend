import { PlayerEvent } from "@/lib/types";
import { getEventDescription } from "@/lib/utils";

type Props = {
  events: PlayerEvent[];
};

export default function EventsTab({ events }: Props) {
  return (
    <div>
      {events.map((event, index) => {
        return (
          <div key={index} className="mt-4">
            <div>{formatTimestamp(event.timestamp)}</div>
            <span>{getEventDescription(event)}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatTimestamp(ts: number) {
  const date = new Date(ts);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
}
