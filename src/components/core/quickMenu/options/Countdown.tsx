import { formatMs } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

export default function Countdown({ className }: Props) {
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const targetTime = new Date("2025-07-01T00:00:00+03:00").getTime();

  const diff = targetTime - time;
  const message = diff > 0 ? `До конца — ${formatMs(diff)}` : "Ивент завершен";

  return <div className={className}>{message}</div>;
}
