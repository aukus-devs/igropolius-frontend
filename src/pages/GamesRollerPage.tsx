import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { fetchHltbRandomGames } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { HltbGameResponse } from '../lib/api-types-generated';
import { formatHltbLength, getNoun } from '../lib/utils';
import { CrownIcon, LinkIcon, LoaderCircleIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import ImageLoader from '@/components/core/ImageLoader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Wheel from './Wheel';
import { useLocation } from 'react-router';
import { Volume } from '@/components/icons';
import useLocalStorage from '@/hooks/useLocalStorage';

type GameCardProps = {
  game: HltbGameResponse;
  isWinner?: boolean;
  isSelected?: boolean;
  onClick?: (game: HltbGameResponse) => void;
  onHoverChange?: (game: HltbGameResponse | null) => void;
};

function GameCard({ game, isWinner, isSelected, onClick, onHoverChange }: GameCardProps) {
  const title = `${game.game_name}` + (game.release_world ? ` (${game.release_world})` : '');

  return (
    <div
      key={game.game_id}
      className="flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer data-[selected=true]:bg-primary/30 data-[selected=true]:text-primary duration-300 animate-in slide-in-from-left-100 hover:bg-primary/30"
      data-selected={isSelected}
      onClick={() => onClick?.(game)}
      onMouseEnter={() => onHoverChange?.(game)}
      onMouseLeave={() => onHoverChange?.(null)}
    >
      <ImageLoader
        className="flex items-center shrink-0 w-20 h-[42px] rounded-md overflow-hidden bg-center"
        src={game.game_image}
        alt={game.game_name}
      />
      <div className="w-full overflow-hidden">
        <h3
          className="font-roboto-wide-semibold text-sm whitespace-pre-line"
          title={game.game_name}
        >
          {title}
        </h3>
        {game.profile_platform && (
          <p className="text-muted-foreground text-xs whitespace-pre-line font-medium">
            {game.profile_platform}
          </p>
        )}
      </div>
      {isWinner && <CrownIcon className="text-primary pr-2 size-10" />}
    </div>
  );
}

function GameFullInfoCard({ game }: { game: HltbGameResponse }) {
  const title = `${game.game_name}` + (game.release_world ? ` (${game.release_world}) ` : ' ');
  const syncDate = new Date(game.updated_at * 1000).toLocaleDateString();
  const platforms = game.profile_platform?.split(', ');
  const genres = game.genres
    ?.split(',')
    .map(g => g.trim())
    .filter(Boolean);
  const nouns = ['отзыв', 'отзыва', 'отзывов'];
  const table = [
    {
      title: 'Main Story',
      value: game.comp_main ? formatHltbLength(game.comp_main) : 'Н/Д',
      polledText: getNoun(game.comp_main_count, nouns),
      polledColor: getPolledColor(game.comp_main_count),
    },
    {
      title: 'Main + Sides',
      value: game.comp_plus ? formatHltbLength(game.comp_plus) : 'Н/Д',
      polledText: getNoun(game.comp_plus_count, nouns),
      polledColor: getPolledColor(game.comp_plus_count),
    },
    {
      title: 'Completionist',
      value: game.comp_100 ? formatHltbLength(game.comp_100) : 'Н/Д',
      polledText: getNoun(game.comp_100_count, nouns),
      polledColor: getPolledColor(game.comp_100_count),
    },
    {
      title: 'All Styles',
      value: game.comp_all ? formatHltbLength(game.comp_all) : 'Н/Д',
      polledText: getNoun(game.comp_all_count, nouns),
      polledColor: getPolledColor(game.comp_all_count),
    },
  ];

  function getPolledColor(num: number) {
    if (num < 3)
      return {
        bg: 'bg-red-500/30',
        text: 'text-red-400',
      };
    if (num < 10)
      return {
        bg: 'bg-yellow-500/30',
        text: 'text-yellow-400',
      };
    return {
      bg: 'bg-green-500/30',
      text: 'text-green-400',
    };
  }

  return (
    <Card className="animate-in fade-in-0 duration-300 h-fit lg:max-w-[552px] justify-self-end w-full">
      <CardHeader className="flex justify-between items-center gap-2">
        <CardTitle className="w-full">
          <Button
            className="justify-start text-xl font-roboto-wide-semibold h-auto p-0 w-full overflow-hidden"
            variant="link"
          >
            <a
              href={`https://howlongtobeat.com/game/${game.game_id}`}
              target="_blank"
              className="whitespace-pre-wrap text-start"
            >
              {title}
              <LinkIcon className="size-5 inline" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <div className="shrink-0 w-[192px]">
          <ImageLoader
            className="w-[192px] h-fit rounded-md overflow-hidden"
            src={game.game_image}
            alt={game.game_name}
          />
          {game.description ? (
            <div className="mt-2">
              <ScrollArea className="h-[140px] pr-2 text-xs text-muted-foreground">
                <div className="whitespace-pre-wrap leading-snug">{game.description}</div>
              </ScrollArea>
              <div className="mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() =>
                    window.open(
                      `https://translate.google.com/?sl=en&tl=ru&text=${encodeURIComponent(game.description || '')}`,
                      '_blank'
                    )
                  }
                >
                  Перевести
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 w-full">
          {table.map(({ title, value, polledText, polledColor }, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="text-muted-foreground font-semibold">{title}</span>

              <div className="flex flex-wrap gap-2">
                <Badge className="tabular-nums w-[72px] bg-white/20 text-white/70 font-semibold">
                  {value}
                </Badge>
                <Badge className={`${polledColor.bg} ${polledColor.text} transition-none`}>
                  {polledText}
                </Badge>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-semibold">Платформы</span>
            {platforms ? (
              <div className="flex gap-2 flex-wrap">
                {platforms.map((platform, index) => (
                  <Badge key={index} className="bg-white/20 text-white/70 font-semibold">
                    {platform}
                  </Badge>
                ))}
              </div>
            ) : (
              'Платформа не указана'
            )}
          </div>
          {genres && genres.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground font-semibold">Жанры</span>
              <div className="flex gap-2 flex-wrap">
                {genres.map((genre, index) => (
                  <Badge key={index} className="bg-white/10 text-white/70 font-semibold">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground">Синхронизировано с HLTB: {syncDate}</div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(`https://howlongtobeat.com/game/${game.game_id}`, '_blank')
              }
            >
              HLTB
            </Button>
            {Number(game.steam_id) > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`https://store.steampowered.com/app/${game.steam_id}`, '_blank')
                }
              >
                Steam
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GamesRollerPage() {
  const [selectedGame, setSelectedGame] = useState<HltbGameResponse | null>(null);
  const [winner, setWinner] = useState<HltbGameResponse | null>(null);
  const [minHours, setMinHours] = useState(0);
  const [maxHours, setMaxHours] = useState(300);

  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const urlParamMin = urlParams.get('min');
  const urlParamMax = urlParams.get('max');

  const { value: isMuted, save: saveMutedState } = useLocalStorage({
    key: 'roller-sound-muted',
    defaultValue: false,
  });

  useEffect(() => {
    if (urlParamMin) {
      const parsedMin = parseInt(urlParamMin, 10);
      if (!isNaN(parsedMin) && parsedMin >= 0 && parsedMin <= 300) {
        setMinHours(parsedMin);
      }
    }
  }, [urlParamMin]);

  useEffect(() => {
    if (urlParamMax) {
      const parsedMax = parseInt(urlParamMax, 10);
      if (!isNaN(parsedMax) && parsedMax >= minHours && parsedMax <= 300) {
        setMaxHours(parsedMax);
      }
    }
  }, [urlParamMax, minHours]);

  const {
    data: gamesData,
    isFetching: gamesLoading,
    refetch,
  } = useQuery<{ games: HltbGameResponse[] }>({
    queryKey: queryKeys.hltbRandomGames,
    queryFn: () => {
      return fetchHltbRandomGames({
        limit: 12,
        min_length: minHours,
        max_length: maxHours,
      });
    },
    enabled: true,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const gamesRef = useRef<HltbGameResponse[]>([]);
  useEffect(() => {
    if (gamesData?.games) {
      gamesRef.current = gamesData.games;
    }
  }, [gamesData]);

  const onGameCardClick = (game: HltbGameResponse | null) => {
    if (!game || game.game_name === selectedGame?.game_name) {
      setSelectedGame(null);
      return;
    }

    setSelectedGame(game);
    console.log(game.release_world);
    console.log(
      game.release_world !== null && game.release_world !== undefined && game.release_world > 0
    );
  };

  const onSpinStart = useCallback(() => {
    // console.log('on start refetch');
    setSelectedGame(null);
    refetch();
  }, [refetch]);

  const onSpinFinish = useCallback((winnerId: number) => {
    const game = gamesRef.current.find(g => g.game_id === winnerId);

    if (game) {
      setSelectedGame(game);
      setWinner(game);
    }
  }, []);

  const memoizedWheel = useMemo(() => {
    const entries = gamesData?.games || [];
    const options = entries.map(game => ({
      id: game.game_id,
      label: game.game_name,
      imageUrl: game.game_image,
      weight: 1,
    }));

    // console.log('wheel refresh', options);

    return (
      <Wheel
        entries={options}
        onSpinEnd={onSpinFinish}
        onSpinStart={onSpinStart}
        onSelect={(id: number) => {
          const game = gamesRef.current.find(g => g.game_id === id);
          setSelectedGame(game ?? null);
        }}
      />
    );
  }, [gamesData, onSpinFinish, onSpinStart]);

  return (
    <div className="bg-background h-svh grid grid-cols-1 lg:grid-cols-[0.3fr_0.4fr_0.3fr] grid-flow-row gap-4 p-4 lg:p-6 w-full">
      {selectedGame && <GameFullInfoCard game={selectedGame} />}

      <div className="flex flex-col col-start-2">{memoizedWheel}</div>

      <Card className="col-start-3 h-[468px] lg:max-w-[552px] lg:h-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-roboto-wide-semibold">Случайные игры</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between gap-4 h-full overflow-hidden p-0">
          {gamesLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoaderCircleIcon className="animate-spin text-primary" size={54} />
            </div>
          ) : gamesData?.games && gamesData.games.length > 0 ? (
            <ScrollArea className="h-full overflow-hidden px-4">
              {gamesData.games.map(game => (
                <GameCard
                  key={game.game_id}
                  game={game}
                  isWinner={winner?.game_id === game.game_id}
                  isSelected={selectedGame?.game_id === game.game_id}
                  onClick={onGameCardClick}
                />
              ))}
            </ScrollArea>
          ) : (
            <div className="flex justify-center items-center h-full font-roboto-wide-semibold text-muted-foreground">
              {!gamesData ? 'Пусто' : 'Игры не найдены'}
            </div>
          )}
          <div className="flex gap-2 items-end px-4">
            <div className="w-full space-y-1">
              <div className="text-sm font-roboto-wide-semibold">
                Диапазон времени ({minHours}-{maxHours} часов)
              </div>
              <Slider
                className="h-[36px]"
                min={0}
                max={300}
                value={[minHours, maxHours]}
                onValueChange={values => {
                  setMinHours(values[0]);
                  setMaxHours(values[1]);
                }}
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => saveMutedState(!isMuted)}
                >
                  <Volume muted={isMuted ?? false} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GamesRollerPage;
