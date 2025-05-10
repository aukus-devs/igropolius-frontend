import { STORAGE_BASE_URL } from "@/lib/constants";
import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { EquirectangularReflectionMapping } from "three";
import { RGBELoader } from "three-stdlib";

export default function Skybox() {
  const hdr = useLoader(RGBELoader, `${STORAGE_BASE_URL}/textures/sky2.hdr`);

  useEffect(() => {
    hdr.mapping = EquirectangularReflectionMapping;
  }, [hdr]);

  return <primitive attach="background" object={hdr} />;
}
