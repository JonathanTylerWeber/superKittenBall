import * as THREE from "three";

export const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

export const floor1Material = new THREE.MeshStandardMaterial({
  color: "limegreen",
});

export const floor2Material = new THREE.MeshStandardMaterial({
  color: "greenyellow",
});

export const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: "orangered",
});

export const wallMaterial = new THREE.MeshStandardMaterial({
  color: "slategrey",
});
