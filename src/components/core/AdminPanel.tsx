import { useShallow } from 'zustand/shallow';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import usePlayerStore from '@/stores/playerStore';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';
import { Button } from '../ui/button';
import { resetDb, updatePlayerInternal } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import useSystemStore from '@/stores/systemStore';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ChevronUp, ChevronDown } from '../icons';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { frontendCardsData } from '@/lib/mockData';
import { MainBonusCardType, PlayerTurnState } from '@/lib/api-types-generated';

export default function AdminPanel() {
  const { myPlayer, players } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      players: state.players,
    }))
  );

  const { actingUserId, setActingUserId } = useSystemStore(
    useShallow(state => ({
      actingUserId: state.actingUserId,
      setActingUserId: state.setActingUserId,
    }))
  );

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { value: isCollapsed, save: setIsCollapsed } = useLocalStorage({
    key: 'admin-panel-collapsed',
    defaultValue: false,
  });

  const [newSectorId, setNewSectorId] = useState<string>('');
  const [selectedBonusCard, setSelectedBonusCard] = useState<MainBonusCardType | 'none'>('none');
  const [selectedTurnState, setSelectedTurnState] = useState<PlayerTurnState | 'none'>('none');

  const selectedPlayer = players.find(player => player.id === actingUserId);

  const handleSelectChange = (value: string) => {
    const player = players.find(player => String(player.id) === value);
    if (player) {
      setActingUserId(player.id);
      setNewSectorId(String(player.sector_id));
      setSelectedTurnState('none');
    } else {
      setActingUserId(null);
      setNewSectorId('');
      setSelectedTurnState('none');
    }
    resetCurrentPlayerQuery();
  };

  const { mutateAsync: doReset, isPending } = useMutation({
    mutationFn: resetDb,
  });

  const { mutateAsync: updatePlayer, isPending: isUpdatingPlayer } = useMutation({
    mutationFn: updatePlayerInternal,
    onSuccess: () => {
      resetPlayersQuery();
      resetCurrentPlayerQuery();
      setNewSectorId('');
      setSelectedBonusCard('none');
      setSelectedTurnState('none');
    },
  });

  const handleResetDb = async () => {
    await doReset();
    resetPlayersQuery();
    resetCurrentPlayerQuery();
    setShowResetDialog(false);
    setCountdown(3);
  };

  const handleOpenResetDialog = () => {
    setShowResetDialog(true);
    setCountdown(3);
  };

  const handleCloseResetDialog = () => {
    setShowResetDialog(false);
    setCountdown(3);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleUpdatePlayer = async () => {
    if (!actingUserId) return;

    const request: any = { player_id: actingUserId };

    if (newSectorId) {
      request.sector_id = parseInt(newSectorId);
    }
    if (selectedBonusCard !== 'none') {
      request.bonus_card = selectedBonusCard;
    }
    if (selectedTurnState !== 'none') {
      request.turn_state = selectedTurnState;
    }

    await updatePlayer(request);
  };

  useEffect(() => {
    if (showResetDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showResetDialog, countdown]);

  useEffect(() => {
    if (!actingUserId && myPlayer) {
      setActingUserId(myPlayer.id);
    }
  }, [actingUserId, myPlayer, setActingUserId]);

  useEffect(() => {
    if (actingUserId && players.length > 0) {
      const player = players.find(player => player.id === actingUserId);
      if (player) {
        setNewSectorId(String(player.sector_id));
        setSelectedTurnState('none');
      }
    }
  }, [actingUserId, players]);

  const bonusCardOptions = Object.entries(frontendCardsData).map(([type, data]) => ({
    value: type as MainBonusCardType,
    label: data.name,
  }));

  const turnStateOptions = [
    { value: 'rolling-dice' as PlayerTurnState, label: 'Бросок кубиков' },
    { value: 'using-dice-bonuses' as PlayerTurnState, label: 'Использование бонусов кубиков' },
    { value: 'using-prison-bonuses' as PlayerTurnState, label: 'Использование тюремных бонусов' },
    { value: 'rolling-bonus-card' as PlayerTurnState, label: 'Ролл бонусной карты' },
    { value: 'filling-game-review' as PlayerTurnState, label: 'Заполнение отзыва об игре' },
    {
      value: 'using-map-tax-bonuses' as PlayerTurnState,
      label: 'Использование бонусов налога карты',
    },
    {
      value: 'using-street-tax-bonuses' as PlayerTurnState,
      label: 'Использование бонусов налога улицы',
    },
    {
      value: 'dropping-card-after-game-drop' as PlayerTurnState,
      label: 'Сброс карты после дропа игры',
    },
    {
      value: 'dropping-card-after-instant-roll' as PlayerTurnState,
      label: 'Сброс карты после инстант ролла',
    },
    { value: 'entering-prison' as PlayerTurnState, label: 'Вход в тюрьму' },
    { value: 'stealing-bonus-card' as PlayerTurnState, label: 'Кража бонусной карты' },
    { value: 'choosing-building-sector' as PlayerTurnState, label: 'Выбор сектора для постройки' },
  ];

  return (
    <>
      <Card className="p-2" style={{ width: '250px' }}>
        <div className="flex items-center justify-between">
          <div>Admin panel</div>
          <Button variant="ghost" size="sm" onClick={toggleCollapse} className="h-6 w-6 p-0">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        {!isCollapsed && (
          <>
            <div className="mt-2">
              <div className="mb-2">Игрок для действий:</div>
              <Select
                value={actingUserId ? String(actingUserId) : undefined}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Игрок" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={String(player.id)}>
                      {player.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {actingUserId && (
              <>
                <div className="space-y-3">
                  {selectedPlayer && (
                    <div className="text-sm">Текущий сектор: {selectedPlayer.sector_id}</div>
                  )}

                  <div>
                    <Label htmlFor="sector-id" className="mb-2 block">
                      Новый сектор:
                    </Label>
                    <Input
                      id="sector-id"
                      value={newSectorId}
                      onChange={e => setNewSectorId(e.target.value)}
                      placeholder="Номер сектора"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bonus-card" className="mb-2 block">
                      Выдать бонусную карту:
                    </Label>
                    <Select
                      value={selectedBonusCard}
                      onValueChange={value =>
                        setSelectedBonusCard(value as MainBonusCardType | 'none')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите карту" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Нет</SelectItem>
                        {bonusCardOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="turn-state" className="mb-2 block">
                      Состояние хода:
                    </Label>
                    <Select
                      value={selectedTurnState}
                      onValueChange={value =>
                        setSelectedTurnState(value as PlayerTurnState | 'none')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите состояние" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не изменять</SelectItem>
                        {turnStateOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleUpdatePlayer}
                    disabled={
                      isUpdatingPlayer ||
                      (!newSectorId && selectedBonusCard === 'none' && selectedTurnState === 'none')
                    }
                    className="w-full"
                  >
                    {isUpdatingPlayer ? 'Обновление...' : 'Обновить игрока'}
                  </Button>
                </div>
              </>
            )}

            <div>
              <Button
                onClick={handleOpenResetDialog}
                disabled={isPending}
                className="bg-red-700 w-full"
              >
                Обнулить БД(для всех игроков)
              </Button>
            </div>
          </>
        )}
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение обнуления БД</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите обнулить базу данных? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseResetDialog}>
              Отмена
            </Button>
            <Button
              onClick={handleResetDb}
              disabled={countdown > 0 || isPending}
              className="bg-red-700 hover:bg-red-800"
            >
              {countdown > 0 ? `Обнулить (${countdown})` : 'Обнулить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
