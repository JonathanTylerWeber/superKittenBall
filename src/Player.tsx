import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier, RapierRigidBody } from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGame } from "./stores/useGame";
import { PlayerBall } from "./PlayerBall";

export default function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const body = useRef<RapierRigidBody | null>(null);
  const { rapier, world } = useRapier();

  const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
  const [smoothCameraTarget] = useState(() => new THREE.Vector3());

  const [currentAction, setCurrentAction] =
    useState<THREE.AnimationAction | null>(null);

  const [bodyKey, setBodyKey] = useState(0);

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  // const blocksCount = useGame((state) => state.blocksCount);

  const cat = useGLTF("./models/cat.glb");
  const catRef = useRef<THREE.Group | null>(null);

  const animations = useAnimations(cat.animations, catRef);

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

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();
    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };
    const impulseStrength = 0.8 * delta;
    const torqueStrength = 0.4 * delta;

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
      const velocity = body.current?.linvel();
      const horizontalVelocity = new THREE.Vector3(velocity.x, 0, velocity.z);
      const verticalVelocity = new THREE.Vector3(0, velocity.y, 0);
      const velocityMagnitude = horizontalVelocity.length();

      // Set thresholds for switching between animations
      const runThreshold = 0.5;

      let newAction: THREE.AnimationAction | null = null;

      // Switch animation based on horizontal velocity
      if (
        velocityMagnitude > runThreshold ||
        verticalVelocity.length() > 0.05
      ) {
        newAction = animations.actions["ArmatureAction"];
      } else {
        newAction = animations.actions["EmptyAction"];
      }

      // Crossfade between animations for smooth transition
      if (newAction !== currentAction) {
        if (currentAction) {
          currentAction.fadeOut(0.5);
        }
        newAction?.reset().fadeIn(0.5).play();
        setCurrentAction(newAction);
      }

      // Rotate the cat based on the direction of movement
      const moveDirection = new THREE.Vector3(velocity.x, 0, velocity.z);

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
      if (bodyPosition.z < -12 - 2) {
        end();
      }
      if (bodyPosition.y < -4) {
        restart();
      }

      if (catRef.current) {
        const catPosition = new THREE.Vector3().copy(bodyPosition);
        catPosition.y -= 0.2;
        catRef.current.position.copy(catPosition);
      }
    }
  });

  const jump = useCallback(() => {
    if (!body.current) return;
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);
    if (hit && hit.timeOfImpact < 0.15) {
      body.current.applyImpulse({ x: 0, y: 1, z: 0 }, true);
    }
  }, [rapier.Ray, world]);

  const reset = () => {
    setBodyKey((prevKey) => prevKey + 1);

    if (body.current) {
      body.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    if (catRef.current) {
      catRef.current.rotation.set(0, Math.PI * 0.5, 0); // Reset the cat's rotation (Math.PI * 0.5 makes it face forward)
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
  }, [subscribeKeys, start, jump]);

  return (
    <>
      <RigidBody
        key={bodyKey}
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
          <sphereGeometry args={[0.299, 32, 16]} />
          <meshStandardMaterial
            transparent={true}
            opacity={0.25}
            roughness={0}
            metalness={0.75}
          />
        </mesh>
        <PlayerBall />
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
