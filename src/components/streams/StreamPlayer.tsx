import { getStreamUrl, getStreamPlatform } from '../../lib/streamUtils';

interface StreamPlayerProps {
  player: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  showChat?: boolean;
  onToggleChat?: () => void;
  className?: string;
}

export default function StreamPlayer({
  player,
  isExpanded,
  onToggleExpand,
  showChat,
  onToggleChat,
  className = '',
}: StreamPlayerProps) {
  const streamUrl = getStreamUrl(player);
  const platform = getStreamPlatform(player);

  if (!streamUrl) {
    return null;
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={onToggleExpand}
          className="bg-black/50 hover:bg-black/70 text-white border-0 rounded px-2 py-1 text-xs"
        >
          {isExpanded ? 'Свернуть' : 'Расширить'}
        </button>
      </div>

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">{player.username}</span>
        {isExpanded && onToggleChat && (
          <button
            onClick={onToggleChat}
            className="bg-black/50 hover:bg-black/70 text-white border-0 rounded px-2 py-1 text-xs"
          >
            {showChat ? 'Скрыть чат' : 'Показать чат'}
          </button>
        )}
        <a
          href={player.twitch_stream_link || player.vk_stream_link || player.kick_stream_link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black/50 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors"
        >
          {platform}
        </a>
      </div>

      <iframe
        src={streamUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
