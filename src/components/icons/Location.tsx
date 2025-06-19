import type { SVGProps } from "react";
const SvgLocation = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 13.495a2.74 2.74 0 0 1-2.737-2.736A2.74 2.74 0 0 1 12 8.022a2.74 2.74 0 0 1 2.736 2.737A2.74 2.74 0 0 1 12 13.495m5.614-8.843C16.083 3.073 14.089 2.203 12 2.203c-2.091 0-4.085.87-5.617 2.45-1.555 1.604-2.41 3.759-2.342 5.913.189 6.104 7.379 10.857 7.686 11.056l.269.175.272-.172c.306-.194 7.5-4.832 7.69-11.06.067-2.153-.788-4.309-2.344-5.913"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgLocation;
