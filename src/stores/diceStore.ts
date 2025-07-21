import { createTimeline } from "animejs";
import { create } from "zustand";
import { Group } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { sleep } from "@/lib/utils";
import { rollDice as rollDiceAPI } from "@/lib/api";
import { resetNotificationsQuery } from "@/lib/queryClient";

const useDiceStore = create<{
  diceModel: Group | null;
  rollResult: number[];
  rollSum: () => number;
  rollId: number | null;
  isRandomOrgResult: boolean;
  randomOrgCheckForm: string | null;
  randomOrgFailReason: string | null;
  isRolling: boolean;
  error: string | null;
  rollDice: () => Promise<[number, number]>;
  setDiceModel: (object3D: Group) => void;
  setRollResult: (roll: number[]) => void;
  clearError: () => void;
  showRoll: boolean;
}>((set, get) => ({
  diceModel: null,
  rollResult: [],
  rollId: null,
  isRandomOrgResult: false,
  randomOrgCheckForm: null,
  randomOrgFailReason: null,
  isRolling: false,
  error: null,
  showRoll: false,

  rollSum: () => {
    const rollResult = get().rollResult;
    return rollResult.reduce((sum, die) => sum + die, 0);
  },

  setDiceModel: (object3D) => set({ diceModel: object3D }),
  clearError: () => set({ error: null }),

  setRollResult: (roll) => set({ rollResult: roll }),

  rollDice: async () => {
    const diceModel = get().diceModel;

    if (!diceModel) throw new Error(`Dice model not found.`);

    set({ isRolling: true, error: null, rollResult: [] });

    const animationStartTime = Date.now();
    animateDice(diceModel);

    try {
      const rollResult = await rollDiceAPI();
      resetNotificationsQuery();
      const elapsed = Date.now() - animationStartTime;
      await sleep(2000 - elapsed);

      set({
        rollResult: rollResult.data,
        rollId: rollResult.roll_id,
        isRandomOrgResult: rollResult.is_random_org_result,
        randomOrgCheckForm: rollResult.random_org_check_form || null,
        randomOrgFailReason: rollResult.random_org_fail_reason || null,
        showRoll: true,
      });

      // reset data to close the dice popup
      await sleep(2000);
      set({
        showRoll: false,
      });

      return rollResult.data;
    } catch (error) {
      console.error("Dice roll failed:", error);
      set({ error: "Не удалось выполнить бросок кубика. Попробуйте еще раз." });
      throw error;
    } finally {
      set({ isRolling: false, showRoll: false });
    }
  },
}));

async function animateDice(model: Group) {
  const xRotation = randInt(70, 100);
  const yRotation = randInt(70, 100);
  const zRotation = randInt(70, 100);

  const tl = createTimeline()
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
    });

  await new Promise((resolve) => {
    tl.play().then(resolve);
  });
}

export default useDiceStore;
