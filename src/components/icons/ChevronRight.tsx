import type { SVGProps } from "react";
const SvgChevronRight = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8.5 20.414 7.086 19l7-7-7-7L8.5 3.586 16.914 12z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgChevronRight;
