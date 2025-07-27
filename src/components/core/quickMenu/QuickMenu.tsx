import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import usePlayerStore from "@/stores/playerStore";
import DevelopersDialog from "./options/DevelopersDialog";
import OrthographicToggle from "./options/OrthographicToggle";
import RulesDialog from "./options/RulesDialog";
import Countdown from "./options/Countdown";
import { PlayerData } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../Collapsible";
import LoginDialog from "./options/LoginDialog";
import { LogoutButton } from "./options/LogoutButton";
import { Separator } from "@/components/ui/separator";
import { Sort } from "@/components/icons";
import { FALLBACK_AVATAR_URL } from "@/lib/constants";
import TutorialDialog from "./options/TutorialDialog";

const buttonStyle =
  "justify-start bg-transparent font-semibold text-base w-full rounded-none border-none";
const groupStyle =
  "flex flex-col items-center w-full rounded-[10px] backdrop-blur-[1.5rem] bg-card/70 overflow-hidden shrink-0 first:mt-[5px]";

function QuickMenuTitle({ myPlayer }: { myPlayer: PlayerData | null }) {
  return (
    <>
      {myPlayer ? (
        <div className="flex gap-2 items-center font-bold text-base">
          <Avatar className="w-6 h-6">
            <AvatarImage src={myPlayer.avatar_link || FALLBACK_AVATAR_URL} />
            <AvatarFallback className="bg-primary-foreground uppercase">
              {myPlayer.username.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span>{myPlayer.username}</span>
        </div>
      ) : (
        <div className="flex gap-2 items-center font-bold pl-[7px] text-base">
          <Sort />
          Быстрый доступ
        </div>
      )}
    </>
  );
}

function QuickMenu() {
  const myPlayer = usePlayerStore((state) => state.myPlayer);

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full">
        <QuickMenuTitle myPlayer={myPlayer} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={groupStyle}>
          <Countdown className={cn(buttonStyle, "px-4 py-1.5")} />
        </div>

        <div className={groupStyle}>
          <TutorialDialog className={buttonStyle} />
          <RulesDialog className={buttonStyle} />
          <Separator />
          <DevelopersDialog className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          <OrthographicToggle className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          {myPlayer ? (
            <LogoutButton className={buttonStyle} />
          ) : (
            <LoginDialog className={buttonStyle} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default QuickMenu;
