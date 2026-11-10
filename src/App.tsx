import { useState } from 'react'
import './App.css'
import { type Coordinates, type bsc5Type } from './types'
import bsc5Data from "./assets/data/bsc5.json";
import Scene from './Scene';
import StarDataDisplayer from './StarDataDisplayer';
import UserRegion from './UserRegion';
/* import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing"; */

const bsc5: bsc5Type = bsc5Data as bsc5Type;

function App() {
  const starDistance = 4
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [currentStarIndex, setCurrentStarIndex] = useState<number | null>(null);

  return (
    <>
      <section id="main">
        <UserRegion bsc5 = {bsc5} setCurrentStarIndex = {setCurrentStarIndex} setLocation = {setLocation}/>
        <Scene
          location={location} 
          chosenStar = {currentStarIndex ? bsc5.data[currentStarIndex] : null} 
          starDistance={starDistance}
        />
        {currentStarIndex && location && (
          <StarDataDisplayer chosenStar = {bsc5.data[currentStarIndex]} />
        )}

      </section>
    </>
  )
}

export default App
