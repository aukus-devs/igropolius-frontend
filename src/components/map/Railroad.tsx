import { BOARD_SIZE, SECTOR_CONTENT_ELEVATION, SECTORS_PER_SIDE, STORAGE_BASE_URL, TrainsConfig } from '@/lib/constants';
import { Instance, Instances, useGLTF } from '@react-three/drei'
import { Vector3Array } from '@/lib/types';
import TrainModel from './models/TrainModel';

const RailUrl = `${STORAGE_BASE_URL}/models/trains/railroad-straight.glb`;

const roadOffset = BOARD_SIZE / 2 + 1;
const railroadLength = Math.floor(SECTORS_PER_SIDE / 2) * 3 + 1;
const positions: Vector3Array[] = [
  [0, SECTOR_CONTENT_ELEVATION, -roadOffset],
  [roadOffset, SECTOR_CONTENT_ELEVATION, 0],
  [0, SECTOR_CONTENT_ELEVATION, roadOffset],
  [-roadOffset, SECTOR_CONTENT_ELEVATION, 0],
];
const rotations: Vector3Array[] = [
  [0, Math.PI / 4, 0],
  [0, Math.PI * 7 / 4, 0],
  [0, Math.PI * 5 / 4, 0],
  [0, Math.PI * 3 / 4, 0],
];

export function Railroad() {
  const { nodes, materials } = useGLTF(RailUrl);

  return (
    <>
      <TrainModel id={6} />
      <TrainModel id={16} />
      <TrainModel id={26} />
      <TrainModel id={36} />

      <Instances
        // @ts-expect-error might be undefined
        geometry={nodes['railroad-straight_1'].geometry}
        material={materials.colormap}
        dispose={null}
      >
        {Object.keys(TrainsConfig).map((key, j) => {
          return (
            <group key={j} position={positions[j]} rotation={rotations[j]}>
              {Array.from({ length: railroadLength }, (_, i) => i).map((i) => (
                <Instance
                  key={`${j}-${i}`}
                  name={`rail-${key}-${i === 1 ? 'first' : i === railroadLength - 1 ? 'last' : i}`}
                  position={[0, 0, i * 4]}
                />
              ))}
            </group>
          )
        })}
      </Instances>
    </>
  )
}

useGLTF.preload(RailUrl)
