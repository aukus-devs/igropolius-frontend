import { AppContext } from "@/contexts/AppContext";
import { IEntity } from "@/lib/interfaces";
import { Float } from "@react-three/drei";
import { useContext, useMemo } from "react";
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Float32BufferAttribute } from "three";

export function Entity(entity: IEntity) {
  const appContext = useContext(AppContext);
  const { id, type = 'box', length = 1, width = 1, height = 1, color = '#fff', position } = entity;

  function onClick(e: MouseEvent) {
    e.stopPropagation();

    appContext?.selectEntity(entity);
  }

  const box = useMemo(() => {
    const boxGeometry = new BoxGeometry(width, height, length).toNonIndexed();
    const positionAttribute = boxGeometry.getAttribute('position');
    const colors = [];

    for (let i = 0; i < positionAttribute.count; i += 3) {
      const color = new Color(Math.random(), Math.random(), Math.random());

      for (let j = 0; j < 6; j++) {
        colors.push(color.r, color.g, color.b);
      }
    }

    boxGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return boxGeometry;
  }, [length, width, height]);

  const pyramid = useMemo(() => {
    const geometry = new BufferGeometry();
    const halfWidth = width / 2;
    const halfLength = length / 2;

    const vertices = new Float32Array([
      -halfWidth, -height / 2, -halfLength,  // 0: back-left
      halfWidth, -height / 2, -halfLength,   // 1: back-right
      halfWidth, -height / 2, halfLength,    // 2: front-right
      -halfWidth, -height / 2, halfLength,   // 3: front-left

      0, height / 2, 0                      // 4: top
    ]);
    const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3,

      0, 4, 1,  // back face
      1, 4, 2,  // right face
      2, 4, 3,  // front face
      3, 4, 0   // left face
    ]);

    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const colors = [
      new Color(Math.random(), Math.random(), Math.random()), // base
      new Color(Math.random(), Math.random(), Math.random()), // back
      new Color(Math.random(), Math.random(), Math.random()), // right
      new Color(Math.random(), Math.random(), Math.random()), // front
      new Color(Math.random(), Math.random(), Math.random())  // left
    ];
    const faceColors = colors.map(c => [c.r, c.g, c.b]);
    const colorArray = faceColors.flat().concat(faceColors.flat(), faceColors.flat(), faceColors.flat());

    geometry.setAttribute('color', new Float32BufferAttribute(colorArray, 3));

    return geometry;
  }, [height, length, width]);

  return (
    <Float
      speed={2}
      floatingRange={[1, 2]}
      position={position}
    >
      <mesh geometry={type === 'box' ? box : pyramid} onClick={onClick}>
        <meshStandardMaterial vertexColors color={color} emissive={appContext?.selectedEntity?.id === id ? '#fff' : 0} />
      </mesh>
    </Float>
  )
}

export default Entity;
