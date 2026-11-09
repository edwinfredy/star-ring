import { useState, useRef} from 'react'
import './App.css'
import {type boxValuestype, type Coordinates, type bsc5Type, type citiesType} from './types'
import bsc5Data from "./assets/data/bsc5.json";
import cities from "./assets/data/cities.json";
import Scene from './Scene';
/* import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing"; */

const citiesList: citiesType = cities as citiesType;

const bsc5: bsc5Type = bsc5Data as bsc5Type;

function StarDataDisplayer({chosenStar}: {chosenStar: typeof bsc5['data'][number]}) {
  return (
    <div id="dataWindow">
      HR{chosenStar[0]} &nbsp;
      Bayer Designation: {chosenStar[1]} &nbsp;
      Right Ascension: {chosenStar[2]} &nbsp;
      Declination: {chosenStar[3]} &nbsp;
      Visual Magnitude: {chosenStar[4]} &nbsp;
      Multiple System: {chosenStar[5]} &nbsp;
      Class: {chosenStar[6]} &nbsp;
      Name: {chosenStar[7]}
    </div>
  )
}

function App() {
  const starDistance = 4
  const latRef = useRef<HTMLInputElement>(null);
  const longRef = useRef<HTMLInputElement>(null);
  const starInputRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [currentStarIndex, setCurrentStarIndex] = useState<number | null>(null);
/*   const [locationAvailable, setLocationAvailable] = useState<number>(0); */
/*   const [longitudeInput, setLongitudeInput] = useState(
      String(location?.longitude ?? "")
  ); */
  const [boxValues, setBoxValues] = useState<boxValuestype>({
    cityBox: "", latitudeBox: "", longitudeBox: "", starBox: ""
  });

  const handleGoButtonClick = () => {
    // Checking lat and long validity
    if (!latRef.current) return;
    if (latRef.current.value.trim() === "" || boxValues.longitudeBox.trim() === "") return;
    if (Number.isNaN(Number(latRef.current.value.trim())) || (Number.isNaN(Number(boxValues.longitudeBox.trim())))) return;

    if (!starInputRef.current) return;
    if (starInputRef.current.value.trim() === "") return;
    if (Number.isNaN(Number(starInputRef.current.value))) {
      let HRRefContent: string = starInputRef.current.value.trim()
      const nameMatchedIndex:number = bsc5.data.findIndex(item => item[7]?.toLowerCase() === HRRefContent.toLowerCase())
      if (nameMatchedIndex === -1) return;
      setCurrentStarIndex(nameMatchedIndex)
    }
    else {
      let HRRefNumber: number = Number(starInputRef.current.value)
      if (HRRefNumber < 0 || HRRefNumber > 9109) return
      if (!Number.isInteger(HRRefNumber)) return

      const currentHRNumber:number = bsc5.data.findIndex(item => item[0] === HRRefNumber)
      if (currentHRNumber === -1) return
      setCurrentStarIndex(currentHRNumber)
    }
    let latNum: number = Number(latRef.current.value.trim())
    let longNum: number = Number(boxValues.longitudeBox.trim())

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
/*       setLocation({latitude: selectedCity[1], longitude: selectedCity[2]}) */
      setBoxValues((prev) => {
        return ({
          ...prev,
          longitudeBox: selectedCity[2].toString(),
          latitudeBox: selectedCity[1].toString()
        })
      })
    }
  }

    function handleLocationButtonClick() {
      if (!navigator.geolocation) {
        //setLocationAvailable(2) // Location access fail
        return;
      }
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: Number(position.coords.latitude.toFixed(5)),
        longitude: Number(position.coords.longitude.toFixed(5))
      })
      if (cityRef.current)cityRef.current.value = ""
    },
    () => {/* setLocationAvailable(2) */}
    )}

  return (
    <>
      <section id="main">
        <div id="userRegion">
          <div className="userLine">
            <span>Type a nearby city: </span>
          </div>
          <div className="userLine">
            <input 
              type="text" 
              list="cities-list" 
              ref={cityRef} 
              size={12} 
              onChange={(e) => handleCityChange(e.target.value)} 
            />
          </div>
          <datalist id="cities-list">
            {citiesList.map((row, index) => (
              <option key={index} value={row[0]} />
            ))}
          </datalist>
          <div className="userLine fullLine">
            <span>OR</span>
          </div>
          <div className="userLine">
            <span>Enter your latitude: </span>
          </div>
          <div className="userLine">
            <input
              type="text"
              value={boxValues.latitudeBox}
              ref={latRef}
              size={7}
              onChange={(e) => {setBoxValues((prev) => {
                return ({
                  ...prev,
                  latitudeBox: e.target.value
                })
              })}}
            />
            &deg;
          </div>
          <div className="userLine">
            <span>Enter your longitude: </span>
          </div>
          <div className="userLine">
            <input
              type="text"
              value={boxValues.longitudeBox}
              ref={longRef}
              size={7}
              onChange={(e) => {setBoxValues((prev) => {
                return ({
                  ...prev,
                  longitudeBox: e.target.value
                })
              })}}
            />
            &deg;
          </div>
          <div className="userLine fullLine">
            <span>OR</span>
          </div>
          <div className="userLine fullLine locationButton">
            <button type="button" onClick={handleLocationButtonClick}>
              Detect Location
            </button>
          </div>
          <div className="userLine topLine">
            <span>Enter star HR number or name: </span>
          </div>
          <div className="userLine topLine">
            <input ref={starInputRef} size={10}></input>
          </div>
          <div className="userLine">
            <button type="button" onClick={handleGoButtonClick} style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
              touchAction: "none",
            }}>
              Go
            </button>
          </div>
        </div>
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
