import type { SVGProps } from "react";
const SvgArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M18.015 11.827 13 16.868V3.291h-2v13.577l-5.015-5.041-1.418 1.411L12 20.709l7.434-7.471z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgArrowDown;
