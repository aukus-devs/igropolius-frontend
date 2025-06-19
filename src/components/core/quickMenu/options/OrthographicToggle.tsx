import { Box, PictureFrame } from "@/components/icons";
import { Button } from "@/components/ui/button";
import useCameraStore from "@/stores/cameraStore";

function OrthographicToggle({ className }: { className?: string }) {
  const toggleOrthographic = useCameraStore((state) => state.toggleOrthographic);
  const isOrthographic = useCameraStore((state) => state.isOrthographic);

  return (
    <Button variant="outline" className={className} onClick={toggleOrthographic}>
      {isOrthographic ? (
        <>
          <Box /> 3D Вид
        </>
      ) : (
        <>
          <PictureFrame /> 2D Вид
        </>
      )}
    </Button>
  );
}

export default OrthographicToggle;
