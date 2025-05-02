import { create } from "zustand";
import { Euler, Group, Quaternion, Vector3 } from "three";
import { createTimeline } from "animejs";
import useModelsStore from "./modelsStore";
import usePlayerStore from "./playerStore";
import { HALF_BOARD, TrainsConfig } from "@/lib/constants";
import { SectorsById } from "@/lib/mockData";
import { calculatePlayerPosition, getSectorRotation } from "@/components/map/utils";

type TrainConfig = {
  id: number;
  startPosition: Vector3;
  endPosition: Vector3;
  model: Group;
}

const useTrainsStore = create<{
  trains: { [key: number]: TrainConfig };
  addTrain: (id: number, startPosition: Vector3, endPosition: Vector3, model: Group) => void;
  moveTrain: (id: number) => void;
}>((set, get) => ({
  trains: {},

  addTrain: (id: number, startPosition: Vector3, endPosition: Vector3, model: Group) =>
    set((state) => ({
      trains: { ...state.trains, [id]: { id, startPosition, endPosition, model } }
    })),

  moveTrain: (trainId: number) => {
    const train = get().trains[trainId];
    if (!train) throw new Error(`Train with id ${trainId} not found`);

    const playerModel = useModelsStore.getState().getPlayerModel(usePlayerStore.getState().myPlayerId!);
    const carriageModel = train.model.getObjectByName('carriage');

    const carriageWorldPosition = new Vector3();
    const initialPlayerRotation = new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0));

    carriageModel?.getWorldPosition(carriageWorldPosition);
    carriageWorldPosition.y += 0.4;
    carriageWorldPosition.x += HALF_BOARD;
    carriageWorldPosition.z += HALF_BOARD;

    const destinationSector = SectorsById[TrainsConfig[trainId].sectorTo];
    const destinationSectorPlayers = usePlayerStore.getState().players.filter(
      (player) => player.current_position === destinationSector.id,
    );
    const destinationPosition = calculatePlayerPosition(
      destinationSectorPlayers.length,
      destinationSectorPlayers.length,
      destinationSector,
    );
    const destinationRotation = getSectorRotation(destinationSector.position);
    const dest = new Quaternion().setFromEuler(new Euler(...destinationRotation, "XYZ"));
    const destinationQuat = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0, "XYZ"));

    usePlayerStore.setState({ isPlayerMoving: true });

    createTimeline()
      .add(playerModel.position, {
        y: playerModel.position.y + 3,
        duration: 300,
      })
      .add(playerModel.position, {
        x: carriageWorldPosition.x,
        z: carriageWorldPosition.z,
        duration: 500,
        onUpdate: ({ progress }) => {
          playerModel.children[0].quaternion.rotateTowards(initialPlayerRotation, progress);
        }
      })
      .add(playerModel.position, {
        y: playerModel.position.y + 0.4,
        duration: 300,
      })
      .add(train.model.position, {
        x: train.endPosition.x,
        y: train.endPosition.y,
        z: train.endPosition.z,
        ease: 'linear',
        duration: 3000,
        onUpdate: () => {
          carriageModel?.getWorldPosition(carriageWorldPosition);
          carriageWorldPosition.x += HALF_BOARD;
          carriageWorldPosition.z += HALF_BOARD;

          playerModel.position.x = carriageWorldPosition.x;
          playerModel.position.z = carriageWorldPosition.z;
        },
        onComplete: () => {
          setTimeout(() => {
            train.model.position.copy(train.startPosition);
          }, 1000);

          createTimeline()
            .add(playerModel.position, {
              y: playerModel.position.y + 3,
              duration: 300,
            })
            .add(playerModel.position, {
              x: destinationPosition[0],
              z: destinationPosition[2],
              duration: 500,
              onUpdate: ({ progress }) => {
                playerModel.quaternion.rotateTowards(dest, progress);
                playerModel.children[0].quaternion.rotateTowards(destinationQuat, progress);
              }
            })
            .add(playerModel.position, {
              y: playerModel.position.y - 0.4,
              duration: 300,
            })
            .then(() => {
              usePlayerStore.setState({ isPlayerMoving: false });
              usePlayerStore.getState().updateMyPlayerSectorId(destinationSector.id);
            })
        }
      });
  }
}));

export default useTrainsStore;
