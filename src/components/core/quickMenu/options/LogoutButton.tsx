import { useMutation } from '@tanstack/react-query';
import { logout } from '@/lib/api';
import { resetCurrentPlayerQuery } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Person } from '@/components/icons';
import usePlayerStore from '@/stores/playerStore';
import useAdminStore from '@/stores/adminStore';

export function LogoutButton({ className }: { className?: string }) {
  const { mutateAsync: logoutRequest } = useMutation({
    mutationFn: logout,
  });
  const setMyPlayer = usePlayerStore(state => state.setMyPlayer);
  const setShowAdminPanel = useAdminStore(state => state.setShowAdminPanel);

  const handleLogout = () => {
    logoutRequest().then(() => {
      localStorage.removeItem('access-token');
      resetCurrentPlayerQuery();
      setMyPlayer(undefined);
      setShowAdminPanel(false);
    });
  };

  return (
    <Button variant="outline" className={className} onClick={handleLogout}>
      <Person />
      <span>Выйти</span>
    </Button>
  );
}
