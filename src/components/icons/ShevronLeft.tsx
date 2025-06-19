import type { SVGProps } from "react";
const SvgShevronLeft = (props: SVGProps<SVGSVGElement>) => (
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
      d="M15.5 20.414 7.086 12 15.5 3.586 16.914 5l-7 7 7 7z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgShevronLeft;
