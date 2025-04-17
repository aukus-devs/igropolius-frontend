import { ChevronDownIcon, HeartIcon, NotebookTextIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const sharedStyles =
  "justify-start w-full text-base font-semibold rounded-xl px-3 py-2 backdrop-blur-[1.5rem] bg-card/60 border-none";

function QuickMenu() {
  // const menuButtons = [
  //   { icon: NotebookTextIcon, text: "Правила" },
  //   { icon: HeartIcon, text: "Привязать поинтаук" },
  // ]

  return (
    <>
      <Collapsible className="w-full space-y-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className={cn(sharedStyles, "justify-between")}>
            <div className="flex gap-2 items-center font-bold">
              <Avatar className="w-6 h-6">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-yellow-500">LA</AvatarFallback>
              </Avatar>
              Игрок
            </div>
            <div className="flex gap-1 items-center font-semibold text-muted-foreground">
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
            <DialogContent className="w-[37.5rem] h-[41.25rem]">
              <DialogHeader>
                <DialogTitle className="font-black text-[2rem]">
                  Добро пожаловать в Millionaire Boys Club, Roadhouse
                </DialogTitle>

                {/* Mutes console warning */}
                <DialogDescription className="sr-only">
                  Добро пожаловать в Millionaire Boys Club, Roadhouse
                </DialogDescription>
              </DialogHeader>
              <div></div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className={sharedStyles}>
            <HeartIcon className="h-4 w-4" />
            Привязать поинтаук
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

export default QuickMenu;
