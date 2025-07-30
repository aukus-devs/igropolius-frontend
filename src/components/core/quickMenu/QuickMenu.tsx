import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import usePlayerStore from '@/stores/playerStore';
import DevelopersDialog from './options/DevelopersDialog';
import OrthographicToggle from './options/OrthographicToggle';
import RulesDialog from './options/RulesDialog';
import Countdown from './options/Countdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import LoginDialog from './options/LoginDialog';
import { LogoutButton } from './options/LogoutButton';
import { Separator } from '@/components/ui/separator';
import { Sort } from '@/components/icons';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';
import TutorialDialog from './options/TutorialDialog';
import { PlayerDetails } from '@/lib/api-types-generated';
import Clock from '../Clock';

const buttonStyle =
  'flex items-center justify-start max-h-9 bg-transparent font-semibold text-base w-full rounded-none border-none px-3 py-2';
const groupStyle =
  'flex flex-col items-center w-full rounded-[10px] backdrop-blur-[1.5rem] bg-card/70 overflow-hidden shrink-0 first:mt-[5px]';

function QuickMenuTitle({ myPlayer }: { myPlayer: PlayerDetails | null }) {
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
  const myPlayer = usePlayerStore(state => state.myPlayer);

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full">
        <QuickMenuTitle myPlayer={myPlayer} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={groupStyle}>
          <div className={cn(buttonStyle, 'whitespace-pre')}>
            Время — <Clock /> MSK
          </div>
          <Separator />
          <Countdown className={buttonStyle} />
        </div>

        <div className={groupStyle}>
          <RulesDialog className={buttonStyle} />
          <Separator />
          <TutorialDialog className={buttonStyle} />
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
