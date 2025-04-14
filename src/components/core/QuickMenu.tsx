import { useState } from "react";
import Card from "./Card";
import { Button } from "../ui/button";

export default function QuickMenu() {
  const [open, setOpen] = useState(false);

  const [showRules, setShowRules] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <>
      <div
        className="absolute w-[220px] right-4 top-10 flex flex-col gap-2"
        onMouseLeave={handleMouseLeave}
      >
        <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
          Меню быстрого доступа
        </Card>
        {open && (
          <div className="flex flex-col gap-[5px]">
            <Card
              className="cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onClick={() => setShowRules(true)}
            >
              Правила
            </Card>
            <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
              О ивенте
            </Card>
          </div>
        )}
      </div>

      {showRules && (
        <div className="z-20">
          <Card className="absolute top-30 left-60 right-60 bottom-10">
            <div className="text-center text-4xl">Правила</div>
            <div className="absolute right-2 text-center text-2xl">
              <Button onClick={() => setShowRules(false)}>X</Button>
            </div>
            <div>1. Правила 1</div>
            <div>2. Правила 2</div>
            <div>3. Правила 3</div>
            <div>(будет скролиться)</div>
          </Card>
        </div>
      )}
    </>
  );
}
