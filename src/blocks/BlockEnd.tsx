// components/BlockEnd.tsx
import { useGLTF, Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { boxGeometry, floor1Material } from "./resources";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";

interface BlockEndProps {
  position?: [number, number, number];
}

export function BlockEnd({ position = [0, 0, 0] }: BlockEndProps) {
  const fish = useGLTF("./models/fish.glb");
  const fishRef = useRef<Group>(null);

  fish.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
  });

  // Update the fish's position each frame to create an up and down motion.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (fishRef.current) {
      // This creates a smooth oscillation (up and down) using a sine wave.
      // Here, 0.5 is the base height, 0.25 is the amplitude, and 2 is the speed factor.
      fishRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={position}>
      <Text
        scale={1}
        font="./bebas-neue-v9-latin-regular.woff"
        position={[0, 2.25, 2]}
      >
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text>
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={floor1Material}
          position={[0, 0, 0]}
          scale={[4, 0.2, 4]}
          receiveShadow
        />
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[0, 0.1, 0]}
        restitution={0.2}
        friction={0}
        colliders={false}
      >
        <primitive ref={fishRef} object={fish.scene} scale={0.5} />
      </RigidBody>
    </group>
  );
}
