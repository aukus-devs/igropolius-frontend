import { useState, useRef, useEffect } from 'react';
import { Input } from '../../ui/input';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { searchEmotes } from '@/lib/api';

interface EmotePanelProps {
  onEmoteSelect: (emoteUrl: string) => void;
  className?: string;
}

export default function EmotePanel({ onEmoteSelect, className = '' }: EmotePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: emoteData, isLoading } = useQuery({
    queryKey: ['emotes', debouncedQuery],
    queryFn: () => searchEmotes(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    initialData: { emotes: [] },
  });

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleEmoteClick = (emoteUrl: string) => {
    onEmoteSelect(emoteUrl);
  };

  return (
    <div
      className={`w-[236px] h-[171px] bg-white/15 backdrop-blur-[50px] rounded-lg p-1 ${className}`}
    >
      <div className="w-full h-7 bg-white/15 rounded-[5px] mb-1">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Поиск смайлов..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-full border-none bg-transparent text-white placeholder-white/70 text-sm px-2 py-0"
          onKeyDown={e => e.stopPropagation()}
        />
      </div>

      <div className="flex-1 h-32 overflow-y-auto">
        {isLoading && debouncedQuery.length >= 2 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/70"></div>
          </div>
        ) : emoteData.emotes.length > 0 ? (
          <div className="grid grid-cols-7 gap-1 p-1">
            {emoteData.emotes.map((emoteUrl, index) => (
              <button
                key={index}
                onClick={() => handleEmoteClick(emoteUrl)}
                className="w-7 h-7 rounded hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <img
                  src={emoteUrl}
                  alt="emote"
                  className="w-6 h-6 object-contain"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        ) : debouncedQuery.length >= 2 ? (
          <div className="flex items-center justify-center h-full text-white/70 text-sm">
            Смайлы не найдены
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/70 text-sm">
            Введите текст для поиска
          </div>
        )}
      </div>
    </div>
  );
}
