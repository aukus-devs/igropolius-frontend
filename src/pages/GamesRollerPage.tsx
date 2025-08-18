import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { fetchHltbRandomGames } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { HltbGameResponse } from '../lib/api-types-generated';
import { formatHltbLength } from '../lib/utils';
import { sectorsData } from '../lib/mockData';
import Wheel from './Wheel';

const rangeSliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: 2px solid #1f2937;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: 2px solid #1f2937;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-webkit-slider-track {
    background: transparent;
  }

  .slider::-moz-range-track {
    background: transparent;
  }
`;

export default function GamesRollerPage() {
  const [selectedGame, setSelectedGame] = useState<HltbGameResponse | null>(null);
  const [minHours, setMinHours] = useState(1);
  const [maxHours, setMaxHours] = useState(300);
  const [shouldLoadGames, setShouldLoadGames] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleGameClick = (game: HltbGameResponse) => {
    setSelectedGame(game);
    console.log(game.release_world);
    console.log(
      game.release_world !== null && game.release_world !== undefined && game.release_world > 0
    );
  };

  const {
    data: gamesData,
    isFetching: gamesLoading,
    refetch,
  } = useQuery<{ games: HltbGameResponse[] }>({
    queryKey: queryKeys.hltbRandomGames,
    queryFn: () => {
      const selectedSector = sectorsData.find(s => s.id === selectedSectorId);
      const isPrisonSector = selectedSector?.type === 'prison';

      return fetchHltbRandomGames({
        limit: 12,
        min_length: isPrisonSector ? 0 : minHours,
        max_length: isPrisonSector ? 0 : maxHours,
      });
    },
    enabled: shouldLoadGames,
  });

  const handleWheelFinish = (winnerId: string) => {
    const game = gamesData?.games.find(g => String(g.game_id) === winnerId);
    if (game) {
      setSelectedGame(game);
    }
  };

  console.log('Games data:', gamesData);
  console.log('Games loading:', gamesLoading);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-900">
        <style dangerouslySetInnerHTML={{ __html: rangeSliderStyles }} />
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)] p-4 lg:p-6">
            <div className="lg:col-span-1">
              {selectedGame ? (
                <Card className="bg-white/15 backdrop-blur-sm border-transparent h-full overflow-hidden">
                  <CardHeader className="p-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white text-base font-roboto-wide-semibold">
                        Детали игры
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedGame(null)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-y-auto p-2">
                    {selectedGame.game_image && (
                      <div className="text-center">
                        <img
                          src={selectedGame.game_image}
                          alt={selectedGame.game_name}
                          className="w-full max-w-xs rounded-lg mx-auto object-contain"
                          style={{ aspectRatio: 'auto' }}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="text-sm font-roboto-wide-semibold text-white border-b border-white/20 pb-2">
                        Основная информация
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="text-center">
                          <a
                            href={`https://howlongtobeat.com/game/${selectedGame.game_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline text-sm font-medium hover:text-white/80 transition-colors"
                          >
                            {selectedGame.game_name}
                            {selectedGame.release_world !== null &&
                              selectedGame.release_world !== undefined &&
                              selectedGame.release_world > 0 && (
                                <span className="text-white/70">
                                  {' '}
                                  ({selectedGame.release_world})
                                </span>
                              )}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-roboto-wide-semibold text-white border-b border-white/20 pb-2">
                        Время прохождения
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/80">Main Story:</span>
                          <span className="text-white font-mono">
                            {selectedGame.comp_main
                              ? formatHltbLength(selectedGame.comp_main)
                              : 'Н/Д'}
                            {selectedGame.comp_main_count > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-white/60 ml-2 cursor-help">
                                    ({selectedGame.comp_main_count})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество отзывов</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Main + Sides:</span>
                          <span className="text-white font-mono">
                            {selectedGame.comp_plus
                              ? formatHltbLength(selectedGame.comp_plus)
                              : 'Н/Д'}
                            {selectedGame.comp_plus_count > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-white/60 ml-2 cursor-help">
                                    ({selectedGame.comp_plus_count})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество отзывов</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Completionist:</span>
                          <span className="text-white font-mono">
                            {selectedGame.comp_100
                              ? formatHltbLength(selectedGame.comp_100)
                              : 'Н/Д'}
                            {selectedGame.comp_100_count > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-white/60 ml-2 cursor-help">
                                    ({selectedGame.comp_100_count})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество отзывов</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">All Styles:</span>
                          <span className="text-white font-mono">
                            {selectedGame.comp_all
                              ? formatHltbLength(selectedGame.comp_all)
                              : 'Н/Д'}
                            {selectedGame.comp_all_count > 0 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-white/60 ml-2 cursor-help">
                                    ({selectedGame.comp_all_count})
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Количество отзывов</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-sm text-white/60">
                      Синхронизировано с HLTB:{' '}
                      {new Date(selectedGame.updated_at * 1000).toLocaleDateString()}
                    </div>

                    <div className="text-center text-sm text-white/80 pt-2">
                      {selectedGame.profile_platform || 'Платформа не указана'}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/15 backdrop-blur-sm border-transparent h-full overflow-hidden">
                  <CardHeader className="p-2">
                    <CardTitle className="text-white text-base font-roboto-wide-semibold">
                      Выберите игру
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-2">
                    <p className="text-white/80 text-center text-sm">
                      Кликните на игру в списке справа, чтобы увидеть детальную информацию
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white/15 backdrop-blur-sm border-transparent h-full overflow-hidden">
                <CardHeader className="p-2">
                  <CardTitle className="text-white text-base font-roboto-wide-semibold">
                    Настройки фильтра
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-2">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-roboto-wide-semibold">
                      Выберите сектор
                    </label>
                    <select
                      className="w-full p-2 bg-white/15 border-transparent rounded text-white text-sm font-roboto-wide-semibold"
                      onChange={e => {
                        const sectorId = parseInt(e.target.value);
                        setSelectedSectorId(sectorId);
                        if (sectorId > 0) {
                          const sector = sectorsData.find(s => s.id === sectorId);
                          if (sector?.gameLengthRanges) {
                            setMinHours(Math.max(1, sector.gameLengthRanges.min));
                            setMaxHours(sector.gameLengthRanges.max);
                          }
                        }
                      }}
                    >
                      <option value={0} className="bg-gray-800 text-white">
                        Выберите сектор
                      </option>
                      {sectorsData
                        .filter(sector => sector.gameLengthRanges)
                        .map(sector => (
                          <option
                            key={sector.id}
                            value={sector.id}
                            className="bg-gray-800 text-white"
                          >
                            {sector.id}. {sector.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {(() => {
                    const selectedSector = sectorsData.find(s => s.id === selectedSectorId);
                    const isPrisonSector = selectedSector?.type === 'prison';

                    if (isPrisonSector) {
                      return (
                        <div className="text-center text-white/60 text-sm font-roboto-wide-semibold py-4">
                          Для тюремных секторов игры загружаются без ограничений по времени
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <label className="text-white text-sm font-roboto-wide-semibold">
                          Диапазон времени (часы)
                        </label>
                        <div className="space-y-3">
                          <label className="text-white text-sm font-roboto-wide-semibold">
                            Диапазон времени: {minHours}ч - {maxHours}ч
                          </label>

                          <div className="relative w-full h-8 select-none">
                            <div className="absolute w-full h-2 bg-white/20 rounded-lg top-3"></div>
                            <div
                              className="absolute h-2 bg-white rounded-lg top-3 transition-all duration-200"
                              style={{
                                left: `${(minHours / 300) * 100}%`,
                                width: `${((maxHours - minHours) / 300) * 100}%`,
                              }}
                            ></div>

                            <div
                              className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer top-1 -ml-3 hover:scale-110 transition-transform select-none"
                              style={{ left: `${(minHours / 300) * 100}%` }}
                              onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                const startX = e.clientX;
                                const startValue = minHours;
                                const sliderWidth = e.currentTarget.parentElement?.offsetWidth || 0;

                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  moveEvent.preventDefault();
                                  const deltaX = moveEvent.clientX - startX;
                                  const deltaPercent = (deltaX / sliderWidth) * 300;
                                  const newValue = Math.max(
                                    1,
                                    Math.min(maxHours - 1, startValue + deltaPercent)
                                  );
                                  setMinHours(Math.round(newValue));
                                };

                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };

                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            ></div>

                            <div
                              className="absolute w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer top-1 -ml-3 hover:scale-110 transition-transform select-none"
                              style={{ left: `${(maxHours / 300) * 100}%` }}
                              onMouseDown={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                const startX = e.clientX;
                                const startValue = maxHours;
                                const sliderWidth = e.currentTarget.parentElement?.offsetWidth || 0;

                                const handleMouseMove = (moveEvent: MouseEvent) => {
                                  moveEvent.preventDefault();
                                  const deltaX = moveEvent.clientX - startX;
                                  const deltaPercent = (deltaX / sliderWidth) * 300;
                                  const newValue = Math.max(
                                    minHours + 1,
                                    Math.min(300, startValue + deltaPercent)
                                  );
                                  setMaxHours(Math.round(newValue));
                                };

                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };

                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-white text-sm font-roboto-wide-semibold mt-2">
                          <span>{minHours}ч</span>
                          <span>{maxHours}ч</span>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const selectedSector = sectorsData.find(s => s.id === selectedSectorId);
                    const isPrisonSector = selectedSector?.type === 'prison';

                    if (!isPrisonSector) {
                      return (
                        <div className="text-center text-white/60 text-sm font-roboto-wide-semibold">
                          Выбранный диапазон: {minHours}-{maxHours} часов
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        setIsButtonLoading(true);
                        setShouldLoadGames(true);
                        refetch().finally(() => {
                          setIsButtonLoading(false);
                        });
                      }}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-roboto-wide-semibold"
                      disabled={gamesLoading || isButtonLoading}
                    >
                      {isButtonLoading || gamesLoading ? 'Загрузка...' : 'Заролить'}
                    </Button>
                  </div>
                  {!gamesLoading && (
                    <div className="flex justify-center">
                      <WheelWrapper games={gamesData?.games || []} onFinish={handleWheelFinish} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white/15 backdrop-blur-sm border-transparent h-full overflow-hidden">
                <CardHeader className="p-2">
                  <CardTitle className="text-white text-base font-roboto-wide-semibold">
                    Случайные игры
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 overflow-y-auto">
                  {gamesLoading ? (
                    <div className="text-white/80 text-center py-4 text-sm font-roboto-wide-semibold">
                      Загрузка игр...
                    </div>
                  ) : gamesData?.games && gamesData.games.length > 0 ? (
                    <div className="space-y-1">
                      {gamesData.games.map((game: HltbGameResponse) => (
                        <div
                          key={game.game_id}
                          className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                            selectedGame?.game_id === game.game_id
                              ? 'bg-white/20 border border-white/30'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                          onClick={() => handleGameClick(game)}
                        >
                          <div className="flex-shrink-0">
                            {game.game_image ? (
                              <img
                                src={game.game_image}
                                alt={game.game_name}
                                className="w-20 h-[42px] rounded object-cover"
                                onError={e => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-20 h-[42px] rounded bg-gray-600 flex items-center justify-center">
                                <span className="text-white text-sm">🎮</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-white font-roboto-wide-semibold text-sm truncate"
                              title={game.game_name}
                            >
                              {game.game_name}

                              {game.release_world !== null &&
                                game.release_world !== undefined &&
                                game.release_world > 0 && (
                                  <span className="text-white/70"> ({game.release_world})</span>
                                )}
                            </h3>
                            {game.profile_platform && (
                              <p className="text-white/60 text-sm truncate font-roboto-wide-semibold">
                                {game.profile_platform}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !shouldLoadGames ? (
                    <div className="text-white/80 text-center py-4 text-sm font-roboto-wide-semibold">
                      Пусто
                    </div>
                  ) : (
                    <div className="text-white/80 text-center py-4 text-sm font-roboto-wide-semibold">
                      Игры не найдены
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function WheelWrapper({
  games,
  onFinish,
}: {
  games: HltbGameResponse[];
  onFinish: (id: string) => void;
}) {
  const options = games.map(game => ({
    id: String(game.game_id),
    label: game.game_name,
  }));

  if (options.length === 0) {
    return null;
  }

  return <Wheel entries={options} onSpinEnd={onFinish} startOnRender />;
}
