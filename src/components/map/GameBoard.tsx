import { sectorsData } from '@/lib/mockData';
import { HALF_BOARD, STORAGE_BASE_URL } from '@/lib/constants';
import Sector from './sector/Sector';
import { calculatePlayerPosition, calculateSectorPosition, getSectorRotation } from './utils';
import usePlayerStore from '@/stores/playerStore';
import React, { useMemo } from 'react';
import PlayerModel from './models/PlayerModel';
import { Merged, useGLTF } from '@react-three/drei';
import { InstanceProps, ObjectMap } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import { GLTF } from 'three-stdlib';
import { useControls } from 'leva';

const buildingUrls = [
  `${STORAGE_BASE_URL}/models/buildings/ruins1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/small_buildingD1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/skyscraperE1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/skyscraperA1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/skyscraperB1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/skyscraperD1.glb`,
  `${STORAGE_BASE_URL}/models/buildings/skyscraperX.glb`,
];

function getBuildingMeshes(prefix: string, gltf: GLTF & ObjectMap) {
  const coloredMesh = gltf.meshes[prefix];
  const staticMesh = gltf.meshes[`${prefix}_1`];
  const outlineMesh = gltf.meshes[`${prefix}_outline`];

  for (const mesh of [coloredMesh, staticMesh]) {
    const material = mesh.material as MeshStandardMaterial;
    material.color.set('white');
  }

  return {
    [`${prefix}`]: coloredMesh,
    [`${prefix}_1`]: staticMesh,
    [`${prefix}_outline`]: outlineMesh,
  };
}

function GameBoard() {
  const playersData = usePlayerStore(state => state.players);
  const buildingsAmount = usePlayerStore(state => {
    return Object.values(state.buildingsPerSector)
      .map(buildings => {
        return buildings.length;
      })
      .reduce((a, b) => a + b, 0);
  });

  const [ruins, large, scraperE, scraperA, scraperF, scraperD, scraperX] = useGLTF(buildingUrls);
  const meshes = useMemo(
    () => ({
      ...getBuildingMeshes('ruins', ruins),
      ...getBuildingMeshes('small_buildingD', large),
      ...getBuildingMeshes('skyscraperE', scraperE),
      ...getBuildingMeshes('skyscraperA', scraperA),
      ...getBuildingMeshes('skyscraperB', scraperF),
      ...getBuildingMeshes('skyscraperD', scraperD),
      ...getBuildingMeshes('skyscraperX', scraperX),
    }),
    [ruins, large, scraperE, scraperA, scraperF, scraperD, scraperX]
  );

  const sectorSettings = useControls("Sector", {
    color: '#7fb58b',
    metalness: {
      value: 0,
      min: 0,
      max: 1,
    },
    roughness: {
      value: 1,
      min: 0,
      max: 1,
    }
  });

  return (
    <Merged meshes={meshes} key={buildingsAmount}>
      {models => (
        <group name="board" position={[-HALF_BOARD, 0, -HALF_BOARD]}>
          {sectorsData.map(sector => {
            const playersOnSector = playersData.filter(player => player.sector_id === sector.id);
            const sectorPosition = calculateSectorPosition(sector);
            const rotation = getSectorRotation(sector.position);

            return (
              <React.Fragment key={sector.id}>
                {playersOnSector.map((player, idx) => {
                  const playerPosition = calculatePlayerPosition(
                    idx,
                    playersOnSector.length,
                    sector
                  );
                  return (
                    <PlayerModel
                      key={player.id}
                      player={player}
                      position={playerPosition}
                      rotation={rotation}
                    />
                  );
                })}

                <Sector
                  sector={{...sector, settings: sectorSettings}}
                  position={sectorPosition}
                  rotation={rotation}
                  models={
                    models as React.FC<InstanceProps> & Record<string, React.FC<InstanceProps>>
                  }
                />
              </React.Fragment>
            );
          })}
        </group>
      )}
    </Merged>
  );
}

export default GameBoard;
