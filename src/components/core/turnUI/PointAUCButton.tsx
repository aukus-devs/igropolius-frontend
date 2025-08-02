import { Button } from '@/components/ui/button';

type Props = {
  className?: string;
};

export default function PointAUCButton({ className }: Props) {
  return (
    <Button
      variant="action"
      className={className}
      onClick={() => window.open('https://pointauc.com/', '_blank')}
    >
      Поинтаук
    </Button>
  );
}
