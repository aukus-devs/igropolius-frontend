import { createTimeline } from "animejs";
import { create } from "zustand";
import { Group } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { sleep } from "@/lib/utils";

const useDiceStore = create<{
  diceModel: Group | null;
  rolledNumber: number | null;
  isRolling: boolean;
  rollDice: () => Promise<number>;
  setDiceModel: (object3D: Group) => void;
}>((set, get) => ({
  diceModel: null,
  rolledNumber: null,
  isRolling: false,

  setDiceModel: (object3D) => set({ diceModel: object3D }),

  rollDice: async () => {
    const diceModel = get().diceModel;

    if (!diceModel) throw new Error(`Dice model not found.`);

    animateDice(diceModel);
    await sleep(2000);

    const randomNumber = randInt(2, 12);
    set({ rolledNumber: randomNumber });
    await sleep(2000);
    set({ rolledNumber: null });

    return randomNumber;
  },
}));

function animateDice(model: Group) {
  const xRotation = randInt(70, 100);
  const yRotation = randInt(70, 100);
  const zRotation = randInt(70, 100);

  createTimeline()
    .add(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 300,
      easing: 'easeInOutCubic',
    })
    .add(model.rotation, {
      x: xRotation,
      y: yRotation,
      z: zRotation,
      duration: 1000,
      easing: 'easeInOutQuad',
    })
    .add(model.scale, {
      x: 0,
      y: 0,
      z: 0,
      delay: 400,
      duration: 300,
      easing: 'easeInOutCubic',
    })
    .play();
}

export default useDiceStore;
