export default function FrontVersionInfo() {
  return (
    <div
      className="flex flex-col items-start p-1 text-xs text-white/80 bg-black/60 select-none"
      id="front-version-info"
    >
      v.{import.meta.env.PACKAGE_VERSION}
    </div>
  );
}
