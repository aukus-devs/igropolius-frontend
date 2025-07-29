import usePlayerStore from '@/stores/playerStore';
import PlayersList from './core/PlayersList';
import QuickMenu from './core/quickMenu/QuickMenu';
import Notifications from './core/Notifications';
import { useShallow } from 'zustand/shallow';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileTabs from './core/mobile/MobileTabs';
import MobilePlayersList from './core/mobile/MobilePlayerList';
import DiceErrorNotification from './core/DiceErrorNotification';
import PlayerTurnUI from './core/turnUI/PlayerTurnUI';
import useAdminStore from '@/stores/adminStore';
import AdminPanel from './core/AdminPanel';
import MyCards from './core/MyCards';
import FrontVersionInfo from './FrontVersionInfo';
import useSystemStore from '@/stores/systemStore';
import { Card } from './ui/card';

function DesktopUI() {
  const { position, turnState, loggedIn } = usePlayerStore(
    useShallow(state => ({
      turnState: state.turnState,
      position: state.myPlayer?.sector_id,
      loggedIn: !!state.myPlayer,
    }))
  );

  const showAdminPanel = useAdminStore(state => state.showAdminPanel);

  const mainNotification = useSystemStore(state => state.mainNotification);

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:block hidden">
      <div className="absolute top-3 left-4">
        <PlayersList />
      </div>
      <div className="absolute right-4 top-3 w-[15rem]">
        <div className="mb-[50px]">
          <QuickMenu />
        </div>
        <div className="mb-3">
          <DiceErrorNotification />
        </div>
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <PlayerTurnUI />
      </div>
      {showAdminPanel && (
        <div className="absolute top-3 right-70">
          <AdminPanel />
        </div>
      )}
      {loggedIn && (
        <div className="absolute left-4 bottom-20">
          <MyCards />
        </div>
      )}
      <FrontVersionInfo />

      {position && (
        <div className="absolute bottom-4 right-4">
          #{position} ход: {turnState}
        </div>
      )}

      {mainNotification && (
        <Card
          className={`absolute top-3 left-1/2 -translate-x-1/2 ${
            mainNotification.variant === 'error'
              ? 'bg-destructive/90 text-white border-destructive'
              : ''
          }`}
        >
          <div className="pl-4 pr-4 rounded-md">{mainNotification.text}</div>
        </Card>
      )}
    </div>
  );
}

function MobileUI() {
  return (
    <div className="absolute h-dvh w-dvw [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:hidden block">
      <MobileTabs />
      <MobilePlayersList />
    </div>
  );
}

function UI() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileUI /> : <DesktopUI />;
}

export default UI;
