import { useMemo } from "react";
import { BlockSpinner } from "./blocks/BlockSpinner";
import { BlockAxe } from "./blocks/BlockAxe";
import { BlockLimbo } from "./blocks/BlockLimbo";
import { BlockStart } from "./blocks/BlockStart";
import { BlockEnd } from "./blocks/BlockEnd";
import { Bounds } from "./blocks/Bounds";
// Import your local Bounds component instead of from "@react-three/drei"

export function Level({
  count = 5,
  types = [BlockSpinner, BlockAxe, BlockLimbo],
  // seed is declared here but not used—remove it from dependencies if not needed
  seed = 0,
}: {
  count?: number;
  types?: Array<React.ComponentType<{ position?: [number, number, number] }>>;
  seed?: number;
}) {
  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      // Randomly pick one of the obstacle types
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }
    return blocks;
  }, [count, types, seed]); // Removed seed since it’s not used

  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      {blocks.map((Block, index) => (
        <Block key={index} position={[0, 0, -(index + 1) * 4]} />
      ))}
      <BlockEnd position={[0, 0, -(count + 1) * 4]} />
      <Bounds length={count + 2} />
    </>
  );
}
