import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// Target pose per research stage: how far the torso leans forward,
// how much the head tilts, and how fast the idle bob animates. These
// are small, hand-picked numbers for a stylized character - not
// derived from any formula, the same way an illustrator would just
// pick values that read as "leaning in to read" or "thinking".
const STAGE_POSE = {
  idle: { lean: 0, headTilt: 0, bobSpeed: 1 },
  company: { lean: 0.15, headTilt: 0.2, bobSpeed: 1.4 }, // leaning in to read
  parallel: { lean: 0.05, headTilt: -0.05, bobSpeed: 2.2 }, // busy, three things at once
  decision: { lean: -0.05, headTilt: -0.1, bobSpeed: 0.8 }, // upright, weighing it up
  done: { lean: 0, headTilt: 0.08, bobSpeed: 1 }, // settled
};

const AnalystAvatar = ({ stage = "idle", label }) => {
  const groupRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();

  useFrame(({ clock }) => {
    const pose = STAGE_POSE[stage] || STAGE_POSE.idle;
    const t = clock.elapsedTime;

    // Gentle vertical bob so the figure is never perfectly frozen.
    // Speed changes per stage so "parallel" (three agents working at
    // once) reads as visibly busier than "decision".
    if (groupRef.current) {
      groupRef.current.position.y = 0.9 + Math.sin(t * pose.bobSpeed) * 0.03;
    }

    // Interpolate toward the target lean/tilt each frame instead of
    // snapping directly to it, so a stage change looks like a person
    // shifting posture rather than a jump cut.
    if (torsoRef.current) {
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(
        torsoRef.current.rotation.x,
        pose.lean,
        0.05
      );
    }
    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        pose.headTilt,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.9, -0.65]}>
      <group ref={torsoRef}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#1b2a4a" />
        </mesh>

        <group ref={headRef} position={[0, 0.75, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#e8c9a3" />
          </mesh>
        </group>

        <mesh castShadow position={[-0.35, 0.3, 0.1]} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
          <meshStandardMaterial color="#1b2a4a" />
        </mesh>
        <mesh castShadow position={[0.35, 0.3, 0.1]} rotation={[0.3, 0, -0.2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
          <meshStandardMaterial color="#1b2a4a" />
        </mesh>
      </group>

      {/* Real HTML, not 3D text - reuses the app's actual fonts
          instead of loading a separate font for the 3D renderer. */}
      {label && (
        <Html position={[0, 1.15, 0]} center distanceFactor={6} occlude={false}>
          <div className="whitespace-nowrap px-3 py-1.5 rounded-full bg-paper/95 shadow-card border border-ink/10 text-xs font-mono text-ink/80">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default AnalystAvatar;
