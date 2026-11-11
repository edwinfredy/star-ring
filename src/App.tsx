import { useState } from 'react'
import './App.css'
import { type Coordinates, type bsc5Type } from './types'
import bsc5Data from "./assets/data/bsc5.json";
import Scene from './Scene';
import StarDataDisplayer from './StarDataDisplayer';
import UserRegion from './UserRegion';
import { MathUtils } from 'three';
/* import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing"; */

const bsc5: bsc5Type = bsc5Data as bsc5Type;

function App() {
  const starDistance = 4
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [currentStarIndex, setCurrentStarIndex] = useState<number | null>(null);

  let LST: number = 0;
  let risingTime: number = 0;
  let settingTime: number = 0;

  function calculateStarTimes() {
    if (!location || !currentStarIndex) return;
    const chosenStar = bsc5.data[currentStarIndex]
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
      month += 12;
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

    /*  // Convert degrees to sidereal time
    const totalSeconds = LST * 240;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60; */    
    const declination = chosenStar[3];
    const rightAscension = chosenStar[2];
    const cosHourAngle = -Math.tan(MathUtils.degToRad(location.latitude)) * Math.tan(MathUtils.degToRad(declination));
    const hourAngle = MathUtils.radToDeg(Math.acos(cosHourAngle));
    const risingTimeLST = ((rightAscension - hourAngle) % 360 + 360) % 360;
    const settingTimeLST = ((rightAscension + hourAngle) % 360 + 360) % 360;
    const earthSiderealAngularVelocity = 360.98564736629 / 86400000
    console.log(risingTimeLST, settingTimeLST)
    risingTime = Date.now() + ((((risingTimeLST - LST) % 360) + 360) % 360) / earthSiderealAngularVelocity;
    settingTime = Date.now() + ((((settingTimeLST - LST) % 360) + 360) % 360) / earthSiderealAngularVelocity;
  }

  if (location) calculateStarTimes()

  return (
    <>
      <section id="main">
        <UserRegion bsc5 = {bsc5} setCurrentStarIndex = {setCurrentStarIndex} setLocation = {setLocation}/>
        <Scene
          location={location} 
          chosenStar = {currentStarIndex ? bsc5.data[currentStarIndex] : null} 
          starDistance={starDistance}
          LST = {LST}
        />
        {currentStarIndex && location && (
          <StarDataDisplayer chosenStar = {bsc5.data[currentStarIndex]} risingTime = {risingTime} settingTime = {settingTime} />
        )}

      </section>
    </>
  )
}

export default App
