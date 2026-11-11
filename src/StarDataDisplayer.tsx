import type { bsc5Type } from "./types"

function StarDataDisplayer({chosenStar, LST, risingTime, settingTime}: {
    chosenStar: bsc5Type["data"][number], 
    LST: number, 
    risingTime: number, 
    settingTime: number
}) {
  return (
    <div id="dataWindow">
      <span>
        {chosenStar[7] ? chosenStar[7] : `HR${chosenStar[0]}`} has
        {chosenStar[1] ? ` Bayer Designation: ${chosenStar[1]}` : ""} &nbsp;
        Right Ascension: {chosenStar[2]} &nbsp;
        Declination: {chosenStar[3]} &nbsp;
        Visual Magnitude: {chosenStar[4]} &nbsp;
        Multiple System: {chosenStar[5]} &nbsp;
        Class: {chosenStar[6]}. &nbsp;
        {risingTime && settingTime ? 
            `It rises at ${new Date(risingTime).toLocaleString(
                "en-US", {
                    hour: "2-digit", 
                    minute: "2-digit", 
                    hour12: true
            })} and sets at ${new Date(settingTime).toLocaleString(
                "en-US", {
                    hour: "2-digit", 
                    minute: "2-digit", 
                    hour12: true
            })}.`: ""}
      </span>
    </div>
  )
}

export default StarDataDisplayer;