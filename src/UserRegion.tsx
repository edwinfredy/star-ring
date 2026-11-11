import {type boxValuesType, type citiesType, type bsc5Type, type Coordinates} from './types'
import { useState, useRef} from 'react'
import cities from "./assets/data/cities.json";

const citiesList: citiesType = cities as citiesType;

function UserRegion({bsc5, setCurrentStarIndex, setLocation}: {
    bsc5: bsc5Type, 
    setCurrentStarIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setLocation: React.Dispatch<React.SetStateAction<Coordinates | null>>
}) {
    const userRegion = useRef<HTMLInputElement>(null);
    const starInputRef = useRef<HTMLInputElement>(null);
    const latRef = useRef<HTMLInputElement>(null);
    const longRef = useRef<HTMLInputElement>(null);
    const cityRef = useRef<HTMLInputElement>(null);
    const [boxValues, setBoxValues] = useState<boxValuesType>({
        cityBox: "", latitudeBox: "", longitudeBox: "", starBox: ""
    });

    function handleCityChange(typedContent: string) {
        const selectedCity = citiesList.find((row) => row[0] === typedContent)
        if (selectedCity) {
            /*  setLocation({latitude: selectedCity[1], longitude: selectedCity[2]}) */
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
            if (cityRef.current) cityRef.current.value = ""
        },
        () => {/* setLocationAvailable(2) */}
    )}

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

    return (
        <div id="userRegion" ref = {userRegion}>
            <div className="userLine"><span>Type a nearby city: </span></div>
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
            <div className="userLine fullLine"><span>OR</span></div>
            <div className="userLine"><span>Enter your latitude: </span></div>
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
        <div className="userLine"><span>Enter your longitude: </span></div>
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
            <div className="userLine fullLine"><span>OR</span></div>
            <div className="userLine fullLine locationButton">
                <button type="button" onClick={handleLocationButtonClick}>Detect Location</button>
            </div>
            <div className="userLine topLine"><span>Enter star HR number or name: </span></div>
            <div className="userLine topLine">
                <input ref={starInputRef} size={10} list="starNamesList"></input>
            </div>
            <datalist id="starNamesList">
            {bsc5.data.map((row, index) => (
                row[7] !== null && (
                    <option key={index} value={row[7]} />
                )))}
            </datalist>
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
            <div>
                <button className = "mobileOnly" onClick = {() => {userRegion.current?.classList.toggle("mobileCollapsed")}}>&#8693;</button>
            </div>
        </div>
    )
}

export default UserRegion;