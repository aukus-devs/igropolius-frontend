import { Share } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { activateBonusCard } from '@/lib/api';
import { resetNotificationsQuery } from '@/lib/queryClient';
import { TaxData } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export default function SkipStreetTaxDialog() {
  const { taxInfo, players, payTaxes, setNextTurnState } = usePlayerStore(
    useShallow(state => {
      const myPlayer = state.myPlayer;
      let taxInfo: TaxData = {
        taxAmount: 0,
        playerIncomes: [],
      };
      if (myPlayer) {
        taxInfo = state.taxPerSector[myPlayer.sector_id];
      }
      return {
        taxInfo,
        players: state.players,
        payTaxes: state.payTaxesAndSwitchState,
        setNextTurnState: state.setNextTurnState,
      };
    })
  );

  const handlePayTax = async () => {
    await payTaxes('street-tax');
  };

  const handleUseCard = async () => {
    await activateBonusCard({ bonus_type: 'evade-street-tax' });
    resetNotificationsQuery();
    await setNextTurnState({ action: 'skip-bonus' });
  };

  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Уйти от налога на секторе?</span>
      <div className="flex mt-2 mb-2 items-center">
        Налог на секторе: {taxInfo.taxAmount} <Share />
      </div>
      <div>
        Доход получат:
        {Object.entries(taxInfo.playerIncomes).map(([playerId, amount], index) => {
          const playerIdNum = Number(playerId);
          const player = players.find(p => p.id === playerIdNum);
          return (
            <div key={index} className="flex gap-4">
              <span>{player?.username}</span>
              <div className="flex">
                <span>+{amount}</span>
                <Share />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={handlePayTax}
        >
          Заплатить {taxInfo.taxAmount}
        </Button>
        <Button
          variant="outline"
          className="bg-[#30D158] hover:bg-[#30D158]/70 w-full flex-1"
          onClick={handleUseCard}
        >
          Использовать карточку
        </Button>
      </div>
    </Card>
  );
}
