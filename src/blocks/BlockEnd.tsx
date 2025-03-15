// components/BlockEnd.tsx
import { useGLTF, Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { boxGeometry, floor1Material } from "./resources";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import { useGame } from "../stores/useGame";

import * as THREE from "three";

interface BlockEndProps {
  position?: [number, number, number];
}

export function BlockEnd({ position = [0, 0, 0] }: BlockEndProps) {
  const fish = useGLTF("./models/fish.glb");
  const fishRef = useRef<Group>(null);
  const extraYOffsetRef = useRef(0);

  const phase = useGame((state) => state.phase);

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

    const targetExtraY = phase === "ended" ? 2 : 0;
    extraYOffsetRef.current = THREE.MathUtils.lerp(
      extraYOffsetRef.current,
      targetExtraY,
      0.05
    );
    if (fishRef.current) {
      fishRef.current.position.y += extraYOffsetRef.current;
    }

    // When phase is 'ended', make the fish spin once
    if (phase === "ended" && fishRef.current) {
      // Apply a single 360-degree rotation
      const rotationDuration = 2; // Duration for the spin in seconds
      const totalRotation = Math.PI * 2; // Full 360-degree rotation in radians

      // Calculate how much to rotate based on elapsed time and the desired duration
      const rotationAmount =
        Math.min((t % rotationDuration) / rotationDuration, 1) * totalRotation;

      fishRef.current.rotation.y = rotationAmount;
    } else if (fishRef.current) {
      fishRef.current.rotation.y = 0;
    }
  });

  return (
    <group position={position}>
      {/* <Text
        scale={1}
        font="./bebas-neue-v9-latin-regular.woff"
        position={[0, 2.25, 2]}
      >
        FINISH
        <meshBasicMaterial toneMapped={false} />
      </Text> */}
      <RigidBody type="fixed" restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={floor1Material}
          position={[0, -0.1, 0]}
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
