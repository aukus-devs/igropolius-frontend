import { Box, PictureFrame } from '@/components/icons';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';
import useCameraStore from '@/stores/cameraStore';
import { useEffect } from 'react';

function OrthographicToggle({ className }: { className?: string }) {
  const toggleOrthographic = useCameraStore(state => state.toggleOrthographic);
  const isOrthographic = useCameraStore(state => state.isOrthographic);

  const { save, value: enable2d } = useLocalStorage({
    key: '2d-view',
    defaultValue: false,
  });

  useEffect(() => {
    if (enable2d !== isOrthographic) {
      toggleOrthographic(enable2d);
    }
  }, [enable2d, isOrthographic, toggleOrthographic]);

  const onToggle = () => {
    save(!enable2d);
  };

  return (
    <Button variant="outline" className={className} onClick={onToggle}>
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
