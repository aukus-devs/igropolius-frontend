import useDiceStore from "@/stores/diceStore";
import usePlayerStore from "@/stores/playerStore";
import { useState } from "react";

export default function DiceBonusesDialog() {
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [adjustBy1, setAdjustBy1] = useState<number | null>(null);

  const rollResult = useDiceStore((state) => state.rollResult);
  const rollResultSum = rollResult.reduce((a, b) => a + b, 0);

  const adjustedRoll =
    selectedDie !== null ? selectedDie + (adjustBy1 || 0) : rollResultSum + (adjustBy1 || 0);

  const myPlayer = usePlayerStore((state) => state.myPlayer);
  const bonusCards = myPlayer?.bonus_cards || [];

  const hasAdjustBy1 =
    bonusCards.some((card) => card.bonus_type === "adjust-roll-by1") || true;
  const hasChooseDie = bonusCards.some((card) => card.bonus_type === "choose-1-die") || true;

  const adjustBy1Used = adjustBy1 !== null;
  const chooseDieUsed = selectedDie !== null;

  const handleSubmit = () => {
    console.log(adjustBy1Used, chooseDieUsed);
  };

  return (
    <div className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4">
      <div className="w-[400px]">
        <div>Какие бонусы использовать?</div>
        <div>
          Бросок кубика: {rollResultSum} ({rollResult.join(" и ")})
        </div>
        <div>Новый результат: {adjustedRoll}</div>
        {hasChooseDie && (
          <div className="mt-2">
            <div>Выбрать один кубик (потратит карточку)</div>
            <NumberToggle
              options={rollResult.map((num) => ({
                value: num,
                label: num.toString(),
              }))}
              value={selectedDie}
              onChange={(value) => {
                setSelectedDie((prev) => (prev === value ? null : value));
              }}
            />
          </div>
        )}
        {hasAdjustBy1 && (
          <div className="mt-2">
            <div>Увеличить или уменьшить результат на 1 (потратит карточку)</div>
            <NumberToggle
              options={[
                { value: 1, label: "+1" },
                { value: -1, label: "-1" },
              ]}
              value={adjustBy1}
              onChange={(value) => {
                setAdjustBy1((prev) => (prev === value ? null : value));
              }}
            />
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 hover:bg-primary/90 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

type ToggleOption = {
  value: number;
  label: string;
};

type NumberToggleProps = {
  options: ToggleOption[];
  value: number | null;
  onChange: (value: number) => void;
};

export function NumberToggle({ options, value, onChange }: NumberToggleProps) {
  return (
    <div className="flex gap-4">
      {options.map((num, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(num.value)}
          className={`w-12 h-12 flex items-center justify-center rounded-md border-2 transition
            ${
              value === num.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-muted"
            }
            focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          <span className="text-xl font-bold">{num.label}</span>
        </button>
      ))}
    </div>
  );
}
