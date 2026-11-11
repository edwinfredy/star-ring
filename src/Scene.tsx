import StarLine from './StarLine';
import { useThree, useFrame } from "@react-three/fiber";
import { Spherical, MathUtils} from "three";
import EarthModel from './EarthModel';
import StarDot from './StarDot';
import StarRing from './StarRing';
import LocationMarker from './LocationMarker';
import { OrbitControls } from "@react-three/drei";
import { useState, Suspense, useEffect, useRef} from 'react'
import { Canvas } from "@react-three/fiber";
import { Group} from "three";
import type { Coordinates, bsc5Type } from "./types"

const cameraDistance = 6;

function CameraAutoMove({location, autoMove, setAutoMove}: {
  location: Coordinates,
  autoMove: boolean,
  setAutoMove: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const {camera} = useThree();
  const spherical = useRef(new Spherical(5, 0, 0));
  let targetTheta = MathUtils.euclideanModulo(-1 * (180 - location.longitude) * Math.PI / 180, Math.PI * 2)

  useEffect(() => {
    setAutoMove(true)
    spherical.current.setFromVector3(camera.position)
  }, [location.latitude, location.longitude])

  useFrame((_, delta) => {
    if (!autoMove) return;
    spherical.current.theta = MathUtils.damp(
      spherical.current.theta,
      targetTheta,
      5,
      delta
    );

    spherical.current.phi = MathUtils.damp(
      spherical.current.phi,
      MathUtils.degToRad(90 - location.latitude),
      5,
      delta
    );

    camera.position.setFromSpherical(spherical.current);
    camera.lookAt(0, 0, 0);
  })
  return null
}

function Scene({ location, chosenStar, starDistance, LST }: {
  location: Coordinates | null,
  chosenStar: bsc5Type["data"][number] | null,
  starDistance: number,
  LST: number
}) {
  const globeRef = useRef<Group>(null!)
  const bloomComponents = useRef<Group>(null!)
  const [autoMove, setAutoMove] = useState(true)

  return (
    <Canvas camera={{ position: [0, 0, cameraDistance], fov: 45 }} frameloop="demand"  style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTouchCallout: "none",
      touchAction: "none",
    }}>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 3, 5]} intensity={3} />

      <Suspense fallback={null}>
        <EarthModel ref = {globeRef} />
      </Suspense>
      {location && (
        <LocationMarker location={location} />
      )}
      {location && chosenStar && (
        <StarRing chosenStar = {chosenStar} location={location} starDistance = {starDistance} />
      )}
      <group ref={bloomComponents}>
        {chosenStar && location && (
          <StarDot chosenStar = {chosenStar} starDistance = {starDistance} LST={LST} />
        )}
        {location && chosenStar && (
          <StarLine earthPoint={location} starData={chosenStar} starDistance={starDistance} globeRef={globeRef} LST={LST} />
        )}
      </group>
      {location && (
        <CameraAutoMove location={location} autoMove={autoMove} setAutoMove={setAutoMove} />
      )}
      <OrbitControls makeDefault onStart={() => {setAutoMove(false) }}/>

{/*       <EffectComposer>
        <SelectiveBloom
          lights={[]} 
          selection={bloomComponents} 
          intensity={1} luminanceThreshold={0.7} 
          luminanceSmoothing={0.1} 
          mipmapBlur={false}
          radius={0.3}
        />
      </EffectComposer> */}

    </Canvas>
  );
}

export default Scene;