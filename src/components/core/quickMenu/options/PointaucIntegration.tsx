import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";

function PointaucIntegration({ className }: { className?: string }) {
  return (
    <Button variant="outline" className={className}>
      <HeartIcon className="h-4 w-4" />
      Привязать поинтаук
    </Button>
  );
}

export default PointaucIntegration;
