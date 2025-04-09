import { AppContext } from "@/contexts/AppContext";
import Entity from "./Entity";
import { useContext } from "react";

export function EntitiesGroup() {
  const appContext = useContext(AppContext);

  return (
    <group>
      {Object.values(appContext?.entities || {}).map((entity) => (
        <Entity key={entity.id} {...entity} />
      ))}
    </group>
  )
}

export default EntitiesGroup;