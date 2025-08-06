import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { hasStream } from '../lib/streamUtils';
import StreamPlayer from '../components/streams/StreamPlayer';
import StreamChat from '../components/streams/StreamChat';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StreamsPage() {
  const [expandedStreamIndex, setExpandedStreamIndex] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [visiblePlayers, setVisiblePlayers] = useState<Set<string>>(new Set());
  const [showAllPlayers, setShowAllPlayers] = useState(true);
  const streamRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: playersData, isLoading } = useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: 60 * 1000,
  });

  const onlineStreamers =
    playersData?.players?.filter(player => player.is_online && hasStream(player)) || [];
  console.log(onlineStreamers);
  const handleToggleExpand = (index: number) => {
    if (expandedStreamIndex === index) {
      setExpandedStreamIndex(null);
      setShowChat(true);
    } else {
      setExpandedStreamIndex(index);
      setShowChat(true);
    }
  };

  useEffect(() => {
    if (showAllPlayers) {
      setVisiblePlayers(new Set(onlineStreamers.map(player => player.id.toString())));
    }
  }, [onlineStreamers, showAllPlayers]);

  const filteredStreamers = onlineStreamers.filter(player => {
    return showAllPlayers || visiblePlayers.has(player.id.toString());
  });

  const handleTogglePlayer = (playerId: string) => {
    const newVisiblePlayers = new Set(visiblePlayers);
    if (newVisiblePlayers.has(playerId)) {
      newVisiblePlayers.delete(playerId);
    } else {
      newVisiblePlayers.add(playerId);
    }
    setVisiblePlayers(newVisiblePlayers);
    setShowAllPlayers(false);
  };

  const handleShowAll = () => {
    setShowAllPlayers(true);
    setVisiblePlayers(new Set(onlineStreamers.map(player => player.id.toString())));
  };

  useEffect(() => {
    if (expandedStreamIndex !== null) {
      const expandedElement = streamRefs.current[expandedStreamIndex];
      const container = containerRef.current;

      if (expandedElement && container) {
        const containerRect = container.getBoundingClientRect();

        const topOffset = 8;
        const leftOffset = 8;
        const rightOffset = 16;
        const chatWidth = showChat ? 320 : 0;
        const elementHeight = 192;
        const gap = 8;
        const expandedWidth = containerRect.width - chatWidth - leftOffset - rightOffset;

        const otherElements = filteredStreamers
          .map((_, i) => i)
          .filter(i => i !== expandedStreamIndex)
          .map(i => streamRefs.current[i])
          .filter(Boolean);

        const remainingCount = otherElements.length;
        const rowsNeeded = remainingCount <= 6 ? 1 : Math.ceil(remainingCount / 6);
        const bottomAreaHeight =
          remainingCount === 0
            ? 0
            : remainingCount <= 6
              ? elementHeight + gap + 20
              : rowsNeeded * elementHeight + (rowsNeeded - 1) * gap + topOffset;
        const expandedHeight = window.innerHeight - bottomAreaHeight - 50;

        expandedElement.style.position = 'fixed';
        expandedElement.style.top = `${topOffset}px`;
        expandedElement.style.left = `${leftOffset}px`;
        expandedElement.style.width = `${expandedWidth}px`;
        expandedElement.style.height = `${expandedHeight}px`;
        expandedElement.style.zIndex = '1000';
        expandedElement.style.transition = 'all 0.3s ease-in-out';
        expandedElement.style.borderRadius = '8px';

        let elementsPerRow, elementWidth;

        const availableWidth = showChat
          ? containerRect.width - chatWidth - leftOffset - rightOffset
          : containerRect.width - leftOffset - rightOffset;

        if (remainingCount <= 6) {
          elementsPerRow = remainingCount;
          elementWidth = (availableWidth - (remainingCount - 1) * gap) / remainingCount;
        } else {
          elementsPerRow = 6;
          elementWidth = (availableWidth - 5 * gap) / 6;
        }

        otherElements.forEach((element, i) => {
          if (element) {
            const row = Math.floor(i / elementsPerRow);
            const col = i % elementsPerRow;

            let topPosition;
            if (remainingCount <= 6) {
              const totalBottomHeight = elementHeight + gap;
              const bottomCenterY = window.innerHeight - totalBottomHeight - 10;
              topPosition = bottomCenterY;
            } else {
              topPosition = expandedHeight + topOffset + gap + row * (elementHeight + gap);
            }

            element.style.position = 'fixed';
            element.style.top = `${topPosition}px`;
            element.style.left = `${leftOffset + col * (elementWidth + gap)}px`;
            element.style.width = `${elementWidth}px`;
            element.style.height = `${elementHeight}px`;
            element.style.zIndex = '999';
            element.style.transition = 'all 0.3s ease-in-out';
            element.style.display = 'block';
          }
        });
      }
    } else {
      streamRefs.current.forEach((ref, index) => {
        if (ref) {
          ref.style.position = '';
          ref.style.top = '';
          ref.style.left = '';
          ref.style.width = '';
          ref.style.height = '';
          ref.style.zIndex = '';
          ref.style.transition = '';
          ref.style.borderRadius = '';
          ref.style.display = index < 12 ? 'block' : 'none';
        }
      });
    }
  }, [expandedStreamIndex, showChat]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#282828] flex items-center justify-center">
        <div className="text-lg text-white">Загрузка стримов...</div>
      </div>
    );
  }

  if (onlineStreamers.length === 0) {
    return (
      <div className="min-h-screen bg-[#282828]">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '/')}
            className="mb-6 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Игрополиус
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Стримы</h1>
            <p className="text-gray-300">Сейчас нет активных стримов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#282828]">
      <div className="py-4 px-4">
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = '/')}
            className="text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Игрополиус
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={showAllPlayers ? 'default' : 'outline'}
              onClick={handleShowAll}
              className="text-white"
            >
              Все онлайн
            </Button>
            {onlineStreamers.map(player => (
              <Button
                key={player.id}
                variant={
                  visiblePlayers.has(player.id.toString()) && !showAllPlayers
                    ? 'default'
                    : 'outline'
                }
                onClick={() => handleTogglePlayer(player.id.toString())}
                className="text-white"
              >
                {player.username}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div ref={containerRef} className="p-2 relative w-full">
        <div className="grid grid-cols-4 gap-2">
          {filteredStreamers.map((player, index) => (
            <div
              key={player.id}
              ref={el => {
                streamRefs.current[index] = el;
              }}
              className={`aspect-video ${index >= 12 && expandedStreamIndex === null ? 'hidden' : ''}`}
            >
              <StreamPlayer
                player={player}
                isExpanded={expandedStreamIndex === index}
                onToggleExpand={() => handleToggleExpand(index)}
                showChat={showChat}
                onToggleChat={() => setShowChat(!showChat)}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {expandedStreamIndex !== null && (
          <>
            {showChat && (
              <div className="fixed top-0 right-0 z-[9999] w-80 h-screen bg-white shadow-lg">
                <StreamChat player={filteredStreamers[expandedStreamIndex]} className="h-full" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
