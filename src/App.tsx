import "./index.css";
import { Canvas } from "@react-three/fiber";
import { SidebarProvider } from "./components/ui/sidebar";
import { CameraControls } from "@react-three/drei";
import { Vector3 } from "three";
import { AppProvider } from "./contexts/AppContext";
import EntitiesGroup from "./components/EntitiesGroup";
import Floor from "./components/Floor";
import Sector from "./components/Sector";
import { FLOOR_SIZE, PLAYER_ELEVATION, SECTOR_ELEVATION } from "./lib/constants";
import Player from "./components/Player";
import { useState } from "react";
import { colors } from "./types";

// const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const sectorsData = [
  {
    name: "GO",
    position: { x: 0, y: 0 },
    type: "corner",
    color: colors.pastelgreen,
  },
  {
    name: "Mediterranean Avenue",
    position: { x: 1, y: 0 },
    type: "property",
    color: colors.brown,
  },
  {
    name: "Community Chest 1",
    position: { x: 2, y: 0 },
    type: "community_chest",
    color: colors.pastelgreen,
  },
  {
    name: "Baltic Avenue",
    position: { x: 3, y: 0 },
    type: "property",
    color: colors.brown,
  },
  {
    name: "Income Tax",
    position: { x: 4, y: 0 },
    type: "tax",
    color: colors.brown,
  },
  {
    name: "Reading Railroad",
    position: { x: 5, y: 0 },
    type: "railroad",
    color: colors.pastelgreen,
  },
  {
    name: "Oriental Avenue",
    position: { x: 6, y: 0 },
    type: "property",
    color: colors.lightblue,
  },
  {
    name: "Chance 1",
    position: { x: 7, y: 0 },
    type: "chance",
    color: colors.pastelgreen,
  },
  {
    name: "Vermont Avenue",
    position: { x: 8, y: 0 },
    type: "property",
    color: colors.lightblue,
  },
  {
    name: "Connecticut Avenue",
    position: { x: 9, y: 0 },
    type: "property",
    color: colors.lightblue,
  },
  {
    name: "Jail / Just Visiting",
    position: { x: 10, y: 0 },
    type: "corner",
    color: colors.pastelgreen,
  },
  {
    name: "St. Charles Place",
    position: { x: 10, y: 1 },
    type: "property",
    color: colors.pink,
  },
  {
    name: "Electric Company",
    position: { x: 10, y: 2 },
    type: "utility",
    color: colors.pastelgreen,
  },
  {
    name: "States Avenue",
    position: { x: 10, y: 3 },
    type: "property",
    color: colors.pink,
  },
  {
    name: "Virginia Avenue",
    position: { x: 10, y: 4 },
    type: "property",
    color: colors.pink,
  },
  {
    name: "Pennsylvania Railroad",
    position: { x: 10, y: 5 },
    type: "railroad",
    color: colors.pastelgreen,
  },
  {
    name: "St. James Place",
    position: { x: 10, y: 6 },
    type: "property",
    color: colors.orange,
  },
  {
    name: "Community Chest 2",
    position: { x: 10, y: 7 },
    type: "community_chest",
    color: colors.pastelgreen,
  },
  {
    name: "Tennessee Avenue",
    position: { x: 10, y: 8 },
    type: "property",
    color: colors.orange,
  },
  {
    name: "New York Avenue",
    position: { x: 10, y: 9 },
    type: "property",
    color: colors.orange,
  },
  {
    name: "Free Parking",
    position: { x: 10, y: 10 },
    type: "corner",
    color: colors.pastelgreen,
  },
  {
    name: "Kentucky Avenue",
    position: { x: 9, y: 10 },
    type: "property",
    color: colors.red,
  },
  {
    name: "Chance 2",
    position: { x: 8, y: 10 },
    type: "chance",
    color: colors.pastelgreen,
  },
  {
    name: "Indiana Avenue",
    position: { x: 7, y: 10 },
    type: "property",
    color: colors.red,
  },
  {
    name: "Illinois Avenue",
    position: { x: 6, y: 10 },
    type: "property",
    color: colors.red,
  },
  {
    name: "B. & O. Railroad",
    position: { x: 5, y: 10 },
    type: "railroad",
    color: colors.pastelgreen,
  },
  {
    name: "Atlantic Avenue",
    position: { x: 4, y: 10 },
    type: "property",
    color: colors.yellow,
  },
  {
    name: "Ventnor Avenue",
    position: { x: 3, y: 10 },
    type: "property",
    color: colors.yellow,
  },
  {
    name: "Water Works",
    position: { x: 2, y: 10 },
    type: "utility",
    color: colors.pastelgreen,
  },
  {
    name: "Marvin Gardens",
    position: { x: 1, y: 10 },
    type: "property",
    color: colors.yellow,
  },
  {
    name: "Go To Jail",
    position: { x: 0, y: 10 },
    type: "corner",
    color: colors.pastelgreen,
  },
  {
    name: "Pacific Avenue",
    position: { x: 0, y: 9 },
    type: "property",
    color: colors.green,
  },
  {
    name: "North Carolina Avenue",
    position: { x: 0, y: 8 },
    type: "property",
    color: colors.green,
  },
  {
    name: "Community Chest 3",
    position: { x: 0, y: 7 },
    type: "community_chest",
    color: colors.pastelgreen,
  },
  {
    name: "Pennsylvania Avenue",
    position: { x: 0, y: 6 },
    type: "property",
    color: colors.green,
  },
  {
    name: "Short Line",
    position: { x: 0, y: 5 },
    type: "railroad",
    color: colors.pastelgreen,
  },
  {
    name: "Chance 3",
    position: { x: 0, y: 4 },
    type: "chance",
    color: colors.blue,
  },
  {
    name: "Park Place",
    position: { x: 0, y: 3 },
    type: "property",
    color: colors.blue,
  },
  {
    name: "Luxury Tax",
    position: { x: 0, y: 2 },
    type: "tax",
    color: colors.pastelgreen,
  },
  {
    name: "Boardwalk",
    position: { x: 0, y: 1 },
    type: "property",
    color: colors.blue,
  },
];

const playersData = [
  {
    name: "Player 1",
    position: { x: 0, y: 0 },
    color: "#fff",
  },
  {
    name: "Player 2",
    position: { x: 4, y: 0 },
    color: "#fff",
  },
];

function App() {
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const selectedSector = selectedSectorId !== null ? sectorsData[selectedSectorId] : null;

  return (
    <SidebarProvider>
      <AppProvider>
        <div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center min-w-50 h-16 bg-black bg-opacity-50 backdrop-blur-sm  border-2 border-white rounded-lg">
            <h1 className="text-white">Event 3D</h1>
          </div>
          {selectedSector && selectedSectorId !== null && (
            <div className="absolute top-16 left-20 z-20 p-4 text-white bg-black bg-opacity-50 backdrop-blur-sm border-2 border-white rounded-lg">
              <h2 className="text-2xl font-bold">Клетка #{selectedSectorId + 1}</h2>
              <h2>{selectedSector.name}</h2>
              <p>Type: {selectedSector.type}</p>
            </div>
          )}
        </div>
        <div className="w-full">
          <Canvas camera={{ fov: 90, near: 0.1, far: 1000, position: new Vector3(5, 10, 10) }}>
            <CameraControls />

            <group>
              {sectorsData.map(({ name, position, type, color }, idx) => {
                return (
                  <Sector
                    key={name}
                    id={name}
                    color={color}
                    position={[
                      position.x - FLOOR_SIZE / 4,
                      SECTOR_ELEVATION,
                      position.y - FLOOR_SIZE / 4,
                    ]}
                    type={type}
                    onClick={() => setSelectedSectorId(idx)}
                  />
                );
              })}
              <EntitiesGroup />
            </group>

            <group>
              {playersData.map(({ name, position, color }) => (
                <Player
                  key={name}
                  id={name}
                  color={color}
                  position={[
                    position.x - FLOOR_SIZE / 4,
                    PLAYER_ELEVATION,
                    position.y - FLOOR_SIZE / 4,
                  ]}
                />
              ))}
            </group>

            <Floor />

            <ambientLight intensity={0.1} />
            <directionalLight position={[10, 20, 10]} intensity={3} castShadow />
          </Canvas>
        </div>
      </AppProvider>
    </SidebarProvider>
  );
}

export default App;
