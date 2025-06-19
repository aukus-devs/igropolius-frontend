import type { SVGProps } from "react";
const SvgArrowRight = (props: SVGProps<SVGSVGElement>) => (
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
      d="m13.238 4.562-1.411 1.417 5.043 5.02H3.291v2h13.578l-5.042 5.022 1.411 1.418 7.47-7.44z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgArrowRight;
