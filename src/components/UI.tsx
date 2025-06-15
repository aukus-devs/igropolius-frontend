import { Button } from "./ui/button";
import usePlayerStore from "@/stores/playerStore";
import PlayersList from "./core/PlayersList";
import QuickMenu from "./core/quickMenu/QuickMenu";
import Notifications from "./core/Notifications";
import GameReviewForm from "./core/GameReviewForm";
import RollBonusCard from "./core/RollBonusCard";
import { useShallow } from "zustand/shallow";
import TrainMoveDialog from "./core/TrainMoveDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTabs from "./core/mobile/MobileTabs";
import MobilePlayersList from "./core/mobile/MobilePlayerList";

function MoveButton() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  return (
    <Button variant="outline" onClick={moveMyPlayer} disabled={isPlayerMoving}>
      Бросить кубик и ходить
    </Button>
  );
}

function DesktopUI() {
  const { turnState, position, isPlayerMoving } = usePlayerStore(
    useShallow((state) => ({
      turnState: state.turnState,
      position: state.myPlayer?.sector_id,
      isPlayerMoving: state.isPlayerMoving,
    })),
  );

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:block hidden">
      <div className="absolute top-3 left-4">
        <PlayersList />
      </div>
      <div className="absolute right-4 top-3 w-[15rem]">
        <div className="mb-[50px]">
          <QuickMenu />
        </div>
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {turnState === "rolling-dice" && !isPlayerMoving && <MoveButton />}
        {turnState === "choosing-train-ride" && !isPlayerMoving && <TrainMoveDialog />}
        {turnState === "filling-game-review" && <GameReviewForm />}
        {turnState === "rolling-bonus-card" && <RollBonusCard />}
      </div>

      <div className="absolute bottom-4 right-4">
        #{position} ход: {turnState}
      </div>
    </div>
  )
}

function MobileUI() {
  return (
    <div className="absolute h-dvh w-dvw [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden md:hidden block">
      <MobileTabs />
      <MobilePlayersList />
    </div>
  )
}

function UI() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileUI /> : <DesktopUI />;
}

export default UI;
