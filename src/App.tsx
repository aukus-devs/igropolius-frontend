import "./index.css";
import { Canvas } from "@react-three/fiber";
import { SidebarProvider } from "./components/ui/sidebar";
import { CameraControls } from "@react-three/drei";
import { Vector3 } from "three";
import { AppProvider } from "./contexts/AppContext";
import Floor from "./components/Floor";
import Sector from "./components/Sector";
import Player from "./components/Player";
import { useState } from "react";
import { playersData, sectorsData } from "./lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

function App() {
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const selectedSector = selectedSectorId !== null ? sectorsData[selectedSectorId] : null;

  return (
    <SidebarProvider>
      <AppProvider>
        <div>
          <Card className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <CardContent>Event 3D</CardContent>
          </Card>
          {selectedSector && selectedSectorId !== null && (
            <Card className="absolute top-8 left-8 w-52 z-10">
              <CardHeader>
                <CardTitle>{selectedSector.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{selectedSector.id}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Тип: {selectedSector.type}</p>
                <p className="text-sm">Ролл игры: {selectedSector.rollType}</p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="w-full">
          <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: new Vector3(5, 10, 10) }}>
            <CameraControls />

            <group>
              {sectorsData.map((sector, idx) => {
                return (
                  <Sector
                    {...sector}
                    key={sector.id}
                    onClick={() => setSelectedSectorId(idx)}
                    onPointerOver={() => setSelectedSectorId(idx)}
                  />
                );
              })}
            </group>

            <group>
              {playersData.map((player) => (
                <Player {...player} key={player.name} />
              ))}
            </group>

            <Floor />

            <ambientLight intensity={0.1} />
            <directionalLight position={[10, 20, 10]} intensity={3} />
          </Canvas>
        </div>
      </AppProvider>
    </SidebarProvider>
  );
}

export default App;
