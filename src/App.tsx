import { useState, Suspense, useEffect, useRef} from 'react'
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Group, Spherical, MathUtils} from "three";
import './App.css'
import StarLine from './StarLine';
import type {Coordinates, bsc5Type, citiesType} from './types'
import EarthModel from './EarthModel';
import StarDot from './StarDot';
import StarRing from './StarRing';
import LocationMarker from './LocationMarker';
import bsc5Data from "./assets/data/bsc5.json";
import cities from "./assets/data/cities.json";
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";

const cameraDistance = 6;

/* async function loadbsc5<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
const bsc5 = await loadbsc5<bsc5Type>("./assets/data/bsc5.json"); */

const citiesList: citiesType = cities as citiesType;

const bsc5: bsc5Type = bsc5Data as bsc5Type;

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

function StarDataDisplayer({chosenStar}: {chosenStar: typeof bsc5['data'][number]}) {
  return (
    <div id="dataWindow">
      HR{chosenStar[0]} &nbsp;
      Bayer Designation: {chosenStar[1]} &nbsp;
      Right Ascension: {chosenStar[2]} &nbsp;
      Declination: {chosenStar[3]} &nbsp;
      Visual Magnitude: {chosenStar[4]} &nbsp;
      Multiple System: {chosenStar[5]} &nbsp;
      Class: {chosenStar[6]}
    </div>
  )
}

function Scene({ location, chosenStar, starDistance }: {
  location: Coordinates | null,
  chosenStar: typeof bsc5['data'][number] | null,
  starDistance: number
}) {
  const globeRef = useRef<Group>(null!)
  const bloomComponents = useRef<Group>(null!)
  const [autoMove, setAutoMove] = useState(true)

  let LST: number = 0;

  function calculateLocalSiderealTime() {
    if (!location) return;
    const date = new Date()
    let year = date.getUTCFullYear()
    let month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    const millisecond = date.getUTCMilliseconds();
    if (month <= 2) {
      year--;
      month += 12
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    const JD =
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day + B - 1524.5 + (
        hour + minute / 60 +
        second / 3600 +
        millisecond / 3600000
      )
      / 24;

    const T = (JD - 2451545.0) / 36525;
    let GMST: number =
      280.46061837 +
      360.98564736629 * (JD - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000;

    GMST = ((GMST % 360) + 360) % 360;
    // Local Mean Sidereal Time
    LST = ((GMST + location!.longitude) % 360 + 360) % 360;

/*     // Convert degrees to sidereal time
    const totalSeconds = LST * 240;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60; */
  }

  if (location) calculateLocalSiderealTime()

  return (
    <Canvas camera={{ position: [0, 0, cameraDistance], fov: 45 }} frameloop="demand">
      <color attach="background" args={[/* isDark ?  */"#000000"/*  : "#ffffff" */]} />
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

      <EffectComposer>
        <SelectiveBloom 
          lights={[]} 
          selection={bloomComponents} 
          intensity={1} luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          mipmapBlur
        />
      </EffectComposer>

    </Canvas>
  );
}

function App() {
  const starDistance = 4
  const latRef = useRef<HTMLInputElement>(null);
  const longRef = useRef<HTMLInputElement>(null);
  const HRRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const [globeLocation, setLocation] = useState<Coordinates | null>(null);
  const [currentStarIndex, setCurrentStarIndex] = useState<number | null>(null);

  const handleButtonClick = () => {
    if (!HRRef.current) return;
    if (HRRef.current.value.trim() === "") return;
    if (Number.isNaN(Number(HRRef.current.value))) return;
    let HRRefNumber: number = Number(HRRef.current.value)
    if (HRRefNumber < 0 || HRRefNumber > 9109) return
    if (!Number.isInteger(HRRefNumber)) return

    if (!latRef.current || !longRef.current) return;
    if (latRef.current.value.trim() === "" || longRef.current.value.trim() === "") return;

    const currentHRNumber:number = bsc5.data.findIndex(item => item[0] === HRRefNumber)
    if (currentHRNumber === -1) return
    setCurrentStarIndex(currentHRNumber)
    let latNum: number = Number(latRef.current.value.trim())
    let longNum: number = Number(longRef.current.value.trim())

    if (
      -90 <= latNum &&
      latNum <= 90 &&
      -180 <= longNum &&
      longNum <= 180) {
      setLocation({ latitude: latNum, longitude: longNum });
    };
  }

  function handleCityChange(typedContent: string) {
    const selectedCity = citiesList.find((row) => row[0] === typedContent)
    if (selectedCity) {
      setLocation({latitude: Number(selectedCity[1]), longitude: Number(selectedCity[2])})
      latRef.current!.value = selectedCity[1].toString()
      longRef.current!.value = selectedCity[2].toString()
    }
  }

  return (
    <>
      <section id="main">
        <div id="userRegion">
          <div className="userLine">
            <span>Type a nearby city: </span>
          </div>
          <div className="userLine">
            <input type="text" list="cities-list" ref={cityRef} size={12} onChange={(e) => handleCityChange(e.target.value)}></input>
          </div>
          <datalist id="cities-list">
            {citiesList.map((row, index) => (
              <option key={index} value={row[0]} />
            ))}
          </datalist>
          <div className="userLine">
            <span>Enter your latitude: </span>
          </div>
          <div className="userLine">
            <input ref={latRef} size={7} onChange = {() => {if (cityRef.current)cityRef.current.value = ""}}></input>&deg;
          </div>
          <div className="userLine">
            <span>Enter your longitude: </span>
          </div>
          <div className="userLine">
            <input ref={longRef} size={7} onChange = {() => {if (cityRef.current)cityRef.current.value = ""}}></input>&deg;
          </div>
          <div className="userLine">
            <span>Enter star HR number: </span>
          </div>
          <div className="userLine">
            <input ref={HRRef} size={7}></input>
          </div>
          <div className="userLine">
            <button type="button" onClick={handleButtonClick}>
              Go
            </button>
          </div>
        </div>
        <Scene 
          location={globeLocation} 
          chosenStar = {currentStarIndex ? bsc5.data[currentStarIndex] : null} 
          starDistance={starDistance}
        />
        {currentStarIndex && globeLocation && (
          <StarDataDisplayer chosenStar = {bsc5.data[currentStarIndex]} />
        )}

      </section>
    </>
  )
}

export default App
