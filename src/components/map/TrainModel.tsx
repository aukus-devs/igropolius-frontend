import { Gltf } from "@react-three/drei";
import { STORAGE_BASE_URL } from "@/lib/constants";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";
import { Group, Quaternion, Vector3 } from "three";

const TrainUrl = `${STORAGE_BASE_URL}/models/trains/train-electric-bullet-a.glb`;

function TrainModel({ ...props }) {
  const scene = useThree((state) => state.scene);
  const trainRef = useRef<Group>(null);

  useEffect(() => {
    if (trainRef.current === null) return;

    const initialRailModel = scene.getObjectByName(`rail-0-first`);
    if (!initialRailModel) return;
    const tl = createTimeline({ loop: true, autoplay: true });

    initialRailModel.getWorldPosition(trainRef.current.position);

    for (const track of [0, 1, 2, 3]) {
      const firstRailModel = scene.getObjectByName(`rail-${track}-first`);
      const lastRailModel = scene.getObjectByName(`rail-${track}-last`);
      if (!firstRailModel || !lastRailModel) continue;

      const startPosition = new Vector3();
      const endPosition = new Vector3();
      const rotation = new Quaternion();

      firstRailModel.getWorldPosition(startPosition);
      lastRailModel.getWorldPosition(endPosition);
      firstRailModel.getWorldQuaternion(rotation);

      tl
        .add(trainRef.current.position, {
          x: startPosition.x,
          z: startPosition.z,
          duration: 500,
          onUpdate: ({ progress }) => {
            trainRef.current!.quaternion.rotateTowards(rotation, progress);
          }
        })
        .add(trainRef.current.position, {
          y: trainRef.current.position.y,
          duration: 300
        })
        .add(trainRef.current.position, {
          x: endPosition.x,
          y: endPosition.y,
          z: endPosition.z,
          ease: 'linear',
          duration: 5000,
        })
        .add(trainRef.current.position, {
          y: trainRef.current.position.y + 3,
          duration: 300,
        })

      if (track === 3) {
        const finalPosition = new Vector3();
        const finalRotation = new Quaternion();
        initialRailModel.getWorldPosition(finalPosition)
        initialRailModel.getWorldQuaternion(finalRotation);

        tl.add(trainRef.current.position, {
          x: finalPosition.x,
          z: finalPosition.z,
          duration: 500,
          onUpdate: ({ progress }) => {
            trainRef.current!.quaternion.rotateTowards(finalRotation, progress);
          }
        })
          .add(trainRef.current.position, {
            y: trainRef.current.position.y,
            duration: 300,
          })
      }
    }
  }, [trainRef, scene]);

  return (
    <Gltf ref={trainRef} {...props} src={TrainUrl} />
  );
}

export default TrainModel;

