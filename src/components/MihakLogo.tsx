import React from 'react';

interface MihakLogoProps {
  size?: number;
  className?: string;
}

/**
 * Original minimal logo combining a compass ring, a diverging/converging
 * decision path, and an intelligence spark.
 */
export const MihakLogo: React.FC<MihakLogoProps> = ({ size = 34, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Compass Outer Ring */}
      <circle
        cx="20"
        cy="20"
        r="17"
        stroke="#353B40"
        strokeWidth="1.75"
        fill="#FAF8F4"
      />
      {/* Compass Cardinal Ticks */}
      <path
        d="M20 3V6.5M20 33.5V37M3 20H6.5M33.5 20H37"
        stroke="#83BFD9"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Decision Path: Trunk diverging into two evaluated routes, converging to clarity */}
      <path
        d="M12 29C12 23 15.5 21 20 18.5C24.5 16 27 13.5 27 10.5"
        stroke="#353B40"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 18.5C16.5 16.5 14 14 13.5 11"
        stroke="#83BFD9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2.5 2.5"
      />
      {/* Intelligence Spark at the North-East Compass Star */}
      <path
        d="M27 7.5L28 10L30.5 11L28 12L27 14.5L26 12L23.5 11L26 10L27 7.5Z"
        fill="#D8B98C"
        stroke="#353B40"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Origin Anchor Point */}
      <circle cx="12" cy="29" r="2.2" fill="#2C6E8A" />
    </svg>
  );
};
