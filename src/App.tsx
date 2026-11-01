import { useState, Suspense, useEffect, useMemo, useRef} from 'react'
import './App.css'
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import earthUrl from "./assets/3d/Earth.glb?url";
import { Box3, Vector3, Mesh } from "three";
import {PerspectiveCamera } from "three";

  const starDistance = 3;

async function loadbsc5<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
  }
    return response.json() as Promise<T>;
}

type bsc5Type = {
  columns: string[],
  data: [number, string | null, number, number, number, string | null, number][]
}

const bsc5 = await loadbsc5<bsc5Type>("./src/assets/data/bsc5.json");
const pickedData = bsc5.data[5000]

function StarDataTest() {
  return (
    pickedData.join(", ")
  )
}

function StarRing() {
  return (
    <mesh position={[0, Math.sin(pickedData[3] * Math.PI / 180) * starDistance, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[starDistance * Math.cos(pickedData[3] * Math.PI / 180), 0.01, 32, 100]} />
      <meshStandardMaterial
        color="white"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

function StarDot() {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const radius = starDistance
  const phi = (pickedData[3] * Math.PI) / 180;
  const lambda = (pickedData[2] * Math.PI) / 180;

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

function LocationMarker({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const radius = 1.003;
  const latitudeDegrees = (latitude * Math.PI) / 180;
  const longitudeDegrees = (longitude * Math.PI) / 180;

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

function EarthModel({ location }: { location: Location | null }) {
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

type Location = {
  latitude: number;
  longitude: number;
};

function Scene({ location }: { location: Location | null }) {
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
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <color
        attach="background"
        args={[isDark ? "#000000" : "#ffffff"]}
      />

      <ambientLight intensity={2} />
      <directionalLight position={[5, 3, 5]} intensity={3} />

      <Suspense fallback={null}>
        <EarthModel location={location}/>
      </Suspense>

      {location && (
        <LocationMarker
          latitude={location.latitude}
          longitude={location.longitude}
        />
      )}

      <StarRing />
      <StarDot />

      <OrbitControls />
    </Canvas>
  );
}

function App() {
  const latRef = useRef<HTMLInputElement>(null);
  const longRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<Location | null>(null);

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
          {location
            ? `Latitude: ${location.latitude.toFixed(4)}, Longitude: ${location.longitude.toFixed(4)}`
            : "Click the button to locate a point on Earth."}
        </p>

        <Scene location={location} />

        <StarDataTest />

      </section>
    </>
  )
}

export default App
