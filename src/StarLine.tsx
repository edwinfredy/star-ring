import {MathUtils, LineBasicMaterial, Vector3, BufferGeometry, Line, Raycaster, Mesh} from "three";
import {useMemo} from "react";
import type {Coordinates, bsc5Type} from "./types"

function StarLine({earthPoint, starData, starDistance, globeRef}: {
    earthPoint: Coordinates, starData: bsc5Type["data"][number], starDistance: number, globeRef: React.RefObject<Mesh | null>
}) {
  const latitudeDegrees = MathUtils.degToRad(earthPoint.latitude);
  const longitudeDegrees = MathUtils.degToRad(earthPoint.longitude);
  const earthPointRadius = 1.02;

  const earthPointCoords: [number, number, number] = [
    -earthPointRadius * Math.cos(latitudeDegrees) * Math.sin(longitudeDegrees),
    earthPointRadius * Math.sin(latitudeDegrees),
    -earthPointRadius * Math.cos(latitudeDegrees) * Math.cos(longitudeDegrees),
  ];

  const starPointRadius = starDistance
  const phi = MathUtils.degToRad(starData[3]);
  const lambda = MathUtils.degToRad(starData[2]);

  const starPointCoords: [number, number, number] = [
    -starPointRadius * Math.cos(phi) * Math.sin(lambda),
    starPointRadius * Math.sin(phi),
    -starPointRadius * Math.cos(phi) * Math.cos(lambda),
  ];
  const rayCaster = new Raycaster()
  const rayDirection = new Vector3().fromArray(starPointCoords).clone().sub(new Vector3().fromArray(earthPointCoords)).normalize()
  let intersects = []
  rayCaster.set(new Vector3().fromArray(earthPointCoords), rayDirection)
  if (globeRef.current) {
    intersects = rayCaster.intersectObject(globeRef.current, true)
    console.log(intersects)
  }

  const points = useMemo(() => [
    new Vector3().fromArray(earthPointCoords),
    new Vector3().fromArray(starPointCoords)
  ], [earthPoint, starData])
  const geometry = useMemo(() => new BufferGeometry().setFromPoints(points), [points])
  return (
    intersects.length === 0 &&
        <primitive object={new Line(geometry, new LineBasicMaterial({ color: 'white' }))} />
  )
}

export default StarLine