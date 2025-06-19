import type { SVGProps } from "react";
const SvgChevronUp = (props: SVGProps<SVGSVGElement>) => (
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
      d="m19 16.914-7-7-7 7L3.586 15.5 12 7.086l8.414 8.414z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgChevronUp;
