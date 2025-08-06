import { useShallow } from 'zustand/shallow';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import usePlayerStore from '@/stores/playerStore';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';
import { Button } from '../ui/button';
import { resetDb } from '@/lib/api';
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

  const handleSelectChange = (value: string) => {
    const selectedPlayer = players.find(player => String(player.id) === value);
    console.log({ selectedPlayer });
    if (selectedPlayer) {
      setActingUserId(selectedPlayer.id);
    } else {
      setActingUserId(null);
    }
    resetCurrentPlayerQuery();
  };

  const { mutateAsync: doReset, isPending } = useMutation({
    mutationFn: resetDb,
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

  useEffect(() => {
    if (showResetDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showResetDialog, countdown]);

  const defaultValue = myPlayer ? String(myPlayer.id) : undefined;

  return (
    <>
      <Card className="p-2" style={{ width: '300px' }}>
        <div className="flex items-center justify-between">
          <div>Admin panel</div>
          <Button variant="ghost" size="sm" onClick={toggleCollapse} className="h-6 w-6 p-0">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        {!isCollapsed && (
          <>
            <div className="flex gap-2 mt-2">
              Игрок для действий:
              <Select
                defaultValue={defaultValue}
                onValueChange={handleSelectChange}
                value={String(actingUserId ?? defaultValue)}
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
            <div className="mt-2">
              <Button onClick={handleOpenResetDialog} disabled={isPending} className="bg-red-700">
                Обнулить бд
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
