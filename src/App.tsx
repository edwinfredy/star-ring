import { useState, Suspense, useEffect, useMemo, useRef} from 'react'
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import earthUrl from "./assets/3d/Earth.glb?url";
import { Box3, Vector3, Mesh, PerspectiveCamera, Spherical, MathUtils, BufferGeometry, Line, LineBasicMaterial, Color, BufferAttribute, TorusGeometry } from "three";
import './App.css'

const starDistance = 3;
const cameraDistance = 6;

type bsc5Type = {
  columns: string[],
  data: [number, string | null, number, number, number, string | null, number][]
}

async function loadbsc5<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
  }
    return response.json() as Promise<T>;
}

const bsc5 = await loadbsc5<bsc5Type>("./src/assets/data/bsc5.json");

function StarLine({earthPoint, starData}: {earthPoint: Coordinates, starData: typeof bsc5['data'][number]}) {
  const latitudeDegrees = MathUtils.degToRad(earthPoint.latitude);
  const longitudeDegrees = MathUtils.degToRad(earthPoint.longitude);
  const earthPointRadius = 1;

  const earthPointCoords: [number, number, number] = [
    -earthPointRadius * Math.cos(latitudeDegrees) * Math.sin(longitudeDegrees),
    earthPointRadius * Math.sin(latitudeDegrees),
    -earthPointRadius * Math.cos(latitudeDegrees) * Math.cos(longitudeDegrees),
  ];

  const starPointRadius = starDistance
  const phi = MathUtils.degToRad(starData[3]);
  const lambda = MathUtils.degToRad(starData[2]);

  const starPointCoords: [number, number, number] = [
    -starPointRadius * Math.cos(phi) * Math.sin(lambda),
    starPointRadius * Math.sin(phi),
    -starPointRadius * Math.cos(phi) * Math.cos(lambda),
  ];

  const points = useMemo(() => [
    new Vector3().fromArray(earthPointCoords),
    new Vector3().fromArray(starPointCoords)
  ], [earthPoint, starData])
  const geometry = useMemo(() =>
    new BufferGeometry().setFromPoints(points),
  [points]
  )
  return (
    <primitive
      object={
        new Line(
          geometry,
          new LineBasicMaterial({ color: 'white' })
        )
      }
    />
  )
}

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
  return (
    <OrbitControls makeDefault onStart={() => {
    setAutoMove(false)
  }}/>)
}

function StarDataDisplayer({chosenStar}: {chosenStar: typeof bsc5['data'][number]}) {
  return (
    chosenStar.join(", ")
  )
}

function StarRing({
  chosenStar,
  location,
}: {
  chosenStar: typeof bsc5['data'][number];
  location: Coordinates;
}) {
  const declination = chosenStar[3];
  const rightAscension = chosenStar[2];
  const latitude = location.latitude;

  const cosHourAngle = -Math.tan(MathUtils.degToRad(latitude)) * Math.tan(MathUtils.degToRad(declination));
  const hourAngle = MathUtils.radToDeg(Math.acos(cosHourAngle));
  const tubularSegments = 256;
  const radialSegments = 32;

  const risingAndSetting = useMemo(() => {
    if (cosHourAngle < -1) {
      return { alwaysVisible: true, neverVisible: false };
    }
    if (cosHourAngle > 1) {
      return { alwaysVisible: false, neverVisible: true };
    }
    return {
      alwaysVisible: false,
      neverVisible: false,
      risingAngle: MathUtils.euclideanModulo(MathUtils.degToRad(-location.longitude + hourAngle), Math.PI * 2),
      settingAngle: MathUtils.euclideanModulo(MathUtils.degToRad(-location.longitude - hourAngle), Math.PI * 2)
    };
  }, [cosHourAngle, rightAscension, location]);

  const geometry = useMemo(() => {

    type RisingAndSetting = {
      alwaysVisible: boolean;
      neverVisible: boolean;
      risingAngle?: number;
      settingAngle?: number;
    };
    const ringRadius = starDistance * Math.cos(MathUtils.degToRad(declination));
    const geometry = new TorusGeometry(
      ringRadius,
      0.01,
      radialSegments,
      tubularSegments,
    );

    const visibleColor = new Color('white');
    const hiddenColor = new Color('red');

    const colors = new Float32Array(geometry.attributes.position.count * 3);

    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++) {
        const angle = (i / tubularSegments) * Math.PI * 2;

        const isVisible =
          risingAndSetting.alwaysVisible || (
            !risingAndSetting.neverVisible &&
            risingAndSetting.risingAngle !== undefined &&
            risingAndSetting.settingAngle !== undefined && (
              risingAndSetting.risingAngle >= risingAndSetting.settingAngle ? 
                angle <= risingAndSetting.risingAngle && angle >= risingAndSetting.settingAngle :
                angle <= risingAndSetting.risingAngle || angle >= risingAndSetting.settingAngle
            )
          );

        const color = isVisible ? visibleColor : hiddenColor;

        const index = j * (tubularSegments + 1) + i;

        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      }
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [declination, risingAndSetting]);

  return (
    <mesh
      geometry={geometry}
      position={[0, Math.sin(MathUtils.degToRad(declination)) * starDistance, 0]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2]}
    >
      <meshStandardMaterial
        vertexColors
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

function StarDot({chosenStar}: {chosenStar: typeof bsc5['data'][number]}) {
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

function LocationMarker({location}: {location: Coordinates}) {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const radius = 1.003;
  const latitudeDegrees = MathUtils.degToRad(location.latitude);
  const longitudeDegrees = MathUtils.degToRad(location.longitude);

  const position: [number, number, number] = [
    -radius * Math.cos(latitudeDegrees) * Math.sin(longitudeDegrees),
    radius * Math.sin(latitudeDegrees),
    -radius * Math.cos(latitudeDegrees) * Math.cos(longitudeDegrees),
  ];

  useFrame(() => {
    if (!markerRef.current) return;

    const distance = camera.position.distanceTo(
      markerRef.current.position
    );

    const fov = (camera as PerspectiveCamera).fov;
    const visibleHeight =
      2 * Math.tan((fov * Math.PI) / 360) * distance;

    const worldSize = (visibleHeight / size.height) * 6;

    markerRef.current.scale.setScalar(worldSize / 0.025);
  });

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshBasicMaterial color="red" depthTest={true} />
    </mesh>
  );
}

function EarthModel() {
  const { scene } = useGLTF(earthUrl);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    // Calculate the model's bounding box
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > 0) {
      clone.scale.setScalar(2 / maxDimension);
    }

    // Center the model after scaling
    clone.position.copy(center).multiplyScalar(-2 / maxDimension);

/*     if (location !== null) {
      const phi = (90 - location.latitude) * (Math.PI / 180);
      const theta = (location.longitude + 180) * (Math.PI / 180);
      const x = -Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      clone.rotation.set(x, y, z);
    } */

    //  console.log("Model dimensions:", size);
    // console.log("Model center:", center);

    return clone;
  }, [scene]);

  return <primitive object={model} />;
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

function Scene({ location, chosenStar }: { location: Coordinates | null , chosenStar: typeof bsc5['data'][number]}) {
  const [autoMove, setAutoMove] = useState(true)
  const [isDark, setIsDark] = useState(() => 
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    media.addEventListener("change", updateTheme);

    return () => {
      media.removeEventListener("change", updateTheme);
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, cameraDistance], fov: 45 }}>
      <color
        attach="background"
        args={[isDark ? "#000000" : "#ffffff"]}
      />

      <ambientLight intensity={2} />
      <directionalLight position={[5, 3, 5]} intensity={3} />

      <Suspense fallback={null}>
        <EarthModel />
      </Suspense>

      {location && (
        <LocationMarker location={location} />
      )}
      {location && (
        <StarRing chosenStar = {chosenStar} location={location} />
      )}
      <StarDot chosenStar = {chosenStar} />
      {location && (
        <StarLine earthPoint={location} starData={chosenStar}/>
      )}

      {location && (
        <CameraAutoMove location={location} autoMove={autoMove} setAutoMove={setAutoMove}
      />)}

    </Canvas>
  );
}

function App() {
  const latRef = useRef<HTMLInputElement>(null);
  const longRef = useRef<HTMLInputElement>(null);
  const [globeLocation, setLocation] = useState<Coordinates | null>(null);

  const chosenStar = bsc5.data[3009]

  const handleGetLocation = () => {
    if (!latRef.current || !longRef.current) return;
    if (latRef.current.value.trim() === "" || longRef.current.value.trim() === "") return;
    let latNum: number = Number(latRef.current.value.trim())
    let longNum: number = Number(longRef.current.value.trim())
    if(
      -90 <= latNum &&
      latNum <= 90 &&
      -180 <= longNum &&
      longNum <= 180) {
        setLocation({
          latitude: latNum,
          longitude: longNum,
        });
    };
  }

  return (
    <>
      <section id="main">
        <input placeholder="Latitude" ref={latRef}></input>
        <input placeholder="Longitude" ref={longRef}></input>
        <button type="button" onClick={handleGetLocation}>
          Show Location on Earth
        </button>

        <p>
          {globeLocation
            ? `Latitude: ${globeLocation.latitude.toFixed(4)}, Longitude: ${globeLocation.longitude.toFixed(4)}`
            : "Click the button to locate a point on Earth."}
        </p>

        <Scene location={globeLocation} chosenStar = {chosenStar} />

        <StarDataDisplayer chosenStar = {chosenStar} />

      </section>
    </>
  )
}

export default App
