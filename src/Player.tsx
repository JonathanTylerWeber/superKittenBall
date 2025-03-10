import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier, RapierRigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGame } from "./stores/useGame";

export default function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const body = useRef<RapierRigidBody | null>(null);
  const { rapier, world } = useRapier();

  const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
  const [smoothCameraTarget] = useState(() => new THREE.Vector3());

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);

  const cat = useGLTF("./cat.glb");
  console.log(cat);
  const catRef = useRef<THREE.Group | null>(null);

  const { actions } = useAnimations(cat.animations, catRef);

  // Apply color to the cat model when it's loaded
  useEffect(() => {
    if (catRef.current) {
      // Traverse the model's children and apply color to any meshes
      catRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Ensure the material is a MeshStandardMaterial and set the color
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.set(0x000000); // Apply red color
          }
        }
      });
    }
  }, [cat]); // Only apply when the cat model is loaded

  // Play the animation once the model is loaded
  // useEffect(() => {
  //   if (actions && actions["ArmatureAction"]) {
  //     // Play the animation when the model and actions are loaded
  //     actions["ArmatureAction"].play();
  //   }
  // }, [actions]); // Ensure this runs only when actions are available

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };
    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    // cat rotation basedd on input
    // Determine the direction based on key inputs
    // const moveDirection = new THREE.Vector3();

    // if (forward) {
    //   moveDirection.z += 1;
    // }
    // if (backward) {
    //   moveDirection.z -= 1;
    // }
    // if (leftward) {
    //   moveDirection.x -= 1;
    // }
    // if (rightward) {
    //   moveDirection.x += 1;
    // }

    // // Normalize the direction to avoid faster diagonal movement
    // moveDirection.normalize();

    // if (moveDirection.length() > 0) {
    //   // Update the cat's rotation to face the movement direction
    //   if (catRef.current) {
    //     const angle = Math.atan2(moveDirection.z, moveDirection.x);
    //     catRef.current.rotation.y = angle; // Update the Y rotation to make the cat face the direction
    //   }
    // }

    //
    //
    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }
    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }
    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (body.current) {
      body.current.applyImpulse(impulse, true);
      body.current.applyTorqueImpulse(torque, true);

      // cat
      // Get the velocity vector
      const velocity = body.current.linvel();
      const moveDirection = new THREE.Vector3(velocity.x, 0, velocity.z);

      // Calculate the magnitude (length) of the velocity vector
      const velocityMagnitude = moveDirection.length();

      // Use a small threshold to detect significant movement (e.g., 0.1)
      const movementThreshold = 0.5; // Threshold for detecting movement

      if (actions && actions["ArmatureAction"] && actions["EmptyAction"]) {
        if (velocityMagnitude > movementThreshold) {
          // If the object is moving, play ArmatureAction (running)
          if (actions["EmptyAction"].isRunning()) {
            actions["EmptyAction"].stop();
          }
          if (!actions["ArmatureAction"].isRunning()) {
            actions["ArmatureAction"].play();
            actions["ArmatureAction"].crossFadeFrom(
              actions["EmptyAction"],
              0.3,
              true
            );
          }
        } else {
          // If the object is not moving, play EmptyAction (idle)
          if (actions["ArmatureAction"].isRunning()) {
            actions["ArmatureAction"].stop();
          }
          if (!actions["EmptyAction"].isRunning()) {
            actions["EmptyAction"].play();
            actions["EmptyAction"].crossFadeFrom(
              actions["ArmatureAction"],
              0.3,
              true
            );
          }
        }
      }

      // Rotate the cat based on the direction of movement
      moveDirection.normalize();
      if (moveDirection.length() > 0 && catRef.current) {
        const angle = Math.atan2(moveDirection.z, moveDirection.x);
        catRef.current.rotation.y = -angle; // Update the Y rotation to face the direction
      }

      // Camera
      const bodyPosition = body.current.translation();
      const cameraPosition = new THREE.Vector3().copy(bodyPosition);
      cameraPosition.z += 2.25;
      cameraPosition.y += 0.65;

      const cameraTarget = new THREE.Vector3().copy(bodyPosition);
      cameraTarget.y += 0.25;

      smoothCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothCameraTarget.lerp(cameraTarget, 5 * delta);

      state.camera.position.copy(smoothCameraPosition);
      state.camera.lookAt(smoothCameraTarget);

      // Phases
      if (bodyPosition.z < -(blocksCount * 4 + 2)) {
        end();
      }
      if (bodyPosition.y < -4) {
        restart();
      }

      if (catRef.current) {
        const catPosition = new THREE.Vector3().copy(bodyPosition);
        catPosition.y -= 0.2;
        catRef.current.position.copy(catPosition);

        // Optionally, if you want to prevent rotation of the cat:
        // catRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  const jump = () => {
    if (!body.current) return;
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);
    if (hit && hit.timeOfImpact < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 }, true);
    }
  };

  const reset = () => {
    if (body.current) {
      body.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
    if (catRef.current) {
      catRef.current.rotation.set(0, Math.PI * 0.5, 0); // Reset the cat's rotation (Math.PI * 0.5 makes it face forward in your case)
    }
  };

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") {
          reset();
        }
      }
    );

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) {
          jump();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    return () => {
      unsubscribeReset();
      unsubscribeJump();
      unsubscribeAny();
    };
  }, [subscribeKeys, start]);

  return (
    <>
      <RigidBody
        ref={body}
        canSleep={false}
        position={[0, 1, 0]}
        colliders="ball"
        restitution={0.2}
        friction={1}
        linearDamping={0.5}
        angularDamping={0.5}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.3, 32, 16]} />
          <meshStandardMaterial transparent={true} opacity={0.5} />
        </mesh>
      </RigidBody>
      <primitive
        ref={catRef}
        object={cat.scene}
        scale={0.69}
        rotation={[0, Math.PI * 0.5, 0]}
      />
    </>
  );
}
