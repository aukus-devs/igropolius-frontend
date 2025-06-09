import "./index.css";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { useShallow } from "zustand/shallow";

import { Controls } from "./lib/constants";
import Scene from "./components/map/Scene";
import UI from "./components/UI";
import usePlayerStore from "./stores/playerStore";
import { fetchCurrentPlayer, fetchPlayers } from "./lib/api";
import { useQuery } from "@tanstack/react-query";
import LoadingModal from "./components/core/LoadingModal";

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.up, keys: ["Space"] },
      { name: Controls.down, keys: ["KeyC"] },
      { name: Controls.turnLeft, keys: ["KeyQ"] },
      { name: Controls.turnRight, keys: ["KeyE"] },
    ],
    [],
  );

  const { data: currentPlayerData, isError: currentPlayerDataError } = useQuery({
    queryKey: ["current-player"],
    queryFn: fetchCurrentPlayer,
  });

  const { data: playersData, isLoading } = useQuery({
    queryKey: ["players-list"],
    queryFn: fetchPlayers,
  });

  const { setPlayers, setMyPlayerId, setTurnState } = usePlayerStore(
    useShallow((state) => ({
      setPlayers: state.setPlayers,
      setMyPlayerId: state.setMyPlayerId,
      setTurnState: state.setTurnState,
    })),
  );

  useEffect(() => {
    if (currentPlayerDataError) {
      setMyPlayerId(undefined);
      setTurnState(null);
      return;
    }
    setMyPlayerId(currentPlayerData?.id);
    setTurnState(currentPlayerData?.turn_state ?? null);
  }, [
    currentPlayerData?.id,
    currentPlayerData?.turn_state,
    setMyPlayerId,
    setTurnState,
    currentPlayerDataError,
  ]);

  useEffect(() => {
    setPlayers(playersData?.players ?? []);
  }, [setPlayers, playersData]);

  if (isLoading) {
    return <LoadingModal />;
  }

  return (
    <KeyboardControls map={map}>
      <div className="h-screen">
        <UI />
        <Canvas>
          <Scene />
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
