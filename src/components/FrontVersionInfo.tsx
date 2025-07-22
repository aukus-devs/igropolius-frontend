function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function FrontVersionInfo() {
  return (
    <div
      className="absolute left-20 bottom-0 z-50 flex flex-col items-start p-1 text-xs text-white/80 bg-black/60 select-none"
      id="front-version-info"
    >
      Версия: {formatDate(import.meta.env.BUILD_DATE)}
    </div>
  );
}
