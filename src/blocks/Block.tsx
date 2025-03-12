import { RigidBody } from "@react-three/rapier";
import { boxGeometry, floor2Material } from "./resources";

interface BlockLimboProps {
  position?: [number, number, number];
  scale?: [number, number, number];
}

export function Block({
  position = [0, 0, 0],
  scale = [4, 0.2, 4],
}: BlockLimboProps) {
  return (
    <group position={position}>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={floor2Material}
          position={[0, -0.1, 0]}
          scale={scale}
          receiveShadow
        />
      </RigidBody>
    </group>
  );
}
