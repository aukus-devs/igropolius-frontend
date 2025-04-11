import { sectorsData, playersData } from "@/lib/mockData";
import CustomCameraControls from "./CustomCameraControls";
import Floor from "./Floor";
import Player from "./Player";
import Sector from "./Sector";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";

function Scene() {
  const { selectedSector, setSelectedSectorId } = useContext(AppContext);

  return (
    <>
      <CustomCameraControls />

      <group>
        {sectorsData.map((sector) => {
          return (
            <Sector
              {...sector}
              key={sector.id}
              onClick={() => setSelectedSectorId(sector.id)}
              onPointerOver={() => setSelectedSectorId(sector.id)}
              isSelected={selectedSector?.id === sector.id}
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
    </>
  )
}

export default Scene;
