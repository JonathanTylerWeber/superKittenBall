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
  // Ref for our additional Y offset which we want to change gradually
  const extraYOffsetRef = useRef(0);

  const [currentAction, setCurrentAction] =
    useState<THREE.AnimationAction | null>(null);
  const [bodyKey, setBodyKey] = useState(0);

  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);

  const cat = useGLTF("./models/cat.glb");
  const catRef = useRef<THREE.Group | null>(null);

  const animations = useAnimations(cat.animations, catRef);

  // Apply color to the cat model when it's loaded
  useEffect(() => {
    if (catRef.current) {
      catRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.set(0x000000);
          }
        }
      });
    }
  }, [cat]);

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

      // Cat animation & rotation logic
      const velocity = body.current.linvel();
      const horizontalVelocity = new THREE.Vector3(velocity.x, 0, velocity.z);
      const verticalVelocity = new THREE.Vector3(0, velocity.y, 0);
      const velocityMagnitude = horizontalVelocity.length();
      const runThreshold = 0.5;
      let newAction: THREE.AnimationAction | null = null;
      if (
        velocityMagnitude > runThreshold ||
        verticalVelocity.length() > 0.05
      ) {
        newAction = animations.actions["ArmatureAction"];
      } else {
        newAction = animations.actions["EmptyAction"];
      }
      if (newAction !== currentAction) {
        if (currentAction) {
          currentAction.fadeOut(0.5);
        }
        newAction?.reset().fadeIn(0.5).play();
        setCurrentAction(newAction);
      }
      const moveDirection = new THREE.Vector3(velocity.x, 0, velocity.z);
      moveDirection.normalize();
      if (moveDirection.length() > 0 && catRef.current) {
        const angle = Math.atan2(moveDirection.z, moveDirection.x);
        catRef.current.rotation.y = -angle;
      }

      // Camera target position based on the player's body
      const bodyPosition = body.current.translation();
      const cameraPosition = new THREE.Vector3().copy(bodyPosition);
      cameraPosition.z += 2.25;
      cameraPosition.y += 0.65;

      // Gradually update the extra Y offset when phase === "ended"
      const targetExtraY = phase === "ended" ? 2 : 0;
      extraYOffsetRef.current = THREE.MathUtils.lerp(
        extraYOffsetRef.current,
        targetExtraY,
        0.05
      );
      cameraPosition.y += extraYOffsetRef.current;

      const cameraTarget = new THREE.Vector3().copy(bodyPosition);
      cameraTarget.y += 0.25;

      // Smoothly interpolate the camera's position and target
      smoothCameraPosition.lerp(cameraPosition, 5 * delta);
      smoothCameraTarget.lerp(cameraTarget, 5 * delta);
      state.camera.position.copy(smoothCameraPosition);

      // Only update the camera orientation if the game isn't ended.
      if (phase !== "ended") {
        state.camera.lookAt(smoothCameraTarget);
      }

      if (phase == "ended") {
        if (body.current) {
          // body.current.setTranslation({ x: 0, y: 0, z: 0 }, true);
          body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }

      // Game phase conditions
      // basic
      // if (bodyPosition.z < -2) {
      //   end();
      // }

      // full
      if (bodyPosition.z < -70) {
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
      catRef.current.rotation.set(0, Math.PI * 0.5, 0);
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
