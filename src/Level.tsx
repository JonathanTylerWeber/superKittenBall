import { BlockSpinner } from "./blocks/BlockSpinner";
import { BlockAxe } from "./blocks/BlockAxe";
import { BlockLimbo } from "./blocks/BlockLimbo";
import { BlockStart } from "./blocks/BlockStart";
import { BlockEnd } from "./blocks/BlockEnd";
import { Block } from "./blocks/Block";

export function Level() {
  return (
    <>
      {/* basic layout */}
      {/* <BlockStart position={[0, 0, 0]} />
      <BlockSpinner position={[-1, 0.5, -6]} />
      <Block position={[0, 1, -12]} scale={[0.25, 0.2, 4]} rotation={0.2} />
      <BlockLimbo position={[1, 1.5, -18]} />
      <BlockEnd position={[0, 2, -22]} /> */}

      {/* basic layout */}
      {/* <BlockStart position={[0, 0, 0]} />
      <BlockEnd position={[0, 0, -4]} /> */}

      {/* full layout */}
      <BlockStart position={[0, 0, 0]} />
      <Block position={[0, -0.6, -4]} scale={[4, 0.2, 4]} rotation={-0.3} />
      <Block position={[0, -1.82, -7.9]} scale={[4, 0.2, 4]} rotation={-0.3} />
      <Block position={[0, -3.05, -11.8]} scale={[4, 0.2, 4]} rotation={-0.3} />
      <Block position={[0, -3.65, -15.7]} scale={[4, 0.2, 4]} />
      <Block position={[0, -3.65, -26]} scale={[4, 0.2, 4]} />
      <BlockSpinner position={[4, -3, -26]} />
      <BlockLimbo position={[4, -3, -30]} />
      <BlockAxe position={[4, -3, -34]} />
      <Block position={[4, -3, -40]} scale={[2, 0.2, 2]} />
      <Block position={[4, -3, -44]} scale={[2, 0.2, 2]} />
      <Block position={[4, -3, -48]} scale={[2, 0.2, 2]} />
      <Block position={[4, -3, -52]} scale={[0.5, 0.2, 4]} />
      <Block position={[4, -3, -56]} scale={[0.5, 0.2, 4]} />
      <Block position={[4, -3, -60]} scale={[0.25, 0.2, 4]} />
      <Block position={[4, -3, -64]} scale={[0.25, 0.2, 4]} />
      <BlockEnd position={[4, -3, -70]} />
    </>
  );
}
