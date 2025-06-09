import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { UserIcon } from "lucide-react";
import { logout } from "@/lib/api";
import { resetCurrentPlayerQuery } from "@/lib/queryClient";

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
      <span className="text-red-600">Выйти</span>
    </Button>
  );
}
