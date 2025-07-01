import useDiceStore from '@/stores/diceStore';
import usePlayerStore from '@/stores/playerStore';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

export default function DiceBonusesDialog() {
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [adjustBy1, setAdjustBy1] = useState<number | null>(null);

  const rollResult = useDiceStore(state => state.rollResult);
  const rollResultSum = rollResult.reduce((a, b) => a + b, 0);

  const adjustedRoll =
    selectedDie !== null ? selectedDie + (adjustBy1 || 0) : rollResultSum + (adjustBy1 || 0);

  const { myPlayer, moveMyPlayer } = usePlayerStore(
    useShallow(state => ({ myPlayer: state.myPlayer, moveMyPlayer: state.moveMyPlayer }))
  );
  const bonusCards = myPlayer?.bonus_cards || [];

  const hasAdjustBy1 = bonusCards.some(card => card.bonus_type === 'adjust-roll-by1');
  const hasChooseDie = bonusCards.some(card => card.bonus_type === 'choose-1-die');

  // const adjustBy1Used = adjustBy1 !== null;
  // const chooseDieUsed = selectedDie !== null;

  const handleSubmit = () => {
    let adjustBy1Typed = null;
    switch (adjustBy1) {
      case 1:
        adjustBy1Typed = 1 as const;
        break;
      case -1:
        adjustBy1Typed = -1 as const;
        break;
      default:
        adjustBy1Typed = null;
    }

    moveMyPlayer({
      totalRoll: adjustedRoll,
      adjustBy1: adjustBy1Typed,
      selectedDie,
      action: 'skip-bonus',
    });
  };

  return (
    <div className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4 font-semibold">
      <div className="w-[400px]">
        <div className="text-xl font-wide-semibold">Применить карточки?</div>
        <div className="mt-[20px]">
          На кубиках: {rollResultSum} ({rollResult.join(' и ')})
        </div>

        {hasChooseDie && (
          <div className="mt-[20px]">
            <div className="mb-[15px]">Выбрать один кубик?</div>
            <NumberToggle
              options={[
                { value: null, label: 'Нет' },
                ...rollResult.map(num => ({
                  value: num,
                  label: num.toString(),
                })),
              ]}
              value={selectedDie}
              onChange={value => {
                setSelectedDie(prev => (prev === value ? null : value));
              }}
            />
          </div>
        )}
        {hasAdjustBy1 && (
          <div className="mt-[20px]">
            <div className="mb-[15px]">Изменить результат на 1?</div>
            <NumberToggle
              options={[
                { value: null, label: 'Нет' },
                { value: 1, label: '+1' },
                { value: -1, label: '-1' },
              ]}
              value={adjustBy1}
              onChange={value => {
                setAdjustBy1(prev => (prev === value ? null : value));
              }}
            />
          </div>
        )}
        <div className="mt-[50px]">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full font-bold bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors"
          >
            Применить с результатом: {adjustedRoll}
          </button>
        </div>
      </div>
    </div>
  );
}

type ToggleOption = {
  value: number | null;
  label: string;
};

type NumberToggleProps = {
  options: ToggleOption[];
  value: number | null;
  onChange: (value: number | null) => void;
};

export function NumberToggle({ options, value, onChange }: NumberToggleProps) {
  return (
    <div className="flex gap-4">
      {options.map((num, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(num.value)}
          className={`w-full items-center justify-center rounded-md p-[6px]
            ${
              value === num.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-muted'
            }
            `}
        >
          <span className="">{num.label}</span>
        </button>
      ))}
    </div>
  );
}
