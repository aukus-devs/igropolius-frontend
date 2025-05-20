import {
  BoxIcon,
  ChevronDownIcon,
  HeartIcon,
  NotebookTextIcon,
  SquareIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import usePlayerStore from "@/stores/playerStore";
import useCameraStore from "@/stores/cameraStore";
import { ScrollArea } from "../ui/scroll-area";
import RulesTabs from "./rules/RulesTabs";

const sharedStyles =
  "justify-start w-full text-base font-semibold rounded-xl px-3 py-2 backdrop-blur-[1.5rem] bg-card/70 border-none";

function ToggleOrthographic() {
  const toggleOrthographic = useCameraStore((state) => state.toggleOrthographic);
  const isOrthographic = useCameraStore((state) => state.isOrthographic);

  return (
    <Button variant="outline" className={sharedStyles} onClick={toggleOrthographic}>
      {isOrthographic ? (
        <>
          <BoxIcon className="h-4 w-4" />
          3D
        </>
      ) : (
        <>
          <SquareIcon className="h-4 w-4" />
          Вид сверху
        </>
      )}
    </Button>
  );
}

function QuickMenu() {
  const myPlayer = usePlayerStore((state) => state.myPlayer);

  const playerName = myPlayer ? myPlayer.nickname : "Зритель";

  return (
    <>
      <Collapsible className="w-full space-y-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className={cn(sharedStyles, "justify-between")}>
            {myPlayer && (
              <div className="flex gap-2 items-center font-bold">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary-foreground uppercase">
                    {myPlayer.nickname.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {myPlayer.nickname}
              </div>
            )}
            <div
              className={`flex gap-1 items-center font-semibold text-muted-foreground ${myPlayer ? "" : "justify-between w-full"}`}
            >
              Меню
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className={sharedStyles}>
                <NotebookTextIcon className="h-4 w-4" />
                Правила
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[37.5rem] h-[41.25rem]" aria-describedby="">
              <ScrollArea className="h-full w-full overflow-auto">
                <DialogHeader className="w-full">
                  <DialogTitle className="flex flex-col font-black text-[2rem]">
                    <div>
                      Добро пожаловать в <span className="text-primary">Игрополиус</span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-7">
                  <RulesTabs />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className={sharedStyles}>
            <HeartIcon className="h-4 w-4" />
            Привязать поинтаук
          </Button>

          <ToggleOrthographic />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

export default QuickMenu;
