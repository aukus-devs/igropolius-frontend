import { useState } from "react";
import Card from "./Card";

export default function QuickMenu() {
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <div
      className="absolute w-[220px] left-[30px] top-[85px] text-16 z-10 flex flex-col gap-[8px]"
      onMouseLeave={handleMouseLeave}
    >
      <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
        Меню быстрого доступа
      </Card>
      {open && (
        <div className="flex flex-col gap-[5px]">
          <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
            Правила
          </Card>
          <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
            О ивенте
          </Card>
        </div>
      )}
    </div>
  );
}
