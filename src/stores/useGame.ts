import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface GameState {
  blocksCount: number;
  blocksSeed: number;
  startTime: number;
  endTime: number;
  phase: "ready" | "playing" | "ended";
  start: () => void;
  restart: () => void;
  end: () => void;
}

export const useGame = create<
  GameState,
  [["zustand/subscribeWithSelector", never]]
>(
  subscribeWithSelector((set) => ({
    blocksCount: 10,
    blocksSeed: 0,
    startTime: 0,
    endTime: 0,
    phase: "ready",

    start: () => {
      set((state: GameState) => {
        if (state.phase === "ready") {
          return { phase: "playing", startTime: Date.now() };
        }
        return {};
      });
    },

    restart: () => {
      set((state: GameState) => {
        if (state.phase === "playing" || state.phase === "ended") {
          return { phase: "ready", blocksSeed: Math.random() };
        }
        return {};
      });
    },

    end: () => {
      set((state: GameState) => {
        if (state.phase === "playing") {
          return { phase: "ended", endTime: Date.now() };
        }
        return {};
      });
    },
  }))
);
