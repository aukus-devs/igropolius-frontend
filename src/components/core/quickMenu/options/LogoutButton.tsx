import { useMutation } from '@tanstack/react-query';
import { logout } from '@/lib/api';
import { removeCurrentPlayerQuery, removeNotificationsQuery } from '@/lib/queryClient';
import useSystemStore from '@/stores/systemStore';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import { LogOut } from '@/components/icons';

export function LogoutButton({ className }: { className?: string }) {
  const { setAccessToken, setMyUser } = useSystemStore(
    useShallow(state => ({
      setAccessToken: state.setAccessToken,
      setMyUser: state.setMyUser,
    }))
  );

  const { setMyPlayer, setTurnState } = usePlayerStore(
    useShallow(state => ({
      setMyPlayer: state.setMyPlayer,
      setTurnState: state.setTurnState,
    }))
  );

  const { mutateAsync: logoutRequest } = useMutation({
    mutationFn: logout,
  });

  const handleLogout = () => {
    logoutRequest().then(() => {
      setAccessToken(null);
      setMyUser(null);
      setMyPlayer(undefined);
      setTurnState(null);

      removeCurrentPlayerQuery();
      removeNotificationsQuery();
      localStorage.removeItem('access-token');
    });
  };

  return (
    <Button variant="outline" className={className} onClick={handleLogout}>
      <LogOut />
      <span>Выйти</span>
    </Button>
  );
}
