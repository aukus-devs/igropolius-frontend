import { ISector } from "@/lib/interfaces";

export function Sector(props: ISector & { onClick?: () => void }) {
  const { color = "#fff", position, onClick } = props;

  return (
    <group position={position}>
      <mesh onClick={onClick} onPointerOver={onClick}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default Sector;
