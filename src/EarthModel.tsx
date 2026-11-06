import earthUrl from "./assets/3d/Earth.glb?url";
import placeholderUrl from "./assets/3d/Earth_mesh_only.glb?url";

import { useMemo, useEffect, useState, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Vector3,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const EarthModel = forwardRef<Group>((_, ref) => {
  // Load the lightweight geometry first.
  const { scene: placeholderScene } = useGLTF(placeholderUrl);

  // Store the full model once it has loaded.
  const [fullScene, setFullScene] = useState<Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    let active = true;

    loader.load(
      earthUrl,
      (gltf) => {
        if (active) {
          setFullScene(gltf.scene);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load Earth GLB:", error);
      }
    );

    return () => {
      active = false;
    };
  }, []);

  // Use the placeholder until the full model is ready.
  const model = useMemo(() => {
    const isPlaceholder = !fullScene;
    const source = fullScene ?? placeholderScene;

    const clone = source.clone(true);

    // Give the placeholder a simple, untextured material.
    if (isPlaceholder) {
      clone.traverse((object) => {
        if ((object as Mesh).isMesh) {
          (object as Mesh).material = new MeshStandardMaterial({
            color: "#888888",
            roughness: 1,
          });
        }
      });
    }

    // Normalize both models to exactly the same dimensions.
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension > 0) {
      const scale = 2 / maxDimension;

      clone.scale.setScalar(scale);
      clone.position.copy(center).multiplyScalar(-scale);
    }

    return clone;
  }, [fullScene, placeholderScene]);

  return <primitive object={model} ref={ref} />;
});

EarthModel.displayName = "EarthModel";

export default EarthModel;
