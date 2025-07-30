import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/lib/api';
import { resetCurrentPlayerQuery } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Person } from '@/components/icons';

export default function LoginDialog({ className }: { className?: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: loginRequest } = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return login({ username, password });
    },
  });

  const handleLogin = () => {
    loginRequest({ username, password })
      .then(res => {
        localStorage.setItem('access-token', res.token);
        resetCurrentPlayerQuery();
        setOpen(false);
        window.location.reload();
      })
      .catch(err => {
        if (err.body) {
          setError(JSON.stringify(err.body));
        } else {
          setError(err.message || 'Неизвестная ошибка');
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: 'outline' }), className)}
        onClick={() => setOpen(true)}
      >
        <Person />
        Логин
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
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            value={username}
            placeholder="Введите логин"
            className="w-full"
          />
          <Input
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
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
