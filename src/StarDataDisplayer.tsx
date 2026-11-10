import type { bsc5Type } from "./types"
function StarDataDisplayer({chosenStar}: {chosenStar: bsc5Type["data"][number]}) {
  return (
    <div id="dataWindow">
      <span>
        {chosenStar[7]? chosenStar[7] : chosenStar[0]} has
        Bayer Designation: {chosenStar[1]} &nbsp;
        Right Ascension: {chosenStar[2]} &nbsp;
        Declination: {chosenStar[3]} &nbsp;
        Visual Magnitude: {chosenStar[4]} &nbsp;
        Multiple System: {chosenStar[5]} &nbsp;
        Class: {chosenStar[6]} &nbsp;
        Name: {chosenStar[7]}
      </span>
    </div>
  )
}

export default StarDataDisplayer;