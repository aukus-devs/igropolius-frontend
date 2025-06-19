import type { SVGProps } from "react";
const SvgArrowUp = (props: SVGProps<SVGSVGElement>) => (
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
      d="M19.433 10.762 12 3.291l-7.433 7.471 1.418 1.411L11 7.132v13.577h2V7.132l5.016 5.041z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgArrowUp;
