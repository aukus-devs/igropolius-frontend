import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { fetchHltbRandomGames } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { HltbGameResponse } from '../lib/api-types-generated';
import { formatHltbLength, getNoun } from '../lib/utils';
import { CrownIcon, LoaderCircleIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import ImageLoader from '@/components/core/ImageLoader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Wheel from './Wheel';
import { useLocation } from 'react-router';
import { ArrowRight, Volume } from '@/components/icons';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Switch } from '@/components/ui/switch';

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
          className="font-roboto-wide-semibold"
          title={game.game_name}
        >
          {title}
        </h3>
        {game.profile_platform && (
          <p className="text-muted-foreground text-xs font-semibold">
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
    <Card className="row-start-2 lg:row-start-1 lg:col-start-1 animate-in fade-in-0 duration-300 justify-self-end w-full overflow-hidden">
      <CardHeader className="flex justify-between items-center gap-2">
        <CardTitle className="font-roboto-wide-semibold text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full justify-between gap-2 space-y-2.5 overflow-hidden p-0">
        <div className="flex gap-2.5 px-4">
          <ImageLoader
            className="shrink-0 w-[85px] h-fit rounded-md overflow-hidden"
            src={game.game_image}
            alt={game.game_name}
          />
          <div className="relative w-full">
            <ScrollArea className=" h-[127.5px] px-2 bg-muted rounded-md">
              <div className="whitespace-pre-wrap text-sm font-semibold py-2">
                {game.description || 'Нет описания'}
              </div>
            </ScrollArea>
            {game.description && (
              <Button
                variant="outline"
                className="absolute top-[calc(100%_+_0.5rem)] right-0 bg-[#323232] border-0 py-1 px-4 h-auto text-sm leading-[17px]"
                onClick={() =>
                  window.open(
                    `https://translate.google.com/?sl=en&tl=ru&text=${encodeURIComponent(game.description || '')}`,
                    '_blank'
                  )
                }
              >
                Перевести
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-full overflow-hidden px-4">
          <div className="space-y-[15px] w-full">
            {table.map(({ title, value, polledText, polledColor }, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">{title}</span>

                <div className="flex flex-wrap gap-2">
                  <Badge className="tabular-nums py-1 px-1.5 text-base rounded-lg bg-white/20 text-white/70 font-semibold">
                    {value}
                  </Badge>
                  <Badge className={`${polledColor.bg} ${polledColor.text} transition-none py-1 px-1.5 text-base rounded-lg`}>
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
                    <Badge key={index} className="bg-white/20 text-white/70 font-semibold py-1 px-1.5 text-base rounded-lg">
                      {platform}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Платформы не указана</div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground font-semibold">Жанры</span>
              {genres && genres.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {genres.map((genre, index) => (
                    <Badge key={index} className="bg-white/10 text-white/70 font-semibold py-1 px-1.5 text-base rounded-lg">
                      {genre}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Жанры не указаны</div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-[15px]">
        <div className="space-x-2">
          <Button
            variant="outline"
            className="bg-[#323232] border-0 !px-6"
            onClick={() =>
              window.open(`https://howlongtobeat.com/game/${game.game_id}`, '_blank')
            }
          >
            HLTB
            <ArrowRight className="size-[19px]" />
          </Button>
          {Number(game.steam_id) > 0 && (
            <Button
              variant="outline"
              className="bg-[#323232] border-0 !px-6"
              onClick={() =>
                window.open(`https://store.steampowered.com/app/${game.steam_id}`, '_blank')
              }
            >
              Steam
              <ArrowRight className="size-[19px]" />
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">Синхронизировано с HLTB: {syncDate}</div>
      </CardFooter>
    </Card>
  );
}

const BIG_RANGE_LIMIT = 300;
const SMALL_RANGE_LIMIT = 50;

function GamesRollerPage() {
  const [selectedGame, setSelectedGame] = useState<HltbGameResponse | null>(null);
  const [winner, setWinner] = useState<HltbGameResponse | null>(null);
  const [minHours, setMinHours] = useState(0);
  const [maxHours, setMaxHours] = useState(SMALL_RANGE_LIMIT);
  const [bigRange, setBigRange] = useState(false);

  useEffect(() => {
    if (!bigRange) {
      if (maxHours > SMALL_RANGE_LIMIT) {
        setMaxHours(SMALL_RANGE_LIMIT);
      }
      if (minHours >= SMALL_RANGE_LIMIT) {
        setMinHours(0);
      }
    }
  }, [bigRange, maxHours, minHours]);

  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const urlParamMin = urlParams.get('min');
  const urlParamMax = urlParams.get('max');

  const { value: isMuted, save: saveMutedState } = useLocalStorage({
    key: 'roller-sound-muted',
    defaultValue: false,
  });

  const maxLimit = bigRange ? BIG_RANGE_LIMIT : SMALL_RANGE_LIMIT;

  useEffect(() => {
    if (urlParamMin) {
      const parsedMin = parseInt(urlParamMin, 10);
      if (!isNaN(parsedMin) && parsedMin >= 0 && parsedMin <= maxLimit) {
        setMinHours(parsedMin);
      }
    }
  }, [urlParamMin, maxLimit]);

  useEffect(() => {
    if (urlParamMax) {
      const parsedMax = parseInt(urlParamMax, 10);
      if (!isNaN(parsedMax) && parsedMax >= minHours) {
        setMaxHours(parsedMax);
        if (parsedMax > SMALL_RANGE_LIMIT) {
          setBigRange(true);
          if (parsedMax > BIG_RANGE_LIMIT) {
            setMaxHours(BIG_RANGE_LIMIT);
          }
        }
      }
    }
  }, [urlParamMax, minHours, maxLimit]);

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
        highlightedItemId={selectedGame?.game_id}
      />
    );
  }, [gamesData, onSpinFinish, onSpinStart, selectedGame?.game_id]);

  return (
    <div className="flex items-center justify-center bg-background lg:h-svh h-auto">
      <div className="grid grid-cols-1 max-h-auto lg:w-full lg:h-full lg:max-h-[1080px] lg:max-w-[1920px] lg:grid-cols-[0.3fr_0.4fr_0.3fr] gap-4 p-4 lg:p-6 w-full">
        {selectedGame && <GameFullInfoCard game={selectedGame} />}

        <div className="flex flex-col row-start-1 lg:col-start-2">
          <div className="text-5xl text-center text-primary">Новое колесо</div>
          {memoizedWheel}

          <Card>
            <CardContent>
              <div className="flex justify-between font-semibold">
                Диапазон времени ({minHours}-{maxHours} часов)
                <div className="flex items-center gap-2">
                  <span>Большой</span>
                  <Switch checked={bigRange} onCheckedChange={() => setBigRange(!bigRange)} />
                </div>
              </div>
              <Slider
                className="h-[36px]"
                min={0}
                max={maxLimit}
                value={[minHours, maxHours]}
                onValueChange={values => {
                  setMinHours(values[0]);
                  setMaxHours(values[1]);
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="row-start-3 lg:col-start-3 lg:row-start-1 h-[468px] lg:h-full overflow-hidden pb-0">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-xl font-roboto-wide-semibold">
              <div>Случайные игры</div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-white/20 hover:bg-white/10 border-0"
                onClick={() => saveMutedState(!isMuted)}
              >
                <Volume muted={isMuted ?? false} className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full overflow-hidden p-0">
            {gamesLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoaderCircleIcon className="animate-spin text-primary" size={54} />
              </div>
            ) : gamesData?.games && gamesData.games.length > 0 ? (
              <ScrollArea className="h-full overflow-hidden px-4">
                <div className="py-4">
                  {gamesData.games.map(game => (
                    <GameCard
                      key={game.game_id}
                      game={game}
                      isWinner={winner?.game_id === game.game_id}
                      isSelected={selectedGame?.game_id === game.game_id}
                      onClick={onGameCardClick}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex justify-center items-center h-full font-roboto-wide-semibold text-muted-foreground">
                {!gamesData ? 'Пусто' : 'Игры не найдены'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GamesRollerPage;
