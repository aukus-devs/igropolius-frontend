import { useMutation } from "@tanstack/react-query";
import { UserIcon } from "lucide-react";
import { logout } from "@/lib/api";
import { resetCurrentPlayerQuery } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

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
      <UserIcon className="h-4 w-4" />
      <span className="text-red-400">Выйти</span>
    </Button>
  );
}
