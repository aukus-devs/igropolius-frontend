import { useNavigate } from 'react-router';
import { VideoCircle } from '@/components/icons';
import { cn } from '@/lib/utils';

interface StreamsButtonProps {
  className?: string;
}

export default function StreamsButton({ className }: StreamsButtonProps) {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/streams')} className={cn(className)}>
      <VideoCircle className="mr-2 h-4 w-4" />
      Мультитрансляция
    </button>
  );
}
