import * as THREE from "three";

export const PlayerBall = () => {
  const fragmentShader = `
  uniform float opacityFactor;
  varying vec3 vPosition;
  varying vec3 vNormal; // The passed normal from the vertex shader

  void main() {
    // Calculate the smooth opacity transition based on the normal's direction (outer surface)
    float smoothOpacity = mix(opacityFactor, 0.5, smoothstep(-0.5, 0.3, vNormal.y));

    // Purple on the bottom (y < 0), light transparent color on top (y >= 0)
    vec3 color = (vPosition.y < 0.0) ? vec3(0.5, 0.0, 0.5) : vec3(0.8, 0.8, 0.8);

    gl_FragColor = vec4(color, smoothOpacity);
  }
`;

  const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vPosition = position; // Pass the vertex position to the fragment shader
    vNormal = normalize(normal); // Pass the normalized normal to the fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

  return (
    <mesh castShadow>
      <sphereGeometry args={[0.3, 32, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          opacityFactor: { value: 0.35 }, // Slight transparency for the non-purple half
        }}
        transparent={true}
        side={THREE.DoubleSide} // Enable double-sided rendering
      />
    </mesh>
  );
};
