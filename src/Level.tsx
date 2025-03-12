import { useMemo } from "react";
import { BlockSpinner } from "./blocks/BlockSpinner";
import { BlockAxe } from "./blocks/BlockAxe";
import { BlockLimbo } from "./blocks/BlockLimbo";
import { BlockStart } from "./blocks/BlockStart";
import { BlockEnd } from "./blocks/BlockEnd";
import { Bounds } from "./blocks/Bounds";

export function Level({
  count = 5,
  types = [BlockSpinner, BlockAxe, BlockLimbo],
}: {
  count?: number;
  types?: Array<React.ComponentType<{ position?: [number, number, number] }>>;
  seed?: number;
}) {
  const blocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }
    return blocks;
  }, [count, types]);

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
