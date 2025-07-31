import { FALLBACK_GAME_POSTER } from "@/lib/constants";
import { Skeleton } from "../ui/skeleton";
import { ComponentProps, useEffect, useState } from "react";

type Props = ComponentProps<"div"> & {
	src: string;
	alt: string;
}

function loadImage(url: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Failed to load image'));
		img.src = url;
	});
}

function ImageLoader({ src, alt, ...divProps }: Props) {
	const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

	useEffect(() => {
		loadImage(src)
			.then((img) => setLoadedSrc(img.src))
			.catch(() => setLoadedSrc(FALLBACK_GAME_POSTER));
	}, [src]);

	return (
		<div {...divProps}>
			{loadedSrc ? (
				<img
					src={loadedSrc}
					className="h-full object-cover animate-in fade-in-0"
					alt={alt}
				/>
			) : (
				<Skeleton className="w-full h-full" />
			)}
		</div>
	);
}

export default ImageLoader;
