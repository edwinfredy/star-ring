import earthUrl from "./assets/3d/Earth.glb?url";
import { useMemo, forwardRef} from 'react'
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, Mesh } from "three";

const EarthModel = forwardRef<Mesh>((_, ref) => {
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

    /*if (location !== null) {
      const phi = (90 - location.latitude) * (Math.PI / 180);
      const theta = (location.longitude + 180) * (Math.PI / 180);
      const x = -Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      clone.rotation.set(x, y, z);
    } */

    //  console.log("Model dimensions:", size);
    // console.log("Model center:", center);

    return clone;
  }, [scene]);

  return (
    <mesh ref={ref}>
        <primitive object={model} />;
    </mesh>
  )
})

export default EarthModel