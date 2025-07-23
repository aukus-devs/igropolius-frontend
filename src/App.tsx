import './index.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { Controls } from './lib/constants';
import Scene from './components/map/Scene';
import UI from './components/UI';
import usePlayerStore from './stores/playerStore';
import { fetchCurrentPlayer, fetchPlayers, fetchFrontVersion } from './lib/api';
import { useQuery } from '@tanstack/react-query';
import LoadingModal from './components/core/loadng/LoadingModal';
import { queryKeys } from './lib/queryClient';
import CanvasTooltip from './components/map/canvasTooltip/CanvasTooltip';
import SceneLoader from './components/map/SceneLoader';
import useDiceStore from './stores/diceStore';
import useAdminStore from './stores/adminStore';
import { TooltipProvider } from './components/ui/tooltip';
import useCanvasTooltipStore from './stores/canvasTooltipStore';

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.up, keys: ['Space'] },
      { name: Controls.down, keys: ['KeyC'] },
      { name: Controls.turnLeft, keys: ['KeyQ'] },
      { name: Controls.turnRight, keys: ['KeyE'] },
    ],
    []
  );

  const { data: currentPlayerData, isError: currentPlayerDataError } = useQuery({
    queryKey: queryKeys.currentPlayer,
    queryFn: fetchCurrentPlayer,
    retry: false,
  });

  const { data: playersData, isLoading } = useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: 60 * 1000,
  });

  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const unpin = useCanvasTooltipStore(state => state.unpin);

  const { setPlayers, setMyPlayer, setTurnState } = usePlayerStore(
    useShallow(state => ({
      setPlayers: state.setPlayers,
      setMyPlayer: state.setMyPlayer,
      setTurnState: state.setTurnState,
    }))
  );

  const setRollResult = useDiceStore(state => state.setRollResult);

  useEffect(() => {
    if (currentPlayerData?.last_roll_result && currentPlayerData?.last_roll_result.length > 0) {
      setRollResult(currentPlayerData.last_roll_result);
    }
  }, [currentPlayerData?.last_roll_result, setRollResult]);

  useEffect(() => {
    if (currentPlayerDataError) {
      setMyPlayer(undefined);
      setTurnState(null);
      return;
    }
    setMyPlayer(currentPlayerData);
    setTurnState(currentPlayerData?.turn_state ?? null);
  }, [currentPlayerData, setMyPlayer, setTurnState, currentPlayerDataError]);

  const setShowAdminPanel = useAdminStore(state => state.setShowAdminPanel);

  useEffect(() => {
    if (currentPlayerData?.role === 'admin') {
      setShowAdminPanel(true);
    }
  }, [currentPlayerData?.role, setShowAdminPanel]);

  useEffect(() => {
    setPlayers(
      playersData?.players ?? [],
      playersData?.event_end_time ?? undefined,
      playersData?.event_start_time ?? undefined
    );
  }, [setPlayers, playersData]);

  const { data: frontVersionData } = useQuery({
    queryKey: ['frontVersion'],
    queryFn: fetchFrontVersion,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!frontVersionData?.version) return;
    if (frontVersionData.version !== import.meta.env.PACKAGE_VERSION) {
      window.location.href = window.location.pathname + '?reload=' + new Date().getTime();
    }
  }, [frontVersionData]);

  function onPointerMissed() {
    unpin();
    dismiss();
  }

  if (isLoading) {
    return <LoadingModal />;
  }

  return (
    <KeyboardControls map={map}>
      <div className="h-screen">
        <CanvasTooltip />
        <TooltipProvider>
          <UI />
        </TooltipProvider>
        <Canvas onPointerMissed={onPointerMissed}>
          <Suspense fallback={<SceneLoader />}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
