import type { bsc5Type, starStatusType } from "./types"

function StarDataDisplayer({chosenStar, risingTime, settingTime, starStatus}: {
    chosenStar: bsc5Type["data"][number],
    risingTime: number, 
    settingTime: number,
    starStatus: starStatusType
}) {
  return (
    <div id="dataWindow">
      <span>
        {chosenStar[7] ? chosenStar[7] : `HR ${chosenStar[0]}`}
        {starStatus === "always-risen" ? 
            ` is always visible in the sky at this location.` : 
            starStatus === "always-set" ? 
                ` is never visible in the sky at this location.` : 
                risingTime && settingTime ? ` rises at ${new Date(risingTime).toLocaleString(
                    "en-US", {
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: true
                })} and sets at ${new Date(settingTime).toLocaleString(
                    "en-US", {
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: true
                })} at this location.` :
                ""
        }
      </span>
    </div>
  )
}

export default StarDataDisplayer;