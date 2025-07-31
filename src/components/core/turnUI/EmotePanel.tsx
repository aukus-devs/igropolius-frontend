import { useState, useRef, useEffect } from 'react';
import { Input } from '../../ui/input';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { searchEmotes } from '@/lib/api';
import ImageLoader from '../ImageLoader';
import { LoaderCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmotePanelProps {
  onEmoteSelect: (emoteUrl: string) => void;
}

export default function EmotePanel({ onEmoteSelect }: EmotePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: emoteData, isFetching } = useQuery({
    queryKey: ['emotes', debouncedQuery],
    queryFn: () => searchEmotes(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleEmoteClick = (emoteUrl: string) => {
    onEmoteSelect(emoteUrl);
  };

  return (
    <div
      className="bg-white/15 backdrop-blur-[1.5rem] rounded-lg p-2"
    >
      <Input
        ref={searchInputRef}
        type="text"
        className="w-full text-white placeholder-white/70 bg-white/15 rounded-[5px] mb-2"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onKeyDown={e => e.stopPropagation()}
        placeholder="Поиск смайлов..."
      />

      <div className="w-[calc(7_*_48px)] h-[calc(4_*_48px)]">
        {isFetching && debouncedQuery.length >= 2 ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoaderCircleIcon className="animate-spin text-primary" size={24} />
          </div>
        ) : emoteData?.emotes && emoteData.emotes.length > 0 ? (
          <div className="grid grid-cols-[repeat(7,48px)] grid-rows-[repeat(4,48px)]">
            {emoteData?.emotes?.map((emoteUrl, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="w-full h-full p-2 rounded hover:bg-white/15"
                onClick={() => handleEmoteClick(emoteUrl)}
              >
                <ImageLoader
                  src={emoteUrl}
                  alt="emote"
                  className="h-full w-full"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </Button>
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
