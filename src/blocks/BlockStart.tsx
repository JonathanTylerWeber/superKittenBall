// BlockStart.tsx
import { Float, Text } from "@react-three/drei";
import { boxGeometry, floor1Material } from "./resources";
import { RigidBody } from "@react-three/rapier";

interface BlockStartProps {
  position?: [number, number, number];
}

export function BlockStart({ position = [0, 0, 0] }: BlockStartProps) {
  return (
    <group position={position}>
      <Float floatIntensity={0.25} rotationIntensity={0.25}>
        <Text
          scale={0.5}
          font="./bebas-neue-v9-latin-regular.woff"
          maxWidth={0.25}
          lineHeight={0.75}
          textAlign="right"
          position={[0.75, 0.65, 0]}
          rotation-y={-0.25}
        >
          Super Kitten Ball
          <meshBasicMaterial toneMapped={false} />
        </Text>
      </Float>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={floor1Material}
          position={[0, -0.1, 0]}
          scale={[4, 0.2, 4]}
          receiveShadow
        />
      </RigidBody>
    </group>
  );
}
