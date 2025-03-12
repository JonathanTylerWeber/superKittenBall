import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const cardboardTexture = textureLoader.load("./textures/cardboard.jpg");
cardboardTexture.colorSpace = THREE.SRGBColorSpace;

export const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

export const floor1Material = new THREE.MeshStandardMaterial({
  map: cardboardTexture,
});

export const floor2Material = new THREE.MeshStandardMaterial({
  map: cardboardTexture,
});

export const obstacleMaterial = new THREE.MeshStandardMaterial({
  color: "orangered",
});

export const wallMaterial = new THREE.MeshStandardMaterial({
  color: "slategrey",
});
