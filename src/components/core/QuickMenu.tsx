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
    <div className="absolute top-10 right-7 w-60 text-16 z-10" onMouseLeave={handleMouseLeave}>
      <Card className="cursor-pointer" onMouseEnter={handleMouseEnter}>
        Меню быстрого доступа
      </Card>
      {open && (
        <div>
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
