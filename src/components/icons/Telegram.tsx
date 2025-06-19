import type { SVGProps } from "react";
const SvgTelegram = (props: SVGProps<SVGSVGElement>) => (
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
      d="M19.777 4.93a1.5 1.5 0 0 1 2.062 1.626l-2.268 13.757c-.22 1.327-1.676 2.088-2.893 1.427-1.018-.553-2.53-1.405-3.89-2.294-.68-.445-2.763-1.87-2.507-2.884.22-.867 3.72-4.125 5.72-6.062.785-.761.427-1.2-.5-.5-2.302 1.738-5.998 4.381-7.22 5.125-1.078.656-1.64.768-2.312.656-1.226-.204-2.363-.52-3.291-.905-1.254-.52-1.193-2.244-.001-2.746z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgTelegram;
