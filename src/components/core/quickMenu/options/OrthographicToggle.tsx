import { Button } from "@/components/ui/button";
import useCameraStore from "@/stores/cameraStore";
import { BoxIcon, SquareIcon } from "lucide-react";

function OrthographicToggle({ className }: { className?: string }) {
  const toggleOrthographic = useCameraStore((state) => state.toggleOrthographic);
  const isOrthographic = useCameraStore((state) => state.isOrthographic);

  return (
    <Button variant="outline" className={className} onClick={toggleOrthographic}>
      {isOrthographic ? (
        <>
          <BoxIcon /> 3D Вид
        </>
      ) : (
        <>
          <SquareIcon /> 2D Вид
        </>
      )}
    </Button>
  );
}

export default OrthographicToggle;
