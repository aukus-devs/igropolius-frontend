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

  const { data: currentPlayerData } = useQuery({
    queryKey: ["current-player"],
    queryFn: fetchCurrentPlayer,
  });

  const { data: playersData } = useQuery({
    queryKey: ["players-list"],
    queryFn: fetchPlayers,
  });

  const { setPlayers, setMyPlayerId } = usePlayerStore(
    useShallow((state) => ({
      setPlayers: state.setPlayers,
      setMyPlayerId: state.setMyPlayerId,
    })),
  );

  useEffect(() => {
    setMyPlayerId(currentPlayerData?.id);
  }, [currentPlayerData?.id, setMyPlayerId]);

  useEffect(() => {
    setPlayers(playersData?.players ?? []);
  }, [setPlayers, playersData]);

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
