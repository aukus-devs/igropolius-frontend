import { formatMs } from '@/lib/utils';
import { useEffect, useState } from 'react';
import useEventStore from '@/stores/eventStore';

type Props = {
  className?: string;
};

export default function Countdown({ className }: Props) {
  const [time, setTime] = useState(() => Date.now());
  const eventEndTime = useEventStore(state => state.eventEndTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!eventEndTime) {
    return <div className={className}>Загрузка...</div>;
  }

  const targetTime = eventEndTime * 1000;
  const diff = targetTime - time;
  const message = diff > 0 ? `До конца — ${formatMs(diff)}` : 'Ивент завершен';

  return <div className={className}>{message}</div>;
}
