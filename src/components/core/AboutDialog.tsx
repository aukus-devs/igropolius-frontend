import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

type Props = {
  styles?: string;
  open?: boolean;
  hideTrigger?: boolean;
};

export default function AboutDialog({ styles, open, hideTrigger }: Props) {
  const [isOpen, setIsOpen] = useState(Boolean(open));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" className={styles}>
            Об ивенте
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[37.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Об ивенте</DialogTitle>
        </DialogHeader>
        Игрополис — это увлекательный ивент, где популярные стримеры соревнуются друг с другом,
        проходя различные игры. Каждый участник бросает кубик, чтобы сделать ход по специальной
        игровой карте, выполняет задания и стремится первым достичь финиша.
        <br />
        <br />
        Побеждает тот, кто проявит ловкость, смекалку и удачу, чтобы обойти соперников и стать
        чемпионом Игрополиса!
      </DialogContent>
    </Dialog>
  );
}
