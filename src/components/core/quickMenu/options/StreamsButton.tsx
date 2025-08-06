import { VideoCircle } from '@/components/icons';
import { cn } from '@/lib/utils';

interface StreamsButtonProps {
  className?: string;
}

export default function StreamsButton({ className }: StreamsButtonProps) {
  return (
    <button onClick={() => window.open('/streams', '_blank')} className={cn(className)}>
      <VideoCircle className="mr-2 h-4 w-4" />
      Мультитрансляция
    </button>
  );
}
