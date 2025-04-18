import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZapIcon } from "lucide-react";

type Props = {
  name: string;
  avatar: string;
  placement: number;
  pointsAmount: number;
}

function PlayerDialogTrigger({ name, avatar, placement, pointsAmount }: Props) {
  const points = pointsAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div
      className={cn(buttonVariants({ variant: "outline" }), "relative z-20 flex-row gap-2 rounded-xl p-2 w-[16.75rem] h-auto items-center select-none cursor-pointer text-base text-foreground font-semibold backdrop-blur-[1.5rem] bg-card/60 border-none")}
    >
      <div className="relative">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar} />
          <AvatarFallback className="uppercase">{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500"></span>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between text-base">
          <div className="font-bold">
            <span className="text-muted-foreground">{placement} · </span>
            <span>{name}</span>
          </div>
          <div className="flex text-muted-foreground items-center gap-1 font-semibold">
            {points} <ZapIcon size="1rem" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground self-start font-semibold">Проводит аукцион</div>
      </div>
    </div>
  )
}

export default PlayerDialogTrigger;
