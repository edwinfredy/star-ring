import {useRef} from 'react';
import {Mesh, MathUtils, PerspectiveCamera, Color} from 'three';
import { useThree, useFrame } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import type { bsc5Type} from "./types"

function StarDot({chosenStar, starDistance, LST}: {chosenStar: bsc5Type["data"][number], starDistance: number, LST: number}) {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const hourAngle = ((LST - chosenStar[2]) % 360 + 360 + 90) % 360;

  const radius = starDistance
  const phi = MathUtils.degToRad(chosenStar[3]);
  const lambda = MathUtils.degToRad(hourAngle);

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
    <Select enabled>
      <mesh ref={markerRef} position={position}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={new Color(3, 3, 3)} toneMapped={false} depthTest={true} />
      </mesh>
    </Select>
  );
}

export default StarDot;