import {useRef} from 'react';
import {Mesh, MathUtils, PerspectiveCamera} from 'three';
import { useThree, useFrame } from "@react-three/fiber";
import type { bsc5Type} from "./types"

function StarDot({chosenStar, starDistance}: {chosenStar: bsc5Type["data"][number], starDistance: number}) {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const radius = starDistance
  const phi = MathUtils.degToRad(chosenStar[3]);
  const lambda = MathUtils.degToRad(chosenStar[2]);

  const position: [number, number, number] = [
    -radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    -radius * Math.cos(phi) * Math.cos(lambda),
  ];

  useFrame(() => {
    if (!markerRef.current) return;

    const distance = camera.position.distanceTo(
      markerRef.current.position
    );

    const fov = (camera as PerspectiveCamera).fov;
    const visibleHeight = 2 * Math.tan((fov * Math.PI) / 360) * distance;
    const worldSize = (visibleHeight / size.height) * 6;

    markerRef.current.scale.setScalar(worldSize / 0.025);
  });

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshBasicMaterial color="white" depthTest={true} />
    </mesh>
  );
}

export default StarDot;