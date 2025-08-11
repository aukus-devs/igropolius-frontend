import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditsData } from '@/lib/mockData';
import { Event } from '@/components/icons';
import useLocalStorage from '@/hooks/useLocalStorage';
import usePlayerStore from '@/stores/playerStore';
import { useEffect } from 'react';
import useUrlPath from '@/hooks/useUrlPath';
import { Github } from 'lucide-react';
import { Link } from 'react-router';
import Boosty from '@/components/icons/Boosty';

type Props = {
  className?: string;
};

export default function AboutDialog({ className }: Props) {
  const { value: firstTimeVisit, save: saveFirstTimeVisit } = useLocalStorage({
    key: 'first-time-visit',
    defaultValue: true,
  });

  const { activate, pathActive } = useUrlPath('/about');

  const myPlayer = usePlayerStore(state => state.myPlayer);

  useEffect(() => {
    saveFirstTimeVisit(false);
    if (firstTimeVisit) {
      activate(true);
    }
  }, [saveFirstTimeVisit, activate, firstTimeVisit]);

  return (
    <Dialog open={pathActive} onOpenChange={activate}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <Event />
        Об ивенте
      </DialogTrigger>
      <DialogContent className="w-[600px] p-0 h-[calc(100dvh_-_74px)]" aria-describedby="">
        <ScrollArea className="max-h-[700px] px-5">
          <DialogHeader className="pt-5 pb-4">
            <DialogTitle className="text-[32px] font-wide-black leading-[38px]">
              Добро пожаловать в Игрополиус,
              <span className="text-primary"> {myPlayer?.username || 'Зритель'}</span>
            </DialogTitle>
          </DialogHeader>

          <p className="font-semibold">
            Игрополиус — это увлекательный ивент, где стримеры соревнуются друг с другом, проходя
            различные игры. Каждый участник бросает кубики, чтобы сделать ход по специальной игровой
            карте, строит здания, зарабатывает очки и бонусы, стремясь стать самым влиятельным!
          </p>

          <div className="mt-20 mb-[30px] text-3xl font-wide-black">
            Команда разработки Игрополиуса
          </div>
          <div className="pb-5">
            <div className="flex gap-2 flex-col">
              <div className="mt-[30px] text-xl font-wide-black">Программирование</div>
              {CreditsData.developers.map((dev, index) => (
                <div key={index} className="text-base font-wide-medium">
                  {dev}
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-col">
              <div className="mt-[50px] text-xl font-wide-black">Дизайн</div>
              {CreditsData.designers.map((dev, index) => (
                <div key={index} className="text-base font-wide-medium">
                  {dev}
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-col">
              <div className="mt-[50px] text-xl font-wide-black">Аналитики</div>
              {CreditsData.testers.map((dev, index) => (
                <div key={index} className="text-base font-wide-medium">
                  {dev}
                </div>
              ))}
            </div>

            <div className="mt-[50px] text-xl font-wide-black">Идеи</div>
            <div className="mt-[10px] font-wide-medium">Praden</div>
          </div>

          <div className="mt-10 mb-[30px] text-xl font-wide-black flex gap-2">
            <Link
              to="https://github.com/aukus-devs/igropolius-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Github className="inline mr-2" />
            </Link>
            <Link
              to="https://boosty.to/aukus"
              className="flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Boosty className="inline mr-2 w-5" fill="white" />
            </Link>
          </div>
          <div className="mb-20"></div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
