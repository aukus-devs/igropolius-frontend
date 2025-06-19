import type { SVGProps } from "react";
const SvgChevronDown = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 16.914 3.586 8.5 5 7.086l7 7 7-7L20.414 8.5z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgChevronDown;
