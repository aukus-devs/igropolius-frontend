import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Calculator } from '@/components/icons';

type Props = {
  className?: string;
};

const AUCTION_STEPS = [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000];

const REGULAR_STEPS = [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000];

function calculateDonationGoal(
  amount: number,
  steps: number[],
  divideByFour: boolean = false
): {
  spins: number;
  filledSteps: number[];
  totalUsed: number;
} {
  const workingAmount = divideByFour ? Math.floor(amount / 4) : amount;
  let remainingAmount = workingAmount;
  const filledSteps: number[] = [];
  let totalUsed = 0;

  for (const step of steps) {
    if (remainingAmount >= step) {
      filledSteps.push(step);
      remainingAmount -= step;
      totalUsed += step;
    } else {
      break;
    }
  }

  return {
    spins: filledSteps.length,
    filledSteps,
    totalUsed,
  };
}

function DonationCalculatorTab({
  steps,
  divideByFour,
  title,
  example,
  disabled = false,
}: {
  steps: number[];
  divideByFour: boolean;
  title: string;
  example: string;
  disabled?: boolean;
}) {
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<ReturnType<typeof calculateDonationGoal> | null>(null);

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);

    if (numericValue) {
      const numericAmount = parseInt(numericValue, 10);
      if (!isNaN(numericAmount) && numericAmount > 0) {
        setResult(calculateDonationGoal(numericAmount, steps, divideByFour));
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-base font-semibold">
          {title}
        </Label>
        <Input
          id="amount"
          type="text"
          value={amount ? formatNumber(parseInt(amount)) : ''}
          onChange={e => handleAmountChange(e.target.value)}
          placeholder={disabled ? 'Выберите вкладку для начала расчета...' : 'Введите сумму...'}
          className="text-lg"
          disabled={disabled}
        />
      </div>

      {result && (
        <div className="space-y-4 p-4 bg-card/50 rounded-lg">
          <h3 className="text-lg font-semibold text-primary">Результат расчета:</h3>

          <div className="space-y-2">
            {divideByFour && (
              <p className="text-base">
                <span className="font-semibold">Сумма после деления на 4:</span>{' '}
                {formatNumber(Math.floor(parseInt(amount) / 4))}
              </p>
            )}

            <p className="text-base">
              <span className="font-semibold">Рабочая сумма:</span>{' '}
              {formatNumber(divideByFour ? Math.floor(parseInt(amount) / 4) : parseInt(amount))}
            </p>

            <p className="text-base">
              <span className="font-semibold">Заполненные шаги:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {result.filledSteps.map((step, index) => (
                <span key={index} className="px-2 py-1 bg-primary/20 rounded text-sm">
                  {formatNumber(step)}
                </span>
              ))}
            </div>

            <p className="text-base">
              <span className="font-semibold">Использовано:</span> {formatNumber(result.totalUsed)}
            </p>

            <p className="text-base">
              <span className="font-semibold">Остаток:</span>{' '}
              {formatNumber(
                (divideByFour ? Math.floor(parseInt(amount) / 4) : parseInt(amount)) -
                  result.totalUsed
              )}
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xl font-bold text-primary">
              Колесо крутится: {result.spins}{' '}
              {result.spins === 1 ? 'раз' : result.spins < 5 ? 'раза' : 'раз'}
            </p>
          </div>
        </div>
      )}

      {amount && !result && (
        <div className="p-4 bg-destructive/10 rounded-lg">
          <p className="text-destructive">Введите корректную сумму</p>
        </div>
      )}

      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Шаги донат-гола:</strong>
        </p>
        <p>{steps.map(step => formatNumber(step)).join(' → ')}</p>
        {example && (
          <p className="mt-2">
            <strong>Пример:</strong> {example}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DonationGoalCalculatorDialog({ className }: Props) {
  const [activeTab, setActiveTab] = useState<string>('');
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setActiveTab('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <Calculator />
        Калькулятор донат-гола
      </DialogTrigger>
      <DialogContent className="w-[600px]" aria-describedby="">
        <DialogHeader>
          <DialogTitle className="text-2xl font-wide-black">Калькулятор донат-гола</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="regular"
              className="data-[state=active]:text-primary data-[state=active]:bg-primary/10"
            >
              Стим
            </TabsTrigger>
            <TabsTrigger
              value="auction"
              className="data-[state=active]:text-primary data-[state=active]:bg-primary/10"
            >
              Аукцион
            </TabsTrigger>
          </TabsList>

          {!activeTab && (
            <div className="mt-6 p-8 text-center text-muted-foreground">
              <p className="text-lg">Выберите тип сектора</p>
            </div>
          )}

          <TabsContent value="regular" className="mt-6">
            <DonationCalculatorTab
              steps={REGULAR_STEPS}
              divideByFour={false}
              title="Сумма донатов"
              example=""
              disabled={activeTab !== 'regular'}
            />
          </TabsContent>

          <TabsContent value="auction" className="mt-6">
            <DonationCalculatorTab
              steps={AUCTION_STEPS}
              divideByFour={true}
              title="Сумма с аукциона"
              example="На аукционе собрано 15.000. Делим на 4 = 3.750. Заполняются шаги 500 + 1.000 + 2.000 = 3.500. Остаток 250 не учитывается. Колесо крутится 3 раза."
              disabled={activeTab !== 'auction'}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
