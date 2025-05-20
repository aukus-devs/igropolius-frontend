import { useEffect, useState } from "react";

export default function Countdown() {
  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const targetTime = new Date("2025-06-15T00:00:00+03:00").getTime();

  const diff = targetTime - time;
  const message = diff > 0 ? `До конца — ${formatDiff(diff)}` : "Ивент завершен";
  return <span>{message}</span>;
}

function formatDiff(diffMs: number) {
  const diffS = Math.floor(diffMs / 1000);
  const days = Math.floor(diffS / (60 * 60 * 24));
  const hours = Math.floor((diffS % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffS % (60 * 60)) / 60);
  const seconds = diffS % 60;

  const hoursPadded = String(hours).padStart(2, "0");
  const minutesPadded = String(minutes).padStart(2, "0");
  const secondsPadded = String(seconds).padStart(2, "0");

  if (hours === 0) {
    return `${minutesPadded}м ${secondsPadded}с`;
  }

  if (days === 0) {
    return `${hoursPadded}ч ${minutesPadded}м`;
  }

  return `${days}д ${hoursPadded}ч`;
}
