import { VideoCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface StreamsButtonProps {
  className?: string;
}

export default function StreamsButton({ className }: StreamsButtonProps) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => window.open('/streams', '_blank')}
    >
      <VideoCircle className="mr-2 h-4 w-4" />
      Мультитрансляция
    </Button>
  );
}
