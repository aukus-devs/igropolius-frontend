import type { SVGProps } from 'react';
const SvgPerson = (props: SVGProps<SVGSVGElement>) => (
  <svg
		xmlns="http://www.w3.org/2000/svg"
		width={17}
		height={17}
		fill="none"
		{...props}
	>
    <path
      fill="#F2F2F2"
      d="M8.5 8.5a3.542 3.542 0 1 0 0-7.083 3.542 3.542 0 0 0 0 7.083M8.5 10.27c-3.55 0-6.44 2.38-6.44 5.313a.35.35 0 0 0 .355.354h12.169a.35.35 0 0 0 .354-.354c0-2.932-2.89-5.312-6.439-5.312"
    />
  </svg>
);
export default SvgPerson;
