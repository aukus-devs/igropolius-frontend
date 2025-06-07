import { UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/lib/api";

export default function LoginDialog({ className }: { className?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mutateAsync: loginRequest } = useMutation({
    mutationFn: async ({ user, pass }: { user: string; pass: string }) => {
      return login(user, pass);
    },
  });

  const handleLogin = () => {
    loginRequest({ user: username, pass: password })
      .then((res) => {
        localStorage.setItem("access-token", res.token);
        queryClient.invalidateQueries({
          queryKey: ["current-player"],
        });
        setOpen(false);
      })
      .catch((err) => {
        if (err.body) {
          setError(JSON.stringify(err.body));
        } else {
          setError(err.message || "Неизвестная ошибка");
        }
      });
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className} onClick={() => setOpen(true)}>
          <UserIcon className="h-4 w-4" />
          Логин
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="" className="w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex flex-col font-black text-[2rem]">
            <div>
              Логин в <span className="text-primary">Игрополиус</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-7">
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="Введите логин"
            className="w-full"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            type="password"
            className="w-full mt-2"
          />
          <Button className="w-full mt-4" onClick={handleLogin}>
            Войти
          </Button>
          {error && <div className="text-red-500 mt-2 text-sm">Ошибка: {error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
