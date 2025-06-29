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

function DesktopUI() {
  const { turnState, position } = usePlayerStore(
    useShallow(state => ({
      turnState: state.turnState,
      position: state.myPlayer?.sector_id,
    }))
  );

  const showAdminPanel = useAdminStore(state => state.showAdminPanel);

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
        <div className="absolute bottom-20 left-4">
          <AdminPanel />
        </div>
      )}

      <div className="absolute bottom-4 right-4">
        #{position} ход: {turnState}
      </div>
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
