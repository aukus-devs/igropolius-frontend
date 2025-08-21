import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { hasStream } from '../lib/streamUtils';
import StreamPlayer from '../components/streams/StreamPlayer';
import StreamChat from '../components/streams/StreamChat';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function StreamsPage() {
  const [expandedStreamId, setExpandedStreamId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [visiblePlayers, setVisiblePlayers] = useState<Set<string>>(new Set());
  const [showAllPlayers, setShowAllPlayers] = useState(true);
  const [columnsCount, setColumnsCount] = useState(4);
  const streamRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: playersData, isLoading } = useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: 60 * 1000,
  });

  const onlineStreamers = useMemo(() => {
    return playersData?.players?.filter(player => player.is_online && hasStream(player)) || [];
  }, [playersData?.players]);

  const handleToggleExpand = useCallback(
    (playerId: string) => {
      if (expandedStreamId === playerId) {
        setExpandedStreamId(null);
        setShowChat(true);
      } else {
        setExpandedStreamId(playerId);
        setShowChat(true);
      }
    },
    [expandedStreamId]
  );

  useEffect(() => {
    if (showAllPlayers) {
      const newVisiblePlayers = new Set(onlineStreamers.map(player => player.id.toString()));
      setVisiblePlayers(newVisiblePlayers);
    }
  }, [onlineStreamers, showAllPlayers]);

  useEffect(() => {
    if (expandedStreamId && !visiblePlayers.has(expandedStreamId)) {
      setExpandedStreamId(null);
      setShowChat(true);
    }
  }, [expandedStreamId, visiblePlayers]);

  const filteredStreamers = useMemo(() => {
    return onlineStreamers.filter(player => {
      return showAllPlayers || visiblePlayers.has(player.id.toString());
    });
  }, [onlineStreamers, showAllPlayers, visiblePlayers]);

  const expandedStreamIndex = useMemo(() => {
    if (!expandedStreamId) return null;
    return filteredStreamers.findIndex(player => player.id.toString() === expandedStreamId);
  }, [expandedStreamId, filteredStreamers]);

  const handleTogglePlayer = useCallback(
    (playerId: string) => {
      const newVisiblePlayers = new Set(visiblePlayers);
      if (newVisiblePlayers.has(playerId)) {
        newVisiblePlayers.delete(playerId);
      } else {
        newVisiblePlayers.add(playerId);
      }
      setVisiblePlayers(newVisiblePlayers);
      setShowAllPlayers(false);
      
      if (expandedStreamId === playerId) {
        setExpandedStreamId(null);
        setShowChat(true);
      }
    },
    [visiblePlayers, expandedStreamId]
  );

  const handleShowAll = useCallback(() => {
    setShowAllPlayers(true);
    if (expandedStreamId) {
      setExpandedStreamId(null);
      setShowChat(true);
    }
  }, [expandedStreamId]);

  const handleToggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const resetElementStyles = useCallback(() => {
    streamRefs.current.forEach((ref) => {
      if (ref) {
        ref.style.position = '';
        ref.style.top = '';
        ref.style.left = '';
        ref.style.width = '';
        ref.style.height = '';
        ref.style.zIndex = '';
        ref.style.transition = '';
        ref.style.borderRadius = '';
        ref.style.display = '';
        ref.style.transform = '';
      }
    });
  }, []);

  useEffect(() => {
    if (expandedStreamIndex !== null && expandedStreamIndex !== -1) {
      const expandedPlayer = filteredStreamers[expandedStreamIndex];
      
      if (!visiblePlayers.has(expandedPlayer.id.toString())) {
        setExpandedStreamId(null);
        setShowChat(true);
        return;
      }
      
      const expandedElementIndex = onlineStreamers.findIndex(p => p.id === expandedPlayer.id);
      const expandedElement = streamRefs.current[expandedElementIndex];
      const container = containerRef.current;

      if (expandedElement && container) {
        const containerRect = container.getBoundingClientRect();

        const chatWidth = showChat ? 320 : 0;
        const elementHeight = 192;
        const gap = 0;
        const expandedWidth = containerRect.width - chatWidth;

        const otherElements = filteredStreamers
          .map((_, i) => i)
          .filter(i => i !== expandedStreamIndex)
          .map(i => {
            const player = filteredStreamers[i];
            const refIndex = onlineStreamers.findIndex(p => p.id === player.id);
            const element = streamRefs.current[refIndex];
            return element && visiblePlayers.has(player.id.toString()) ? element : null;
          })
          .filter(Boolean);

        const remainingCount = otherElements.length;
        const rowsNeeded = remainingCount <= 6 ? 1 : Math.ceil(remainingCount / 6);
        const bottomAreaHeight =
          remainingCount === 0
            ? 0
            : remainingCount <= 6
              ? elementHeight + gap
              : rowsNeeded * elementHeight + (rowsNeeded - 1) * gap;
        const expandedHeight = remainingCount === 0 
          ? window.innerHeight
          : window.innerHeight - bottomAreaHeight;

        expandedElement.style.position = 'fixed';
        expandedElement.style.top = '0px';
        expandedElement.style.left = '0px';
        expandedElement.style.width = `${expandedWidth}px`;
        expandedElement.style.height = `${expandedHeight}px`;
        expandedElement.style.zIndex = '1000';
        expandedElement.style.transition = 'all 0.3s ease-in-out';
        expandedElement.style.borderRadius = '0px';

        let elementsPerRow, elementWidth;

        const availableWidth = showChat
          ? containerRect.width - chatWidth
          : containerRect.width;

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
            if (remainingCount === 0) {
              topPosition = window.innerHeight + 200;
            } else if (remainingCount <= 6) {
              const totalBottomHeight = elementHeight + gap;
              const bottomCenterY = window.innerHeight - totalBottomHeight;
              topPosition = bottomCenterY;
            } else {
              topPosition = expandedHeight + gap + row * (elementHeight + gap);
            }

            element.style.position = 'fixed';
            element.style.top = `${topPosition}px`;
            element.style.left = `${col * (elementWidth + gap)}px`;
            element.style.width = `${elementWidth}px`;
            element.style.height = `${elementHeight}px`;
            element.style.zIndex = '999';
            element.style.transition = 'all 0.3s ease-in-out';
            element.style.display = 'block';
          }
        });
      }
    } else {
      resetElementStyles();
    }
  }, [expandedStreamIndex, showChat, filteredStreamers, resetElementStyles, columnsCount, onlineStreamers]);

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
          <Button variant="ghost" onClick={handleGoHome} className="mb-6 text-white">
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
      <div className="py-4 px-0">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" onClick={handleGoHome} className="text-white">
            Игрополиус
          </Button>

          <div className="flex flex-wrap gap-2 flex-1">
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

          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Колонки:</span>
            <Select value={columnsCount.toString()} onValueChange={(value) => setColumnsCount(parseInt(value))}>
              <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full">
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columnsCount}, 1fr)` }}>
          {filteredStreamers.map((player, index) => (
            <div
              key={player.id}
              ref={el => {
                const refIndex = onlineStreamers.findIndex(p => p.id === player.id);
                streamRefs.current[refIndex] = el;
              }}
              className="aspect-video"
            >
              <StreamPlayer
                player={player}
                isExpanded={expandedStreamIndex === index}
                onToggleExpand={() => handleToggleExpand(player.id.toString())}
                onTogglePlayer={() => handleTogglePlayer(player.id.toString())}
                showChat={showChat}
                onToggleChat={handleToggleChat}
                className="h-full"
                isFullHeight={expandedStreamIndex === index && filteredStreamers.length === 1}
              />
            </div>
          ))}
        </div>

        {expandedStreamIndex !== null && expandedStreamIndex !== -1 && (
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
