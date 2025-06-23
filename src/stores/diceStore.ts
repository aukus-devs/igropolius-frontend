import { createTimeline } from "animejs";
import { create } from "zustand";
import { Group } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { sleep } from "@/lib/utils";
import { rollDice as rollDiceAPI } from "@/lib/api";

const useDiceStore = create<{
  diceModel: Group | null;
  rolledNumber: number | null;
  rollId: number | null;
  isRandomOrgResult: boolean;
  randomOrgCheckForm: string | null;
  isRolling: boolean;
  error: string | null;
  rollDice: () => Promise<number>;
  setDiceModel: (object3D: Group) => void;
  clearError: () => void;
}>((set, get) => ({
  diceModel: null,
  rolledNumber: null,
  rollId: null,
  isRandomOrgResult: false,
  randomOrgCheckForm: null,
  isRolling: false,
  error: null,

  setDiceModel: (object3D) => set({ diceModel: object3D }),
  clearError: () => set({ error: null }),

  rollDice: async () => {
    const diceModel = get().diceModel;

    if (!diceModel) throw new Error(`Dice model not found.`);

    set({ isRolling: true, error: null });

    try {
      animateDice(diceModel);
      await sleep(2000);

      const rollResult = await rollDiceAPI();
      const totalValue = rollResult.data[0] + rollResult.data[1];

      set({
        rolledNumber: totalValue,
        rollId: rollResult.roll_id,
        isRandomOrgResult: rollResult.is_random_org_result,
        randomOrgCheckForm: rollResult.random_org_check_form || null,
      });

      await sleep(2000);
      set({ 
        rolledNumber: null,
        rollId: null,
        isRandomOrgResult: false,
        randomOrgCheckForm: null,
      });

      return totalValue;
    } catch (error) {
      console.error('Dice roll failed:', error);
      set({ error: 'Не удалось выполнить бросок кубика. Попробуйте еще раз.' });
      throw error;
    } finally {
      set({ isRolling: false });
    }
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
      easing: "easeInOutCubic",
    })
    .add(model.rotation, {
      x: [0, xRotation],
      y: [0, yRotation],
      z: [0, zRotation],
      duration: 1000,
      easing: "easeInOutQuad",
    })
    .add(model.scale, {
      x: 0,
      y: 0,
      z: 0,
      delay: 400,
      duration: 300,
      easing: "easeInOutCubic",
    })
    .play();
}

export default useDiceStore;
