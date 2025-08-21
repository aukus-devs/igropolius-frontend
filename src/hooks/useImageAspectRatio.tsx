import { useEffect, useState } from "react";

function useImageAspectRatio(src: string) {
	const [aspectRatio, setAspectRatio] = useState(0.6);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!src) return;

		const img = new Image();

		img.onload = () => {
			setAspectRatio(img.naturalWidth / img.naturalHeight);
			setError(null);
		};

		img.onerror = () => {
			setError('Failed to load image');
			setAspectRatio(0.6);
		};

		img.src = src;
	}, [src]);

	return { aspectRatio, error };
}

export default useImageAspectRatio;
