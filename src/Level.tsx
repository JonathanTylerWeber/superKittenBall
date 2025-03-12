import { BlockSpinner } from "./blocks/BlockSpinner";
// import { BlockAxe } from "./blocks/BlockAxe";
import { BlockLimbo } from "./blocks/BlockLimbo";
import { BlockStart } from "./blocks/BlockStart";
import { BlockEnd } from "./blocks/BlockEnd";
import { Block } from "./blocks/Block";

export function Level() {
  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      <BlockSpinner position={[-1, 0.5, -6]} />
      <Block position={[0, 1, -10]} scale={[1, 0.2, 4]} />
      <BlockLimbo position={[1, 1.5, -14]} />
      <BlockEnd position={[0, 2, -18]} />
      {/* <Bounds length={3 + 2} /> */}
    </>
  );
}
