export default function FrontVersionInfo() {
  return (
    <div
      className="absolute left-20 bottom-0 z-50 flex flex-col items-start p-1 text-xs text-white/80 bg-black/60 select-none"
      id="front-version-info"
    >
      Версия: {import.meta.env.PACKAGE_VERSION}
    </div>
  );
}
