import { Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";

function PointaucIntegration({ className }: { className?: string }) {
  return (
    <Button variant="outline" className={className}>
      <Heart className="h-4 w-4" />
      Привязать поинтаук
    </Button>
  );
}

export default PointaucIntegration;
