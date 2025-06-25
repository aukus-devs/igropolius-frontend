import { create } from "zustand";
import { Euler, Group, Quaternion, Vector3 } from "three";
import { createTimeline } from "animejs";
import useModelsStore from "./modelsStore";
import usePlayerStore from "./playerStore";
import { HALF_BOARD, TrainsConfig } from "@/lib/constants";
import { SectorsById } from "@/lib/mockData";
import { calculatePlayerPosition, getSectorRotation } from "@/components/map/utils";
import useCameraStore from "./cameraStore";
import { makePlayerMove } from "@/lib/api";

type TrainConfig = {
  id: number;
  startPosition: Vector3;
  endPosition: Vector3;
  model: Group;
};

const useTrainsStore = create<{
  trains: { [key: number]: TrainConfig };
  addTrain: (id: number, startPosition: Vector3, endPosition: Vector3, model: Group) => void;
  rideTrain: (id: number) => void;
}>((set, get) => ({
  trains: {},

  addTrain: (id: number, startPosition: Vector3, endPosition: Vector3, model: Group) =>
    set((state) => ({
      trains: { ...state.trains, [id]: { id, startPosition, endPosition, model } },
    })),

  rideTrain: async (trainId: number) => {
    const train = get().trains[trainId];
    if (!train) throw new Error(`Train with id ${trainId} not found`);

    const myPlayer = usePlayerStore.getState().myPlayer;
    const myPlayerId = myPlayer?.id;
    if (!myPlayerId) throw new Error(`My player not found`);

    await makePlayerMove({
      type: "train-ride",
      bonuses_used: [],
      selected_die: null,
      adjust_by_1: null,
    });

    usePlayerStore.setState({ isPlayerMoving: true });

    const playerModel = useModelsStore.getState().getPlayerModel(myPlayerId);
    const playerMesh = playerModel.children[0];
    const carriageModel = train.model.getObjectByName("carriage");

    const carriageWorldPosition = new Vector3();
    const initialPlayerRotation = new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0));

    carriageModel?.getWorldPosition(carriageWorldPosition);
    carriageWorldPosition.x += HALF_BOARD;
    carriageWorldPosition.z += HALF_BOARD;

    const destinationSector = SectorsById[TrainsConfig[trainId].sectorTo];
    const destinationSectorPlayers = usePlayerStore
      .getState()
      .players.filter((player) => player.sector_id === destinationSector.id);
    const destinationPosition = calculatePlayerPosition(
      destinationSectorPlayers.length,
      destinationSectorPlayers.length,
      destinationSector,
    );
    const destinationRotation = getSectorRotation(destinationSector.position);
    const playerGroupQuat = new Quaternion().setFromEuler(
      new Euler(...destinationRotation, "XYZ"),
    );
    const playerMeshQuat = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0, "XYZ"));
    const { moveToPlayer } = useCameraStore.getState();

    createTimeline({
      onUpdate: () => moveToPlayer(playerModel, false),
    })
      .add(playerModel.position, {
        y: playerModel.position.y + 3,
        duration: 300,
      })
      .add(playerModel.position, {
        x: carriageWorldPosition.x,
        z: carriageWorldPosition.z,
        duration: 500,
        onUpdate: ({ progress }) => {
          playerMesh.quaternion.rotateTowards(initialPlayerRotation, progress);
        },
      })
      .add(playerModel.position, {
        y: playerModel.position.y + 0.4,
        duration: 300,
      })
      .add(train.model.position, {
        x: train.endPosition.x,
        y: train.endPosition.y,
        z: train.endPosition.z,
        ease: "linear",
        duration: 3000,
        onUpdate: () => {
          carriageModel?.getWorldPosition(carriageWorldPosition);
          carriageWorldPosition.x += HALF_BOARD;
          carriageWorldPosition.z += HALF_BOARD;

          playerModel.position.x = carriageWorldPosition.x;
          playerModel.position.z = carriageWorldPosition.z;
        },
        onComplete: () => {
          createTimeline({
            onUpdate: () => moveToPlayer(playerModel, false),
          })
            .add(playerModel.position, {
              y: playerModel.position.y + 3,
              duration: 300,
            })
            .add(playerModel.position, {
              x: destinationPosition[0],
              z: destinationPosition[2],
              duration: 500,
              onUpdate: ({ progress }) => {
                playerModel.quaternion.rotateTowards(playerGroupQuat, progress);
                playerMesh.quaternion.rotateTowards(playerMeshQuat, progress);
              },
            })
            .add(playerModel.position, {
              y: playerModel.position.y - 0.4,
              duration: 300,
            })
            .then(async () => {
              train.model.position.copy(train.startPosition);
              usePlayerStore.getState().updateMyPlayerSectorId(destinationSector.id);
              try {
                await usePlayerStore.getState().setNextTurnState({
                  prevSectorId: myPlayer.sector_id,
                });
              } finally {
                usePlayerStore.setState({ isPlayerMoving: false });
              }
            });
        },
      });
  },
}));

export default useTrainsStore;
