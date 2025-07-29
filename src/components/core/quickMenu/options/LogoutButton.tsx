import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/api";
import { resetCurrentPlayerQuery } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Person } from "@/components/icons";

export function LogoutButton({ className }: { className?: string }) {
  const { mutateAsync: logoutRequest } = useMutation({
    mutationFn: logout,
  });

  const handleLogout = () => {
    logoutRequest().then(() => {
      localStorage.removeItem("access-token");
      resetCurrentPlayerQuery();
    });
  };

  return (
    <Button variant="outline" className={className} onClick={handleLogout}>
      <Person />
      <span>Выйти</span>
    </Button>
  );
}
