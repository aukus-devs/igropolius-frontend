import type { SVGProps } from "react";
const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
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
      d="M20.708 11H7.13l5.042-5.021-1.411-1.417L3.291 12l7.47 7.438 1.411-1.418L7.128 13h13.58z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgArrowLeft;
