import './index.css';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { Controls, IS_DEV } from './lib/constants';
import GameScene from './components/map/scenes/GameScene';
import UI from './components/UI';
import usePlayerStore from './stores/playerStore';
import useSystemStore from './stores/systemStore';
import { fetchCurrentPlayer, fetchPlayers, fetchFrontVersion, fetchEventSettings } from './lib/api';
import { useQuery } from '@tanstack/react-query';
import LoadingModal from './components/core/loadng/LoadingModal';
import { queryKeys } from './lib/queryClient';
import CanvasTooltip from './components/map/canvasTooltip/CanvasTooltip';
import SceneLoader from './components/map/SceneLoader';
import useDiceStore from './stores/diceStore';
import { TooltipProvider } from './components/ui/tooltip';
import useCanvasTooltipStore from './stores/canvasTooltipStore';
import { useUserActivity } from './hooks/useUserActivity';
import { MetrikaCounter } from 'react-metrika';
import { Environment, Stats } from '@react-three/drei';
import { STORAGE_BASE_URL } from '@/lib/constants';
import ModelSelectionScene from './components/map/scenes/ModelSelectionScene';

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

  const { setPlayers, setMyPlayer, setTurnState } = usePlayerStore(
    useShallow(state => ({
      setPlayers: state.setPlayers,
      setMyPlayer: state.setMyPlayer,
      setTurnState: state.setTurnState,
    }))
  );

  const { disableCurrentPlayerQuery, disablePlayersQuery, setMyUser } = useSystemStore(
    useShallow(state => ({
      disableCurrentPlayerQuery: state.disableCurrentPlayerQuery,
      disablePlayersQuery: state.disablePlayersQuery,
      setMyUser: state.setMyUser,
    }))
  );

  const { data: currentPlayerData, isError: currentPlayerDataError } = useQuery({
    queryKey: queryKeys.currentPlayer,
    queryFn: fetchCurrentPlayer,
    retry: false,
    enabled: !disableCurrentPlayerQuery,
  });

  const { data: playersData, isLoading } = useQuery({
    queryKey: queryKeys.players,
    queryFn: fetchPlayers,
    refetchInterval: 60 * 1000,
    enabled: !disablePlayersQuery,
  });

  const { data: eventSettingsData, isError: eventSettingsError } = useQuery({
    queryKey: queryKeys.eventSettings,
    queryFn: fetchEventSettings,
    refetchInterval: 60 * 1000,
  });

  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const unpin = useCanvasTooltipStore(state => state.unpin);

  const setEventSettings = useSystemStore(state => state.setEventSettings);
  const setMainNotification = useSystemStore(state => state.setMainNotification);
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
      setMyUser(null);
      return;
    }
    setMyPlayer(currentPlayerData);
    setTurnState(currentPlayerData?.turn_state ?? null);
    setMyUser(currentPlayerData);
  }, [currentPlayerData, setMyPlayer, setTurnState, currentPlayerDataError, setMyUser]);

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
  const isModelSelectionScene = false;

  // const { lightIntensity, bgIntensity, bgBlurriness, toneMapping } = useControls('Environment', {
  //   toneMapping: {
  //     value: 1,
  //     min: 0,
  //     max: 7,
  //     step: 1,
  //   },
  //   lightIntensity: {
  //     value: 0.7,
  //     min: 0,
  //     max: 10,
  //     step: 0.1,
  //   },
  //   bgIntensity: {
  //     value: 1.4,
  //     min: 0,
  //     max: 10,
  //     step: 0.1,
  //   },
  //   bgBlurriness: {
  //     value: 0.06,
  //     min: 0,
  //     max: 1,
  //   },
  // });
  // const effects = useControls("Effects", {
  //   enabled: false
  // })
  // const n8ao = useControls("N8AO", {
  //   renderMode: {
  //     value: 0,
  //     min: 0,
  //     max: 4,
  //     step: 1,
  //   },
  //   aoRadius: {
  //     value: 3,
  //     min: 1,
  //     max: 10,
  //     step: 0.01,
  //   },
  //   distanceFalloff: {
  //     value: 1,
  //     min: 0.1,
  //     max: 10,
  //     step: 0.01,
  //   },
  //   intensity: {
  //     value: 4.5,
  //     min: 0.0,
  //     max: 10,
  //     step: 0.01,
  //   },
  // });
  // const bloom = useControls("Bloom", {
  //   lumThreshold: {
  //     value: 0.1,
  //     min: 0.0,
  //     max: 1,
  //     step: 0.01,
  //   },
  //   lumSmoothing: {
  //     value: 0.1,
  //     min: 0.0,
  //     max: 1,
  //     step: 0.01,
  //   },
  //   intensity: {
  //     value: 0.25,
  //     min: 0,
  //     max: 1,
  //     step: 0.01,
  //   },
  // });

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
            <Canvas onPointerMissed={onPointerMissed} gl={{ toneMapping: 1 }}>
              <Suspense fallback={<SceneLoader />}>
                <Environment
                  files={`${STORAGE_BASE_URL}/textures/sky2_2k.hdr`}
                  background
                  environmentIntensity={0.7}
                  backgroundIntensity={1.4}
                  backgroundBlurriness={0.06}
                />

                <Stats className="!bottom-6 !top-auto" />

                {isModelSelectionScene ? <ModelSelectionScene /> : <GameScene />}

                {/* <EffectComposer enabled={effects.enabled} resolutionScale={100} renderPriority={1} enableNormalPass>
                  <ToneMapping mode={toneMapping} />
                  <Bloom
                    intensity={bloom.intensity}
                    luminanceThreshold={bloom.lumThreshold}
                    luminanceSmoothing={bloom.lumSmoothing}
                  />
                  <HueSaturation />
                  <N8AO
                    halfRes
                    renderMode={n8ao.renderMode}
                    aoRadius={n8ao.aoRadius}
                    intensity={n8ao.intensity}
                    distanceFalloff={n8ao.distanceFalloff}
                  />
                </EffectComposer> */}
              </Suspense>
            </Canvas>
          </div>
        </KeyboardControls>
      )}
    </>
  );
}

export default App;
