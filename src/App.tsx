import './index.css';
import { Canvas } from '@react-three/fiber';
import { SidebarProvider } from './components/ui/sidebar';
import { CameraControls } from '@react-three/drei'
import { Vector3 } from 'three';
import { AppProvider } from './contexts/AppContext';
import EntitiesGroup from './components/EntitiesGroup';
import Floor from './components/Floor';
import Sector from './components/Sector';
import { FLOOR_SIZE, PLAYER_ELEVATION, SECTOR_ELEVATION } from './lib/constants';
import Player from './components/Player';

const sectorsData = [
  {
    "name": "GO",
    "position": { "x": 0, "y": 0 },
    "type": "corner"
  },
  {
    "name": "Mediterranean Avenue",
    "position": { "x": 1, "y": 0 },
    "type": "property"
  },
  {
    "name": "Community Chest 1",
    "position": { "x": 2, "y": 0 },
    "type": "community_chest"
  },
  {
    "name": "Baltic Avenue",
    "position": { "x": 3, "y": 0 },
    "type": "property"
  },
  {
    "name": "Income Tax",
    "position": { "x": 4, "y": 0 },
    "type": "tax"
  },
  {
    "name": "Reading Railroad",
    "position": { "x": 5, "y": 0 },
    "type": "railroad"
  },
  {
    "name": "Oriental Avenue",
    "position": { "x": 6, "y": 0 },
    "type": "property"
  },
  {
    "name": "Chance 1",
    "position": { "x": 7, "y": 0 },
    "type": "chance"
  },
  {
    "name": "Vermont Avenue",
    "position": { "x": 8, "y": 0 },
    "type": "property"
  },
  {
    "name": "Connecticut Avenue",
    "position": { "x": 9, "y": 0 },
    "type": "property"
  },
  {
    "name": "Jail / Just Visiting",
    "position": { "x": 10, "y": 0 },
    "type": "corner"
  },
  {
    "name": "St. Charles Place",
    "position": { "x": 10, "y": 1 },
    "type": "property"
  },
  {
    "name": "Electric Company",
    "position": { "x": 10, "y": 2 },
    "type": "utility"
  },
  {
    "name": "States Avenue",
    "position": { "x": 10, "y": 3 },
    "type": "property"
  },
  {
    "name": "Virginia Avenue",
    "position": { "x": 10, "y": 4 },
    "type": "property"
  },
  {
    "name": "Pennsylvania Railroad",
    "position": { "x": 10, "y": 5 },
    "type": "railroad"
  },
  {
    "name": "St. James Place",
    "position": { "x": 10, "y": 6 },
    "type": "property"
  },
  {
    "name": "Community Chest 2",
    "position": { "x": 10, "y": 7 },
    "type": "community_chest"
  },
  {
    "name": "Tennessee Avenue",
    "position": { "x": 10, "y": 8 },
    "type": "property"
  },
  {
    "name": "New York Avenue",
    "position": { "x": 10, "y": 9 },
    "type": "property"
  },
  {
    "name": "Free Parking",
    "position": { "x": 10, "y": 10 },
    "type": "corner"
  },
  {
    "name": "Kentucky Avenue",
    "position": { "x": 9, "y": 10 },
    "type": "property"
  },
  {
    "name": "Chance 2",
    "position": { "x": 8, "y": 10 },
    "type": "chance"
  },
  {
    "name": "Indiana Avenue",
    "position": { "x": 7, "y": 10 },
    "type": "property"
  },
  {
    "name": "Illinois Avenue",
    "position": { "x": 6, "y": 10 },
    "type": "property"
  },
  {
    "name": "B. & O. Railroad",
    "position": { "x": 5, "y": 10 },
    "type": "railroad"
  },
  {
    "name": "Atlantic Avenue",
    "position": { "x": 4, "y": 10 },
    "type": "property"
  },
  {
    "name": "Ventnor Avenue",
    "position": { "x": 3, "y": 10 },
    "type": "property"
  },
  {
    "name": "Water Works",
    "position": { "x": 2, "y": 10 },
    "type": "utility"
  },
  {
    "name": "Marvin Gardens",
    "position": { "x": 1, "y": 10 },
    "type": "property"
  },
  {
    "name": "Go To Jail",
    "position": { "x": 0, "y": 10 },
    "type": "corner"
  },
  {
    "name": "Pacific Avenue",
    "position": { "x": 0, "y": 9 },
    "type": "property"
  },
  {
    "name": "North Carolina Avenue",
    "position": { "x": 0, "y": 8 },
    "type": "property"
  },
  {
    "name": "Community Chest 3",
    "position": { "x": 0, "y": 7 },
    "type": "community_chest"
  },
  {
    "name": "Pennsylvania Avenue",
    "position": { "x": 0, "y": 6 },
    "type": "property"
  },
  {
    "name": "Short Line",
    "position": { "x": 0, "y": 5 },
    "type": "railroad"
  },
  {
    "name": "Chance 3",
    "position": { "x": 0, "y": 4 },
    "type": "chance"
  },
  {
    "name": "Park Place",
    "position": { "x": 0, "y": 3 },
    "type": "property"
  },
  {
    "name": "Luxury Tax",
    "position": { "x": 0, "y": 2 },
    "type": "tax"
  },
  {
    "name": "Boardwalk",
    "position": { "x": 0, "y": 1 },
    "type": "property"
  }
];

const playersData = [
  {
    "name": "Player 1",
    "position": { "x": 0, "y": 0 },
    "color": "#fff"
  },
  {
    "name": "Player 2",
    "position": { "x": 4, "y": 0 },
    "color": "#fff"
  }
];

function App() {
  return (
    <SidebarProvider>
      <AppProvider>
        <div className='w-full'>
          <Canvas camera={{ fov: 90, near: 0.1, far: 1000, position: new Vector3(5, 10, 10) }}>
            <CameraControls />

            <group>
              {sectorsData.map(({ name, position, type }) => {
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

                return (
                  <Sector
                    key={name}
                    id={name}
                    color={randomColor}
                    position={[position.x - FLOOR_SIZE / 4, SECTOR_ELEVATION, position.y - FLOOR_SIZE / 4]}
                    type={type}
                  />
                )
              })}
              <EntitiesGroup />
            </group>

            <group>
              {playersData.map(({ name, position, color }) => (
                <Player
                  key={name}
                  id={name}
                  color={color}
                  position={[position.x - FLOOR_SIZE / 4, PLAYER_ELEVATION, position.y - FLOOR_SIZE / 4]}
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
  )
}

export default App
