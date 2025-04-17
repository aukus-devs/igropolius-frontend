import { BUILDING_ELEVATION } from "@/lib/constants";
import { colors } from "@/types";
import Building from "../Building";

function SectorBuildings() {
  return (
    <group name="buildings">
      <Building type="height-6" position={[2, BUILDING_ELEVATION, 5]} color={colors.blue} />
      <Building type="height-5" position={[0.5, BUILDING_ELEVATION, 5]} color={colors.red} />
      <Building type="height-4" position={[-1, BUILDING_ELEVATION, 5]} color={colors.brown} />
      <Building type="height-3" position={[2, BUILDING_ELEVATION, 3.5]} color={colors.green} />
      <Building
        type="height-2"
        position={[0.5, BUILDING_ELEVATION, 3.5]}
        color={colors.yellow}
      />
      <Building type="height-1" position={[-1, BUILDING_ELEVATION, 3.5]} color={colors.pink} />
      <Building type="ruins" position={[2, BUILDING_ELEVATION, 2]} color={colors.orange} />
    </group>
  );
}

export default SectorBuildings;
