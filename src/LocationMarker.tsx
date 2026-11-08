import { Mesh, /* PerspectiveCamera,  */MathUtils} from "three";
import { useRef } from 'react'
import type { Coordinates } from "./types"
/* import { useThree, useFrame } from "@react-three/fiber"; */

function LocationMarker({location}: {location: Coordinates}) {
  const markerRef = useRef<Mesh>(null);
/*   const { camera, size } = useThree(); */

  const radius = 1.003;
  const latitudeDegrees = MathUtils.degToRad(location.latitude);
  const longitudeDegrees = MathUtils.degToRad(location.longitude);

  const position: [number, number, number] = [
    -radius * Math.cos(latitudeDegrees) * Math.sin(longitudeDegrees),
    radius * Math.sin(latitudeDegrees),
    -radius * Math.cos(latitudeDegrees) * Math.cos(longitudeDegrees),
  ];

/*   useFrame(() => {
    if (!markerRef.current) return;

    const distance = camera.position.distanceTo(
      markerRef.current.position
    );

    const fov = (camera as PerspectiveCamera).fov;
    const visibleHeight = 2 * Math.tan((fov * Math.PI) / 360) * distance;

    const worldSize = (visibleHeight / size.height) * 6;

    markerRef.current.scale.setScalar(worldSize / 0.025);
  }); */

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshBasicMaterial color="red" depthTest={true} />
    </mesh>
  );  
}

export default LocationMarker;