import type { SVGProps } from "react";
const SvgLogOut = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		{...props}
	>
		<path d="M16.8 2H14.2C11 2 9 4 9 7.2V11.25H15.25C15.66 11.25 16 11.59 16 12C16 12.41 15.66 12.75 15.25 12.75H9V16.8C9 20 11 22 14.2 22H16.79C19.99 22 21.99 20 21.99 16.8V7.2C22 4 20 2 16.8 2Z" fill="currentColor" />
		<path d="M4.56 11.25L6.63 9.17997C6.78 9.02997 6.85 8.83997 6.85 8.64997C6.85 8.45997 6.78 8.25997 6.63 8.11997C6.34 7.82997 5.86 7.82997 5.57 8.11997L2.22 11.47C1.93 11.76 1.93 12.24 2.22 12.53L5.57 15.88C5.86 16.17 6.34 16.17 6.63 15.88C6.92 15.59 6.92 15.11 6.63 14.82L4.56 12.75H9V11.25H4.56Z" fill="currentColor" />
	</svg>

);
export default SvgLogOut;
