import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import DiceRollDisplay from "./DiceRollDisplay";
import DiceModel from "./models/DiceModel";

function DiceRoll() {
	const ref = useRef<Group>(null);
	const { camera } = useThree();

	useFrame(() => {
		if (!ref.current) return

		ref.current.position.copy(camera.position);
		ref.current.quaternion.copy(camera.quaternion);
		ref.current.translateZ(-7);
	});

	return (
		<group ref={ref}>
			<DiceRollDisplay position={[0, 1.5, 0]} />
			<DiceModel id={0} position={[-0.75, 0, 0]} />
			<DiceModel id={1} position={[0.75, 0, 0]} />
		</group>
	);
}

export default DiceRoll;
