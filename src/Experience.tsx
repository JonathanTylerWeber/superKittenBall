// import { OrbitControls } from "@react-three/drei";
import Lights from "./Lights.jsx";
import { Level } from "./Level";
import { Physics } from "@react-three/rapier";
import Player from "./Player.jsx";
import { useGame } from "./stores/useGame.js";
import { Environment } from "@react-three/drei";

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame((state) => state.blocksSeed);

  return (
    <>
      {/* <OrbitControls makeDefault /> */}

      {/* <color args={["#bdedfc"]} attach="background" /> */}

      <Environment
        files="./autumn_field_puresky_1k.hdr"
        background={true}
        environmentIntensity={0}
      />

      <Physics debug={true}>
        <Lights />
        <Level count={blocksCount} seed={blocksSeed} />
        <Player />
      </Physics>
    </>
  );
}
