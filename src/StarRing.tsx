import type { Coordinates, bsc5Type } from "./types"
import { MathUtils, Color, TorusGeometry, BufferAttribute } from 'three';
import { useMemo } from 'react'

function StarRing({
  chosenStar,
  location,
  starDistance
}: {
  chosenStar: bsc5Type["data"][number];
  location: Coordinates;
  starDistance: number
}) {
  const declination = chosenStar[3];
  const rightAscension = chosenStar[2];
  const latitude = location.latitude;

  const cosHourAngle = -Math.tan(MathUtils.degToRad(latitude)) * Math.tan(MathUtils.degToRad(declination));
  const hourAngle = MathUtils.radToDeg(Math.acos(cosHourAngle));
  const tubularSegments = 256;
  const radialSegments = 32;

  const risingAndSetting = useMemo(() => {
    if (cosHourAngle < -1) {
      return { alwaysVisible: true, neverVisible: false };
    }
    if (cosHourAngle > 1) {
      return { alwaysVisible: false, neverVisible: true };
    }
    return {
      alwaysVisible: false,
      neverVisible: false,
      risingAngle: MathUtils.euclideanModulo(MathUtils.degToRad(-location.longitude + hourAngle), Math.PI * 2),
      settingAngle: MathUtils.euclideanModulo(MathUtils.degToRad(-location.longitude - hourAngle), Math.PI * 2)
    };
  }, [cosHourAngle, rightAscension, location]);

  const geometry = useMemo(() => {
    const ringRadius = starDistance * Math.cos(MathUtils.degToRad(declination));
    const geometry = new TorusGeometry(
      ringRadius,
      0.01,
      radialSegments,
      tubularSegments,
    );

    const visibleColor = new Color('#ffffff');
    const hiddenColor = new Color('#a50202');

    const colors = new Float32Array(geometry.attributes.position.count * 3);

    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++) {
        const angle = (i / tubularSegments) * Math.PI * 2;

        const isVisible =
          risingAndSetting.alwaysVisible || (
            !risingAndSetting.neverVisible &&
            risingAndSetting.risingAngle !== undefined &&
            risingAndSetting.settingAngle !== undefined && (
              risingAndSetting.risingAngle >= risingAndSetting.settingAngle ? 
                angle <= risingAndSetting.risingAngle && angle >= risingAndSetting.settingAngle :
                angle <= risingAndSetting.risingAngle || angle >= risingAndSetting.settingAngle
            )
          );

        const color = isVisible ? visibleColor : hiddenColor;

        const index = j * (tubularSegments + 1) + i;

        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      }
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [declination, risingAndSetting]);

  return (
    <mesh
      geometry={geometry}
      position={[0, Math.sin(MathUtils.degToRad(declination)) * starDistance, 0]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2]}
    >
      <meshStandardMaterial
        vertexColors
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

export default StarRing;