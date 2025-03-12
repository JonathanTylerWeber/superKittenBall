// import { OrbitControls } from "@react-three/drei";
import Lights from "./Lights.jsx";
import { Level } from "./Level";
import { Physics } from "@react-three/rapier";
import Player from "./Player.jsx";
import { Environment } from "@react-three/drei";

export default function Experience() {
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
        <Level />
        <Player />
      </Physics>
    </>
  );
}
