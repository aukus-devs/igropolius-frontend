import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SkipTaxDialog() {
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Уйти от налога на секторе?</span>
      Налог на секторе
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => {}}
        >
          Заплатить налог
        </Button>
        <Button
          variant="outline"
          className="bg-[#30D158] hover:bg-[#30D158]/70 w-full flex-1"
          onClick={() => {}}
        >
          Использовать карточку
        </Button>
      </div>
    </Card>
  );
}
