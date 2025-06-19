import type { SVGProps } from "react";
const SvgDocument = (props: SVGProps<SVGSVGElement>) => (
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
      d="M7.81 2h8.381C19.28 2 21 3.78 21 6.83v10.33c0 3.1-1.72 4.84-4.809 4.84H7.81C4.77 22 3 20.26 3 17.16V6.83C3 3.78 4.77 2 7.81 2m.27 4.66v-.01h2.989c.431 0 .781.35.781.779 0 .441-.35.791-.781.791H8.08a.78.78 0 0 1 0-1.56m0 6.08h7.84a.781.781 0 0 0 0-1.561H8.08a.781.781 0 0 0 0 1.561m0 4.57h7.84c.399-.04.7-.381.7-.78 0-.41-.301-.75-.7-.79H8.08a.795.795 0 0 0-.75 1.21c.16.25.45.4.75.36"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgDocument;
