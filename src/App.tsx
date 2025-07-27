import './index.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { Controls, IS_DEV } from './lib/constants';
import Scene from './components/map/Scene';
import UI from './components/UI';
import usePlayerStore from './stores/playerStore';
import useEventStore from './stores/eventStore';
import { fetchCurrentPlayer, fetchPlayers, fetchFrontVersion, fetchEventSettings } from './lib/api';
import { useQuery } from '@tanstack/react-query';
import LoadingModal from './components/core/loadng/LoadingModal';
import { queryKeys } from './lib/queryClient';
import CanvasTooltip from './components/map/canvasTooltip/CanvasTooltip';
import SceneLoader from './components/map/SceneLoader';
import useDiceStore from './stores/diceStore';
import useAdminStore from './stores/adminStore';
import { TooltipProvider } from './components/ui/tooltip';
import useCanvasTooltipStore from './stores/canvasTooltipStore';
import { useUserActivity } from './hooks/useUserActivity';
import { MetrikaCounter } from 'react-metrika';
import { useControls } from 'leva';
import { ToneMapping } from 'three';

function App() {
  const { isInactive } = useUserActivity();

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

  const { setPlayers, setMyPlayer, setTurnState, isPlayerMoving, myRole } = usePlayerStore(
    useShallow(state => ({
      setPlayers: state.setPlayers,
      setMyPlayer: state.setMyPlayer,
      setTurnState: state.setTurnState,
      isPlayerMoving: state.isPlayerMoving,
      myRole: state.myPlayer?.role,
    }))
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
    enabled: !isPlayerMoving, // Only fetch players when not moving
  });

  const { data: eventSettingsData, isError: eventSettingsError } = useQuery({
    queryKey: queryKeys.eventSettings,
    queryFn: fetchEventSettings,
    refetchInterval: 60 * 1000,
  });

  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const unpin = useCanvasTooltipStore(state => state.unpin);

  const setEventSettings = useEventStore(state => state.setEventSettings);
  const setMainNotification = useEventStore(state => state.setMainNotification);
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
    if (myRole === 'admin') {
      setShowAdminPanel(true);
    }
  }, [myRole, setShowAdminPanel]);

  useEffect(() => {
    setPlayers(playersData?.players ?? []);
  }, [setPlayers, playersData]);

  useEffect(() => {
    if (eventSettingsData?.settings) {
      setEventSettings(eventSettingsData.settings);
      setMainNotification(null);
    }
  }, [setEventSettings, eventSettingsData, setMainNotification]);

  useEffect(() => {
    if (eventSettingsError) {
      setMainNotification({
        text: 'Ошибка загрузки настроек ивента, проверьте записи event_end_time и event_start_time в БД',
        tag: 'event-settings-error',
        variant: 'error',
      });
    }
  }, [eventSettingsError, setMainNotification]);

  const { data: frontVersionData } = useQuery({
    queryKey: ['frontVersion'],
    queryFn: fetchFrontVersion,
    refetchInterval: 60000,
    retry: false,
  });

  useEffect(() => {
    if (!frontVersionData?.version) return;
    if (frontVersionData.version !== import.meta.env.PACKAGE_VERSION && isInactive) {
      window.location.href = window.location.pathname + '?reload=' + new Date().getTime();
    }
  }, [frontVersionData, isInactive]);

  function onPointerMissed() {
    unpin();
    dismiss();
  }

  const enableMetrika = !IS_DEV;

  const {toneMapping}: { toneMapping: ToneMapping } = useControls({toneMapping: {
    value: 2,
    min: 1,
    max: 7,
    step: 1,
  }});

  return (
    <>
      {enableMetrika && (
        <MetrikaCounter
          id={103476492}
          options={{
            trackHash: true,
            webvisor: false,
          }}
        />
      )}
      {isLoading && <LoadingModal />}
      {!isLoading && (
        <KeyboardControls map={map}>
          <div className="h-screen">
            <CanvasTooltip />
            <TooltipProvider>
              <UI />
            </TooltipProvider>
            <Canvas onPointerMissed={onPointerMissed} gl={{toneMapping}}>
              <Suspense fallback={<SceneLoader />}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
        </KeyboardControls>
      )}
    </>
  );
}

export default App;
