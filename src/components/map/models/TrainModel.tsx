import { Gltf } from "@react-three/drei";
import { STORAGE_BASE_URL } from "@/lib/constants";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import useTrainsStore from "@/stores/trainStore";

const TrainUrl = `${STORAGE_BASE_URL}/models/trains/train-electric-bullet-a.glb`;
const CarriageUrl = `${STORAGE_BASE_URL}/models/trains/train-carriage-flatbed.glb`;

function TrainModel({ id }: { id: number }) {
  const scene = useThree((state) => state.scene);
  const addTrain = useTrainsStore((state) => state.addTrain);
  const trainRef = useRef<Group>(null);

  useEffect(() => {
    if (!trainRef.current) return;

    const firstRailModel = scene.getObjectByName(`rail-${id}-first`);
    const lastRailModel = scene.getObjectByName(`rail-${id}-last`);
    if (!firstRailModel || !lastRailModel) return;

    const startPosition = new Vector3();
    const endPosition = new Vector3();

    firstRailModel.getWorldQuaternion(trainRef.current.quaternion);
    firstRailModel.getWorldPosition(trainRef.current.position);
    firstRailModel.getWorldPosition(startPosition);
    lastRailModel.getWorldPosition(endPosition);

    addTrain(id, startPosition, endPosition, trainRef.current);
  }, [trainRef, scene, addTrain, id]);

  return (
    <group name={`train-${id}`} ref={trainRef}>
      <Gltf name="head" src={TrainUrl} />
      <Gltf name="carriage" src={CarriageUrl} position={[0, 0, -2.75]} />
    </group>
  );
}

export default TrainModel;

