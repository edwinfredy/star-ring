import React, { useState, Suspense, useEffect, useMemo, useRef} from 'react'
import './App.css'
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import earthUrl from "./assets/3d/Earth.glb?url";
import { Box3, Vector3, Mesh } from "three";
import {PerspectiveCamera } from "three";

async function loadbsc5<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
  }

    return response.json() as Promise<T>;
}

type bsc5Type = {
  columns: string[],
  data: [number, string, number, number, number, string | null, number][]
}

const bsc5 = await loadbsc5<bsc5Type>("./src/assets/data/bsc5.json");

const getMockPosition = (
  success: PositionCallback,
  _error?: PositionErrorCallback | null,
  _options?: PositionOptions,
): void => {
  const position: GeolocationPosition = {
    coords: {
      latitude: 25.07725,
      longitude: 55.30927,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON() {
        return {
          latitude: this.latitude,
          longitude: this.longitude,
          accuracy: this.accuracy,
          altitude: this.altitude,
          altitudeAccuracy: this.altitudeAccuracy,
          heading: this.heading,
          speed: this.speed,
        }
      },
    },
    timestamp: Date.now(),
    toJSON() {
      return {
        coords: this.coords.toJSON(),
        timestamp: this.timestamp,
      }
    },
  }

  setTimeout(() => success(position), 0)
}

function LocationMarker({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }
) {
  const markerRef = useRef<Mesh>(null);
  const { camera, size } = useThree();

  const radius = 1.003;
  const phi = (latitude * Math.PI) / 180;
  const lambda = (longitude * Math.PI) / 180;

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

function Model() {
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
        <Model />
      </Suspense>

      {location && (
        <LocationMarker
          latitude={location.latitude}
          longitude={location.longitude}
        />
      )}

      <OrbitControls />
    </Canvas>
  );
}

function App() {
  const [location, setLocation] = useState<Location | null>(null);

  const handleGetLocation = () => {
    getMockPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  };

  return (
    <>
      <section id="main">
        <button type="button" onClick={handleGetLocation}>
          Show Location on Earth
        </button>

        <p>
          {location
            ? `Latitude: ${location.latitude.toFixed(4)}, Longitude: ${location.longitude.toFixed(4)}`
            : "Click the button to locate a point on Earth."}
        </p>

        <Scene location={location} />

            

      </section>
    </>
  )
}

export default App
