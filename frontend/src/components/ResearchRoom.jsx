import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Float } from "@react-three/drei";
import AnalystAvatar from "./AnalystAvatar";

const Desk = () => (
  <group>
    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[1.6, 0.06, 0.9]} />
      <meshStandardMaterial color="#3d2b1f" />
    </mesh>
    {[
      [-0.7, 0.25, -0.38],
      [0.7, 0.25, -0.38],
      [-0.7, 0.25, 0.38],
      [0.7, 0.25, 0.38],
    ].map((pos, i) => (
      <mesh key={i} castShadow position={pos}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color="#2a1d15" />
      </mesh>
    ))}
  </group>
);

const Laptop = () => (
  <group position={[0, 0.53, -0.1]}>
    <mesh castShadow>
      <boxGeometry args={[0.5, 0.02, 0.35]} />
      <meshStandardMaterial color="#1b2a4a" />
    </mesh>
    {/* Screen glows faintly in the signal-blue accent color, as if
        displaying something, without needing an actual texture. */}
    <mesh castShadow position={[0, 0.16, -0.17]} rotation={[-0.35, 0, 0]}>
      <boxGeometry args={[0.5, 0.32, 0.02]} />
      <meshStandardMaterial color="#0f172a" emissive="#2f5d8a" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

const DocumentStack = () => (
  <group position={[0.5, 0.53, 0.2]} rotation={[0, 0.3, 0]}>
    {[0, 1, 2].map((i) => (
      <mesh key={i} castShadow position={[0, i * 0.012, 0]}>
        <boxGeometry args={[0.25, 0.01, 0.32]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#f6f3ec" : "#e8e4d8"} />
      </mesh>
    ))}
  </group>
);

// Small floating bars standing in for a financial chart, colored
// from the same gold/positive/caution palette as the rest of the
// app rather than introducing a separate "3D scene" color language.
const ChartPanel = () => {
  const bars = [0.3, 0.55, 0.4, 0.7, 0.5];
  const colors = ["#a87c2c", "#3f7a5c", "#a87c2c", "#3f7a5c", "#b44242"];

  return (
    <Float speed={2} floatIntensity={0.3} rotationIntensity={0.1}>
      <group position={[-0.75, 1.15, -0.3]}>
        {bars.map((h, i) => (
          <mesh key={i} position={[i * 0.09 - 0.18, h / 2, 0]} castShadow>
            <boxGeometry args={[0.06, h, 0.02]} />
            <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

// stage: passed straight through to AnalystAvatar to drive its pose.
// label: the current progress message, shown floating above the avatar.
const ResearchRoom = ({ stage = "idle", label }) => {
  return (
    <Canvas shadows camera={{ position: [3.2, 2.4, 4.2], fov: 42 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      {/* Warm accent light near the chart panel, tying the 3D scene
          back to the gold accent used everywhere else in the app. */}
      <pointLight position={[-1.5, 1.8, 1]} intensity={0.4} color="#a87c2c" />

      <Suspense fallback={null}>
        <Desk />
        <Laptop />
        <DocumentStack />
        <ChartPanel />
        <AnalystAvatar stage={stage} label={label} />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f6f3ec" />
      </mesh>

      <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={6} blur={2} far={2} />

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={7}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.8, 0]}
      />
    </Canvas>
  );
};

export default ResearchRoom;
