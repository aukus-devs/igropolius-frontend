import { useShallow } from 'zustand/shallow';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import usePlayerStore from '@/stores/playerStore';
import useAdminStore from '@/stores/adminStore';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';
import { Button } from '../ui/button';
import { resetDb } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

export default function AdminPanel() {
  const { myPlayer, players } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      players: state.players,
    }))
  );

  const { actingUserId, setActingUserId } = useAdminStore(
    useShallow(state => ({
      actingUserId: state.actingUserId,
      setActingUserId: state.setActingUserId,
    }))
  );

  const handleSelectChange = (value: string) => {
    const selectedPlayer = players.find(player => String(player.id) === value);
    console.log({ selectedPlayer });
    if (selectedPlayer) {
      setActingUserId(selectedPlayer.id);
    } else {
      setActingUserId(null); // Reset if no player is selected
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
  };

  const defaultValue = myPlayer ? String(myPlayer.id) : undefined;

  return (
    <Card className="p-2" style={{ width: '300px' }}>
      <div>Admin panel</div>
      <div className="flex gap-2">
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
      <div>
        <Button onClick={handleResetDb} disabled={isPending} className="bg-red-700">
          Обнулить бд
        </Button>
      </div>
    </Card>
  );
}
