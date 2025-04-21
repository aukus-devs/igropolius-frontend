import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return <span>{formatTime(time)}</span>;
}

function formatTime(timeMs: number) {
  const date = new Date(timeMs);
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedTime = date.toLocaleTimeString("ru-RU", options);
  return formattedTime;
}
