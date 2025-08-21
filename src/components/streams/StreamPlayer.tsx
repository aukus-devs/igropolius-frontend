import { getStreamUrl, getStreamPlatform } from '../../lib/streamUtils';
import { useState } from 'react';

interface StreamPlayerProps {
  player: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTogglePlayer?: () => void;
  showChat?: boolean;
  onToggleChat?: () => void;
  className?: string;
  isFullHeight?: boolean;
}

export default function StreamPlayer({
  player,
  isExpanded,
  onToggleExpand,
  onTogglePlayer,
  showChat,
  onToggleChat,
  className = '',
  isFullHeight = false,
}: StreamPlayerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const streamUrl = getStreamUrl(player);
  const platform = getStreamPlatform(player);

  if (!streamUrl) {
    return null;
  }

  return (
    <div 
      className={`relative bg-black overflow-hidden stream-player ${isExpanded ? 'expanded' : ''} ${isExpanded && isFullHeight ? 'full-height' : ''} ${className}`}
      style={{ overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-2 left-2 z-10 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col gap-2 p-2 bg-black/50 rounded-lg">
          <button
            onClick={onToggleExpand}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white border-0 rounded px-2 py-1 text-xs"
          >
            {isExpanded ? 'Свернуть' : 'Расширить'}
          </button>
          {onTogglePlayer && (
            <button
              onClick={onTogglePlayer}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white border-0 rounded px-2 py-1 text-xs"
            >
              Скрыть
            </button>
          )}
        </div>
      </div>

      <div className={`absolute top-2 right-2 z-10 flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex gap-2 p-2 bg-black/50 rounded-lg">
          {isExpanded && onToggleChat && (
            <button
              onClick={onToggleChat}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white border-0 rounded px-2 py-1 text-xs"
            >
              {showChat ? 'Скрыть чат' : 'Показать чат'}
            </button>
          )}
          <a
            href={player.twitch_stream_link || player.vk_stream_link || player.kick_stream_link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors"
          >
            {platform}
          </a>
        </div>
      </div>

      <div className={`w-full h-full overflow-hidden ${platform.toLowerCase().replace(' ', '-')}-player`} style={{ overflow: 'hidden' }}>
        <iframe
          src={streamUrl}
          className="w-full h-full border-0"
          style={{ 
            overflow: 'hidden',
            display: 'block',
            ...(platform === 'Kick' && {
              overflow: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }),
            ...(platform === 'VK Video' && {
              overflow: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            })
          }}
          allowFullScreen
          allow="autoplay; fullscreen"
          scrolling="no"
        />
      </div>
    </div>
  );
}
