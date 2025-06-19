import type { SVGProps } from "react";
const SvgX = (props: SVGProps<SVGSVGElement>) => (
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
      d="m17.6 15.873-1.716 1.718-3.885-3.884-3.883 3.88L6.4 15.867l3.882-3.877L6.4 8.109 8.117 6.39 12 10.275l3.885-3.88L17.6 8.113l-3.883 3.877z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgX;
